/**
 * The page this film opens: a fresh ChatGPT chat from coere-v2's fake site
 * builder, with the sample chats its fake data server lists, newest first,
 * as ChatGPT's sidebar showed them in the film.
 */
const titles = [
  "Organizing old photos", "Debugging a race condition", "Morning stretch routine", "Making a travel checklist", "Picking a board game",
  "Summarizing a long email", "A haiku about rain", "Setting up a home server", "Regex for ISO dates", "Keeping basil alive indoors",
  "Drafting a cover letter", "Explaining recursion simply", "Budget for a road trip", "Practicing Spanish verbs", "A birthday quiz for kids",
  "Indexing a large SQL table", "Tuning a bike chain", "Writing a polite reminder", "Naming a small side project", "Cleaning a cast iron pan",
];

export default [{ out: "sites/chatgpt.html", platform: "chatgpt", chats: titles.map((title, i) => ({ id: `c${i + 1}`, title })) }];
