import type { ReactNode } from "react";

/**
 * The heading most sections open with: a small label, a large title and an
 * optional line under it. Left aligned by default, like the rest of the site.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const centered = align === "center" ? "mx-auto text-center" : "";
  return (
    <div className={`max-w-3xl ${centered}`}>
      {eyebrow ? <p className="text-sm font-medium text-neutral-500">{eyebrow}</p> : null}
      <Tag className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.25rem] md:leading-[1.05]">
        {title}
      </Tag>
      {description ? (
        <p className={`mt-5 max-w-2xl text-lg leading-relaxed text-neutral-500 text-pretty ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
