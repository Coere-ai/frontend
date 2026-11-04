// Checks of the account functions: the sign up trigger, device_auth and
// creating an organization. Each runs as service_role, the server's role, so
// a missing grant fails here the way it would in production.

import { as, check, equal, one, refused, rows } from "./harness.mjs";

export const A = "00000000-0000-4000-8000-00000000000a";
export const B = "00000000-0000-4000-8000-00000000000b";
export const C = "00000000-0000-4000-8000-00000000000c";

export async function checkSignUp(db) {
  // B is confirmed at once (the operator made it); A and C sign up unconfirmed, as by code or form.
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
       ($1, 'Alice@Example.com', '{"username":"Alice_1"}', null),
       ($2, 'b@example.com', '{"username":"bob_1"}', now()),
       ($3, 'c@example.com', '{"username":"x"}', null)`,
    [A, B, C],
  );
  const before = await rows(db, "profiles made", "select id, email, username, plan_id, status from public.profiles order by id");
  equal("signup makes a profile each", before?.length, 3);
  equal("an unconfirmed signup holds no username", before?.[0]?.username, null);
  equal("a signup confirmed at once takes its username", before?.[1]?.username, "bob_1");
  equal("signup makes user_totals rows", await one(db, "user_totals", "select count(*)::int from public.user_totals"), 3);
  equal("only a confirmed signup counts in new_users", await one(db, "daily new_users", "select new_users from public.daily_totals"), 1);

  await db.query("update auth.users set email_confirmed_at = now() where id = any($1)", [[A, C]]);
  const profiles = await rows(db, "profiles confirmed", "select id, email, username, plan_id, status from public.profiles order by id");
  equal("confirming takes the lowercase email and username", profiles?.[0], {
    id: A, email: "alice@example.com", username: "alice_1", plan_id: "free", status: "active",
  });
  equal("a malformed username is dropped", profiles?.[2]?.username, null);
  equal("confirming counts new_users today", await one(db, "daily new_users", "select new_users from public.daily_totals"), 3);
  await db.query("update auth.users set email_confirmed_at = now() where id = $1", [A]);
  equal("a second confirmation counts nothing", await one(db, "daily new_users", "select new_users from public.daily_totals"), 3);

  // A username already taken when the address is confirmed is dropped, not an error.
  const D = "00000000-0000-4000-8000-00000000000d";
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'd@example.com', '{"username":"alice_1"}')`, [D]);
  await db.query("update auth.users set email_confirmed_at = now() where id = $1", [D]);
  equal("a taken username is dropped", await one(db, "taken", "select username from public.profiles where id = $1", [D]), null);
  await db.query("delete from auth.users where id = $1", [D]);
  await db.query("update public.daily_totals set new_users = new_users - 1");

  await db.query("update auth.users set email = 'Alice2@Example.com' where id = $1", [A]);
  equal("an email change reaches the profile", await one(db, "email sync", "select email from public.profiles where id = $1", [A]), "alice2@example.com");
}

export async function checkDeviceAuth(db) {
  await db.query(
    `insert into public.devices (user_id, name, token_hash, token_hint) values
       ($1, 'Chrome', 'hash_a', 'aaaa'), ($2, 'Chrome', 'hash_b', 'bbbb')`,
    [A, B],
  );
  await db.query(
    `insert into public.devices (user_id, name, token_hash, token_hint, revoked_at, revoked_reason)
     values ($1, 'Old', 'hash_revoked', 'rrrr', now(), 'user')`,
    [A],
  );

  await as(db, "service_role", null, async () => {
    const live = await rows(db, "device_auth live", "select * from public.device_auth('hash_a')");
    equal("a live token answers one row", live?.length, 1);
    const row = live?.[0] ?? {};
    equal("device_auth names the account", row.user_id, A);
    equal("device_auth carries the plan", [row.plan_id, Number(row.monthly_limit_micros), row.requests_per_minute], ["free", 5000000, 60]);
    equal("device_auth starts the month at zero", Number(row.month_cost_micros), 0);
    equal("device_auth has no org yet", row.org_id, null);
    equal("a revoked token answers nothing", (await rows(db, "revoked", "select * from public.device_auth('hash_revoked')"))?.length, 0);
    equal("an unknown token answers nothing", (await rows(db, "unknown", "select * from public.device_auth('nope')"))?.length, 0);
  });

  check("device_auth touches last_used_at", await one(db, "touched", "select last_used_at is not null from public.devices where token_hash = 'hash_a'"));
  check("device_auth touches last_seen_at", await one(db, "seen", "select last_seen_at is not null from public.profiles where id = $1", [A]));

  // A use within 5 minutes leaves the row alone; an older one moves it.
  await db.query("update public.devices set last_used_at = now() - interval '1 minute' where token_hash = 'hash_a'");
  await as(db, "service_role", null, () => db.query("select * from public.device_auth('hash_a')"));
  check("a recent use is not touched again", await one(db, "recent", "select last_used_at < now() - interval '30 seconds' from public.devices where token_hash = 'hash_a'"));
  await db.query("update public.devices set last_used_at = now() - interval '10 minutes' where token_hash = 'hash_a'");
  await as(db, "service_role", null, () => db.query("select * from public.device_auth('hash_a')"));
  check("an old use is touched", await one(db, "old", "select last_used_at > now() - interval '1 minute' from public.devices where token_hash = 'hash_a'"));
}

export async function checkCreateOrganization(db) {
  let org = null;
  await as(db, "service_role", null, async () => {
    org = await one(db, "create_organization", "select public.create_organization('  Acme  ', 'Acme', $1, null)", [A]);
    check("create_organization returns an id", typeof org === "string");
    await refused(db, "a second organization for the admin is refused", "select public.create_organization('Other', 'other', $1, 'team')", /already_in_org/, [A]);
    await refused(db, "a slug in use is refused", "select public.create_organization('Acme two', 'acme', $1, 'team')", /organizations_slug_key/, [B]);
  });
  equal("the organization is trimmed, slugged and on team", (await rows(db, "org row", "select name, slug, plan_id, default_access from public.organizations"))?.[0], {
    name: "Acme", slug: "acme", plan_id: "team", default_access: { read: "all", contribute: true },
  });
  equal("the first person is an admin added by the operator", (await rows(db, "admin", "select role, added_by, access from public.org_members where user_id = $1", [A]))?.[0], {
    role: "admin", added_by: "operator", access: null,
  });
  equal("org_totals starts with one member", await one(db, "members", "select members from public.org_totals where org_id = $1", [org]), 1);
  equal("new_orgs counts today", await one(db, "new_orgs", "select new_orgs from public.daily_totals"), 1);
  equal("B is in no organization after the refusal", await one(db, "B free", "select count(*)::int from public.org_members where user_id = $1", [B]), 0);
  await refused(db, "an owner role is refused", "update public.org_members set role = 'owner' where user_id = $1", /org_members_role_known/, [A]);
  await refused(db, "a malformed access is refused", `update public.org_members set access = '{"read": "some"}' where user_id = $1`, /org_members_access_shape/, [A]);
  await rows(db, "a section list access is allowed", `update public.org_members set access = '{"read": ["work"], "contribute": false}' where user_id = $1`, [A]);
  await db.query("update public.org_members set access = null where user_id = $1", [A]);
  // org_drop_member keeps one admin. Rolled back, so A stays the only admin for the checks after.
  await db.exec("begin");
  await as(db, "service_role", null, async () => {
    const drop = (user, action) => one(db, `drop ${action}`, "select public.org_drop_member($1, $2, $3)", [org, user, action]);
    equal("the only admin cannot be demoted", await drop(A, "demote"), "last_admin");
    equal("the only admin cannot leave", await drop(A, "remove"), "last_admin");
    equal("someone outside answers not_member", await drop(B, "remove"), "not_member");
  });
  await db.query("insert into public.org_members (org_id, user_id, role) values ($1, $2, 'admin')", [org, B]);
  await as(db, "service_role", null, async () => {
    equal("with two admins one may be demoted", await one(db, "demote B", "select public.org_drop_member($1, $2, 'demote')", [org, B]), "ok");
    equal("then the last one still cannot", await one(db, "demote A", "select public.org_drop_member($1, $2, 'demote')", [org, A]), "last_admin");
    equal("a member may leave", await one(db, "remove B", "select public.org_drop_member($1, $2, 'remove')", [org, B]), "ok");
  });
  equal("one admin is left", await one(db, "admins", "select count(*)::int from public.org_members where org_id = $1 and role = 'admin'", [org]), 1);
  await db.exec("rollback");
  await as(db, "service_role", null, async () => {
    equal("device_auth now names the org", (await rows(db, "org via auth", "select org_id from public.device_auth('hash_a')"))?.[0]?.org_id, org);
  });
  return org;
}
