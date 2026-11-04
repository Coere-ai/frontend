import { commitMemory } from "@/lib/memory/commit";
import { parseCommitPath } from "@/lib/memory/upload-rules";
import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// POST /api/v1/memory/commit (docs/accounts.md 8.6)
//
// The last step of a memory push: the staged file becomes the stored copy,
// with its index, its row, the totals and the organization graph updated.
// A 50 MiB file takes a while to read, hence the longer ceiling.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, 4096);
  if (!body.ok) return problem(body.reason);
  const path = parseCommitPath(body.value, g.account.userId);
  if (!path) return problem("bad_request");
  try {
    const done = await commitMemory(g.account, path);
    if (!done.ok) return problem(done.reason);
    return json({ bytes: done.bytes, digest: done.digest, uploadedAt: done.uploadedAt, counts: done.counts });
  } catch {
    return problem("unavailable");
  }
}
