import type { ReactNode } from "react";
import type { Background } from "@/site/content/backgrounds";
import { SizedPhoto } from "@/site/ui/sized-photo";

/**
 * A rounded panel with artwork behind, for a demo to sit on, like a product
 * shot. The artwork fills the panel; whatever goes inside floats over it
 * with room around it.
 */
export function Stage({ background, children, className }: { background: Background; children: ReactNode; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[28px] bg-neutral-950 ${className ?? ""}`}>
      <SizedPhoto src={background.src} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="-z-10 object-cover" />
      {children}
    </div>
  );
}
