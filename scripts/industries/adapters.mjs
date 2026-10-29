import { graphSvg } from "./graph.mjs";
import { swapText } from "./text-nodes.mjs";

/**
 * One function per saved screen. Each takes the screen as the demo script
 * saved it and an industry's content, and gives back the same screen with
 * that field's names, chats and memories in place. The pairs follow the
 * screen's text in document order, so an unexpected template fails loudly.
 */

const SIDEBAR_NEW = ["Notion PM role", "PearX interview prep", "GitHub handles for the team", "Applying to Stripe", "History reading list", "PHYS 137 lab 1 done", "A coworker wedding", "Sparrowhawk database upgrade", "SkipDoodle setup", "Lisbon trip", "Flight times for the trip", "DATA 100 problem set due date", "MATH 54 this term", "Classes this term"];
const SIDEBAR_TEAM = ["Personal", "Open house flyer", "Kestrel spring trail campaign", "Larkspur Dental patient booking site", "Process write up", "Store launch", "Tidewater billing", "Halvorsen contacts", "Osprey sign in code", "Granite Peak staging access", "Juniper Lane print budget", "Microsite stack", "Reusing copy", "Halvorsen livery quote"];
const zip = (from, to) => from.map((f, i) => [f, to[i]]);

/** The person in the chat site's corner. */
const person = (d) => [["MC", d.person.initials], ["Maya Collins", d.person.name]];

/** "[Context from Coere ...]" and its sections, as Coere writes it in front of a message. */
export function contextBlock(sections) {
  const body = sections.map((s) => [s.path, ...s.facts.map((f) => `- ${f}`)].join("\n")).join("\n");
  return `[Context from Coere, my saved memory. Use it if it helps.]\n${body}\n[End of context from Coere]`;
}

/** Strips attributes that still name the template's people, for screens that are decoration anyway. */
function scrub(html, names) {
  return html.replace(/ (aria-label|title|alt)="([^"]*)"/g, (all, name, value) => (names.some((n) => value.includes(n)) ? "" : all));
}
const TEMPLATE_NAMES = ["Kestrel", "PearX", "Maya", "Dana", "Fernhill", "Tidepool", "Juniper", "Halvorsen"];

/** ChatGPT, a new chat: the draft typed, and Coere's list of what goes with it open above the box. */
export function chatNew(html, d) {
  const c = d.context;
  return scrub(
    swapText(html, [
      ...zip(SIDEBAR_NEW, d.chats),
      ...person(d),
      ["Help me prep for PearX", c.draft],
      ["Fake ChatGPT for tests", "ChatGPT"],
      ["PearX interview prep", c.chat.title],
      ["Oct 19, 2026", c.chat.date],
      ["From 7 chats", c.about],
      ["Projects / Startups and businesses / PearX interview", c.rows[0].path],
      ["From 2 chats", c.rows[0].from],
      ["Projects / Startups and businesses / Tidepool", c.rows[1].path],
      ["From 1 chat", c.rows[1].from],
      ["Projects / Startups and businesses / Tidepool launch day talk", c.related[0].path],
      ["From 1 chat", c.related[0].from],
      ["Work / Job applications / Stripe application", c.related[1].path],
      ["From 2 chats", c.related[1].from],
      ["Adding your chat 'PearX interview prep' and your context on PearX interview and Tidepool", c.line],
      ["From 9 chats", c.lineFrom],
    ], "chat-new"),
    TEMPLATE_NAMES,
  );
}

/** ChatGPT after one Enter: the context in front of the draft, and the answer built on it. */
export function chatSent(html, d) {
  const c = d.context;
  // The sent message is one text node: the context, a blank line, then the draft.
  const sent = html.match(/>(\[Context from Coere[^<]*)</)[1].replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  return scrub(
    swapText(html, [
      ...zip(SIDEBAR_NEW, d.chats),
      ...person(d),
      [sent.trim(), `${contextBlock(c.sections)}\n\n${c.draft}`],
      ["Here is a plan for your PearX interview, built on the prep you already did.", c.answer.intro],
      [html.match(/>(1\. Open with traction[\s\S]*?end on the ask\.)</)[1], c.answer.steps],
      ["Ready for the first question?", c.answer.close],
      ["Fake ChatGPT for tests", "ChatGPT"],
    ], "chat-sent"),
    TEMPLATE_NAMES,
  );
}

/** The shared Coere for Teams parts: the firm's name, the memory count and the due soon line. */
const teamFrame = (d, extra = []) => [
  ["Fernhill Creative", d.firm],
  ...extra,
];
const dueSoon = (d) => [
  ["Juniper Lane wants the open house flyer proofed by", d.due.text],
  ["October 16", d.due.date],
  ["Overdue by 12 days", d.due.status],
  ["15 memories need a look.", d.due.review],
];

/** Puts the field's graph where the saved canvas was. */
function withGraph(html, svg) {
  return html.replace(/<canvas[^>]*>(<\/canvas>)?/, svg);
}

/** The Memory page: the whole graph of the firm and its clients. */
export function graph(html, d) {
  const g = d.graph;
  const out = swapText(html, [...teamFrame(d), ["93 memories from 66 chats in 3 topics", g.count], ...dueSoon(d)], "graph");
  return scrub(withGraph(out, graphSvg({ width: 1142, height: 648, center: [560, 300], hubs: g.hubs, scale: 0.64 })), TEMPLATE_NAMES);
}

/** One client opened: its part of the graph lit, and its sheet of contacts, promises and deadlines. */
export function client(html, d) {
  const k = d.client;
  const out = swapText(html, [
    ...teamFrame(d),
    ["93 memories from 66 chats in 3 topics", d.graph.count],
    ["Moved to Kestrel Outdoor, an organization in Clients.", `Moved to ${k.name}, an organization in Clients.`],
    ["Kestrel Outdoor", k.name],
    ["From 11 chats", k.from],
    ["Active client. 3 open promises.", k.status],
    ["Dana Ruiz", k.contacts[0]],
    ["Wen Liu", k.contacts[1]],
    ["spring trail campaign", k.engagement],
    ...k.promises.flatMap((p, i) => [
      [["Kestrel Outdoor Co agreed to send us their brand files before the kickoff on", "We promised Kestrel Outdoor the revised mockups for the spring trail campaign by", "I told Dana at Kestrel Outdoor I would send the recap deck by"][i], p[0]],
      [["May 10", "May 18", "February 4"][i], p[1]],
      [["May 2, 2025", "May 13, 2025", "Feb 1"][i], p[2]],
      [["Was due May 10, 2025", "Was due May 18, 2025", "Was due Feb 4"][i], p[3]],
    ]),
    ["Status call with Kestrel Outdoor on", k.meeting[0]],
    ["September 30", k.meeting[1]],
    ["to walk through the spring trail campaign timeline.", k.meeting[2]],
    ["Sep 28", k.meeting[3]],
    ["Wen also asked for a dark mode version of the spring trail campaign landing page.", k.requests[0][0]],
    ["Oct 7", k.requests[0][1]],
    ["Kestrel Outdoor Co wants a short monthly results report on the spring trail campaign with", k.requests[1][0]],
    ["three", k.requests[1][1]],
    ["numbers and no more.", k.requests[1][2]],
    ["May 2, 2025", k.requests[1][3]],
    ["Kestrel wants the hero banner on the home page in forest green.", k.requests[2][0]],
    ["Jul 12", k.requests[2][1]],
    ["The final files for the spring trail campaign are due", k.deadlines[0][0]],
    ["July 6", k.deadlines[0][1]],
    ["May 25", k.deadlines[0][2]],
    ["Was due Jul 6", k.deadlines[0][3]],
    ["The staging link for kestreloutdoor.com is ready for review, launch is", k.deadlines[1][0]],
    ["July 21", k.deadlines[1][1]],
    ["Jul 11", k.deadlines[1][2]],
    ["Was due Jul 21", k.deadlines[1][3]],
    ["The first Kestrel Outdoor handover report is due at the end of July.", k.deadlines[2][0]],
    ["Jun 15, 2025", k.deadlines[2][1]],
    ["Kestrel Outdoor Co wants invoices addressed to their new warehouse office from now on.", k.billing[0]],
    ["Jun 29, 2025", k.billing[1]],
    ["Pasting the creative brief Kestrel sent for the spring trail campaign: goals, audience,", k.document[0]],
    ["three", k.document[1]],
    ["key messages and the launch window.", k.document[2]],
    ["Oct 7", k.document[3]],
    ["spring trail campaign is for this", `${k.engagement} is for this`],
    ["Dana Ruiz works here", `${k.contacts[0]} works here`],
    ["Dana Ruiz works here", `${k.contacts[0]} works here`],
    ["Wen Liu works here", `${k.contacts[1]} works here`],
    ["Delete everything about Kestrel Outdoor", `Delete everything about ${k.name}`],
    ...dueSoon(d),
  ], "client").replace('value="Kestrel Outdoor"', `value="${k.name}"`);
  return scrub(withGraph(out, graphSvg({ width: 706, height: 648, center: [320, 290], hubs: d.graph.hubs, focus: k.name, scale: 0.6 })), TEMPLATE_NAMES);
}

/** Cori on the dashboard, answering about one client from memory, with where each part came from. */
export function cori(html, d) {
  const q = d.cori;
  const items = q.items.flatMap((it, i) => [
    ["Kestrel Outdoor", d.client.name],
    ["Filed under Clients, Kestrel Outdoor", `Filed under Clients, ${d.client.name}`],
    [["Kestrel Outdoor Co agreed to send us their brand files before the kickoff on", "We promised Kestrel Outdoor the revised mockups for the spring trail campaign by", "I told Dana at Kestrel Outdoor I would send the recap deck by"][i], it[0]],
    [["May 10", "May 18", "February 4"][i], it[1]],
    [["Was due May 10, 2025", "Was due May 18, 2025", "Was due Feb 4"][i], it[2]],
    [["Grok, May 2", "Claude, May 13", "Grok, Feb 1"][i], it[3]],
  ]);
  const out = swapText(html, [
    ...teamFrame(d),
    ["93 memories from 66 chats in 3 topics", d.graph.count],
    ...dueSoon(d),
    ["what did we promise Kestrel Outdoor?", q.question],
    ["what did we promise Kestrel Outdoor?", q.question],
    ["what did we promise Kestrel Outdoor?", q.question],
    ["3 open promises to Kestrel Outdoor, soonest first.", q.answer],
    ...items,
    ["Show Kestrel Outdoor", `Show ${d.client.name}`],
  ], "cori");
  return scrub(out.replace(/>Cori: 3 open promises[^<]*</, `>Cori: ${q.answer}<`), TEMPLATE_NAMES);
}

/** ChatGPT with a client named in the draft: the line says only that client's memory goes. */
export function clientLine(html, d) {
  const l = d.clientLine;
  return scrub(
    swapText(html, [
      ...zip(SIDEBAR_TEAM, l.chats),
      ...person(d),
      ["Help me answer Kestrel Outdoor about the spring trail campaign dates.", l.draft],
      ["Fake ChatGPT for tests", "ChatGPT"],
      ["Coere will add your context on the client Kestrel Outdoor", `Coere will add your context on the client ${d.client.name}`],
      ["From 3 chats", l.from],
    ], "client-line"),
    TEMPLATE_NAMES,
  );
}

/** A terminal: the field's own app asking Coere for context through the API. */
export function terminal(html, d) {
  const t = d.app;
  const out = html.match(/>\s*(\[Context from Coere[^<]*)</)[1].replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  const reasons = t.reasons.map(([path, why]) => `  ${path}: ${why}`).join("\n");
  return swapText(html, [
    ["event-planner", t.name],
    ['uv run context.py "Help me prepare for this interview"', `uv run context.py "${t.ask}"`],
    [out.trim(), `${contextBlock(t.sections)}\n\nFrom ${t.from} chats\n${reasons}`],
  ], "terminal");
}
