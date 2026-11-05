// The browser for the dashboard pictures: Chromium with the fake v4 build
// of the extension (built from coere-v2 with
// `COERE_VERSION=4 pnpm --filter @coere/extension build:fake`), loaded
// into a fresh profile, with www.coere.ai mapped to the local site and
// every other name going nowhere. localhost stays reachable, because the
// extension uploads the memory file to the fake Supabase's signed address.

import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SITE_HOST } from "./host-proxy.mjs";

export const EXTENSION_BUILD = "apps/extension/.output/chrome-mv3-fake-v4";

export async function launchWithExtension(playwright, { coereV2, proxy, supabaseSpki, viewport, scale }) {
  const ext = join(coereV2, EXTENSION_BUILD);
  if (!existsSync(join(ext, "manifest.json"))) {
    throw new Error(`No fake v4 build at ${ext}. In coere-v2 run: COERE_VERSION=4 pnpm --filter @coere/extension build:fake`);
  }
  const profile = mkdtempSync(join(tmpdir(), "coere-shots-profile-"));
  const context = await playwright.chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    viewport,
    deviceScaleFactor: scale,
    args: [
      `--disable-extensions-except=${ext}`,
      `--load-extension=${ext}`,
      "--no-proxy-server",
      `--host-resolver-rules=MAP ${SITE_HOST} 127.0.0.1:${proxy.port}, EXCLUDE localhost, MAP * ~NOTFOUND`,
      `--ignore-certificate-errors-spki-list=${[proxy.spki, supabaseSpki].filter(Boolean).join(",")}`,
    ],
  });
  return {
    context,
    close: async () => {
      await context.close();
      rmSync(profile, { recursive: true, force: true });
    },
  };
}

/** Waits for a tab whose address matches, across every tab of the context. */
export async function tabMatching(context, pattern, timeoutMs = 60_000) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const tab = context.pages().find((p) => pattern.test(p.url()));
    if (tab) return tab;
    if (Date.now() > end) throw new Error(`no tab matching ${pattern} in ${context.pages().map((p) => p.url()).join(", ")}`);
    await new Promise((r) => setTimeout(r, 250));
  }
}

/** One engine call from an extension page, the way the Console makes them. */
export async function engineCall(page, method, args) {
  return page.evaluate(
    async ([m, a]) => {
      const id = `shots-${Math.random().toString(36).slice(2)}`;
      const reply = await chrome.runtime.sendMessage({ ch: "coere", type: "engine.call", id, method: m, args: a });
      if (!reply) throw new Error("no reply from the engine");
      if (!reply.ok) throw new Error(`engine error ${reply.error.code}`);
      return reply.result;
    },
    [method, args],
  );
}
