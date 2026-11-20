import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type Post } from "@/site/content/posts";
import { Underlined } from "@/site/ui/underlined";

/** A post as a soft card: image, date, title and its one line summary. */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-[28px] bg-white p-2.5 shadow-[0_1px_2px_rgba(20,17,15,0.04),0_24px_48px_-36px_rgba(40,50,133,0.3)] ring-1 ring-neutral-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(20,17,15,0.04),0_32px_64px_-36px_rgba(40,50,133,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
    >
      <div className="overflow-hidden rounded-[20px]">
        <Image src={post.image} alt="" width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col px-4 pt-5 pb-5">
        <p className="text-[13px] text-neutral-500">
          {formatPostDate(post.date)}, {post.readMinutes} min read
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-neutral-950 text-balance">
          <Underlined big>{post.title}</Underlined>
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{post.excerpt}</p>
      </div>
    </Link>
  );
}
