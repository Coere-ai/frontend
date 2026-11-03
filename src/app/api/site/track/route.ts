import { botFromUa } from "@/lib/analytics/bots";
import {
  browserFromUa,
  deviceFromUa,
  geoFromHeaders,
  osFromUa,
} from "@/lib/analytics/client";
import {
  recordEvent,
  recordHeartbeat,
  recordSections,
  recordView,
} from "@/lib/analytics/record";
import { clientIp, rateLimited } from "@/lib/analytics/ingest/rate-limit";
import {
  id,
  isSameOrigin,
  num,
  parseSections,
  safePath,
  safeReferrer,
  text,
} from "@/lib/analytics/ingest/validate";
import { supabaseConfigured } from "@/lib/supabase";

// POST /api/site/track
//
// The public beacon. It runs on every page and records what was read, for how
// long, from where, on what, and what was clicked. Anonymous by design: this
// site has no accounts, and nothing stored here identifies a person.
//
// Hardened like any public write endpoint: capped body, same-origin check,
// strict validation (lib/analytics/ingest/validate.ts), per-IP rate limit.
// Every write is best-effort and the handler ALWAYS returns 204: a tracking
// hiccup must never surface to a visitor, or give a client a reason to retry.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Big enough for a batch of twenty labelled sections, small enough that a
 *  crafted body costs us nothing to read. */
const MAX_BODY_BYTES = 8192;

function noContent(): Response {
  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}

const KINDS = new Set(["click", "cta", "outbound", "section"]);

type Body = {
  type?: unknown;
  sessionId?: unknown;
  visitorId?: unknown;
  path?: unknown;
  referrer?: unknown;
  durationSeconds?: unknown;
  maxScroll?: unknown;
  kind?: unknown;
  label?: unknown;
  href?: unknown;
  sections?: unknown;
};

export async function POST(req: Request): Promise<Response> {
  // Everything below returns 204 regardless, so a probe learns nothing about
  // whether the database is configured, whether it was rate limited, or whether
  // its body parsed.
  if (!isSameOrigin(req)) return noContent();
  if (rateLimited(clientIp(req))) return noContent();
  if (!supabaseConfigured()) return noContent();

  let body: Body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return noContent();
    body = JSON.parse(raw) as Body;
  } catch {
    return noContent();
  }

  const sessionId = id(body.sessionId);
  const visitorId = id(body.visitorId);
  if (!sessionId || !visitorId) return noContent();

  const path = safePath(body.path);
  // The header, not the body: a client can put anything in the body, and this
  // one is set by the transport.
  const userAgent = req.headers.get("user-agent")?.slice(0, 512) ?? null;

  try {
    if (body.type === "view") {
      const bot = botFromUa(userAgent);
      await recordView({
        sessionId,
        visitorId,
        path,
        referrer: safeReferrer(body.referrer),
        userAgent,
        device: deviceFromUa(userAgent),
        browser: browserFromUa(userAgent),
        os: osFromUa(userAgent),
        isBot: bot !== null,
        botName: bot?.name ?? null,
        geo: geoFromHeaders(req.headers),
      });
    } else if (body.type === "heartbeat") {
      await recordHeartbeat({
        sessionId,
        durationSeconds: num(body.durationSeconds, 0, 86_400),
        maxScroll: num(body.maxScroll, 0, 100),
      });
    } else if (body.type === "sections") {
      await recordSections({
        sessionId,
        visitorId,
        path,
        sections: parseSections(body.sections),
      });
    } else if (body.type === "event") {
      // A malformed event is dropped rather than stored as a null-kind row that
      // every read would then have to filter out.
      if (typeof body.kind !== "string" || !KINDS.has(body.kind)) {
        return noContent();
      }
      await recordEvent({
        sessionId,
        visitorId,
        path,
        kind: body.kind as "click" | "cta" | "outbound" | "section",
        label: text(body.label, 120),
        href: text(body.href, 400),
      });
    }
  } catch (err) {
    // Best-effort: never fail the beacon on a write hiccup.
    console.error("[/api/site/track] write failed:", err);
  }

  return noContent();
}
