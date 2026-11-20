import { drawRatio, lowerCap } from "./math";

/**
 * What a scene is told each frame. Width and height are in CSS pixels; the
 * canvas holds them times `dpr`. `time` is the scene's own time, moved on at
 * its speed; `clock` is the real seconds it has played since it mounted,
 * whatever the speed, for an intro that plays once. The clock stops while
 * the stage is paused, so an intro picks up where it was, and under reduced
 * motion it is Infinity, so an intro shows its settled end.
 */
export type StageFrame = { time: number; clock: number; width: number; height: number; dpr: number; phone: boolean };

/** A scene drawn on the stage's context: it draws a frame and frees what it made. */
export type Scene = { draw: (gl: WebGL2RenderingContext, f: StageFrame) => void; dispose: (gl: WebGL2RenderingContext) => void };

export type StageOptions = {
  /** Builds the scene once the context exists. Throwing or returning null leaves the still fallback in place. */
  create: (gl: WebGL2RenderingContext, phone: boolean) => Scene | null;
  /** Pixel ratio caps for a laptop and for a phone. */
  cap: number;
  phoneCap: number;
  /** Slow frames lower the cap a step at a time, down to this. */
  floor: number;
  /** 0 holds a still frame; 1 runs at the scene's own pace. */
  speed: number;
  /** The scene time the still frame shows under reduced motion. */
  stillTime: number;
};

const FULL_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

/** The vertex shader every full screen pass uses: one triangle that covers the canvas. */
export const FULL_VERT = `#version 300 es
layout(location = 0) in vec2 aCorner;
void main() { gl_Position = vec4(aCorner, 0.0, 1.0); }`;

/**
 * Binds a triangle that covers the canvas to attribute 0 and returns its
 * free function. Each pass then draws it with drawArrays(TRIANGLES, 0, 3).
 */
export function fullTriangle(gl: WebGL2RenderingContext): () => void {
  const vao = gl.createVertexArray();
  const vbo = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, FULL_TRIANGLE, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return () => {
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(vbo);
  };
}

/**
 * Puts a WebGL2 canvas in `host` and runs `create`'s scene on it. The
 * canvas fades in over the host's own still background once the first
 * frame is drawn, and the stage:
 * - holds one frame under reduced motion or with `speed` 0,
 * - pauses off screen and in a hidden tab,
 * - caps the pixel ratio (lower on a phone) and lowers it further after
 *   two seconds of frames slower than 45 a second,
 * - frees the context when it is stopped.
 * Returns the stop function.
 */
export function mountStage(host: HTMLElement, opts: StageOptions): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || opts.speed <= 0;
  const phone = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 640;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 700ms ease";
  host.appendChild(canvas);

  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
  let scene: Scene | null = null;
  try {
    scene = gl ? opts.create(gl, phone) : null;
  } catch {
    scene = null;
  }
  if (!gl || !scene) {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
    return () => {};
  }
  const live = scene;

  let cap = phone ? opts.phoneCap : opts.cap;
  const frame: StageFrame = { time: reduce ? opts.stillTime : 0, clock: reduce ? Infinity : 0, width: 1, height: 1, dpr: 1, phone };
  let visible = true;
  let stopped = false;
  let raf = 0;
  let last = 0;
  let slow = 0;
  let drawn = false;

  function size() {
    frame.width = Math.max(host.clientWidth, 1);
    frame.height = Math.max(host.clientHeight, 1);
    frame.dpr = drawRatio(window.devicePixelRatio, cap, Math.min(opts.floor, cap));
    const w = Math.round(frame.width * frame.dpr);
    const h = Math.round(frame.height * frame.dpr);
    // A new size clears the canvas after this frame's draw, so it draws again at once rather than show a blank frame.
    if (canvas.width !== w || canvas.height !== h || !drawn) {
      canvas.width = w;
      canvas.height = h;
      paint();
    }
  }

  function paint() {
    if (stopped || gl!.isContextLost()) return;
    gl!.viewport(0, 0, canvas.width, canvas.height);
    live.draw(gl!, frame);
    if (!drawn) {
      drawn = true;
      canvas.style.opacity = "1";
    }
  }

  function tick(now: number) {
    raf = 0;
    if (stopped) return;
    const raw = last ? (now - last) / 1000 : 0;
    // Time moves on by at most a tenth of a second a frame, so a stall never jumps the scene.
    const dt = Math.min(raw, 0.1);
    last = now;
    frame.time += dt * opts.speed;
    frame.clock += dt;
    // Past two seconds of frames slower than 45 a second, draw fewer pixels. This counts the real time between frames, so a very slow device steps down just as soon.
    const spent = Math.min(raw, 0.5);
    slow = spent > 1 / 45 ? slow + spent : Math.max(slow - spent * 0.5, 0);
    if (slow > 2 && cap > opts.floor) {
      cap = lowerCap(cap, opts.floor);
      slow = 0;
      size();
    }
    paint();
    if (visible && !document.hidden) raf = requestAnimationFrame(tick);
  }

  function wake() {
    if (reduce || raf || stopped || !visible || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const resize = new ResizeObserver(size);
  resize.observe(host);
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else pause();
  });
  seen.observe(host);
  const onVisibility = () => (document.hidden ? pause() : wake());
  document.addEventListener("visibilitychange", onVisibility);
  const onLost = (e: Event) => {
    e.preventDefault();
    pause();
    canvas.style.opacity = "0";
  };
  canvas.addEventListener("webglcontextlost", onLost);

  size();
  wake();

  return () => {
    stopped = true;
    pause();
    resize.disconnect();
    seen.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onLost);
    if (!gl.isContextLost()) live.dispose(gl);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  };
}
