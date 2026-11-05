// Maya Collins's chats, made up for the screenshots. She is an account
// director at Fernhill Creative, a made up brand agency in Portland, with
// three made up clients. The same chats fill the extension's Library and
// back her memory file (memory.mjs quotes them word for word), so every
// memory on the dashboard points at a chat the Library holds.
//
// Each chat is { key, platform, title, day, turns }, where `day` is how
// many days before the run it started and each turn is [what Maya said,
// what the AI answered]. Message n in a chat counts both sides from 1, so
// Maya's k-th line is message 2k - 1.

export const MEMORY_CHATS = [
  {
    key: "kestrel",
    platform: "chatgpt",
    title: "Kestrel spring campaign plan",
    day: 34,
    turns: [
      ["I'm the account director at Fernhill Creative and Kestrel Outdoor is my biggest client.", "Got it. What does Kestrel need from you this season?"],
      ["Kestrel's spring campaign launches on March 12.", "That gives you about four months. Want a working back schedule?"],
      ["Ana Ruiz is the marketing lead at Kestrel and signs off on every concept.", "Then plan a review with Ana before each round goes wide."],
      ["The photo shoot for Kestrel is in Bend on November 20.", "I can draft a shot list and a call sheet for Bend."],
    ],
  },
  {
    key: "copperline",
    platform: "claude",
    title: "Copperline website refresh",
    day: 30,
    turns: [
      ["Copperline Energy hired us to refresh their website.", "Nice. What is the scope of the refresh?"],
      ["The Copperline site is due on December 4.", "I'll keep that date in mind when we plan the sprints."],
      ["Marcus Hale runs marketing at Copperline and prefers a call to email.", "Noted. I can suggest an agenda for your next call with Marcus."],
    ],
  },
  {
    key: "northwind",
    platform: "gemini",
    title: "Northwind packaging budget",
    day: 27,
    turns: [
      ["Northwind Coffee wants new packaging for their three blends.", "Fun project. Do you have a budget yet?"],
      ["The Northwind packaging budget is $48,000.", "That covers design and a print proof round comfortably."],
      ["Elena Voss is the founder of Northwind and loves earthy colors.", "Then a palette of clay, moss and oat could land well with Elena."],
    ],
  },
  {
    key: "team",
    platform: "chatgpt",
    title: "Who does what at Fernhill",
    day: 25,
    turns: [
      ["Daniel Okafor founded Fernhill Creative and is my manager.", "Thanks. How big is the team?"],
      ["Priya Raman leads production at Fernhill.", "Production leads usually own the schedule. Does Priya?"],
      ["Jordan Ellis is our senior designer and leads the Kestrel look.", "Good to know who owns the visuals."],
      ["Sofia Marin is our strategist and Theo Park writes our copy.", "That's a well rounded team."],
    ],
  },
  {
    key: "recaps",
    platform: "claude",
    title: "How I write client recaps",
    day: 22,
    turns: [
      ["At Fernhill we send a recap within a day of every client call.", "A same day recap keeps everyone aligned. What goes in it?"],
      ["I like my recaps as short bullets with the decisions first.", "I'll write recaps that way: decisions, then owners, then dates."],
      ["Please write my emails in plain words, no buzzwords.", "Understood. Plain and direct."],
    ],
  },
  {
    key: "lisbon",
    platform: "chatgpt",
    title: "Lisbon trip in January",
    day: 20,
    turns: [
      ["Sam and I are going to Lisbon from January 14 to January 21.", "Lovely time to go. Want ideas for neighborhoods to stay in?"],
      ["I always take an aisle seat on long flights.", "I'll keep that in mind for the flight search."],
      ["I'm vegetarian, so I need dinner spots with good veggie options.", "Lisbon has plenty. I'll mark the best ones near Alfama."],
    ],
  },
  {
    key: "home",
    platform: "claude",
    title: "Weekend routine",
    day: 18,
    turns: [
      ["I live in Portland with my partner Sam and our dog Juniper.", "Sounds like a nice household. What do weekends look like?"],
      ["I run along the waterfront every Saturday morning.", "A great habit. Are you training for anything?"],
      ["I'm training for the Portland half marathon in May.", "I can build you a training plan that ramps up from here."],
    ],
  },
  {
    key: "offsite",
    platform: "gemini",
    title: "Q4 planning offsite",
    day: 15,
    turns: [
      ["Fernhill's Q4 planning offsite is on November 18.", "What do you want the team to leave with?"],
      ["I'm presenting the client roadmap at the offsite.", "I can help outline the roadmap slides."],
    ],
  },
  {
    key: "reviews",
    platform: "chatgpt",
    title: "Performance reviews",
    day: 12,
    turns: [
      ["I write performance reviews for Jordan and Theo this cycle.", "Want a simple structure for each review?"],
      ["The reviews are due to Daniel on December 1.", "Then drafts by late November leave time for edits."],
    ],
  },
  {
    key: "kestrel-shoot",
    platform: "claude",
    title: "Bend shoot logistics",
    day: 9,
    turns: [
      ["For the Bend shoot we need the crew on site by 7 in the morning.", "Early light is the point. I'll plan call times around it."],
      ["Priya is booking the van and the lodge for the Bend shoot.", "Good. You can focus on the client side."],
    ],
  },
  {
    key: "copperline-brief",
    platform: "gemini",
    title: "Copperline homepage brief",
    day: 6,
    turns: [
      ["Copperline wants the homepage to lead with their community solar program.", "Then the hero should show a neighborhood with panels."],
      ["Lena Brooks is building the Copperline site in Webflow.", "Webflow keeps handoff simple for their team."],
    ],
  },
  {
    key: "coffee",
    platform: "chatgpt",
    title: "Coffee order for the studio",
    day: 3,
    turns: [
      ["My usual is an oat milk cortado.", "Noted. Want me to remember that for team orders?"],
    ],
  },
];

/** Chats with no memory behind them, so the Library looks like a real one. */
export const OTHER_CHATS = [
  ["chatgpt", "Rewrite a client thank you note", 33, "Can you make this thank you note to a client warmer?", "Here is a warmer version that keeps it short."],
  ["claude", "Summarize a creative brief", 32, "Summarize this creative brief in five bullets.", "Here are the five points that matter most."],
  ["gemini", "Ideas for a team lunch", 31, "Give me ideas for a team lunch for eight people.", "Here are six places that take groups and have quick service."],
  ["chatgpt", "Explain CMYK and RGB", 29, "Explain the difference between CMYK and RGB for a client.", "RGB is for screens and CMYK is for print. Here is a simple way to say it."],
  ["claude", "Agenda for a kickoff call", 28, "Draft an agenda for a 45 minute kickoff call.", "Here is an agenda with time for introductions, goals and next steps."],
  ["chatgpt", "Name ideas for a coffee blend", 26, "Suggest names for a smoky dark roast.", "Ember, Night Shift and Old Growth are a few to start with."],
  ["gemini", "Polite way to push a deadline", 24, "How do I ask a client for one more week politely?", "Lead with the reason, offer a new date, and say what they get from it."],
  ["claude", "Budget table for a shoot", 23, "Make a simple budget table for a two day shoot.", "Here is a table with crew, gear, travel and a contingency line."],
  ["chatgpt", "Feedback on a moodboard", 21, "What makes a moodboard easy for a client to react to?", "Fewer images, clear labels and one question for them to answer."],
  ["gemini", "Train times to Seattle", 19, "What are the morning trains from Portland to Seattle?", "Here are the morning departures and how long each takes."],
  ["claude", "Half marathon pacing", 17, "What pace should I aim for in a first half marathon?", "Start with a pace you can hold while talking, then build from there."],
  ["chatgpt", "Packing list for Lisbon", 16, "Make me a packing list for a week in Lisbon in January.", "Layers, a rain jacket and comfortable shoes for the hills top the list."],
  ["gemini", "Write a job post for a designer", 14, "Write a short job post for a mid level designer.", "Here is a short post with the role, what they'll do and how to apply."],
  ["claude", "Tighten a pitch deck intro", 13, "Make the first slide of this pitch shorter.", "Here is a version with one line and one number."],
  ["chatgpt", "Dog friendly hikes near Portland", 11, "Which hikes near Portland are good with a dog?", "Here are five trails where dogs are welcome on a leash."],
  ["gemini", "Survey questions for a client", 10, "Write five survey questions about a website's ease of use.", "Here are five short questions with a 1 to 5 scale."],
  ["claude", "Email subject lines", 8, "Give me subject lines for a launch email.", "Here are ten, from plain to playful."],
  ["chatgpt", "Explain a print proof", 7, "What should I check on a print proof?", "Colors, crop marks, spelling and the barcode first."],
  ["gemini", "Vegetarian dinner ideas", 5, "Quick vegetarian dinners for a weeknight?", "Here are six that take under thirty minutes."],
  ["claude", "Slide outline for a roadmap", 4, "Outline five slides for a client roadmap.", "Here is an outline from goals to timeline to risks."],
  ["chatgpt", "Thank you message for the crew", 2, "Write a thank you message for a shoot crew.", "Here is a short message you can post in the team channel."],
  ["gemini", "Convert a budget to euros", 1, "Convert 48,000 dollars to euros.", "Here is the amount at today's rate, with a note that rates move."],
];

const MIN = 60_000;
const DAY = 86_400_000;

/** A chat's id on its AI, in the shape each AI's addresses take. */
export function chatId(platform, n) {
  const hex = n.toString(16).padStart(12, "0");
  return platform === "gemini" ? `c0e4${hex}`.slice(0, 16) : `5d1c0e4a-7b2f-4c11-9a3e-${hex}`;
}

/** Every chat as one list: { platform, id, title, start, messages: [{ role, text, at }] }. */
export function allChats(now) {
  const out = [];
  const add = (platform, title, day, turns, n) => {
    const start = now - day * DAY - 3 * 3600_000;
    const messages = turns.flatMap(([you, ai], i) => [
      { role: "user", text: you, at: new Date(start + 2 * i * 3 * MIN).toISOString() },
      { role: "assistant", text: ai, at: new Date(start + (2 * i + 1) * 3 * MIN).toISOString() },
    ]);
    out.push({ platform, id: chatId(platform, n), title, start: new Date(start).toISOString(), messages });
  };
  MEMORY_CHATS.forEach((c, i) => add(c.platform, c.title, c.day, c.turns, 0x100 + i));
  OTHER_CHATS.forEach(([platform, title, day, you, ai], i) => add(platform, title, day, [[you, ai]], 0x200 + i));
  return out;
}

/** The chats in the extension's Conversation shape, for the engine's upsertConversations. */
export function libraryConversations(now) {
  return allChats(now).map((c) => ({
    platform: c.platform,
    platformConvId: c.id,
    title: c.title,
    createdAt: c.start,
    updatedAt: c.messages[c.messages.length - 1].at,
    archived: false,
    messages: c.messages.map((m) => ({ role: m.role, text: m.text, createdAt: m.at })),
    alternateBranches: 0,
    hiddenCount: 0,
    adapter: "coere-screenshots@1",
    capturedAt: c.messages[c.messages.length - 1].at,
  }));
}
