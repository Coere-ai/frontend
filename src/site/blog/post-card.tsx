import Link from "next/link";
import type { Post } from "@/site/content/posts";
import { Underlined } from "@/site/ui/underlined";
import { PostCover } from "./post-cover";
import { PostMeta } from "./post-meta";

/**
 * A post in a grid: its cover, its meta line, its title and summary. The
 * whole card opens it. `lg` is the blog's own two column grid; the default
 * suits three across.
 */
export function PostCard({ post, size = "md" }: { post: Post; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <Link href={`/blog/${post.slug}`} className="group block rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brand-500">
      <PostCover
        post={post}
        sizes={lg ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        className={`${lg ? "rounded-[24px]" : "rounded-[20px]"} ring-1 ring-neutral-950/[0.06] shadow-[0_24px_48px_-32px_rgba(23,27,77,0.45)] transition-shadow duration-300 group-hover:shadow-[0_30px_60px_-30px_rgba(40,50,180,0.55)] dark:shadow-none dark:ring-white/10 dark:group-hover:shadow-none`}
        imageClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
      />
      <PostMeta post={post} className="mt-5" />
      <h3 className={`mt-2.5 font-semibold text-neutral-950 text-balance dark:text-white ${lg ? "text-[22px] leading-[1.2] tracking-[-0.03em] md:text-[26px]" : "text-[21px] leading-[1.25] tracking-[-0.025em]"}`}>
        <Underlined big>{post.title}</Underlined>
      </h3>
      <p className={`mt-2 line-clamp-2 leading-relaxed text-neutral-600 dark:text-white/65 ${lg ? "text-[16px] md:text-[17px]" : "text-[15.5px]"}`}>{post.excerpt}</p>
    </Link>
  );
}
