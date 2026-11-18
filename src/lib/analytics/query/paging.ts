/**
 * Paging a window of rows that the dashboard reads oldest first.
 *
 * The query orders newest first, by created_at and then by id, so a cap
 * drops the oldest rows and never today's, and every row has one place:
 * rows that share a created_at (a section batch is one statement, so all of
 * its rows do) cannot straddle a page edge twice or not at all. The pages
 * are then turned back to oldest first, which the rollups expect. Pure.
 */
export async function readNewestFirst<T>(page: (from: number, to: number) => Promise<T[]>, size: number, max: number): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; from < max; from += size) {
    const batch = await page(from, Math.min(from + size, max) - 1);
    rows.push(...batch);
    if (batch.length < size) break;
  }
  return rows.reverse();
}
