import type { ReactNode } from "react";

/**
 * The page frame: wide, so the site feels like a full screen workspace, with
 * generous side padding that grows on larger screens.
 */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-6 md:px-10 ${className ?? ""}`}>{children}</div>;
}
