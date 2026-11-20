import { LogoMark } from "@/components/logo";
import { formatPostDate, postAuthor, type Post } from "@/site/content/posts";

/** A hairline between two parts of a meta line, so no dot or dash stands in for a separator. */
function Rule({ dark }: { dark?: boolean }) {
  return <span aria-hidden="true" className={`h-3 w-px ${dark ? "bg-white/20" : "bg-neutral-300"}`} />;
}

/** A post's category, date and reading time on one quiet line. The post page leaves the category to its breadcrumb. */
export function PostMeta({ post, dark = false, category = true, className = "" }: { post: Post; dark?: boolean; category?: boolean; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] ${dark ? "text-white/60" : "text-neutral-500"} ${className}`}>
      {category ? (
        <>
          <span className={`font-semibold ${dark ? "text-brand-300" : "text-brand-600"}`}>{post.category}</span>
          <Rule dark={dark} />
        </>
      ) : null}
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <Rule dark={dark} />
      <span>{post.readMinutes} min read</span>
    </p>
  );
}

/**
 * Who wrote a post, with the Coere mark as the team's face. A founder named
 * by the post shows their name and role instead.
 */
export function PostAuthor({ post, dark = false }: { post: Post; dark?: boolean }) {
  const author = postAuthor(post);
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-brand-500 text-white"}`}>
        <LogoMark className="h-[18px] w-[18px]" />
      </span>
      <span className="text-left leading-tight">
        <span className={`block text-[14.5px] font-medium ${dark ? "text-white" : "text-neutral-950"}`}>{author.name}</span>
        {author.role ? <span className={`block text-[13px] ${dark ? "text-white/55" : "text-neutral-500"}`}>{author.role}</span> : null}
      </span>
    </span>
  );
}
