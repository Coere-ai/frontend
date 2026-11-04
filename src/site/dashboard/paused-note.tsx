import { PAUSE_LINES, type Pause } from "@/lib/dashboard/limits";
import { siteConfig } from "@/lib/site";

/** The one plain line the dashboard shows while the person's AI use is paused, and nothing otherwise. */
export function PausedNote({ pause }: { pause: Pause | null }) {
  if (!pause) return null;
  return (
    <p role="status" className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-700">
      {pause === "contact" ? (
        <>
          Your AI use is paused.{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-neutral-950 underline underline-offset-2">
            Contact us
          </a>{" "}
          to continue.
        </>
      ) : (
        PAUSE_LINES[pause]
      )}
    </p>
  );
}
