// The made up people and organizations the screenshots show. Maya Collins
// and her coworkers at Fernhill Creative are written out by hand; the few
// hundred other accounts come from a seeded random source, so every run
// draws the same names, plans and dates.

/** A small seeded random source (mulberry32), so a run is the same each time. */
export function random(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (p) => next() < p,
  };
}

/** The account the dashboard pictures are signed in as. */
export const MAYA = { first: "Maya", last: "Collins", email: "maya@fernhillcreative.co", username: "maya_collins", password: "juniper-waterfront-26" };

/** The placeholder address the site gives an account (src/lib/auth/identity.ts): the username at users.coere.ai. */
export const accountEmail = (p) => `${p.username}@users.coere.ai`;

/** Fernhill Creative, her agency: [first, last, username, role]. */
export const FERNHILL = {
  name: "Fernhill Creative",
  slug: "fernhill-creative",
  domain: "fernhillcreative.co",
  members: [
    ["Maya", "Collins", "maya_collins", "admin"],
    ["Daniel", "Okafor", "daniel_okafor", "admin"],
    ["Priya", "Raman", "priya_raman", "member"],
    ["Jordan", "Ellis", "jordan_ellis", "member"],
    ["Sofia", "Marin", "sofia_marin", "member"],
    ["Theo", "Park", "theo_park", "member"],
    ["Lena", "Brooks", "lena_brooks", "member"],
  ],
  /** Invited and not yet joined. */
  invited: [["Nina", "Alvarez", "nina_alvarez", "member"]],
};

/** The other organizations: [name, slug, domain, member count]. */
export const OTHER_ORGS = [
  ["Harbor & Pine Legal", "harbor-pine-legal", "harborpine.law", 5],
  ["Brightwater Health", "brightwater-health", "brightwaterhealth.org", 6],
  ["Tidewater Analytics", "tidewater-analytics", "tidewater.io", 4],
  ["Cedar & Stone Architects", "cedar-stone", "cedarstone.studio", 7],
  ["Juniper Lane Bakery", "juniper-lane", "juniperlane.co", 3],
];

export const FIRST = [
  "Ava", "Liam", "Noah", "Emma", "Olivia", "Ethan", "Mia", "Lucas", "Amara", "Kenji", "Sara", "Diego", "Hana", "Omar", "Grace",
  "Felix", "Isla", "Mateo", "Zoe", "Arjun", "Leah", "Ravi", "Chloe", "Tomas", "Nadia", "Elliot", "Maren", "Kofi", "Ines", "Owen",
  "Talia", "Jonah", "Yuki", "Rosa", "Caleb", "Freya", "Malik", "Iris", "Hugo", "Layla", "Simon", "June", "Andre", "Clara", "Reza",
  "Wren", "Marco", "Esther", "Kai", "Lucia", "Adrian", "Naomi", "Victor", "Selin", "Gabe", "Ada", "Rohan", "Pia", "Dario", "Elsa",
];
export const LAST = [
  "Nguyen", "Garcia", "Patel", "Kim", "Johnson", "Silva", "Cohen", "Okafor", "Tanaka", "Moreau", "Rossi", "Haddad", "Larsen", "Mendes",
  "Reyes", "Novak", "Fischer", "Shah", "Ward", "Ibrahim", "Sato", "Bianchi", "Hughes", "Costa", "Weber", "Ortiz", "Lindqvist", "Adeyemi",
  "Murphy", "Kowalski", "Chen", "Bauer", "Dubois", "Ali", "Park", "Varga", "Santos", "Holm", "Yilmaz", "Castro", "Fraser", "Mori",
  "Andersen", "Becker", "Carvalho", "Delgado", "Eriksen", "Ferreira", "Gallagher", "Hoffman", "Iyer", "Jansen", "Keller", "Lopez",
  "Mahmoud", "Nakamura", "O'Brien", "Petrov", "Quinn", "Ramos", "Schmidt", "Takahashi", "Underwood", "Vasquez", "Walsh", "Xu",
  "Young", "Zimmermann", "Abbott", "Brennan", "Choi", "Dawson", "Esposito", "Fontaine", "Grant", "Herrera", "Ivanova", "Jovanovic",
];
export const PROVIDERS = ["gmail.com", "outlook.com", "icloud.com", "proton.me", "hey.com", "fastmail.com"];

/**
 * Every account: { first, last, email, username, plan, org, role, createdDaysAgo, active, at }.
 * `at` is where in its day the account was made, from 0 to 1, so sign ups spread over the hours.
 * `org` is a slug or null.
 */
export function accounts(count = 312) {
  const r = random(0xc0e4);
  const out = [];
  const used = new Set();
  // Names come from shuffled decks, a fresh deck each time one runs out, so no last name repeats in a row and none crowds a page.
  const deck = (list) => {
    let cards = [];
    return () => {
      if (cards.length === 0) cards = [...list].sort(() => r.next() - 0.5);
      return cards.pop();
    };
  };
  const nextFirst = deck(FIRST);
  const nextLast = deck(LAST);
  const add = (a) => {
    used.add(a.username);
    out.push({ ...a, at: r.next() });
  };
  FERNHILL.members.forEach(([first, last, username, role], i) =>
    add({ first, last, username, role, email: i === 0 ? MAYA.email : `${first.toLowerCase()}@${FERNHILL.domain}`, plan: "team", org: FERNHILL.slug, createdDaysAgo: 52 - i * 3, active: true }),
  );
  FERNHILL.invited.forEach(([first, last, username]) =>
    add({ first, last, username, role: null, email: `${first.toLowerCase()}@${FERNHILL.domain}`, plan: "free", org: null, createdDaysAgo: 6, active: true }),
  );
  for (const [, slug, domain, size] of OTHER_ORGS) {
    for (let i = 0; i < size; i++) {
      const first = nextFirst();
      const last = nextLast();
      const username = `${first}_${last}`.toLowerCase().replace("'", "");
      if (used.has(username)) continue;
      add({ first, last, username, role: i === 0 ? "admin" : "member", email: `${first.toLowerCase()}.${last.toLowerCase().replace("'", "")}@${domain}`, plan: "team", org: slug, createdDaysAgo: r.int(10, 58), active: r.chance(0.9) });
    }
  }
  while (out.length < count) {
    const first = nextFirst();
    const last = nextLast();
    let username = `${first}${r.chance(0.5) ? "_" : ""}${last}`.toLowerCase().replace("'", "");
    if (used.has(username)) username = `${username}${r.int(2, 99)}`;
    if (used.has(username)) continue;
    // Newer accounts are more common: the site has been open for two months and is growing.
    const createdDaysAgo = Math.floor(60 * Math.pow(r.next(), 1.25));
    add({
      first,
      last,
      username,
      role: null,
      email: `${username.replace("_", ".")}@${r.pick(PROVIDERS)}`,
      plan: r.chance(0.12) ? "plus" : "free",
      org: null,
      createdDaysAgo,
      active: r.chance(0.62),
    });
  }
  return out;
}
