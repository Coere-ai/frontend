/**
 * The pages this film opens: a fresh Claude chat from coere-v2's fake site
 * builder, with Maya's 102 Claude chats in its sidebar, newest first,
 * the ones her memory came from (bake.mts, data/claude-chats.json); and
 * fake Gmail's mailbox, the page the toolbar popup opens over, written by
 * gmail.mts from coere-v2's own Gmail page builder as the build reads
 * this file.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
if (V2) {
  const out = resolve(here, "../../../public/preview/live/cori-chat");
  execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "gmail.mts")], { input: JSON.stringify({ out }), cwd: V2, env: process.env, stdio: ["pipe", "inherit", "inherit"] });
}

const titles = JSON.parse(readFileSync(join(here, "data/claude-chats.json"), "utf8"));

export default [{ out: "sites/claude.html", platform: "claude", chats: titles.map((title, i) => ({ id: `c${i + 1}`, title })) }];
