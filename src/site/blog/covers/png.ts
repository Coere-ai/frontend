import { unzlibSync } from "fflate";

/**
 * A small PNG reader, enough for the pictures the cover renderer makes:
 * 8 bits a channel, not interlaced, in gray, gray with alpha, RGB or RGBA.
 * It returns every pixel as RGBA.
 */
export function decodePng(bytes: Uint8Array): { width: number; height: number; rgba: Uint8ClampedArray } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0) !== 0x89504e47 || view.getUint32(4) !== 0x0d0a1a0a) throw new Error("not a PNG");
  let width = 0;
  let height = 0;
  let channels = 0;
  const parts: Uint8Array[] = [];
  for (let at = 8; at < bytes.length; ) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const data = bytes.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") {
      width = view.getUint32(at + 8);
      height = view.getUint32(at + 12);
      const [depth, color, , , interlace] = data.subarray(8, 13);
      channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[color] ?? 0;
      if (depth !== 8 || !channels || interlace) throw new Error(`PNG kind not read here: depth ${depth}, color ${color}, interlace ${interlace}`);
    } else if (type === "IDAT") {
      parts.push(data);
    } else if (type === "IEND") {
      break;
    }
    at += 12 + length;
  }
  const packed = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  parts.reduce((offset, p) => (packed.set(p, offset), offset + p.length), 0);
  const raw = unzlibSync(packed);

  const stride = width * channels;
  const pixels = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[row + x - channels] : 0;
      const up = y > 0 ? pixels[row - stride + x] : 0;
      const corner = x >= channels && y > 0 ? pixels[row - stride + x - channels] : 0;
      let predict = 0;
      if (filter === 1) predict = left;
      else if (filter === 2) predict = up;
      else if (filter === 3) predict = (left + up) >> 1;
      else if (filter === 4) predict = paeth(left, up, corner);
      pixels[row + x] = (raw[src + x] + predict) & 255;
    }
  }

  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const p = i * channels;
    const gray = channels < 3;
    rgba[i * 4] = pixels[p];
    rgba[i * 4 + 1] = gray ? pixels[p] : pixels[p + 1];
    rgba[i * 4 + 2] = gray ? pixels[p] : pixels[p + 2];
    rgba[i * 4 + 3] = channels === 4 ? pixels[p + 3] : channels === 2 ? pixels[p + 1] : 255;
  }
  return { width, height, rgba };
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
