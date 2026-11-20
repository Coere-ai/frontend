import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hiddenPage, pageMetadata } from "@/lib/seo";
import { articleGraph } from "@/site/blog/article-graph";
import { PostArticle } from "@/site/blog/post-article";
import { PostCard } from "@/site/blog/post-card";
import { postAuthor, postBySlug, posts, readNext } from "@/site/content/posts";
import { JsonLd } from "@/site/seo/json-ld";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

/** Share text without its picture, so this folder's generated pictures are the ones used. Setting images to undefined would drop them too. */
function withoutImages<T extends object>(share: T | null | undefined): Omit<T, "images"> {
  const copy = { ...share } as T & { images?: unknown };
  delete copy.images;
  return copy;
}

/**
 * The post's title, description and canonical link, shared as an article.
 * The share pictures come from this folder's opengraph-image and
 * twitter-image, so the site's default picture is left out here.
 */
export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  if (!post) return hiddenPage;
  const meta = pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, keywords: [post.category === "Company" ? "Coere news" : `Coere ${post.category.toLowerCase()}`] });
  const article: Metadata = {
    ...meta,
    authors: [{ name: postAuthor(post).name }],
    openGraph: { ...withoutImages(meta.openGraph), type: "article", publishedTime: post.date, section: post.category, authors: [postAuthor(post).name] },
    twitter: withoutImages(meta.twitter),
  };
  return post.placeholder ? { ...article, ...hiddenPage } : article;
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd data={articleGraph(post)} />
      <PostArticle post={post} />
      <section aria-labelledby="read-next" className="border-t border-neutral-200/80 bg-[#f7f8fc] py-20 md:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="read-next" className="text-3xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-4xl">
              Read next
            </h2>
            <Link href="/blog" className="group inline-flex items-center gap-1.5 rounded-sm text-[15px] font-medium text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
              All posts
              <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
            {readNext(post).map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
