/**
 * The calm backdrop for heroes without an animation of their own: white,
 * with soft pools of Coere blue and a faint grid that fades out toward the
 * edges. Pure CSS, so it costs nothing to scroll past. `accent` adds a pool
 * of one more color, as the Agents page does with its agents' colors.
 */
export function SoftBackdrop({ accent }: { accent?: string }) {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#f5f7ff_0%,#ffffff_70%)]">
      <div className="absolute -top-40 right-[-10%] h-[680px] w-[680px] rounded-full bg-brand-200/60 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[520px] w-[520px] rounded-full bg-brand-100/80 blur-[110px]" />
      {accent ? <div className="absolute top-1/3 right-[20%] h-[360px] w-[360px] rounded-full opacity-30 blur-[110px]" style={{ background: accent }} /> : null}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(82,103,247,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(82,103,247,0.07)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,black,transparent)]" />
    </div>
  );
}
