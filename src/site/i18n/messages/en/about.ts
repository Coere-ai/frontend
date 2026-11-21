import { founders } from "@/lib/site";
import { aboutSeo, demoSeo } from "@/site/content/seo";
import { storyApps, storySteps } from "@/site/about/story-data";

/**
 * The About page and the demo page. The founders' records stay in
 * src/lib/site.ts, the one place their facts live, and the diagram's steps
 * in story-data.ts; this gathers their words in the messages' shape.
 */
export const about = {
  seo: {
    title: aboutSeo.title,
    description: aboutSeo.description,
  },
  title: "About us",
  line: "We're building the memory layer people own",
  story: [
    "Coere started when we kept explaining the same projects to every AI we switched to. Each one knew a piece of us, and none of them knew the rest.",
    "As AI users and developers, we saw the need for a user owned, unified memory across every AI. So we built one place that keeps what each AI learns about you, brings it into every new chat, and stays yours.",
  ],
  diagram: {
    label: "Why Coere",
    step: "Step {n}",
    steps: storySteps.map(({ title, text }) => ({ title, text })),
    pieces: storyApps.map((app) => app.piece),
    yourMemory: "Your memory",
    from: "From",
    whoCanRead: "Who can read your memory",
    allowed: "Allowed",
    notAllowed: "Not allowed",
  },
  team: {
    eyebrow: "Our team",
    title: "The people building Coere",
    founders: founders.map(({ role, majors, highlights }) => ({ role, majors, highlights })),
  },
  closing: { title: "Help us put people back together.", text: "We're hiring a founding team, and we'd love to hear from you." },
  demo: {
    seo: {
      title: demoSeo.title,
      description: demoSeo.description,
    },
    title: "See Coere in action",
    line: "The whole product, played live on Coere's own code: setup, import, the memory it builds and what you can do with it.",
  },
};
