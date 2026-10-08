import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** Brand colors, mirrored from globals.css so the scenes match the page. */
export const BRAND = {
  50: "#eef1ff",
  100: "#e0e5ff",
  200: "#c6cfff",
  300: "#a3b0fd",
  400: "#7f8bfa",
  500: "#5267f7",
  600: "#3f4ceb",
  700: "#333cd0",
  900: "#283285",
  ink: "#080e24",
} as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Frame-rate independent exponential smoothing toward a target. */
export const damp = (
  current: number,
  target: number,
  lambda: number,
  dt: number,
) => lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Wraps an angle into (-PI, PI]. */
export const wrapAngle = (a: number) => {
  const t = (a + Math.PI) % (Math.PI * 2);
  return (t < 0 ? t + Math.PI * 2 : t) - Math.PI;
};

/** Cheap deterministic hash in [0, 1). */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

export function cubicBezier(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
) {
  const s = 1 - t;
  const a = s * s * s;
  const b = 3 * s * s * t;
  const c = 3 * s * t * t;
  const d = t * t * t;
  return out.set(
    a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    a * p0.z + b * p1.z + c * p2.z + d * p3.z,
  );
}

/** True when the device looks like a phone, a tablet or a low-power laptop. */
export function isLowPowerDevice() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  return (coarse && small) || fewCores || lowMemory;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Throws when WebGL is unavailable, so callers can fall back to the 2D page. */
export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // A software rasterizer would crawl and lock up the page; the flat page is
  // the better experience there.
  if (isSoftwareRenderer(renderer.getContext())) {
    renderer.dispose();
    throw new Error("WebGL is running in software");
  }
  return renderer;
}

function isSoftwareRenderer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(
    gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "",
  );
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}

/** A soft studio environment so glossy logos have something to reflect. */
export function createEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const texture = pmrem.fromScene(room, 0.035).texture;
  room.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });
  pmrem.dispose();
  return texture;
}

/** A radial glow drawn once to a canvas, for halos behind glowing things. */
export function createGlowTexture(color: string, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  // getStyle() hands back sRGB, which is what a 2D canvas expects.
  const base = new THREE.Color(color)
    .getStyle()
    .replace("rgb(", "")
    .replace(")", "");
  g.addColorStop(0, `rgba(${base},0.55)`);
  g.addColorStop(0.25, `rgba(${base},0.28)`);
  g.addColorStop(0.6, `rgba(${base},0.07)`);
  g.addColorStop(1, `rgba(${base},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type StageOptions = {
  canvas: HTMLCanvasElement;
  /** Element whose size the canvas tracks and whose visibility gates rendering. */
  host: HTMLElement;
  maxDpr: number;
  onResize: (width: number, height: number) => void;
  onFrame: (dt: number, time: number) => void;
  /** Called once if the device cannot hold a smooth frame rate even at 1x. */
  onDegrade?: () => void;
  /** Called if the GPU drops the context and does not give it back. */
  onContextFail?: () => void;
};

/**
 * Owns the renderer and the frame loop. It renders only while the host is on
 * screen and the tab is visible, and lowers the pixel ratio when frames run
 * long so slower machines stay smooth.
 */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  width = 1;
  height = 1;
  private dpr: number;
  private readonly maxDpr: number;
  private frame = 0;
  private last = 0;
  private time = 0;
  private onScreen = false;
  private pageVisible = true;
  private disposed = false;
  private contextLost = false;
  private failTimer = 0;
  private frameTimes: number[] = [];
  private degraded = false;
  private resizeObserver: ResizeObserver | null = null;
  private intersection: IntersectionObserver | null = null;

  constructor(private readonly options: StageOptions) {
    this.renderer = createRenderer(options.canvas);
    this.maxDpr = options.maxDpr;
    this.dpr = Math.min(window.devicePixelRatio || 1, options.maxDpr);
    this.renderer.setPixelRatio(this.dpr);
  }

  /** Begins sizing and rendering. Call once the scene is fully built. */
  start() {
    const { host, canvas } = this.options;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.intersection = new IntersectionObserver(
      ([entry]) => {
        this.onScreen = entry.isIntersecting;
        this.sync();
      },
      { rootMargin: "120px 0px" },
    );
    this.intersection.observe(host);
    document.addEventListener("visibilitychange", this.onVisibility);
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    this.resize();
  }

  get pixelRatio() {
    return this.dpr;
  }

  private onVisibility = () => {
    this.pageVisible = document.visibilityState === "visible";
    if (this.contextLost) this.armFailTimer();
    this.sync();
  };

  private onContextLost = (event: Event) => {
    // Ask for the context back; give up if it does not return while the page
    // is in view, so a section never sits blank.
    event.preventDefault();
    this.contextLost = true;
    this.stopLoop();
    this.armFailTimer();
  };

  private onContextRestored = () => {
    this.contextLost = false;
    window.clearTimeout(this.failTimer);
    this.sync();
  };

  private armFailTimer() {
    window.clearTimeout(this.failTimer);
    if (document.visibilityState !== "visible") return;
    this.failTimer = window.setTimeout(() => {
      if (this.contextLost && !this.disposed) this.options.onContextFail?.();
    }, 3000);
  }

  private resize() {
    const rect = this.options.host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.options.onResize(width, height);
    if (!this.frame) this.renderOnce();
  }

  /** Draws a single frame, e.g. right after a resize while paused. */
  renderOnce() {
    if (this.disposed) return;
    this.options.onFrame(0, this.time);
  }

  private sync() {
    if (
      this.onScreen &&
      this.pageVisible &&
      !this.disposed &&
      !this.contextLost
    )
      this.startLoop();
    else this.stopLoop();
  }

  private startLoop() {
    if (this.frame) return;
    this.last = performance.now();
    const tick = (now: number) => {
      this.frame = requestAnimationFrame(tick);
      const dt = Math.min((now - this.last) / 1000, 1 / 20);
      this.last = now;
      this.time += dt;
      this.options.onFrame(dt, this.time);
      this.watchPerformance(dt);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private watchPerformance(dt: number) {
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 90) return;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    this.frameTimes.length = 0;
    // Under ~45fps: shed pixels first, then ask the scene to shed work.
    if (median > 1 / 45) {
      if (this.dpr > 1) {
        this.dpr = Math.max(1, this.dpr - 0.25);
        this.renderer.setPixelRatio(this.dpr);
        this.renderer.setSize(this.width, this.height, false);
      } else if (!this.degraded) {
        this.degraded = true;
        this.options.onDegrade?.();
      }
    } else if (median < 1 / 58 && this.dpr < this.maxDpr && !this.degraded) {
      const next = Math.min(
        this.maxDpr,
        window.devicePixelRatio || 1,
        this.dpr + 0.25,
      );
      if (next !== this.dpr) {
        this.dpr = next;
        this.renderer.setPixelRatio(this.dpr);
        this.renderer.setSize(this.width, this.height, false);
      }
    }
  }

  dispose() {
    this.disposed = true;
    window.clearTimeout(this.failTimer);
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.intersection?.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.options.canvas.removeEventListener(
      "webglcontextlost",
      this.onContextLost,
    );
    this.options.canvas.removeEventListener(
      "webglcontextrestored",
      this.onContextRestored,
    );
    this.renderer.dispose();
  }
}

/** Disposes every geometry, material and texture under an object. */
export function disposeTree(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const materials = mesh.material
      ? Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
      material.dispose();
    }
  });
  textures.forEach((texture) => texture.dispose());
}
