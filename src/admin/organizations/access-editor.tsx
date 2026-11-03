"use client";

import { useState } from "react";

import type { OrgAccess } from "@/lib/org/access";

import { Button } from "../controls";

/** Tick boxes for a set of sections, in the order given. */
export function SectionChecks({
  sections,
  picked,
  onChange,
  label,
}: {
  sections: ReadonlyArray<{ key: string; name: string }>;
  picked: readonly string[];
  onChange: (keys: string[]) => void;
  label: string;
}) {
  return (
    <fieldset className="flex flex-wrap gap-x-4 gap-y-1.5">
      <legend className="sr-only">{label}</legend>
      {sections.map((s) => (
        <label key={s.key} className="inline-flex items-center gap-1.5 text-[12.5px] text-[color:var(--color-ink)]">
          <input
            type="checkbox"
            checked={picked.includes(s.key)}
            onChange={(e) => onChange(e.target.checked ? sections.filter((x) => x.key === s.key || picked.includes(x.key)).map((x) => x.key) : picked.filter((k) => k !== s.key))}
          />
          {s.name}
        </label>
      ))}
    </fieldset>
  );
}

/**
 * One access object as the operator edits it: every shared section or
 * some, and whether the memory goes into the graph. Controlled, so the
 * settings form can hold the organization's default with its other fields.
 * Going from all to some starts with every section ticked.
 */
export function AccessFields({
  value,
  onChange,
  sections,
  disabled,
}: {
  value: OrgAccess;
  onChange: (a: OrgAccess) => void;
  sections: ReadonlyArray<{ key: string; name: string }>;
  disabled?: boolean;
}) {
  const all = value.read === "all";
  const radio = (on: boolean, text: string, read: OrgAccess["read"]) => (
    <label className="inline-flex items-center gap-1.5 text-[12.5px] text-[color:var(--color-ink)]">
      <input type="radio" checked={on} onChange={() => onChange({ ...value, read })} disabled={disabled} />
      {text}
    </label>
  );
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-4">
        {radio(all, "Reads every shared section", "all")}
        {radio(!all, "Reads only some", all ? sections.map((s) => s.key) : value.read)}
      </div>
      {!all ? <SectionChecks label="Sections they read" sections={sections} picked={value.read as string[]} onChange={(read) => onChange({ ...value, read })} /> : null}
      <label className="inline-flex items-center gap-1.5 text-[12.5px] text-[color:var(--color-ink)]">
        <input type="checkbox" checked={value.contribute} onChange={(e) => onChange({ ...value, contribute: e.target.checked })} disabled={disabled} />
        Adds their shared sections to the graph
      </label>
    </div>
  );
}

/** A member's own access with its buttons: save it, or go back to the organization's default. */
export function MemberAccessEditor({
  value,
  sections,
  disabled,
  onSave,
  onReset,
}: {
  value: OrgAccess;
  sections: ReadonlyArray<{ key: string; name: string }>;
  disabled?: boolean;
  onSave: (access: OrgAccess) => void;
  onReset: () => void;
}) {
  const [access, setAccess] = useState(value);
  return (
    <div className="space-y-2.5">
      <AccessFields value={access} onChange={setAccess} sections={sections} disabled={disabled} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" strong disabled={disabled} onClick={() => onSave(access)}>
          Save access
        </Button>
        <Button type="button" disabled={disabled} onClick={onReset}>
          Use the organization&apos;s default
        </Button>
      </div>
    </div>
  );
}
