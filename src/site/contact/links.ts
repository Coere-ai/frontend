/**
 * The addresses the contact and booking pop ups open. Pure, so the tests can
 * check every one without a browser.
 */

/** The founders' booking page on Cal.com. Every "Book a demo" links here. */
export const BOOKING_URL = "https://cal.com/edison-law-lz5s63/coere-demo";

/** The same page as Cal.com's embed names it: the path, with no origin. */
export const BOOKING_CAL_LINK = "edison-law-lz5s63/coere-demo";

/** The subject a new message starts with when the link gives none. */
export const DEFAULT_SUBJECT = "Coere";

/**
 * Encodes a value for a query string. The @ stays as it is, so an address
 * reads plainly in the link, and every mail service still parses it.
 */
function encode(value: string): string {
  return encodeURIComponent(value).replace(/%40/g, "@");
}

/** A mailto link, which opens Apple Mail or whatever mail app the computer uses. */
export function mailtoHref(to: string, subject = DEFAULT_SUBJECT): string {
  return `mailto:${encode(to)}?subject=${encode(subject)}`;
}

/** Gmail's compose window in the browser, with the address and subject filled in. */
export function gmailComposeHref(to: string, subject = DEFAULT_SUBJECT): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encode(to)}&su=${encode(subject)}`;
}

/** Outlook on the web's compose window, for work and personal Microsoft accounts alike. */
export function outlookComposeHref(to: string, subject = DEFAULT_SUBJECT): string {
  return `https://outlook.office.com/mail/deeplink/compose?to=${encode(to)}&subject=${encode(subject)}`;
}

/**
 * Reads a link that writes to `email`. Gives the subject it asks for (or the
 * default), or null when the link is not a mailto link to that address, so
 * the pop up opens for the team's address alone.
 */
export function readMailto(href: string, email: string): { subject: string } | null {
  if (!/^mailto:/i.test(href)) return null;
  const [to, query = ""] = href.slice("mailto:".length).split("?", 2);
  let address: string;
  try {
    address = decodeURIComponent(to).trim().toLowerCase();
  } catch {
    return null;
  }
  if (address !== email.toLowerCase()) return null;
  const subject = new URLSearchParams(query).get("subject")?.trim();
  return { subject: subject || DEFAULT_SUBJECT };
}

/** Whether a link goes to the booking page, with or without a query or a trailing slash. */
export function isBookingHref(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  const host = url.hostname.replace(/^(www|app)\./, "");
  return url.protocol === "https:" && host === "cal.com" && url.pathname.replace(/\/+$/, "") === `/${BOOKING_CAL_LINK}`;
}
