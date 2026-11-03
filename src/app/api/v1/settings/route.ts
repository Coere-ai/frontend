import { readSettings, writeSettings } from "@/lib/settings/store";
import { validateSettings } from "@/lib/settings/synced-keys";
import { isRecord, readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// GET and PUT /api/v1/settings (docs/accounts.md 6.6, 8.8)
//
// The synced settings: GET answers the whole record, PUT merges the given
// keys, bumps the version and answers the record.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The 64 KiB record plus room for the wrapper. */
const BODY_CAP = 80 * 1024;

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  try {
    return json(await readSettings(g.account.userId));
  } catch {
    return problem("unavailable");
  }
}

export async function PUT(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, BODY_CAP);
  if (!body.ok) return problem(body.reason);
  const change = isRecord(body.value) ? validateSettings(body.value.settings) : null;
  if (!change) return problem("bad_request");
  try {
    const written = await writeSettings(g.account.userId, change, "extension");
    return written.ok ? json(written.record) : problem(written.reason);
  } catch {
    return problem("unavailable");
  }
}
