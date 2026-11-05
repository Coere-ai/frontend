"use client";

import { useState } from "react";

import { saveLaunchAction } from "@/app/admin/launch/actions";
import { timeLeft } from "@/lib/launch/countdown";
import { fromLocalInput, toLocalInput } from "@/lib/launch/moment";
import type { AdminLaunch } from "@/lib/launch/store";
import { LAUNCH_PRODUCTS, launchCopy, type LaunchProduct } from "@/site/content/launch";
import { Countdown } from "@/site/launch/countdown";
import { useNow } from "@/site/launch/use-now";

import { AdminPanel } from "../admin-panel";
import { Button, fieldClass, fieldStyle, Label } from "../controls";
import { useAction } from "../use-action";
import { useAdminData } from "../use-admin-data";

/** An on and off switch in the panel's look: ink when on. */
function Toggle({ id, on, onChange }: { id: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors"
      style={{ background: on ? "var(--color-accent)" : "var(--color-canvas-soft)", borderColor: on ? "var(--color-accent)" : "var(--color-border)" }}
    >
      <span className="absolute h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: `translateX(${on ? 18 : 2}px)` }} />
    </button>
  );
}

const textButton = "text-[12px] text-[color:var(--color-muted)] underline-offset-2 hover:text-[color:var(--color-ink)] hover:underline";

/**
 * One product's countdown: what it is for, a small preview of what
 * visitors see, the moment, the show switch and Save. A moment in the past
 * saves only after a confirm, since the page then says the product is here.
 */
function LaunchCard({ product, saved, reload }: { product: LaunchProduct; saved: AdminLaunch[LaunchProduct]; reload: () => void }) {
  const copy = launchCopy[product];
  const savedMs = Date.parse(saved.at);
  const [draft, setDraft] = useState(savedMs);
  const [show, setShow] = useState(saved.show);
  const [confirming, setConfirming] = useState(false);
  const { run, pending, message, clear } = useAction(reload);
  const now = useNow();

  const dirty = draft !== savedMs || show !== saved.show;
  const past = now !== null && draft <= now;
  const id = `launch-${product}`;

  const move = (ms: number) => {
    setDraft(ms);
    setConfirming(false);
    clear();
  };
  const save = (confirmPast: boolean) => {
    if (past && !confirmPast) return setConfirming(true);
    setConfirming(false);
    run(() => saveLaunchAction(product, { at: new Date(draft).toISOString(), show, confirmPast }));
  };
  const line = pending ? "Saving" : (message ?? (dirty || !saved.saved ? "Not saved yet" : ""));
  const left = now === null ? null : timeLeft(draft, now);

  return (
    <section className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="flex items-baseline gap-2.5">
        <h3 className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">{copy.name}</h3>
        <a href={copy.path} target="_blank" rel="noreferrer" className={textButton}>
          coere.ai{copy.path}
        </a>
      </div>

      <p className="mt-1 text-[12px] text-[color:var(--color-muted)]">
        Shown on coere.ai{copy.path} until {copy.name} is out.
      </p>

      {/* What a visitor sees, small: the page's title and its countdown, drawn by the page's own component. */}
      <div className="mt-4 rounded-lg border px-4 py-5 text-center text-[color:var(--color-ink)]" style={{ borderColor: "var(--color-border)", background: "white" }} aria-label="Preview">
        <p className="text-[15px] font-medium tracking-[-0.02em]">{left?.done ? copy.here : copy.title}</p>
        {show && !left?.done ? (
          <div className="mt-3">
            <Countdown left={left} size="sm" />
          </div>
        ) : null}
      </div>

      <div className="mt-4">
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
          className={`${fieldClass} max-w-[260px] tabular-nums`}
          style={fieldStyle}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Toggle
          id={`${id}-show`}
          on={show}
          onChange={(v) => {
            setShow(v);
            setConfirming(false);
            clear();
          }}
        />
        <label htmlFor={`${id}-show`} className="text-[12.5px] text-[color:var(--color-ink)]">
          Show the countdown
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {confirming ? (
          <>
            <p className="w-full text-[12px] text-[color:var(--color-ink)]">
              This moment has passed, so {copy.path} will say {copy.name} is here.
            </p>
            <Button type="button" strong disabled={pending} onClick={() => save(true)}>
              Save anyway
            </Button>
            <Button type="button" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button type="button" strong disabled={pending || !dirty} onClick={() => save(false)}>
              Save
            </Button>
            <p role="status" aria-live="polite" className="text-[12px] text-[color:var(--color-muted)]">
              {line}
            </p>
          </>
        )}
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
        <div className="grid gap-4 lg:grid-cols-2">
          {LAUNCH_PRODUCTS.map((product) => (
            <LaunchCard key={product} product={product} saved={data[product]} reload={reload} />
          ))}
        </div>
      ) : null}
    </AdminPanel>
  );
}
