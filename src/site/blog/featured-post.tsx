import Link from "next/link";
import type { Post } from "@/site/content/posts";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { Underlined } from "@/site/ui/underlined";
import { PostCover } from "./post-cover";
import { PostAuthor, PostMeta } from "./post-meta";

/** The newest post, large: its cover on the left and its words on the right, on the dark band. */
export function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid items-center gap-8 rounded-[30px] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-brand-300 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16"
    >
      <PostCover
        post={post}
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="rounded-[24px] ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgba(82,103,247,0.55)] transition-shadow duration-500 group-hover:shadow-[0_40px_140px_-30px_rgba(82,103,247,0.75)]"
        imageClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
      />
      <div>
        <PostMeta post={post} dark />
        <h2 className="mt-4 text-[2.25rem] leading-[1.06] font-semibold tracking-[-0.04em] text-white text-balance md:text-[3rem]">
          <Underlined big light>{post.title}</Underlined>
        </h2>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/65 text-pretty md:text-lg">{post.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
          <PostAuthor post={post} dark />
          <span className="inline-flex items-center gap-2 text-[15px] font-medium text-white">
            Read the post
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRightIcon size={15} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
