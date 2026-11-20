import type { Block } from "@/site/content/posts";
import { InlineText } from "./inline-text";
import { slugify } from "./inline";

/** A post's headings, for its table of contents. */
export function postHeadings(body: Block[]): { id: string; text: string }[] {
  return body.flatMap((block) => (typeof block !== "string" && "h2" in block ? [{ id: slugify(block.h2), text: block.h2 }] : []));
}

/**
 * A post's words in the reading column: about 680 pixels wide, 19 pixel
 * type with room between lines, and headings that sit clear of the
 * floating navbar when a contents link jumps to them.
 */
export function PostBody({ body }: { body: Block[] }) {
  return (
    <div className="text-[18px] leading-[1.75] text-neutral-700 md:text-[19px] dark:text-white/75 [&>*:first-child]:mt-0">
      {body.map((block, i) => {
        if (typeof block === "string") {
          // The opening paragraph leads in a size up, as a magazine sets its first lines.
          return (
            <p key={i} className={i === 0 ? "text-[20px] leading-[1.65] text-neutral-900 md:text-[22px] dark:text-white/90" : "mt-6"}>
              <InlineText text={block} />
            </p>
          );
        }
        if ("h2" in block) {
          return (
            <h2 key={i} id={slugify(block.h2)} className="mt-14 scroll-mt-28 text-[26px] leading-tight font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white md:text-[30px]">
              {block.h2}
            </h2>
          );
        }
        if ("list" in block) {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={i} className={`mt-6 space-y-3 pl-6 ${block.ordered ? "list-decimal marker:font-semibold marker:text-brand-600 dark:marker:text-brand-300" : "list-disc marker:text-brand-400"}`}>
              {block.list.map((item) => (
                <li key={item} className="pl-2">
                  <InlineText text={item} />
                </li>
              ))}
            </List>
          );
        }
        if ("quote" in block) {
          return (
            <blockquote key={i} className="mt-10 border-l-[3px] border-brand-500 pl-6 text-[22px] leading-snug font-medium tracking-[-0.02em] text-neutral-950 dark:border-brand-400 dark:text-white md:text-[24px]">
              <p>
                <InlineText text={block.quote} />
              </p>
              {block.cite ? <footer className="mt-3 text-[15px] font-normal tracking-normal text-neutral-500 dark:text-white/60">{block.cite}</footer> : null}
            </blockquote>
          );
        }
        return (
          <pre key={i} className="mt-8 overflow-x-auto rounded-2xl bg-[#0b0d1a] p-5 font-mono text-[14.5px] leading-relaxed text-[#e0e5ff] ring-1 ring-white/5 dark:bg-[#10132a] dark:ring-white/10">
            <code>{block.code}</code>
          </pre>
        );
      })}
    </div>
  );
}
