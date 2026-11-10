/**
 * The privacy policy's words, shown at /privacy. Every line is taken from
 * docs/accounts.md and the code it describes. The owner (and a lawyer if
 * possible) must review this text before launch. When a fact changes in the
 * product, change it here in the same commit, and move PRIVACY_EFFECTIVE.
 */

/** The day this text took effect, as a date and as the page says it. */
export const PRIVACY_EFFECTIVE = "2026-11-10";
export const PRIVACY_EFFECTIVE_LABEL = "November 10, 2026";

/** One part of the policy: a heading, its paragraphs, and an optional list after them. */
export type PrivacySection = { id: string; title: string; paragraphs: string[]; list?: string[]; after?: string[] };

/** The AI sites the extension works on, as siteConfig.summary names them. */
const AI_SITES = "ChatGPT, Claude, Gemini, DeepSeek, Perplexity, Grok, Copilot, Meta AI and Kimi";

export const privacySummary: string[] = [
  "Your saved chats stay in your browser. coere.ai never stores them.",
  "To build your memory, Coere sends cleaned parts of your saved chats through coere.ai to Anthropic's Claude. coere.ai keeps no request and no answer, only counts.",
  "With the backup on, coere.ai keeps a copy of your memory, never your chats. You can turn it off, and that deletes the copy.",
  "Coere does not sell your data and does not train any model on it.",
];

export const privacySections: PrivacySection[] = [
  {
    id: "who",
    title: "Who runs Coere",
    paragraphs: [
      "Coere runs the website coere.ai and the Coere extension for Chrome, called Coere Connect. This policy covers both. It says what each one reads, what it keeps, where it goes and how you control it.",
      "Questions, requests and complaints go to {email}.",
    ],
  },
  {
    id: "extension",
    title: "What the extension reads on AI sites",
    paragraphs: [
      `Coere works on ${AI_SITES}. It reads a chat there only when you ask it to: Extract chat, Extract all, Transfer chat, or a request to Cori, Coere's agent. It saves what it reads in your browser, and in a folder on your computer if you choose one.`,
      "If you turn on Save new chats as they happen for an AI, Coere saves each new exchange there once the reply has finished. It never saves a temporary chat.",
      "Coere reads the text in an AI's chat box only for features that need it:",
    ],
    list: [
      "With Search as I type on, it reads the box after each pause to search your saved chats in your browser. With it off, it reads the box only while the search sheet is open.",
      "With Add my context to chats on, it matches what you type against your memory in your browser. When you send, it puts the matching memories in front of your message, so the AI site receives them as part of your message.",
    ],
    after: [
      "Your draft is never saved, never logged and never sent to coere.ai or to a model.",
      "Browser Use is off until you turn it on. When you then ask Cori to act on a page, Coere reads that page and sends a short text view of it to Claude, and the names of its buttons and fields to Jev (below). When a page can only be read as a picture, it sends a screenshot of that tab for that step and keeps no copy. To write an email it sends your request, your writing style, related memories and up to three of your past emails it found in Gmail. It never sends passwords, card numbers or one time codes.",
      "Voice mode turns your speech into text on your computer. The audio never leaves it and is never stored. The words then go to Cori like a typed line. The speech models download once from Hugging Face.",
    ],
  },
  {
    id: "browser",
    title: "What stays in your browser",
    paragraphs: [
      "Your saved chats and the library they make, the full text of every chat, your drafts, your chats with Cori and your memory itself are kept in your browser's storage on your computer. The extension also keeps your coere.ai sign in there: a device token and your username.",
      "coere.ai never stores your chats. The parts of them that Coere sends to build your memory pass through coere.ai on their way to Anthropic, as the next section says.",
    ],
  },
  {
    id: "requests",
    title: "What goes to coere.ai and on to Anthropic",
    paragraphs: [
      "Coere builds your memory with Claude, Anthropic's model. When a chat is saved, Coere sends its new messages, a few earlier messages for context, and the memories they may update. Before sending, it removes API keys, card numbers and passwords it finds. A question you ask Cori, and the page text Browser Use reads, go the same way.",
      "These requests go to coere.ai, which checks your account, adds Coere's own key and forwards them to Anthropic's API. Anthropic's terms for API data apply to them. Large reads can go as a batch, which Anthropic keeps for 29 days.",
      "Some short pieces of your saved chats also go through coere.ai to Jev, a classifier run by TypeSafe, which sorts them into categories. When coere.ai has no Jev key, those pieces go to Claude instead.",
      "coere.ai keeps no request and no answer. For each one it records only counts: the account, the device, the model, the token numbers, the cost, the status and how long it took.",
    ],
  },
  {
    id: "backup",
    title: "The memory backup",
    paragraphs: [
      "The backup is on by default. With it on, the extension uploads a copy of your memory to coere.ai a few minutes after your memory changes. The copy holds your memories with their quotes, the documents Coere writes from them (such as a project's notes or plan), and the titles of the chats they come from. It never holds the chats themselves.",
      "Memories Coere marks sensitive, such as health and money, are left out unless you turn on Include sensitive memories.",
      "coere.ai uses the copy to show your memory and the titles of its chats in your dashboard, to let you download it, and to build your organization's shared memory if you are in one.",
      "To turn it off, open your dashboard on coere.ai, go to Settings and turn off Back up memory to coere.ai. That deletes the stored copy, its index and your part of your organization's shared memory, and the extension stops uploading. Your memory in Coere stays in your browser. Delete the memory copy, under Account, deletes the stored copy too, but with the backup on a new copy arrives at the next upload.",
    ],
  },
  {
    id: "settings",
    title: "Synced settings and usage counts",
    paragraphs: [
      "Your Coere settings sync through your account, so each browser you connect gets the same ones: which AIs Coere works on, memory and context choices, voice and similar preferences. Whether Browser Use is turned on never syncs; you turn it on in each browser yourself.",
      "Every 10 minutes the extension sends how many times you used each feature, such as saving a chat, a transfer or a memory search, and how many tokens Coere saved you. It sends numbers only, never text.",
    ],
  },
  {
    id: "account",
    title: "Your account",
    paragraphs: [
      "Your account is a username and a password. coere.ai collects no email for it and sends you none. Your account holds your username, a display name if you set one, your plan and limits, when you joined and when you were last seen. Sign in runs through Supabase Auth: coere.ai passes your password to it, and it keeps the password hashed. Supabase Auth needs an address for each account, so coere.ai gives yours a made up one at users.coere.ai that receives no mail and is never shown. The extension never sees your password. If you forget it, write to {email} and the person who runs Coere can set a new one.",
      "For each browser you connect, coere.ai keeps a name such as Chrome on macOS, the extension's id and version, and when it was last used.",
      "For security, coere.ai records sign ins, failed tries, connected and revoked browsers and similar events, each with a keyed hash of your network address and your country. The address itself is never stored.",
      "coere.ai sets cookies only to keep you signed in and to talk to the extension:",
    ],
    list: [
      "The sign in cookies keep your session for up to 400 days, until you sign out. Scripts cannot read them.",
      "coere_signed_in holds only the value 1, so the menu shows Dashboard instead of Sign in.",
      "coere_ext holds the id of your Coere extension, so the dashboard can talk to it.",
    ],
  },
  {
    id: "organizations",
    title: "Organizations",
    paragraphs: [
      "Coere for Teams lets a company's people read one shared memory. Only the Coere operator creates an organization, and a person is in at most one.",
      "A member's memories in the organization's shared sections (Work, unless an admin picks others) go into the shared memory, with the titles of the chats they come from. Sensitive memories never go in. Every member sees who brought each shared memory, the list of members with their roles and join dates, how many tokens each saved and memories each shared, and the organization's totals, including its AI cost this month. Your memory outside the shared sections stays yours.",
      "Admins also invite coworkers, remove members, change roles and the shared sections, and decide what each member may read and whether their memory goes in. You can turn off Share my memory or leave at any time, though an organization's only admin must name another admin before leaving. Either removes your part of the shared memory.",
      "The person who runs Coere can open an account's or an organization's memory in Coere's admin panel, for support. It is never opened on its own, and every view is logged. The admin panel also shows each account's username, plan, devices and usage.",
    ],
  },
  {
    id: "analytics",
    title: "Site analytics",
    paragraphs: [
      "coere.ai counts its own visits with its own code. It sets no cookie for this and does not identify you. It does not run on the sign in, connect or dashboard pages. For each page view it records:",
    ],
    list: [
      "the page, and the site you came from",
      "the device, browser and operating system, read from your browser's user agent",
      "your approximate location (country, region, city and rough coordinates) as Vercel reports it from your network address, which is not stored",
      "how long you read, how far you scrolled and which parts of the page you read",
      "the buttons you press that are marked for counting, and links that leave the site",
    ],
    after: [
      "To tell a returning visit from a new one, your browser keeps a random id in its local storage. It holds nothing else, and clearing your site data removes it.",
    ],
  },
  {
    id: "lists",
    title: "The waitlist and interest emails",
    paragraphs: [
      "If you join the developer waitlist, or say you are interested in Coere Connect or Coere for Teams, coere.ai stores your email, which list you joined, the page, the time and a keyed hash of your network address. Coere uses your email to tell you when that product opens. To be taken off a list, write to {email}.",
    ],
  },
  {
    id: "where",
    title: "Where your data is stored",
    paragraphs: ["coere.ai uses these services to run:"],
    list: [
      "Supabase holds the database, sign in and file storage. Memory copies sit in a private storage bucket, each person's in their own folder.",
      "Vercel hosts coere.ai and runs its server, including the step that forwards model requests.",
      "Anthropic answers the model requests, and TypeSafe answers the Jev requests, as described above.",
    ],
  },
  {
    id: "deletion",
    title: "Keeping and deleting your data",
    paragraphs: [
      "Your account and what it holds stay until you delete them. The memory copy stays until you turn the backup off, delete the copy or delete your account. You can download the stored .coere file at any time from your dashboard.",
      "To delete your account, sign in at coere.ai/account, choose Delete account and type your username. coere.ai then removes your part of your organization's shared memory, your memory copy and every other file in your folder, revokes your browsers, and deletes your profile, settings, devices and totals. If you are your organization's only admin, make another member an admin first.",
      "Some numbers stay after you delete your account, with you removed from them: the usage records (model, tokens, cost, status, duration), the feature counts and the security records. They name nobody. The product's daily totals and your organization's past totals keep your numbers too.",
      "Site analytics, the waitlist and interest lists, the usage numbers and the security records are not deleted on a schedule.",
      "Removing the extension from Chrome removes what it keeps in your browser. Files it saved to a folder you chose stay there until you delete them.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: ["coere.ai protects what it holds like this:"],
    list: [
      "Device tokens and connect codes are stored only as SHA-256 hashes, never as the plain value.",
      "Network addresses are stored only as a keyed hash.",
      "Every database table has row level security on, so a signed in person can read only their own rows.",
      "Memory copies sit in a private bucket. Only you and coere.ai's server can read your folder, and an organization's shared memory is read through the server after it checks you are a member.",
      "Coere's secret keys for Anthropic, TypeSafe and Supabase live only on coere.ai's server, never in the extension.",
    ],
  },
  {
    id: "sell",
    title: "No selling, no training",
    paragraphs: [
      "Coere does not sell your data. It does not share it with anyone beyond the services named on this page, which run Coere for you. Coere does not train any model on your data.",
    ],
  },
  {
    id: "chrome",
    title: "Chrome Web Store",
    paragraphs: [
      "The use of information that the Coere extension receives follows the Chrome Web Store User Data Policy, including the Limited Use requirements. The extension uses that information only to give you Coere's features as this page describes.",
    ],
  },
  {
    id: "children",
    title: "Children",
    paragraphs: [
      "Coere is not for children under 13, and Coere does not knowingly collect data from them. If you believe a child under 13 has an account, write to {email}.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "When this policy changes, this page shows the new text and a new effective date.",
      `This policy is effective from ${PRIVACY_EFFECTIVE_LABEL}.`,
    ],
  },
];
