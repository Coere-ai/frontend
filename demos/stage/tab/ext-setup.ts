import type { DemoHost } from "../host";
import { installChrome } from "./chrome";

/**
 * Makes an extension page (the dashboard, onboarding, the toolbar popup)
 * at home in a demo tab: chrome.* is the demo's, shared with every other
 * tab through the top page. Imported before the page's own code, so it is
 * in place when that code first runs.
 */
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tab = (frameElement as HTMLIFrameElement).dataset.tab ?? "";
installChrome(host.world, tab, host.assets);
addEventListener("load", () => setTimeout(() => host.ready(tab), 300), { once: true });
