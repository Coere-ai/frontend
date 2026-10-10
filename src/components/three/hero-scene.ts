import * as THREE from "three";
import {
  BRAND,
  Spin,
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
import { createDatabaseMaterial, createTileGeometry } from "./database";
import { createDust } from "./dust";
import { coereMaterial, coereMarkGeometry, loadLogo } from "./logos";

export type HeroAgent = { name: string; logo: string };

type Options = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  agents: readonly HeroAgent[];
  /** The headline over the scene; the picture is framed to stay below it. */
  headline?: HTMLElement;
  /** The GPU dropped the scene for good; show the flat page instead. */
  onFail?: () => void;
};

export const HERO_BACKGROUND = "#f2f5fc";

/**
 * How far the cube lattice is turned from the camera's line of sight. Past
 * the half-width of the view, and short of 90 degrees minus it, so neither
 * row direction ever lines up with a sight line on any screen shape.
 */
const GRID_ANGLE = 0.6;
/**
 * Where each agent floats on the wave, as a fraction of the spread: an even
 * ring on screen around Coere, so nothing bunches up. The wave runs from near
 * left to far right, so the left of the ring sits deeper.
 */
const WAVE_SPOTS: Record<string, [number, number]> = {
  Perplexity: [0.5, -0.6],
  Grok: [0.99, -0.28],
  Copilot: [1.08, 0.06],
  "Meta AI": [0.66, 0.55],
  Kimi: [0, 0.83],
  DeepSeek: [-0.62, 0.84],
  ChatGPT: [-0.99, 0.56],
  Claude: [-1.07, -0.92],
  Gemini: [-0.52, -1.55],
};

type Agent = {
  name: string;
  group: THREE.Group;
  body: THREE.Mesh | null;
  hit: THREE.Mesh;
  /** Spot on the wave. */
  spot: THREE.Vector2;
  hover: number;
  flip: number;
  flipVelocity: number;
};

const tmp = new THREE.Vector3();

/** A vertical gradient for the background: `top` down to past halfway, then
 * easing to `bottom` at the foot of the screen. */
function createSkyTexture(top: string, bottom: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.55, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A copy of a logo's material that dissolves into white at the very foot of
 * the screen, as the field does there, so on the shortest screens a logo at
 * the front of the wave melts away instead of being cut by the section's
 * edge. A copy, because the logos are shared with Products.
 */
function fadeAtFoot(
  material: THREE.MeshPhysicalMaterial,
  viewHeight: { value: number },
) {
  const faded = material.clone();
  faded.onBeforeCompile = (shader) => {
    shader.uniforms.uViewHeight = viewHeight;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uViewHeight;`,
      )
      .replace(
        "#include <fog_fragment>",
        `#include <fog_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0),
          1.0 - smoothstep(0.0, 0.07, gl_FragCoord.y / uViewHeight));`,
      );
  };
  faded.customProgramCacheKey = () => "logo-foot";
  return faded;
}

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
  /** The field's drawing-buffer height, for its fade at the foot. */
  private fieldViewHeight!: { value: number };
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

  // Motion state.
  private time = 0;
  private readonly spin = new Spin();
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

    // Light, airy studio, paling to the white of the page at the foot.
    this.scene.background = createSkyTexture(HERO_BACKGROUND, "#ffffff");
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
      const { material, viewHeight } = createDatabaseMaterial({
        // Shallow, so the step between neighbours reaches the deep tone and
        // every cube shows a lit top over a shaded side.
        shadeDepth: this.spacing * 1.0,
        deep: "#97a6d4",
      });
      material.roughness = 0.6;
      this.fieldMaterial = material;
      this.fieldViewHeight = viewHeight;
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
      this.agents.push({
        name: info.name,
        group,
        body: null,
        hit,
        spot: new THREE.Vector2(spot[0], spot[1]),
        hover: 0,
        flip: 0,
        flipVelocity: 0,
      });
    });

    const assets = await Promise.allSettled(
      list.map((info) => loadLogo(info.logo)),
    );
    const bodies = new THREE.Group();
    assets.forEach((result, k) => {
      if (result.status !== "fulfilled") return;
      const body = new THREE.Mesh(
        result.value.geometry,
        fadeAtFoot(result.value.material, this.fieldViewHeight),
      );
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
    // wave stay under the headline: riding the swells, they reach up to 0.21
    // of the screen above the target. Capped, so the agents in front stay on
    // screen; on the very shortest, they dissolve into the foot with the
    // field rather than meet the edge.
    this.waveCamera.anchor = Math.min(
      0.72,
      Math.max(portrait ? 0.56 : 0.6, clear + 0.21),
    );
    this.waveCamera.target.set(0, 2.6, 0);

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

  /**
   * Height of the wave at a point. `motion` scales everything that moves:
   * 1 for the surface itself, 0 for where it rests on average.
   */
  private height(x: number, z: number, t: number, motion = 1) {
    // One long swell running from near left to far right, its crest passing
    // just behind Coere, a trough in front of it and a gentler swell behind.
    const across = 0.42 * x + 0.91 * z;
    const along = 0.91 * x - 0.42 * z;
    // The crest meanders a little, and the meander runs along it.
    const c = across + 1.2 + motion * 0.3 * Math.sin(along * 0.16 - t * 0.42);
    const crest =
      3.4 *
      Math.exp(-(c * c) / (2 * 3.4 * 3.4)) *
      (0.78 + motion * 0.22 * Math.sin(along * 0.14 - t * 0.5));
    const b = across + 13 + motion * 1.4 * Math.sin(along * 0.1 + t * 0.3);
    const back = 1.6 * Math.exp(-(b * b) / (2 * 5 * 5));
    const f = across - 9;
    const front = -0.9 * Math.exp(-(f * f) / (2 * 5 * 5));
    // Long, low swells rolling in from the back toward the viewer: full in
    // the far field, gentle by the time they pass under Coere.
    const far = 0.35 + 0.65 * smoothstep(1, -12, across);
    const roll =
      motion * 0.36 * far * Math.sin(across * 0.38 - t * 0.8 + along * 0.06);
    const swell =
      motion *
      0.3 *
      Math.sin(x * 0.1 + t * 0.25) *
      Math.cos(z * 0.09 - t * 0.2);
    return crest + back + front + roll + swell - 0.6;
  }

  /**
   * Where things floating on the wave ride: with the swells, but only part
   * of the way, so neighbours never drift into one another.
   */
  private ride(x: number, z: number, t: number) {
    const rest = this.height(x, z, t, 0);
    return rest + (this.height(x, z, t) - rest) * 0.6;
  }

  private updateField(t: number) {
    const pads = this.pads;
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      pads[k * 2] = a.spot.x * this.spread.x;
      pads[k * 2 + 1] = a.spot.y * this.spread.y;
    }
    const padCount = this.agents.length * 2;
    const matrix = this.field.instanceMatrix.array as Float32Array;
    const data = this.fieldData.array as Float32Array;

    for (let i = 0; i < this.fieldCount; i++) {
      const x = this.fieldX[i];
      const z = this.fieldZ[i];
      const d2 = x * x + z * z;
      const h = this.height(x, z, t);
      matrix[i * 16 + 13] = h;

      // A soft pool of light under each agent.
      let pool = 0;
      for (let p = 0; p < padCount; p += 2) {
        const dx = x - pads[p];
        const dz = z - pads[p + 1];
        const q = dx * dx + dz * dz;
        if (q < 2.2) pool += 1 - q / 2.2;
      }

      const o = i * 4;
      // Crests stay white; slopes and the far field fall into blue, as if
      // the only light were Coere's.
      const spot = Math.exp(-d2 / (2 * 12 * 12));
      data[o + 1] = Math.min(
        1,
        smoothstep(2.8, -1.2, h) * 0.9 + (1 - spot) * 0.15,
      );
      data[o + 2] = this.fieldEdge[i];
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

    this.updateCamera();
    this.updateField(t);
    this.updateRig(t, dt);
    this.updateAgents(t, dt);

    const dustMaterial = this.dust.material as THREE.ShaderMaterial;
    dustMaterial.uniforms.uTime.value = elapsed * motion;
    // The pixel ratio can drop mid-session, so track the real buffer height.
    const viewHeight = this.stage.renderer.domElement.height;
    this.fieldViewHeight.value = viewHeight;
    dustMaterial.uniforms.uViewHeight.value = viewHeight;

    this.stage.renderer.render(this.scene, this.camera);
  }

  private updateCamera() {
    const A = this.waveCamera;
    const target = A.target;
    // Entrance: the camera glides in and settles from a little higher up.
    const arriving = 1 - easeOutCubic(clamp01(this.entrance / 2.6));
    const elevation = A.elevation + arriving * 0.16;
    const distance = A.distance + arriving * 9;
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
    const w = this.stage.width;
    const h = this.stage.height;
    this.camera.setViewOffset(w, h, 0, (0.5 - A.anchor) * h, w, h);
    this.camera.updateProjectionMatrix();

    // Keep the shadow box around the action.
    this.key.target.position.copy(target);
    // From above and behind the crest, as in the reference: tops catch it,
    // the sides facing the camera fall into shade.
    this.key.position.set(target.x - 6, target.y + 18, target.z - 8);
  }

  private updateRig(t: number, dt: number) {
    const bob = Math.sin(t * 0.9) * 0.12;
    this.rig.position.set(0, this.ride(0, 0, t) + 2 + bob, 0);
    this.rig.scale.setScalar(this.aspect < 0.9 ? 2.45 : 2.6);

    // Facing out, with a slow sway; it only spins when it is spun. While
    // dragged it follows the pointer.
    if (!this.drag?.moved) {
      this.spin.update(dt, this.reducedMotion ? 0 : Math.sin(t * 0.5) * 0.2);
    }
    this.mark.rotation.set(Math.sin(t * 0.7) * 0.06, this.spin.angle, 0);
  }

  private updateAgents(t: number, dt: number) {
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];

      // Floating just over the wave, riding it, with the bigger logos held
      // higher so the swells passing under them never touch them.
      const x = a.spot.x * this.spread.x;
      const z = a.spot.y * this.spread.y;
      // Far ones a touch larger, so perspective does not shrink them away.
      const size = (1.4 - a.spot.y * 0.2) * this.waveScale;
      const bob = Math.sin(t * 1.1 + k * 1.7) * 0.13;
      a.group.position.set(x, this.ride(x, z, t) + 0.72 + size * 0.5 + bob, z);

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
      const scale =
        size *
        (1 + a.hover * 0.14) *
        // Entrance: each logo rises out of the wave in turn.
        Math.max(
          0.0001,
          easeOutBack(clamp01((this.entrance - 0.5 - k * 0.09) / 0.8)),
        );
      a.group.scale.setScalar(scale);
      a.group.position.y += a.hover * 0.18;
      const sway = this.reducedMotion ? 0 : Math.sin(t * 0.6 + k * 2.1) * 0.38;
      a.group.rotation.set(-0.18, sway + a.flip, 0);
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
      this.spin.turn(dx * 0.014, dt);
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
        this.spin.kick(Math.PI * 3);
      }
    }
    // Let go of a still pointer and there is no fling: Coere eases back to
    // face out.
    if (drag.moved && performance.now() - drag.lastTime > 80) {
      this.spin.stop();
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
    // Their copies of the materials are this scene's own.
    this.agents.forEach((a) => {
      if (!a.body) return;
      a.group.remove(a.body);
      (a.body.material as THREE.Material).dispose();
    });
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    (this.scene.background as THREE.Texture | null)?.dispose();
    this.stage.dispose();
  }
}
