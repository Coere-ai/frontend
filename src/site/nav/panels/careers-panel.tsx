import { JoinVisual } from "@/site/careers/join-visual";
import { PanelMore } from "./panel-parts";

/** Careers menu: a short pitch and one link on the left, the team's invitation on the right. */
export function CareersPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12">
      <div className="flex flex-col justify-between py-1">
        <div>
          <p className="text-[28px] font-medium tracking-[-0.03em] text-neutral-950">Careers</p>
          <p className="mt-2 max-w-sm text-[15px] text-neutral-500">Build the memory layer with the founding team in San Francisco.</p>
        </div>
        <PanelMore href="/careers">Open careers</PanelMore>
      </div>
      <JoinVisual />
    </div>
  );
}
