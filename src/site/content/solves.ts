/**
 * The words of "What Coere solves" on the home page, from Edison's own
 * account of the problem. The three scenes come twice: first as AI works
 * today, then with Coere, in the same order, so each answer sits under
 * its problem.
 */
export type SceneKey = "switch" | "newChat" | "longChat";

export type SceneWords = { key: SceneKey; title: string; line: string };

export const solves = {
  eyebrow: "What Coere solves",
  title: "Every AI starts from zero",
  line: "Today, AI applications have fragmented memories of their users.",
  today: [
    { key: "switch", title: "Switching AI to AI", line: "Every time someone switches applications, they start with zero context all over again." },
    { key: "newChat", title: "A new chat in the same AI", line: "Even inside one app, a new chat doesn't know your projects, your preferences or your history, so you re-explain yourself every time." },
    { key: "longChat", title: "Inside one long chat", line: "Earlier details get buried or dropped, and pasting everything back bloats the chat, so answers get worse." },
  ] satisfies SceneWords[],
  developers: { lead: "Developers have the same problem from the other side.", rest: "Every AI company builds its own isolated memory, and their apps still know nothing about a new user on day one." },
  answer: {
    eyebrow: "With Coere",
    title: "Memory that follows the person, not the app",
    line: "Coere is a universal, user-owned memory layer. It adds the context needed for each response, so the AI has what's relevant, nothing more.",
  },
  withCoere: [
    { key: "switch", title: "In any app", line: "The next AI starts with what the last one learned, because your memory follows you." },
    { key: "newChat", title: "In every new chat", line: "Your projects and preferences come in with your first message, so you never re-explain yourself." },
    { key: "longChat", title: "At any point in a conversation", line: "The detail that got buried comes back when it matters, and the chat stays light." },
  ] satisfies SceneWords[],
  developersAnswer: { lead: "With user permission,", rest: "developers can integrate our API to access that context and personalize their apps from day one, instead of building their own memory systems." },
};
