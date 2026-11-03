/**
 * A per-IP budget for the public beacon.
 *
 * Generous enough for a long read with heartbeats every 15s, tight enough that
 * a script cannot fabricate thousands of views. The map is per server instance
 * and swept opportunistically, so it cannot grow forever.
 */
const WINDOW_MS = 60_000;
const MAX_HITS = 120;
const SWEEP_AT = 10_000;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now >= entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > SWEEP_AT) {
      for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

/** The caller's address as the platform reports it. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
