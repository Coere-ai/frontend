import type { SiteSetup } from "./stage";
import type { World } from "./world";

/**
 * What a demo's top page offers the tabs inside it, as `window.__demo`.
 * A tab reads it through `parent` (every tab is on the same origin), so
 * the real content script and dashboard in the tabs share one extension.
 */
export interface DemoHost {
  world: World;
  /** Where chrome.runtime.getURL points: the extension's fonts and icons. */
  assets: string;
  /** The replica site a tab stands for. */
  site(tab: string): SiteSetup;
  /** A tab says Coere has started on it. */
  ready(tab: string): void;
  /** Anything else a film hands its tabs, by name. */
  extra: Record<string, unknown>;
}

export const ASSETS = "/preview/live/lib/ext/";
