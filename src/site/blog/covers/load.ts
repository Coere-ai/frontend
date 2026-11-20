import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Post } from "@/site/content/posts";
import { coverSvg, logosFor } from "./index";

/**
 * A post's cover, with the AI logos it draws read from /public. It runs on
 * the server only, when the cover route and the share picture are built.
 */
export async function loadCover(post: Post): Promise<string> {
  const kind = post.cover ?? "mark";
  const files = logosFor(kind);
  const texts = await Promise.all(files.map((file) => readFile(join(process.cwd(), "public", file), "utf8")));
  const logos = Object.fromEntries(files.map((file, i) => [file, texts[i]]));
  return coverSvg(kind, post.title, logos, post.date.slice(2, 4));
}
