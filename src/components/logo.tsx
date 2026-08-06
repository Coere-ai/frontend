import { siteConfig } from "@/lib/site";

/** The Coere mark: one blade, mirrored through the center. Inherits currentColor. */
export function LogoMark({ className }: { className?: string }) {
  const blade = "M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z";

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={blade} />
      <path d={blade} transform="rotate(180 256 256)" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName = "text-brand-500",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className={`h-6 w-6 shrink-0 ${markClassName}`} />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
        {siteConfig.name}
      </span>
    </span>
  );
}
