import { flagEmoji } from "./labels";

/** A place name with its country's flag in front. */
export function Flagged({
  country,
  children,
  strong = false,
}: {
  country: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${strong ? "font-medium" : ""}`}>
      <span aria-hidden className="text-[15px] leading-none">
        {flagEmoji(country)}
      </span>
      {children}
    </span>
  );
}
