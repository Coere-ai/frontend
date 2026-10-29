import { Reveal } from "@/site/ui/reveal";

/** Plain statements of where data lives, drawn from how the extension is built. */
const points = [
  { title: "Your chats stay in your browser", text: "Your library is a file in your browser's private storage, in your own Chrome profile." },
  { title: "Nothing goes to an AI until you say so", text: "Coere asks what to build memory from before any model reads a word. It removes keys, card numbers and passwords it finds first." },
  { title: "Your drafts are never kept", text: "Search as you type reads the chat box only to search your saved chats, then drops it. It is never saved, logged or sent to a model." },
  { title: "Apps read only what you allow", text: "An app has to ask. You press Allow, and its token reads only the sections you gave it." },
  { title: "Forget anything", text: "Edit, pin or forget any memory, or delete everything about a topic at once." },
];

export function PrivacySection() {
  return (
    <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {points.map((point, index) => (
        <Reveal key={point.title} delay={(index % 3) * 0.05} className="border-t border-neutral-950 pt-6">
          <h3 className="text-lg font-medium tracking-[-0.02em] text-neutral-950">{point.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{point.text}</p>
        </Reveal>
      ))}
    </div>
  );
}
