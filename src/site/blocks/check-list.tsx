import { CheckCircleIcon } from "@/site/ui/icons/interface-icons";

/**
 * A short list of what something does, each line behind a ticked circle.
 * A line can lead with a bold name, written as "Name: what it does".
 */
export function CheckList({ items, tone = "dark", className }: { items: string[]; tone?: "dark" | "light"; className?: string }) {
  const text = tone === "light" ? "text-white/90" : "text-neutral-700";
  return (
    <ul className={`space-y-2.5 ${className ?? ""}`}>
      {items.map((item) => {
        const [name, ...rest] = item.split(": ");
        return (
          <li key={item} className={`flex gap-2.5 text-[15px] leading-snug ${text}`}>
            <CheckCircleIcon size={18} className="mt-px shrink-0" />
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
