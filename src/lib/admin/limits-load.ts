import "server-only";

import { supabase } from "@/lib/supabase";

import { LIMIT_COLUMNS, LIMIT_KINDS, type LimitKind } from "./limit-input";
import type { LimitsPayload } from "./types";
import { readPlans } from "./users";

/**
 * /admin/limits: each plan's four spend limits, which apply to every account
 * on it without its own, how many accounts have their own value for each,
 * and how many have used their free first build. Counts only, read with
 * head requests, so no account row leaves the database.
 */
export async function loadLimits(): Promise<LimitsPayload> {
  const db = supabase();
  const count = async (build: (q: ReturnType<typeof head>) => ReturnType<typeof head>) => {
    const { count: n, error } = await build(head());
    if (error) throw new Error(`profiles count failed: ${error.code}`);
    return n ?? 0;
  };
  const head = () => db.from("profiles").select("id", { count: "exact", head: true });

  const [plans, accounts, firstBuilds, ...own] = await Promise.all([
    readPlans(),
    count((q) => q),
    count((q) => q.not("first_build_at", "is", null)),
    ...LIMIT_KINDS.map((kind) => count((q) => q.not(LIMIT_COLUMNS[kind], "is", null))),
  ]);
  const overrides = Object.fromEntries(LIMIT_KINDS.map((kind, i) => [kind, own[i] ?? 0])) as Record<LimitKind, number>;
  return { plans, accounts, firstBuildsUsed: firstBuilds, overrides };
}
