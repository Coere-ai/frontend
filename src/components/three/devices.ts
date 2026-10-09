import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { BRAND } from "./core";

/**
 * The things that read from Coere: a laptop, a phone, an app and a database.
 * Screens are drawn once to canvases: abstract interfaces, bars standing in
 * for text, so nothing on them competes with the page's own words.
 */

export type Device = {
  group: THREE.Group;
  /** Called every frame with time and how lit the device should be (0..1). */
  update: (time: number, energy: number) => void;
};

const BLADE: [number, number][] = [
  [42, 460],
  [88, 190],
  [220, 58],
  [332, 170],
  [168, 334],
];

function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const s = size / 512;
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  for (const flip of [false, true]) {
    ctx.beginPath();
    BLADE.forEach(([px, py], i) => {
      const qx = flip ? 512 - px : px;
      const qy = flip ? 512 - py : py;
      if (i === 0) ctx.moveTo(qx, qy);
      else ctx.lineTo(qx, qy);
    });
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** A chat with memory carried in: the Coere chip up top, bubbles below. */
function laptopScreen() {
  return canvasTexture(1280, 820, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1280, 820);
    // Window chrome.
    ctx.fillStyle = "#f3f5fb";
    ctx.fillRect(0, 0, 1280, 64);
    ["#ff6159", "#ffbd2e", "#28c941"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(36 + i * 30, 32, 9, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });
    roundRect(ctx, 470, 18, 340, 28, 14, "#e6eaf5");
    // Sidebar.
    ctx.fillStyle = "#f7f8fc";
    ctx.fillRect(0, 64, 270, 756);
    for (let i = 0; i < 9; i++) {
      roundRect(
        ctx,
        28,
        110 + i * 62,
        210 - (i % 3) * 40,
        18,
        9,
        i === 1 ? "#d9dffd" : "#e7eaf3",
      );
    }
    // Memory chip: the mark and three filled dots.
    roundRect(ctx, 330, 98, 300, 64, 32, BRAND[50]);
    drawMark(ctx, 372, 130, 40, BRAND[500]);
    for (let i = 0; i < 3; i++) {
      roundRect(
        ctx,
        412 + i * 64,
        122,
        52,
        16,
        8,
        i < 2 ? BRAND[400] : BRAND[200],
      );
    }
    // Conversation.
    const bubble = (
      x: number,
      y: number,
      w: number,
      lines: number,
      mine: boolean,
    ) => {
      const h = 34 + lines * 30;
      roundRect(ctx, x, y, w, h, 26, mine ? BRAND[500] : "#f1f3f9");
      for (let l = 0; l < lines; l++) {
        const lw = (w - 64) * (l === lines - 1 ? 0.62 : 1);
        roundRect(
          ctx,
          x + 32,
          y + 26 + l * 30,
          lw,
          12,
          6,
          mine ? "rgba(255,255,255,0.75)" : "#d6dbe8",
        );
      }
      return y + h + 26;
    };
    let y = 200;
    y = bubble(330, y, 560, 3, false);
    y = bubble(720, y, 500, 2, true);
    bubble(330, y, 620, 3, false);
    // Composer.
    roundRect(ctx, 330, 724, 890, 64, 32, "#f3f5fb");
    roundRect(ctx, 370, 750, 360, 12, 6, "#d6dbe8");
    ctx.beginPath();
    ctx.arc(1186, 756, 22, 0, Math.PI * 2);
    ctx.fillStyle = BRAND[500];
    ctx.fill();
  });
}

function phoneScreen() {
  return canvasTexture(560, 1180, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 560, 1180);
    // Island and status.
    roundRect(ctx, 200, 26, 160, 44, 22, "#0d1530");
    roundRect(ctx, 40, 38, 64, 18, 9, "#0d1530");
    roundRect(ctx, 440, 38, 80, 18, 9, "#0d1530");
    // Header.
    ctx.beginPath();
    ctx.arc(80, 140, 30, 0, Math.PI * 2);
    ctx.fillStyle = BRAND[100];
    ctx.fill();
    drawMark(ctx, 80, 140, 30, BRAND[500]);
    roundRect(ctx, 128, 124, 180, 16, 8, "#0d1530");
    roundRect(ctx, 128, 150, 120, 12, 6, "#c3c9da");
    ctx.fillStyle = "#eef0f6";
    ctx.fillRect(0, 196, 560, 2);
    const bubble = (
      x: number,
      y: number,
      w: number,
      lines: number,
      mine: boolean,
    ) => {
      const h = 30 + lines * 28;
      roundRect(ctx, x, y, w, h, 24, mine ? BRAND[500] : "#f1f3f9");
      for (let l = 0; l < lines; l++) {
        const lw = (w - 56) * (l === lines - 1 ? 0.6 : 1);
        roundRect(
          ctx,
          x + 28,
          y + 24 + l * 28,
          lw,
          11,
          6,
          mine ? "rgba(255,255,255,0.75)" : "#d6dbe8",
        );
      }
      return y + h + 22;
    };
    let y = 236;
    y = bubble(36, y, 380, 3, false);
    y = bubble(176, y, 348, 2, true);
    y = bubble(36, y, 410, 4, false);
    bubble(216, y, 308, 1, true);
    // Composer.
    roundRect(ctx, 30, 1040, 500, 70, 35, "#f3f5fb");
    ctx.beginPath();
    ctx.arc(490, 1075, 24, 0, Math.PI * 2);
    ctx.fillStyle = BRAND[500];
    ctx.fill();
    roundRect(ctx, 200, 1142, 160, 10, 5, "#0d1530");
  });
}

function keyboardTexture() {
  return canvasTexture(1024, 600, (ctx) => {
    ctx.fillStyle = "#2c3346";
    ctx.fillRect(0, 0, 1024, 600);
    roundRect(ctx, 64, 30, 896, 330, 18, "#20263a");
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      const keys = 14;
      const w = 896 / keys;
      for (let k = 0; k < keys; k++) {
        roundRect(ctx, 64 + k * w + 4, 36 + r * 53, w - 8, 45, 8, "#171c2c");
      }
    }
    roundRect(ctx, 352, 390, 320, 190, 18, "#363e55");
  });
}

/** Graphite, so the devices stand out against the pale stage. */
const aluminium = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#323a4f",
    metalness: 0.6,
    roughness: 0.32,
    clearcoat: 0.5,
    clearcoatRoughness: 0.18,
  });

const screenMaterial = (map: THREE.Texture) =>
  new THREE.MeshBasicMaterial({ map, toneMapped: false });

/** A rounded rectangle of glass-black that sits behind a screen. */
const bezel = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#0b1024",
    roughness: 0.2,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });

export function createLaptop(): Device {
  const group = new THREE.Group();
  const width = 2.7;
  const depth = 1.8;

  const base = new THREE.Mesh(
    new RoundedBoxGeometry(width, 0.1, depth, 4, 0.05),
    aluminium(),
  );
  base.position.y = 0.05;
  base.castShadow = true;
  base.receiveShadow = true;
  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.92, depth * 0.88),
    new THREE.MeshStandardMaterial({ map: keyboardTexture(), roughness: 0.6 }),
  );
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 0.101;

  // The lid swings up from a hinge on the back edge.
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.1, -depth / 2);
  hinge.rotation.x = -1.86;
  const lid = new THREE.Mesh(
    new RoundedBoxGeometry(width, 0.06, depth, 4, 0.03),
    aluminium(),
  );
  lid.position.set(0, 0.03, depth / 2);
  lid.castShadow = true;
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.97, depth * 0.95),
    bezel(),
  );
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, -0.002, depth / 2);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.9, depth * 0.84),
    screenMaterial(laptopScreen()),
  );
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.004, depth / 2 + 0.02);
  hinge.add(lid, glass, screen);

  group.add(base, deck, hinge);

  const screenMat = screen.material as THREE.MeshBasicMaterial;
  return {
    group,
    update: (_t, energy) => {
      screenMat.color.setScalar(0.93 + energy * 0.07);
    },
  };
}

export function createPhone(): Device {
  const group = new THREE.Group();
  const w = 0.98;
  const h = 2.0;
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, 0.11, 6, 0.045),
    new THREE.MeshPhysicalMaterial({
      color: "#d9dee9",
      metalness: 0.75,
      roughness: 0.24,
      clearcoat: 0.6,
    }),
  );
  body.castShadow = true;
  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(w - 0.03, h - 0.03, 0.02, 6, 0.01),
    bezel(),
  );
  glass.position.z = 0.05;
  // Rounded screen: an alpha mask keeps the corners round.
  const map = phoneScreen();
  const mask = canvasTexture(140, 290, (ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 140, 290);
    roundRect(ctx, 0, 0, 140, 290, 22, "#fff");
  });
  mask.colorSpace = THREE.NoColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.1, h - 0.1),
    new THREE.MeshBasicMaterial({
      map,
      alphaMap: mask,
      transparent: true,
      toneMapped: false,
    }),
  );
  screen.position.z = 0.062;
  group.add(body, glass, screen);
  group.rotation.x = -0.1;
  const screenMat = screen.material as THREE.MeshBasicMaterial;
  return {
    group,
    update: (_t, energy) => {
      screenMat.color.setScalar(0.93 + energy * 0.07);
    },
  };
}

/** An app icon: a rounded tile in brand blue with code brackets on it. */
export function createAppTile(): Device {
  const group = new THREE.Group();
  const geometry = new RoundedBoxGeometry(1.3, 1.3, 0.3, 6, 0.28);
  // Vertical sweep of brand blues.
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  const top = new THREE.Color(BRAND[400]);
  const bottom = new THREE.Color(BRAND[600]);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    c.copy(bottom).lerp(
      top,
      THREE.MathUtils.clamp(position.getY(i) / 1.3 + 0.5, 0, 1),
    );
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const tile = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    }),
  );
  tile.castShadow = true;

  // "</>" as rounded tubes, raised off the face.
  const glyphMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.25,
    clearcoat: 1,
    emissive: "#ffffff",
    emissiveIntensity: 0.15,
  });
  const strokes: [number, number][][] = [
    [
      [8, 8],
      [4, 12],
      [8, 16],
    ],
    [
      [16, 8],
      [20, 12],
      [16, 16],
    ],
    [
      [14, 5],
      [10, 19],
    ],
  ];
  const glyph = new THREE.Group();
  for (const stroke of strokes) {
    const points = stroke.map(
      ([x, y]) => new THREE.Vector3((x - 12) / 24, (12 - y) / 24, 0),
    );
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      path.add(new THREE.LineCurve3(points[i], points[i + 1]));
    }
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(path, 24, 0.028, 10, false),
      glyphMaterial,
    );
    glyph.add(tube);
    for (const end of [points[0], points[points.length - 1]]) {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 12, 10),
        glyphMaterial,
      );
      cap.position.copy(end);
      glyph.add(cap);
    }
    // Round the bend.
    if (points.length > 2) {
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 12, 10),
        glyphMaterial,
      );
      joint.position.copy(points[1]);
      glyph.add(joint);
    }
  }
  glyph.scale.setScalar(1.05);
  glyph.position.z = 0.17;
  group.add(tile, glyph);

  const tileMaterial = tile.material as THREE.MeshPhysicalMaterial;
  return {
    group,
    update: (_t, energy) => {
      tileMaterial.emissive.set(BRAND[500]);
      tileMaterial.emissiveIntensity = energy * 0.35;
    },
  };
}
