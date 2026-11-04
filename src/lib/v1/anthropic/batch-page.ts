/**
 * The paging rules of the batch list (docs/accounts.md 8.4), kept pure so
 * they are tested on their own. Pages run newest first by created_at, with
 * the id breaking a tie, the way Anthropic's own list pages.
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** The page's size: Anthropic's default of 20, and at most 100. */
export function pageLimit(raw: string | null): number {
  const n = raw === null ? DEFAULT_LIMIT : Number(raw);
  return Number.isInteger(n) && n >= 1 ? Math.min(n, MAX_LIMIT) : DEFAULT_LIMIT;
}

/** A PostgREST `or` filter for the rows strictly after the cursor row: older, or as old with a smaller id. */
export function afterCursor(row: { id: string; created_at: string }): string {
  const at = JSON.stringify(row.created_at);
  const id = JSON.stringify(row.id);
  return `created_at.lt.${at},and(created_at.eq.${at},id.lt.${id})`;
}
