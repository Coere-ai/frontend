import type { ReactNode } from "react";

/**
 * Where a demo sits on a page: the demo itself on the white page, with no
 * panel, artwork or tint behind it, so the site stays plain and calm.
 * `className` sets its size and place; a child placed absolutely fills it.
 */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`relative ${className ?? ""}`}>{children}</div>;
}
