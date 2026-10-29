import type { Slide } from "@/site/blocks/slant-card";
import type { FilmCase, GridItem, HeroCopy } from "./types";

/** Coere Connect's page. Every claim here is shown in one of the films. */
export const connectHero: HeroCopy = {
  eyebrow: "Coere Connect",
  title: "Your memory, across every AI",
  line: "A Chrome extension that saves your chats from every AI, builds a memory you own from them, and brings it into each new chat.",
  checks: [
    "Every AI: ChatGPT, Claude, Gemini and six more feed one memory",
    "As you type: a line above the chat box says what goes with your message",
    "Yours: nothing goes to an AI to build memory until you say yes",
  ],
};

export const connectSlides: Slide[] = [
  { label: "Every AI, one memory", text: "ChatGPT, Claude, Gemini and six more AIs feed the same memory, so a new chat anywhere starts from what you already said." },
  { label: "Context as you type", text: "A blue line above the chat box says what Coere will add and which AIs it learned it from. What goes is always yours to change before you send." },
  { label: "Yours to keep", text: "Every chat is saved on your computer. Coere asks what to build memory from, and nothing goes to an AI until you say yes." },
];

/** Keys double as anchors, so the home page can link straight to a case. */
export const connectCases: FilmCase[] = [
  {
    key: "import",
    label: "Import chats",
    title: "Every chat you've had, saved in one place",
    text: "Extract all reads each AI you use and saves every chat on your computer. After that, new chats save by themselves.",
    checks: ["A row for each AI as it saves", "Saved on this computer", "Memory follows a chat that changes"],
    film: "extraction",
  },
  {
    key: "memory",
    label: "Build memory",
    title: "Everything your chats taught it, in one graph",
    text: "Coere reads your chats and grows a graph of your life, section by section. Each memory sits beside the chats it came from.",
    checks: ["All, Memories and Chats views", "A click opens a section up close", "Search lights the top matches"],
    film: "memory",
  },
  {
    key: "quizzes",
    label: "Quizzes and forms",
    title: "Cori works on the page you have open",
    text: "Ask Cori to do a quiz or fill a form. He answers from your memory, step by step, with Take over and Stop on the bar.",
    checks: ["Asks before anything that can't be undone", "Never types a password or card number", "Stops when a page tries to give him orders"],
    film: "actionsAnywhere",
  },
  {
    key: "writing",
    label: "Writing",
    title: "Fix your writing right where it is",
    text: "Select text in Gmail, Docs or a chat box and pick Rewrite, Improve or Fix grammar only. Each change is boxed in blue until you keep it.",
    checks: ["Fix grammar only keeps your words", "Improve keeps every fact you wrote", "Go back returns your text exactly"],
    film: "coriRewrite",
  },
  {
    key: "actions",
    label: "Email",
    title: "Email written in your own style",
    text: "Ask Cori for an email and he drafts it in its own Gmail tab with what your memory knows.",
    checks: ["Written in your style", "In a tab of its own", "Asks before writing to anyone you didn't name"],
    film: "actionsGmail",
  },
];

export const connectGrid: GridItem[] = [
  { icon: "graph", title: "Memory graph", text: "Your chats sorted into sections and folders around you, each memory beside its chats." },
  { icon: "download", title: "Extract all", text: "Every chat from your AIs saved on your computer, and new ones as they happen." },
  { icon: "sparkle", title: "Smart context", text: "The right memories go in front of your message as you type, with one Enter." },
  { icon: "mic", title: "Voice", text: "Hold Right Option and talk. Cori answers out loud when you let go." },
  { icon: "chat", title: "Cori", text: "A helper on every AI that finds your old chats in plain words." },
  { icon: "mail", title: "Gmail", text: "Email drafted in your style, in a tab of its own." },
  { icon: "pen", title: "Rewrite", text: "Fix or improve text in Gmail, Docs and any chat box." },
  { icon: "columns", title: "Workers", text: "Research split across tabs and merged into one table, each value with its page." },
];
