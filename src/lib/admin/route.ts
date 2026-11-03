import "server-only";

import { isSignedIn } from "@/lib/auth/session";
import { supabaseConfigured } from "@/lib/supabase";

import { json, notFound } from "./http";

/**
 * The shape of every admin data route. The admin session is checked here
 * even though the proxy has looked at it already, because the proxy is a
 * second gate and never the only one. Then Supabase must be configured.
 * Then the loader runs, and a failure answers a fixed string while the real
 * error goes to the server log: a database message could name a table or a
 * column, and the operator gets nothing from it on screen.
 */
export async function adminRoute(label: string, load: () => Promise<Response | unknown>): Promise<Response> {
  if (!(await isSignedIn())) return notFound();
  if (!supabaseConfigured()) return json(503, { error: "Storage is not configured." });
  try {
    const out = await load();
    return out instanceof Response ? out : json(200, out);
  } catch (err) {
    console.error(`[/api/admin/${label}] read failed:`, err instanceof Error ? err.message : "unknown");
    return json(500, { error: "Could not read the data. Try again in a minute." });
  }
}
