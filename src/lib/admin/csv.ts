/**
 * A CSV file the operator downloads and opens in a spreadsheet. Fields are
 * quoted as RFC 4180 says. A field that a spreadsheet would run as a
 * formula (it starts with =, +, -, @, a tab or a carriage return) gets a
 * leading apostrophe, since the waitlist holds whatever strangers typed.
 * Pure.
 */

const FORMULA = /^[=+\-@\t\r]/;

export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (typeof value === "string" && FORMULA.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The head row, then each row, joined with CRLF and ending with one. */
export function toCsv(head: readonly string[], rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>): string {
  return [head, ...rows].map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
}
