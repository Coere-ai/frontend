import "server-only";

import { randomBytes } from "node:crypto";

import { supabase } from "@/lib/supabase";

import { placeholderEmail } from "./identity";
import { usernameTaken } from "./lookup";

/**
 * Makes a Supabase Auth user for a new username and password, with the
 * secret key. `email_confirm: true` marks the placeholder address confirmed
 * at once, so Supabase never sends a confirmation email, whatever the
 * dashboard's Confirm email setting says. The signup trigger then sets the
 * profile's username from `user_metadata` and counts the sign up.
 *
 * The placeholder is `<username>@users.coere.ai`. An account that changed
 * its username keeps its old placeholder, so a new person may pick that old
 * name: the address is then taken while the username is free, and the
 * second try adds a short random suffix. Two people taking one free name at
 * the same moment both pass the form's check; the trigger gives the name to
 * the first, and the second user, left without one, is deleted again and
 * told the name is taken.
 */

export type Created = { ok: true; userId: string; email: string } | { ok: false; reason: "taken" | "weak_password" | "unavailable" };

const EMAIL_TAKEN = new Set(["email_exists", "user_already_exists"]);

/** Takes a username already in stored form (identity.ts) and a password that passed passwordProblem. */
export async function createAccount(username: string, password: string): Promise<Created> {
  const db = supabase();
  for (const suffix of [undefined, randomBytes(3).toString("hex")]) {
    const email = placeholderEmail(username, suffix);
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
    if (error && EMAIL_TAKEN.has(error.code ?? "")) {
      if (await usernameTaken(username)) return { ok: false, reason: "taken" };
      continue;
    }
    if (error?.code === "weak_password") return { ok: false, reason: "weak_password" };
    if (error || !data.user) {
      console.error("auth user not made", error?.code ?? error?.status ?? "");
      return { ok: false, reason: "unavailable" };
    }
    const userId = data.user.id;
    const { data: profile } = await db.from("profiles").select("username").eq("id", userId).maybeSingle();
    if (profile?.username !== username) {
      const removed = await db.auth.admin.deleteUser(userId);
      if (removed.error) console.error("auth user without a username not deleted", removed.error.status ?? "");
      return { ok: false, reason: "taken" };
    }
    return { ok: true, userId, email };
  }
  return { ok: false, reason: "unavailable" };
}
