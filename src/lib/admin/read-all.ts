import "server-only";

/**
 * Reads every row of a query in pages of 1,000, the most PostgREST answers
 * at once. `page(from, to)` builds the same query for one range. Stops at
 * `max` rows, so a table that grows past what a panel can draw costs a
 * capped read instead of a timeout. A failure throws with the error's code
 * only, which names no person.
 */
const PAGE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: { code?: string } | null }>;

export async function readAll<T>(page: (from: number, to: number) => Page<T>, max = 50_000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < max; from += PAGE) {
    const { data, error } = await page(from, Math.min(from + PAGE, max) - 1);
    if (error) throw new Error(`read failed: ${error.code ?? "unknown"}`);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}
