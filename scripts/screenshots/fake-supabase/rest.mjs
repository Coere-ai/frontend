// The PostgREST half of the fake Supabase: /rest/v1/<table> and
// /rest/v1/rpc/<fn> over the real migration in PGlite. Postgres itself
// writes every answer with json_agg, as PostgREST does, so numbers, times
// and JSON columns come back in the shapes the site already reads. Each
// request runs in its own transaction as the role its key or session gives
// it, so Row Level Security decides what a signed in person sees.

import { ident, orderSql, parseSelect, whereSql } from "./rest-parse.mjs";

/** The foreign keys between public tables, read once: [{ from, fromCols, to, toCols }]. */
async function readForeignKeys(db) {
  const { rows } = await db.query(`
    select c.conname, cl.relname as "from", fl.relname as "to",
      (select array_agg(a.attname order by k.n) from unnest(c.conkey) with ordinality k(attnum, n)
         join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum) as "fromCols",
      (select array_agg(a.attname order by k.n) from unnest(c.confkey) with ordinality k(attnum, n)
         join pg_attribute a on a.attrelid = c.confrelid and a.attnum = k.attnum) as "toCols"
    from pg_constraint c
    join pg_class cl on cl.oid = c.conrelid join pg_namespace n on n.oid = cl.relnamespace
    join pg_class fl on fl.oid = c.confrelid
    where c.contype = 'f' and n.nspname = 'public'`);
  return rows;
}

/** The select list as SQL over `t0`, a row of `table`. */
function columnsSql(items, table, fks, depth = 0) {
  const out = [];
  for (const item of items) {
    if (item.kind === "star") out.push(`t${depth}.*`);
    else if (item.kind === "col") out.push(`t${depth}.${ident(item.name)}${item.cast ? `::${item.cast}` : ""} as ${ident(item.alias)}`);
    else out.push(`${embedSql(item, table, fks, depth)} as ${ident(item.alias)}`);
  }
  return out.join(", ");
}

/** One embedded table: an object for a key this row holds, an array for rows that point here. */
function embedSql(item, table, fks, depth) {
  const inner = `t${depth + 1}`;
  const cols = columnsSql(item.items, item.table, fks, depth + 1);
  const toOne = fks.find((k) => k.from === table && k.to === item.table && (!item.hint || k.conname === item.hint));
  if (toOne) {
    const on = toOne.fromCols.map((c, i) => `${inner}.${ident(toOne.toCols[i])} = t${depth}.${ident(c)}`).join(" AND ");
    return `(select row_to_json(e) from (select ${cols} from public.${ident(item.table)} ${inner} where ${on}) e)`;
  }
  const toMany = fks.find((k) => k.from === item.table && k.to === table && (!item.hint || k.conname === item.hint));
  if (!toMany) throw Object.assign(new Error(`no relationship between ${table} and ${item.table}`), { code: "PGRST200" });
  const on = toMany.fromCols.map((c, i) => `${inner}.${ident(c)} = t${depth}.${ident(toMany.toCols[i])}`).join(" AND ");
  return `(select coalesce(json_agg(e), '[]'::json) from (select ${cols} from public.${ident(item.table)} ${inner} where ${on}) e)`;
}

/** The status PostgREST answers for a Postgres error code. */
function statusFor(code, role) {
  if (code === "23505" || code === "23503") return 409;
  if (code === "42501") return role === "anon" ? 401 : 403;
  if (code === "PGRST116") return 406;
  if (code === "42P01" || code === "42883") return 404;
  return 400;
}

/** Turns any error into PostgREST's body and status. */
export function restError(error, role) {
  const code = error.code ?? "PGRST000";
  return { status: statusFor(code, role), body: { code, message: error.message, details: error.detail ?? null, hint: error.hint ?? null } };
}

/** Runs `fn` in a transaction as `role`, with the JWT claims PostgREST would set. */
async function asRole(db, who, fn) {
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claims', $1, true)", [who.claims ? JSON.stringify(who.claims) : ""]);
    await tx.exec(`set local role ${who.role}`);
    return fn(tx);
  });
}

/** The Prefer header as a map. */
function prefer(headers) {
  const out = {};
  for (const part of String(headers.prefer ?? "").split(",")) {
    const [k, v] = part.trim().split("=");
    if (k) out[k] = v ?? true;
  }
  return out;
}

export async function createRest(db) {
  const fks = await readForeignKeys(db);
  const procs = new Map();

  async function procInfo(name) {
    if (procs.has(name)) return procs.get(name);
    const { rows } = await db.query(
      `select p.proretset as set, t.typtype as kind, t.typname as type
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace join pg_type t on t.oid = p.prorettype
       where n.nspname = 'public' and p.proname = $1 limit 1`,
      [name],
    );
    procs.set(name, rows[0] ?? null);
    return rows[0] ?? null;
  }

  /** A table request: GET, HEAD, POST, PATCH or DELETE. */
  async function table(method, name, url, headers, body, who) {
    const search = [...url.searchParams];
    const params = [];
    const prefs = prefer(headers);
    const items = parseSelect(url.searchParams.get("select") ?? "*");
    const single = String(headers.accept ?? "").includes("vnd.pgrst.object");
    const t = `public.${ident(name)}`;
    let source;
    let returning = true;
    if (method === "GET" || method === "HEAD") {
      source = null;
    } else if (method === "POST") {
      const rows = Array.isArray(body) ? body : [body];
      const keys = url.searchParams.get("columns")?.split(",") ?? [...new Set(rows.flatMap((r) => Object.keys(r)))];
      params.push(JSON.stringify(rows));
      const cols = keys.map(ident).join(", ");
      let conflict = "";
      if (prefs.resolution) {
        const target = url.searchParams.get("on_conflict")?.split(",") ?? (await primaryKey(db, name));
        const set = keys.filter((k) => !target.includes(k)).map((k) => `${ident(k)} = excluded.${ident(k)}`);
        conflict = prefs.resolution === "ignore-duplicates" || set.length === 0
          ? ` on conflict (${target.map(ident).join(", ")}) do nothing`
          : ` on conflict (${target.map(ident).join(", ")}) do update set ${set.join(", ")}`;
      }
      source = `insert into ${t} (${cols}) select ${cols} from json_populate_recordset(null::${t}, $1::json)${conflict} returning *`;
      returning = prefs.return === "representation";
    } else if (method === "PATCH") {
      params.push(JSON.stringify(body));
      const set = Object.keys(body).map((k) => `${ident(k)} = r.${ident(k)}`).join(", ");
      const where = whereSql(search, params);
      source = `update ${t} as t0 set ${set} from (select * from json_populate_record(null::${t}, $1::json)) r where ${where} returning t0.*`;
      returning = prefs.return === "representation";
    } else if (method === "DELETE") {
      const where = whereSql(search, params);
      source = `delete from ${t} as t0 where ${where} returning t0.*`;
      returning = prefs.return === "representation";
    } else {
      return { status: 405, body: { message: "method not allowed" } };
    }

    return asRole(db, who, async (tx) => {
      let from;
      let where = "TRUE";
      if (source) from = `(select * from changed) t0`;
      else {
        from = `${t} t0`;
        where = whereSql(search, params);
      }
      const order = url.searchParams.get("order");
      const limit = url.searchParams.get("limit");
      const offset = url.searchParams.get("offset");
      const tail = `${order ? ` order by ${orderSql(order)}` : ""}${limit ? ` limit ${Number(limit)}` : ""}${offset ? ` offset ${Number(offset)}` : ""}`;
      const head = source ? `with changed as (${source}) ` : "";
      const sql = `${head}select coalesce(json_agg(x), '[]'::json) as rows, (select count(*) from ${from} where ${where})::int as total from (select ${columnsSql(items, name, fks)} from ${from} where ${where}${tail}) x`;
      const { rows } = await tx.query(sql, params);
      const data = rows[0].rows;
      const total = rows[0].total;
      const start = Number(offset ?? 0);
      const range = data.length ? `${start}-${start + data.length - 1}/${total}` : `*/${total}`;
      const extra = { "content-range": prefs.count ? range : range.replace(/\/\d+$/, "/*") };
      if (method === "HEAD") return { status: 200, body: null, headers: extra };
      if (!returning) return { status: method === "POST" ? 201 : 204, body: null, headers: extra };
      if (single) {
        if (data.length !== 1) {
          const e = Object.assign(new Error("JSON object requested, multiple (or no) rows returned"), { code: "PGRST116", detail: `The result contains ${data.length} rows` });
          throw e;
        }
        return { status: 200, body: data[0], headers: extra };
      }
      return { status: method === "POST" ? 201 : 200, body: data, headers: extra };
    });
  }

  /** A function call: POST /rest/v1/rpc/<name> with its named arguments. */
  async function rpc(name, body, who) {
    const info = await procInfo(name);
    if (!info) throw Object.assign(new Error(`function ${name} not found`), { code: "PGRST202" });
    const args = Object.entries(body ?? {});
    const params = args.map(([, v]) => (v === null || v === undefined ? null : typeof v === "object" ? JSON.stringify(v) : String(v)));
    const call = `public.${ident(name)}(${args.map(([k], i) => `${ident(k)} => $${i + 1}`).join(", ")})`;
    return asRole(db, who, async (tx) => {
      if (info.type === "void") {
        await tx.query(`select ${call}`, params);
        return { status: 204, body: null };
      }
      let sql;
      if (info.set) sql = `select coalesce(json_agg(r), '[]'::json) as v from ${call} r`;
      else if (info.kind === "c") sql = `select row_to_json(r) as v from ${call} r`;
      else sql = `select to_json(${call}) as v`;
      const { rows } = await tx.query(sql, params);
      return { status: 200, body: rows[0]?.v ?? null };
    });
  }

  return { table, rpc };
}

/** The primary key columns of a public table, the default upsert target. */
async function primaryKey(db, name) {
  const { rows } = await db.query(
    `select a.attname from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
     where i.indrelid = ('public.' || $1)::regclass and i.indisprimary`,
    [name],
  );
  return rows.map((r) => r.attname);
}
