// Reads the parts of a PostgREST request the site's queries use: the
// select list with one level of embedded tables, the column filters, `or`,
// and `order`. Only what supabase-js sends for this site's code is read;
// anything else is refused, so a new kind of query fails loudly instead of
// answering with the wrong rows.

/** Splits on commas that are not inside parentheses. */
export function splitTop(text) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim() !== "") out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * The select list: `*`, plain columns (with `alias:` and `::cast`), and an
 * embedded table as `name(cols)` or `alias:name!hint(cols)`.
 */
export function parseSelect(text) {
  const items = [];
  for (const part of splitTop(text || "*")) {
    const open = part.indexOf("(");
    if (open > 0 && part.endsWith(")")) {
      const head = part.slice(0, open);
      const [alias, rawName] = head.includes(":") ? head.split(":") : [null, head];
      const [table, hint] = rawName.split("!");
      items.push({ kind: "embed", table, hint: hint ?? null, alias: alias ?? table, items: parseSelect(part.slice(open + 1, -1)) });
      continue;
    }
    if (part === "*") {
      items.push({ kind: "star" });
      continue;
    }
    const [alias, rest] = part.includes(":") && !part.includes("::") ? part.split(":") : [null, part];
    const [name, cast] = rest.split("::");
    items.push({ kind: "col", name: name.trim(), alias: alias ?? name.trim(), cast: cast ?? null });
  }
  return items;
}

const OPS = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=", like: "LIKE", ilike: "ILIKE" };

/** Quotes one identifier, refusing anything that is not a plain column name. */
export function ident(name) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) throw Object.assign(new Error(`unsupported column ${name}`), { code: "PGRST100" });
  return `"${name}"`;
}

/** Splits `a,b` inside `in.(a,b)`, honouring double quotes. */
function listValues(inner) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (const ch of inner) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * One filter as SQL over `t0`, pushing its values into `params`. `value`
 * is what follows `column=`: `op.value`, or `not.op.value`.
 */
export function filterSql(column, value, params) {
  let negate = false;
  let rest = value;
  if (rest.startsWith("not.")) {
    negate = true;
    rest = rest.slice(4);
  }
  const dot = rest.indexOf(".");
  const op = rest.slice(0, dot);
  const arg = rest.slice(dot + 1);
  const col = `t0.${ident(column)}`;
  let sql;
  if (op === "is") {
    const lit = { null: "NULL", true: "TRUE", false: "FALSE", unknown: "UNKNOWN" }[arg.toLowerCase()];
    if (!lit) throw Object.assign(new Error(`bad is value ${arg}`), { code: "PGRST100" });
    sql = `${col} IS ${lit}`;
  } else if (op === "in") {
    const values = listValues(arg.replace(/^\(/, "").replace(/\)$/, ""));
    if (values.length === 0 || (values.length === 1 && values[0] === "")) sql = "FALSE";
    else {
      const marks = values.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      sql = `${col} IN (${marks.join(", ")})`;
    }
  } else if (op === "cs" || op === "cd" || op === "ov") {
    params.push(arg);
    sql = `${col} ${{ cs: "@>", cd: "<@", ov: "&&" }[op]} $${params.length}`;
  } else if (OPS[op]) {
    params.push(op === "like" || op === "ilike" ? arg.replaceAll("*", "%") : arg);
    sql = `${col} ${OPS[op]} $${params.length}`;
  } else {
    throw Object.assign(new Error(`unsupported operator ${op}`), { code: "PGRST100" });
  }
  return negate ? `NOT (${sql})` : sql;
}

/** `or=(a.eq.1,and(b.gt.2,c.lt.3))` as SQL. */
export function logicSql(kind, text, params) {
  const inner = text.replace(/^\(/, "").replace(/\)$/, "");
  const parts = splitTop(inner).map((p) => {
    const m = /^(not\.)?(and|or)\((.*)\)$/.exec(p);
    if (m) {
      const sub = logicSql(m[2], `(${m[3]})`, params);
      return m[1] ? `NOT ${sub}` : sub;
    }
    const dot = p.indexOf(".");
    return filterSql(p.slice(0, dot), p.slice(dot + 1), params);
  });
  return `(${parts.join(kind === "or" ? " OR " : " AND ")})`;
}

/** `order=a.desc.nullslast,b` as SQL. */
export function orderSql(text) {
  return splitTop(text)
    .map((part) => {
      const [name, ...mods] = part.split(".");
      let sql = `t0.${ident(name)}`;
      if (mods.includes("desc")) sql += " DESC";
      if (mods.includes("nullsfirst")) sql += " NULLS FIRST";
      if (mods.includes("nullslast")) sql += " NULLS LAST";
      return sql;
    })
    .join(", ");
}

const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);

/** Every filter in the query string as one WHERE clause, or "TRUE". */
export function whereSql(search, params) {
  const clauses = [];
  for (const [key, value] of search) {
    if (RESERVED.has(key)) continue;
    if (key === "or" || key === "and") clauses.push(logicSql(key, value, params));
    else if (key === "not.or" || key === "not.and") clauses.push(`NOT ${logicSql(key.slice(4), value, params)}`);
    else clauses.push(filterSql(key, value, params));
  }
  return clauses.length ? clauses.join(" AND ") : "TRUE";
}
