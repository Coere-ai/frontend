import { supabase } from "@/lib/supabase";
import { readJson } from "@/lib/v1/body";
import { dailyCapArgs, parseEvents } from "@/lib/v1/events";
import { gate } from "@/lib/v1/gate";
import { isUnknownFunction } from "@/lib/v1/hold-rules";
import { noContent, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// POST /api/v1/events (docs/accounts.md 6.7, 8.9)
//
// A batch of feature counts. One record_app_events_capped call holds it to
// the device's daily bounds, stores it and adds it to the person's, their
// organization's and today's totals, including the tokens saved by context
// imports and transfers. Before migration 20261125000000_proxy_settle has
// run, record_app_events takes it with the per request caps alone.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, 16 * 1024);
  if (!body.ok) return problem(body.reason);
  const events = parseEvents(body.value);
  if (!events) return problem("bad_request");
  const args = dailyCapArgs(g.account.userId, g.account.deviceId, events);
  let { error } = await supabase().rpc("record_app_events_capped", args);
  if (isUnknownFunction(error)) ({ error } = await supabase().rpc("record_app_events", { p_user: args.p_user, p_device: args.p_device, p_events: args.p_events }));
  if (error) {
    console.error("record_app_events failed", error.code);
    return problem("unavailable");
  }
  return noContent();
}
