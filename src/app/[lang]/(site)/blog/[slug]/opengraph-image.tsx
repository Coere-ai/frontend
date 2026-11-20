import { shareImage, SHARE_SIZE } from "@/site/blog/share-image";
import { postBySlug, posts } from "@/site/content/posts";
import { locales } from "@/site/i18n/locales";

export const size = SHARE_SIZE;
export const contentType = "image/png";
export const alt = "A post from the Coere blog";
export const dynamicParams = false;

/** An image route does not take its language from the layout above it, so it names every language and post itself. */
export function generateStaticParams() {
  return locales.flatMap((lang) => posts.map((post) => ({ lang, slug: post.slug })));
}

/** The post's share picture: its cover art with its title, drawn at build time. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = postBySlug((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  return shareImage(post);
}
