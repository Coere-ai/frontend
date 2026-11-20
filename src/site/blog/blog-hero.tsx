import Link from "@/site/i18n/link";
import { PixelMatrixLogos, type MatrixLogoId } from "@/site/art/pixel-matrix-logos";
import { SplitHero } from "@/site/blocks/split-hero";
import type { Post } from "@/site/content/posts";
import { Underlined } from "@/site/ui/underlined";
import { PostCover } from "./post-cover";
import { PostMeta } from "./post-meta";

/** A few AIs only, so the wall stays quiet round the post. */
const WALL_LOGOS: readonly MatrixLogoId[] = ["chatgpt", "claude", "gemini", "perplexity", "deepseek"];

/**
 * The wall behind the blog's opening: flat near black with the Coere
 * Solutions LED wall of AI logos on it, fewer and dimmer. The wall is
 * lightened onto the flat black, so where it is dark the black shows
 * through untouched and only the lit cells add to it.
 */
function BlogBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#0b0a12]">
      <div className="absolute inset-0 opacity-60 mix-blend-lighten">
        <PixelMatrixLogos logos={WALL_LOGOS} layout="frame" className="[background:none]!" />
      </div>
    </div>
  );
}

/** The newest post as the hero's picture: its cover in a white card, its meta and title under it. */
function NewestPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-[26px] bg-white p-2.5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300"
    >
      <PostCover
        post={post}
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="rounded-[18px]"
        imageClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
      />
      <div className="px-3.5 pt-5 pb-4 md:px-5 md:pt-6 md:pb-5">
        <PostMeta post={post} />
        <h2 className="mt-2.5 text-[24px] leading-[1.15] font-semibold tracking-[-0.03em] text-neutral-950 text-balance md:text-[30px]">
          <Underlined big>{post.title}</Underlined>
        </h2>
      </div>
    </Link>
  );
}

/**
 * The blog's opening, on the dark split hero the product pages use: the
 * title, one line and a way to the newest post on the left, and that post
 * as a large card on the right. The hero marks itself dark, so the glass
 * navbar over it turns dark too.
 */
export function BlogHero({ post, words }: { post: Post; words: { title: string; line: string; readNewest: string } }) {
  return (
    <SplitHero
      title={words.title}
      line={words.line}
      primary={{ href: `/blog/${post.slug}`, label: words.readNewest }}
      app={<NewestPost post={post} />}
      appFit="contained"
      backdrop={<BlogBackdrop />}
      tone="dark"
    />
  );
}
