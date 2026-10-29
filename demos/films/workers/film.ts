import { play } from "../../stage/player";
import { role, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { consoleWorld } from "./console-world";
import { answerAction } from "./cori";
import { workersBackEnd, type WorkersBackEnd } from "./workers";

/**
 * Cori's workers, ported beat by beat from coere-v2's
 * tools/demo-video/workers.demo.ts (coere-actions.md 10, 16.2): Maya asks
 * the Cori page for 20 biotech companies with leads. Cori hands the
 * search to four workers, each in a tab of its own, and the chat shows a
 * live preview of each one at work. Their finds merge into one table,
 * each value with the page it came from, to export or copy. A second run
 * is stopped with Stop all.
 *
 * Every surface is Coere's own code: the dashboard's Cori page with its
 * worker grid and result table, Cori's answer to the line, the service
 * worker's worker runs (workers.ts) and the Actions page script in each
 * worker's tab (worker-page.ts), on coere-v2's fake search engine and
 * company sites, with its fake model's plan and extraction.
 */

const CHAPTERS = [
  { id: "handoff", title: "Find 20 companies" },
  { id: "progress", title: "Watch them work" },
  { id: "report", title: "The table" },
  { id: "stop-all", title: "Stop all" },
];

const LINE = "find 20 biotech companies with leads";
const SECOND = "find 20 gene therapy companies with leads";
const DASHBOARD = "/preview/live/lib/console-v2.html";

let back: WorkersBackEnd | null = null;

const conv = (doc: Document) => doc.querySelector(".cx-cori-page");
const all = (doc: Document, selector: string) => [...(conv(doc)?.querySelectorAll(selector) ?? [])];
const firstCard: Query = (doc) => all(doc, ".cw-grid .cw-cards > li")[0];
const lastGrid = (doc: Document) => all(doc, ".cw-grid").at(-1) ?? null;
const lastTable: Query = (doc) => all(doc, ".cw-table").at(-1);
const stopAll: Query = role("button", "Stop all", { within: lastGrid });
const progressOf = (tab: Tab) => (all(tab.doc, ".cw-progress").at(-1)?.textContent ?? "").trim();

/** Polls until `test` holds, or gives up after `ms`. */
async function until(test: () => boolean, ms: number, what: string): Promise<void> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) throw new Error(`never: ${what}`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Types a line into the Cori page's box at a person's pace and sends it. */
async function ask(s: Stage, page: Tab, line: string): Promise<void> {
  await s.click(page, ".cx-cori-page textarea", { after: 200 });
  await s.type(page, line, 45);
  await s.wait(350);
  await s.press(page, "Enter");
  await s.rest();
}

/** The chapters the page was asked to start at that come after the first run: it runs at once, unseen, to get there. */
const AFTER_RUN = new Set(["report", "stop-all"]);

async function film(s: Stage): Promise<void> {
  if (s.fast && AFTER_RUN.has(new URLSearchParams(location.search).get("from") ?? "")) back!.setTempo(60);
  const opening = s.open("cori", `${DASHBOARD}?tab=cori`);
  s.say("Some tasks need many pages read. Cori splits them across workers.");
  await s.card("Cori's workers", "A big search, split across tabs that work at once.", 2600);
  const page = await opening;
  await s.waitFor(page, ".cx-cori-page textarea");
  await s.film(page);

  s.chapter("handoff");
  s.say("Maya asks for 20 biotech companies, each with a person to contact.");
  await ask(s, page, LINE);
  await s.waitFor(page, firstCard, 60_000);
  s.say("Cori starts four workers. Each one searches and reads company sites in a tab of its own.");
  await s.wait(3000);

  s.chapter("progress");
  s.say("The chat shows what each worker sees, live, with its own Stop and Take over.");
  await s.glide(page, firstCard);
  await s.wait(4200);
  await s.rest();
  s.say("The count climbs as rows come in.");
  await s.wait(7000);
  // The rest of the search passes quickly here, as the film left it out.
  back!.setTempo(s.fast ? 60 : 5);
  await until(() => /20 of 20 found/.test(progressOf(page)), 400_000, "20 of 20 found");
  await s.waitFor(page, lastTable, 60_000);
  await until(() => back!.tabs() === 0, 60_000, "the workers' tabs closed");
  back!.setTempo(1);

  s.chapter("report");
  const table = await s.waitFor(page, lastTable);
  table.scrollIntoView({ block: "nearest" });
  await s.wait(400);
  s.say("Their finds merge into one table, with no company twice.");
  await s.wait(3200);
  s.say("Each value keeps the page it came from. Export CSV and Copy take it anywhere.");
  await s.moveTo({ x: 900, y: 500 });
  await s.wheel(page, 260);
  await s.wait(3600);
  await s.rest();
  await s.wait(1200);

  s.chapter("stop-all");
  await s.click(page, role("button", "New chat", { within: ".cx-cori-page" }), { after: 400 });
  s.say("In a new chat she starts another search. Stop all stops every worker and closes their tabs.");
  await ask(s, page, SECOND);
  await s.waitFor(page, stopAll, 60_000);
  await until(() => back!.tabs() > 0, 60_000, "the second run's tabs");
  await s.wait(3500);
  await s.click(page, stopAll, { after: 400 });
  await s.rest();
  await until(() => back!.tabs() === 0, 30_000, "the second run's tabs closed");
  await s.wait(2800);
  s.say("Cori never invents a value. Each one names the page it came from.");
  await s.card("Coere Actions", "Workers read only public pages, and every value names its source.", 2600);
  if (s.world.unanswered.length) console.log("UNANSWERED", JSON.stringify([...new Set(s.world.unanswered.map((u) => u.type))]));
}

function setup(world: World): void {
  back?.dispose();
  back = workersBackEnd(world);
  consoleWorld(world);
  world.write("local", {
    // Cori said hello on an earlier day.
    "coere.cori.hello": { at: Date.now() - 86_400_000 },
    // Browser Use as Settings writes it after Allow (tools/demo-video/actions/stage.ts setBrowserUse).
    "coere.browser_use": { on: true, level: "autonomous", model: "bolt", blocked: [], grantedAt: Date.now() - 86_400_000 },
  });
  world.on("cori.ask", (m) => answerAction(String((m.input as { line?: string } | undefined)?.line ?? "")));
}

play({ title: "Cori's workers", chapters: CHAPTERS }, film, setup);
