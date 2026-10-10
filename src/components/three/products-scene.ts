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
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  isLowPowerDevice,
  lerp,
  prefersReducedMotion,
} from "./core";
import {
  TILE_DEPTH,
  brandTileMaterial,
  getBrandTileGeometry,
  getGlyphGeometry,
  getTileGeometry,
  glyphMaterial,
  lightTileMaterial,
  type GlyphName,
} from "./glyphs";
import { coereMaterial, coereMarkGeometry, loadLogo } from "./logos";

export type ProductsAgent = { name: string; logo: string };
export type ProductsFocus = "connect" | "developer" | null;
type Side = "source" | "reader";
type Hover = { kind: Side; index: number } | { kind: "core" } | null;

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

/** What reads from Coere, a row each: devices, then apps, then code. */
export const READERS: readonly GlyphName[] = [
  "laptop",
  "phone",
  "watch",
  "browser",
  "chat",
  "terminal",
  "code",
  "cube",
  "database",
];

const COLUMNS = 3;
/** Centre to centre, between tiles in a grid. */
const PITCH = 1.3;
/** Where a symbol sits: just proud of the tile's face. */
const FACE_Z = TILE_DEPTH / 2 + 0.03;

/** Light runs through the picture once per cycle: in, through Coere, out. */
const CYCLE = 5.4;
/** When, as a fraction of the cycle, Coere lights. */
const CORE_AT = 0.32;

/** A quick rise to 1 at `at`, then a fade over `width` of the cycle. */
const flash = (phase: number, at: number, width = 0.13) => {
  let u = phase - at;
  if (u < -0.5) u += 1;
  if (u < -0.02 || u > width) return 0;
  if (u < 0) return 1 - (u / -0.02) ** 2;
  return (1 - u / width) ** 2;
};

type Tile = {
  side: Side;
  /** Its column in the grid as seen, 0 on the left, and its row from the top. */
  column: number;
  row: number;
  /** 0 for the tiles nearest Coere, 2 for the farthest. */
  near: number;
  /** Placed and turned in the layout. */
  group: THREE.Group;
  /** Moves inside the group: pops, hovers, flips. */
  body: THREE.Group;
  material: THREE.MeshPhysicalMaterial;
  face: THREE.Object3D;
  hit: THREE.Mesh;
  halo: THREE.Sprite;
  fireAt: number;
  appearAt: number;
  energy: number;
  hover: number;
  flipAt: number;
};

const place = new THREE.Vector3();

/**
 * Coere Connect and Coere Developer as one centered picture, like two pages
 * of app icons either side of Coere. On the left, a white icon for each AI
 * with its logo. In the middle, Coere, floating. On the right, blue icons
 * for what reads from it: a laptop, a phone and a watch, a browser, a chat and
 * a terminal, then code, an SDK and a database. No lines: light runs through
 * the picture, the AI icons flaring column by column toward Coere, Coere as
 * it passes, then the icons on the right column by column away from it.
 * Dragging anywhere spins Coere; the icons lift on hover and flip on click.
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

  private readonly tiles: Tile[] = [];
  private readonly core = new THREE.Group();
  private readonly mark: THREE.Mesh;
  private readonly markHit: THREE.Mesh;
  private readonly coreGlow: THREE.Sprite;
  private readonly coreLight: THREE.PointLight;
  private readonly floor: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  private portrait = false;
  private distance = 18;
  private elevation = 0.14;
  private targetY = 2;
  private markY = 2.2;
  private markScale = 2.3;

  private time = 0;
  private loaded = false;
  private introStart = -1;
  private focus: ProductsFocus = null;
  private focusAmount = { connect: 0, developer: 0 };
  private yaw = 0;
  private pitch = 0;
  private pointerX = 0;
  private pointerY = 0;
  private pointerInside = false;
  private readonly spin = new Spin();
  private coreHover = 0;
  private hovered: Hover = null;
  private drag: null | {
    id: number;
    lastX: number;
    lastTime: number;
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
      onContextFail: () => options.onFail?.(),
    });
    const renderer = this.stage.renderer;
    // Everything floats: nothing here casts a shadow.
    renderer.shadowMap.enabled = false;

    this.scene.background = new THREE.Color(PRODUCTS_BACKGROUND);
    this.scene.fog = new THREE.Fog(PRODUCTS_BACKGROUND, 26, 48);
    this.scene.environment = createEnvironment(renderer);
    this.scene.environmentIntensity = 0.75;
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#b6c3e6", 0.85));
    // High and a little in front, so the tops of the icons catch it.
    const key = new THREE.DirectionalLight("#ffffff", 2.2);
    key.position.set(-1.5, 14, 3);
    const rim = new THREE.DirectionalLight("#dfe6ff", 0.8);
    rim.position.set(5, 6, -10);
    // From the viewer, so the faces of the icons read bright and clean.
    const fill = new THREE.DirectionalLight("#ffffff", 0.6);
    fill.position.set(0, 3, 12);
    this.scene.add(key, rim, fill);

    this.scene.add(this.root);
    this.floor = this.buildFloor();

    const glowMap = createGlowTexture(BRAND[500]);
    const hitGeometry = new THREE.BoxGeometry(1.1, 1.1, 0.5);
    const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

    // The icons. Sources take the agents in reading order; readers take
    // READERS the same way.
    const makeTile = (side: Side, index: number, face: THREE.Object3D) => {
      const material =
        side === "source" ? lightTileMaterial() : brandTileMaterial();
      const tile = new THREE.Mesh(
        side === "source" ? getTileGeometry() : getBrandTileGeometry(),
        material,
      );
      face.position.z = FACE_Z;
      const body = new THREE.Group();
      body.add(tile, face);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowMap,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        }),
      );
      halo.position.z = -0.3;
      halo.scale.setScalar(2.5);
      const hit = new THREE.Mesh(hitGeometry, hitMaterial);
      const group = new THREE.Group();
      group.rotation.order = "YXZ";
      group.add(halo, body, hit);
      this.root.add(group);
      this.tiles.push({
        side,
        column: index % COLUMNS,
        row: Math.floor(index / COLUMNS),
        near: 0,
        group,
        body,
        material,
        face,
        hit,
        halo,
        fireAt: 0,
        appearAt: 0,
        energy: 0,
        hover: 0,
        flipAt: -1,
      });
    };
    options.agents.forEach((_, k) => makeTile("source", k, new THREE.Group()));
    const glyph = glyphMaterial();
    READERS.forEach((name, k) => {
      const mesh = new THREE.Mesh(getGlyphGeometry(name), glyph);
      makeTile("reader", k, mesh);
    });

    // The core: Coere, floating on its own between the two grids.
    this.mark = new THREE.Mesh(coereMarkGeometry(), coereMaterial());
    // Scaled to the mark in resize().
    this.markHit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
      hitMaterial,
    );
    this.coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowMap,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
    );
    this.coreLight = new THREE.PointLight("#dbe2ff", 10, 9, 1.6);
    this.core.add(this.coreGlow, this.mark, this.markHit, this.coreLight);
    this.root.add(this.core);

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
   * that sweeps across it in step with the flow.
   */
  private buildFloor() {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(BRAND[400]) },
        uLit: { value: new THREE.Color(BRAND[600]) },
        uSweep: { value: -100 },
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
        uniform float uStrength;
        varying vec2 vPos;
        void main() {
          // The plane lies flat, so its y runs toward the camera: flip it.
          vec2 p = vec2(vPos.x, -vPos.y);
          vec2 cell = fract(p / 0.5) - 0.5;
          float d = length(cell);
          float w = fwidth(d);
          float dotMask = 1.0 - smoothstep(0.05 - w, 0.05 + w, d);
          float fade = 1.0 - smoothstep(3.0, 10.0, length(p * vec2(0.62, 1.4)));
          float band = exp(-pow((p.x - uSweep) / 1.1, 2.0)) * uStrength;
          vec3 color = mix(uColor, uLit, band);
          float alpha = dotMask * fade * (0.26 + band * 0.7);
          gl_FragColor = vec4(color, alpha);
          #include <colorspace_fragment>
        }
      `,
    });
    const dots = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), material);
    dots.rotation.x = -Math.PI / 2;
    this.root.add(dots);
    return dots;
  }

  private async loadLogos() {
    const results = await Promise.allSettled(
      this.options.agents.map((agent) => loadLogo(agent.logo)),
    );
    const bodies = new THREE.Group();
    const sources = this.tiles.filter((tile) => tile.side === "source");
    const faces: [THREE.Object3D, THREE.Mesh][] = [];
    results.forEach((result, k) => {
      if (result.status !== "fulfilled") return;
      const mesh = new THREE.Mesh(result.value.geometry, result.value.material);
      // Logos fill their 24 unit box differently; this keeps them icon sized.
      mesh.scale.setScalar(0.56);
      faces.push([sources[k].face, mesh]);
      bodies.add(mesh);
    });
    try {
      await this.stage.renderer.compileAsync(bodies, this.camera, this.scene);
    } catch {
      // Compiling on first draw instead is fine.
    }
    faces.forEach(([face, mesh]) => face.add(mesh));
    this.loaded = true;
  }

  // ---------------------------------------------------------------- layout

  private resize(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.portrait = aspect < 1.05;
    const tanV = (fov: number) => Math.tan(THREE.MathUtils.degToRad(fov / 2));

    for (const tile of this.tiles) {
      const source = tile.side === "source";
      // The column as counted out from Coere on a wide screen.
      const out = source ? COLUMNS - 1 - tile.column : tile.column;
      if (this.portrait) {
        // Sources above, readers below: the flow runs down the screen.
        tile.near = source ? 2 - tile.row : tile.row;
        const x = (tile.column - 1) * 1.38;
        const y = source ? 10.2 - tile.row * 1.35 : 2.7 - tile.row * 1.35;
        tile.group.position.set(x, y, Math.abs(x) * 0.12);
        tile.group.rotation.set(0, -x * 0.12, 0);
        tile.fireAt = source
          ? 0.02 + (2 - tile.near) * 0.075 + tile.column * 0.015
          : CORE_AT + 0.07 + tile.near * 0.075 + tile.column * 0.015;
        tile.appearAt = 0.35 + tile.near * 0.14 + tile.column * 0.05;
      } else {
        // Two pages either side of Coere, curving gently toward the viewer
        // and turned toward the middle.
        tile.near = out;
        const s = source ? -1 : 1;
        const x = s * (3.1 + out * PITCH);
        const y = 3.5 - tile.row * PITCH;
        tile.group.position.set(x, y, [0, 0.22, 0.56][out]);
        tile.group.rotation.set(-0.08, -s * [0.24, 0.32, 0.4][out], 0);
        tile.fireAt = source
          ? 0.02 + (2 - out) * 0.075 + tile.row * 0.02
          : CORE_AT + 0.07 + out * 0.075 + tile.row * 0.02;
        tile.appearAt = 0.35 + out * 0.14 + tile.row * 0.06;
      }
    }

    if (this.portrait) {
      this.camera.fov = 30;
      this.elevation = 0.06;
      this.targetY = 5.1;
      // Midway between the two grids.
      this.core.position.set(0, 3.55, 0);
      this.markY = 1.55;
      this.markScale = 2.05;
      const halfWidth = 1.38 + 0.5 + 0.4;
      const halfHeight = 6.0;
      this.distance = Math.max(
        halfWidth / (tanV(this.camera.fov) * aspect),
        halfHeight / tanV(this.camera.fov),
      );
    } else {
      this.camera.fov = 24;
      this.elevation = 0.14;
      this.targetY = 2.05;
      // Level with the middle row.
      this.core.position.set(0, 0, 0);
      this.markY = 2.2;
      this.markScale = 2.25;
      const halfWidth = 7.7;
      const halfHeight = 2.75;
      this.distance = Math.max(
        halfWidth / (tanV(this.camera.fov) * aspect),
        halfHeight / tanV(this.camera.fov),
      );
    }
    this.markHit.scale.set(
      this.markScale,
      this.markScale * 1.05,
      this.markScale,
    );
    this.markHit.position.y = this.markY;
    // Seen nearly edge on from the front, the floor would only be a line.
    this.floor.visible = !this.portrait;
    const fog = this.scene.fog as THREE.Fog;
    fog.near = this.distance + 6;
    fog.far = this.distance + 30;
  }

  setFocus(focus: ProductsFocus) {
    this.focus = focus;
  }

  // ---------------------------------------------------------------- frame

  private frame(dt: number) {
    const motion = this.reducedMotion ? 0 : 1;
    this.time += dt * motion;
    const t = this.time;
    // The intro waits for the logos, so no icon arrives blank.
    if (this.introStart < 0 && this.loaded) this.introStart = this.time;
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

    // Camera: a slow drift and a little parallax with the mouse. Dragging
    // spins Coere, never the picture.
    const parallaxX = this.pointerInside ? this.pointerX : 0;
    const parallaxY = this.pointerInside ? this.pointerY : 0;
    const drift = Math.sin(t * 0.25) * 0.05;
    this.yaw = damp(this.yaw, parallaxX * 0.08 + drift, 4, dt);
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

    this.updateTiles(t, dt, intro, phase, running);
    this.updateCore(t, dt, intro, phase, running);

    // The band of light on the floor crosses with the flow.
    this.floor.material.uniforms.uSweep.value = lerp(-7.4, 7.4, phase / 0.62);
    this.floor.material.uniforms.uStrength.value =
      running * (phase < 0.62 ? Math.sin((phase / 0.62) * Math.PI) : 0);

    this.stage.renderer.render(this.scene, this.camera);
  }

  private updateTiles(
    t: number,
    dt: number,
    intro: number,
    phase: number,
    running: number,
  ) {
    const { connect, developer } = this.focusAmount;
    this.tiles.forEach((tile, k) => {
      const source = tile.side === "source";
      const mine = source ? connect : developer;
      const other = source ? developer : connect;
      const index = source ? k : k - this.options.agents.length;
      const hovered =
        this.hovered?.kind === tile.side && this.hovered.index === index;
      tile.hover = damp(tile.hover, hovered ? 1 : 0, 10, dt);
      tile.energy = flash(phase, tile.fireAt) * running;

      // Arrive with a pop, nearest Coere first.
      const appear = this.reducedMotion
        ? 1
        : clamp01((intro - tile.appearAt) / 0.7);
      const scale =
        Math.max(0.0001, easeOutBack(appear)) *
        (1 +
          tile.energy * 0.06 +
          tile.hover * 0.07 +
          mine * 0.04 -
          other * 0.06);
      const body = tile.body;
      body.scale.setScalar(scale);
      body.position.set(
        0,
        // A slow swell that rolls across each grid.
        this.reducedMotion
          ? 0
          : Math.sin(t * 1.2 - tile.near * 0.9 - tile.row * 0.5) * 0.035 -
              (1 - easeOutCubic(appear)) * 0.5,
        // Forward when it fires or has focus, back when the other side does.
        tile.energy * 0.24 + tile.hover * 0.3 + mine * 0.18 - other * 0.16,
      );

      // A click sends it once round.
      let flip = 0;
      if (tile.flipAt >= 0) {
        const f = clamp01((t - tile.flipAt) / 1);
        flip = easeInOutCubic(f) * Math.PI * 2;
        if (f >= 1) tile.flipAt = -1;
      }
      // Neighbours sway together, so each grid moves as one.
      const sway = this.reducedMotion
        ? 0
        : Math.sin(t * 0.6 - tile.near * 0.6 - tile.row * 0.3) * 0.03;
      body.rotation.set(-tile.energy * 0.12, flip + sway, 0);

      const lit = Math.max(tile.energy, tile.hover * 0.7);
      tile.material.emissiveIntensity =
        (source ? 0.5 : 0.55) * lit + mine * 0.2;
      tile.halo.material.opacity = Math.min(
        0.85,
        Math.max(lit, mine * 0.6) * (1 - other * 0.7) * 0.85 * appear,
      );
      tile.halo.visible = tile.halo.material.opacity > 0.003;
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
    this.core.scale.setScalar(lerp(0.7, 1, appear));

    // Mostly facing out with a slow sway. A drag turns it by hand and lets
    // it run on when released; a click sends it round.
    if (!this.drag?.moved) {
      this.spin.update(dt, this.reducedMotion ? 0 : Math.sin(t * 0.5) * 0.2);
    }
    const pulse = flash(phase, CORE_AT, 0.16) * running;
    const markY = this.markY + Math.sin(t * 1.1) * 0.07 - (1 - appear) * 1.2;
    this.mark.position.y = markY;
    this.mark.rotation.set(
      Math.sin(t * 0.8) * 0.05,
      this.spin.angle - this.yaw,
      0,
    );
    this.mark.scale.setScalar(this.markScale * (1 + pulse * 0.05));
    this.coreGlow.position.y = markY;
    this.coreGlow.scale.setScalar(this.markScale * 2.35);
    // Brighter as the light passes through, and under the pointer.
    const hovered = this.hovered?.kind === "core" || !!this.drag?.moved;
    this.coreHover = damp(this.coreHover, hovered ? 1 : 0, 8, dt);
    const lit = Math.max(pulse, this.coreHover * 0.5);
    this.coreGlow.material.opacity = 0.42 + lit * 0.4;
    this.coreLight.position.y = markY;
    this.coreLight.intensity = 10 + lit * 26;
  }

  // ---------------------------------------------------------------- pointer

  private pick(clientX: number, clientY: number): Hover {
    const rect = this.options.host.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const targets = [this.markHit, ...this.tiles.map((tile) => tile.hit)];
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    if (!hit) return null;
    if (hit.object === this.markHit) return { kind: "core" };
    const k = this.tiles.findIndex((tile) => tile.hit === hit.object);
    if (k < 0) return null;
    const tile = this.tiles[k];
    const sources = this.options.agents.length;
    return {
      kind: tile.side,
      index: tile.side === "source" ? k : k - sources,
    };
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
      lastTime: performance.now(),
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
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastTime) / 1000;
      drag.lastX = event.clientX;
      drag.lastTime = now;
      if (!drag.moved && Math.abs(event.clientX - drag.startX) > 4) {
        drag.moved = true;
        try {
          this.options.host.setPointerCapture(event.pointerId);
        } catch {
          // The pointer may already be gone.
        }
      }
      if (drag.moved) {
        // Wherever the drag starts, it spins Coere.
        this.spin.turn(dx * 0.014, dt);
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
      if (picked?.kind === "core") {
        this.spin.kick(Math.PI * 3);
      } else if (picked) {
        const k =
          picked.index +
          (picked.kind === "reader" ? this.options.agents.length : 0);
        const tile = this.tiles[k];
        if (tile && tile.flipAt < 0 && !this.reducedMotion) {
          tile.flipAt = this.time;
        }
      }
    }
    // Let go of a still pointer and there is no fling: Coere eases back to
    // face out.
    if (drag.moved && performance.now() - drag.lastTime > 80) {
      this.spin.stop();
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
    // The logos are cached and shared with the hero: leave them be.
    this.tiles.forEach((tile) => {
      if (tile.side === "source") tile.face.clear();
    });
    disposeTree(this.scene);
    this.scene.environment?.dispose();
    this.stage.dispose();
  }
}
