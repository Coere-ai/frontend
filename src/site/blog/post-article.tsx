import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { Post } from "@/site/content/posts";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { ChevronRightIcon } from "@/site/ui/icons/interface-icons";
import { PostBody, postHeadings } from "./post-body";
import { PostCover } from "./post-cover";
import { PostAuthor, PostMeta } from "./post-meta";
import { PostToc } from "./post-toc";
import { ShareLinks } from "./share-links";

/** A post with this many headings or more gets a table of contents beside it on a wide screen. */
const TOC_FROM = 3;

/**
 * A post in full, laid out like an editorial page: the title, its one line
 * dek and byline, a wide cover, then the reading column with the contents
 * on its left and the share links on its right when the screen is wide.
 */
export function PostArticle({ post }: { post: Post }) {
  const url = `${siteConfig.url}/blog/${post.slug}`;
  const headings = postHeadings(post.body);
  const toc = headings.length >= TOC_FROM;
  return (
    <article className={`relative isolate pt-[128px] pb-20 md:pt-[160px] md:pb-28 ${UNDER_NAV}`}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[linear-gradient(180deg,#f3f5ff_0%,rgba(243,245,255,0)_100%)] dark:hidden" />
      <Container>
        <header className="mx-auto max-w-[860px] text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1.5 text-[14px] text-neutral-500 dark:text-white/60">
            <Link href="/blog" className="rounded-sm font-medium text-neutral-700 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-white/85 dark:hover:text-white dark:focus-visible:outline-brand-300">
              Blog
            </Link>
            <ChevronRightIcon size={14} className="text-neutral-400 dark:text-white/40" />
            <span>{post.category}</span>
          </nav>
          <h1 className="mx-auto mt-6 max-w-[800px] text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.045em] text-neutral-950 text-balance dark:text-white md:text-[3.75rem] lg:text-[4.25rem]">{post.title}</h1>
          <p className="mx-auto mt-6 max-w-[680px] text-[19px] leading-relaxed text-neutral-600 text-pretty dark:text-white/65 md:text-[21px]">{post.excerpt}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <PostAuthor post={post} />
            <PostMeta post={post} category={false} className="text-[14.5px]" />
          </div>
        </header>

        <PostCover
          post={post}
          priority
          sizes="(min-width: 1200px) 1120px, 100vw"
          className="mx-auto mt-12 max-w-[1120px] rounded-[20px] ring-1 ring-neutral-950/[0.06] shadow-[0_40px_90px_-50px_rgba(23,27,77,0.6)] md:mt-16 md:rounded-[28px] dark:shadow-none dark:ring-white/10"
        />

        <div className="mx-auto mt-14 grid max-w-[1120px] md:mt-20 xl:grid-cols-[minmax(0,1fr)_680px_minmax(0,1fr)] xl:gap-12">
          <aside className="hidden xl:block">{toc ? <div className="sticky top-28">{<PostToc headings={headings} />}</div> : null}</aside>
          <div className="mx-auto w-full max-w-[680px]">
            <PostBody body={post.body} />
            {post.cta ? (
              <div className="mt-12">
                <ButtonLink href={post.cta.href}>{post.cta.label}</ButtonLink>
              </div>
            ) : null}
            <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-neutral-200 pt-8 dark:border-white/10">
              <PostAuthor post={post} />
              <div className="flex items-center gap-4">
                <span className="text-[14px] text-neutral-500 dark:text-white/60">Share this post</span>
                <ShareLinks url={url} title={post.title} />
              </div>
            </div>
          </div>
          <aside aria-label="Share" className="hidden xl:block">
            <div className="sticky top-28 w-10">
              <ShareLinks url={url} title={post.title} layout="column" />
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
