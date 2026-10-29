/**
 * This film opens no AI chat site. It needs fake Calendar's page, which
 * the shared build has no step for, so it is written here, as the build
 * reads this file: coere-v2's Calendar page builder renders it under tsx
 * (calendar-page.mts), next to the film's page.
 */
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
if (V2) {
  const out = resolve(here, "../../../public/preview/live/actions-calendar");
  const input = JSON.stringify({ out, script: "/preview/live/actions-calendar/calendar-tab.js" });
  execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "calendar-page.mts")], { input, cwd: V2, env: process.env, stdio: ["pipe", "inherit", "inherit"] });
}

export default [];
