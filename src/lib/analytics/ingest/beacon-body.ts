import { readJson } from "@/lib/v1/body";

/**
 * The beacon's body as JSON, or null when it is too large, malformed or
 * empty. The declared length is checked first and the bytes are counted as
 * they arrive (readJson), so a forged body of megabytes stops at the cap
 * instead of being buffered whole before it is refused.
 */
export async function readBeaconBody(req: Request, cap: number): Promise<unknown> {
  const read = await readJson(req, cap);
  return read.ok ? read.value : null;
}
