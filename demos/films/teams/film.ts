import { play } from "../../stage/player";
import type { Stage } from "../../stage/stage";
import type { World } from "../../stage/world";
import { agencyMemory, memoryPage } from "./agency";
import { answerMemory } from "./answers";
import { answerBuild } from "./build";
import { answerCori } from "./cori";
import { answerExtract } from "./extract";
import { extractAll, firstRun, theBuild } from "./first-run";
import { buildMemory } from "./memory";
import { pace } from "./pace";
import { askCori, deleteClient, exportClient, onTheSite } from "./work";

/**
 * The Coere for Teams film (coere-v2 tools/demo-video/teams.demo.ts): Maya,
 * account director at Fernhill Creative, sets up the company on the first
 * run, saves her chats and builds the agency's memory, then works with it:
 * Company and Clients on the graph, a client and a contact, a new client,
 * Cori on what was promised, a draft that gets its client and goes, a
 * client exported and another deleted. Coere for Teams' own pages and
 * content script run here; the engine's answers come from the agency's
 * memory (memory.ts), Cori is the service worker's own (cori.ts), and
 * Extract all and the build go at a site's and the engine's pace
 * (extract.ts, build.ts). Made up chats only.
 */

/** Today, at its start in UTC, which the agency's chats are dated back from. */
const today = () => Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
let mem: ReturnType<typeof buildMemory> | null = null;

/**
 * A tab the film closed leaves its storage and message listeners in the
 * World, and calling into a removed frame throws, which would break the
 * write for every other tab. Each listener is guarded here, so a gone tab
 * only goes quiet.
 */
function guardListeners(world: World): void {
  const watch = world.watchStorage.bind(world);
  world.watchStorage = (fn) =>
    watch((changes, area) => {
      try {
        fn(changes, area);
      } catch {
        // The tab is gone.
      }
    });
  const listen = world.listen.bind(world);
  world.listen = (tab, fn) =>
    listen(tab, (message, sender, reply) => {
      try {
        return fn(message, sender, reply);
      } catch {
        return undefined;
      }
    });
}

function setup(world: World): void {
  guardListeners(world);
  mem = buildMemory(today());
  answerMemory(world, mem);
  answerCori(world);
  answerExtract(world, mem);
  answerBuild(world, mem);
}

async function film(s: Stage): Promise<void> {
  pace.fast = () => s.fast;
  const m = mem!;
  const onboarding = await firstRun(s, m);
  await extractAll(s, onboarding);
  await theBuild(s, onboarding, m);

  const page = await memoryPage(s, "dashboard", { reload: true });
  await agencyMemory(s, page);
  s.close(onboarding);

  // The Memory page fresh, as the film opens it again; Ask Cori in the rail opens the Cori page.
  const fresh = await memoryPage(s, "cori");
  await askCori(s, fresh);
  s.close(page);

  await onTheSite(s, m);
  await exportClient(s);
  await deleteClient(s, m);
  s.say("Coere for Teams: one memory of the company and its clients.");
  await s.card("Coere for Teams", "Every client, every promise, in every chat.", 3500);
  if (s.world.unanswered.length) console.warn("Unanswered:", [...new Set(s.world.unanswered.map((u) => u.type))].join(" "));
}

play(
  {
    title: "Coere for Teams",
    chapters: [
      { id: "install", title: "Install" },
      { id: "company", title: "The company card" },
      { id: "extract", title: "Extract all" },
      { id: "build", title: "The build" },
      { id: "graph", title: "Company and Clients" },
      { id: "client", title: "A client" },
      { id: "new-client", title: "A new client" },
      { id: "cori", title: "Ask Cori" },
      { id: "chat", title: "The client in a chat" },
      { id: "share", title: "Share a client" },
      { id: "delete", title: "Delete a client" },
    ],
  },
  film,
  setup,
);
