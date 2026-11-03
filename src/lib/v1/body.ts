/**
 * Reading a request body under a cap. The declared length is checked first,
 * then the bytes are counted as they arrive, so a body that lies about its
 * length still stops at the cap instead of filling memory.
 */

export type BodyRead = { ok: true; bytes: Uint8Array } | { ok: false; reason: "too_large" | "bad_request" };

export async function readBody(req: Request, cap: number): Promise<BodyRead> {
  const declared = Number(req.headers.get("content-length") ?? "NaN");
  if (Number.isFinite(declared) && declared > cap) return { ok: false, reason: "too_large" };
  if (!req.body) return { ok: true, bytes: new Uint8Array(0) };
  const reader = req.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > cap) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: "too_large" };
      }
      parts.push(value);
    }
  } catch {
    return { ok: false, reason: "bad_request" };
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.byteLength;
  }
  return { ok: true, bytes };
}

export type JsonRead = { ok: true; value: unknown; bytes: Uint8Array } | { ok: false; reason: "too_large" | "bad_request" };

/** The body parsed as JSON. An empty or malformed body is a bad request. */
export async function readJson(req: Request, cap: number): Promise<JsonRead> {
  const body = await readBody(req, cap);
  if (!body.ok) return body;
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(body.bytes)), bytes: body.bytes };
  } catch {
    return { ok: false, reason: "bad_request" };
  }
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
