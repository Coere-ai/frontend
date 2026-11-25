import type { LabCondition } from "@/lib/lab/types";

/**
 * What a student sets in Coere before a case, in one place so the overview
 * and the case page say exactly the same thing. The switch names are the
 * extension's own, from its Settings page.
 */
export const CONDITION_COPY: Record<LabCondition, { label: string; short: string; steps: string[] }> = {
  coere: {
    label: "With Coere",
    short: "Coere Connect on",
    steps: [
      "In Coere's Settings, turn on Add my context to chats and Save new chats as they happen.",
      "Paste the starter chat into ChatGPT. When it replies, press Extract chat on Cori if Coere has not saved it already.",
      "Then work as you like. Let Coere bring the case into your chats instead of pasting it again. Search and Transfer are fine to use.",
    ],
  },
  baseline: {
    label: "Without Coere",
    short: "Coere Connect paused",
    steps: [
      "In Coere's Settings, turn off Add my context to chats and Save new chats as they happen.",
      "Do not use Coere's search sheet or Transfer for this case.",
      "Paste the starter chat, or any part of the packet, wherever you need it. That is the normal way, and the point of comparing.",
    ],
  },
};

export function ConditionBox({ condition }: { condition: LabCondition }) {
  const c = CONDITION_COPY[condition];
  const on = condition === "coere";
  return (
    <div className={`rounded-2xl border p-5 ${on ? "border-brand-400/40 bg-brand-500/10" : "border-white/15 bg-white/[0.04]"}`}>
      <p className="text-[13px] font-medium tracking-wide text-white/60 uppercase">This case runs</p>
      <p className="mt-1 text-[20px] font-medium text-white">{c.label}</p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-white/75">
        {c.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
