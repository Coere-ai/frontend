/**
 * This film opens no chat site: the dashboard's Cori page is an extension
 * page. What it needs written at build time is the fake web its workers
 * read (web.mts writes it, from coere-v2's own fake pages).
 */
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = resolve(process.env.COERE_V2 ?? "");
const out = resolve(here, "../../../public/preview/live/workers");
execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "web.mts")], { env: { ...process.env, COERE_V2: V2, OUT: out }, stdio: "inherit" });

export default [];
