// The welcome pictures: coere.ai/welcome framing the extension's own
// onboarding (the fake v4 build from coere-v2), first its one choice as
// Connect Coere leaves it, then the working screen while Maya's chats are
// in and her memory builds in the background, with its small live card.
// It runs in a browser of its own, after every other area, since a second
// browser joins Maya's account. The AI behind the build is coere-v2's
// fake Claude (lib/fake-ai.mjs), so the build reads her made up chats.

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { engineCall, launchWithExtension } from "../lib/extension.mjs";
import { signInAndConnect } from "../lib/maya-browser.mjs";
import { libraryConversations, libraryProjects } from "../maya/chats.mjs";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const VIEWPORT = { width: 1440, height: 1000 };

/**
 * Lines in Maya's own voice, one more message at the end of each of her
 * first chats, for this browser alone. The fake Claude reads a chat with
 * sentence rules ("my name is", "is due", "works at"), and her chats are
 * written for people, so without these the build would read every chat and
 * find nothing. Each line is a fact of her made up world (maya/memory-records.mjs).
 */
const LINES = [
  "my name is Maya Collins.",
  "i just started as an account director at Fernhill Creative.",
  "i live in Portland.",
  "the Copperline website is due December 4.",
  "the Bend photo shoot is on November 19.",
  "Priya Raman works at Fernhill Creative.",
  "the Kestrel spring campaign is due March 12.",
  "please always keep client emails short.",
  "Jordan Ellis works at Fernhill Creative.",
  "i love trail running.",
];

function withLines(convs) {
  return convs.map((c, i) => {
    if (i >= LINES.length) return c;
    const at = new Date(Date.parse(c.updatedAt) + 60_000).toISOString();
    return { ...c, updatedAt: at, capturedAt: at, messages: [...c.messages, { role: "user", text: LINES[i], createdAt: at }] };
  });
}

/** Starts the fake Claude under tsx and waits for the port it prints. */
async function startFakeAi(coereV2) {
  const child = spawn("npx", ["tsx", "scripts/screenshots/lib/fake-ai.mjs", coereV2], { cwd: ROOT, stdio: ["pipe", "pipe", "inherit"] });
  const lines = createInterface({ input: child.stdout });
  const port = await new Promise((resolve, reject) => {
    child.once("exit", (code) => reject(new Error(`the fake AI exited with ${code}`)));
    lines.on("line", (line) => {
      const m = /^port (\d+)$/.exec(line);
      if (m) resolve(Number(m[1]));
    });
  });
  return { port, stop: () => child.stdin.end() };
}

/** Polls `read` until `done` holds of what it returns. */
async function until(read, done, timeoutMs, what) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const value = await read().catch(() => null);
    if (value !== null && done(value)) return value;
    if (Date.now() > end) throw new Error(`gave up waiting for ${what}, last saw ${JSON.stringify(value?.counts ? { state: value.state, stopClass: value.stopClass, counts: value.counts } : value)}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

export async function shootWelcome(playwright, shooter, { coereV2, proxy, supabaseSpki, now, scale }) {
  const ai = await startFakeAi(coereV2);
  proxy.useAi(ai.port);
  const browser = await launchWithExtension(playwright, { coereV2, proxy, supabaseSpki, viewport: VIEWPORT, scale });
  try {
    const { consoleUrl, welcome } = await signInAndConnect(browser.context);
    await shooter.prepare(welcome);
    const ob = welcome.frameLocator('iframe[title="Coere"]');
    // The onboarding's first step, as Connect Coere leaves it, with the AIs she uses chosen.
    await ob.getByRole("heading").first().waitFor({ timeout: 60_000 });
    for (const id of ["chatgpt", "claude", "gemini"]) await ob.locator(`.cx-ai[data-platform="${id}"]`).getByRole("checkbox").check();
    await welcome.waitForTimeout(3000);
    await shooter.shot(welcome, "dashboard", "welcome");

    // Her chats, as Extract all would have saved them, from a Console page of its own.
    const engine = await browser.context.newPage();
    await engine.goto(`${consoleUrl}?tab=logs`);
    await engine.waitForTimeout(1500);
    for (const project of libraryProjects()) await engineCall(engine, "upsertProject", { project });
    await engineCall(engine, "upsertConversations", { convs: withLines(libraryConversations(now)) });
    await until(() => engineCall(engine, "memory.status"), (s) => (s.held?.chats ?? 0) > 0, 120_000, "chats to build from");

    // As Start does: the finish owed, then the build, so the onboarding opens on its working screen.
    await engine.evaluate(() => chrome.storage.local.set({ "coere.memory.finish": { v: 1, state: "owed" } }));
    await engineCall(engine, "memory.control", { action: "build", mode: "direct", from: "onboarding" });
    await welcome.bringToFront();
    await welcome.reload();
    await ob.getByRole("heading", { name: "Coere is saving your chats and building your memory." }).waitFor({ timeout: 60_000 });
    // The live card past its first second: memory's step with its count, not Preparing.
    const memoryRow = ob.locator(".ob-live-text").nth(1);
    await until(() => memoryRow.innerText({ timeout: 5000 }), (t) => /^(Sorting your chats|Choosing what to keep|Building memories|Linking related things)/.test(t), 120_000, "memory's step on the live card");
    await welcome.waitForTimeout(1500);
    await shooter.shot(welcome, "dashboard", "welcome-working");
  } finally {
    await browser.close();
    proxy.useAi(null);
    ai.stop();
  }
}
