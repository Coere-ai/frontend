import type { ReactNode } from "react";
import { PhotoHero } from "@/site/blocks/photo-hero";
import type { Background } from "@/site/content/backgrounds";
import { contactHref } from "@/site/content/navigation";
import type { HeroCopy } from "@/site/content/pages/types";

/** A product page's opening: its copy over its artwork, with the app on the right. */
export function ProductHero({ copy, background, app, appFit, secondary }: { copy: HeroCopy; background: Background; app: ReactNode; appFit?: "bleed" | "contained"; secondary?: { href: string; label: string } }) {
  return <PhotoHero photo={background.src} {...copy} primary={{ href: contactHref, label: "Talk to Us" }} secondary={secondary} app={app} appFit={appFit} />;
}
