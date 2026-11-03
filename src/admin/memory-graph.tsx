"use client";

import { useState } from "react";

import type { MemoryPayload } from "@/lib/admin/types";
import { MemoryExplorer } from "@/site/memory/memory-explorer";

import { Button } from "./controls";
import { useAdminData } from "./use-admin-data";

/**
 * A person's or an organization's knowledge graph, behind a button. The
 * graph is their private memory and every read of it is recorded, so it
 * loads only when the operator asks, once, and never refreshes itself.
 */
export function MemoryGraph({ url, what }: { url: string; what: string }) {
  const [open, setOpen] = useState(false);
  const { data, error } = useAdminData<MemoryPayload>(open ? url : null, { poll: false });

  if (!open)
    return (
      <div className="space-y-2">
        <p className="text-[12.5px] text-[color:var(--color-ink)]">
          This is {what} private memory. Each time you open it, the security log records it.
        </p>
        <Button type="button" onClick={() => setOpen(true)}>
          Open the knowledge graph
        </Button>
      </div>
    );
  if (error) return <p role="alert" className="text-[12.5px] text-[color:var(--color-ink)]">{error}</p>;
  if (!data) return <p className="text-[12.5px] text-[color:var(--color-muted)]">Loading the graph…</p>;
  if (!data.view) return <p className="text-[12.5px] text-[color:var(--color-ink)]">There is no memory to show yet.</p>;
  return (
    <div className="rounded-xl border bg-white p-4" style={{ borderColor: "var(--color-border)" }}>
      <MemoryExplorer view={data.view} center={data.center} names={data.names} />
    </div>
  );
}
