import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BlogHero } from "@/site/blog/blog-hero";
import { PostGrid } from "@/site/blog/post-grid";
import { posts } from "@/site/content/posts";
import { Container } from "@/site/ui/container";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "The latest news, launches, and insights from Coere.",
  path: "/blog",
  keywords: ["Coere blog", "Coere news"],
});

/** The newest post as the dark hero's picture, then the rest as a grid with category filters. */
export default function BlogPage() {
  return (
    <>
      <BlogHero post={posts[0]} />
      <section aria-labelledby="more-posts" className="py-20 md:py-28">
        <Container>
          <PostGrid posts={posts.slice(1)} />
        </Container>
      </section>
    </>
  );
}
