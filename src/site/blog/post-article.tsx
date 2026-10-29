import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type Post } from "@/site/content/posts";
import { Container } from "@/site/ui/container";

/** A post in full: a narrow reading column under a wide image. */
export function PostArticle({ post }: { post: Post }) {
  return (
    <article className="pt-16 pb-24 md:pt-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="text-[14px] text-neutral-500 hover:text-neutral-950">
            Blog
          </Link>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-6xl md:leading-[1.04]">{post.title}</h1>
          <p className="mt-6 text-[15px] text-neutral-500">
            {formatPostDate(post.date)}, {post.readMinutes} min read
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl">
          <Image src={post.image} alt="" width={754} height={421} unoptimized priority className="aspect-[754/421] w-full object-cover" />
        </div>
        <div className="mx-auto mt-14 max-w-2xl space-y-6 text-[18px] leading-[1.75] text-neutral-700">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
