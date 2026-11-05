// Seeds the public site's side: the developer waitlist, who asked to hear
// about Coere Connect and Coere for Teams, and a month of site analytics
// (visits, clicks and how long each home section was read), with the
// growth a new site has.

import { insertRows, momentOf } from "./insert.mjs";
import { accounts, FIRST, LAST, PROVIDERS, random } from "./people.mjs";

const PATHS = [
  ["/", 40], ["/products/connect", 14], ["/products/solutions", 8], ["/products/forge", 6], ["/products/agents", 4],
  ["/install", 7], ["/try-teams", 3], ["/industries", 3], ["/resources", 4], ["/about", 3], ["/developers/waitlist", 3],
  ["/portable-ai-memory", 3], ["/chatgpt-to-claude-memory", 4], ["/privacy", 1],
];
const REFERRERS = [[null, 40], ["google.com", 26], ["news.ycombinator.com", 8], ["x.com", 7], ["linkedin.com", 6], ["reddit.com", 5], ["chatgpt.com", 4], ["bing.com", 2], ["duckduckgo.com", 2]];
const PLACES = [
  ["US", "California", "San Francisco", 37.77, -122.42, 14], ["US", "New York", "New York", 40.71, -74.0, 12], ["US", "Oregon", "Portland", 45.52, -122.68, 6],
  ["US", "Texas", "Austin", 30.27, -97.74, 5], ["US", "Washington", "Seattle", 47.61, -122.33, 5], ["GB", "England", "London", 51.51, -0.13, 9],
  ["DE", "Berlin", "Berlin", 52.52, 13.4, 6], ["CA", "Ontario", "Toronto", 43.65, -79.38, 5], ["IN", "Karnataka", "Bengaluru", 12.97, 77.59, 7],
  ["FR", "Ile-de-France", "Paris", 48.86, 2.35, 4], ["NL", "North Holland", "Amsterdam", 52.37, 4.9, 3], ["AU", "New South Wales", "Sydney", -33.87, 151.21, 3],
  ["BR", "Sao Paulo", "Sao Paulo", -23.55, -46.63, 3], ["JP", "Tokyo", "Tokyo", 35.68, 139.69, 3], ["SE", "Stockholm", "Stockholm", 59.33, 18.07, 2],
];
const AGENTS = [
  ["desktop", "Chrome", "macOS", 34], ["desktop", "Chrome", "Windows", 22], ["desktop", "Safari", "macOS", 8], ["desktop", "Firefox", "Windows", 4],
  ["desktop", "Edge", "Windows", 5], ["desktop", "Chrome", "Linux", 4], ["mobile", "Safari", "iOS", 14], ["mobile", "Chrome", "Android", 8], ["tablet", "Safari", "iPadOS", 1],
];
const BOTS = ["Googlebot", "bingbot", "GPTBot", "ClaudeBot", "PerplexityBot", "Applebot"];
const HOME_SECTIONS = [["hero", "Hero", 0], ["demo", "Demo", 1], ["connect", "Coere Connect", 2], ["solutions", "Coere Solutions", 3], ["forge", "Coere Forge", 4], ["compare", "How Coere compares", 5]];
const CTAS = [["Install Coere Connect", "/install"], ["Try it free", "/try-teams"], ["Join the waitlist", "/developers/waitlist"], ["Sign in", "/sign-in"]];

function weighted(r, list) {
  const total = list.reduce((s, x) => s + x[x.length - 1], 0);
  let n = r.next() * total;
  for (const x of list) {
    n -= x[x.length - 1];
    if (n <= 0) return x;
  }
  return list[list.length - 1];
}

export async function seedSite(db, now) {
  const r = random(0x517e);
  const people = accounts();

  // Interest lists: some from people who later made accounts, the rest from addresses seen only here.
  // People who have not made an account: a name and a mail provider, as most people sign up.
  const extra = (n) => {
    const out = new Set();
    while (out.size < n) out.add(`${r.pick(FIRST)}${r.pick([".", "", "_"])}${r.pick(LAST)}${r.chance(0.3) ? r.int(1, 99) : ""}@${r.pick(PROVIDERS)}`.toLowerCase());
    return [...out];
  };
  const emails = [...people.map((p) => p.email), ...extra(160)];
  // Days ago, weighted toward recent days: interest grows as the launch nears.
  const recent = (skew) => Math.floor(30 * Math.pow(r.next(), skew));
  const waitlist = emails.filter(() => r.chance(0.35)).slice(0, 148).map((email) => ({ email, source: r.pick(["waitlist", "resources", "forge"]), created_at: momentOf(now, recent(1.4), r) }));
  await insertRows(db, "public.developer_waitlist", waitlist);
  const interest = [];
  for (const email of emails) {
    if (r.chance(0.55)) interest.push({ email, product: "connect", source: r.pick(["install", "home", "products"]), created_at: momentOf(now, recent(1.3), r) });
    if (r.chance(0.16)) interest.push({ email, product: "teams", source: r.pick(["try-teams", "solutions"]), created_at: momentOf(now, recent(1.3), r) });
  }
  await insertRows(db, "public.product_interest", interest);

  // Visits: more each day as the site grows, a share of them crawlers.
  const visits = [];
  const events = [];
  const sections = [];
  for (let d = 29; d >= 0; d--) {
    const count = Math.round((70 + (29 - d) * 5) * (0.8 + 0.4 * r.next()) * (new Date(now - d * 86_400_000).getUTCDay() % 6 === 0 ? 0.7 : 1));
    for (let i = 0; i < count; i++) {
      const bot = r.chance(0.12);
      const [path] = weighted(r, PATHS);
      const [device, browser, os] = weighted(r, AGENTS);
      const [country, region, city, lat, lon] = weighted(r, PLACES);
      const session = `s${d}_${i}_${Math.floor(r.next() * 1e9).toString(36)}`;
      const visitor = `v${Math.floor(r.next() * 2600).toString(36)}`;
      const at = momentOf(now, d, r);
      const duration = bot ? 0 : Math.round(8 + 160 * Math.pow(r.next(), 2));
      const converted = !bot && r.chance(path === "/install" || path === "/try-teams" ? 0.3 : 0.05);
      visits.push({
        session_id: session, visitor_id: visitor, path, referrer: bot ? null : weighted(r, REFERRERS)[0],
        user_agent: bot ? `Mozilla/5.0 (compatible; ${r.pick(BOTS)})` : `${browser} on ${os}`, device: bot ? null : device, browser: bot ? null : browser, os: bot ? null : os,
        country, region, city, latitude: lat, longitude: lon, duration_seconds: duration, max_scroll: bot ? 0 : r.int(10, 100),
        is_bot: bot, bot_name: bot ? r.pick(BOTS) : null, cta_clicks: converted ? 1 : 0, converted, created_at: at, last_seen_at: at,
      });
      if (bot) continue;
      if (r.chance(0.35)) events.push({ session_id: session, visitor_id: visitor, path, kind: "click", label: r.pick(["Products", "Industries", "Resources", "Watch the film", "See how it works"]), created_at: at });
      if (converted) {
        const [label, href] = r.pick(CTAS);
        events.push({ session_id: session, visitor_id: visitor, path, kind: "cta", label, href, created_at: at });
      }
      if (r.chance(0.04)) events.push({ session_id: session, visitor_id: visitor, path, kind: "outbound", label: "GitHub", href: "https://github.com", created_at: at });
      if (path === "/") {
        let left = duration;
        for (const [id, label, position] of HOME_SECTIONS) {
          if (left <= 0) break;
          const seconds = Math.min(left, Math.round((position === 0 ? 14 : 22) * (0.3 + r.next())));
          left -= seconds;
          sections.push({ session_id: session, visitor_id: visitor, path, section: id, label, position, seconds, created_at: at, last_seen_at: at });
        }
      }
    }
  }
  await insertRows(db, "public.site_visits", visits);
  await insertRows(db, "public.site_events", events);
  await insertRows(db, "public.site_section_views", sections);
}
