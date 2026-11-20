"use client";

import { useState } from "react";
import { CATEGORIES, type Category, type Post } from "@/site/content/posts";
import { PostCard } from "./post-card";

type Filter = "All" | Category;

/**
 * The posts under the featured one, as a grid of large cards with the
 * categories as filters above it. Only categories that some of these posts
 * carry are offered. The page draws every card on the server first, so the
 * grid is complete before this runs.
 */
export function PostGrid({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const offered: Filter[] = ["All", ...CATEGORIES.filter((c) => posts.some((p) => p.category === c))];
  const shown = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="more-posts" className="text-3xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-4xl">
          More posts
        </h2>
        <div role="group" aria-label="Filter posts by category" className="-mx-1 flex max-w-full gap-1 overflow-x-auto rounded-[14px] bg-neutral-100 p-1">
          {offered.map((name) => {
            const on = name === filter;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(name)}
                className={`h-9 shrink-0 rounded-[10px] px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 ${on ? "bg-white text-neutral-950 shadow-[0_1px_2px_rgba(20,17,15,0.08),0_2px_8px_-2px_rgba(20,17,15,0.08)]" : "text-neutral-600 hover:text-neutral-950"}`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {filter === "All" ? `${shown.length} posts` : `${shown.length} ${shown.length === 1 ? "post" : "posts"} in ${filter}`}
      </p>
      <ul className="mt-10 grid gap-x-10 gap-y-16 md:mt-12 md:grid-cols-2">
        {shown.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} size="lg" />
          </li>
        ))}
      </ul>
    </>
  );
}
