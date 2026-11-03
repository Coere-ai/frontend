/**
 * A short name for this browser from its user agent, such as "Chrome on
 * macOS", so the device list says which computer a token belongs to. Made on
 * the page; the server only trims it.
 */

const BROWSERS: Array<[RegExp, string]> = [
  [/\bEdg\//, "Edge"],
  [/\bOPR\//, "Opera"],
  [/\bVivaldi\//, "Vivaldi"],
  [/\bChrome\//, "Chrome"],
];

const SYSTEMS: Array<[RegExp, string]> = [
  [/\bCrOS\b/, "ChromeOS"],
  [/\bAndroid\b/, "Android"],
  [/\b(iPhone|iPad)\b/, "iOS"],
  [/\bMac OS X\b|\bMacintosh\b/, "macOS"],
  [/\bWindows\b/, "Windows"],
  [/\bLinux\b/, "Linux"],
];

export function deviceName(userAgent: string): string {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "Chrome";
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  return system ? `${browser} on ${system}` : browser;
}

/** What the server keeps of a name the page sent: plain text, at most 60 characters. */
export function cleanDeviceName(raw: unknown): string {
  if (typeof raw !== "string") return "Chrome";
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 60);
  return name || "Chrome";
}
