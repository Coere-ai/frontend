/** The four beats of the About story, in scroll order. */
export const storySteps = [
  { title: "AI is fragmented.", text: "You use one AI for code, another for school and a third for everything else. None of them talk to each other." },
  { title: "Every app keeps a piece of you.", text: "Each one remembers its own slice of what you've told it. You can't see those pieces, and you can't take them with you." },
  { title: "Coere brings it together.", text: "Coere saves your chats from every AI and builds one memory from them, with each part tied to the chat it came from." },
  { title: "And the memory is yours.", text: "You see it, edit it and decide which AIs and apps may read it. Your memory belongs to you, not to the apps." },
];

/** The AIs on the stage, with the logos already in /public. */
export const storyApps = [
  { name: "ChatGPT", logo: "/openai.svg" },
  { name: "Claude", logo: "/claude-color.svg" },
  { name: "Gemini", logo: "/gemini-color.svg" },
  { name: "Perplexity", logo: "/perplexity-color.svg" },
  { name: "Grok", logo: "/grok.svg" },
  { name: "Copilot", logo: "/copilot-color.svg" },
  { name: "Meta AI", logo: "/meta-color.svg" },
  { name: "Kimi", logo: "/kimi.svg" },
  { name: "DeepSeek", logo: "/deepseek-color.svg" },
];

/** Where each beat starts and ends on the section's 0 to 1 scroll progress. */
export const BEATS = { scatter: 0, pieces: 0.25, gather: 0.5, own: 0.75 } as const;

/** Blues from light to deep, one per piece, so the gathered circle reads as one whole made of parts. */
export const PIECE_COLORS = ["#c6cfff", "#a3b0fd", "#7f8bfa", "#5267f7", "#3f4ceb", "#333cd0", "#2b34a8", "#5267f7", "#7f8bfa"];

/**
 * Stage positions in percent of the square stage. Apps start scattered at
 * uneven spots and settle onto an even ring once the pieces gather.
 */
const SCATTER: [number, number][] = [
  [18, 20], [50, 10], [82, 24], [90, 55], [72, 86], [42, 90], [12, 72], [30, 46], [66, 50],
];

export function scatterAt(index: number): { x: number; y: number } {
  const [x, y] = SCATTER[index];
  return { x, y };
}

export function ringAt(index: number, count: number): { x: number; y: number } {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 40 };
}
