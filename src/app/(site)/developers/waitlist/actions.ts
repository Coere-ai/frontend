"use server";

import { headers } from "next/headers";

import { readWaitlistEmail, WAITLIST_ERRORS, type WaitlistState } from "@/lib/waitlist/form";
import { joinWaitlist } from "@/lib/waitlist/store";

/**
 * The waitlist form's action. It checks the address, counts the try, and
 * stores it. Joining needs no account, so there is no session to check: the
 * limits and the server only table are the whole guard.
 */
export async function joinWaitlistAction(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  const raw = form.get("email");
  const typed = typeof raw === "string" ? raw.slice(0, 320) : "";
  const read = readWaitlistEmail(raw);
  if ("error" in read) return { joined: false, email: typed, error: read.error };

  const result = await joinWaitlist(read.email, await headers());
  if (result === "joined") return { joined: true, email: read.email, error: null };
  return { joined: false, email: typed, error: result === "too_many" ? WAITLIST_ERRORS.tooMany : WAITLIST_ERRORS.unavailable };
}
