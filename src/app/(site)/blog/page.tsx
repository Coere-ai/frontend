import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FeaturedPost } from "@/site/blog/featured-post";
import { PostCard } from "@/site/blog/post-card";
import { posts } from "@/site/content/posts";
import { Container } from "@/site/ui/container";
import { SoftHero } from "@/site/ui/soft-hero";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "The latest news, launches, and insights from Coere.",
  path: "/blog",
  keywords: ["Coere blog", "Coere news"],
});

/** The newest post is featured on top; the rest follow as soft cards. */
export default function BlogPage() {
  const [latest, ...rest] = posts;
  return (
    <>
      <SoftHero eyebrow="Blog" title="The latest news, launches, and insights">
        <div className="mt-12 md:mt-16">
          <FeaturedPost post={latest} />
        </div>
      </SoftHero>
      <section className="pb-28">
        <Container>
          <h2 className="text-[13px] font-semibold text-neutral-500">More posts</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
