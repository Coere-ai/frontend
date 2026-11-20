import { loadCover } from "@/site/blog/covers/load";
import { postBySlug, posts } from "@/site/content/posts";

/** Every post's cover is drawn once, at build time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

/** A post's cover art as SVG, sharp at any size: the cards, the post page and the menus all show it. */
export async function GET(_request: Request, { params }: RouteContext<"/blog/[slug]/cover.svg">) {
  const post = postBySlug((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  return new Response(await loadCover(post), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}
