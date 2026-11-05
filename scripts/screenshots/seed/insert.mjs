// Bulk inserts for the seed: rows as plain objects, typed by Postgres from
// the table's own record type, in chunks PGlite takes easily.

export async function insertRows(db, table, rows, { returning = "" } = {}) {
  const out = [];
  for (let i = 0; i < rows.length; i += 400) {
    const chunk = rows.slice(i, i + 400);
    const cols = [...new Set(chunk.flatMap((r) => Object.keys(r)))].map((c) => `"${c}"`).join(", ");
    const sql = `insert into ${table} (${cols}) select ${cols} from json_populate_recordset(null::${table}, $1::json)${returning ? ` returning ${returning}` : ""}`;
    const res = await db.query(sql, [JSON.stringify(chunk)]);
    out.push(...res.rows);
  }
  return out;
}

const DAY = 86_400_000;

/** The UTC day `n` days before `now`, as YYYY-MM-DD. */
export const dayOf = (now, n) => new Date(now - n * DAY).toISOString().slice(0, 10);

/** A moment `n` days (and a random part of that day) before `now`, as ISO. */
export const momentOf = (now, n, r) => new Date(now - n * DAY - Math.floor((r ? r.next() : 0.5) * DAY * 0.9)).toISOString();
