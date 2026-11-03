"use client";

import { useState } from "react";

import { saveOrgSettings } from "@/app/admin/organizations/actions";
import type { AdminResult } from "@/lib/admin/action";
import type { OrgDetailPayload } from "@/lib/admin/types";

import { Button, Card, fieldClass, fieldStyle, Label } from "../controls";

import { AccessFields, SectionChecks } from "./access-editor";

type Run = (act: () => Promise<AdminResult>) => void;

/**
 * The organization's settings as the operator changes them: name, plan,
 * the sections members share into its graph, and the access a member has
 * until someone narrows it. The default's read list offers only the
 * sections ticked above it.
 */
export function OrgSettings({ data, run, pending }: { data: OrgDetailPayload; run: Run; pending: boolean }) {
  const { org } = data;
  const [name, setName] = useState(org.name);
  const [plan, setPlan] = useState(org.plan);
  const [sections, setSections] = useState<string[]>(org.sharedSections);
  const [access, setAccess] = useState(org.defaultAccess);
  const shared = data.sections.filter((s) => sections.includes(s.key));

  return (
    <Card title="Settings">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="settings-name">Name</Label>
            <input id="settings-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <Label htmlFor="settings-plan">Plan</Label>
            <select id="settings-plan" value={plan} onChange={(e) => setPlan(e.target.value)} className={fieldClass} style={fieldStyle}>
              {data.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.07em] uppercase text-[color:var(--color-ink)]">Shared sections</p>
          <SectionChecks label="Shared sections" sections={data.sections} picked={sections} onChange={setSections} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.07em] uppercase text-[color:var(--color-ink)]">Default access</p>
          <AccessFields value={access} onChange={setAccess} sections={shared} disabled={pending} />
        </div>
        <Button
          type="button"
          strong
          disabled={pending}
          onClick={() =>
            run(() =>
              saveOrgSettings(org.id, {
                name,
                plan,
                sections,
                defaultAccess: access.read === "all" ? access : { ...access, read: access.read.filter((k) => sections.includes(k)) },
              }),
            )
          }
        >
          Save settings
        </Button>
      </div>
    </Card>
  );
}
