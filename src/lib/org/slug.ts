/**
 * An organization's slug, made from its name: lowercase letters, digits and
 * single hyphens, 1 to 63 characters, starting with a letter or digit
 * (the `organizations_slug_shape` check). A name with nothing usable gives
 * "org". `uniqueSlug` adds -2, -3 and so on past the slugs already taken.
 * The admin panel makes organizations; this is shared so every caller makes
 * the same slug. Pure.
 */

const MAX = 63;

export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX)
    .replace(/-+$/g, "");
  return base || "org";
}

export function uniqueSlug(name: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(name);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const tail = `-${n}`;
    const slug = `${base.slice(0, MAX - tail.length).replace(/-+$/g, "")}${tail}`;
    if (!used.has(slug)) return slug;
  }
}
