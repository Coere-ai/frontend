import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ACCESS_COOKIE } from "./constants";
import { validPassExpiry } from "./pass";

/** When the current visitor's pass ends, or null when they have none. */
export async function currentPassExpiry(): Promise<number | null> {
  const store = await cookies();
  return validPassExpiry(store.get(ACCESS_COOKIE)?.value);
}

/**
 * Renders a 404 unless the visitor holds a valid pass. The proxy already
 * keeps strangers out; this second check means a mistake there can never
 * leak a page, and reading cookies keeps every private page out of caches.
 */
export async function requirePass(): Promise<void> {
  if ((await currentPassExpiry()) === null) notFound();
}

/** Whole minutes left on the visitor's pass, at least one, or null without a pass. */
export async function passMinutesLeft(): Promise<number | null> {
  const expiry = await currentPassExpiry();
  if (expiry === null) return null;
  return Math.max(1, Math.round((expiry - Date.now()) / 60_000));
}
