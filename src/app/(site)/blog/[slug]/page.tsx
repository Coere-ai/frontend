import type { Metadata } from "next";
import { hiddenPage, pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { PostArticle } from "@/site/blog/post-article";
import { PostCard } from "@/site/blog/post-card";
import { postBySlug, posts } from "@/site/content/posts";
import { Container } from "@/site/ui/container";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  if (!post) return hiddenPage;
  const meta = pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}` });
  return post.placeholder ? { ...meta, ...hiddenPage } : meta;
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <>
      <PostArticle post={post} />
      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f5f7ff_100%)] py-24">
        <Container>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">More posts</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
