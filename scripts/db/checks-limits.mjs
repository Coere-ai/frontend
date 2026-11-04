// Checks of the per account limits (docs/accounts.md 8.10, 10, Appendix A):
// the limit columns, how device_auth resolves them, that a person cannot
// raise their own, and a fingerprint of the schema that proves a second run
// of the migration changes nothing. Runs after checkRecordUsage, so A has
// spent 1,500 micro dollars in all.

import { A } from "./checks-accounts.mjs";
import { as, check, equal, one, refused, rows } from "./harness.mjs";

const num = (value) => (value === null || value === undefined ? null : Number(value));

// The columns of Appendix A, in its order. The site reads them by name, but a
// changed order or a missing column would mean the file and the contract drifted.
const DEVICE_AUTH_COLUMNS = [
  "device_id", "user_id", "status", "plan_id",
  "monthly_limit_micros", "lifetime_limit_micros",
  "storage_limit_bytes", "requests_per_minute",
  "month_cost_micros", "lifetime_cost_micros",
  "memory_sync", "include_sensitive", "org_id",
  "daily_limit_micros", "day_cost_micros", "first_build_done",
  "first_build_limit_micros", "first_build_cost_micros",
];

const LIMITS = "select monthly_limit_micros, lifetime_limit_micros, lifetime_cost_micros from public.device_auth('hash_a')";

async function limitsOfA(db, name) {
  let row = null;
  await as(db, "service_role", null, async () => {
    row = (await rows(db, name, LIMITS))?.[0] ?? null;
  });
  return row ? Object.values(row).map(num) : null;
}

export async function checkLimitColumns(db) {
  const columns = await rows(
    db,
    "limit columns",
    `select table_name || '.' || column_name as name, data_type, is_nullable from information_schema.columns
      where table_schema = 'public' and column_name in ('monthly_limit_micros', 'lifetime_limit_micros')
        and table_name in ('profiles', 'plans') order by 1`,
  );
  equal("the limit columns are bigints, nullable where null means another", columns, [
    { name: "plans.lifetime_limit_micros", data_type: "bigint", is_nullable: "YES" },
    { name: "plans.monthly_limit_micros", data_type: "bigint", is_nullable: "NO" },
    { name: "profiles.lifetime_limit_micros", data_type: "bigint", is_nullable: "YES" },
    { name: "profiles.monthly_limit_micros", data_type: "bigint", is_nullable: "YES" },
  ]);
  equal("no seeded plan has a lifetime limit", await one(db, "seed lifetime", "select count(*)::int from public.plans where lifetime_limit_micros is not null"), 0);
  equal("a new profile has no limits of its own", await one(db, "own limits", "select count(*)::int from public.profiles where monthly_limit_micros is not null or lifetime_limit_micros is not null"), 0);
  await refused(db, "a negative monthly limit is refused", "update public.profiles set monthly_limit_micros = -1 where id = $1", /profiles_limits_sane/, [A]);
  await refused(db, "a negative lifetime limit is refused", "update public.profiles set lifetime_limit_micros = -1 where id = $1", /profiles_limits_sane/, [A]);
  await refused(db, "a negative plan lifetime limit is refused", "update public.plans set lifetime_limit_micros = -1 where id = 'free'", /plans_limits_sane/);
}

export async function checkLimitResolution(db) {
  await as(db, "service_role", null, async () => {
    const result = await db.query("select * from public.device_auth('hash_a')");
    equal("device_auth answers the columns of Appendix A", result.fields.map((f) => f.name), DEVICE_AUTH_COLUMNS);
  });
  equal("with nothing set: the plan's month, no lifetime limit, the lifetime spend", await limitsOfA(db, "plain"), [5000000, null, 1500]);
  equal("lifetime_cost_micros is user_totals.cost_micros", (await limitsOfA(db, "spend"))?.[2], num(await one(db, "totals cost", "select cost_micros from public.user_totals where user_id = $1", [A])));

  await db.query("update public.plans set lifetime_limit_micros = 3000000 where id = 'free'");
  equal("a plan's lifetime limit applies when the person has none", await limitsOfA(db, "plan lifetime"), [5000000, 3000000, 1500]);
  await db.query("update public.profiles set monthly_limit_micros = 7000000, lifetime_limit_micros = 9000000 where id = $1", [A]);
  equal("the person's own limits win over the plan's", await limitsOfA(db, "own"), [7000000, 9000000, 1500]);
  await db.query("update public.profiles set monthly_limit_micros = 0, lifetime_limit_micros = 0 where id = $1", [A]);
  equal("a limit of zero is a limit, not the plan's", await limitsOfA(db, "zero"), [0, 0, 1500]);
  await db.query("update public.profiles set monthly_limit_micros = null, lifetime_limit_micros = null where id = $1", [A]);
  await db.query("update public.plans set lifetime_limit_micros = null where id = 'free'");
  equal("clearing them goes back to the plan's", await limitsOfA(db, "cleared"), [5000000, null, 1500]);
}

export async function checkOwnLimitsLocked(db) {
  await as(db, "authenticated", A, async () => {
    // The limits are never shown to the person (section 8.10): the extension gets its own from the server.
    for (const column of ["monthly_limit_micros", "lifetime_limit_micros"]) {
      await refused(db, `a person cannot read their own ${column}`, `select ${column} from public.profiles where id = $1`, /permission denied/, [A]);
      await refused(db, `a person cannot read a plan's ${column}`, `select ${column} from public.plans`, /permission denied/);
    }
    equal("a person still reads their plan's name", await one(db, "plan name", "select name from public.plans where id = 'free'"), "Free");
    equal("and their own profile without the limits", (await rows(db, "own profile", "select id, plan_id, memory_sync from public.profiles where id = $1", [A]))?.length, 1);
    await refused(db, "a person cannot set their monthly limit", "update public.profiles set monthly_limit_micros = 999999999 where id = $1", /permission denied/, [A]);
    await refused(db, "a person cannot set their lifetime limit", "update public.profiles set lifetime_limit_micros = 999999999 where id = $1", /permission denied/, [A]);
    await refused(db, "a person cannot change a plan's limit", "update public.plans set lifetime_limit_micros = 1 where id = 'free'", /permission denied/);
  });
  equal("the limits stayed unset", await one(db, "locked", "select count(*)::int from public.profiles where monthly_limit_micros is not null or lifetime_limit_micros is not null"), 0);
}

// Everything a run of the migration could change: columns, constraints,
// indexes, functions, triggers, policies, grants and the seeded plans. Two
// equal fingerprints around a run prove that run was a no op.
const FINGERPRINT = [
  `select table_schema, table_name, column_name, data_type, is_nullable, column_default
     from information_schema.columns where table_schema in ('public', 'storage') order by 1, 2, 3`,
  `select conrelid::regclass::text as rel, conname, pg_get_constraintdef(oid) as def
     from pg_constraint where connamespace in ('public'::regnamespace, 'storage'::regnamespace) order by 1, 2`,
  `select schemaname, tablename, indexname, indexdef from pg_indexes where schemaname in ('public', 'storage') order by 1, 2, 3`,
  `select p.oid::regprocedure::text as fn, pg_get_functiondef(p.oid) as def, p.proacl::text as acl
     from pg_proc p where p.pronamespace = 'public'::regnamespace order by 1`,
  `select tgrelid::regclass::text as rel, tgname, pg_get_triggerdef(oid) as def from pg_trigger where not tgisinternal order by 1, 2`,
  `select schemaname, tablename, policyname, permissive, roles::text, cmd, qual, with_check from pg_policies order by 1, 2, 3`,
  `select c.oid::regclass::text as rel, c.relacl::text as acl, c.relrowsecurity as rls
     from pg_class c where c.relnamespace in ('public'::regnamespace, 'storage'::regnamespace) and c.relkind in ('r', 'v') order by 1`,
  `select table_name, column_name, grantee, privilege_type from information_schema.column_privileges
     where table_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role') order by 1, 2, 3, 4`,
  `select * from public.plans order by id`,
  `select id, public, file_size_limit, allowed_mime_types::text from storage.buckets order by id`,
];

export async function schemaFingerprint(db) {
  const parts = [];
  for (const sql of FINGERPRINT) parts.push((await db.query(sql)).rows);
  return JSON.stringify(parts);
}

/** Compares the fingerprints and names the first part that moved, so a failure says where to look. */
export function checkSameFingerprint(name, before, after) {
  if (before === after) return check(name, true);
  const a = JSON.parse(before);
  const b = JSON.parse(after);
  const at = a.findIndex((part, i) => JSON.stringify(part) !== JSON.stringify(b[i]));
  check(name, false, `part ${at} changed: ${FINGERPRINT[at].trim().slice(0, 60)}`);
}
