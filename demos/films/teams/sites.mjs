/**
 * The replica page this film opens: a new ChatGPT chat with Maya's
 * sidebar, the agency's ChatGPT chats as tests/e2e/solution/helpers/readme.ts
 * lists them (agencyOwnChats), newest first.
 */
const titles = [
  "Personal",
  "Open house flyer",
  "Kestrel spring trail campaign",
  "Larkspur Dental patient booking site",
  "Process write up",
  "Store launch",
  "Tidewater billing",
  "Halvorsen contacts",
  "Osprey sign in code",
  "Granite Peak staging access",
  "Juniper Lane print budget",
  "Microsite stack",
  "Reusing copy",
  "Halvorsen livery quote",
];

export default [{ out: "sites/chatgpt.html", platform: "chatgpt", edition: "solution", chats: titles.map((title, i) => ({ id: `c${i + 1}`, title })) }];
