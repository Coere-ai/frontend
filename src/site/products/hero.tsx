import type { ReactNode } from "react";
import { SplitHero, type HeroLink } from "@/site/blocks/split-hero";
import { contactHref } from "@/site/content/navigation";
import { getMessages } from "@/site/i18n/server";

/**
 * A product page's opening: its copy on the left and the app on the right,
 * over the product's own backdrop. The main button is the waitlist unless
 * the page names its own. `laser` is for the dark heroes, Solutions and Forge.
 * `intro` plays the home hero's entrance.
 */
export async function ProductHero({ copy, backdrop, app, appFit, laser, tone, primary, secondary, intro }: { copy: { title: string; line: string; checks: readonly string[] }; backdrop: ReactNode; app: ReactNode; appFit?: "framed" | "contained"; laser?: boolean; tone?: "light" | "dark"; primary?: HeroLink; secondary?: HeroLink; intro?: boolean }) {
  const waitlist = (await getMessages()).chrome.common.waitlist;
  return <SplitHero title={copy.title} line={copy.line} checks={[...copy.checks]} primary={primary ?? { href: contactHref, label: waitlist }} secondary={secondary} app={app} appFit={appFit} backdrop={backdrop} laser={laser} tone={tone} intro={intro} />;
}
