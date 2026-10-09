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
} from "./core";
import { createDatabaseGeometry, createDatabaseMaterial } from "./database";
import {
  createAppTile,
  createLaptop,
  createPhone,
  type Device,
} from "./devices";
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

/**
 * One disk of a database column. A column of three reads as one database,
 * each disk carrying a logo, with a lit seam between them and nothing
 * crossing the logos.
 */
const UNIT_RADIUS = 0.6;
const UNIT_DISK = 0.66;
const UNIT_HEIGHT = UNIT_DISK + UNIT_RADIUS * 0.05;
const UNIT_GAP = 0.05;
const UNITS_PER_TOWER = 3;
const TOWER_HEIGHT =
  UNITS_PER_TOWER * UNIT_HEIGHT + (UNITS_PER_TOWER - 1) * UNIT_GAP;

/** Light runs through the picture once per cycle: in, through Coere, out. */
const CYCLE = 5.4;
/** When, as a fraction of the cycle, Coere lights. */
const CORE_AT = 0.36;

/** A quick flash that fades: 1 at `at`, gone a little after. */
const flash = (phase: number, at: number, width = 0.12) => {
  let u = phase - at;
  if (u < 0) u += 1;
  return u < width ? Math.pow(1 - u / width, 2) : 0;
};

type Unit = {
  tower: number;
  /** 0 at the bottom. */
  level: number;
  logo: THREE.Group;
  body: THREE.Mesh | null;
  fireAt: number;
  energy: number;
};

type Tower = {
  x: number;
  z: number;
  hit: THREE.Mesh;
  halo: THREE.Sprite;
  hover: number;
};

type Reader = {
  device: Device;
  base: THREE.Vector3;
  /** Height of its middle above `base`, for its halo and hit area. */
  middle: number;
  scale: number;
  facing: number;
  float: boolean;
  fireAt: number;
  energy: number;
  hover: number;
  hit: THREE.Mesh;
  halo: THREE.Sprite;
  appear: number;
};

const place = new THREE.Vector3();
const matrix = new THREE.Matrix4();

/**
 * Coere Connect and Coere Developer as one centered picture. On the left,
 * three columns of databases, one for each AI with its logo on the front. In
 * the middle, Coere. On the right, the things that read from it: a database,
 * a laptop with an app above it, and a phone. No lines: a wave of light runs
 * through the picture from left to right, the databases flaring as it
 * leaves them, Coere as it passes, then everything that reads from it.
 */
export class ProductsScene {
  readonly ready: Promise<void>;

  private readonly stage: Stage;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(24, 1, 0.1, 120);
  private readonly root = new THREE.Group();
  private readonly lowPower = isLowPowerDevice();
  private readonly reducedMotion = prefersReducedMotion();
  private readonly options: Options;

  private readonly units: Unit[] = [];
  private readonly towers: Tower[] = [];
  private readonly sourceMesh: THREE.InstancedMesh;
  private readonly sourceData: THREE.InstancedBufferAttribute;
  private readonly blueMesh: THREE.InstancedMesh;
  private readonly blueData: THREE.InstancedBufferAttribute;
  private readonly readers: Reader[] = [];

  private readonly core = new THREE.Group();
  private readonly pedestalUniforms: { uData: { value: THREE.Vector4 } };
  private readonly mark: THREE.Mesh;
  private readonly markHit: THREE.Mesh;
  private readonly coreGlow: THREE.Sprite;
  private readonly coreLight: THREE.PointLight;
  private readonly floor: THREE.ShaderMaterial;
  private readonly key: THREE.DirectionalLight;

  private portrait = false;
  private distance = 18;
  private elevation = 0.2;
  private targetY = 1.3;

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
    this.scene.fog = new THREE.Fog(PRODUCTS_BACKGROUND, 26, 48);
    this.scene.environment = createEnvironment(renderer);
    this.scene.environmentIntensity = 0.7;
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#b6c3e6", 0.8));
    this.key = new THREE.DirectionalLight("#ffffff", 2.3);
    // Nearly overhead, so shadows pool under things instead of smearing.
    this.key.position.set(-1.5, 14, 5);
    this.key.castShadow = true;
    const shadowSize = this.lowPower ? 1024 : 2048;
    this.key.shadow.mapSize.set(shadowSize, shadowSize);
    const sc = this.key.shadow.camera;
    sc.left = -11;
    sc.right = 11;
    sc.top = 8;
    sc.bottom = -8;
    sc.near = 1;
    sc.far = 36;
    this.key.shadow.radius = 7;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.02;
    this.scene.add(this.key, this.key.target);
    const rim = new THREE.DirectionalLight("#dfe6ff", 0.9);
    rim.position.set(5, 6, -10);
    this.scene.add(rim);

    this.scene.add(this.root);
    this.floor = this.buildFloor();

    const glowMap = createGlowTexture(BRAND[500]);
    const halo = () => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowMap,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        }),
      );
      sprite.renderOrder = -1;
      this.root.add(sprite);
      return sprite;
    };

    // Sources: three columns of databases, white with lit grooves.
    const unitGeometry = () =>
      createDatabaseGeometry({
        radius: UNIT_RADIUS,
        disk: UNIT_DISK,
        disks: 1,
        seam: true,
        segments: 40,
      });
    const count = options.agents.length;
    const towerCount = Math.ceil(count / UNITS_PER_TOWER);
    const sourceGeometry = unitGeometry();
    this.sourceData = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 4),
      4,
    );
    this.sourceData.setUsage(THREE.DynamicDrawUsage);
    sourceGeometry.setAttribute("aData", this.sourceData);
    this.sourceMesh = new THREE.InstancedMesh(
      sourceGeometry,
      createDatabaseMaterial({ shadeDepth: 5, bandBase: 0.3 }).material,
      count,
    );
    this.sourceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.sourceMesh.castShadow = true;
    this.sourceMesh.receiveShadow = true;
    this.sourceMesh.frustumCulled = false;
    this.root.add(this.sourceMesh);

    for (let i = 0; i < towerCount; i++) {
      const hit = new THREE.Mesh(
        new THREE.CylinderGeometry(
          UNIT_RADIUS * 1.15,
          UNIT_RADIUS * 1.15,
          TOWER_HEIGHT,
          12,
        ),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      this.root.add(hit);
      this.towers.push({ x: 0, z: 0, hit, halo: halo(), hover: 0 });
    }
    // Read top to bottom, left to right, like a page; the light leaves the
    // outer column first and moves in.
    options.agents.forEach((_, k) => {
      const tower = Math.floor(k / UNITS_PER_TOWER);
      const level = UNITS_PER_TOWER - 1 - (k % UNITS_PER_TOWER);
      const logo = new THREE.Group();
      this.root.add(logo);
      this.units.push({
        tower,
        level,
        logo,
        body: null,
        fireAt: 0.02 + tower * 0.085 + (UNITS_PER_TOWER - 1 - level) * 0.025,
        energy: 0,
      });
    });

    // The core: a wide database with Coere floating over it.
    const pedestal = createDatabaseMaterial({
      instanced: false,
      shadeDepth: 3,
      bandBase: 0.4,
    });
    this.pedestalUniforms = pedestal.uniforms;
    const pedestalMesh = new THREE.Mesh(
      createDatabaseGeometry({
        radius: 1.45,
        disk: 0.26,
        segments: 72,
      }),
      pedestal.material,
    );
    pedestalMesh.position.y = 0.26 * 3 + 0.07;
    pedestalMesh.castShadow = true;
    pedestalMesh.receiveShadow = true;
    this.mark = new THREE.Mesh(coereMarkGeometry(), coereMaterial());
    this.mark.castShadow = true;
    this.mark.scale.setScalar(2.2);
    this.markHit = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 3.4, 12),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    this.markHit.position.y = 1.6;
    this.coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowMap,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
    );
    this.coreGlow.scale.setScalar(5.4);
    this.coreLight = new THREE.PointLight("#dbe2ff", 10, 9, 1.6);
    this.core.add(
      pedestalMesh,
      this.coreGlow,
      this.mark,
      this.markHit,
      this.coreLight,
    );
    this.root.add(this.core);

    // Readers: a database column in brand blue, then a laptop with an app
    // floating over it, then a phone.
    const blueGeometry = unitGeometry();
    this.blueData = new THREE.InstancedBufferAttribute(
      new Float32Array(UNITS_PER_TOWER * 4),
      4,
    );
    this.blueData.setUsage(THREE.DynamicDrawUsage);
    blueGeometry.setAttribute("aData", this.blueData);
    const blue = createDatabaseMaterial({
      color: BRAND[500],
      band: "#ffffff",
      deep: BRAND[600],
      low: BRAND[500],
      glow: "#ffffff",
      shadeDepth: 6,
      bandBase: 0.5,
    }).material;
    blue.roughness = 0.24;
    blue.envMapIntensity = 1;
    this.blueMesh = new THREE.InstancedMesh(
      blueGeometry,
      blue,
      UNITS_PER_TOWER,
    );
    this.blueMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.blueMesh.castShadow = true;
    this.blueMesh.frustumCulled = false;
    this.root.add(this.blueMesh);

    const blueColumn: Device = {
      group: new THREE.Group(),
      update: () => {},
    };
    // [device, scale, turn toward Coere, floats, middle above its base]
    const readers: [Device, number, number, boolean, number][] = [
      [blueColumn, 1, 0.12, false, TOWER_HEIGHT / 2],
      [createLaptop(), 0.8, 0.18, false, 0.7],
      [createAppTile(), 0.62, 0.16, true, 0],
      [createPhone(), 0.74, 0.2, false, 0],
    ];
    readers.forEach(([device, scale, facing, float, middle], j) => {
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 10, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      this.root.add(device.group, hit);
      this.readers.push({
        device,
        base: new THREE.Vector3(),
        middle,
        scale,
        facing,
        float,
        fireAt: CORE_AT + 0.1 + [0, 0.07, 0.11, 0.15][j],
        energy: 0,
        hover: 0,
        hit,
        halo: halo(),
        appear: 0,
      });
    });

    this.ready = this.loadLogos();

    const host = options.host;
    host.addEventListener("pointerdown", this.onPointerDown);
    host.addEventListener("pointermove", this.onPointerMove);
    host.addEventListener("pointerup", this.onPointerUp);
    host.addEventListener("pointercancel", this.onPointerUp);
    host.addEventListener("pointerleave", this.onPointerLeave);
    this.stage.start();
  }

  /**
   * A floor of faint dots that fades out at the edges, with a band of light
   * that sweeps across it in step with the flow, plus a plane for shadows.
   */
  private buildFloor() {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(BRAND[400]) },
        uLit: { value: new THREE.Color(BRAND[600]) },
        uSweep: { value: -100 },
        uAlong: { value: new THREE.Vector2(1, 0) },
        uStrength: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vPos;
        void main() {
          vPos = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform vec3 uLit;
        uniform float uSweep;
        uniform vec2 uAlong;
        uniform float uStrength;
        varying vec2 vPos;
        void main() {
          // The plane lies flat, so its y runs toward the camera: flip it.
          vec2 p = vec2(vPos.x, -vPos.y);
          vec2 cell = fract(p / 0.5) - 0.5;
          float d = length(cell);
          float w = fwidth(d);
          float dotMask = 1.0 - smoothstep(0.05 - w, 0.05 + w, d);
          float fade = 1.0 - smoothstep(3.5, 11.0, length(p * vec2(0.62, 1.25)));
          float band = exp(-pow((dot(p, uAlong) - uSweep) / 1.1, 2.0)) * uStrength;
          vec3 color = mix(uColor, uLit, band);
          float alpha = dotMask * fade * (0.28 + band * 0.7);
          gl_FragColor = vec4(color, alpha);
          #include <colorspace_fragment>
        }
      `,
    });
    const dots = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), material);
    dots.rotation.x = -Math.PI / 2;
    dots.position.y = 0.002;
    const shadows = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ color: "#26338f", opacity: 0.08 }),
    );
    shadows.rotation.x = -Math.PI / 2;
    shadows.receiveShadow = true;
    this.root.add(shadows, dots);
    return material;
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
      this.units[k].body = body;
      bodies.add(body);
    });
    try {
      await this.stage.renderer.compileAsync(bodies, this.camera, this.scene);
    } catch {
      // Compiling on first draw instead is fine.
    }
    this.units.forEach((unit) => unit.body && unit.logo.add(unit.body));
  }

  // ---------------------------------------------------------------- layout

  private resize(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.portrait = aspect < 1.05;
    const tanV = (fov: number) => Math.tan(THREE.MathUtils.degToRad(fov / 2));

    if (this.portrait) {
      // Sources at the back, readers in front: the flow runs down the screen.
      this.camera.fov = 34;
      // Steep enough that the columns at the back clear Coere's top.
      this.elevation = 0.8;
      this.targetY = 0.8;
      this.towers.forEach((tower, i) => {
        tower.x = (i - 1) * 1.65;
        tower.z = -5.9;
      });
      const spots: [number, number, number][] = [
        [-2.1, 3.9, 0],
        [0.15, 4.4, 0],
        [2.25, 3.55, 2.25],
        [2.25, 4.1, 0.76],
      ];
      this.readers.forEach((r, j) =>
        r.base.set(spots[j][0], spots[j][2], spots[j][1]),
      );
      const halfWidth = 3.3;
      const halfDepth = 6.7;
      this.distance = Math.max(
        halfWidth / (tanV(this.camera.fov) * aspect),
        halfDepth / tanV(this.camera.fov),
      );
    } else {
      // Mirror images either side of Coere, all facing the camera.
      this.camera.fov = 24;
      this.elevation = 0.2;
      this.targetY = 1.3;
      this.towers.forEach((tower, i) => {
        tower.x = -6.35 + i * 1.5;
        tower.z = 0;
      });
      const spots: [number, number, number][] = [
        [3.2, 0, 0],
        [5.25, 0.25, 0],
        [5.25, -0.1, 2.35],
        [7.0, 0.15, 0.76],
      ];
      this.readers.forEach((r, j) =>
        r.base.set(spots[j][0], spots[j][2], spots[j][1]),
      );
      const halfWidth = 8.2;
      const halfHeight = 2.8;
      this.distance = Math.max(
        halfWidth / (tanV(this.camera.fov) * aspect),
        halfHeight / tanV(this.camera.fov),
      );
    }
    this.towers.forEach((tower) =>
      tower.hit.position.set(tower.x, TOWER_HEIGHT / 2, tower.z),
    );
    const fog = this.scene.fog as THREE.Fog;
    fog.near = this.distance + 6;
    fog.far = this.distance + 30;
    this.floor.uniforms.uAlong.value.set(
      this.portrait ? 0 : 1,
      this.portrait ? 1 : 0,
    );
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
    // The flow starts once everything has arrived.
    const running = this.reducedMotion ? 0 : clamp01((intro - 2.2) / 0.6);
    const phase = (Math.max(0, intro - 2.2) / CYCLE) % 1;

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
    // Camera: a slow drift, a little parallax, and a drag that springs home.
    if (!this.drag) this.yawTarget = damp(this.yawTarget, 0, 1.6, dt);
    const parallaxX = this.pointerInside ? this.pointerX : 0;
    const parallaxY = this.pointerInside ? this.pointerY : 0;
    const drift = Math.sin(t * 0.25) * 0.05;
    this.yaw = damp(this.yaw, this.yawTarget + parallaxX * 0.08 + drift, 4, dt);
    this.pitch = damp(this.pitch, -parallaxY * 0.04, 4, dt);
    this.root.rotation.y = this.yaw;
    const elevation = this.elevation + this.pitch;
    const target = place.set(0, this.targetY, 0);
    this.camera.position.set(
      target.x,
      target.y + Math.sin(elevation) * this.distance,
      target.z + Math.cos(elevation) * this.distance,
    );
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();

    this.updateSources(t, dt, intro, phase, running);
    this.updateCore(t, dt, intro, phase, running);
    this.updateReaders(t, dt, intro, phase, running);

    // The band of light on the floor crosses with the flow.
    const along = this.portrait ? 4.8 : 7.6;
    this.floor.uniforms.uSweep.value = lerp(-along, along, phase / 0.62);
    this.floor.uniforms.uStrength.value =
      running * (phase < 0.62 ? Math.sin((phase / 0.62) * Math.PI) : 0);

    this.stage.renderer.render(this.scene, this.camera);
  }

  /** A side's resting glow: up when it has focus, down when the other does. */
  private sideLight(mine: number, other: number) {
    return 1 + mine * 0.6 - other * 0.55;
  }

  private updateSources(
    t: number,
    dt: number,
    intro: number,
    phase: number,
    running: number,
  ) {
    const data = this.sourceData.array as Float32Array;
    const light = this.sideLight(
      this.focusAmount.connect,
      this.focusAmount.developer,
    );
    const towerEnergy = this.towers.map(() => 0);

    this.towers.forEach((tower, i) => {
      const hovered =
        this.hovered?.kind === "source" && this.hovered.index === i;
      tower.hover = damp(tower.hover, hovered ? 1 : 0, 10, dt);
    });

    this.units.forEach((unit, k) => {
      const tower = this.towers[unit.tower];
      // Units drop into place bottom first, a column at a time.
      const delay = 0.25 + unit.tower * 0.2 + unit.level * 0.12;
      const appear = this.reducedMotion ? 1 : clamp01((intro - delay) / 0.55);
      const drop = (1 - easeOutCubic(appear)) * 2.2;
      unit.energy = flash(phase, unit.fireAt) * running;
      towerEnergy[unit.tower] = Math.max(towerEnergy[unit.tower], unit.energy);

      const lift = tower.hover * 0.08 * (unit.level + 1);
      const top =
        (unit.level + 1) * UNIT_HEIGHT + unit.level * UNIT_GAP + drop + lift;
      const scale = Math.max(0.0001, easeOutBack(appear));
      matrix.makeScale(scale, scale, scale).setPosition(tower.x, top, tower.z);
      this.sourceMesh.setMatrixAt(k, matrix);
      data[k * 4] = (0.22 + unit.energy * 1.4 + tower.hover * 0.5) * light;
      data[k * 4 + 1] = 0;
      data[k * 4 + 2] = this.focusAmount.developer * 0.18;
      data[k * 4 + 3] = tower.hover * 0.3;

      // The logo sits on the front of its database, turned a touch toward
      // Coere, and leans forward when the light leaves it.
      const logo = unit.logo;
      const face = this.portrait ? 0 : 0.2;
      logo.position.set(
        tower.x + Math.sin(face) * (UNIT_RADIUS + 0.06),
        top - UNIT_HEIGHT / 2,
        tower.z + Math.cos(face) * (UNIT_RADIUS + 0.06),
      );
      logo.scale.setScalar(scale * 0.5 * (1 + unit.energy * 0.08));
      logo.rotation.set(
        -unit.energy * 0.12,
        face - this.yaw * 0.5 + Math.sin(t * 0.8 + k) * 0.06,
        0,
      );
    });
    this.sourceMesh.instanceMatrix.needsUpdate = true;
    this.sourceData.needsUpdate = true;

    this.towers.forEach((tower, i) => {
      const glow =
        Math.max(
          towerEnergy[i] * 0.9,
          tower.hover * 0.6,
          this.focusAmount.connect * 0.45,
        ) * light;
      tower.halo.position.set(
        tower.x,
        TOWER_HEIGHT / 2,
        tower.z - (this.portrait ? 0.25 : 0.7),
      );
      tower.halo.scale.set(3.2, 4.4, 1);
      tower.halo.material.opacity = Math.min(0.75, glow * 0.7);
      tower.halo.visible = tower.halo.material.opacity > 0.003;
    });
  }

  private updateCore(
    t: number,
    dt: number,
    intro: number,
    phase: number,
    running: number,
  ) {
    const appear = this.reducedMotion ? 1 : easeOutCubic(clamp01(intro / 0.9));
    this.core.position.y = lerp(-1.5, 0, appear);
    this.core.scale.setScalar(lerp(0.7, 1, appear));

    // Mostly facing out with a slow sway; a click sends it round.
    this.spinVelocity = damp(this.spinVelocity, 0, 1.4, dt);
    if (Math.abs(this.spinVelocity) < 0.5) {
      const home = Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2;
      const sway = this.reducedMotion ? 0 : Math.sin(t * 0.5) * 0.4;
      this.spin = damp(this.spin, home + sway, 2.5, dt);
    }
    this.spin += this.spinVelocity * dt;
    const pulse = flash(phase, CORE_AT, 0.16) * running;
    // Higher on phones, where the steeper camera would sink it into the pedestal.
    const markY = (this.portrait ? 2.75 : 2.45) + Math.sin(t * 1.1) * 0.07;
    this.mark.position.y = markY;
    this.mark.rotation.set(Math.sin(t * 0.8) * 0.05, this.spin - this.yaw, 0);
    this.mark.scale.setScalar(2.2 * (1 + pulse * 0.05));
    this.coreGlow.position.y = markY;
    this.coreGlow.material.opacity = 0.42 + pulse * 0.4;
    this.coreLight.position.y = markY;
    this.coreLight.intensity = 10 + pulse * 26;

    const hovered = this.hovered?.kind === "core";
    this.pedestalUniforms.uData.value.set(
      0.3 + pulse * 1.3 + (hovered ? 0.5 : 0),
      0,
      0,
      0,
    );
  }

  private updateReaders(
    t: number,
    dt: number,
    intro: number,
    phase: number,
    running: number,
  ) {
    const light = this.sideLight(
      this.focusAmount.developer,
      this.focusAmount.connect,
    );
    const blueData = this.blueData.array as Float32Array;

    this.readers.forEach((reader, j) => {
      const delay = 1 + j * 0.16;
      reader.appear = this.reducedMotion ? 1 : clamp01((intro - delay) / 0.7);
      const pop = Math.max(0.0001, easeOutBack(reader.appear));
      const hovered =
        this.hovered?.kind === "reader" && this.hovered.index === j;
      reader.hover = damp(reader.hover, hovered ? 1 : 0, 10, dt);
      reader.energy = flash(phase, reader.fireAt, 0.16) * running;
      const lit = Math.min(1, reader.energy + reader.hover * 0.5);

      const group = reader.device.group;
      const bob = reader.float ? Math.sin(t * 1.1 + j * 2) * 0.08 : 0;
      group.position.copy(reader.base);
      group.position.y += bob + reader.hover * 0.12 + reader.energy * 0.06;
      group.scale.setScalar(pop * reader.scale * (1 + reader.hover * 0.05));
      const sway = reader.float ? Math.sin(t * 0.6 + j) * 0.12 : 0;
      group.rotation.y = this.portrait
        ? sway
        : -reader.facing + sway - this.yaw * 0.3;
      reader.device.update(t, lit * light);

      const centerY = group.position.y + reader.middle;
      reader.hit.position.set(reader.base.x, centerY, reader.base.z);
      // Just behind; further back would float above it on the steep phone view.
      const behind = this.portrait ? 0.25 : 0.8;
      reader.halo.position.set(reader.base.x, centerY, reader.base.z - behind);
      reader.halo.scale.set(3.4, 3.6, 1);
      reader.halo.material.opacity = Math.min(
        0.75,
        Math.max(lit, this.focusAmount.developer * 0.7) * light * 0.6,
      );
      reader.halo.visible = reader.halo.material.opacity > 0.003;

      if (j === 0) {
        // The blue database column, built like the sources.
        for (let level = 0; level < UNITS_PER_TOWER; level++) {
          const at = clamp01((intro - delay - level * 0.12) / 0.55);
          const top =
            (level + 1) * UNIT_HEIGHT +
            level * UNIT_GAP +
            (1 - easeOutCubic(at)) * 2.2 +
            reader.hover * 0.08 * (level + 1);
          const s = Math.max(0.0001, easeOutBack(at));
          matrix
            .makeScale(s, s, s)
            .setPosition(reader.base.x, top, reader.base.z);
          this.blueMesh.setMatrixAt(level, matrix);
          blueData[level * 4] = (0.3 + lit * 1.2) * light;
          blueData[level * 4 + 2] = this.focusAmount.connect * 0.18;
        }
      }
    });
    this.blueMesh.instanceMatrix.needsUpdate = true;
    this.blueData.needsUpdate = true;
  }

  // ---------------------------------------------------------------- pointer

  private pick(clientX: number, clientY: number): Hover {
    const rect = this.options.host.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const targets = [
      this.markHit,
      ...this.towers.map((s) => s.hit),
      ...this.readers.map((r) => r.hit),
    ];
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    if (!hit) return null;
    if (hit.object === this.markHit) return { kind: "core", index: 0 };
    const s = this.towers.findIndex((x) => x.hit === hit.object);
    if (s >= 0) return { kind: "source", index: s };
    const r = this.readers.findIndex((x) => x.hit === hit.object);
    return r >= 0 ? { kind: "reader", index: r } : null;
  }

  private setHovered(next: Hover) {
    const sideOf = (h: Hover) =>
      h?.kind === "source"
        ? "connect"
        : h?.kind === "reader"
          ? "developer"
          : null;
    const before = sideOf(this.hovered);
    this.hovered = next;
    const after = sideOf(next);
    if (after !== before) this.options.onHoverSide?.(after);
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
    // A mouse released outside the stage never sends pointerup here.
    if (this.drag && event.pointerType === "mouse" && event.buttons === 0) {
      this.drag = null;
    }
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
          -0.7,
          0.7,
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
    this.units.forEach((u) => u.body && u.logo.remove(u.body));
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    this.stage.dispose();
  }
}
