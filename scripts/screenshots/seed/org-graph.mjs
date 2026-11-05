// What Maya's coworkers share with Fernhill Creative: each one's part of
// the organization graph, in the memory index shape the site keeps
// (src/lib/memory/index-types.ts), written to Storage where the site keeps
// member parts. When Maya's browser backs up her memory during the run,
// the site's own commit adds her part and merges all of them into the
// organization's graph, which the admin panel and the Console then read.

import { FERNHILL } from "./people.mjs";

/** [entity name, kind, parent name or null]. Shared by everyone, so the merge folds them into one each. */
const THINGS = [
  ["Fernhill Creative", "organization", null],
  ["Kestrel Outdoor", "organization", null],
  ["Kestrel spring campaign", "project", "Kestrel Outdoor"],
  ["Bend photo shoot", "event", "Kestrel spring campaign"],
  ["Copperline Energy", "organization", null],
  ["Copperline website refresh", "project", "Copperline Energy"],
  ["Northwind Coffee", "organization", null],
  ["Northwind packaging", "project", "Northwind Coffee"],
];

/** Each coworker's username and what they told their AIs about the work: [about, text, chat title, platform]. */
const SHARED = {
  daniel_okafor: [
    ["Fernhill Creative", "Fernhill Creative is a brand and design studio in Portland with seven people.", "Studio overview for the new site", "claude"],
    ["Fernhill Creative", "Fernhill bills clients monthly on the first business day.", "Billing schedule", "chatgpt"],
    ["Kestrel Outdoor", "Kestrel Outdoor renewed its retainer through the end of next year.", "Kestrel renewal notes", "claude"],
    ["Northwind Coffee", "Northwind Coffee came to Fernhill through a referral from Kestrel.", "Where our clients came from", "chatgpt"],
  ],
  priya_raman: [
    ["Bend photo shoot", "The Bend shoot runs two days with a crew of six.", "Bend shoot crew plan", "gemini"],
    ["Bend photo shoot", "The lodge in Bend is booked for November 19 to November 21.", "Bend lodge booking", "gemini"],
    ["Northwind packaging", "Ridgeline Press prints the Northwind packaging proofs.", "Print vendors", "chatgpt"],
    ["Copperline website refresh", "Copperline content is due to Lena by November 22.", "Copperline production schedule", "claude"],
  ],
  jordan_ellis: [
    ["Kestrel spring campaign", "The Kestrel spring look uses deep greens and a warm off white.", "Kestrel color palette", "claude"],
    ["Kestrel spring campaign", "Kestrel's logo stays untouched in the spring campaign.", "Kestrel brand rules", "chatgpt"],
    ["Northwind packaging", "Each Northwind blend gets its own illustrated landscape.", "Northwind label concepts", "gemini"],
  ],
  sofia_marin: [
    ["Copperline Energy", "Copperline's main audience is homeowners in the Pacific Northwest.", "Copperline audience research", "claude"],
    ["Kestrel Outdoor", "Kestrel's customers are mostly weekend hikers in their thirties.", "Kestrel customer profile", "chatgpt"],
    ["Northwind Coffee", "Northwind sells most of its coffee through grocery stores.", "Northwind channels", "claude"],
  ],
  theo_park: [
    ["Kestrel spring campaign", "The working line for the Kestrel campaign is Further, together.", "Kestrel headline ideas", "chatgpt"],
    ["Copperline website refresh", "Copperline's homepage copy keeps every sentence under twenty words.", "Copperline voice notes", "claude"],
  ],
  lena_brooks: [
    ["Copperline website refresh", "The Copperline site is built in Webflow with a CMS for case studies.", "Copperline build plan", "gemini"],
    ["Copperline website refresh", "The Copperline staging site goes up on November 25.", "Copperline launch checklist", "chatgpt"],
  ],
};

function partFor(username, now) {
  const created = new Date(now).toISOString();
  const id = (s) => `${username}_${s}`.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const entities = THINGS.map(([name, kind, parent]) => ({ id: id(name), kind, name, section: "work", parent: parent ? id(parent) : null, importance: kind === "organization" ? 5 : 4 }));
  const rows = SHARED[username];
  const sources = rows.map(([, , title, platform], i) => ({ id: `${platform}:${id(`chat_${i}`)}`, platform, title, capturedAt: new Date(now - (i + 2) * 86_400_000).toISOString(), messages: 4, sections: ["work"] }));
  const facts = rows.map(([about, text], i) => ({
    id: id(`fact_${i}`),
    subject: id(about),
    under: id(about),
    kind: "note",
    key: null,
    text,
    importance: 3,
    status: "active",
    sensitivity: null,
    first: sources[i].capturedAt,
    last: sources[i].capturedAt,
    sources: 1,
  }));
  return { v: 1, digest: `sha256-${username}`, created, timeZone: "America/Los_Angeles", self: null, sections: [{ key: "work", name: "Work" }], entities, facts, relations: [], sources, documents: [], truncated: false };
}

/** Writes each coworker's part into Storage, where the site's merge reads member parts. */
export async function seedOrgGraph(storage, people, orgId, now) {
  const org = orgId.get(FERNHILL.slug);
  for (const username of Object.keys(SHARED)) {
    const person = people.find((p) => p.username === username);
    const bytes = new TextEncoder().encode(JSON.stringify(partFor(username, now)));
    await storage.put(`memory/org/${org}/members/${person.id}.json`, bytes, "application/json");
  }
}
