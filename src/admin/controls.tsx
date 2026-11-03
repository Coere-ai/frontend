// The panel's form controls, in its own look: thin borders, ink for the
// action that does something, a plain outline for the rest. Shared by the
// account and organization pages so every form reads the same.

/** A text field or a select. */
export const fieldClass =
  "w-full rounded-md border bg-[color:var(--color-surface)] px-2.5 py-1.5 text-[12.5px] text-[color:var(--color-ink)] outline-none focus:border-[color:var(--color-ink)] disabled:opacity-60";

export const fieldStyle = { borderColor: "var(--color-border)" } as const;

export function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[11px] font-semibold tracking-[0.07em] uppercase text-[color:var(--color-ink)]">
      {children}
    </label>
  );
}

/** `strong` is the action the form exists for; the rest are outlined. */
export function Button({
  strong,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { strong?: boolean }) {
  return (
    <button
      type="submit"
      {...rest}
      className="rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-[color:var(--color-canvas-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      style={
        strong
          ? { background: "var(--color-accent)", borderColor: "var(--color-accent)", color: "var(--color-on-ink)" }
          : { borderColor: "var(--color-border)", color: "var(--color-ink)" }
      }
    >
      {children}
    </button>
  );
}

/** What the last action said, read out to a screen reader as it changes. */
export function Status({ text }: { text: string | null }) {
  return (
    <p role="status" aria-live="polite" className="min-h-[1.25rem] text-[12px] text-[color:var(--color-ink)]">
      {text}
    </p>
  );
}

/** A small framed block for one group of settings or actions. */
export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <h3 className="mb-3 text-[13.5px] font-semibold text-[color:var(--color-ink)]">{title}</h3>
      {children}
    </section>
  );
}
