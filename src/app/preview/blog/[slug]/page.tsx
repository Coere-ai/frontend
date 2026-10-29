import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/site/blog/post-article";
import { PostCard } from "@/site/blog/post-card";
import { postBySlug, posts } from "@/site/content/posts";
import { Container } from "@/site/ui/container";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/blog/[slug]">): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: PageProps<"/preview/blog/[slug]">) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <>
      <PostArticle post={post} />
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <Container>
          <p className="text-sm font-medium text-neutral-500">More posts</p>
          <div className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
