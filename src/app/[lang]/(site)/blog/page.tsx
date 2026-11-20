import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BlogHero } from "@/site/blog/blog-hero";
import { PostGrid } from "@/site/blog/post-grid";
import { postsIn } from "@/site/content/posts";
import { I18nProvider } from "@/site/i18n/client";
import { getLocale, getMessages } from "@/site/i18n/server";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { seo }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...seo.blog, path: "/blog", keywords: ["Coere blog", "Coere news"], locale, translated: true });
}

/**
 * The newest post as the dark hero's picture, then the rest as a grid with
 * category filters, all on the dark page. The titles and summaries are in
 * the page's language; each post itself is in English for now.
 */
export default async function BlogPage() {
  const { blog } = await getMessages();
  const posts = postsIn(blog);
  return (
    <I18nProvider messages={{ blog }}>
      <DarkPage>
        <BlogHero post={posts[0]} words={blog} />
        <section aria-labelledby="more-posts" className="py-20 md:py-28">
          <Container>
            <PostGrid posts={posts.slice(1)} />
          </Container>
        </section>
      </DarkPage>
    </I18nProvider>
  );
}
