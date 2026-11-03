import "server-only";

import { supabase } from "@/lib/supabase";

import type { Geo } from "./client";
import type { SectionInput } from "./ingest/validate";

// The write path.
//
// Three calls, one per beacon type. Every one of them is best-effort: the caller
// swallows failures, because a tracking hiccup must never surface to a visitor
// and must never give a client a reason to retry.
//
// Nothing here identifies a person. There are no accounts on this site; the
// visitor id is a random string the browser keeps in localStorage whose only job
// is to tell a returning browser from a new one.

export type ViewInput = {
  sessionId: string;
  visitorId: string;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  device: string;
  browser: string;
  os: string;
  isBot: boolean;
  botName: string | null;
  geo: Geo;
};

/**
 * Record a page view.
 *
 * Upsert on session_id rather than insert: a beacon can be delivered twice (the
 * browser retries, or a bfcache restore re-runs the effect), and the second
 * delivery must not become a second view. `ignoreDuplicates` keeps the first
 * row's timestamps and geography, which are the ones that were true.
 */
export async function recordView(v: ViewInput): Promise<void> {
  const { error } = await supabase()
    .from("site_visits")
    .upsert(
      {
        session_id: v.sessionId,
        visitor_id: v.visitorId,
        path: v.path,
        referrer: v.referrer,
        user_agent: v.userAgent,
        device: v.device,
        browser: v.browser,
        os: v.os,
        is_bot: v.isBot,
        bot_name: v.botName,
        country: v.geo.country,
        region: v.geo.region,
        city: v.geo.city,
        latitude: v.geo.latitude,
        longitude: v.geo.longitude,
      },
      { onConflict: "session_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);
}

/**
 * Fold a heartbeat into the visit it belongs to.
 *
 * Duration and scroll only ever move UP: heartbeats can arrive out of order
 * (the unload beacon races the last interval tick), and taking the max means a
 * late, smaller reading cannot walk a visit's numbers backwards.
 *
 * Done in one statement through an RPC so the read and the write cannot
 * interleave with another beacon for the same session.
 */
export async function recordHeartbeat(h: {
  sessionId: string;
  durationSeconds: number;
  maxScroll: number;
}): Promise<void> {
  const { error } = await supabase().rpc("record_heartbeat", {
    p_session_id: h.sessionId,
    p_duration_seconds: Math.round(h.durationSeconds),
    p_max_scroll: Math.round(h.maxScroll),
  });
  if (error) throw new Error(error.message);
}

/**
 * Fold a batch of section readings into one visit.
 *
 * The whole batch goes in a single statement: a page reports every section it
 * has seen at once, and row-by-row writes would mean a round trip each and a
 * lost update whenever two beacons landed together. Seconds only ever move up,
 * for the same reason heartbeats do. Each entry also carries the section's
 * label and position, which the dashboard uses to name and order it.
 */
export async function recordSections(s: {
  sessionId: string;
  visitorId: string;
  path: string;
  sections: SectionInput[];
}): Promise<void> {
  if (s.sections.length === 0) return;
  const { error } = await supabase().rpc("record_sections", {
    p_session_id: s.sessionId,
    p_visitor_id: s.visitorId,
    p_path: s.path,
    p_sections: s.sections,
  });
  // The function arrives with its migration, which can land after the code.
  // Until then a section beacon is a no-op rather than a logged failure on
  // every page view.
  //
  // The check is on the CODE, not the message: PostgREST reports a missing
  // function as PGRST202 with the wording "Could not find the function ... in
  // the schema cache", which matches no phrase worth grepping for. 42883 is
  // Postgres's own undefined_function, seen when the cache is warm but the
  // function is not there.
  if (error && error.code !== "PGRST202" && error.code !== "42883") {
    throw new Error(`${error.code ?? ""} ${error.message}`.trim());
  }
}

/**
 * Record one interaction, and mark the visit converted when it was a CTA.
 *
 * The conversion lives on the visit rather than being counted from the events
 * table so that "views that converted" stays a property of the view, countable
 * alongside every other per-visit number.
 */
export async function recordEvent(e: {
  sessionId: string;
  visitorId: string;
  path: string;
  kind: "click" | "cta" | "outbound" | "section";
  label: string | null;
  href: string | null;
}): Promise<void> {
  const db = supabase();
  const { error } = await db.from("site_events").insert({
    session_id: e.sessionId,
    visitor_id: e.visitorId,
    path: e.path,
    kind: e.kind,
    label: e.label,
    href: e.href,
  });
  if (error) throw new Error(error.message);

  if (e.kind === "cta") {
    const { error: convError } = await db.rpc("record_conversion", {
      p_session_id: e.sessionId,
    });
    if (convError) throw new Error(convError.message);
  }
}
