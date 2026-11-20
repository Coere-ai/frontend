import { ImageResponse } from "next/og";
import { createElement } from "react";
import { decodePng } from "./png";

/**
 * Draws an SVG document to pixels on the server, `width` by `height`, and
 * returns them as RGBA. It uses the renderer next/og already ships (resvg),
 * so it needs no native module and runs wherever the share pictures do.
 */
export async function rasterizeSvg(svg: string, width: number, height: number): Promise<Uint8ClampedArray> {
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const picture = createElement("div", { style: { display: "flex", width, height } }, createElement("img", { src, width, height, alt: "" }));
  const response = new ImageResponse(picture, { width, height });
  const png = decodePng(new Uint8Array(await response.arrayBuffer()));
  if (png.width !== width || png.height !== height) throw new Error(`rendered ${png.width} by ${png.height}, wanted ${width} by ${height}`);
  return png.rgba;
}
