// Reading the visitor's client and location, server-side
//
// Both of these run once per visit, on the write path, so the dashboard groups
// on plain indexed columns instead of running string matching over every row it
// reads. Neither is ever fed by anything the browser can choose: the geo comes
// from the edge, and the user agent is treated as a label, not as a fact.

/** What we report a browser as. Deliberately short: these are the ones with
 *  enough share to be worth a row, and everything else is honestly "Other"
 *  rather than a long tail of engine names nobody acts on. */
export type Browser =
  | "Chrome"
  | "Safari"
  | "Firefox"
  | "Edge"
  | "Opera"
  | "Samsung Internet"
  | "Other";

export type Os = "macOS" | "Windows" | "iOS" | "Android" | "Linux" | "ChromeOS" | "Other";

export type Device = "mobile" | "tablet" | "desktop" | "unknown";

/**
 * Which browser, from the user agent.
 *
 * ORDER IS THE WHOLE ALGORITHM. Every Chromium browser still says "Chrome" and
 * every one of them still says "Safari", because that is what the UA string
 * became: a pile of compatibility claims rather than a name. So the specific
 * claims are tested first and the generic ones last, and Safari is only Safari
 * once nothing else has matched.
 */
export function browserFromUa(ua: string | null | undefined): Browser {
  if (!ua) return "Other";
  const s = ua.toLowerCase();
  if (s.includes("edg/") || s.includes("edga/") || s.includes("edgios/")) return "Edge";
  if (s.includes("opr/") || s.includes("opera")) return "Opera";
  if (s.includes("samsungbrowser")) return "Samsung Internet";
  if (s.includes("firefox/") || s.includes("fxios/")) return "Firefox";
  if (s.includes("chrome/") || s.includes("crios/") || s.includes("chromium")) return "Chrome";
  if (s.includes("safari/")) return "Safari";
  return "Other";
}

/** Which platform. iOS is tested before macOS because iPadOS claims to be a Mac
 *  and only gives itself away through the touch hints, which a UA string does
 *  not carry, so an iPad reports as macOS here, and that is the honest limit
 *  of what the string can say. */
export function osFromUa(ua: string | null | undefined): Os {
  if (!ua) return "Other";
  const s = ua.toLowerCase();
  if (/iphone|ipod|ipad|ios/.test(s)) return "iOS";
  if (s.includes("android")) return "Android";
  if (s.includes("cros")) return "ChromeOS";
  if (s.includes("windows")) return "Windows";
  if (/mac os x|macintosh/.test(s)) return "macOS";
  if (/linux|x11|ubuntu|fedora/.test(s)) return "Linux";
  return "Other";
}

/** Coarse form factor. Tablet is tested first: an Android tablet's UA contains
 *  "android" but NOT "mobi", and testing mobile first would swallow it. */
export function deviceFromUa(ua: string | null | undefined): Device {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobi))/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini|windows phone/.test(s)) {
    return "mobile";
  }
  return "desktop";
}

export interface Geo {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

const EMPTY_GEO: Geo = {
  country: null,
  region: null,
  city: null,
  latitude: null,
  longitude: null,
};

/** City names arrive percent-encoded (the header must be ASCII), so "S%C3%A3o
 *  Paulo" has to be decoded or the table reads as mojibake. A malformed
 *  sequence throws, and a bad city name is not worth losing the visit over. */
function decode(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v).trim().slice(0, 120) || null;
  } catch {
    return v.trim().slice(0, 120) || null;
  }
}

/**
 * Where the edge placed this request.
 *
 * Read from the platform's own headers and from nothing else. These are set by
 * the edge on the way in and cannot be spoofed by the client: a header the
 * browser sends under one of these names is overwritten before the request
 * reaches this code. That is the entire reason geo is resolved here rather than
 * from a client-side lookup, which a visitor could simply lie to.
 *
 * The coordinates are the CITY's centroid, not a device position, everyone in
 * one city shares a point. Rounded to three decimals (~110m) because the source
 * has nothing finer to give and storing more digits would imply precision that
 * does not exist.
 *
 * Absent in local development, and absent for any address the edge cannot
 * place. That is a null, not a zero: "we do not know" and "the Gulf of Guinea"
 * are different answers, and (0, 0) is a real place on the map.
 */
export function geoFromHeaders(headers: Headers): Geo {
  // Vercel's edge first, then Cloudflare, then the generic names a reverse
  // proxy sets. Read in order and take the first that answers, so the same
  // build reports geography behind any of them instead of silently recording
  // "Unknown" for every visit because it was looking for one vendor's spelling.
  const pick = (...names: string[]): string | null => {
    for (const n of names) {
      const v = headers.get(n);
      if (v && v.trim() && v.trim() !== "XX") return v.trim();
    }
    return null;
  };

  // Only the PLATFORM-set families are trusted by default. `x-vercel-ip-*` and
  // `cf-*` are written by the edge that terminates the connection and are
  // stripped from whatever the client sent, so they cannot be forged from
  // outside. The generic `x-geo-*` / `x-country-code` spellings are not set by
  // our own deployment, so on it they are simply request headers an attacker
  // chooses, reading them let anyone write arbitrary countries, cities and
  // coordinates into the analytics the admin dashboard reports on. A deployment
  // that genuinely sits behind a proxy setting those names can opt back in.
  const trustGeneric = process.env.ANALYTICS_TRUST_GENERIC_GEO_HEADERS === "1";
  const generic = (...names: string[]) => (trustGeneric ? names : []);

  const country = pick("x-vercel-ip-country", "cf-ipcountry", ...generic("x-country-code", "x-geo-country"));
  const region = pick("x-vercel-ip-country-region", "cf-region-code", ...generic("x-geo-region"));
  const city = pick("x-vercel-ip-city", "cf-ipcity", ...generic("x-geo-city"));
  const lat = pick("x-vercel-ip-latitude", "cf-iplatitude", ...generic("x-geo-latitude"));
  const lon = pick("x-vercel-ip-longitude", "cf-iplongitude", ...generic("x-geo-longitude"));

  if (!country && !city && !lat) return EMPTY_GEO;

  const num = (v: string | null, min: number, max: number): number | null => {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) return null;
    return Math.round(n * 1000) / 1000;
  };

  return {
    // ISO 3166-1 alpha-2, which is what the flag and the map both key on.
    country: country ? country.toUpperCase().slice(0, 2) : null,
    region: region ? region.toUpperCase().slice(0, 8) : null,
    city: decode(city),
    latitude: num(lat, -90, 90),
    longitude: num(lon, -180, 180),
  };
}
