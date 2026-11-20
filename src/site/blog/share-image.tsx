import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_BLADE } from "@/components/logo";
import type { Post } from "@/site/content/posts";
import { formatPostDate } from "@/site/content/posts";
import { loadCover } from "./covers/load";

/** The size every share picture is drawn at, the one X, LinkedIn and Slack all show in full. */
export const SHARE_SIZE = { width: 1200, height: 630 };

/**
 * A post's share picture: its cover art behind, a shade from the left so
 * the words read, and the Coere mark, the title and the date on top. Drawn
 * once at build time for each post. The title is set in Geist, the site's
 * own type, from a copy kept beside this file (src/site/blog/fonts, under
 * the SIL Open Font License).
 */
export async function shareImage(post: Post): Promise<ImageResponse> {
  const [cover, font] = await Promise.all([loadCover(post), readFile(join(process.cwd(), "src/site/blog/fonts/Geist-SemiBold.ttf"))]);
  const art = `data:image/svg+xml;base64,${Buffer.from(cover).toString("base64")}`;
  const mark = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff"><path d="${LOGO_BLADE}"/><path d="${LOGO_BLADE}" transform="rotate(180 256 256)"/></svg>`).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#04050b", fontFamily: "Geist" }}>
        {/* Satori draws plain img elements only, so next/image has no place here. The art sits to the right, so its motif clears the words; it is 16 by 9, so a little of its top and bottom is cut. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} width={1200} height={675} alt="" style={{ position: "absolute", left: 330, top: -22, width: 1200, height: 675 }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", backgroundImage: "linear-gradient(90deg, #04050b 0%, #04050b 34%, rgba(4,5,11,0.6) 55%, rgba(4,5,11,0) 75%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 720, height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#fff", fontSize: 30, letterSpacing: "-0.02em" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={34} height={34} alt="" />
            <span>Coere</span>
            <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>Blog</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ color: "#fff", fontSize: post.title.length > 40 ? 54 : 66, lineHeight: 1.04, letterSpacing: "-0.04em" }}>{post.title}</div>
            <div style={{ display: "flex", gap: 18, fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: "#a3b0fd" }}>{post.category}</span>
              <span>{formatPostDate(post.date)}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...SHARE_SIZE, fonts: [{ name: "Geist", data: font, weight: 600, style: "normal" }] },
  );
}
