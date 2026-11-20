import { CheckIcon } from "@/site/ui/icons/interface-icons";

/**
 * A short list of what something does, each line behind a bare tick in Coere blue.
 * A line can lead with a bold name, written as "Name: what it does".
 * `row` lays the lines side by side for a centered heading: one line from
 * tablet width up, wrapping only on a phone.
 */
export function CheckList({ items, tone = "dark", row = false, className }: { items: string[]; tone?: "dark" | "light"; row?: boolean; className?: string }) {
  const text = tone === "light" ? "text-white/90" : "text-neutral-700 dark:text-white/80";
  const tick = tone === "light" ? "text-brand-300" : "text-brand-500 dark:text-brand-300";
  return (
    <ul className={`${row ? "flex flex-wrap justify-center gap-x-7 gap-y-2.5 md:flex-nowrap md:whitespace-nowrap" : "space-y-2.5"} ${className ?? ""}`}>
      {items.map((item) => {
        const [name, ...rest] = item.split(": ");
        return (
          <li key={item} className={`flex gap-2.5 text-[15px] leading-snug ${text}`}>
            <CheckIcon size={18} strokeWidth={2} className={`mt-px shrink-0 ${tick}`} />
            <span>
              {rest.length > 0 ? (
                <>
                  <strong className="font-medium">{name}:</strong> {rest.join(": ")}
                </>
              ) : (
                item
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
