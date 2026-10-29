import { LogoMark } from "@/components/logo";

/** The Coere mark and name, both in the brand blue. */
export function Brand({ size = "md" }: { size?: "md" | "lg" }) {
  const mark = size === "lg" ? "h-8 w-8" : "h-[26px] w-[26px]";
  const text = size === "lg" ? "text-[22px]" : "text-[19px]";
  return (
    <span className="flex items-center gap-2.5 text-brand-500">
      <LogoMark className={`${mark} shrink-0`} />
      <span className={`${text} font-semibold tracking-[-0.03em]`}>Coere</span>
    </span>
  );
}
