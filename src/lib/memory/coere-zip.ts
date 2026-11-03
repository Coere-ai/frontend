import { strFromU8, unzipSync } from "fflate";

/**
 * Opening a `.coere` file on the server (docs/accounts.md 8.6). It must be
 * a zip whose first entry is `mimetype` holding the Coere media type, as
 * coere-v2's `format/zip.ts` writes it, with a `manifest.json`. Only the
 * entries the index needs are inflated: records, section files and
 * documents. Chat text, citations, earlier versions and forget keys stay
 * packed. Each entry inflates into a buffer of its declared size, so the
 * declared sizes bound the memory used, and their total is capped.
 */

export const COERE_MIMETYPE = "application/vnd.coere.memory+zip";
/** The most the wanted entries may hold unzipped, as the extension's own import allows. */
export const MAX_UNZIPPED_BYTES = 128 * 1024 * 1024;

export interface CoereManifest {
  format: "coere.memory";
  version: string;
  created: string;
  generator: { app: string; version: string } | null;
  self: string | null;
  timeZone: string | null;
  files: Record<string, { records?: number; sha256?: string }>;
  digest: string;
}

export type OpenedCoere =
  | { ok: true; manifest: CoereManifest; files: Map<string, string> }
  | { ok: false; reason: "not_coere" | "too_large" | "bad_manifest" };

/** Entries the index reads. */
export function wantedEntry(name: string): boolean {
  if (name === "mimetype" || name === "manifest.json") return true;
  if (name.startsWith("chats/") || name.includes(".versions/")) return false;
  if (name.endsWith(".cite.jsonl") || name === "forget-keys.jsonl") return false;
  return name.endsWith(".jsonl") || name.endsWith(".json") || name.endsWith(".md");
}

/** True when the zip's first local header names `mimetype`, as an EPUB's does. */
function startsWithMimetype(bytes: Uint8Array): boolean {
  if (bytes.length < 38 || bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 3 || bytes[3] !== 4) return false;
  const nameLength = bytes[26]! | (bytes[27]! << 8);
  return nameLength === 8 && strFromU8(bytes.subarray(30, 38)) === "mimetype";
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function parseManifest(text: string): CoereManifest | null {
  let m: unknown;
  try {
    m = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(m) || m.format !== "coere.memory" || typeof m.version !== "string") return null;
  if (typeof m.digest !== "string" || !/^[0-9a-f]{64}$/.test(m.digest) || !isRecord(m.files)) return null;
  const g = isRecord(m.generator) && typeof m.generator.app === "string" && typeof m.generator.version === "string" ? m.generator : null;
  return {
    format: "coere.memory",
    version: m.version.slice(0, 16),
    created: typeof m.created === "string" ? m.created : "",
    generator: g ? { app: String(g.app).slice(0, 40), version: String(g.version).slice(0, 40) } : null,
    self: typeof m.self === "string" ? m.self : null,
    timeZone: typeof m.timeZone === "string" ? m.timeZone : null,
    files: m.files as CoereManifest["files"],
    digest: m.digest,
  };
}

export function openCoere(bytes: Uint8Array): OpenedCoere {
  if (!startsWithMimetype(bytes)) return { ok: false, reason: "not_coere" };
  let total = 0;
  let raw: Record<string, Uint8Array>;
  try {
    raw = unzipSync(bytes, {
      filter: (f) => {
        if (!wantedEntry(f.name)) return false;
        total += f.originalSize;
        if (total > MAX_UNZIPPED_BYTES) throw new Error("too_large");
        return true;
      },
    });
  } catch (err) {
    return { ok: false, reason: (err as Error).message === "too_large" ? "too_large" : "not_coere" };
  }
  if (!raw.mimetype || strFromU8(raw.mimetype) !== COERE_MIMETYPE) return { ok: false, reason: "not_coere" };
  const manifest = raw["manifest.json"] ? parseManifest(strFromU8(raw["manifest.json"])) : null;
  if (!manifest) return { ok: false, reason: "bad_manifest" };
  const files = new Map<string, string>();
  for (const [name, data] of Object.entries(raw)) {
    if (name !== "mimetype" && name !== "manifest.json") files.set(name, strFromU8(data));
  }
  return { ok: true, manifest, files };
}
