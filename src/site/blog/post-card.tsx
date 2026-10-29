import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type Post } from "@/site/content/posts";
import { Underlined } from "@/site/ui/underlined";

/** A post as a card: image, date, title and its one line summary. */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl">
        <Image src={post.image} alt="" width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover" />
      </div>
      <p className="mt-5 text-[13px] text-neutral-500">
        {formatPostDate(post.date)}, {post.readMinutes} min read
      </p>
      <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] text-neutral-950 text-balance">
        <Underlined big>{post.title}</Underlined>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{post.excerpt}</p>
    </Link>
  );
}
