// Starts the site with `next dev --webpack` (Turbopack refuses a
// node_modules that is a symlink, as it is in a worktree) and waits until
// it answers. The child gets exactly the settings the shots need, so a
// value the shell set (USER is always set) never leaks in.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));

export async function startNext({ port, env }) {
  const child = spawn("npx", ["next", "dev", "--webpack", "-p", String(port)], {
    cwd: ROOT,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, NEXT_TELEMETRY_DISABLED: "1", ...env },
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
