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

export type HeroFrame = {
  /** 0 on the wave, 1 once the logos have formed the orbit. */
  morph: number;
};

type Options = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  agents: readonly HeroAgent[];
  getProgress: () => number;
  onFrame?: (frame: HeroFrame) => void;
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
/** Where each agent waits on the wave, as a fraction of the spread. */
const WAVE_SPOTS: Record<string, [number, number]> = {
  ChatGPT: [-1.0, 0.18],
  Claude: [-0.86, -0.5],
  Gemini: [-0.56, -1.02],
  Perplexity: [0.52, -1.02],
  Grok: [0.88, -0.5],
  Copilot: [1.02, 0.14],
  "Meta AI": [0.64, 0.66],
  Kimi: [0.08, 0.8],
  DeepSeek: [-0.56, 0.68],
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
  /** Spot on the wave, in content space. */
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
  private readonly content = new THREE.Group();
  private readonly lowPower = isLowPowerDevice();
  private readonly reducedMotion = prefersReducedMotion();
  private readonly options: Options;

  // The field of cubes.
  private field!: THREE.InstancedMesh;
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
  private yaw = 0;
  private yawVelocity = 0;
  private pitch = 0;
  private pitchTarget = 0;
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
    mode: "scene" | "mark" | "agent";
    agent: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    lastTime: number;
    moved: boolean;
  } = null;
  private hovered = -2;

  constructor(options: Options) {
    this.options = options;
    this.spacing = this.lowPower ? 0.58 : 0.42;
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
    const rim = new THREE.DirectionalLight("#dfe6ff", 1);
    rim.position.set(7, 5, -12);
    this.scene.add(rim);

    this.scene.add(this.content);
    this.buildField();

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
    this.light = new THREE.PointLight("#dbe2ff", 38, 18, 1.5);
    this.rig.add(this.glow, this.mark, this.markHit, this.light);
    this.content.add(this.rig);

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
  }

  // ---------------------------------------------------------------- building

  private buildField() {
    // Cubes nearly touching, so their tops read as one surface.
    const geometry = createTileGeometry({
      half: this.spacing * 0.45,
      shaft: 9,
      roll: this.lowPower ? 2 : 3,
    });
    const { material } = createDatabaseMaterial({
      shadeDepth: this.spacing * 2.2,
      deep: "#9aa9d6",
    });

    // Enough for the widest screen; the visible count is set per layout.
    const max = this.lowPower ? 8000 : 17000;
    this.fieldData = new THREE.InstancedBufferAttribute(
      new Float32Array(max * 4),
      4,
    );
    this.fieldData.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aData", this.fieldData);
    this.field = new THREE.InstancedMesh(geometry, material, max);
    this.field.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.field.receiveShadow = true;
    this.field.frustumCulled = false;
    this.field.count = 0;
    this.scene.add(this.field);

    this.fieldX = new Float32Array(max);
    this.fieldZ = new Float32Array(max);
    this.fieldEdge = new Float32Array(max);
  }

  /**
   * Lays the cubes out in the wedge the camera can see. The field itself
   * never turns: dragging turns the wave and everything on it instead, the
   * way a shape turns on a pin board, so the field only has to cover what
   * the camera sees.
   */
  private layoutField() {
    const s = this.spacing;
    const max = this.fieldX.length;
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

    let n = 0;
    // Near rows first, so if the budget runs out it is the far ones that go.
    for (let j = v1; j >= v0 && n < max; j--) {
      for (let i = u0; i <= u1 && n < max; i++) {
        const u = i * s;
        const v = j * s;
        const x = ca * u + sa * v;
        const z = -sa * u + ca * v;
        if (z > zNear || z < zFar) continue;
        const half = halfAt(z);
        if (Math.abs(x) > half) continue;
        this.fieldX[n] = x;
        this.fieldZ[n] = z;
        // Fade out toward the sides and the far edge.
        const side = smoothstep(half - 5, half, Math.abs(x));
        const far = smoothstep(zFar + 12, zFar, z);
        this.fieldEdge[n] = Math.max(side, far);
        n++;
      }
    }
    this.fieldCount = n;
    this.field.count = n;
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      matrix.makeRotationY(GRID_ANGLE);
      matrix.setPosition(this.fieldX[i], 0, this.fieldZ[i]);
      this.field.setMatrixAt(i, matrix);
    }
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
      this.content.add(group);
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
        stagger: ((Math.sin(ringAngle) + 1) / 2) * 0.22,
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
    this.spread.set(lerp(3.9, 8.6, wide), lerp(7.2, 6.3, wide));

    // Low over the surface, as in a landscape shot.
    this.waveCamera.distance = lerp(44, 40, wide);
    this.waveCamera.elevation = lerp(0.36, 0.25, wide);
    this.waveCamera.anchor = portrait ? 0.62 : 0.6;
    this.waveCamera.target.set(0, 2.6, 0);

    // Fit the orbit between the headline and the bottom of the screen. With
    // the target drawn at `anchor` down the screen, the world height visible
    // above it is 2 * (anchor - headroom) * distance * tan(fov / 2).
    this.ringRadius = 6.2;
    const extent = this.ringRadius + 1.25;
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const anchor = portrait ? 0.58 : 0.6;
    const headroom = portrait ? 0.27 : 0.31;
    const fitV = extent / (2 * (anchor - headroom) * tanV);
    const fitH = extent / (tanV * a * 0.92);
    this.orbitCamera.distance = Math.max(fitV, fitH);
    this.orbitCamera.anchor = anchor;

    this.layoutField();
    (this.dust.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value =
      this.stage.pixelRatio;
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

  /** Height of the wave at a point in content space. */
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
    if (morph >= 0.999) {
      this.field.visible = false;
      return;
    }
    this.field.visible = true;

    // Content space turns with the drag; the field does not.
    const cos = Math.cos(-this.yaw);
    const sin = Math.sin(-this.yaw);
    const yawCos = Math.cos(this.yaw);
    const yawSin = Math.sin(this.yaw);
    const pads = this.pads;
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      const lx = a.spot.x * this.spread.x;
      const lz = a.spot.y * this.spread.y;
      pads[k * 2] = lx * yawCos + lz * yawSin;
      pads[k * 2 + 1] = -lx * yawSin + lz * yawCos;
    }
    const padCount = this.agents.length * 2;
    const padLight = 1 - smoothstep(0, 0.35, morph);
    const matrix = this.field.instanceMatrix.array as Float32Array;
    const data = this.fieldData.array as Float32Array;

    for (let i = 0; i < this.fieldCount; i++) {
      const x = this.fieldX[i];
      const z = this.fieldZ[i];
      const lx = x * cos + z * sin;
      const lz = -x * sin + z * cos;
      const d2 = lx * lx + lz * lz;
      const d = Math.sqrt(d2);

      // Sink in a ring that starts under Coere and runs outward.
      const start = Math.min(d / 34, 1) * 0.45;
      const sink = clamp01((morph - start) / 0.5);
      const h = this.height(lx, lz, t) * amp;
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
      data[o] = 0;
      // Crests stay white; slopes and the far field fall into blue, as if
      // the only light were Coere's.
      const spot = Math.exp(-d2 / (2 * 12 * 12));
      data[o + 1] = Math.min(
        1,
        smoothstep(2.8, -1.2, h) * 0.9 + (1 - spot) * 0.3,
      );
      data[o + 2] = Math.max(this.fieldEdge[i], smoothstep(0.05, 0.55, sink));
      data[o + 3] = Math.min(1, pool * 0.55);
    }
    this.field.instanceMatrix.needsUpdate = true;
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

    // Drag: yaw with inertia, pitch springs toward where it was left.
    if (!this.drag) {
      this.yaw += this.yawVelocity * dt;
      this.yawVelocity *= Math.exp(-3.2 * dt);
    }
    this.pitch = damp(this.pitch, this.pitchTarget, 8, dt);
    this.content.rotation.y = this.yaw;

    this.updateCamera(m);
    this.updateField(t, amp, m);
    this.updateRig(t, dt, m, amp);
    this.updateAgents(t, dt, m, amp);
    this.orbitAngle -= dt * 0.1 * motion * smoothstep(0.6, 1, m);

    const dustMaterial = this.dust.material as THREE.ShaderMaterial;
    dustMaterial.uniforms.uTime.value = elapsed * motion;

    this.stage.renderer.render(this.scene, this.camera);
    this.options.onFrame?.({ morph: m });
  }

  private updateCamera(m: number) {
    const e = easeInOutCubic(m);
    const A = this.waveCamera;
    const B = this.orbitCamera;
    const target = tmp.copy(A.target).lerp(B.target, e);
    // Entrance: the camera glides in and settles from a little higher up.
    const arriving = 1 - easeOutCubic(clamp01(this.entrance / 2.6));
    const elevation =
      lerp(A.elevation, B.elevation, e) + this.pitch + arriving * 0.16;
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
    this.key.position.set(target.x - 6, target.y + 20, target.z + 7);
  }

  private updateRig(t: number, dt: number, m: number, amp: number) {
    const e = easeInOutCubic(m);
    const bob = Math.sin(t * 0.9) * 0.12;
    const waveY = this.height(0, 0, t) * amp + 2 + bob;
    this.rig.position.set(0, lerp(waveY, ORBIT_Y + bob * 0.5, e), 0);
    this.rig.scale.setScalar(lerp(2.6, 3.2, e));

    // Spin: free on the wave; in the orbit it settles facing out with a sway.
    if (!this.drag || this.drag.mode !== "mark") {
      const cruise = this.reducedMotion ? 0 : lerp(0.42, 0, e);
      this.spinVelocity = damp(this.spinVelocity, cruise, 1.2, dt);
      if (e > 0.5 && Math.abs(this.spinVelocity) < 0.6) {
        const home = Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2;
        const sway = this.reducedMotion ? 0 : Math.sin(t * 0.55) * 0.32;
        this.spin = damp(this.spin, home + sway, 2.2 * (e - 0.5) * 2, dt);
      }
    }
    this.spin += this.spinVelocity * dt;
    // Face the camera whatever the scene's yaw, plus the spin.
    this.mark.rotation.set(Math.sin(t * 0.7) * 0.06, this.spin - this.yaw, 0);
    this.glow.material.opacity = lerp(0.55, 0.45, e);
    this.light.intensity = lerp(38, 6, e);
  }

  private updateAgents(t: number, dt: number, m: number, amp: number) {
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      const local = easeInOutCubic(clamp01((m - a.stagger) / (1 - 0.22)));

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
        lerp(1.4 - a.spot.y * 0.2, 1.42, local) *
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
      a.group.rotation.set(lerp(-0.18, 0, local), -this.yaw + sway + a.flip, 0);
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
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    if (!hit) return -2;
    if (hit.object === this.markHit) return -1;
    return this.agents.findIndex((a) => a.hit === hit.object);
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const target = this.pick(event.clientX, event.clientY);
    this.drag = {
      id: event.pointerId,
      mode: target === -1 ? "mark" : target >= 0 ? "agent" : "scene",
      agent: target,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      moved: false,
    };
    this.yawVelocity = 0;
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
    const dy = event.clientY - drag.lastY;
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
      if (drag.mode === "mark") {
        // Spin Coere itself.
        const v = dx * 0.014;
        this.spin += v;
        this.spinVelocity = damp(this.spinVelocity, v / dt, 18, dt);
      } else {
        const v = dx * 0.0055;
        this.yaw += v;
        this.yawVelocity = damp(this.yawVelocity, v / dt, 18, dt);
        this.pitchTarget = THREE.MathUtils.clamp(
          this.pitchTarget + dy * 0.0025,
          -0.12,
          0.22,
        );
      }
    }
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
  };

  private onPointerUp = (event: PointerEvent) => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved && event.type === "pointerup") {
      if (drag.mode === "agent" && drag.agent >= 0) {
        this.agents[drag.agent].flipVelocity = Math.PI * 4.2;
      } else if (drag.mode === "mark") {
        this.spinVelocity += Math.PI * 3;
      }
    }
    // Let go of a still pointer and the scene simply stops.
    if (performance.now() - drag.lastTime > 80) {
      this.yawVelocity = 0;
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
    // Shared logo assets stay cached for the products scene; drop the rest.
    this.agents.forEach((a) => a.body && a.group.remove(a.body));
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    this.stage.dispose();
  }
}
