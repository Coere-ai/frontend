import "server-only";

import { readAll } from "@/lib/admin/read-all";
import { supabase } from "@/lib/supabase";

import { userMemoryPath } from "./index-types";
import { getBytes } from "./storage";
import { storedHoldsSensitive } from "./stored-sensitive";
import { deleteMemory } from "./user-memory";

/**
 * The deploy sweep for the sensitive sections rule (build-index.ts). A copy
 * stored before it was checked for facts with a sensitivity only, so its row
 * can say plain while the file holds a Health folder, a fact filed there or
 * a letter kept there. For each account that leaves sensitive memories out,
 * the stored file is read again, and one that breaks the rule goes with its
 * index and organization part, as turning the setting off removes it.
 * Answers counts only, never an account. Run once at deploy with
 * `npx tsx --conditions=react-server scripts/memory/sweep-sensitive.mts`;
 * commit and the setting check the same way afterwards.
 */
export async function sweepSensitiveCopies(): Promise<{ checked: number; removed: number }> {
  const db = supabase();
  const plain = await readAll<{ id: string }>((a, b) =>
    db.from("profiles").select("id").eq("include_sensitive", false).order("id").range(a, b),
  );
  const stored = await readAll<{ user_id: string }>((a, b) =>
    db.from("memory_files").select("user_id").eq("includes_sensitive", false).order("user_id").range(a, b),
  );
  const wanted = new Set(plain.map((p) => p.id));
  let checked = 0;
  let removed = 0;
  for (const { user_id: userId } of stored) {
    if (!wanted.has(userId)) continue;
    checked++;
    const bytes = await getBytes(userMemoryPath(userId));
    if (!storedHoldsSensitive(bytes)) continue;
    const { data } = await db.from("org_members").select("org_id").eq("user_id", userId).maybeSingle<{ org_id: string }>();
    await deleteMemory(userId, data?.org_id ?? null);
    removed++;
  }
  return { checked, removed };
}
