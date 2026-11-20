import Image from "next/image";
import Link from "next/link";
import { formatPostDate, posts } from "@/site/content/posts";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { Underlined } from "@/site/ui/underlined";
import { EYEBROW, SECTION_TITLE, SECTION_Y, SOFT_CARD } from "./look";

/** The three newest posts, by date, whatever order the list is kept in. */
const newest = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

/**
 * From the blog, near the end of the home page: the three newest posts as
 * soft cards, each opening its post, and a way to the whole blog. It reads
 * the posts list, so a new post shows here by itself.
 */
export function BlogSection() {
  return (
    <section id="blog" aria-labelledby="blog-title" className={`scroll-mt-24 ${SECTION_Y}`}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={EYEBROW}>From the blog</p>
            <h2 id="blog-title" className={`mt-4 ${SECTION_TITLE}`}>
              News from the team
            </h2>
          </div>
          <ArrowLink href="/blog" className="text-neutral-950">
            Read the blog
          </ArrowLink>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {newest.map((post) => (
            <li key={post.slug} className="h-full">
              <Link href={`/blog/${post.slug}`} className={`group flex h-full flex-col overflow-hidden p-2.5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(20,17,15,0.04),0_36px_80px_-34px_rgba(23,27,77,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 ${SOFT_CARD}`}>
                <div className="overflow-hidden rounded-[20px]">
                  <Image src={post.image} alt="" width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col px-3.5 pt-5 pb-4">
                  <p className="text-[13px] text-neutral-500">
                    {formatPostDate(post.date)}, {post.readMinutes} min read
                  </p>
                  <h3 className="mt-2 text-[19px] leading-snug font-semibold tracking-[-0.02em] text-neutral-950 text-balance">
                    <Underlined big>{post.title}</Underlined>
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{post.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
