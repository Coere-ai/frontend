import { role } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import { inlineMemoryCss } from "./css-fix";
import { clearDock, groupButton, openByName, roleIn, searchBox, sideSheet } from "./helpers";

/**
 * The agency's Memory page (tools/demo-video/teams/memory.ts): the graph on
 * All, Company and Clients, a client opened to its slots with its sheet, a
 * contact's identity, and a client the chats found waiting in Review.
 */
export const CLIENT = "Kestrel Outdoor";
const CONTACT = "Dana Ruiz";

export const MEMORY_PAGE = "/preview/live/lib/console-v2-solution.html?tab=memory";

/**
 * The dashboard on the Memory page, drawn and settled, off screen until
 * filmed. `reload` opens it once first and then again, as the film reloads
 * the page after the build: Cori's hello tip says its one hello on the
 * first load, so the page the film shows is the one a person comes back to.
 */
export async function memoryPage(s: Stage, name = "dashboard", o: { reload?: boolean } = {}): Promise<Tab> {
  if (o.reload) {
    const first = await s.open(name, MEMORY_PAGE);
    await s.waitFor(first, searchBox);
    for (let i = 0; i < 15 && !("coere.cori.hello" in (s.world.stores.local ?? {})); i++) await new Promise((r) => setTimeout(r, 100));
  }
  const page = await s.open(name, MEMORY_PAGE);
  await inlineMemoryCss(page);
  await s.waitFor(page, searchBox);
  await clearDock(page);
  // The graph lays itself out over a second or two; the film waits for it to settle.
  await s.wait(1500);
  return page;
}

const scope = (name: string) => groupButton("Show", "Clients", name);

export async function agencyMemory(s: Stage, page: Tab): Promise<void> {
  s.chapter("graph");
  await s.film(page);
  s.say("All shows Company and Clients around Maya, beside her own sections.");
  await s.wait(3800);
  for (const [part, line] of [
    ["Company", "Company holds the agency: its people, its way of working and its tools."],
    ["Clients", "Clients has a folder for each client, with its contacts and promises."],
  ] as const) {
    s.say(line);
    await s.click(page, scope(part), { after: 300 });
    await s.rest();
    await s.wait(1500);
    await s.wait(3000);
  }
  await s.click(page, scope("All"), { after: 300 });
  await s.wait(1500);

  s.chapter("client");
  s.say(`Opened, ${CLIENT} draws its slots, and its sheet lists what sits in each.`);
  await openByName(s, page, CLIENT);
  await s.waitFor(page, roleIn(sideSheet(CLIENT), "heading", "Promises"));
  await s.wait(4500);
  s.say(`A contact at ${CLIENT} starts with how to reach her, her role and her client.`);
  await openByName(s, page, CONTACT);
  await s.waitFor(page, roleIn(sideSheet(CONTACT), "region", "Identity"));
  await s.wait(4200);
  await s.click(page, roleIn(sideSheet(CONTACT), "button", "Close", true), { after: 300 });

  s.chapter("new-client");
  s.say("A client the chats found waits in Review until Maya keeps it.");
  await s.click(page, role("button", "Review", { exact: true }), { after: 300 });
  const card = (doc: Document) => {
    const sheet = sideSheet("Review")(doc);
    return sheet ? [...sheet.querySelectorAll("article")].find((a) => /^New client: /.test((a.textContent ?? "").trim())) : null;
  };
  await s.waitFor(page, card);
  await s.glide(page, card);
  await s.wait(4000);
  await s.click(page, roleIn(sideSheet("Review"), "button", "Close", true), { after: 300 });
  await s.rest();
}
