"use client";

import { leaveOrganization, setShareMemory } from "@/app/(site)/dashboard/organization/member-actions";
import { Panel } from "@/site/dashboard/panel";
import { SwitchRow } from "@/site/settings/controls";
import { buttonClass } from "@/site/ui/button";

import { lineClass, useOrgAction } from "./use-org-action";

/** The person's own place in the organization: share my memory, and leave. */
export function MySharing({ orgName, shareMemory, contributeAllowed, shared }: { orgName: string; shareMemory: boolean; contributeAllowed: boolean; shared: string[] }) {
  const { pending, line, run } = useOrgAction();
  return (
    <Panel title="Your memory here" description={`Only your ${shared.length === 1 ? "section" : "sections"} ${shared.join(", ")} can go into the shared graph, and never a sensitive memory.`}>
      <SwitchRow
        label="Share my memory"
        about={contributeAllowed ? "Puts your shared sections into the organization's graph. Off takes them out at once." : "An admin has set your access so your memory does not go into the graph."}
        checked={shareMemory}
        disabled={pending}
        onChange={(on) => run(() => setShareMemory(on))}
      />
      <div className="mt-6 border-t border-neutral-100 pt-6">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(leaveOrganization, `Leave ${orgName}? Your memory leaves its graph, and an admin has to invite you to come back.`)}
          className={buttonClass("secondary", "disabled:opacity-60")}
        >
          Leave {orgName}
        </button>
      </div>
      <p role="status" aria-live="polite" className={lineClass(line?.error)}>
        {line?.text ?? ""}
      </p>
    </Panel>
  );
}
