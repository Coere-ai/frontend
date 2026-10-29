import type { Metadata } from "next";
import { FeaturedPost } from "@/site/blog/featured-post";
import { PostCard } from "@/site/blog/post-card";
import { posts } from "@/site/content/posts";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";

export const metadata: Metadata = {
  title: "Blog",
  description: "The latest news, launches, and insights from Coere.",
};

export default function BlogPage() {
  const [latest, ...rest] = posts;
  return (
    <section className="pt-20 pb-28 md:pt-28">
      <Container>
        <SectionHeading as="h1" eyebrow="Blog" title="The latest news, launches, and insights" />
        <div className="mt-14">
          <FeaturedPost post={latest} />
        </div>
        <div className="mt-20 grid gap-x-8 gap-y-14 md:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
