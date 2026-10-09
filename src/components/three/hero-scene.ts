import * as THREE from "three";
import {
  BRAND,
  Stage,
  clamp01,
  createEnvironment,
  createGlowTexture,
  damp,
  disposeTree,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  isLowPowerDevice,
  lerp,
  prefersReducedMotion,
  smoothstep,
} from "./core";
import { createDatabaseMaterial, createTileGeometry } from "./database";
import { createDust } from "./dust";
import { coereMaterial, coereMarkGeometry, loadLogo } from "./logos";

export type HeroAgent = { name: string; logo: string };

type Options = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  agents: readonly HeroAgent[];
  getProgress: () => number;
  /** The headline over the scene; the picture is framed to stay below it. */
  headline?: HTMLElement;
  /** The GPU dropped the scene for good; show the flat page instead. */
  onFail?: () => void;
};

export const HERO_BACKGROUND = "#f2f5fc";

/** Height of the orbit formation. */
const ORBIT_Y = 4.4;
/**
 * How far the cube lattice is turned from the camera's line of sight. Past
 * the half-width of the view, and short of 90 degrees minus it, so neither
 * row direction ever lines up with a sight line on any screen shape.
 */
const GRID_ANGLE = 0.6;
/** How much of the morph the agents spread their departures over. Small, so
 * neighbours leave together and never overtake one another. */
const STAGGER = 0.12;
/**
 * Where each agent waits on the wave, as a fraction of the spread: an even
 * ring on screen around Coere, in the orbit's order, so nothing bunches up and
 * none of them leaves for its place in the orbit across another's path. The
 * wave runs from near left to far right, so the left of the ring sits deeper.
 */
const WAVE_SPOTS: Record<string, [number, number]> = {
  Perplexity: [0.5, -0.6],
  Grok: [0.99, -0.28],
  Copilot: [1.08, 0.06],
  "Meta AI": [0.66, 0.55],
  Kimi: [0, 0.83],
  DeepSeek: [-0.62, 0.84],
  ChatGPT: [-0.99, 0.56],
  Claude: [-1.07, -0.82],
  Gemini: [-0.52, -1.55],
};
/** Clockwise from the top, as the flat orbit had them. */
const RING_ORDER = [
  "Perplexity",
  "Grok",
  "Copilot",
  "Meta AI",
  "Kimi",
  "DeepSeek",
  "ChatGPT",
  "Claude",
  "Gemini",
];

type Agent = {
  name: string;
  group: THREE.Group;
  body: THREE.Mesh | null;
  hit: THREE.Mesh;
  /** Spot on the wave. */
  spot: THREE.Vector2;
  ringAngle: number;
  hover: number;
  flip: number;
  flipVelocity: number;
  stagger: number;
};

const tmp = new THREE.Vector3();
const from = new THREE.Vector3();
const to = new THREE.Vector3();
const lift = new THREE.Vector3();
const settle = new THREE.Vector3();

export class HeroScene {
  readonly ready: Promise<void>;

  private readonly stage: Stage;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  private readonly lowPower = isLowPowerDevice();
  private readonly reducedMotion = prefersReducedMotion();
  private readonly options: Options;
  private headlineObserver: ResizeObserver | null = null;
  /** How far down the screen the headline reaches, as a fraction. */
  private clear = 0;

  // The field of cubes.
  private field!: THREE.InstancedMesh;
  private fieldMaterial!: THREE.MeshStandardMaterial;
  /** Most cubes ever laid out; past it the farthest are dropped. */
  private readonly fieldCap: number;
  private fieldData!: THREE.InstancedBufferAttribute;
  private fieldX = new Float32Array(0);
  private fieldZ = new Float32Array(0);
  private fieldEdge = new Float32Array(0);
  private fieldCount = 0;
  private readonly spacing: number;

  // Coere above the crest.
  private readonly rig = new THREE.Group();
  private readonly mark: THREE.Mesh;
  private readonly markHit: THREE.Mesh;
  private readonly glow: THREE.Sprite;
  private readonly light: THREE.PointLight;

  private readonly agents: Agent[] = [];
  private readonly pads: Float32Array;
  private readonly dust: THREE.Points;
  private readonly key: THREE.DirectionalLight;

  // Layout, set on resize.
  private aspect = 1;
  private spread = new THREE.Vector2(8.6, 6.3);
  private waveScale = 1;
  private waveCamera = {
    target: new THREE.Vector3(0, 2.6, 0),
    elevation: 0.27,
    distance: 29,
    anchor: 0.6,
  };
  private orbitCamera = {
    target: new THREE.Vector3(0, ORBIT_Y, 0),
    elevation: 0.06,
    distance: 40,
    anchor: 0.6,
  };
  private ringRadius = 6.2;
  /** The ring as drawn this frame: it grows with the camera's pull-back, so
   * it holds one size on screen and never rises into the headline. */
  private ringNow = 6.2;

  // Motion state.
  private time = 0;
  private progress = 0;
  private morph = 0;
  private spin = 0;
  private spinVelocity = 0;
  private orbitAngle = 0;
  /** Seconds since the logos arrived, for the entrance. */
  private entrance = -1;

  // Pointer state.
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private drag: null | {
    id: number;
    /** What the pointer went down on: an agent's index, or -1 or -2. */
    target: number;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    moved: boolean;
  } = null;
  private hovered = -2;

  constructor(options: Options) {
    this.options = options;
    this.spacing = this.lowPower ? 0.62 : 0.5;
    this.fieldCap = this.lowPower ? 9000 : 30000;
    this.pads = new Float32Array(options.agents.length * 2);

    this.stage = new Stage({
      canvas: options.canvas,
      host: options.host,
      maxDpr: this.lowPower ? 1.5 : 1.75,
      onResize: (w, h) => this.resize(w, h),
      onFrame: (dt, t) => this.frame(dt, t),
      onDegrade: () => this.degrade(),
      onContextFail: () => options.onFail?.(),
    });
    const renderer = this.stage.renderer;

    // Light, airy studio.
    this.scene.background = new THREE.Color(HERO_BACKGROUND);
    this.scene.fog = new THREE.Fog(HERO_BACKGROUND, 43, 88);
    this.scene.environment = createEnvironment(renderer);
    this.scene.environmentIntensity = 0.5;

    // A high key light so every cube top catches it and the gaps between
    // them fall into shade: that contrast is what makes the swell read.
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#a9b7e2", 0.55));
    this.key = new THREE.DirectionalLight("#ffffff", 2.6);
    this.key.castShadow = true;
    const shadowSize = this.lowPower ? 1024 : 2048;
    this.key.shadow.mapSize.set(shadowSize, shadowSize);
    const sc = this.key.shadow.camera;
    sc.left = -14;
    sc.right = 14;
    sc.top = 14;
    sc.bottom = -14;
    sc.near = 1;
    sc.far = 50;
    this.key.shadow.radius = 5;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.03;
    this.scene.add(this.key, this.key.target);
    // A soft front fill keeps the logos' faces lit with the key behind them.
    const fill = new THREE.DirectionalLight("#eef1ff", 0.55);
    fill.position.set(3, 6, 14);
    this.scene.add(fill);

    this.buildField(this.lowPower ? 6000 : 14000);

    // Coere, glowing, and the light it throws on the crest below.
    this.mark = new THREE.Mesh(coereMarkGeometry(), coereMaterial());
    this.mark.castShadow = true;
    this.markHit = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 12, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(BRAND[500]),
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      }),
    );
    this.glow.scale.setScalar(3.4);
    this.glow.renderOrder = 1;
    this.light = new THREE.PointLight("#dbe2ff", 20, 18, 1.5);
    this.rig.add(this.glow, this.mark, this.markHit, this.light);
    this.scene.add(this.rig);

    this.dust = createDust(
      this.lowPower ? 140 : 300,
      new THREE.Vector3(46, 13, 40),
      BRAND[400],
      7,
    );
    this.scene.add(this.dust);

    this.ready = this.buildAgents();

    const host = options.host;
    host.addEventListener("pointerdown", this.onPointerDown);
    host.addEventListener("pointermove", this.onPointerMove);
    host.addEventListener("pointerup", this.onPointerUp);
    host.addEventListener("pointercancel", this.onPointerUp);
    host.addEventListener("pointerleave", this.onPointerLeave);
    this.stage.start();

    // The headline rewraps with the width and when its font arrives.
    if (options.headline) {
      this.headlineObserver = new ResizeObserver(() => {
        const { width, height } = this.stage;
        if (this.headlineClear(height) !== this.clear)
          this.resize(width, height);
      });
      this.headlineObserver.observe(options.headline);
    }
  }

  // ---------------------------------------------------------------- building

  /** Builds, or rebuilds bigger, the instanced field for `capacity` cubes. */
  private buildField(capacity: number) {
    if (this.field) {
      this.scene.remove(this.field);
      this.field.geometry.dispose();
      this.field.dispose();
    }
    if (!this.fieldMaterial) {
      this.fieldMaterial = createDatabaseMaterial({
        // Shallow, so the step between neighbours reaches the deep tone and
        // every cube shows a lit top over a shaded side.
        shadeDepth: this.spacing * 1.0,
        deep: "#97a6d4",
      });
      this.fieldMaterial.roughness = 0.6;
    }
    // Cubes nearly touching, so their tops read as one surface.
    const geometry = createTileGeometry({
      half: this.spacing * 0.45,
      shaft: 9,
      roll: this.lowPower ? 2 : 3,
    });
    this.fieldData = new THREE.InstancedBufferAttribute(
      new Float32Array(capacity * 4),
      4,
    );
    this.fieldData.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aData", this.fieldData);
    this.field = new THREE.InstancedMesh(
      geometry,
      this.fieldMaterial,
      capacity,
    );
    this.field.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.field.receiveShadow = true;
    this.field.frustumCulled = false;
    this.field.count = 0;
    this.scene.add(this.field);

    this.fieldX = new Float32Array(capacity);
    this.fieldZ = new Float32Array(capacity);
    this.fieldEdge = new Float32Array(capacity);
  }

  /** Lays the cubes out in the wedge the camera can see. */
  private layoutField() {
    const s = this.spacing;
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const tanH = Math.tan(halfFov) * this.aspect;
    const A = this.waveCamera;
    const camY = A.target.y + Math.sin(A.elevation) * A.distance;
    const camZ = A.target.z + Math.cos(A.elevation) * A.distance;
    // First row just below the bottom of the screen.
    const lowRay = A.elevation + halfFov + 0.14;
    const zNear = Math.min(camZ - 3, camZ - camY / Math.tan(lowRay) + 2);
    const zFar = -42;
    const halfAt = (z: number) => (camZ - z) * tanH * 1.12 + 2.5;

    // The lattice sits at a slight angle to the camera, so its rows run on a
    // diagonal and no gap lines up with the line of sight.
    const ca = Math.cos(GRID_ANGLE);
    const sa = Math.sin(GRID_ANGLE);
    const reach = halfAt(zFar);
    const corners: [number, number][] = [
      [-reach, zNear],
      [reach, zNear],
      [-reach, zFar],
      [reach, zFar],
    ];
    const us = corners.map(([x, z]) => ca * x - sa * z);
    const vs = corners.map(([x, z]) => sa * x + ca * z);
    const u0 = Math.floor(Math.min(...us) / s);
    const u1 = Math.ceil(Math.max(...us) / s);
    const v0 = Math.floor(Math.min(...vs) / s);
    const v1 = Math.ceil(Math.max(...vs) / s);

    // Gather every cube the camera can see.
    const xs: number[] = [];
    const zs: number[] = [];
    const edges: number[] = [];
    for (let j = v1; j >= v0; j--) {
      for (let i = u0; i <= u1; i++) {
        const u = i * s;
        const v = j * s;
        const x = ca * u + sa * v;
        const z = -sa * u + ca * v;
        if (z > zNear || z < zFar) continue;
        const half = halfAt(z);
        if (Math.abs(x) > half) continue;
        xs.push(x);
        zs.push(z);
        // Fade out toward the sides and into the distance.
        const side = smoothstep(half - 5, half, Math.abs(x));
        const far = smoothstep(zFar + 24, zFar + 6, z);
        edges.push(Math.max(side, far));
      }
    }

    // Past the cap, drop the farthest cubes, which the fade has mostly
    // taken anyway; otherwise grow the mesh to fit.
    let n = xs.length;
    let order: number[] | null = null;
    if (n > this.fieldCap) {
      order = xs
        .map((_, k) => k)
        .sort((a, b) => zs[b] - zs[a])
        .slice(0, this.fieldCap);
      n = this.fieldCap;
    }
    if (n > this.fieldX.length) {
      this.buildField(Math.min(this.fieldCap, Math.ceil(n * 1.1)));
    }

    const matrix = new THREE.Matrix4();
    for (let k = 0; k < n; k++) {
      const from = order ? order[k] : k;
      this.fieldX[k] = xs[from];
      this.fieldZ[k] = zs[from];
      this.fieldEdge[k] = edges[from];
      matrix.makeRotationY(GRID_ANGLE);
      matrix.setPosition(xs[from], 0, zs[from]);
      this.field.setMatrixAt(k, matrix);
    }
    this.fieldCount = n;
    this.field.count = n;
    this.field.instanceMatrix.needsUpdate = true;
  }

  private async buildAgents() {
    const list = this.options.agents;
    list.forEach((info, k) => {
      const group = new THREE.Group();
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 12, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      group.add(hit);
      this.scene.add(group);
      const spot = WAVE_SPOTS[info.name] ?? [Math.cos(k), Math.sin(k)];
      const ringIndex = Math.max(0, RING_ORDER.indexOf(info.name));
      const ringAngle = Math.PI / 2 - (ringIndex / list.length) * Math.PI * 2;
      this.agents.push({
        name: info.name,
        group,
        body: null,
        hit,
        spot: new THREE.Vector2(spot[0], spot[1]),
        ringAngle,
        hover: 0,
        flip: 0,
        flipVelocity: 0,
        // The bottom of the ring fills first and the top last, once the
        // camera has pulled back, so nothing rises into the headline.
        stagger: ((Math.sin(ringAngle) + 1) / 2) * STAGGER,
      });
    });

    const assets = await Promise.allSettled(
      list.map((info) => loadLogo(info.logo)),
    );
    const bodies = new THREE.Group();
    assets.forEach((result, k) => {
      if (result.status !== "fulfilled") return;
      const body = new THREE.Mesh(result.value.geometry, result.value.material);
      body.castShadow = true;
      this.agents[k].body = body;
      bodies.add(body);
    });
    // Compile the logo shaders off the main thread where the browser allows,
    // so they arrive without a hitch.
    try {
      await this.stage.renderer.compileAsync(bodies, this.camera, this.scene);
    } catch {
      // Compiling on first draw instead is fine.
    }
    this.agents.forEach((agent) => agent.body && agent.group.add(agent.body));
    this.entrance = this.reducedMotion ? 99 : 0;
  }

  // ---------------------------------------------------------------- layout

  private resize(width: number, height: number) {
    this.aspect = width / height;
    const a = this.aspect;
    const portrait = a < 0.9;
    // A long lens, so near and far cubes stay close in size.
    this.camera.fov = portrait ? 34 : a < 1.3 ? 27 : 22;
    this.camera.aspect = a;

    // Spread the agents to the screen: wide on desktop, deep on phones.
    const wide = smoothstep(0.55, 1.6, a);
    this.spread.set(lerp(4.3, 8.6, wide), lerp(8.4, 6.3, wide));
    // Phones draw the wave small, so the logos on it get a little bigger.
    this.waveScale = lerp(1.25, 1, wide);

    // Low over the surface, as in a landscape shot.
    this.waveCamera.distance = lerp(44, 40, wide);
    this.waveCamera.elevation = lerp(0.4, 0.3, wide);
    const clear = this.headlineClear(height);
    this.clear = clear;
    // Lower the picture on short screens, so the agents at the back of the
    // wave stay under the headline: they sit up to 0.18 of the screen above
    // the target. Never so low that the agents in front leave the bottom.
    this.waveCamera.anchor = Math.min(
      0.72,
      Math.max(portrait ? 0.56 : 0.6, clear + 0.18),
    );
    this.waveCamera.target.set(0, 2.6, 0);

    // Fit the orbit between the headline and the bottom of the screen. With
    // the target drawn at `anchor` down the screen, the world height visible
    // above it is 2 * (anchor - headroom) * distance * tan(fov / 2).
    this.ringRadius = 6.2;
    const extent = this.ringRadius + 1.25;
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    // Clear air between the headline and the top of the ring, and the ring
    // centered in what is left when the headline runs long.
    const headroom = Math.max(portrait ? 0.27 : 0.35, clear);
    const anchor = Math.max(
      portrait ? 0.58 : 0.64,
      (headroom + (portrait ? 0.89 : 0.93)) / 2,
    );
    const fitV = extent / (2 * (anchor - headroom) * tanV);
    const fitH = extent / (tanV * a * 0.92);
    this.orbitCamera.distance = Math.max(fitV, fitH);
    this.orbitCamera.anchor = anchor;

    this.layoutField();
    (this.dust.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value =
      this.stage.pixelRatio;
  }

  /** The bottom of the headline as a fraction of the screen, plus some air. */
  private headlineClear(height: number) {
    const headline = this.options.headline;
    if (!headline) return 0;
    return (headline.offsetTop + headline.offsetHeight) / height + 0.02;
  }

  private degrade() {
    // Shadows are the first thing a slow GPU will not miss.
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
    this.dust.visible = false;
  }

  // ---------------------------------------------------------------- the wave

  /** Height of the wave at a point. */
  private height(x: number, z: number, t: number) {
    // One long swell running from near left to far right, its crest passing
    // just behind Coere, a trough in front of it and a gentler swell behind.
    const across = 0.42 * x + 0.91 * z;
    const along = 0.91 * x - 0.42 * z;
    const c = across + 1.2;
    const crest =
      3.4 *
      Math.exp(-(c * c) / (2 * 3.4 * 3.4)) *
      (0.8 + 0.2 * Math.sin(along * 0.14 - t * 0.32));
    const b = across + 13;
    const back = 1.6 * Math.exp(-(b * b) / (2 * 5 * 5));
    const f = across - 9;
    const front = -0.9 * Math.exp(-(f * f) / (2 * 5 * 5));
    const swell =
      0.3 * Math.sin(x * 0.1 + t * 0.25) * Math.cos(z * 0.09 - t * 0.2);
    return crest + back + front + swell - 0.6;
  }

  private updateField(t: number, amp: number, morph: number) {
    if (morph >= 0.5) {
      this.field.visible = false;
      return;
    }
    const fieldFade = smoothstep(0.2, 0.45, morph);
    this.field.visible = true;

    const pads = this.pads;
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      pads[k * 2] = a.spot.x * this.spread.x;
      pads[k * 2 + 1] = a.spot.y * this.spread.y;
    }
    const padCount = this.agents.length * 2;
    const padLight = 1 - smoothstep(0, 0.35, morph);
    const matrix = this.field.instanceMatrix.array as Float32Array;
    const data = this.fieldData.array as Float32Array;

    for (let i = 0; i < this.fieldCount; i++) {
      const x = this.fieldX[i];
      const z = this.fieldZ[i];
      const d2 = x * x + z * z;
      const d = Math.sqrt(d2);

      // Sink in a ring that starts under Coere and runs outward.
      const start = Math.min(d / 34, 1) * 0.45;
      const sink = clamp01((morph - start) / 0.5);
      const h = this.height(x, z, t) * amp;
      matrix[i * 16 + 13] = h - sink * sink * 11;

      // A soft pool of light under each agent.
      let pool = 0;
      for (let p = 0; p < padCount; p += 2) {
        const dx = x - pads[p];
        const dz = z - pads[p + 1];
        const q = dx * dx + dz * dz;
        if (q < 2.2) pool += (1 - q / 2.2) * padLight;
      }

      const o = i * 4;
      // Crests stay white; slopes and the far field fall into blue, as if
      // the only light were Coere's.
      const spot = Math.exp(-d2 / (2 * 12 * 12));
      data[o + 1] = Math.min(
        1,
        smoothstep(2.8, -1.2, h) * 0.9 + (1 - spot) * 0.15,
      );
      // Gone before the camera drops low enough to see the field edge-on.
      data[o + 2] = Math.max(
        this.fieldEdge[i],
        fieldFade,
        smoothstep(0.05, 0.3, sink),
      );
      data[o + 3] = Math.min(1, pool * 0.55);
    }
    // Upload only the cubes in use, not the whole capacity.
    this.field.instanceMatrix.clearUpdateRanges();
    this.field.instanceMatrix.addUpdateRange(0, this.fieldCount * 16);
    this.field.instanceMatrix.needsUpdate = true;
    this.fieldData.clearUpdateRanges();
    this.fieldData.addUpdateRange(0, this.fieldCount * 4);
    this.fieldData.needsUpdate = true;
  }

  // ---------------------------------------------------------------- frame

  private frame(dt: number, elapsed: number) {
    const motion = this.reducedMotion ? 0 : 1;
    this.time += dt * motion;
    const t = this.time;
    if (this.entrance >= 0) this.entrance += dt;

    // Scroll drives the morph, smoothed so wheel steps glide.
    const target = clamp01(this.options.getProgress());
    this.progress =
      this.reducedMotion || dt === 0
        ? target
        : damp(this.progress, target, 6, dt);
    this.morph = smoothstep(0.04, 0.8, this.progress);
    const m = this.morph;
    const amp = 1 - 0.45 * m;

    this.updateCamera(m);
    this.updateField(t, amp, m);
    this.updateRig(t, dt, m, amp);
    this.updateAgents(t, dt, m, amp);
    this.orbitAngle -= dt * 0.1 * motion * smoothstep(0.6, 1, m);

    const dustMaterial = this.dust.material as THREE.ShaderMaterial;
    dustMaterial.uniforms.uTime.value = elapsed * motion;
    // At orbit distance the specks shrink to stray pixels, so let them go.
    dustMaterial.uniforms.uOpacity.value = 1 - smoothstep(0.3, 0.7, m);

    this.stage.renderer.render(this.scene, this.camera);
  }

  private updateCamera(m: number) {
    const e = easeInOutCubic(m);
    const A = this.waveCamera;
    const B = this.orbitCamera;
    const target = tmp.copy(A.target).lerp(B.target, e);
    // Entrance: the camera glides in and settles from a little higher up.
    const arriving = 1 - easeOutCubic(clamp01(this.entrance / 2.6));
    const elevation = lerp(A.elevation, B.elevation, e) + arriving * 0.16;
    const distance = lerp(A.distance, B.distance, e) + arriving * 9;
    this.ringNow = this.ringRadius * Math.min(1, distance / B.distance);
    // Fog starts just past the target, wherever the camera has moved to.
    const fog = this.scene.fog as THREE.Fog;
    fog.near = distance + 3;
    fog.far = distance + 47;
    this.camera.position.set(
      target.x,
      target.y + Math.sin(elevation) * distance,
      target.z + Math.cos(elevation) * distance,
    );
    this.camera.lookAt(target);
    const anchor = lerp(A.anchor, B.anchor, e);
    const w = this.stage.width;
    const h = this.stage.height;
    this.camera.setViewOffset(w, h, 0, (0.5 - anchor) * h, w, h);
    this.camera.updateProjectionMatrix();

    // Keep the shadow box around the action.
    this.key.target.position.copy(target);
    // From above and behind the crest, as in the reference: tops catch it,
    // the sides facing the camera fall into shade.
    this.key.position.set(target.x - 6, target.y + 18, target.z - 8);
  }

  private updateRig(t: number, dt: number, m: number, amp: number) {
    const e = easeInOutCubic(m);
    const bob = Math.sin(t * 0.9) * 0.12;
    const waveY = this.height(0, 0, t) * amp + 2 + bob;
    this.rig.position.set(0, lerp(waveY, ORBIT_Y + bob * 0.5, e), 0);
    this.rig.scale.setScalar(lerp(this.aspect < 0.9 ? 2.45 : 2.6, 3.2, e));

    // Spin: free on the wave; in the orbit it settles facing out with a sway.
    // While dragged it follows the pointer, and runs on when let go.
    if (!this.drag?.moved) {
      const cruise = this.reducedMotion ? 0 : lerp(0.42, 0, e);
      this.spinVelocity = damp(this.spinVelocity, cruise, 1.2, dt);
      if (e > 0.5 && Math.abs(this.spinVelocity) < 0.6) {
        const home = Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2;
        const sway = this.reducedMotion ? 0 : Math.sin(t * 0.55) * 0.32;
        this.spin = damp(this.spin, home + sway, 2.2 * (e - 0.5) * 2, dt);
      }
      this.spin += this.spinVelocity * dt;
    }
    this.mark.rotation.set(Math.sin(t * 0.7) * 0.06, this.spin, 0);
    this.glow.material.opacity = lerp(0.55, 0.45, e);
    this.light.intensity = lerp(20, 6, e);
  }

  private updateAgents(t: number, dt: number, m: number, amp: number) {
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      const local = easeInOutCubic(clamp01((m - a.stagger) / (1 - STAGGER)));

      // On the wave.
      const lx = a.spot.x * this.spread.x;
      const lz = a.spot.y * this.spread.y;
      const bob = Math.sin(t * 1.1 + k * 1.7) * 0.13;
      from.set(lx, this.height(lx, lz, t) * amp + 1.1 + bob, lz);
      // In the orbit.
      const angle = a.ringAngle + this.orbitAngle;
      to.set(
        Math.cos(angle) * this.ringNow,
        ORBIT_Y + Math.sin(angle) * this.ringNow,
        0,
      );
      // Lift off the wave first, then glide into place.
      lift.copy(from).setY(from.y + 1.2);
      settle.copy(to).setZ(to.z + 0.8);
      const s = 1 - local;
      const w0 = s * s * s;
      const w1 = 3 * s * s * local;
      const w2 = 3 * s * local * local;
      const w3 = local * local * local;
      a.group.position.set(
        w0 * from.x + w1 * lift.x + w2 * settle.x + w3 * to.x,
        w0 * from.y + w1 * lift.y + w2 * settle.y + w3 * to.y,
        w0 * from.z + w1 * lift.z + w2 * settle.z + w3 * to.z,
      );

      // Hover lifts and grows; a click flips it once round.
      a.hover = damp(a.hover, this.hovered === k ? 1 : 0, 10, dt);
      if (a.flipVelocity !== 0) {
        a.flip += a.flipVelocity * dt;
        a.flipVelocity = damp(a.flipVelocity, 0, 1.8, dt);
        if (Math.abs(a.flipVelocity) < 0.4) {
          const home = Math.round(a.flip / (Math.PI * 2)) * Math.PI * 2;
          a.flip = damp(a.flip, home, 6, dt);
          if (Math.abs(a.flip - home) < 0.002) {
            a.flip = 0;
            a.flipVelocity = 0;
          }
        }
      }
      // Far ones a touch larger, so perspective does not shrink them away.
      const scale =
        lerp((1.4 - a.spot.y * 0.2) * this.waveScale, 1.42, local) *
        (1 + a.hover * 0.14) *
        // Entrance: each logo rises out of the wave in turn.
        Math.max(
          0.0001,
          easeOutBack(clamp01((this.entrance - 0.5 - k * 0.09) / 0.8)),
        );
      a.group.scale.setScalar(scale);
      a.group.position.y += a.hover * 0.18;
      const sway = this.reducedMotion
        ? 0
        : Math.sin(t * 0.6 + k * 2.1) * lerp(0.38, 0.22, local);
      a.group.rotation.set(lerp(-0.18, 0, local), sway + a.flip, 0);
    }
  }

  // ---------------------------------------------------------------- pointer

  private pick(clientX: number, clientY: number) {
    const rect = this.options.host.getBoundingClientRect();
    this.pointer.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets: THREE.Object3D[] = [
      this.markHit,
      ...this.agents.map((a) => a.hit),
    ];
    const hits = this.raycaster.intersectObjects(targets, false);
    if (!hits.length) return -2;
    // The mark's hit sphere is generous. Where it overlaps an agent's, the
    // agent wins unless the pointer is on the mark itself.
    const agent = hits.find((h) => h.object !== this.markHit);
    if (hits[0].object === this.markHit) {
      const center = this.markHit.getWorldPosition(tmp);
      const core = 0.42 * this.rig.scale.x;
      const onMark = this.raycaster.ray.distanceSqToPoint(center) < core * core;
      if (onMark || !agent) return -1;
    }
    return this.agents.findIndex((a) => a.hit === agent?.object);
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const target = this.pick(event.clientX, event.clientY);
    this.drag = {
      id: event.pointerId,
      target,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: performance.now(),
      moved: false,
    };
    this.options.host.style.cursor = "grabbing";
  };

  private onPointerMove = (event: PointerEvent) => {
    const drag = this.drag;
    if (!drag) {
      if (event.pointerType !== "mouse") return;
      const target = this.pick(event.clientX, event.clientY);
      this.hovered = target;
      this.options.host.style.cursor = target >= -1 ? "pointer" : "grab";
      return;
    }
    if (event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.lastX;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastTime) / 1000;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4
    ) {
      drag.moved = true;
      try {
        this.options.host.setPointerCapture(event.pointerId);
      } catch {
        // The pointer may already be gone.
      }
    }
    if (drag.moved) {
      // Wherever the drag starts, it spins Coere and nothing else.
      const v = dx * 0.014;
      this.spin += v;
      this.spinVelocity = damp(this.spinVelocity, v / dt, 18, dt);
    }
    drag.lastX = event.clientX;
    drag.lastTime = now;
  };

  private onPointerUp = (event: PointerEvent) => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved && event.type === "pointerup") {
      // A click on a logo flips it; anywhere else sends Coere round.
      if (drag.target >= 0) {
        this.agents[drag.target].flipVelocity = Math.PI * 4.2;
      } else {
        this.spinVelocity += Math.PI * 3;
      }
    }
    // Let go of a still pointer and Coere simply stops.
    if (drag.moved && performance.now() - drag.lastTime > 80) {
      this.spinVelocity = 0;
    }
    this.drag = null;
    this.options.host.style.cursor = this.hovered >= -1 ? "pointer" : "grab";
  };

  private onPointerLeave = () => {
    if (!this.drag) this.hovered = -2;
  };

  dispose() {
    const host = this.options.host;
    host.removeEventListener("pointerdown", this.onPointerDown);
    host.removeEventListener("pointermove", this.onPointerMove);
    host.removeEventListener("pointerup", this.onPointerUp);
    host.removeEventListener("pointercancel", this.onPointerUp);
    host.removeEventListener("pointerleave", this.onPointerLeave);
    this.headlineObserver?.disconnect();
    // Shared logo assets stay cached for the products scene; drop the rest.
    this.agents.forEach((a) => a.body && a.group.remove(a.body));
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    this.stage.dispose();
  }
}
