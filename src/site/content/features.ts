import type { FilmKey } from "./films";

/**
 * A feature with the film that shows it. The products menu lists these
 * with a live preview and a link to where its product page shows it.
 */
export type Feature = {
  slug: string;
  /** Short name for menus. */
  name: string;
  /** The line a feature row leads with. */
  title: string;
  description: string;
  film: FilmKey;
  /** Where the feature is shown in full. */
  href: string;
};

export const features: Feature[] = [
  {
    slug: "memory",
    name: "Memory",
    title: "Everything your chats taught it, in one graph",
    description:
      "Coere sorts what your chats say into sections and folders and draws it around you. Every memory keeps the messages it came from.",
    film: "memory",
    href: "/products/connect#memory",
  },
  {
    slug: "extraction",
    name: "Extraction",
    title: "Every chat you've had, saved in one place",
    description:
      "Extract all reads ChatGPT, Claude and Gemini and saves every chat on your computer. After that, new chats come in by themselves.",
    film: "extraction",
    href: "/products/connect#import",
  },
  {
    slug: "smart-context",
    name: "Smart context",
    title: "The right context goes in as you type",
    description:
      "A line above the chat box says what Coere will add and which AIs it learned it from. One Enter sends your message with the context in front.",
    film: "smartContext",
    href: "/products/connect",
  },
  {
    slug: "voice",
    name: "Voice",
    title: "Ask out loud and hear the answer",
    description:
      "Hold Right Option and talk. Cori shows your words as you say them and answers out loud when you let go.",
    film: "voiceMode",
    href: "/products/connect",
  },
  {
    slug: "cori",
    name: "Cori",
    title: "One helper on every AI",
    description:
      "Cori finds your old chats in plain words and answers how Coere works, on the dashboard, in the toolbar and on any AI site.",
    film: "coriChat",
    href: "/products/connect",
  },
  {
    slug: "actions",
    name: "Actions",
    title: "Email written in your own style",
    description:
      "Ask Cori for an email and it writes it in its own Gmail tab with what your memory knows. It asks before it sends to anyone you didn't name.",
    film: "actionsGmail",
    href: "/products/connect#actions",
  },
  {
    slug: "writer",
    name: "Writer",
    title: "Fix your writing right where it is",
    description:
      "Select text in Gmail, Docs or a chat box. Cori fixes or improves it and marks each change in blue until you keep it or go back.",
    film: "coriRewrite",
    href: "/products/connect#writing",
  },
  {
    slug: "any-site",
    name: "Any site",
    title: "Forms and quizzes from what you already know",
    description:
      "On any page Cori works step by step from your memory, asks before it submits, and stops when a page tries to give it orders.",
    film: "actionsAnywhere",
    href: "/products/connect#quizzes",
  },
  {
    slug: "workers",
    name: "Workers",
    title: "Research split across many tabs",
    description:
      "A big task runs in several tabs at once. What they find merges into one table, each value with the page it came from.",
    film: "workers",
    href: "/products/solutions#how",
  },
  {
    slug: "benchmarks",
    name: "Benchmarks",
    title: "Measured, with the cost of every run",
    description:
      "Coere scores its memory on LoCoMo and on its own checks from the dashboard, and says what each run cost.",
    film: "benchmarksEvals",
    href: "/products/connect",
  },
];

export function featureBySlug(slug: string): Feature | undefined {
  return features.find((f) => f.slug === slug);
}
