import { isOrgAction, readOrgCommand } from "@/lib/org/commands";
import { runOrgCommand } from "@/lib/org/run-command";
import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { problem } from "@/lib/v1/http";
import { outcomeAnswer } from "@/lib/v1/outcome-answer";
import { problemFor } from "@/lib/v1/refusals";

// POST /api/v1/org/{action} (docs/accounts.md 8.11)
//
// The organization actions of the Console's Organization section: invite,
// revoke-invite, accept, decline, role, access, remove, leave, share and
// settings. Each runs the same rules the site's dashboard ran, for the
// person the device token belongs to, inside their own organization only.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The largest body any action takes: the settings, with up to 40 section keys twice over. */
const BODY_CAP = 16 * 1024;

type Ctx = RouteContext<"/api/v1/org/[action]">;

export async function POST(req: Request, ctx: Ctx): Promise<Response> {
  const { action } = await ctx.params;
  if (!isOrgAction(action)) return problem("not_found");
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, BODY_CAP);
  if (!body.ok) return problem(body.reason);
  const command = readOrgCommand(action, body.value);
  if (!command) return problem("bad_request");
  try {
    return outcomeAnswer(await runOrgCommand(g.account.userId, req.headers, command));
  } catch {
    return problem("unavailable");
  }
}
