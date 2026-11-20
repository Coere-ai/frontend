import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type Post } from "@/site/content/posts";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

/** A post in full: a bold title over a soft wash, a wide image, then a narrow reading column. */
export function PostArticle({ post }: { post: Post }) {
  return (
    <article className="relative isolate pt-14 pb-24 md:pt-20">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(50%_80%_at_50%_0%,#e3e8ff_0%,rgba(238,241,255,0.55)_45%,rgba(255,255,255,0)_75%)]" />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Link href="/blog" className="group inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
            <ArrowRightIcon size={14} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Blog
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 text-balance md:text-[4rem] md:leading-[1.02]">{post.title}</h1>
          <p className="mt-6 text-[15px] text-neutral-500">
            {formatPostDate(post.date)}, {post.readMinutes} min read
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[32px] shadow-[0_40px_80px_-48px_rgba(40,50,133,0.5)]">
          <Image src={post.image} alt="" width={754} height={421} unoptimized preload className="aspect-[754/421] w-full object-cover" />
        </div>
        <div className="mx-auto mt-14 max-w-2xl space-y-6 text-[18px] leading-[1.75] text-neutral-700">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
        {post.cta ? (
          <div className="mx-auto mt-10 max-w-2xl">
            <ButtonLink href={post.cta.href}>{post.cta.label}</ButtonLink>
          </div>
        ) : null}
      </Container>
    </article>
  );
}
