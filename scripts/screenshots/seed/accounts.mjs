// Seeds the accounts side of the database: people, their plans and
// devices, the organizations with members and an invite, and who signed in
// when. Usage and the running totals are in usage.mjs.

import { createHash, randomBytes } from "node:crypto";
import { dayOf, insertRows, momentOf } from "./insert.mjs";
import { accounts, FERNHILL, MAYA, OTHER_ORGS, random } from "./people.mjs";

const BROWSERS = ["Chrome on macOS", "Chrome on Windows", "Chrome on Linux", "Chrome on ChromeOS"];
const COUNTRIES = ["US", "US", "US", "GB", "CA", "DE", "IN", "AU", "FR", "NL", "BR", "JP", "SE", "ES"];

/** Seeds people, organizations, devices and security events. Answers what usage.mjs needs. */
export async function seedAccounts(db, passwords, now) {
  const r = random(0xacc0);
  const people = accounts();

  const users = await insertRows(
    db,
    "auth.users",
    people.map((p) => ({
      email: p.email,
      raw_user_meta_data: { username: p.username },
      email_confirmed_at: momentOf(now, p.createdDaysAgo, { next: () => p.at }),
      created_at: momentOf(now, p.createdDaysAgo, { next: () => p.at }),
    })),
    { returning: "id, email" },
  );
  const idOf = new Map(users.map((u) => [u.email, u.id]));
  people.forEach((p) => (p.id = idOf.get(p.email)));
  passwords.set(MAYA.email, MAYA.password);

  // Profiles: names, plans, when they were last seen and whether their first build ran.
  for (const p of people) {
    p.built = p.active && (p.org !== null || r.chance(0.7));
    p.firstBuildDaysAgo = p.built ? Math.max(0, p.createdDaysAgo - r.int(0, 3)) : null;
  }
  await db.query(
    `update public.profiles p set display_name = x.display_name, plan_id = x.plan_id, created_at = x.created_at, updated_at = x.created_at,
       last_seen_at = x.last_seen_at, first_build_at = x.first_build_at, status = x.status, monthly_limit_micros = x.monthly_limit_micros
     from json_to_recordset($1::json) as x(id uuid, display_name text, plan_id text, created_at timestamptz, last_seen_at timestamptz,
       first_build_at timestamptz, status text, monthly_limit_micros bigint)
     where p.id = x.id`,
    [
      JSON.stringify(
        people.map((p, i) => ({
          id: p.id,
          display_name: `${p.first} ${p.last}`,
          plan_id: p.plan,
          created_at: momentOf(now, p.createdDaysAgo, { next: () => p.at }),
          // Each last visit at its own time: an active account within the week, a quiet one soon after it signed up.
          last_seen_at: p.active ? momentOf(now, Math.min(p.createdDaysAgo, r.int(0, 6)), r) : momentOf(now, Math.max(0, p.createdDaysAgo - r.int(0, 2)), { next: () => Math.min(p.at, r.next()) }),
          first_build_at: p.firstBuildDaysAgo === null ? null : momentOf(now, p.firstBuildDaysAgo, null),
          // Two accounts the operator has set apart: one suspended, one with its own monthly limit.
          status: i === 40 ? "suspended" : "active",
          monthly_limit_micros: i === 25 ? 15_000_000 : null,
        })),
      ),
    ],
  );
  // Maya's first build is still ahead of her: the dashboard imports her memory file.
  await db.query("update public.profiles set first_build_at = null where id = $1", [idOf.get(MAYA.email)]);

  // Organizations, each with its members and, for Fernhill, a pending invite.
  const orgSpecs = [[FERNHILL.name, FERNHILL.slug, 54], ...OTHER_ORGS.map(([name, slug]) => [name, slug, r.int(20, 50)])];
  const orgs = await insertRows(
    db,
    "public.organizations",
    orgSpecs.map(([name, slug, days]) => ({ name, slug, plan_id: "team", created_at: momentOf(now, days, null), updated_at: momentOf(now, days, null) })),
    { returning: "id, slug, created_at" },
  );
  const orgId = new Map(orgs.map((o) => [o.slug, o.id]));
  await insertRows(
    db,
    "public.org_members",
    people.filter((p) => p.org).map((p) => ({ org_id: orgId.get(p.org), user_id: p.id, role: p.role, added_by: p.role === "admin" ? "operator" : "invite", joined_at: momentOf(now, p.createdDaysAgo, null) })),
  );
  await insertRows(db, "public.org_memory", orgs.map((o) => ({ org_id: o.id })));
  const nina = people.find((p) => p.username === FERNHILL.invited[0][2]);
  await insertRows(db, "public.org_invites", [{ org_id: orgId.get(FERNHILL.slug), user_id: nina.id, role: "member", invited_by: idOf.get(MAYA.email), created_at: momentOf(now, 2, null), expires_at: new Date(now + 5 * 86_400_000).toISOString() }]);

  // Browsers connected to each active account. Maya's comes from the run itself, through /connect.
  const devices = [];
  for (const p of people) {
    if (!p.active || p.email === MAYA.email) continue;
    const n = r.chance(0.25) ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const token = randomBytes(24).toString("base64url");
      const created = Math.max(0, p.createdDaysAgo - k * r.int(1, 8));
      devices.push({
        user_id: p.id,
        name: k === 0 ? r.pick(BROWSERS) : r.pick(BROWSERS),
        token_hash: createHash("sha256").update(token).digest("hex"),
        token_hint: token.slice(-4),
        extension_id: "kfpnhnhmcmhdhlbkdmlnoeiogdgnfoap",
        extension_version: r.pick(["4.0.2", "4.0.3", "4.1.0"]),
        created_at: momentOf(now, created, null),
        last_used_at: momentOf(now, Math.min(created, r.int(0, 4)), r),
        ...(r.chance(0.06) ? { revoked_at: momentOf(now, r.int(0, created), r), revoked_reason: r.pick(["signed_out", "user"]) } : {}),
      });
    }
  }
  const madeDevices = await insertRows(db, "public.devices", devices, { returning: "id, user_id" });

  // A month of the security log: sign ins, codes, new browsers, and the odd refusal.
  const events = [];
  const ipHash = () => createHash("sha256").update(String(r.next())).digest("hex").slice(0, 32);
  for (const p of people) {
    events.push({ user_id: p.id, kind: "sign_up", country: r.pick(COUNTRIES), created_at: momentOf(now, p.createdDaysAgo, null) });
    if (!p.active) continue;
    for (let d = Math.min(p.createdDaysAgo, 29); d >= 0; d--) {
      if (!r.chance(0.18)) continue;
      events.push({ user_id: p.id, kind: "code_sent", country: r.pick(COUNTRIES), created_at: momentOf(now, d, r), ip_hash: ipHash() });
      events.push({ user_id: p.id, kind: "sign_in", country: r.pick(COUNTRIES), created_at: momentOf(now, d, r), ip_hash: ipHash() });
      if (r.chance(0.08)) events.push({ user_id: p.id, kind: "sign_in_failed", country: r.pick(COUNTRIES), created_at: momentOf(now, d, r), ip_hash: ipHash() });
    }
  }
  for (const dev of madeDevices) events.push({ user_id: dev.user_id, kind: "device_connected", country: r.pick(COUNTRIES), created_at: momentOf(now, r.int(0, 29), r) });
  for (let d = 0; d < 30; d++) {
    for (let k = r.int(0, 3); k > 0; k--) events.push({ kind: "token_rejected", country: r.pick(COUNTRIES), created_at: momentOf(now, d, r), ip_hash: ipHash() });
    if (r.chance(0.3)) events.push({ kind: "rate_limited", country: r.pick(COUNTRIES), created_at: momentOf(now, d, r), ip_hash: ipHash() });
    if (r.chance(0.5)) events.push({ kind: "admin_sign_in", country: "US", created_at: momentOf(now, d, r), ip_hash: ipHash() });
  }
  for (const p of people.filter((x) => x.org && x.role === "member")) events.push({ user_id: p.id, org_id: orgId.get(p.org), kind: "org_joined", country: "US", created_at: momentOf(now, Math.min(29, p.createdDaysAgo), null) });
  events.push({ user_id: idOf.get(MAYA.email), org_id: orgId.get(FERNHILL.slug), kind: "org_invite_sent", country: "US", created_at: momentOf(now, 2, null) });
  for (const o of orgs) events.push({ org_id: o.id, kind: "org_created", country: "US", created_at: new Date(o.created_at).toISOString() });
  await insertRows(db, "public.security_events", events.filter((e) => Date.parse(e.created_at) > now - 90 * 86_400_000));

  return { people, orgId, orgs, devices: madeDevices, dayOf: (n) => dayOf(now, n) };
}
