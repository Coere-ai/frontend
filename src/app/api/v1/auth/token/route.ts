import { ipHash } from "@/lib/security/events";
import { supabaseConfigured } from "@/lib/supabase";
import { readJson } from "@/lib/v1/body";
import { exchangeCode } from "@/lib/v1/exchange";
import { json, problem } from "@/lib/v1/http";
import { TOKEN_TRIES_PER_MINUTE, tokenLimiter } from "@/lib/v1/limiter";
import { parseTokenRequest } from "@/lib/v1/token-request";

// POST /api/v1/auth/token (docs/accounts.md 4, 8.1)
//
// No bearer: the extension trades a connect code and its PKCE verifier for a
// device token. 20 tries a minute per address. Any failure of the trade is
// the same 400 invalid_grant, so a caller cannot tell an unknown code from an
// expired one or a wrong verifier.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  if (!supabaseConfigured()) return problem("unavailable");
  const limit = tokenLimiter.hit(ipHash(req.headers) ?? "unknown", TOKEN_TRIES_PER_MINUTE);
  if (!limit.ok) return problem("rate_limited", limit.retryAfterSeconds);

  const body = await readJson(req, 4096);
  const request = body.ok ? parseTokenRequest(body.value) : null;
  if (!request) return problem("invalid_grant");
  try {
    const exchanged = await exchangeCode(request, req.headers);
    return exchanged ? json(exchanged) : problem("invalid_grant");
  } catch {
    return problem("invalid_grant");
  }
}
