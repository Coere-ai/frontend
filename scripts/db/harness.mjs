// The small test harness the migration checks share: a PGlite database with
// the Supabase stand ins, a way to act as a role or a signed in person, and
// assertions that count failures instead of stopping at the first one, so
// one run shows everything that is wrong.

import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { SUPABASE_STUBS } from "./supabase-stubs.mjs";

export async function bootDatabase() {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_STUBS);
  return db;
}

let failures = 0;
let passes = 0;

export function failureCount() {
  return failures;
}

export function passCount() {
  return passes;
}

export function check(name, ok, detail = "") {
  if (ok) {
    passes += 1;
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

export function equal(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(name, a === e, `got ${a}, expected ${e}`);
}

// Runs one query and returns its rows. A failure counts and returns null,
// so the checks after it still run.
export async function rows(db, name, sql, params = []) {
  try {
    return (await db.query(sql, params)).rows;
  } catch (error) {
    check(name, false, error.message);
    return null;
  }
}

// Expects the query to be refused with a message matching the pattern.
export async function refused(db, name, sql, pattern, params = []) {
  try {
    await db.query(sql, params);
    check(name, false, "was allowed");
  } catch (error) {
    check(name, pattern.test(error.message), error.message);
  }
}

// Acts as an API role. With a user id it also sets the JWT claims, which is
// how PostgREST tells auth.uid() who is calling. Always resets afterwards.
export async function as(db, role, userId, fn) {
  const claims = userId ? JSON.stringify({ sub: userId, role }) : "";
  await db.query("select set_config('request.jwt.claims', $1, false)", [claims]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claims', '', false)");
  }
}

// The first row's first column, for the many checks that read one number.
export async function one(db, name, sql, params = []) {
  const result = await rows(db, name, sql, params);
  if (!result || result.length === 0) return null;
  return Object.values(result[0])[0];
}
