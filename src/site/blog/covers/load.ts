import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Post } from "@/site/content/posts";
import { coverScene, logosFor } from "./index";
import { pixelate } from "./pixelate";

/** Covers already drawn in this process, so the cover route and both share pictures draw each once. */
const drawn = new Map<string, Promise<string>>();

/**
 * A post's cover, with the AI logos it draws read from /public. It runs on
 * the server only, when the cover route and the share picture are built.
 */
export function loadCover(post: Post): Promise<string> {
  let cover = drawn.get(post.slug);
  if (!cover) {
    cover = draw(post);
    drawn.set(post.slug, cover);
    // A failed draw is not kept, so the next request tries again.
    cover.catch(() => drawn.delete(post.slug));
  }
  return cover;
}

async function draw(post: Post): Promise<string> {
  const kind = post.cover ?? "mark";
  const files = logosFor(kind);
  const texts = await Promise.all(files.map((file) => readFile(join(process.cwd(), "public", file), "utf8")));
  const logos = Object.fromEntries(files.map((file, i) => [file, texts[i]]));
  return pixelate(coverScene(kind, logos, post.date.slice(2, 4)), post.title);
}
