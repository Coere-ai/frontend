"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createOrganization } from "@/app/admin/organizations/actions";
import type { PlanRow } from "@/lib/admin/types";

import { Button, Card, fieldClass, fieldStyle, Label, Status } from "../controls";

/**
 * Making an organization, which only the operator does: a name, a plan
 * (team unless picked otherwise) and its first admin, an existing account
 * found by username. A made organization opens straight away.
 */
export function CreateOrg({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const submit = (form: FormData) =>
    start(async () => {
      const r = await createOrganization(form).catch(() => ({ ok: false as const, error: "That did not reach the server. Try again." }));
      if (r.ok && r.id) router.push(`/admin/organizations/${r.id}`);
      setMessage(r.ok ? r.notice : r.error);
    });

  return (
    <Card title="Create an organization">
      <form action={submit} className="grid gap-3 md:grid-cols-[2fr_1fr_2fr_auto] md:items-end">
        <div>
          <Label htmlFor="org-name">Name</Label>
          <input id="org-name" name="name" required maxLength={80} autoComplete="off" className={fieldClass} style={fieldStyle} />
        </div>
        <div>
          <Label htmlFor="org-plan">Plan</Label>
          <select id="org-plan" name="plan" defaultValue="team" className={fieldClass} style={fieldStyle}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="org-admin">First admin</Label>
          <input id="org-admin" name="admin" required placeholder="Username of an account" autoComplete="off" className={fieldClass} style={fieldStyle} />
        </div>
        <Button strong disabled={pending}>
          {pending ? "Creating…" : "Create"}
        </Button>
      </form>
      <div className="mt-2">
        <Status text={message} />
      </div>
    </Card>
  );
}
