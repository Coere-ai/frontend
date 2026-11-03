import { discoverSections } from "@/lib/analytics/sections/discover";

/** A section counts as SEEN once this much of it has been on screen, even if
 *  the reader never settled on it. */
const SEEN_RATIO = 0.5;

/** One section's running numbers, in the shape the beacon sends. */
export type SectionReading = {
  id: string;
  seconds: number;
  label: string;
  position: number;
};

/**
 * Per-section reading time for one page view.
 *
 * Each sample asks which section fills the most of the viewport and credits
 * that one, and only that one, with the tick. Two sections are almost always on
 * screen together at a boundary, and crediting both would make the section
 * times sum to more than the visit lasted. Anything sufficiently on screen is
 * separately marked SEEN, which is what the dashboard's reach is built from.
 */
export function sectionClock() {
  const dwell = new Map<string, number>();
  const seen = new Map<string, { label: string; position: number }>();
  const sent = new Map<string, string>();

  /** Measure the page once. `creditSeconds` is 0 for a sample taken at load,
   *  which marks what is visible without inventing time that has not passed. */
  const sample = (creditSeconds: number) => {
    const viewport = window.innerHeight || 1;
    let best: string | null = null;
    let bestArea = 0;

    for (const s of discoverSections(document)) {
      const height = s.bottom - s.top;
      const visible = Math.max(0, Math.min(viewport, s.bottom) - Math.max(0, s.top));
      if (visible <= 0) continue;

      // Seen when half the section has been on screen, or when it is taller
      // than the window and has filled half of it.
      const ratio = Math.max(height > 0 ? visible / height : 0, visible / viewport);
      if (ratio >= SEEN_RATIO) seen.set(s.id, { label: s.label, position: s.position });

      if (visible > bestArea) {
        bestArea = visible;
        best = s.id;
        // The owner of the tick is always seen, even a short section.
        if (!seen.has(s.id)) seen.set(s.id, { label: s.label, position: s.position });
      }
    }

    if (best && creditSeconds > 0) {
      dwell.set(best, (dwell.get(best) ?? 0) + creditSeconds);
    }
  };

  /** Sections whose numbers changed since the last call. Marks them sent, so
   *  a flush that skips a quiet section costs nothing on the wire. */
  const drain = (): SectionReading[] => {
    const out: SectionReading[] = [];
    for (const [id, meta] of seen) {
      const seconds = Math.round(dwell.get(id) ?? 0);
      // The label is part of the fingerprint: a heading that changed text on a
      // client render is worth re-sending even if no time moved.
      const fingerprint = `${seconds}|${meta.label}`;
      if (sent.get(id) === fingerprint) continue;
      sent.set(id, fingerprint);
      out.push({ id, seconds, label: meta.label, position: meta.position });
    }
    return out;
  };

  return { sample, drain };
}
