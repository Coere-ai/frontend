"use client";

import { useState, useTransition } from "react";

import { saveSetting, setBackup, setIncludeSensitive, type SaveResult } from "@/app/(site)/dashboard/settings/actions";
import { SETTING_GROUPS, type SettingValue } from "@/lib/settings/catalog";
import { backupMessage, settingsMessage } from "@/site/bridge/messages";
import { useCoere } from "@/site/bridge/use-coere";
import { Panel } from "@/site/dashboard/panel";

import { ChoiceRow, SwitchRow } from "./controls";

/**
 * The Settings page's form. A change shows at once and is saved on the
 * server; then the page tells Coere in this browser to pull the settings
 * now, so it does not wait for its 30 minute check.
 */

const PROBLEM: Record<Exclude<SaveResult, { ok: true }>["reason"], string> = {
  signed_out: "You were signed out. Reload the page to sign in again.",
  bad_request: "Coere could not save that change. Try again.",
  too_large: "Your settings are too large to save. Remove some blocked sites in Coere first.",
  unavailable: "Coere could not save that change. Try again in a minute.",
};

export function SettingsForm({
  initial,
  backup,
  allowedIds,
}: {
  initial: Record<string, SettingValue>;
  backup: { on: boolean; includeSensitive: boolean };
  allowedIds: string[];
}) {
  const [values, setValues] = useState(initial);
  const [backupOn, setBackupOn] = useState(backup.on);
  const [sensitive, setSensitive] = useState(backup.includeSensitive);
  const [line, setLine] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const { state, send } = useCoere(allowedIds);

  /** Saves one change, puts the old value back if it fails, and says what happened. */
  const save = (run: () => Promise<SaveResult>, undo: () => void, after: () => Promise<boolean> | null, done: string) =>
    start(async () => {
      setLine(null);
      const saved = await run();
      if (!saved.ok) {
        undo();
        setLine(PROBLEM[saved.reason]);
        return;
      }
      const told = state.status === "ready" ? await after() : null;
      setLine(told ? `${done} Coere in this browser has it.` : `${done} Coere picks it up within 30 minutes.`);
    });

  const change = (id: string, value: SettingValue) => {
    const was = values[id];
    setValues((v) => ({ ...v, [id]: value }));
    save(
      () => saveSetting(id, value),
      () => setValues((v) => ({ ...v, [id]: was! })),
      () => send(settingsMessage()),
      "Saved.",
    );
  };

  return (
    <div className="space-y-8">
      <p role="status" aria-live="polite" className="sticky top-[72px] z-10 min-h-5 bg-white py-2 text-[13px] text-neutral-500">
        {line ?? ""}
      </p>
      <Panel title="Backup" description="A copy of your memory on coere.ai, so this dashboard can show it. Chats themselves never leave your browser.">
        <SwitchRow
          label="Back up memory to coere.ai"
          about={backupOn ? "On. Coere backs up your memory a few minutes after it learns something new." : "Off. coere.ai keeps no copy of your memory."}
          checked={backupOn}
          disabled={pending}
          onChange={(on) => {
            if (!on && !window.confirm("Turn the backup off? This deletes the copy stored on coere.ai and your part of your organization's graph. Your memory in Coere stays.")) return;
            setBackupOn(on);
            save(() => setBackup(on), () => setBackupOn(!on), () => (on ? send(backupMessage()) : null), on ? "Backup on." : "Backup off. The stored copy is deleted.");
          }}
        />
        <SwitchRow
          label="Include sensitive memories"
          about="Health, money and other memories Coere marks sensitive go into the backup only with this on. They never go into an organization's graph."
          checked={sensitive}
          disabled={pending || !backupOn}
          onChange={(on) => {
            setSensitive(on);
            save(() => setIncludeSensitive(on), () => setSensitive(!on), () => send(backupMessage()), "Saved. The next backup follows it.");
          }}
        />
      </Panel>
      {SETTING_GROUPS.map((g) => (
        <Panel key={g.title} title={g.title} description={g.about}>
          {g.entries.map((e) =>
            e.choices ? (
              <ChoiceRow key={e.id} label={e.label} about={e.about} choices={e.choices} value={values[e.id]!} disabled={pending} onChange={(v) => change(e.id, v)} />
            ) : (
              <SwitchRow key={e.id} label={e.label} about={e.about} checked={values[e.id] === true} disabled={pending} onChange={(on) => change(e.id, on)} />
            ),
          )}
        </Panel>
      ))}
    </div>
  );
}
