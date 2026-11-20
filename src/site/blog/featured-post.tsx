import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type Post } from "@/site/content/posts";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { Underlined } from "@/site/ui/underlined";

/** The featured post, wide: a soft card with its image beside the words. */
export function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid items-center gap-6 rounded-[32px] bg-white p-3 shadow-[0_1px_2px_rgba(20,17,15,0.04),0_32px_64px_-40px_rgba(40,50,133,0.35)] ring-1 ring-neutral-200/70 transition-shadow hover:shadow-[0_1px_2px_rgba(20,17,15,0.04),0_40px_80px_-40px_rgba(40,50,133,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-12"
    >
      <div className="overflow-hidden rounded-[24px]">
        <Image src={post.image} alt="" width={754} height={421} unoptimized preload className="aspect-[754/421] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
      </div>
      <div className="px-4 pb-6 md:px-0 md:pr-10 md:pb-0">
        <p className="flex flex-wrap items-center gap-3 text-[13px] text-neutral-500">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">Featured</span>
          {formatPostDate(post.date)}, {post.readMinutes} min read
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 text-balance md:text-[2.75rem] md:leading-[1.05]">
          <Underlined big>{post.title}</Underlined>
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">{post.excerpt}</p>
        <span className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-600">
          Read the post
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
