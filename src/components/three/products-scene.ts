import * as THREE from "three";
import {
  BRAND,
  Stage,
  clamp01,
  createEnvironment,
  createGlowTexture,
  damp,
  disposeTree,
  easeOutBack,
  easeOutCubic,
  isLowPowerDevice,
  lerp,
  prefersReducedMotion,
  smoothstep,
} from "./core";
import { createDatabaseGeometry, createDatabaseMaterial } from "./database";
import {
  createAppTile,
  createBlueDatabase,
  createLaptop,
  createPhone,
  type Device,
} from "./devices";
import { FlowLine } from "./flow-line";
import { coereMaterial, coereMarkGeometry, loadLogo } from "./logos";

export type ProductsAgent = { name: string; logo: string };
export type ProductsFocus = "connect" | "developer" | null;
type Hover = { kind: "source" | "reader" | "core"; index: number } | null;

type Options = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  agents: readonly ProductsAgent[];
  /** Called with which side the pointer is over, for the cards to echo. */
  onHoverSide?: (side: ProductsFocus) => void;
  /** The GPU dropped the scene for good; show the cards alone instead. */
  onFail?: () => void;
};

export const PRODUCTS_BACKGROUND = "#f2f5fc";

const DB_RADIUS = 0.42;
const DB_DISK = 0.34;
const DB_TOP = DB_DISK * 3 + 0.04;

type Source = {
  name: string;
  logo: THREE.Group;
  body: THREE.Mesh | null;
  hit: THREE.Mesh;
  line: FlowLine;
  /** Place in the bank: index along its row, row 0 in front. */
  cell: [number, number];
  position: THREE.Vector3;
  hover: number;
  pulse: number;
  appear: number;
};

type Reader = {
  device: Device;
  line: FlowLine;
  hit: THREE.Mesh;
  position: THREE.Vector3;
  base: THREE.Vector3;
  float: number;
  facing: number;
  hover: number;
  pulse: number;
  appear: number;
  ripple: THREE.Mesh;
  rippleAge: number;
};

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const matrix = new THREE.Matrix4();
const quaternion = new THREE.Quaternion();
const place = new THREE.Vector3();
const size = new THREE.Vector3();

/**
 * Coere Connect and Coere Developer as one picture. On the left, a database
 * for every AI, each with its logo, streaming memory into Coere. On the right,
 * a laptop, a phone, an app and a database reading it back out.
 */
export class ProductsScene {
  readonly ready: Promise<void>;

  private readonly stage: Stage;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  private readonly root = new THREE.Group();
  private readonly lowPower = isLowPowerDevice();
  private readonly reducedMotion = prefersReducedMotion();
  private readonly options: Options;

  private readonly sources: Source[] = [];
  private readonly readers: Reader[] = [];
  private readonly databases: THREE.InstancedMesh;
  private readonly databaseData: THREE.InstancedBufferAttribute;
  private readonly packets: THREE.InstancedMesh;

  private readonly core = new THREE.Group();
  private readonly pedestal: THREE.Mesh;
  private readonly pedestalUniforms: { uData: { value: THREE.Vector4 } };
  private readonly mark: THREE.Mesh;
  private readonly markHit: THREE.Mesh;
  private readonly coreRipple: THREE.Mesh;
  private coreRippleAge = 1;
  private readonly orbitBead: THREE.Group;
  private readonly key: THREE.DirectionalLight;

  private along = new THREE.Vector3(1, 0, 0);
  private side = new THREE.Vector3(0, 0, 1);
  private portrait = false;
  private distance = 22;
  private elevation = 0.32;
  private anchor = 0.5;

  private time = 0;
  private introStart = -1;
  private focus: ProductsFocus = null;
  private focusAmount = { connect: 0, developer: 0 };
  private yaw = 0;
  private yawTarget = 0;
  private pitch = 0;
  private pointerX = 0;
  private pointerY = 0;
  private pointerInside = false;
  private spin = 0;
  private spinVelocity = 0;
  private hovered: Hover = null;
  private drag: null | {
    id: number;
    lastX: number;
    startX: number;
    moved: boolean;
  } = null;
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();

  constructor(options: Options) {
    this.options = options;
    this.stage = new Stage({
      canvas: options.canvas,
      host: options.host,
      maxDpr: this.lowPower ? 1.5 : 2,
      onResize: (w, h) => this.resize(w, h),
      onFrame: (dt) => this.frame(dt),
      onDegrade: () => this.degrade(),
      onContextFail: () => options.onFail?.(),
    });
    const renderer = this.stage.renderer;

    this.scene.background = new THREE.Color(PRODUCTS_BACKGROUND);
    this.scene.fog = new THREE.Fog(PRODUCTS_BACKGROUND, 28, 52);
    this.scene.environment = createEnvironment(renderer);
    this.scene.environmentIntensity = 0.65;
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#b6c3e6", 0.8));
    this.key = new THREE.DirectionalLight("#ffffff", 2.4);
    this.key.position.set(-5, 14, 9);
    this.key.castShadow = true;
    const shadowSize = this.lowPower ? 1024 : 2048;
    this.key.shadow.mapSize.set(shadowSize, shadowSize);
    const sc = this.key.shadow.camera;
    sc.left = -13;
    sc.right = 13;
    sc.top = 10;
    sc.bottom = -10;
    sc.near = 1;
    sc.far = 40;
    this.key.shadow.radius = 6;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.02;
    this.scene.add(this.key, this.key.target);
    const rim = new THREE.DirectionalLight("#dfe6ff", 0.9);
    rim.position.set(6, 6, -10);
    this.scene.add(rim);

    this.scene.add(this.root);
    this.root.add(this.buildFloor());

    // Sources: a database per AI. One instanced mesh for all nine.
    const count = options.agents.length;
    const dbGeometry = createDatabaseGeometry({
      radius: DB_RADIUS,
      disk: DB_DISK,
      shaft: 0,
      segments: 32,
    });
    this.databaseData = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 4),
      4,
    );
    this.databaseData.setUsage(THREE.DynamicDrawUsage);
    dbGeometry.setAttribute("aData", this.databaseData);
    const { material: dbMaterial } = createDatabaseMaterial({
      shadeDepth: 5,
      bandBase: 0.3,
    });
    this.databases = new THREE.InstancedMesh(dbGeometry, dbMaterial, count);
    this.databases.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.databases.castShadow = true;
    this.databases.receiveShadow = true;
    this.databases.frustumCulled = false;
    this.root.add(this.databases);

    const frontRow = Math.ceil(count / 2);
    options.agents.forEach((agent, k) => {
      const logo = new THREE.Group();
      const hit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.62, 2.4, 10),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      const line = new FlowLine({ seed: k * 0.41, width: 0.034 });
      this.root.add(logo, hit, line.mesh);
      this.sources.push({
        name: agent.name,
        logo,
        body: null,
        hit,
        line,
        cell: k < frontRow ? [k, 0] : [k - frontRow, 1],
        position: new THREE.Vector3(),
        hover: 0,
        pulse: 0,
        appear: 0,
      });
    });

    // The core: a wide database with Coere floating over it.
    const pedestalGeometry = createDatabaseGeometry({
      radius: 1.35,
      disk: 0.3,
      shaft: 0,
      segments: 64,
    });
    const pedestal = createDatabaseMaterial({
      instanced: false,
      shadeDepth: 3,
      bandBase: 0.45,
    });
    this.pedestalUniforms = pedestal.uniforms;
    this.pedestal = new THREE.Mesh(pedestalGeometry, pedestal.material);
    this.pedestal.position.y = 0.94;
    this.pedestal.castShadow = true;
    this.pedestal.receiveShadow = true;
    this.mark = new THREE.Mesh(coereMarkGeometry(), coereMaterial());
    this.mark.castShadow = true;
    this.mark.scale.setScalar(1.9);
    this.mark.position.y = 2.45;
    this.markHit = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 3.4, 12),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    this.markHit.position.y = 1.6;
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(BRAND[500]),
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      }),
    );
    glow.scale.setScalar(5);
    glow.position.y = 2.45;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.008, 10, 200),
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 1,
        emissive: BRAND[200],
        emissiveIntensity: 0.3,
      }),
    );
    const orbit = new THREE.Group();
    orbit.position.y = 2.45;
    orbit.rotation.set(Math.PI / 2 - 0.42, 0, 0.18);
    orbit.add(ring);
    this.orbitBead = new THREE.Group();
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 12),
      new THREE.MeshStandardMaterial({
        color: BRAND[500],
        emissive: BRAND[500],
        emissiveIntensity: 1,
      }),
    );
    bead.position.x = 1.75;
    this.orbitBead.add(bead);
    orbit.add(this.orbitBead);
    const light = new THREE.PointLight(BRAND[500], 14, 9, 1.6);
    light.position.y = 2.45;
    this.coreRipple = this.makeRipple();
    this.coreRipple.position.y = 2.45;
    this.core.add(
      this.pedestal,
      glow,
      this.mark,
      this.markHit,
      orbit,
      light,
      this.coreRipple,
    );
    this.root.add(this.core);

    // Readers.
    const devices: [Device, number, number][] = [
      [createLaptop(), 0, 0.15],
      [createPhone(), 1.05, 0.25],
      [createAppTile(), 1.75, 0.2],
      [createBlueDatabase(), 0, 0.1],
    ];
    devices.forEach(([device, float, facing], j) => {
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(1.25, 10, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      const line = new FlowLine({
        seed: 0.3 + j * 0.53,
        width: 0.05,
        inColor: BRAND[600],
        baseColor: BRAND[500],
      });
      const ripple = this.makeRipple();
      this.root.add(device.group, hit, line.mesh, ripple);
      this.readers.push({
        device,
        line,
        hit,
        position: new THREE.Vector3(),
        base: new THREE.Vector3(),
        float,
        facing,
        hover: 0,
        pulse: 0,
        appear: 0,
        ripple,
        rippleAge: 1,
      });
    });

    // Packets: two per source stream, two per reader stream.
    this.packets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 10),
      new THREE.MeshStandardMaterial({
        color: BRAND[500],
        emissive: BRAND[500],
        emissiveIntensity: 0.9,
        roughness: 0.25,
      }),
      (this.sources.length + this.readers.length) * 2,
    );
    this.packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.packets.frustumCulled = false;
    this.root.add(this.packets);

    this.ready = this.loadLogos();

    const host = options.host;
    host.addEventListener("pointerdown", this.onPointerDown);
    host.addEventListener("pointermove", this.onPointerMove);
    host.addEventListener("pointerup", this.onPointerUp);
    host.addEventListener("pointercancel", this.onPointerUp);
    host.addEventListener("pointerleave", this.onPointerLeave);
    this.stage.start();
  }

  private makeRipple() {
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 1, 64),
      new THREE.MeshBasicMaterial({
        color: BRAND[500],
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    ripple.renderOrder = 3;
    return ripple;
  }

  /** A dotted floor that fades out radially, plus a plane to catch shadows. */
  private buildFloor() {
    const floor = new THREE.Group();
    const dots = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(BRAND[400]) } },
        vertexShader: /* glsl */ `
          varying vec2 vPos;
          void main() {
            vPos = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec2 vPos;
          void main() {
            vec2 cell = fract(vPos / 0.6) - 0.5;
            float d = length(cell);
            float w = fwidth(d);
            float dot = 1.0 - smoothstep(0.06 - w, 0.06 + w, d);
            float fade = 1.0 - smoothstep(4.0, 13.0, length(vPos * vec2(0.75, 1.2)));
            gl_FragColor = vec4(uColor, dot * fade * 0.55);
            #include <colorspace_fragment>
          }
        `,
      }),
    );
    dots.rotation.x = -Math.PI / 2;
    dots.position.y = 0.001;
    const shadows = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ color: "#26338f", opacity: 0.12 }),
    );
    shadows.rotation.x = -Math.PI / 2;
    shadows.receiveShadow = true;
    floor.add(shadows, dots);
    return floor;
  }

  private async loadLogos() {
    const results = await Promise.allSettled(
      this.options.agents.map((agent) => loadLogo(agent.logo)),
    );
    const bodies = new THREE.Group();
    results.forEach((result, k) => {
      if (result.status !== "fulfilled") return;
      const body = new THREE.Mesh(result.value.geometry, result.value.material);
      body.castShadow = true;
      this.sources[k].body = body;
      bodies.add(body);
    });
    try {
      await this.stage.renderer.compileAsync(bodies, this.camera, this.scene);
    } catch {
      // Compiling on first draw instead is fine.
    }
    this.sources.forEach(
      (source) => source.body && source.logo.add(source.body),
    );
  }

  // ---------------------------------------------------------------- layout

  private resize(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.portrait = aspect < 1.05;
    if (this.portrait) {
      // Sources at the back, readers at the front: the flow runs down the screen.
      this.along.set(0, 0, 1);
      this.side.set(1, 0, 0);
      this.camera.fov = 36;
      this.elevation = 0.86;
    } else {
      this.along.set(1, 0, 0);
      this.side.set(0, 0, 1);
      this.camera.fov = 26;
      this.elevation = 0.6;
    }

    // Sources in two staggered rows, so every logo has clear air above it;
    // readers in a loose cluster.
    this.sources.forEach((source) => {
      const [i, row] = source.cell;
      let a: number;
      let b: number;
      if (this.portrait) {
        a = row ? -5.5 : -4.0;
        b = (i - (row ? 1.5 : 2)) * 1.42;
      } else {
        a = -3.7 - i * 1.3 - row * 0.65;
        b = (row ? -1.35 : 1.25) - i * 0.12;
      }
      source.position
        .copy(this.along)
        .multiplyScalar(a)
        .addScaledVector(this.side, b);
    });
    const readerSpots: [number, number, number][] = this.portrait
      ? [
          [4.5, 0, 0],
          [3.9, 2.35, 0.55],
          [2.7, -2.5, 1.7],
          [4.1, -2.35, 0],
        ]
      : [
          [4.7, 1.0, 0],
          [6.75, 2.0, 0.55],
          [5.9, -1.75, 1.75],
          [7.9, -0.25, 0],
        ];
    this.readers.forEach((reader, j) => {
      const [a, b, y] = readerSpots[j];
      reader.base
        .copy(this.along)
        .multiplyScalar(a)
        .addScaledVector(this.side, b);
      reader.base.y = y;
    });

    // Fit the whole picture.
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    if (this.portrait) {
      const halfWidth = 3.45;
      const halfDepth = 6.1;
      this.distance = Math.max(halfWidth / (tanV * aspect), halfDepth / tanV);
      this.anchor = 0.5;
    } else {
      const halfWidth = 9.4;
      const halfHeight = 3.4;
      this.distance =
        Math.max(halfWidth / (tanV * aspect), halfHeight / tanV) * 1.02;
      this.anchor = 0.52;
    }
    const fog = this.scene.fog as THREE.Fog;
    fog.near = this.distance + 6;
    fog.far = this.distance + 30;
  }

  private degrade() {
    this.stage.renderer.shadowMap.enabled = false;
    this.key.castShadow = false;
    this.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach((m) => (m.needsUpdate = true));
      }
    });
  }

  setFocus(focus: ProductsFocus) {
    this.focus = focus;
  }

  // ---------------------------------------------------------------- frame

  private frame(dt: number) {
    const motion = this.reducedMotion ? 0 : 1;
    this.time += dt * motion;
    const t = this.time;
    if (this.introStart < 0 && dt > 0) this.introStart = this.time;
    // Without motion everything is simply there.
    const intro = this.reducedMotion
      ? 99
      : this.introStart < 0
        ? 0
        : this.time - this.introStart;

    const hoverSide =
      this.hovered?.kind === "source"
        ? "connect"
        : this.hovered?.kind === "reader"
          ? "developer"
          : null;
    const focus = this.focus ?? hoverSide;
    this.focusAmount.connect = damp(
      this.focusAmount.connect,
      focus === "connect" ? 1 : 0,
      6,
      dt,
    );
    this.focusAmount.developer = damp(
      this.focusAmount.developer,
      focus === "developer" ? 1 : 0,
      6,
      dt,
    );

    // Camera: drag yaw that springs home, plus a little parallax.
    if (!this.drag) this.yawTarget = damp(this.yawTarget, 0, 1.6, dt);
    const parallaxX = this.pointerInside ? this.pointerX : 0;
    const parallaxY = this.pointerInside ? this.pointerY : 0;
    this.yaw = damp(this.yaw, this.yawTarget + parallaxX * 0.1, 5, dt);
    this.pitch = damp(this.pitch, -parallaxY * 0.05, 5, dt);
    this.root.rotation.y = this.yaw;
    // The bank of sources runs a little longer than the readers; even it out.
    this.root.position.x = this.portrait ? 0 : 0.45;
    const elevation = this.elevation + this.pitch;
    const target = tmp.set(0, this.portrait ? 0.6 : 1.1, 0);
    this.camera.position.set(
      0,
      target.y + Math.sin(elevation) * this.distance,
      Math.cos(elevation) * this.distance,
    );
    this.camera.lookAt(target);
    const w = this.stage.width;
    const h = this.stage.height;
    this.camera.setViewOffset(w, h, 0, (0.5 - this.anchor) * h, w, h);
    this.camera.updateProjectionMatrix();

    this.updateCore(t, dt, intro);
    this.updateSources(t, dt, intro);
    this.updateReaders(t, dt, intro);

    this.stage.renderer.render(this.scene, this.camera);
  }

  private updateCore(t: number, dt: number, intro: number) {
    const appear = easeOutCubic(clamp01(intro / 0.9));
    this.core.position.y = lerp(-2.5, 0, appear);
    this.core.scale.setScalar(lerp(0.6, 1, appear));

    // Mostly facing out with a slow sway; a click sends it round.
    this.spinVelocity = damp(this.spinVelocity, 0, 1.4, dt);
    if (Math.abs(this.spinVelocity) < 0.5) {
      const home = Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2;
      const sway = this.reducedMotion ? 0 : Math.sin(t * 0.5) * 0.45;
      this.spin = damp(this.spin, home + sway, 2.5, dt);
    }
    this.spin += this.spinVelocity * dt;
    this.mark.rotation.set(Math.sin(t * 0.8) * 0.05, this.spin - this.yaw, 0);
    this.mark.position.y = 2.45 + Math.sin(t * 1.1) * 0.08;
    this.orbitBead.rotation.z = t * 0.9;

    const hovered = this.hovered?.kind === "core";
    const lit = Math.max(
      this.coreRippleAge < 1 ? 1 - this.coreRippleAge : 0,
      hovered ? 0.6 : 0,
    );
    this.pedestalUniforms.uData.value.set(0.35 + lit * 0.8, 0, 0, 0);
    this.coreRippleAge = Math.min(1, this.coreRippleAge + dt * 1.4);
    this.setRipple(this.coreRipple, this.coreRippleAge, 1.25, 0.28);
  }

  private setRipple(
    ripple: THREE.Mesh,
    age: number,
    size: number,
    opacity: number,
  ) {
    const material = ripple.material as THREE.MeshBasicMaterial;
    material.opacity = age >= 1 ? 0 : (1 - easeOutCubic(age)) * opacity;
    ripple.visible = material.opacity > 0.002;
    ripple.scale.setScalar(size * (0.4 + easeOutCubic(age) * 0.9));
    ripple.quaternion.copy(this.camera.quaternion);
    // Undo the root's turn so the ring faces the camera squarely.
    ripple.quaternion.premultiply(
      quaternion.setFromAxisAngle(tmp2.set(0, 1, 0), -this.yaw),
    );
  }

  private updateSources(t: number, dt: number, intro: number) {
    const coreCenter = tmp2.set(
      0,
      this.core.position.y + this.mark.position.y,
      0,
    );
    const data = this.databaseData.array as Float32Array;
    const focusOn = this.focusAmount.connect;
    const focusOff = this.focusAmount.developer;
    let arrived = false;

    this.sources.forEach((source, k) => {
      const [i, row] = source.cell;
      const delay = 0.35 + (i + row * 0.5) * 0.09;
      source.appear = this.reducedMotion ? 1 : clamp01((intro - delay) / 0.7);
      const pop = easeOutBack(source.appear);
      const hovered =
        this.hovered?.kind === "source" && this.hovered.index === k;
      source.hover = damp(source.hover, hovered ? 1 : 0, 10, dt);

      const lift = source.hover * 0.12;
      const p = source.position;
      const scale = Math.max(0.0001, pop);
      matrix.compose(
        place.set(
          p.x,
          lerp(-1.2, 0, easeOutCubic(source.appear)) + DB_TOP + lift,
          p.z,
        ),
        quaternion.identity(),
        size.setScalar(scale),
      );
      this.databases.setMatrixAt(k, matrix);
      source.pulse = Math.max(0, source.pulse - dt * 2);
      data[k * 4] =
        0.25 + source.pulse * 1.2 + source.hover * 0.6 + focusOn * 0.4;
      data[k * 4 + 1] = 0;
      data[k * 4 + 2] = focusOff * 0.25;
      data[k * 4 + 3] = source.hover * 0.4;

      // Logo floats over its database, turned a little toward the camera.
      const bob = Math.sin(t * 1.3 + k * 1.1) * 0.06;
      source.logo.position.set(
        p.x,
        DB_TOP * scale + 0.62 + bob + lift * 2,
        p.z,
      );
      source.logo.scale.setScalar(0.78 * scale * (1 + source.hover * 0.15));
      source.logo.rotation.set(
        -0.12,
        -this.yaw + Math.sin(t * 0.7 + k) * 0.28,
        0,
      );
      source.hit.position.set(p.x, 1.1, p.z);

      // Stream from the top of the database into Coere.
      const line = source.line;
      line.p0.set(p.x, DB_TOP * scale + 0.08, p.z);
      line.p3.copy(coreCenter);
      const away = tmp.copy(p).setY(0).normalize();
      line.p1.copy(line.p0);
      line.p1.y += 1.5;
      line.p2.copy(coreCenter).addScaledVector(away, 2.4);
      line.p2.y += 0.9;
      line.time = t;
      line.opacity =
        smoothstep(0.9, 1.6, intro - i * 0.08) * (1 - focusOff * 0.65);
      line.highlight = Math.max(source.hover, focusOn * 0.6);

      const inward = (t * 0.3 + k * 0.173) % 1;
      const outward = (t * 0.22 + k * 0.311 + 0.5) % 1;
      if (inward < 0.02) source.pulse = 1;
      if (inward > 0.975) arrived = true;
      this.placePacket(
        k * 2,
        line,
        inward,
        0.075 * line.mesh.material.uniforms.uOpacity.value,
      );
      this.placePacket(
        k * 2 + 1,
        line,
        1 - outward,
        0.05 * line.mesh.material.uniforms.uOpacity.value,
      );
    });
    this.databases.instanceMatrix.needsUpdate = true;
    this.databaseData.needsUpdate = true;
    if (arrived && !this.reducedMotion && intro > 1.6) this.coreRippleAge = 0;
  }

  private updateReaders(t: number, dt: number, intro: number) {
    const coreCenter = tmp2.set(
      0,
      this.core.position.y + this.mark.position.y,
      0,
    );
    const offset = this.sources.length * 2;
    const focusOn = this.focusAmount.developer;
    const focusOff = this.focusAmount.connect;

    this.readers.forEach((reader, j) => {
      const delay = 1.3 + j * 0.16;
      reader.appear = this.reducedMotion ? 1 : clamp01((intro - delay) / 0.75);
      const pop = Math.max(0.0001, easeOutBack(reader.appear));
      const hovered =
        this.hovered?.kind === "reader" && this.hovered.index === j;
      reader.hover = damp(reader.hover, hovered ? 1 : 0, 10, dt);
      reader.pulse = Math.max(0, reader.pulse - dt * 1.6);

      const group = reader.device.group;
      const bob = reader.float > 0 ? Math.sin(t * 1.1 + j * 2) * 0.08 : 0;
      group.position.copy(reader.base);
      group.position.y += bob + reader.hover * 0.15;
      group.scale.setScalar(pop * (1 + reader.hover * 0.06));
      // Turn toward the camera and a touch toward the core.
      const toward = Math.atan2(-reader.base.x, 12) * reader.facing * 2;
      const sway = reader.float > 0 ? Math.sin(t * 0.6 + j) * 0.12 : 0;
      group.rotation.y = -this.yaw * 0.6 + toward + sway;
      reader.device.update(
        t,
        Math.min(1, reader.pulse + reader.hover * 0.5 + focusOn * 0.3),
      );

      group.updateMatrix();
      const socket = reader.position
        .copy(reader.device.socket)
        .applyMatrix4(group.matrix);
      reader.hit.position.copy(socket);

      const line = reader.line;
      line.p0.copy(coreCenter);
      line.p3.copy(socket);
      const away = tmp.copy(reader.base).setY(0).normalize();
      line.p1.copy(coreCenter).addScaledVector(away, 2.4);
      line.p1.y += 1;
      line.p2.copy(socket).addScaledVector(away, -1.6);
      line.p2.y += 1.2;
      line.time = t;
      line.opacity =
        smoothstep(1.8, 2.6, intro - j * 0.12) * (1 - focusOff * 0.65);
      line.highlight = Math.max(reader.hover, focusOn * 0.6);

      const outward = (t * 0.32 + j * 0.27) % 1;
      const back = (t * 0.24 + j * 0.41 + 0.5) % 1;
      if (outward > 0.975 && intro > 2.6 && !this.reducedMotion) {
        reader.pulse = 1;
        reader.rippleAge = 0;
      }
      const opacity = line.mesh.material.uniforms.uOpacity.value;
      this.placePacket(offset + j * 2, line, outward, 0.075 * opacity);
      this.placePacket(offset + j * 2 + 1, line, 1 - back, 0.05 * opacity);

      reader.rippleAge = Math.min(1, reader.rippleAge + dt * 1.5);
      reader.ripple.position.copy(socket);
      this.setRipple(reader.ripple, reader.rippleAge, 0.9, 0.5);
    });
    this.packets.instanceMatrix.needsUpdate = true;
  }

  private placePacket(index: number, line: FlowLine, at: number, size: number) {
    line.pointAt(at, tmp);
    const s = size * (0.25 + 0.75 * Math.sin(at * Math.PI)) + 0.0001;
    matrix.makeScale(s, s, s).setPosition(tmp);
    this.packets.setMatrixAt(index, matrix);
  }

  // ---------------------------------------------------------------- pointer

  private pick(clientX: number, clientY: number) {
    const rect = this.options.host.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const targets = [
      this.markHit,
      ...this.sources.map((s) => s.hit),
      ...this.readers.map((r) => r.hit),
    ];
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    if (!hit) return null;
    if (hit.object === this.markHit) return { kind: "core" as const, index: 0 };
    const s = this.sources.findIndex((x) => x.hit === hit.object);
    if (s >= 0) return { kind: "source" as const, index: s };
    const r = this.readers.findIndex((x) => x.hit === hit.object);
    return r >= 0 ? { kind: "reader" as const, index: r } : null;
  }

  private setHovered(next: Hover) {
    const prevSide =
      this.hovered?.kind === "source"
        ? "connect"
        : this.hovered?.kind === "reader"
          ? "developer"
          : null;
    this.hovered = next;
    const side =
      next?.kind === "source"
        ? "connect"
        : next?.kind === "reader"
          ? "developer"
          : null;
    if (side !== prevSide) this.options.onHoverSide?.(side);
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    this.drag = {
      id: event.pointerId,
      lastX: event.clientX,
      startX: event.clientX,
      moved: false,
    };
  };

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.options.host.getBoundingClientRect();
    this.pointerInside = event.pointerType === "mouse";
    this.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const drag = this.drag;
    if (drag && drag.id === event.pointerId) {
      const dx = event.clientX - drag.lastX;
      drag.lastX = event.clientX;
      if (!drag.moved && Math.abs(event.clientX - drag.startX) > 4) {
        drag.moved = true;
        try {
          this.options.host.setPointerCapture(event.pointerId);
        } catch {
          // The pointer may already be gone.
        }
      }
      if (drag.moved) {
        this.yawTarget = THREE.MathUtils.clamp(
          this.yawTarget + dx * 0.005,
          -0.75,
          0.75,
        );
        this.options.host.style.cursor = "grabbing";
      }
      return;
    }
    if (event.pointerType !== "mouse") return;
    const picked = this.pick(event.clientX, event.clientY);
    this.setHovered(picked);
    this.options.host.style.cursor = picked ? "pointer" : "grab";
  };

  private onPointerUp = (event: PointerEvent) => {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && event.type === "pointerup") {
      const picked = this.pick(event.clientX, event.clientY);
      if (picked?.kind === "core") this.spinVelocity += Math.PI * 3;
      if (picked?.kind === "source") this.sources[picked.index].pulse = 1;
      if (picked?.kind === "reader") {
        this.readers[picked.index].pulse = 1;
        this.readers[picked.index].rippleAge = 0;
      }
    }
    this.drag = null;
    this.options.host.style.cursor = this.hovered ? "pointer" : "grab";
  };

  private onPointerLeave = () => {
    this.pointerInside = false;
    if (!this.drag) this.setHovered(null);
  };

  dispose() {
    const host = this.options.host;
    host.removeEventListener("pointerdown", this.onPointerDown);
    host.removeEventListener("pointermove", this.onPointerMove);
    host.removeEventListener("pointerup", this.onPointerUp);
    host.removeEventListener("pointercancel", this.onPointerUp);
    host.removeEventListener("pointerleave", this.onPointerLeave);
    this.sources.forEach((s) => {
      s.line.dispose();
      if (s.body) s.logo.remove(s.body);
    });
    this.readers.forEach((r) => r.line.dispose());
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    this.stage.dispose();
  }
}
