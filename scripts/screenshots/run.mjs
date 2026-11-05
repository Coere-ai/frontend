// Takes every picture under docs/screenshots: the public site, the
// dashboard (the extension's Console framed by coere.ai) and the admin
// panel, against a fake Supabase seeded with a made up world. See
// scripts/screenshots/README.md.
//
//   node scripts/screenshots/run.mjs --user owner --password 'a long password' [--coere-v2 ../coere-v2] [--only site,admin,dashboard]

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright } from "./lib/playwright.mjs";
import { createShooter } from "./lib/shoot.mjs";
import { startStack } from "./lib/stack.mjs";
import { FERNHILL, MAYA } from "./seed/people.mjs";
import { shootAdmin } from "./shots/admin.mjs";
import { shootDashboard } from "./shots/dashboard.mjs";
import { shootSite } from "./shots/site.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([a-z0-9-]+)(?:=(.*))?$/.exec(argv[i]);
    if (!m) throw new Error(`unknown argument ${argv[i]}`);
    out[m[1]] = m[2] ?? argv[++i];
  }
  return out;
}

const a = args(process.argv.slice(2));
if (!a.user || !a.password) {
  console.error("usage: node scripts/screenshots/run.mjs --user <admin user> --password <admin password> [--coere-v2 <dir>] [--only site,admin,dashboard] [--port 3210] [--scale 1]");
  process.exit(2);
}
const coereV2 = resolve(a["coere-v2"] ?? process.env.COERE_V2 ?? join(ROOT, "../coere-v2"));
const only = new Set((a.only ?? "site,admin,dashboard").split(","));
const port = Number(a.port ?? 3210);
const scale = Number(a.scale ?? 1);
const outDir = resolve(a.out ?? join(ROOT, "docs/screenshots"));
const now = Date.now();

const playwright = loadPlaywright(coereV2);
const shooter = createShooter(outDir);
const scratch = mkdtempSync(join(tmpdir(), "coere-shots-"));

console.log("Starting the fake Supabase and the site");
const stack = await startStack({ port, user: a.user, password: a.password, now });
// The dev server runs in its own process group; a crash here must not leave it running.
process.on("uncaughtException", (error) => {
  console.error(error);
  void stack.stop().finally(() => process.exit(1));
});
try {
  const mayaId = stack.world.people.find((p) => p.email === MAYA.email).id;
  const orgId = stack.world.orgId.get(FERNHILL.slug);

  if (only.has("dashboard")) {
    console.log("Writing Maya's memory file with the extension's own code");
    const memoryFile = join(scratch, "maya.coere");
    execFileSync("npx", ["tsx", join(ROOT, "scripts/screenshots/maya/memory.mjs"), coereV2, memoryFile, String(now)], { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] });
    console.log("Dashboard");
    await shootDashboard(playwright, shooter, { coereV2, proxy: stack.proxy, supabaseSpki: stack.fake.tls.spki, memoryFile, fake: stack.fake, mayaId, now, scale });
  }
  if (only.has("site") || only.has("admin")) {
    const browser = await playwright.chromium.launch();
    try {
      if (only.has("site")) {
        console.log("Site");
        await shootSite(browser, stack.next.url, shooter, { scale });
      }
      if (only.has("admin")) {
        console.log("Admin");
        await shootAdmin(browser, stack.next.url, shooter, { user: a.user, password: a.password, mayaId, orgId, scale });
      }
    } finally {
      await browser.close();
    }
  }
} catch (error) {
  console.error(error);
  console.error(stack.next.log().slice(-4000));
  process.exitCode = 1;
} finally {
  await stack.stop();
  rmSync(scratch, { recursive: true, force: true });
}

const total = shooter.taken.reduce((n, t) => n + t.bytes, 0);
console.log(`${shooter.taken.length} pictures, ${(total / 1e6).toFixed(1)} MB, in ${outDir}`);
