// Checks of the two small server only tables behind the coming soon pages
// (docs/accounts.md 10 and 16): product_interest, who said I'm interested in
// Coere Connect or Coere for Teams, and site_settings, which holds the
// launch countdowns the operator sets in /admin/launch.

import { A } from "./checks-accounts.mjs";
import { as, equal, one, refused, rows } from "./harness.mjs";

const DENIED = /permission denied/;
const INSERT = "insert into public.product_interest (email, product, source) values ($1, $2, 'install') on conflict (email, product) do nothing";

export async function checkInterestTables(db) {
  equal(
    "product_interest exists with its columns",
    (await rows(db, "interest columns", "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'product_interest' order by ordinal_position"))?.map((r) => r.column_name),
    ["id", "email", "product", "source", "ip_hash", "created_at"],
  );
  equal(
    "site_settings exists with its columns",
    (await rows(db, "settings columns", "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' order by ordinal_position"))?.map((r) => r.column_name),
    ["key", "value", "updated_at"],
  );
  equal(
    "both have Row Level Security on and no policy",
    await rows(
      db,
      "interest rls",
      `select c.relname as name, c.relrowsecurity as rls, (select count(*)::int from pg_policy p where p.polrelid = c.oid) as policies
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname in ('product_interest', 'site_settings') order by 1`,
    ),
    [
      { name: "product_interest", rls: true, policies: 0 },
      { name: "site_settings", rls: true, policies: 0 },
    ],
  );
  equal(
    "both launch moments are seeded",
    await rows(db, "launch seeds", "select key, value from public.site_settings where key like 'launch.%' order by key"),
    [
      { key: "launch.connect", value: { at: "2026-11-23T17:00:00.000Z", show: true } },
      { key: "launch.teams", value: { at: "2026-11-23T17:00:00.000Z", show: true } },
    ],
  );

  await as(db, "service_role", null, async () => {
    await rows(db, "interest insert", INSERT, ["fan@example.com", "connect"]);
    await rows(db, "interest repeat", INSERT, ["fan@example.com", "connect"]);
    await rows(db, "interest in the other product", INSERT, ["fan@example.com", "teams"]);
    equal("one row per address and product", await one(db, "interest count", "select count(*)::int from public.product_interest"), 2);
    await refused(db, "a second row for the same address and product is refused", "insert into public.product_interest (email, product) values ('fan@example.com', 'connect')", /product_interest_email_product_key/);
    await refused(db, "an unknown product is refused", INSERT, /product_interest_product_known/, ["fan@example.com", "forge"]);
    await refused(db, "an uppercase interest email is refused", INSERT, /product_interest_email_lower/, ["Fan@Example.com", "connect"]);
    await refused(db, "a malformed interest email is refused", INSERT, /product_interest_email_format/, ["fan@example", "connect"]);
    await refused(db, "an interest email with a space is refused", INSERT, /product_interest_email_format/, ["f an@example.com", "connect"]);

    await rows(db, "settings save", "update public.site_settings set value = $1::jsonb, updated_at = now() where key = 'launch.teams'", [JSON.stringify({ at: "2026-12-01T09:00:00.000Z", show: false })]);
    equal("the server saves a launch moment", await one(db, "settings read", "select value ->> 'at' from public.site_settings where key = 'launch.teams'"), "2026-12-01T09:00:00.000Z");
    await refused(db, "a settings value must be an object", "insert into public.site_settings (key, value) values ('x', '1')", /site_settings_value_object/);
    await refused(db, "a settings key must be plain", "insert into public.site_settings (key, value) values ('Bad Key', '{}')", /site_settings_key_sane/);
  });

  for (const [role, user] of [["anon", null], ["authenticated", A]]) {
    await as(db, role, user, async () => {
      for (const table of ["product_interest", "site_settings"]) {
        await refused(db, `${role} cannot read ${table}`, `select count(*) from public.${table}`, DENIED);
      }
      await refused(db, `${role} cannot add interest`, INSERT, DENIED, ["sneak@example.com", "connect"]);
      await refused(db, `${role} cannot delete interest`, "delete from public.product_interest", DENIED);
      await refused(db, `${role} cannot change a launch moment`, "update public.site_settings set value = '{}'", DENIED);
      await refused(db, `${role} cannot add a setting`, "insert into public.site_settings (key, value) values ('launch.x', '{}')", DENIED);
    });
  }
  equal("nothing a visitor tried was stored", await one(db, "interest after", "select count(*)::int from public.product_interest where email = 'sneak@example.com'"), 0);
}

// After the third run: the operator's moment and the interest rows are kept.
export async function checkInterestKept(db) {
  equal("a rerun keeps the interest rows", await one(db, "interest kept", "select count(*)::int from public.product_interest"), 2);
  equal("a rerun keeps the operator's launch moment", await one(db, "moment kept", "select value from public.site_settings where key = 'launch.teams'"), { at: "2026-12-01T09:00:00.000Z", show: false });
  equal("a rerun adds no setting", await one(db, "settings kept", "select count(*)::int from public.site_settings"), 2);
}
