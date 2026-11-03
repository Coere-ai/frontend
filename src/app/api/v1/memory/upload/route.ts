import { fileLimit, parseUploadRequest } from "@/lib/memory/upload-rules";
import { stageUpload, storedDigest } from "@/lib/memory/user-memory";
import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// POST /api/v1/memory/upload (docs/accounts.md 8.6)
//
// The first step of a memory push. Answers a signed upload address in the
// caller's incoming folder, which the extension PUTs the zip to directly,
// so the file never passes through this site's request size limit.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const a = g.account;
  const body = await readJson(req, 4096);
  if (!body.ok) return problem(body.reason);
  const asked = parseUploadRequest(body.value);
  if (!asked) return problem("bad_request");
  if (!a.memorySync) return problem("memory_sync_off");
  if (asked.bytes > fileLimit(a.storageLimitBytes)) return problem("too_large");
  if ((await storedDigest(a.userId)) === asked.digest) return json({ skip: true });
  const staged = await stageUpload(a.userId);
  return staged ? json({ skip: false, path: staged.path, url: staged.url }) : problem("unavailable");
}
