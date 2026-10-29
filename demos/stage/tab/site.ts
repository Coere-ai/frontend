import { startContent } from "@v2/apps/extension/src/content/main";
import type { DemoHost } from "../host";
import { installChrome } from "./chrome";
import { dress } from "./dress";
import { serveSiteData } from "./site-data";

/**
 * Runs in a replica chat site inside a live demo: the page the coere-v2
 * fake site builder made, then Coere's real content script on it, as the
 * extension injects it at document_idle. The top page says which site the
 * tab stands for, whose account it is and what the site answers.
 */
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tab = (frameElement as HTMLIFrameElement).dataset.tab ?? "";
const site = host.site(tab);
const href = new URL(site.path ?? "/", `https://${site.host}`);

// Coere finds its platform by the page's host name, which in a demo is the website's.
(globalThis as { __demoHosts?: Record<string, string> }).__demoHosts = { [location.hostname]: site.host };
installChrome(host.world, tab, host.assets);
serveSiteData(site.host, { "chatgpt.com": "chatgpt", "claude.ai": "claude", "gemini.google.com": "gemini" }[site.host] ?? "chatgpt");
Object.assign(window, { __coereFakeModes: { reply: "streamed", script: site.replies ?? [], ...site.modes } });
dress(site.host, site.person);

/** The window with the site's address in place of the website's, for the code that reads it from there. */
function windowAt(url: URL): Window {
  const at = {
    href: url.href,
    origin: url.origin,
    host: url.host,
    hostname: url.hostname,
    protocol: url.protocol,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    assign: (to: string) => location.assign(to),
    replace: (to: string) => location.replace(to),
    reload: () => location.reload(),
    toString: () => url.href,
  };
  return new Proxy(window, {
    get(target, key) {
      if (key === "location") return at;
      const value = Reflect.get(target, key, target);
      // Methods are bound to the real window; classes and constructors are left as they are.
      return typeof value === "function" && typeof key === "string" && !/^[A-Z]/.test(key) ? value.bind(target) : value;
    },
    set: (target, key, value) => Reflect.set(target, key, value, target),
  });
}

const start = () => void startContent(windowAt(href), document).then(() => host.ready(tab));
if (document.readyState === "complete") start();
else addEventListener("load", start, { once: true });
