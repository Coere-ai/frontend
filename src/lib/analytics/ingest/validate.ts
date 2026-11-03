import { MAX_LABEL, SECTION_ID, cleanLabel } from "@/lib/analytics/sections/ids";

// Turning an untrusted beacon body into values we are willing to store.
//
// Every helper here is total: it never throws, and anything it does not like
// becomes a safe default or a null. The endpoint answers 204 no matter what, so
// a malformed field is dropped quietly rather than reported.

/** One section reading, ready for record_sections. */
export type SectionInput = {
  section: string;
  seconds: number;
  label: string | null;
  position: number | null;
};

/** A page can have many headings; the cap is generous but bounded, so a
 *  crafted body cannot turn one beacon into thousands of upserts. */
const MAX_SECTIONS = 40;
const MAX_POSITION = 199;

export const id = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 && v.length <= 64 ? v : null;

export const num = (v: unknown, min: number, max: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

export const text = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

/** Keep only the referrer's HOST. A query string can carry a person's search
 *  terms, which are not ours to store. */
export function safeReferrer(ref: unknown): string | null {
  if (typeof ref !== "string") return null;
  const raw = ref.trim();
  if (!raw) return null;
  try {
    return new URL(raw).host.toLowerCase().slice(0, 128) || null;
  } catch {
    return raw.toLowerCase().replace(/[^a-z0-9.:_-]/g, "").slice(0, 128) || null;
  }
}

/** Normalise the path so "top pages" groups. A query string makes every
 *  campaign link its own row and a trailing slash splits one page in two. */
export function safePath(path: unknown): string {
  if (typeof path !== "string") return "/";
  const clean = path.split("?")[0]!.split("#")[0]!.trim();
  if (!clean.startsWith("/")) return "/";
  const trimmed = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  return (trimmed || "/").slice(0, 256);
}

/** The section batch. Duplicates and bad ids are dropped; label and position
 *  are optional, because a tab opened before this release will not send them. */
export function parseSections(raw: unknown): SectionInput[] {
  if (!Array.isArray(raw)) return [];
  const out: SectionInput[] = [];
  const seen = new Set<string>();
  for (const entry of raw.slice(0, MAX_SECTIONS)) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as { id?: unknown; seconds?: unknown; label?: unknown; position?: unknown };
    if (typeof e.id !== "string" || !SECTION_ID.test(e.id) || seen.has(e.id)) continue;
    seen.add(e.id);
    const label = typeof e.label === "string" ? cleanLabel(e.label).slice(0, MAX_LABEL) : "";
    out.push({
      section: e.id,
      seconds: Math.round(num(e.seconds, 0, 86_400)),
      label: label || null,
      position:
        typeof e.position === "number" ? Math.round(num(e.position, 0, MAX_POSITION)) : null,
    });
  }
  return out;
}

/** The unload beacon may omit Origin (allowed); a present, mismatched Origin is
 *  rejected. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
