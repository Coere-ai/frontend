import { formatPostDate, postAuthor, type Post } from "@/site/content/posts";

/**
 * A post's category, date and reading time on one quiet line, set apart by
 * space alone, with the category in Coere blue. The post page leaves the
 * category to its breadcrumb.
 */
export function PostMeta({ post, dark = false, category = true, className = "" }: { post: Post; dark?: boolean; category?: boolean; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px] ${dark ? "text-white/60" : "text-neutral-500 dark:text-white/60"} ${className}`}>
      {category ? <span className={`font-semibold ${dark ? "text-brand-300" : "text-brand-600 dark:text-brand-300"}`}>{post.category}</span> : null}
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span>{post.readMinutes} min read</span>
    </p>
  );
}

/** Who wrote a post, as plain words: the Coere team, or a founder the post names with their role. */
export function PostAuthor({ post, dark = false }: { post: Post; dark?: boolean }) {
  const author = postAuthor(post);
  return (
    <span className="block text-left leading-tight">
      <span className={`block text-[14.5px] font-medium ${dark ? "text-white" : "text-neutral-950 dark:text-white"}`}>{author.name}</span>
      {author.role ? <span className={`mt-0.5 block text-[13px] ${dark ? "text-white/55" : "text-neutral-500 dark:text-white/55"}`}>{author.role}</span> : null}
    </span>
  );
}
