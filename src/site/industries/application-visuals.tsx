import type { ReactNode } from "react";
import { AiTiles } from "@/site/products/ai-tiles";
import { FeatureIcon } from "@/site/ui/icons/feature-icons";

/** Developer: the one call an app makes, set like a small editor. */
function CodeCard() {
  return (
    <pre className="overflow-hidden rounded-2xl bg-[#0b1020] p-5 font-mono text-[12px] leading-relaxed text-white/85 ring-1 ring-white/10">
      <code>{`const ctx = await coere.context
  .forDraft(draft, { chat })

ctx.block  // goes in front
ctx.items  // and why each one`}</code>
    </pre>
  );
}

/** Business: the company and its clients, as the Teams memory files them. */
function FolderCard() {
  const rows = [
    { icon: "building", name: "Company", note: "People, tools, way of working" },
    { icon: "folder", name: "Kestrel Outdoor", note: "Contacts and promises" },
    { icon: "folder", name: "Halvorsen Freight", note: "Contacts and promises" },
  ] as const;
  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl bg-white px-4 ring-1 ring-neutral-200">
      {rows.map((row) => (
        <li key={row.name} className="flex items-center gap-3 py-3">
          <FeatureIcon name={row.icon} size={20} className="text-neutral-950" />
          <span className="flex-1 text-[14px] text-neutral-950">{row.name}</span>
          <span className="text-[12px] text-neutral-500">{row.note}</span>
        </li>
      ))}
    </ul>
  );
}

/** What each application card shows above its words. The names come from the Teams film. */
export const applicationVisuals: Record<string, ReactNode> = {
  consumer: <AiTiles columns={3} limit={6} />,
  developer: <CodeCard />,
  business: <FolderCard />,
};
