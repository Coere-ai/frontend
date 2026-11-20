import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { WORDMARK_CROP, wordmarkSvg } from "@/components/logo";
import { pixelate } from "@/site/blog/covers/pixelate";
import { SHARE_COLS, SHARE_HEIGHT, SHARE_LOGO_FILES, SHARE_ROWS, SHARE_WALL, SHARE_WIDTH, shareScene } from "./scene";

/** The wall is drawn once a process, so the Open Graph and X pictures share it. */
let wall: Promise<string> | null = null;

function drawWall(): Promise<string> {
  if (!wall) {
    wall = (async () => {
      const texts = await Promise.all(SHARE_LOGO_FILES.map((file) => readFile(join(process.cwd(), "public", file), "utf8")));
      const logos = Object.fromEntries(SHARE_LOGO_FILES.map((file, i) => [file, texts[i]]));
      return pixelate(shareScene(logos), "The Coere mark among the AI logos", { cols: SHARE_COLS, rows: SHARE_ROWS, wall: SHARE_WALL });
    })();
    // A failed draw is not kept, so the next request tries again.
    wall.catch(() => (wall = null));
  }
  return wall;
}

/**
 * The site's share picture, drawn once at build time: the near black of
 * the site, the text logo, the home page's heading and the address on the
 * left, and on the right the LED wall of the AIs round the Coere mark,
 * every cell one solid color. "Accelerating" takes the hero's ice blue to
 * Coere blue, held still. Set in Geist from the copy beside the blog's
 * share picture (src/site/blog/fonts).
 */
export async function siteShareImage(): Promise<ImageResponse> {
  const [grid, font] = await Promise.all([drawWall(), readFile(join(process.cwd(), "src/site/blog/fonts/Geist-SemiBold.ttf"))]);
  const art = `data:image/svg+xml;base64,${Buffer.from(grid).toString("base64")}`;
  const logo = `data:image/svg+xml;base64,${Buffer.from(wordmarkSvg("#ffffff")).toString("base64")}`;
  const logoHeight = 46;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: SHARE_WALL.gap, fontFamily: "Geist" }}>
        {/* Satori draws plain img elements only, so next/image has no place here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} width={SHARE_WIDTH} height={SHARE_HEIGHT} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "68px 0 60px 76px", width: 640, height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={Math.round((logoHeight * WORDMARK_CROP.width) / WORDMARK_CROP.height)} height={logoHeight} alt="" />
          <div style={{ display: "flex", flexDirection: "column", color: "#fff", fontSize: 66, lineHeight: 1.02, letterSpacing: "-0.045em" }}>
            <span style={{ backgroundImage: "linear-gradient(90deg, #e6f1ff 0%, #b4d0ff 30%, #8fb8ff 58%, #5f78fb 100%)", backgroundClip: "text", color: "transparent", paddingBottom: 4 }}>Accelerating</span>
            <span>Enterprise AI with</span>
            <span>Unified Context</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.55)" }}>coere.ai</div>
        </div>
      </div>
    ),
    { width: SHARE_WIDTH, height: SHARE_HEIGHT, fonts: [{ name: "Geist", data: font, weight: 600, style: "normal" }] },
  );
}
