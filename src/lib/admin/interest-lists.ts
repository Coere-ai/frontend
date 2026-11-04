import { toCsv } from "./csv";

/**
 * The admin Interested page's three lists and its CSV files. Developers are
 * the developer_waitlist; Coere Connect and Coere for Teams are
 * product_interest by product. Pure, so the routes and the tests share it.
 */

export const INTEREST_LISTS = ["developers", "connect", "teams"] as const;
export type InterestList = (typeof INTEREST_LISTS)[number];

export const INTEREST_LIST_NAMES: Record<InterestList, string> = {
  developers: "Developers",
  connect: "Coere Connect",
  teams: "Coere for Teams",
};

/** A list named in a query, or null. "all" is only for the CSV, so the caller allows it. */
export function readInterestList(raw: string | null): InterestList | null {
  return (INTEREST_LISTS as readonly string[]).includes(raw ?? "") ? (raw as InterestList) : null;
}

export type InterestRow = { email: string; source: string | null; createdAt: string };

/** One list as a CSV file: email, source, joined (UTC). */
export function listCsv(rows: readonly InterestRow[]): string {
  return toCsv(
    ["email", "source", "joined_utc"],
    rows.map((r) => [r.email, r.source, r.createdAt]),
  );
}

/** Every list in one file, with the list each row is from first, each list newest first. */
export function allCsv(lists: Record<InterestList, readonly InterestRow[]>): string {
  return toCsv(
    ["product", "email", "source", "joined_utc"],
    INTEREST_LISTS.flatMap((list) => lists[list].map((r) => [list, r.email, r.source, r.createdAt])),
  );
}

/** The file's name, fixed here and never taken from the request. */
export function csvName(list: InterestList | "all"): string {
  return list === "all" ? "coere-interested-all.csv" : `coere-interested-${list}.csv`;
}
