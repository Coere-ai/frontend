// Seeds two months of AI use by model, what each account's memory holds,
// and the running totals the admin panel reads (user_totals, org_totals,
// daily_totals, usage_monthly), all summed from the same daily rows so
// every page agrees with every other.

import { insertRows } from "./insert.mjs";
import { FERNHILL, MAYA, random } from "./people.mjs";

/** Each model's share of requests, average tokens per request, and price in dollars per million tokens. */
const MODELS = [
  { model: "claude-haiku-5-5", share: 0.52, input: 2600, output: 320, price: [0.1, 0.5] },
  { model: "claude-sonnet-5-5", share: 0.38, input: 6200, output: 950, price: [2, 10] },
  { model: "claude-opus-5-5", share: 0.1, input: 8800, output: 1400, price: [4, 20] },
];

const DAYS = 60;

export async function seedUsage(db, { people, orgId, dayOf }) {
  const r = random(0x05a9e);
  const daily = [];
  const modelDay = new Map();
  const totals = new Map();
  const flows = new Map();
  const flow = (day) => {
    if (!flows.has(day)) flows.set(day, { day, new_users: 0, new_orgs: 0, requests: 0, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, cost_micros: 0, tokens_saved: 0, context_imports: 0, transfers: 0, extractions: 0, cori_chats: 0, action_runs: 0, memories: 0, entities: 0, links: 0, chats: 0, storage_bytes: 0 });
    return flows.get(day);
  };

  for (const p of people) {
    flow(dayOf(p.createdDaysAgo)).new_users += 1;
    const t = { user_id: p.id, requests: 0, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, cost_micros: 0, tokens_saved: 0, context_imports: 0, transfers: 0, extractions: 0, cori_chats: 0, action_runs: 0, memories: 0, entities: 0, links: 0, chats: 0, storage_bytes: 0 };
    totals.set(p.id, t);
    if (!p.active) continue;
    // An account that never built its memory used little: it is still inside its free first build.
    // Maya brought her memory in a file, so she builds less than her coworkers, but she uses Coere every day.
    const level = p.email === MAYA.email ? r.int(10, 16) : !p.built ? r.int(1, 2) : p.org ? r.int(18, 60) : r.int(4, 40);
    for (let d = Math.min(DAYS - 1, p.createdDaysAgo); d >= 0; d--) {
      if (!r.chance(p.org ? 0.75 : 0.45)) continue;
      const day = dayOf(d);
      const f = flow(day);
      // The first build is the biggest day an account has.
      const requests = Math.round(level * (0.5 + r.next()) * (d === p.firstBuildDaysAgo ? 6 : 1));
      const row = { user_id: p.id, day, requests: 0, input_tokens: 0, output_tokens: 0, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 0 };
      for (const m of MODELS) {
        const n = Math.round(requests * m.share * (0.7 + 0.6 * r.next()));
        if (n === 0) continue;
        const input = n * Math.round(m.input * (0.8 + 0.4 * r.next()));
        const output = n * Math.round(m.output * (0.8 + 0.4 * r.next()));
        const cacheRead = Math.round(input * 0.35);
        const cacheWrite = Math.round(input * 0.06);
        const cost = Math.round(input * m.price[0] + output * m.price[1] + cacheRead * m.price[0] * 0.1 + cacheWrite * m.price[0] * 1.25);
        row.requests += n;
        row.input_tokens += input;
        row.output_tokens += output;
        row.cache_read_tokens += cacheRead;
        row.cache_write_tokens += cacheWrite;
        row.cost_micros += cost;
        const key = `${day}|${m.model}`;
        const md = modelDay.get(key) ?? { day, model: m.model, requests: 0, input_tokens: 0, output_tokens: 0, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 0 };
        md.requests += n;
        md.input_tokens += input;
        md.output_tokens += output;
        md.cache_read_tokens += cacheRead;
        md.cache_write_tokens += cacheWrite;
        md.cost_micros += cost;
        modelDay.set(key, md);
      }
      daily.push(row);
      const imports = r.int(0, Math.ceil(level / 4));
      const done = { context_imports: imports, transfers: r.int(0, 2), extractions: r.int(0, 3), cori_chats: r.int(0, 4), action_runs: r.int(0, 1), tokens_saved: imports * r.int(900, 2600) };
      for (const k of ["requests", "input_tokens", "output_tokens", "cache_read_tokens", "cache_write_tokens", "cost_micros"]) {
        t[k] += row[k];
        f[k] += row[k];
      }
      for (const [k, v] of Object.entries(done)) {
        t[k] += v;
        f[k] += v;
      }
    }
  }

  // Each built account's memory file, as the server records it after a commit (no file behind it).
  const files = [];
  for (const p of people) {
    if (!p.built || p.email === MAYA.email) continue;
    const t = totals.get(p.id);
    t.memories = r.int(40, 900);
    t.entities = Math.round(t.memories * 0.35);
    t.links = Math.round(t.memories * 0.6);
    t.chats = r.int(30, 600);
    t.storage_bytes = t.memories * r.int(900, 1500);
    files.push({ user_id: p.id, object_path: `${p.id}/memory.coere`, bytes: t.storage_bytes, digest: `sha256-${p.id.slice(0, 8)}`, format_version: "2.0", generator_version: "4.0.3", memories: t.memories, entities: t.entities, links: t.links, chats: t.chats, sections: r.int(6, 12), uploaded_at: new Date(Date.now() - r.int(0, 5) * 86_400_000).toISOString() });
    const f = flow(dayOf(p.firstBuildDaysAgo));
    f.memories += t.memories;
    f.chats += t.chats;
    f.storage_bytes += t.storage_bytes;
  }
  await insertRows(db, "public.memory_files", files);
  await insertRows(db, "storage.objects", files.map((f) => ({ bucket_id: "memory", name: f.object_path, metadata: { size: f.bytes, mimetype: "application/zip" } })));

  await insertRows(db, "public.usage_daily", daily);
  await insertRows(db, "public.usage_model_daily", [...modelDay.values()]);
  const monthly = new Map();
  for (const d of daily) {
    const key = `${d.user_id}|${d.day.slice(0, 7)}`;
    const m = monthly.get(key) ?? { user_id: d.user_id, month: `${d.day.slice(0, 7)}-01`, requests: 0, input_tokens: 0, output_tokens: 0, cost_micros: 0 };
    for (const k of ["requests", "input_tokens", "output_tokens", "cost_micros"]) m[k] += d[k];
    monthly.set(key, m);
  }
  await insertRows(db, "public.usage_monthly", [...monthly.values()]);

  await db.query("delete from public.user_totals");
  await insertRows(db, "public.user_totals", [...totals.values()]);

  for (const o of await db.query("select created_at from public.organizations").then((x) => x.rows)) flow(new Date(o.created_at).toISOString().slice(0, 10)).new_orgs += 1;
  await db.query("delete from public.daily_totals");
  await insertRows(db, "public.daily_totals", [...flows.values()]);

  // Each organization's totals: its members' use summed, and its graph's counts from org_memory.
  const orgTotals = [...orgId.values()].map((id) => ({ org_id: id, members: 0, requests: 0, input_tokens: 0, output_tokens: 0, cost_micros: 0, tokens_saved: 0, context_imports: 0, transfers: 0, extractions: 0, cori_chats: 0, action_runs: 0 }));
  const byOrg = new Map(orgTotals.map((o) => [o.org_id, o]));
  for (const p of people.filter((x) => x.org)) {
    const o = byOrg.get(orgId.get(p.org));
    const t = totals.get(p.id);
    o.members += 1;
    for (const k of ["requests", "input_tokens", "output_tokens", "cost_micros", "tokens_saved", "context_imports", "transfers", "extractions", "cori_chats", "action_runs"]) o[k] += t[k];
  }
  await db.query("delete from public.org_totals");
  await insertRows(db, "public.org_totals", orgTotals);
  // The other organizations' merged graphs, as the site's merge would have counted them. Fernhill's comes from the run itself.
  for (const [slug, id] of orgId) {
    if (slug !== FERNHILL.slug) {
      const facts = r.int(120, 900);
      await db.query(
        "update public.org_memory set index_path = $2, index_bytes = $3, entities = $4, facts = $5, relations = $6, sources = $7, contributors = $8 where org_id = $1",
        [id, `org/${id}/index.json`, facts * 420, Math.round(facts * 0.3), facts, Math.round(facts * 0.4), Math.round(facts * 0.6), byOrg.get(id).members],
      );
    }
    await db.query("select public.set_org_memory_totals($1)", [id]);
  }
}
