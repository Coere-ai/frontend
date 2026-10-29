/**
 * Builds each industry's demo screens from the real app screens the coere-v2
 * demo scripts saved, with that field's people, chats and memories in place:
 *
 *   node scripts/industries/build-demos.mjs
 *
 * Templates are in ./templates, each field's content in ./fields/<slug>.mjs,
 * and the screens land in public/preview/screens/industries/<slug>/. The
 * content is made up for the demos, written to be true to how each field
 * works, and every screen is the product's own markup and styles.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chatNew, chatSent, client, clientLine, cori, graph, terminal } from "./adapters.mjs";

const here = new URL(".", import.meta.url).pathname;
const out = new URL("../../public/preview/screens/industries/", import.meta.url).pathname;
const template = (name) => readFileSync(join(here, "templates", `${name}.html`), "utf8");
const screens = { "chat-new": chatNew, "chat-sent": chatSent, graph, client, cori, "client-line": clientLine, terminal };

const only = process.argv[2];
for (const file of readdirSync(join(here, "fields"))) {
  const slug = file.replace(/\.mjs$/, "");
  if (only && only !== slug) continue;
  const { field } = await import(join(here, "fields", file));
  mkdirSync(join(out, slug), { recursive: true });
  for (const [name, build] of Object.entries(screens)) {
    // Assets sit two folders up from an industry's screens, not one.
    const html = build(template(name), field).replace(/\.\.\/assets\//g, "../../assets/");
    writeFileSync(join(out, slug, `${name}.html`), html);
  }
  console.log(`${slug}: ${Object.keys(screens).length} screens`);
}
