import { logoMarkSvg } from "@/components/logo";
import type { TeamMember } from "@/lib/site";

/**
 * The faces of a founder's lanyard card, drawn in the browser from the same
 * data as the rest of the page, so a name or a role lives in one place. The
 * card is 1.6 by 2.25 (the Lanyard's portrait card), so a face is 1024 by
 * 1440. The Lanyard cuts a slot near the top, so nothing is drawn there.
 */
const WIDTH = 1024;
const HEIGHT = 1440;
const BLUE = "#5267f7";
const INK = "#14110f";

export type LanyardFaces = { front: string; back: string; strap: string };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return [c, c.getContext("2d")!];
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Draws a portrait into a box, cropped as `photoCrop` says: the part a CSS
 * scale of `zoom` around (x, y) would leave in view, then covering the box.
 */
function drawPortrait(ctx: CanvasRenderingContext2D, photo: HTMLImageElement, member: TeamMember, box: { x: number; y: number; w: number; h: number }) {
  const { zoom = 1, x = 0.5, y = 0.5 } = member.photoCrop ?? {};
  const pw = photo.naturalWidth;
  const ph = photo.naturalHeight;
  const ox = x * pw;
  const oy = y * ph;
  let sx = ox - ox / zoom;
  let sy = oy - oy / zoom;
  let sw = pw / zoom;
  let sh = ph / zoom;
  // Cover the box's shape from the middle of that window.
  const aspect = box.w / box.h;
  if (sw / sh > aspect) {
    const w = sh * aspect;
    sx += (sw - w) / 2;
    sw = w;
  } else {
    const h = sw / aspect;
    sy += (sh - h) / 2;
    sh = h;
  }
  ctx.drawImage(photo, sx, sy, sw, sh, box.x, box.y, box.w, box.h);
}

/** Shrinks the font until the text fits the width. */
function fitText(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, family: string, maxWidth: number) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && s > 24) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
}

function drawBrand(ctx: CanvasRenderingContext2D, mark: HTMLImageElement, family: string, x: number, y: number, color: string, size = 56) {
  ctx.drawImage(mark, x, y - size * 0.8, size, size);
  ctx.fillStyle = color;
  ctx.font = `600 ${size * 0.82}px ${family}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Coere", x + size * 1.22, y);
}

function front(member: TeamMember, photo: HTMLImageElement | null, mark: HTMLImageElement, family: string): string {
  const [c, ctx] = canvas(WIDTH, HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const box = { x: 72, y: 176, w: WIDTH - 144, h: 900 };
  ctx.save();
  roundedRect(ctx, box.x, box.y, box.w, box.h, 48);
  ctx.clip();
  ctx.fillStyle = "#eef1ff";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  if (photo) drawPortrait(ctx, photo, member, box);
  ctx.restore();

  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  fitText(ctx, member.name, 700, 96, family, WIDTH - 144);
  ctx.fillText(member.name, 72, 1196);
  drawBrand(ctx, mark, family, 72, 1340, BLUE);
  ctx.fillStyle = "#6b6b6b";
  ctx.font = `500 40px ${family}`;
  ctx.textAlign = "right";
  ctx.fillText("coere.ai", WIDTH - 72, 1336);
  return c.toDataURL("image/jpeg", 0.92);
}

function back(member: TeamMember, whiteMark: HTMLImageElement, family: string): string {
  const [c, ctx] = canvas(WIDTH, HEIGHT);
  const fill = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  fill.addColorStop(0, "#6a7cff");
  fill.addColorStop(1, "#3f4ceb");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // A large, faint mark in the corner, cut off by the card's edge.
  ctx.globalAlpha = 0.12;
  ctx.drawImage(whiteMark, 420, 560, 900, 900);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  fitText(ctx, member.name, 700, 104, family, WIDTH - 144);
  ctx.fillText(member.name, 72, 420);
  ctx.font = `500 60px ${family}`;
  ctx.fillText(member.role, 72, 520);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(72, 600, 120, 4);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 52px ${family}`;
  ctx.fillText(member.school, 72, 712);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `400 42px ${family}`;
  ctx.fillText(member.majors.join(" and "), 72, 776);
  drawBrand(ctx, whiteMark, family, 72, 1340, "#ffffff");
  return c.toDataURL("image/jpeg", 0.92);
}

/** The strap: Coere blue with the mark and the name, repeated along it. */
function strap(whiteMark: HTMLImageElement, family: string): string {
  const [c, ctx] = canvas(1280, 192);
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, 1280, 192);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 72px ${family}`;
  ctx.textBaseline = "middle";
  for (let x = 40; x < 1280; x += 320) {
    ctx.drawImage(whiteMark, x, 66, 60, 60);
    ctx.fillText("coere", x + 76, 100);
  }
  return c.toDataURL("image/png");
}

const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Draws every face for each member, once the page's font is ready. */
export async function drawLanyardFaces(members: readonly TeamMember[]): Promise<LanyardFaces[]> {
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  await Promise.all([700, 600, 500, 400].map((w) => document.fonts?.load(`${w} 64px ${family}`).catch(() => [])));
  const [mark, whiteMark] = await Promise.all([loadImage(svgUrl(logoMarkSvg(BLUE))), loadImage(svgUrl(logoMarkSvg("#ffffff")))]);
  const photos = await Promise.all(members.map((m) => (m.photo ? loadImage(m.photo).catch(() => null) : Promise.resolve(null))));
  const strapUrl = strap(whiteMark, family);
  return members.map((member, i) => ({
    front: front(member, photos[i], mark, family),
    back: back(member, whiteMark, family),
    strap: strapUrl,
  }));
}
