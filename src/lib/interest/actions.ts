"use server";

import { headers } from "next/headers";

import { INTEREST_ERRORS, readInterest, type InterestState } from "@/lib/interest/form";
import { registerInterest } from "@/lib/interest/store";

/**
 * The I'm interested form's action, shared by /install and /try-teams. It
 * checks the address and the product, counts the try, and stores it. It
 * needs no account, so there is no session to check: the limits and the
 * server only table are the whole guard.
 */
export async function registerInterestAction(_prev: InterestState, form: FormData): Promise<InterestState> {
  const raw = form.get("email");
  const typed = typeof raw === "string" ? raw.slice(0, 320) : "";
  const read = readInterest(raw, form.get("product"));
  if ("error" in read) return { saved: false, email: typed, error: read.error };

  const result = await registerInterest(read.email, read.product, await headers());
  if (result === "saved") return { saved: true, email: read.email, error: null };
  return { saved: false, email: typed, error: result === "too_many" ? INTEREST_ERRORS.tooMany : INTEREST_ERRORS.unavailable };
}
