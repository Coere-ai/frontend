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
  hash,
  isLowPowerDevice,
  lerp,
  prefersReducedMotion,
  smoothstep,
} from "./core";
import { createDatabaseGeometry, createDatabaseMaterial } from "./database";
import { FlowLine, createDust } from "./flow-line";
import { coereMaterial, coereMarkGeometry, loadLogo } from "./logos";

export type HeroAgent = { name: string; logo: string };

export type HeroFrame = {
  /** Scene rotation from dragging, radians. */
  yaw: number;
  pitch: number;
  /** Wave amplitude, 1 at rest, 0 once the field has gone. */
  amp: number;
  /** Smoothed frame time in ms. */
  ms: number;
  /** 0 on the wave, 1 once the logos have formed the orbit. */
  morph: number;
  /** Where the Coere mark is on screen, in CSS pixels. */
  anchor: { x: number; y: number; radius: number };
  /** The logo under the pointer, and where its label goes. */
  hover: { name: string; x: number; y: number } | null;
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
  line: FlowLine;
  /** Spot on the wave, in content space. */
  spot: THREE.Vector2;
  ringAngle: number;
  hover: number;
  flip: number;
  flipVelocity: number;
  stagger: number;
};

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const tmpD = new THREE.Vector3();
const packetMatrix = new THREE.Matrix4();

export class HeroScene {
  readonly ready: Promise<void>;

  private readonly stage: Stage;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  private readonly content = new THREE.Group();
  private readonly lowPower = isLowPowerDevice();
  private readonly reducedMotion = prefersReducedMotion();
  private readonly options: Options;

  // Field of database columns, in three levels of detail by distance.
  private tiers: {
    mesh: THREE.InstancedMesh;
    reach: number;
    start: number;
    count: number;
  }[] = [];
  private fieldX = new Float32Array(0);
  private fieldZ = new Float32Array(0);
  private fieldEdge = new Float32Array(0);
  private fieldSeed = new Float32Array(0);
  private fieldCount = 0;
  private readonly spacing: number;

  // Coere at the peak.
  private readonly rig = new THREE.Group();
  private readonly mark: THREE.Mesh;
  private readonly markMaterial: THREE.MeshPhysicalMaterial;
  private readonly markHit: THREE.Mesh;
  private readonly halo: THREE.Group;
  private readonly beads: THREE.Group[] = [];
  private readonly glow: THREE.Sprite;
  private readonly light: THREE.PointLight;

  private readonly agents: Agent[] = [];
  private packets!: THREE.InstancedMesh;
  private readonly orbitRing: THREE.Mesh;
  private readonly orbitDots: THREE.Points;
  private readonly dust: THREE.Points;
  private readonly key: THREE.DirectionalLight;

  // Layout, set on resize.
  private aspect = 1;
  private spread = new THREE.Vector2(8.4, 6.4);
  private waveCamera = {
    target: new THREE.Vector3(0, 3.1, 0),
    elevation: 0.36,
    distance: 25,
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
  private arrival = 0;
  private ms = 16.7;
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
  private readonly packetSpots: Float32Array;
  private readonly padSpots: Float32Array;

  constructor(options: Options) {
    this.options = options;
    this.spacing = this.lowPower ? 0.74 : 0.56;
    this.packetSpots = new Float32Array(options.agents.length * 4);
    this.padSpots = new Float32Array(options.agents.length * 2);

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
    this.scene.fog = new THREE.Fog(HERO_BACKGROUND, 34, 78);
    this.scene.environment = createEnvironment(renderer);
    this.scene.environmentIntensity = 0.55;

    // High key light so the tops of the columns catch it and their walls fall
    // into shade: that contrast is what makes the swell read.
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#aab9e4", 0.6));
    this.key = new THREE.DirectionalLight("#ffffff", 2.8);
    this.key.position.set(-6, 20, 7);
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
    const rim = new THREE.DirectionalLight("#dfe6ff", 1.1);
    rim.position.set(7, 5, -12);
    this.scene.add(rim);

    this.scene.add(this.content);

    this.buildField();

    // Coere, with its halo rings and the light it casts on the field.
    this.markMaterial = coereMaterial();
    this.mark = new THREE.Mesh(coereMarkGeometry(), this.markMaterial);
    this.mark.castShadow = true;
    this.markHit = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 12, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    this.halo = this.buildHalo();
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(BRAND[500]),
        transparent: true,
        depthWrite: false,
        opacity: 0.6,
      }),
    );
    this.glow.scale.setScalar(3.2);
    this.glow.renderOrder = 1;
    this.light = new THREE.PointLight(BRAND[500], 26, 16, 1.7);
    this.rig.add(this.glow, this.mark, this.markHit, this.halo, this.light);
    this.content.add(this.rig);

    // The orbit the agents settle into.
    this.orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.0032, 8, 220),
      new THREE.MeshStandardMaterial({
        color: BRAND[400],
        emissive: BRAND[500],
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0,
        roughness: 0.3,
      }),
    );
    this.orbitDots = this.buildOrbitDots();
    this.content.add(this.orbitRing, this.orbitDots);

    this.dust = createDust(
      this.lowPower ? 160 : 360,
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
    const radius = this.spacing * 0.4;
    const shape = { radius, disk: radius * 0.92, shaft: 10 };
    const { material } = createDatabaseMaterial({ shadeDepth: 2.4 });

    // Enough for the widest screen; the visible count is set per layout.
    const max = this.lowPower ? 5200 : 10000;
    const make = (
      geometry: THREE.BufferGeometry,
      count: number,
      reach: number,
    ) => {
      const data = new THREE.InstancedBufferAttribute(
        new Float32Array(count * 4),
        4,
      );
      data.setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute("aData", data);
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.count = 0;
      this.scene.add(mesh);
      return { mesh, reach, start: 0, count: 0 };
    };
    // `reach` is how far beyond the camera's target each level is used.
    this.tiers = [
      make(
        createDatabaseGeometry({ ...shape, segments: this.lowPower ? 10 : 14 }),
        Math.round(max * 0.45),
        3,
      ),
      make(
        createDatabaseGeometry({ ...shape, segments: 9, low: true }),
        Math.round(max * 0.45),
        16,
      ),
      make(
        createDatabaseGeometry({
          ...shape,
          segments: 6,
          low: true,
          plain: true,
        }),
        max,
        Infinity,
      ),
    ];

    this.fieldX = new Float32Array(max);
    this.fieldZ = new Float32Array(max);
    this.fieldEdge = new Float32Array(max);
    this.fieldSeed = new Float32Array(max);
  }

  /**
   * Lays the columns out in the wedge the camera can see. The field itself
   * never turns: dragging turns the wave and everything on it instead, and
   * since every column is round nobody can tell, so the field can stay just
   * as wide as the view. Rows run near to far, so each level of detail gets
   * one contiguous run of columns.
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
    const lowRay = A.elevation + halfFov + 0.12;
    const zNear = Math.min(camZ - 3, camZ - camY / Math.tan(lowRay) + 2);
    const zFar = -40;
    let n = 0;
    let tier = 0;
    this.tiers.forEach((t) => {
      t.start = 0;
      t.count = 0;
    });
    for (let row = 0; ; row++) {
      const z = zNear - row * s;
      if (z < zFar) break;
      const reach = Math.hypot(camZ - z, camY) - A.distance;
      while (tier < this.tiers.length - 1 && reach > this.tiers[tier].reach) {
        tier++;
        this.tiers[tier].start = n;
      }
      const half = (camZ - z) * tanH * 1.12 + 2.5;
      const cols = Math.floor(half / s);
      // Offset alternate rows half a step so the lattice reads as a weave.
      const shift = row % 2 ? s / 2 : 0;
      for (let c = -cols; c <= cols && n < max; c++) {
        const current = this.tiers[tier];
        if (current.count >= current.mesh.instanceMatrix.count) break;
        const x = c * s + shift;
        this.fieldX[n] = x;
        this.fieldZ[n] = z;
        // Fade out toward the sides and the far edge.
        const side = smoothstep(half - 5, half, Math.abs(x));
        const far = smoothstep(zFar + 11, zFar, z);
        this.fieldEdge[n] = Math.max(side, far);
        this.fieldSeed[n] = hash(n * 0.731 + x * 3.1 + z * 1.7);
        current.count++;
        n++;
      }
    }
    this.fieldCount = n;

    const matrix = new THREE.Matrix4();
    for (const t of this.tiers) {
      t.mesh.count = t.count;
      for (let j = 0; j < t.count; j++) {
        const i = t.start + j;
        t.mesh.setMatrixAt(
          j,
          matrix.makeTranslation(this.fieldX[i], 0, this.fieldZ[i]),
        );
      }
      t.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  private buildHalo() {
    const halo = new THREE.Group();
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1,
      emissive: BRAND[200],
      emissiveIntensity: 0.25,
    });
    const beadMaterial = new THREE.MeshStandardMaterial({
      color: BRAND[500],
      emissive: BRAND[500],
      emissiveIntensity: 1,
      roughness: 0.3,
    });
    // Two tilted orbits, wide enough to pass round the mark, not through it,
    // each with a bead riding it.
    const orbits: [number, number, number, number][] = [
      [1.14, 0.008, Math.PI / 2 - 0.62, 0.32],
      [1.3, 0.005, Math.PI / 2 - 0.22, -0.48],
    ];
    for (const [radius, tube, tiltX, tiltZ] of orbits) {
      const frame = new THREE.Group();
      frame.rotation.set(tiltX, 0, tiltZ);
      frame.add(
        new THREE.Mesh(
          new THREE.TorusGeometry(radius, tube, 10, 200),
          ringMaterial,
        ),
      );
      const pivot = new THREE.Group();
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 12),
        beadMaterial,
      );
      bead.position.x = radius;
      pivot.add(bead);
      frame.add(pivot);
      this.beads.push(pivot);
      halo.add(frame);
    }
    return halo;
  }

  private buildOrbitDots() {
    const count = 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(a);
      positions[i * 3 + 1] = Math.sin(a);
      positions[i * 3 + 2] = 0;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: BRAND[300],
      size: 3,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    return new THREE.Points(geometry, material);
  }

  private async buildAgents() {
    const list = this.options.agents;
    const packetGeometry = new THREE.SphereGeometry(1, 12, 10);
    const packetMaterial = new THREE.MeshStandardMaterial({
      color: BRAND[500],
      emissive: BRAND[500],
      emissiveIntensity: 0.9,
      roughness: 0.25,
    });
    this.packets = new THREE.InstancedMesh(
      packetGeometry,
      packetMaterial,
      list.length * 2,
    );
    this.packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.packets.frustumCulled = false;
    this.content.add(this.packets);

    list.forEach((info, k) => {
      const group = new THREE.Group();
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 12, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      group.add(hit);
      const line = new FlowLine({ seed: k * 0.37, width: 0.042 });
      this.content.add(line.mesh, group);
      const spot = WAVE_SPOTS[info.name] ?? [Math.cos(k), Math.sin(k)];
      const ringIndex = Math.max(0, RING_ORDER.indexOf(info.name));
      this.agents.push({
        name: info.name,
        group,
        body: null,
        hit,
        line,
        spot: new THREE.Vector2(spot[0], spot[1]),
        ringAngle: Math.PI / 2 - (ringIndex / list.length) * Math.PI * 2,
        hover: 0,
        flip: 0,
        flipVelocity: 0,
        // Far ones lift first, so nothing crosses in front of anything.
        stagger: clamp01((spot[1] + 1.1) / 2.2) * 0.22,
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
    this.camera.fov = portrait ? 42 : a < 1.3 ? 35 : 30;
    this.camera.aspect = a;

    // Spread the agents to the screen: wide on desktop, deep on phones.
    const wide = smoothstep(0.55, 1.6, a);
    this.spread.set(lerp(3.9, 8.6, wide), lerp(7.2, 6.3, wide));

    this.waveCamera.distance = lerp(36, 31, wide);
    this.waveCamera.elevation = lerp(0.46, 0.34, wide);
    this.waveCamera.anchor = portrait ? 0.62 : 0.6;
    this.waveCamera.target.set(0, 3.2, 0);

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
    const d2 = x * x + z * z;
    const d = Math.sqrt(d2);
    // One long swell rolling diagonally through the center, the ground
    // falling away on either side of it.
    const across = -x * 0.5 + z * 0.866;
    const along = x * 0.866 + z * 0.5;
    const ridge =
      3 *
      (Math.exp(-(across * across) / (2 * 7 * 7)) - 0.3) *
      (0.85 + 0.15 * Math.sin(along * 0.15 - t * 0.4));
    // The peak Coere stands on.
    const peak = 1.8 * Math.exp(-d2 / (2 * 2.8 * 2.8));
    // Rings moving out from the peak.
    const ripple = 0.18 * Math.sin(d - t * 1.6) * Math.exp(-d / 12);
    const swell =
      0.45 * Math.sin(x * 0.11 + t * 0.3) * Math.cos(z * 0.09 - t * 0.22);
    return ridge + peak + ripple + swell;
  }

  private updateField(t: number, amp: number, morph: number) {
    const visible = morph < 0.999;
    for (const tier of this.tiers)
      tier.mesh.visible = visible && tier.count > 0;
    if (!visible) return;

    const cos = Math.cos(-this.yaw);
    const sin = Math.sin(-this.yaw);

    // Packets running between each agent and the center, and the pad of
    // light under each agent, all in field space.
    const yawCos = Math.cos(this.yaw);
    const yawSin = Math.sin(this.yaw);
    const packets = this.packetSpots;
    const pads = this.padSpots;
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      const lx = a.spot.x * this.spread.x;
      const lz = a.spot.y * this.spread.y;
      const wx = lx * yawCos + lz * yawSin;
      const wz = -lx * yawSin + lz * yawCos;
      pads[k * 2] = wx;
      pads[k * 2 + 1] = wz;
      const inward = (t * 0.32 + k * 0.137) % 1;
      const outward = (t * 0.27 + k * 0.291 + 0.5) % 1;
      packets[k * 4] = wx * (1 - inward);
      packets[k * 4 + 1] = wz * (1 - inward);
      packets[k * 4 + 2] = wx * outward;
      packets[k * 4 + 3] = wz * outward;
    }
    const agentCount = this.agents.length;
    const lift = 1 - smoothstep(0, 0.35, morph);

    for (const tier of this.tiers) {
      const matrix = tier.mesh.instanceMatrix.array as Float32Array;
      const dataAttribute = tier.mesh.geometry.getAttribute(
        "aData",
      ) as THREE.InstancedBufferAttribute;
      const data = dataAttribute.array as Float32Array;
      for (let j = 0; j < tier.count; j++) {
        const i = tier.start + j;
        const x = this.fieldX[i];
        const z = this.fieldZ[i];
        const lx = x * cos + z * sin;
        const lz = -x * sin + z * cos;
        const d = Math.sqrt(lx * lx + lz * lz);

        // Sink in a ring that starts under Coere and runs outward.
        const start = Math.min(d / 34, 1) * 0.45;
        const sink = clamp01((morph - start) / 0.5);
        const h = this.height(lx, lz, t) * amp;
        const y = h - sink * sink * 11;

        // Energy: crests leaving the center, packets, pads, the odd twinkle.
        let e = 0.04;
        const crest = Math.sin(d * 1.0 - t * 1.6);
        if (crest > 0.55)
          e += Math.pow((crest - 0.55) / 0.45, 3) * 0.6 * Math.exp(-d / 9);
        for (let p = 0; p < agentCount * 4; p += 2) {
          const dx = x - packets[p];
          const dz = z - packets[p + 1];
          const q = dx * dx + dz * dz;
          if (q < 1.8) {
            const f = 1 - q / 1.8;
            e += f * f * 1.3;
          }
        }
        let glow = 0.9 * Math.exp(-(d * d) / (2 * 2.8 * 2.8));
        for (let p = 0; p < agentCount * 2; p += 2) {
          const dx = x - pads[p];
          const dz = z - pads[p + 1];
          const q = dx * dx + dz * dz;
          if (q < 1.5) {
            const f = 1 - q / 1.5;
            e += f * 1.4 * lift;
            glow += f * 0.6 * lift;
          }
        }
        const seed = this.fieldSeed[i];
        if (hash(seed * 91.7 + Math.floor(t * 1.4 + seed * 13)) > 0.988)
          e += 0.75;

        matrix[j * 16 + 13] = y;
        const o = j * 4;
        data[o] = e * (1 - sink);
        // Blue deepens down the slopes into the troughs.
        data[o + 1] = smoothstep(2.9, -1.2, h);
        data[o + 2] = Math.max(this.fieldEdge[i], smoothstep(0.05, 0.55, sink));
        data[o + 3] = glow;
      }
      tier.mesh.instanceMatrix.needsUpdate = true;
      dataAttribute.needsUpdate = true;
    }
  }

  // ---------------------------------------------------------------- frame

  private frame(dt: number, elapsed: number) {
    const motion = this.reducedMotion ? 0 : 1;
    this.time += dt * motion;
    const t = this.time;
    if (dt > 0) this.ms = damp(this.ms, dt * 1000, 3, dt);
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

    // The orbit drifts round once the agents are on it.
    this.orbitAngle -= dt * 0.1 * motion * smoothstep(0.6, 1, m);
    const ringIn = smoothstep(0.55, 1, m);
    this.orbitRing.position.set(0, ORBIT_Y, 0);
    this.orbitRing.scale.setScalar(this.ringNow);
    (this.orbitRing.material as THREE.MeshStandardMaterial).opacity =
      ringIn * 0.8;
    this.orbitRing.visible = ringIn > 0.001;
    this.orbitDots.position.set(0, ORBIT_Y, 0);
    this.orbitDots.scale.setScalar(this.ringNow * 1.16);
    this.orbitDots.rotation.z = this.orbitAngle * 0.5;
    (this.orbitDots.material as THREE.PointsMaterial).opacity = ringIn * 0.55;
    this.orbitDots.visible = ringIn > 0.001;

    const dustMaterial = this.dust.material as THREE.ShaderMaterial;
    dustMaterial.uniforms.uTime.value = elapsed * motion;

    this.stage.renderer.render(this.scene, this.camera);
    this.report(amp);
  }

  private updateCamera(m: number) {
    const e = easeInOutCubic(m);
    const A = this.waveCamera;
    const B = this.orbitCamera;
    const target = tmp.copy(A.target).lerp(B.target, e);
    // Entrance: the camera glides in and settles from a little higher up.
    const settle = 1 - easeOutCubic(clamp01(this.entrance / 2.6));
    const elevation =
      lerp(A.elevation, B.elevation, e) + this.pitch + settle * 0.16;
    const distance = lerp(A.distance, B.distance, e) + settle * 9;
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
    const waveY = this.height(0, 0, t) * amp + 1.75 + bob;
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

    this.beads.forEach(
      (pivot, i) => (pivot.rotation.z = t * (i ? -0.7 : 0.95) + i * 2),
    );
    this.arrival = Math.max(0, this.arrival - dt * 2.5);
    this.markMaterial.emissiveIntensity = 0.22 + this.arrival * 0.35;
    this.glow.material.opacity = 0.55 + this.arrival * 0.15;
    this.light.intensity = lerp(26, 6, e) * (1 + this.arrival * 0.3);
  }

  private updateAgents(t: number, dt: number, m: number, amp: number) {
    const n = this.agents.length;
    const center = this.rig.position;
    let arrived = false;

    for (let k = 0; k < n; k++) {
      const a = this.agents[k];
      const local = easeInOutCubic(clamp01((m - a.stagger) / (1 - 0.22)));

      // On the wave.
      const lx = a.spot.x * this.spread.x;
      const lz = a.spot.y * this.spread.y;
      const bob = Math.sin(t * 1.1 + k * 1.7) * 0.13;
      const from = tmpA.set(lx, this.height(lx, lz, t) * amp + 1.05 + bob, lz);
      // In the orbit.
      const angle = a.ringAngle + this.orbitAngle;
      const to = tmpD.set(
        Math.cos(angle) * this.ringNow,
        ORBIT_Y + Math.sin(angle) * this.ringNow,
        0,
      );
      // Lift off the wave first, then glide into place.
      const c1 = tmpB.copy(from).setY(from.y + 1.8);
      const c2 = tmpC.copy(to).setZ(to.z + 2.2);
      const s = 1 - local;
      a.group.position.set(
        s * s * s * from.x +
          3 * s * s * local * c1.x +
          3 * s * local * local * c2.x +
          local * local * local * to.x,
        s * s * s * from.y +
          3 * s * s * local * c1.y +
          3 * s * local * local * c2.y +
          local * local * local * to.y,
        s * s * s * from.z +
          3 * s * s * local * c1.z +
          3 * s * local * local * c2.z +
          local * local * local * to.z,
      );

      // Hover lifts and grows; a click flips it once round.
      const hovered = this.hovered === k;
      a.hover = damp(a.hover, hovered ? 1 : 0, 10, dt);
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

      // The stream between the agent and Coere.
      const line = a.line;
      tmp2.copy(center).sub(a.group.position).normalize();
      line.p0.copy(a.group.position).addScaledVector(tmp2, 0.55 * scale);
      line.p3.copy(center).addScaledVector(tmp2, -0.4);
      const outward = tmp.copy(a.group.position).sub(center);
      outward.y = 0;
      outward.normalize();
      const arcP1 = tmpB.copy(line.p0).setY(line.p0.y + 2.6);
      const arcP2 = tmpC
        .copy(line.p3)
        .addScaledVector(outward, 2.6)
        .setY(line.p3.y + 0.9);
      const straightP1 = tmpA.copy(line.p0).lerp(line.p3, 1 / 3);
      const straightP2 = tmpD.copy(line.p0).lerp(line.p3, 2 / 3);
      line.p1.copy(arcP1).lerp(straightP1, local);
      line.p2.copy(arcP2).lerp(straightP2, local);
      line.time = t;
      line.opacity = lerp(0.9, 0.7, local);
      line.highlight = a.hover;

      // Packets riding the stream, in and back out.
      const inward = (t * 0.28 + k * 0.113) % 1;
      const outwardT = (t * 0.22 + k * 0.271 + 0.5) % 1;
      if (inward > 0.97) arrived = true;
      line.pointAt(inward, tmp);
      const sizeIn = 0.07 * Math.sin(inward * Math.PI) + 0.01;
      packetMatrix.makeScale(sizeIn, sizeIn, sizeIn).setPosition(tmp);
      this.packets.setMatrixAt(k * 2, packetMatrix);
      line.pointAt(1 - outwardT, tmp);
      const sizeOut = 0.05 * Math.sin(outwardT * Math.PI) + 0.008;
      packetMatrix.makeScale(sizeOut, sizeOut, sizeOut).setPosition(tmp);
      this.packets.setMatrixAt(k * 2 + 1, packetMatrix);
    }
    if (this.packets) this.packets.instanceMatrix.needsUpdate = true;
    if (arrived && !this.reducedMotion)
      this.arrival = Math.min(1, this.arrival + 0.5);
  }

  private report(amp: number) {
    if (!this.options.onFrame) return;
    tmp.copy(this.rig.position);
    this.content.localToWorld(tmp);
    tmp.project(this.camera);
    const w = this.stage.width;
    const h = this.stage.height;
    // Size of the mark on screen, from a point one mark-radius to its side.
    tmp2.copy(this.rig.position);
    tmp2.y += this.rig.scale.y * 0.5;
    this.content.localToWorld(tmp2);
    tmp2.project(this.camera);
    const radius = Math.abs(tmp2.y - tmp.y) * 0.5 * h;
    let hover: HeroFrame["hover"] = null;
    if (this.hovered >= 0 && !this.drag) {
      const agent = this.agents[this.hovered];
      tmp2.copy(agent.group.position);
      tmp2.y -= agent.group.scale.y * 0.62;
      this.content.localToWorld(tmp2);
      tmp2.project(this.camera);
      hover = {
        name: agent.name,
        x: (tmp2.x * 0.5 + 0.5) * w,
        y: (-tmp2.y * 0.5 + 0.5) * h,
      };
    }
    this.options.onFrame({
      hover,
      yaw: this.yaw,
      pitch: this.pitch,
      amp: amp * (1 - this.morph),
      ms: this.ms,
      morph: this.morph,
      anchor: {
        x: (tmp.x * 0.5 + 0.5) * w,
        y: (-tmp.y * 0.5 + 0.5) * h,
        radius,
      },
    });
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
    this.agents.forEach((a) => a.line.dispose());
    // Shared logo assets stay cached for the products scene; drop the rest.
    this.agents.forEach((a) => a.body && a.group.remove(a.body));
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    this.stage.dispose();
  }
}
