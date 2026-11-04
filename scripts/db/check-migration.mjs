// npm run db:check
//
// Proves supabase/migrations/20261103000000_coere.sql runs on a blank
// project, runs again without changing anything, and builds what
// docs/accounts.md asks for. It boots PGlite (Postgres compiled to
// WebAssembly, so no server is needed), adds stand ins for what Supabase
// provides, runs the migration twice, then exercises every function and
// policy. Exits non zero on any failure.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { checkCostReaders, checkDailyColumns, checkDailyKept, checkDailyLocked, checkDailyReserve, checkDailyResolution, checkDailyRows, setDailyValues } from "./checks-daily.mjs";
import { checkCreateOrganization, checkDeviceAuth, checkSignUp } from "./checks-accounts.mjs";
import { checkInterestKept, checkInterestTables } from "./checks-interest.mjs";
import { checkLimitColumns, checkLimitResolution, checkOwnLimitsLocked, checkSameFingerprint, schemaFingerprint } from "./checks-limits.mjs";
import { checkOrganizationRows, checkOwnRows, checkServerWrites, checkStorage } from "./checks-rls.mjs";
import { checkAdminReaders, checkAppEvents, checkInvites, checkMemoryTotals, checkRecordUsage } from "./checks-totals.mjs";
import { bootDatabase, check, equal, failureCount, one, passCount } from "./harness.mjs";

const MIGRATION = fileURLToPath(new URL("../../supabase/migrations/20261103000000_coere.sql", import.meta.url));

async function migrate(db, sql, run) {
  try {
    await db.exec(sql);
    check(`migration run ${run}`, true);
  } catch (error) {
    check(`migration run ${run}`, false, error.message);
    throw error;
  }
}

async function main() {
  const sql = await readFile(MIGRATION, "utf8");
  const db = await bootDatabase();
  await migrate(db, sql, 1);
  const first = await schemaFingerprint(db);
  await migrate(db, sql, 2);
  checkSameFingerprint("a second run changes nothing", first, await schemaFingerprint(db));
  equal("seeds are not doubled", await one(db, "plans", "select count(*)::int from public.plans"), 3);
  equal("the bucket is private", await one(db, "bucket", "select public from storage.buckets where id = 'memory'"), false);

  await checkSignUp(db);
  await checkDeviceAuth(db);
  const org = await checkCreateOrganization(db);
  await checkRecordUsage(db, org);
  await checkLimitColumns(db);
  await checkLimitResolution(db);
  await checkOwnLimitsLocked(db);
  await checkDailyColumns(db);
  await checkDailyRows(db);
  await checkDailyResolution(db);
  await checkDailyReserve(db);
  await checkCostReaders(db);
  await checkDailyLocked(db);
  await checkAppEvents(db, org);
  await checkInvites(db, org);
  await checkMemoryTotals(db, org);
  await checkAdminReaders(db);
  await checkOwnRows(db);
  await checkOrganizationRows(db, org);
  await checkStorage(db);
  await checkServerWrites(db);
  await checkInterestTables(db);

  // A third run over real rows must keep them all.
  await setDailyValues(db);
  const before = await schemaFingerprint(db);
  await migrate(db, sql, 3);
  checkSameFingerprint("a third run over real rows changes nothing", before, await schemaFingerprint(db));
  equal("a rerun keeps the accounts", await one(db, "profiles", "select count(*)::int from public.profiles"), 3);
  await checkInterestKept(db);
  await checkDailyKept(db);

  await db.close();
  const failed = failureCount();
  console.log(`${passCount()} checks passed, ${failed} failed`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(`FAIL ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
