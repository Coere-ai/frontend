import type { ReactNode } from "react";
import { SplitHero, type HeroLink } from "@/site/blocks/split-hero";
import { contactHref, contactLabel } from "@/site/content/navigation";
import type { HeroCopy } from "@/site/content/pages/types";

/**
 * A product page's opening: its copy on the left and the app on the right,
 * over the product's own backdrop. The main button is the waitlist unless
 * the page names its own. `laser` is for the dark heroes, Solutions and Forge.
 */
export function ProductHero({ copy, backdrop, app, appFit, laser, tone, primary, secondary }: { copy: HeroCopy; backdrop: ReactNode; app: ReactNode; appFit?: "framed" | "contained"; laser?: boolean; tone?: "light" | "dark"; primary?: HeroLink; secondary?: HeroLink }) {
  return <SplitHero {...copy} primary={primary ?? { href: contactHref, label: contactLabel }} secondary={secondary} app={app} appFit={appFit} backdrop={backdrop} laser={laser} tone={tone} />;
}
