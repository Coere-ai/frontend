/**
 * The replica pages this film opens: a fresh ChatGPT chat with Maya's
 * sidebar, as coere-v2's films saw it, and the same page later in the day,
 * once her interview chat and her SkipDoodle chat are in the sidebar. A
 * paste over 800 characters becomes a file beside the box, and an upload
 * takes 1.8 seconds, as the films' fixture sets them (stage/fixture.ts).
 */
const titles = [
  "Notion PM role",
  "PearX interview prep",
  "GitHub handles for the team",
  "Applying to Stripe",
  "History reading list",
  "PHYS 137 lab 1 done",
  "A coworker wedding",
  "Sparrowhawk database upgrade",
  "SkipDoodle setup",
  "Lisbon trip",
  "Flight times for the trip",
  "DATA 100 problem set due date",
  "MATH 54 this term",
  "Classes this term",
];
const chats = (extra) => [...extra, ...titles].map((title, i) => ({ id: `c${i + 1}`, title }));
const options = { pasteFileOver: 800, uploadMs: 1800 };

export default [
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: chats([]), options },
  { out: "sites/chatgpt-later.html", platform: "chatgpt", chats: chats(["Interview prep plan"]), options },
  { out: "sites/chatgpt-evening.html", platform: "chatgpt", chats: chats(["SkipDoodle changes", "Interview prep plan"]), options },
];
