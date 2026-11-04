/**
 * When the products that are not out yet open, and what their coming soon
 * pages say. The operator sets each moment in /admin/launch, stored in the
 * site_settings table. LAUNCH_AT is the moment the pages count to when
 * Supabase is not configured or nothing is saved yet. Change it here.
 */
export const LAUNCH_AT = "2026-11-23T17:00:00Z";

export const LAUNCH_PRODUCTS = ["connect", "teams"] as const;
export type LaunchProduct = (typeof LAUNCH_PRODUCTS)[number];

/** One product's countdown: the moment it opens, and whether its page shows the timer. */
export type LaunchSetting = { at: string; show: boolean };

export const LAUNCH_DEFAULT: LaunchSetting = { at: new Date(LAUNCH_AT).toISOString(), show: true };

export function isLaunchProduct(value: unknown): value is LaunchProduct {
  return typeof value === "string" && (LAUNCH_PRODUCTS as readonly string[]).includes(value);
}

export const launchCopy: Record<
  LaunchProduct,
  {
    /** The product's name, as the admin panel and the thank you line say it. */
    name: string;
    /** The page that counts down to it. */
    path: string;
    eyebrow: string | null;
    title: string;
    /** The heading once the moment has passed. */
    here: string;
    line: string;
    /** The line once the moment has passed. */
    hereLine: string;
    /** Whether the Chrome mark sits in its chip above the heading. */
    chrome: boolean;
  }
> = {
  connect: {
    name: "Coere Connect",
    path: "/install",
    eyebrow: "Coere Connect",
    title: "Coming soon on the Chrome Web Store",
    here: "Coere Connect is here",
    line: "One memory across every AI. Say you are interested and we will email you the day it is out.",
    hereLine: "One memory across every AI, now in the Chrome Web Store.",
    chrome: true,
  },
  teams: {
    name: "Coere for Teams",
    path: "/try-teams",
    eyebrow: null,
    title: "Coere for Teams is coming soon",
    here: "Coere for Teams is here",
    line: "Shared memory for your whole team, with a free week to try it. Say you are interested and we will email you when it opens.",
    hereLine: "Shared memory for your whole team, with a free week to try it.",
    chrome: false,
  },
};
