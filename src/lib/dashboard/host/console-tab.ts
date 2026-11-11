/**
 * Which Console section each coere.ai dashboard address opens. The host
 * page at /dashboard frames the extension's own `console.html` and hands
 * it `?tab=`, the section id the Console already takes. Most addresses use
 * that id as their last part, as the extension's console.open routes do
 * (docs/accounts.md 6.8); a few older addresses of the site's own
 * dashboard keep working under the section that took them over. Pure, so
 * the tests pin every address.
 */

/** Address part to Console section. Home is the bare /dashboard. */
const TABS: Readonly<Record<string, string>> = {
  memory: "memory",
  library: "library",
  // The site's old Chats page listed the chats memory came from: the Library holds them.
  chats: "library",
  search: "search",
  settings: "settings",
  // The site's old Account page lives on as the Account card at the top of Settings.
  account: "settings",
  usage: "statistics",
  statistics: "statistics",
  organization: "organization",
  import: "import",
  logs: "logs",
  transfer: "transfer",
  platforms: "platforms",
  folder: "folder",
};

/** The Console section for the path below /dashboard, or null for one the dashboard does not have. */
export function consoleTabFor(section: readonly string[] | undefined): string | null {
  if (!section || section.length === 0) return "home";
  if (section.length > 1) return null;
  const part = section[0];
  return Object.hasOwn(TABS, part) ? TABS[part] : null;
}

/**
 * The framed Console's address: the extension's own page, told it is
 * embedded, with Cori's tour when the finished onboarding asked for it, and
 * the finish screen when a build onboarding started ended with its page
 * closed (the extension opens /dashboard/memory?finish=1 then).
 */
export function consoleSrc(extensionId: string, tab: string, tour = false, finish = false): string {
  return `chrome-extension://${extensionId}/console.html?tab=${encodeURIComponent(tab)}${tour ? "&tour=1" : ""}${finish ? "&finish=1" : ""}&embed=1`;
}

/** The page's own path, for the sign in page to come back to. */
export const dashboardPath = (section: readonly string[] | undefined): string => (section && section.length > 0 ? `/dashboard/${section.join("/")}` : "/dashboard");

/** The onboarding's own query keys and values that may pass to the frame: short plain words only. */
const QUERY_KEY = /^[a-z][a-z0-9_]{0,23}$/;
const QUERY_VALUE = /^[A-Za-z0-9_.-]{0,64}$/;

/**
 * The framed onboarding's address at /welcome: the extension's own
 * `onboarding.html`, told it is embedded, with the step and any state the
 * local page took from its own query, passed on as plain words. Anything
 * else in the query is left out, so the page can never be handed a script
 * or another address.
 */
export function onboardingSrc(extensionId: string, query: Readonly<Record<string, string | string[] | undefined>> = {}): string {
  const out = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (key === "embed" || !QUERY_KEY.test(key) || value === undefined || !QUERY_VALUE.test(value)) continue;
    out.set(key, value);
  }
  out.set("embed", "1");
  return `chrome-extension://${extensionId}/onboarding.html?${out.toString()}`;
}
