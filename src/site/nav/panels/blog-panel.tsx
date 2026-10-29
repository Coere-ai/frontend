import Image from "next/image";
import Link from "next/link";
import { posts } from "@/site/content/posts";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { PanelMore } from "./panel-parts";
import { Underlined } from "@/site/ui/underlined";

/** A title whose last word and arrow never part across a line break. */
function TitleWithArrow({ title }: { title: string }) {
  const split = title.lastIndexOf(" ");
  return (
    <>
      {title.slice(0, split + 1)}
      <span className="whitespace-nowrap">
        {title.slice(split + 1)}
        <ArrowRightIcon size={15} className="ml-1.5 inline-block align-[-2px] transition-transform group-hover:translate-x-0.5" />
      </span>
    </>
  );
}

/**
 * Blog menu: the title and a Read more link on the left, and the three newest
 * posts as image cards on a soft grey field to the right.
 */
export function BlogPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-10">
      <div className="flex flex-col justify-between py-1">
        <div>
          <p className="text-[28px] font-medium tracking-[-0.03em] text-neutral-950">Blog</p>
          <p className="mt-2 text-[15px] text-neutral-500">The latest news, launches, and insights</p>
        </div>
        <PanelMore href="/blog">Read more</PanelMore>
      </div>

      <ul className="grid grid-cols-3 gap-6">
        {posts.slice(0, 3).map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={post.image}
                  alt=""
                  width={754}
                  height={421}
                  unoptimized
                  className="aspect-[754/421] w-full object-cover"
                />
              </div>
              <p className="mt-4 text-[15px] leading-snug text-neutral-950">
                <Underlined><TitleWithArrow title={post.title} /></Underlined>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
