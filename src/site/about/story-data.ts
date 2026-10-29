/** The four steps of the About diagram, top to bottom. */
export const storySteps = [
  { title: "AI is fragmented.", text: "You use one AI for code, another for school and a third for everything else. None of them talk to each other." },
  { title: "Every app keeps a piece of you.", text: "Each one remembers its own slice of what you've told it. You can't see those pieces, and you can't take them with you." },
  { title: "Coere brings it together.", text: "Coere saves your chats from every AI and builds one memory from them, with each part tied to the chat it came from." },
  { title: "And the memory is yours.", text: "You see it, edit it and decide which AIs and apps may read it. Your memory belongs to you, not to the apps." },
];

/**
 * The AIs in the diagram, with the logos already in /public, and the piece
 * of you each one happens to hold. `allowed` is how the last step shows
 * the person choosing who may read their memory.
 */
export const storyApps = [
  { name: "ChatGPT", logo: "/openai.svg", piece: "Your code", allowed: true },
  { name: "Claude", logo: "/claude-color.svg", piece: "Your classes", allowed: true },
  { name: "Gemini", logo: "/gemini-color.svg", piece: "Your trip", allowed: true },
  { name: "Perplexity", logo: "/perplexity-color.svg", piece: "Your research", allowed: false },
  { name: "Copilot", logo: "/copilot-color.svg", piece: "Your work", allowed: true },
  { name: "Grok", logo: "/grok.svg", piece: "Your taste", allowed: false },
];
