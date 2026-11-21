import { BOOKING_CAL_LINK } from "./links";

/**
 * Cal.com's official inline embed, loaded only when someone opens the
 * booking pop up. The loader below is Cal.com's own embed snippet
 * (@calcom/embed-snippet 1.3.3) in typed form, with one addition: the script
 * tag reports when it fails to load, so the pop up can offer the booking page
 * in a new tab instead.
 */

const EMBED_SRC = "https://app.cal.com/embed/embed.js";
const ORIGIN = "https://app.cal.com";
const NAMESPACE = "coere-demo";
const BRAND = "#5267f7";

type CalQueue = ((...args: unknown[]) => void) & { q: unknown[][] };
type Cal = CalQueue & { loaded?: boolean; ns: Record<string, CalQueue> };

declare global {
  interface Window {
    Cal?: Cal;
  }
}

/** Defines window.Cal as a queue and adds embed.js once, as the official snippet does. */
function calFunction(onScriptError: () => void): Cal {
  if (window.Cal) return window.Cal;
  const cal = function (...args: unknown[]) {
    const self = window.Cal!;
    if (!self.loaded) {
      self.ns = {};
      self.q = self.q || [];
      const script = document.createElement("script");
      script.src = EMBED_SRC;
      script.async = true;
      script.addEventListener("error", onScriptError);
      document.head.appendChild(script);
      self.loaded = true;
    }
    if (args[0] === "init") {
      const namespace = args[1];
      if (typeof namespace === "string") {
        const api = function (...inner: unknown[]) {
          api.q.push(inner);
        } as CalQueue;
        api.q = [];
        self.ns[namespace] = self.ns[namespace] || api;
        self.ns[namespace].q.push(args);
        self.q.push(["initNamespace", namespace]);
        return;
      }
    }
    self.q.push(args);
  } as Cal;
  cal.q = [];
  cal.ns = {};
  window.Cal = cal;
  return cal;
}

export type CalEvents = { onReady: () => void; onFailed: () => void };

/**
 * Draws the booking page inside `element`, dark, in Coere blue, as a month
 * view. Calls onReady when the page has loaded inside the frame and onFailed
 * when the script cannot load or Cal.com reports the link failed.
 */
export function mountBooking(element: HTMLElement, { onReady, onFailed }: CalEvents): void {
  const cal = calFunction(onFailed);
  cal("init", NAMESPACE, { origin: ORIGIN });
  const api = cal.ns[NAMESPACE];
  api("inline", {
    elementOrSelector: element,
    calLink: BOOKING_CAL_LINK,
    config: { layout: "month_view", theme: "dark" },
  });
  api("ui", {
    theme: "dark",
    cssVarsPerTheme: { light: { "cal-brand": BRAND }, dark: { "cal-brand": BRAND } },
    hideEventTypeDetails: false,
    layout: "month_view",
  });
  api("on", { action: "linkReady", callback: onReady });
  api("on", { action: "linkFailed", callback: onFailed });
}
