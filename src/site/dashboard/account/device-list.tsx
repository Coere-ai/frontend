"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { revokeDevice } from "@/app/(site)/dashboard/account/actions";
import { ago } from "@/lib/dashboard/format";
import type { Device } from "@/lib/dashboard/reads";

/**
 * The browsers connected to this account, each with Revoke. A revoked
 * browser's Coere is signed out on its next request and asks to connect
 * again.
 */
export function DeviceList({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [problem, setProblem] = useState<string | null>(null);
  const live = devices.filter((d) => !d.revokedAt);

  const revoke = (d: Device) => {
    if (!window.confirm(`Revoke ${d.name}? Coere in that browser will be signed out.`)) return;
    start(async () => {
      setProblem(null);
      const done = await revokeDevice(d.id);
      if (!done.ok) setProblem("That did not work. Try again in a minute.");
      router.refresh();
    });
  };

  if (live.length === 0) return <p className="text-[15px] text-neutral-500">No browsers are connected. Install Coere in Chrome and press Connect Coere when it opens coere.ai.</p>;
  return (
    <div>
      <ul className="divide-y divide-neutral-100">
        {live.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
            <div className="min-w-0">
              <p className="truncate text-[15px] text-neutral-950">{d.name}</p>
              <p className="mt-0.5 text-[13px] text-neutral-500">
                {[`Token ending ${d.tokenHint}`, d.extensionVersion ? `Coere ${d.extensionVersion}` : null, d.lastUsedAt ? `used ${ago(d.lastUsedAt)}` : `connected ${ago(d.createdAt)}`]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <button type="button" disabled={pending} onClick={() => revoke(d)} className="shrink-0 rounded-full px-4 py-2 text-[14px] text-neutral-950 transition-colors hover:bg-neutral-100 disabled:opacity-60">
              Revoke
            </button>
          </li>
        ))}
      </ul>
      {problem ? <p className="mt-3 text-[13px] text-red-600">{problem}</p> : null}
    </div>
  );
}
