import { createAttemptLimiter } from "@/lib/auth/attempts";

/**
 * A per-IP budget for the public beacon.
 *
 * Generous enough for a long read with heartbeats every 15s, tight enough that
 * a script cannot fabricate thousands of views. The map is per server instance
 * and swept once it doubles (lib/auth/attempts.ts), so it cannot grow forever
 * and a flood of addresses does not walk it on every request.
 */
const beacons = createAttemptLimiter({ max: 120, windowMs: 60_000 });

export function rateLimited(ip: string): boolean {
  return beacons.hit(ip);
}

/** The caller's address as the platform reports it. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
