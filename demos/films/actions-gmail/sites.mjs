/**
 * This film opens no AI chat site. It needs fake Gmail's own pages, which
 * the shared build has no step for, so they are written here, as the build
 * reads this file: coere-v2's Gmail page builder renders them under tsx
 * (gmail-pages.mts), next to the film's page.
 */
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
if (V2) {
  const out = resolve(here, "../../../public/preview/live/actions-gmail");
  const input = JSON.stringify({ out, script: "/preview/live/actions-gmail/gmail-tab.js" });
  execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "gmail-pages.mts")], { input, cwd: V2, env: process.env, stdio: ["pipe", "inherit", "inherit"] });
}

export default [];
