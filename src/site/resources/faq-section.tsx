import { PlusIcon } from "@/site/ui/icons/interface-icons";

const questions = [
  { q: "What is Coere?", a: "A memory layer you own. It saves your chats from every AI you use, builds a memory from them that you can see and edit, and brings the right part of it into each new chat." },
  { q: "Which AIs does it work with?", a: "ChatGPT, Claude and Gemini, plus Perplexity, Grok, Copilot, Meta AI, Kimi and DeepSeek." },
  { q: "Where does my data go?", a: "Your chats are saved on your computer. To build memory, Coere sends the new parts of your chats to the model that reads them, and only after you say yes." },
  { q: "Can my team share one memory?", a: "Yes. Coere Solutions files what your team's chats say under Company, and gives each client a folder of its own." },
  { q: "How do apps use my memory?", a: "Through Coere Forge. An app asks for access, you press Allow, and it can read only what its token allows." },
];

/** Short answers, each folding open on its own. Native details elements, so it works without scripts. */
export function FaqSection() {
  return (
    <div className="divide-y divide-neutral-200 border-y border-neutral-200">
      {questions.map(({ q, a }) => (
        <details key={q} className="group py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg text-neutral-950 [&::-webkit-details-marker]:hidden">
            {q}
            <PlusIcon size={20} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <p className="max-w-3xl pb-5 text-[16px] leading-relaxed text-neutral-500">{a}</p>
        </details>
      ))}
    </div>
  );
}
