import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type Post } from "@/site/content/posts";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { hoverUnderline } from "@/site/ui/hover-underline";

/** The newest post, wide, with its image beside the words. */
export function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid items-center gap-8 rounded-3xl bg-neutral-50 p-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-12">
      <div className="overflow-hidden rounded-2xl">
        <Image src={post.image} alt="" width={754} height={421} unoptimized priority className="aspect-[754/421] w-full object-cover" />
      </div>
      <div className="px-4 pb-6 md:px-0 md:pr-10 md:pb-0">
        <p className="text-[13px] text-neutral-500">
          Latest, {formatPostDate(post.date)}
        </p>
        <h2 className={`mt-3 text-3xl font-medium tracking-[-0.035em] text-neutral-950 text-balance md:text-4xl ${hoverUnderline}`}>{post.title}</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">{post.excerpt}</p>
        <span className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
          Read the post
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
