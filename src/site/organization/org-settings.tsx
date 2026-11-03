"use client";

import { useState } from "react";

import { saveOrgSettings } from "@/app/(site)/dashboard/organization/admin-actions";
import type { OrgAccess } from "@/lib/org/access";
import { Panel } from "@/site/dashboard/panel";
import { FormField, inputClass } from "@/site/ui/form-field";

import { AccessEditor } from "./access-editor";
import { SectionPicker } from "./section-picker";
import { lineClass, useOrgAction } from "./use-org-action";

/**
 * The organization's settings, for admins: its name, the memory sections
 * members share into the graph, and the access a new member starts with.
 * One Save sends all three, since the default access is narrowed to the
 * shared sections.
 */
export function OrgSettings({
  name,
  shared,
  defaultAccess,
  choices,
}: {
  name: string;
  shared: string[];
  defaultAccess: OrgAccess;
  choices: Array<{ key: string; name: string }>;
}) {
  const { pending, line, run } = useOrgAction();
  const [draftName, setDraftName] = useState(name);
  const [sections, setSections] = useState(shared);
  const sharedChoices = choices.filter((c) => sections.includes(c.key));

  return (
    <Panel title="Organization settings" description="Only admins see these. A change to the shared sections rebuilds the graph from every member's memory.">
      <div className="space-y-6">
        <FormField id="org-name" label="Name">
          <input id="org-name" value={draftName} maxLength={80} onChange={(e) => setDraftName(e.target.value)} className={`${inputClass(false)} h-12`} />
        </FormField>
        <div>
          <p className="text-[14px] font-medium text-neutral-950">Shared sections</p>
          <p className="mt-1 text-[13px] text-neutral-500">What members&apos; memory adds to the graph. Sensitive memories never go in.</p>
          <div className="mt-3">
            <SectionPicker label="Shared sections" choices={choices} picked={sections} disabled={pending} onChange={setSections} />
          </div>
        </div>
        <div className="border-t border-neutral-100 pt-6">
          <p className="text-[14px] font-medium text-neutral-950">Default access</p>
          <p className="mt-1 text-[13px] text-neutral-500">What a member may do until you set their own access.</p>
          <div className="mt-4">
            <AccessEditor
              key={sections.join(",")}
              value={defaultAccess.read === "all" ? defaultAccess : { ...defaultAccess, read: defaultAccess.read.filter((k) => sections.includes(k)) }}
              sections={sharedChoices}
              disabled={pending}
              saveLabel="Save settings"
              onSave={(access) => run(() => saveOrgSettings({ name: draftName, sections, defaultAccess: access }))}
            />
          </div>
        </div>
      </div>
      <p role="status" aria-live="polite" className={lineClass(line?.error)}>
        {line?.text ?? ""}
      </p>
    </Panel>
  );
}
