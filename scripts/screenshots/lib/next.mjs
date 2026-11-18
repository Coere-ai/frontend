// Starts the site with `next dev --webpack` (Turbopack refuses a
// node_modules that is a symlink, as it is in a worktree) and waits until
// it answers. The child gets exactly the settings the shots need and the
// shell's proxy settings, so no other value the shell set (USER is always
// set) leaks in.

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/**
 * The shell's proxy settings. Where the network goes through a proxy,
 * next/font fetches Geist from Google Fonts through it; without them a run
 * draws every page in the fallback font.
 */
const PROXY_KEYS = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "NO_PROXY", "no_proxy"];

/**
 * One file that trusts the run's certificate and the certificates the shell
 * already trusts (a proxy's own, say), since NODE_EXTRA_CA_CERTS names one
 * file. It sits beside the run's certificate, so the run removes it.
 */
function trustBoth(runCa, shellCa) {
  if (!runCa || !shellCa || runCa === shellCa) return runCa;
  const both = join(dirname(runCa), "trust.pem");
  writeFileSync(both, `${readFileSync(runCa, "utf8")}\n${readFileSync(shellCa, "utf8")}`);
  return both;
}

export async function startNext({ port, env }) {
  const proxy = Object.fromEntries(PROXY_KEYS.filter((k) => process.env[k]).map((k) => [k, process.env[k]]));
  const ca = trustBoth(env.NODE_EXTRA_CA_CERTS, process.env.NODE_EXTRA_CA_CERTS);
  const child = spawn("npx", ["next", "dev", "--webpack", "-p", String(port)], {
    cwd: ROOT,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, NEXT_TELEMETRY_DISABLED: "1", ...proxy, ...env, ...(ca ? { NODE_EXTRA_CA_CERTS: ca } : {}) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let log = "";
  const keep = (b) => {
    log = (log + b.toString()).slice(-20_000);
    if (process.env.SHOTS_VERBOSE) process.stdout.write(b);
  };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);
  const url = `http://localhost:${port}`;
  const deadline = Date.now() + 180_000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`next dev exited:\n${log}`);
    try {
      const res = await fetch(`${url}/privacy`);
      if (res.ok) break;
    } catch {
      // Not listening yet.
    }
    if (Date.now() > deadline) throw new Error(`next dev did not answer in time:\n${log}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  return {
    url,
    log: () => log,
    stop: async () => {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        // Already gone.
      }
      await new Promise((r) => setTimeout(r, 500));
    },
  };
}
