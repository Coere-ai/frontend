import "server-only";

import { supabase } from "@/lib/supabase";

import { joinOrgs, type OrgDbRow, type OrgTotalsRow } from "./org-rows";
import { readAll } from "./read-all";
import type { OrgsPayload } from "./types";
import { readPlans } from "./users";

/** Every organization for /admin/organizations, newest first, with its running totals. */
export async function loadOrgs(): Promise<OrgsPayload> {
  const db = supabase();
  const [orgs, totals, plans] = await Promise.all([
    readAll<OrgDbRow>((a, b) => db.from("organizations").select("id, name, slug, plan_id, created_at").order("created_at", { ascending: false }).range(a, b), 20_000),
    readAll<OrgTotalsRow>((a, b) => db.from("org_totals").select("org_id, members, tokens_saved, memories, chats, cost_micros").range(a, b), 20_000),
    readPlans(),
  ]);
  return { rows: joinOrgs(orgs, totals), plans };
}
