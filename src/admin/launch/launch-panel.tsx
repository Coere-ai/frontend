"use client";

import { useState } from "react";

import { saveLaunchAction } from "@/app/admin/launch/actions";
import { ago } from "@/lib/dashboard/format";
import { timeLeft } from "@/lib/launch/countdown";
import { daysFromNow, fromLocalInput, shiftDays, toLocalInput } from "@/lib/launch/moment";
import type { AdminLaunch } from "@/lib/launch/store";
import { LAUNCH_PRODUCTS, launchCopy, type LaunchProduct } from "@/site/content/launch";
import { Countdown } from "@/site/launch/countdown";
import { useNow } from "@/site/launch/use-now";

import { AdminPanel } from "../admin-panel";
import { Button, fieldClass, fieldStyle, Label, Status } from "../controls";
import { useAction } from "../use-action";
import { useAdminData } from "../use-admin-data";

/** The zone this browser is in, named, with its offset at that moment: "Europe/London, GMT+1". */
function zoneOf(ms: number): string {
  const name = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  const offset = new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" }).formatToParts(ms).find((p) => p.type === "timeZoneName")?.value;
  return offset ? `${name}, ${offset}` : name;
}

const utcLine = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(ms);

/** An on and off switch in the panel's look: ink when on. */
function Toggle({ id, on, onChange, label }: { id: string; on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors"
      style={{ background: on ? "var(--color-accent)" : "var(--color-canvas-soft)", borderColor: on ? "var(--color-accent)" : "var(--color-border)" }}
    >
      <span className="absolute h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: `translateX(${on ? 18 : 2}px)` }} />
    </button>
  );
}

/**
 * One product's countdown: a preview drawn by the page's own component, the
 * moment in the operator's own zone, quick moves, the show switch and Save.
 * A moment in the past saves only after a confirm, since the page then says
 * the product is here.
 */
function LaunchCard({ product, saved, reload }: { product: LaunchProduct; saved: AdminLaunch[LaunchProduct]; reload: () => void }) {
  const copy = launchCopy[product];
  const savedMs = Date.parse(saved.at);
  const [draft, setDraft] = useState(savedMs);
  const [show, setShow] = useState(saved.show);
  const [confirming, setConfirming] = useState(false);
  const { run, pending, message } = useAction(reload);
  const now = useNow();

  const dirty = draft !== savedMs || show !== saved.show;
  const past = now !== null && draft <= now;
  const id = `launch-${product}`;

  const move = (ms: number) => {
    setDraft(ms);
    setConfirming(false);
  };
  const save = (confirmPast: boolean) => {
    if (past && !confirmPast) return setConfirming(true);
    setConfirming(false);
    run(() => saveLaunchAction(product, { at: new Date(draft).toISOString(), show, confirmPast }));
  };
  const reset = () => {
    setDraft(savedMs);
    setShow(saved.show);
    setConfirming(false);
  };

  return (
    <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-baseline gap-2.5">
          <h3 className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">{copy.name}</h3>
          <a href={copy.path} target="_blank" rel="noreferrer" className="text-[12px] text-[color:var(--color-muted)] underline-offset-2 hover:underline">
            coere.ai{copy.path}
          </a>
        </div>
        <span className="flex items-center gap-1.5 text-[11.5px] text-[color:var(--color-muted)]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: dirty ? "#d97706" : saved.saved ? "var(--color-chart)" : "var(--color-muted-soft)" }} />
          {dirty ? "Unsaved changes" : saved.saved ? `Saved ${ago(saved.updatedAt, now ?? undefined)}` : "Default moment, not saved yet"}
        </span>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* What a visitor sees, drawn by the page's own component at a smaller size. */}
        <div className="border-b p-4 lg:border-r lg:border-b-0" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas-soft)" }}>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.07em] uppercase text-[color:var(--color-muted)]">Preview</p>
          <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: "var(--color-rule-subtle)" }}>
              <span className="h-2 w-2 rounded-full bg-neutral-200" />
              <span className="h-2 w-2 rounded-full bg-neutral-200" />
              <span className="h-2 w-2 rounded-full bg-neutral-200" />
              <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-[10.5px] text-neutral-500">coere.ai{copy.path}</span>
            </div>
            <div className="bg-gradient-to-b from-mist to-white px-4 pt-8 pb-9">
              {show ? <Countdown left={now === null ? null : timeLeft(draft, now)} size="sm" /> : null}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-4">
          <div>
            <Label htmlFor={`${id}-at`}>Launch moment</Label>
            <input
              id={`${id}-at`}
              type="datetime-local"
              step={60}
              value={toLocalInput(draft)}
              onChange={(e) => {
                const ms = fromLocalInput(e.target.value);
                if (ms !== null) move(ms);
              }}
              className={`${fieldClass} tabular-nums`}
              style={fieldStyle}
            />
            <p className="mt-1.5 text-[11.5px] text-[color:var(--color-muted)]">
              In your time zone ({zoneOf(draft)}). That is {utcLine(draft)} UTC.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Button type="button" onClick={() => move(shiftDays(draft, 1))}>
                +1 day
              </Button>
              <Button type="button" onClick={() => move(shiftDays(draft, 7))}>
                +1 week
              </Button>
              <Button type="button" onClick={() => move(daysFromNow(Date.now(), 20))}>
                20 days from now
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <label htmlFor={`${id}-show`} className="block text-[12.5px] font-medium text-[color:var(--color-ink)]">
                Show the countdown
              </label>
              <p className="mt-0.5 text-[11.5px] text-[color:var(--color-muted)]">Off, the page says coming soon without the timer.</p>
            </div>
            <Toggle id={`${id}-show`} on={show} onChange={setShow} label="Show the countdown" />
          </div>

          {past && show ? (
            <p className="rounded-md border px-3 py-2 text-[12px] leading-relaxed" style={{ borderColor: "#f3c98b", background: "#fffaf0", color: "#7a4a06" }}>
              This moment has passed. Saving it makes {copy.path} say {copy.name} is here.
            </p>
          ) : null}

          <div className="border-t pt-4" style={{ borderColor: "var(--color-rule-subtle)" }}>
            {confirming ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[12px] text-[color:var(--color-ink)]">Save a moment in the past?</span>
                <Button type="button" strong disabled={pending} onClick={() => save(true)}>
                  Save anyway
                </Button>
                <Button type="button" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" strong disabled={pending || !dirty} onClick={() => save(false)}>
                  {pending ? "Saving" : dirty ? "Save" : "Saved"}
                </Button>
                {dirty ? (
                  <Button type="button" disabled={pending} onClick={reset}>
                    Undo changes
                  </Button>
                ) : null}
              </div>
            )}
            <div className="mt-2">
              <Status text={message} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The launch countdowns on /install and /try-teams. Each saves on its own,
 * and the pages show a saved change at once. It does not refresh by itself,
 * so a moment being edited is never replaced under the operator's hands.
 */
export function LaunchPanel() {
  const { data, error, reload } = useAdminData<AdminLaunch>("/api/admin/launch", { poll: false });
  return (
    <AdminPanel title="Launch countdown" ready={!!data} error={error} reload={reload}>
      {data ? (
        <div className="space-y-6">
          {LAUNCH_PRODUCTS.map((product) => (
            <LaunchCard key={product} product={product} saved={data[product]} reload={reload} />
          ))}
        </div>
      ) : null}
    </AdminPanel>
  );
}
