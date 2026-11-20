import { loadCover } from "@/site/blog/covers/load";
import { postBySlug, posts } from "@/site/content/posts";
import { locales } from "@/site/i18n/locales";

/** Every post's cover is drawn once, at build time. */
export const dynamicParams = false;

/** A route handler does not take its language from the layout above it, so it names every language and post itself. */
export function generateStaticParams() {
  return locales.flatMap((lang) => posts.map((post) => ({ lang, slug: post.slug })));
}

/** A post's cover art as SVG, sharp at any size: the cards, the post page and the menus all show it. */
export async function GET(_request: Request, { params }: RouteContext<"/[lang]/blog/[slug]/cover.svg">) {
  const post = postBySlug((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  return new Response(await loadCover(post), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}
