"use client";

import { useState } from "react";

import type { OrgAccess } from "@/lib/org/access";
import { SwitchRow } from "@/site/settings/controls";
import { buttonClass } from "@/site/ui/button";

import { SectionPicker } from "./section-picker";

/**
 * What one access object allows, as an admin edits it: which shared
 * sections are read (all of them, or some) and whether the memory goes
 * into the graph. The same editor sets a member's own access and the
 * organization's default.
 */
export function AccessEditor({
  value,
  sections,
  disabled,
  onSave,
  onReset,
  saveLabel = "Save access",
}: {
  value: OrgAccess;
  sections: Array<{ key: string; name: string }>;
  disabled?: boolean;
  onSave: (access: OrgAccess) => void;
  /** Shown for a member: go back to the organization's default. */
  onReset?: () => void;
  saveLabel?: string;
}) {
  const [all, setAll] = useState(value.read === "all");
  const [read, setRead] = useState<string[]>(value.read === "all" ? sections.map((s) => s.key) : value.read);
  const [contribute, setContribute] = useState(value.contribute);
  const pill = (on: boolean) =>
    `h-9 rounded-full border px-4 text-[14px] transition-colors ${on ? "border-brand-500 bg-brand-50 text-brand-600" : "border-neutral-200 text-neutral-950 hover:border-neutral-950"}`;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[15px] text-neutral-950">Reads</p>
        <div role="radiogroup" aria-label="Reads" className="mt-3 flex flex-wrap gap-2">
          <button type="button" role="radio" aria-checked={all} disabled={disabled} onClick={() => setAll(true)} className={pill(all)}>
            Every shared section
          </button>
          <button type="button" role="radio" aria-checked={!all} disabled={disabled} onClick={() => setAll(false)} className={pill(!all)}>
            Only some
          </button>
        </div>
        {!all ? (
          <div className="mt-3">
            <SectionPicker label="Sections they read" choices={sections} picked={read} disabled={disabled} onChange={setRead} />
          </div>
        ) : null}
      </div>
      <SwitchRow label="Adds to the graph" about="Their shared sections go into the organization's graph." checked={contribute} disabled={disabled} onChange={setContribute} />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={disabled} onClick={() => onSave({ read: all ? "all" : read, contribute })} className={buttonClass("primary", "disabled:opacity-60")}>
          {saveLabel}
        </button>
        {onReset ? (
          <button type="button" disabled={disabled} onClick={onReset} className={buttonClass("ghost", "disabled:opacity-60")}>
            Use the organization&apos;s default
          </button>
        ) : null}
      </div>
    </div>
  );
}
