// Telling a reader from a robot
//
// A page view is recorded by a script in the page, so most crawlers never
// appear here at all: they read the HTML and leave without running anything.
// The ones that DO show up are the crawlers that execute JavaScript (Google
// and Bing render pages, several AI crawlers do, and every headless-browser
// script does by definition), plus link previewers and uptime checks.
//
// Which means this is not a wall. It is a label on the traffic we can see, so
// a view from a machine indexing the site is not counted as someone reading it.
// Classification happens ONCE, on the write path, into an indexed column, the
// same way the browser and OS are: the dashboard groups on a column instead of
// running these patterns over every row it reads.
//
// The order below is the algorithm. Specific names are tested before the
// generic "…bot" catch-all, so a hit is reported as "Googlebot" rather than as
// "Other bot", and the catch-all only answers for the ones we have no name for.

/** What kind of machine it is. Worth separating: a search crawler indexing the
 *  site and a script scraping it are both "not a person", but only one of them
 *  is something to want more of. */
export type BotKind = "search" | "ai" | "social" | "seo" | "tool";

export interface BotId {
  name: string;
  kind: BotKind;
}

const CRAWLERS: { name: string; kind: BotKind; re: RegExp }[] = [
  // Search engines
  { name: "Googlebot", kind: "search", re: /googlebot/ },
  { name: "Google (other)", kind: "search", re: /google-inspectiontool|googleother|google-extended|apis-google|mediapartners-google|adsbot-google|feedfetcher-google|google favicon|storebot-google/ },
  { name: "Bingbot", kind: "search", re: /bingbot|adidxbot|bingpreview/ },
  { name: "DuckDuckBot", kind: "search", re: /duckduckbot|duckduckgo-favicons/ },
  { name: "YandexBot", kind: "search", re: /yandex(bot|images|mobilebot)/ },
  { name: "Baiduspider", kind: "search", re: /baiduspider/ },
  { name: "Applebot", kind: "search", re: /applebot/ },
  { name: "Yahoo Slurp", kind: "search", re: /\bslurp\b/ },
  { name: "Sogou", kind: "search", re: /sogou/ },
  { name: "SeznamBot", kind: "search", re: /seznambot/ },
  { name: "Qwantbot", kind: "search", re: /qwantbot|qwantify/ },
  { name: "Internet Archive", kind: "search", re: /ia_archiver|archive\.org_bot|wayback/ },

  // AI crawlers
  { name: "GPTBot", kind: "ai", re: /gptbot/ },
  { name: "ChatGPT", kind: "ai", re: /chatgpt-user|oai-searchbot/ },
  { name: "ClaudeBot", kind: "ai", re: /claudebot|claude-web|claude-user|anthropic-ai/ },
  { name: "PerplexityBot", kind: "ai", re: /perplexitybot|perplexity-user/ },
  { name: "CCBot", kind: "ai", re: /ccbot/ },
  { name: "Bytespider", kind: "ai", re: /bytespider/ },
  { name: "Amazonbot", kind: "ai", re: /amazonbot/ },
  { name: "Meta AI", kind: "ai", re: /meta-externalagent|meta-externalfetcher/ },
  { name: "Cohere", kind: "ai", re: /cohere-ai|cohere-training-data-crawler/ },
  { name: "Diffbot", kind: "ai", re: /diffbot/ },
  { name: "Omgili", kind: "ai", re: /omgili/ },
  { name: "Timpibot", kind: "ai", re: /timpibot/ },

  // Link previews
  { name: "Facebook", kind: "social", re: /facebookexternalhit|facebookbot|facebookcatalog/ },
  { name: "Twitterbot", kind: "social", re: /twitterbot/ },
  { name: "LinkedInBot", kind: "social", re: /linkedinbot/ },
  { name: "Slackbot", kind: "social", re: /slackbot|slack-imgproxy/ },
  { name: "Discordbot", kind: "social", re: /discordbot/ },
  { name: "TelegramBot", kind: "social", re: /telegrambot/ },
  { name: "WhatsApp", kind: "social", re: /whatsapp/ },
  { name: "Pinterest", kind: "social", re: /pinterest(bot|\/)/ },
  { name: "Redditbot", kind: "social", re: /redditbot/ },
  { name: "Embedly", kind: "social", re: /embedly|iframely/ },

  // SEO and market-intelligence crawlers
  { name: "AhrefsBot", kind: "seo", re: /ahrefsbot|ahrefssiteaudit/ },
  { name: "SemrushBot", kind: "seo", re: /semrushbot/ },
  { name: "MJ12bot", kind: "seo", re: /mj12bot/ },
  { name: "DotBot", kind: "seo", re: /dotbot/ },
  { name: "BLEXBot", kind: "seo", re: /blexbot/ },
  { name: "PetalBot", kind: "seo", re: /petalbot/ },
  { name: "DataForSeoBot", kind: "seo", re: /dataforseobot/ },
  { name: "Barkrowler", kind: "seo", re: /barkrowler/ },
  { name: "ZoominfoBot", kind: "seo", re: /zoominfobot/ },
  { name: "Serpstat", kind: "seo", re: /serpstatbot/ },
  { name: "ImagesiftBot", kind: "seo", re: /imagesiftbot/ },

  // Scripts, headless browsers and monitors
  { name: "Headless browser", kind: "tool", re: /headlesschrome|phantomjs|puppeteer|playwright|selenium|electron\// },
  { name: "Uptime monitor", kind: "tool", re: /uptimerobot|pingdom|statuscake|site24x7|newrelicpinger|datadog|betteruptime|hetrixtools/ },
  { name: "Scrapy", kind: "tool", re: /scrapy/ },
  { name: "curl", kind: "tool", re: /^curl\/|\bcurl\// },
  { name: "wget", kind: "tool", re: /\bwget\b/ },
  { name: "Python script", kind: "tool", re: /python-requests|python-urllib|aiohttp|httpx/ },
  { name: "Go script", kind: "tool", re: /go-http-client/ },
  { name: "Java script", kind: "tool", re: /\bjava\/|apache-httpclient|okhttp/ },
  { name: "Node script", kind: "tool", re: /node-fetch|axios\/|got \(|undici/ },
  { name: "Perl script", kind: "tool", re: /libwww-perl|lwp::/ },
  { name: "Postman", kind: "tool", re: /postmanruntime|insomnia/ },
  { name: "Feed reader", kind: "tool", re: /feedly|feedburner|rssbot|newsblur|inoreader/ },
  { name: "Link checker", kind: "tool", re: /w3c_validator|validator\.nu|linkcheck|httpurlconnection|checkmarknetwork/ },

  // Anything else that says so
  // Last on purpose: this is the pattern that catches the long tail of crawlers
  // nobody has heard of, and it must never win against a name we do have.
  { name: "Other bot", kind: "tool", re: /bot\b|\bbots?\/|crawler|crawl\b|spider|scraper|fetcher|archiver|monitoring|probe|헤드리스/ },
];

/** Which crawler this is, or null when the user agent looks like a person's
 *  browser. A missing user agent is NOT called a bot: we cannot tell, and
 *  guessing would put real readers in the machine column. */
export function botFromUa(ua: string | null | undefined): BotId | null {
  if (!ua) return null;
  const s = ua.toLowerCase();
  for (const c of CRAWLERS) if (c.re.test(s)) return { name: c.name, kind: c.kind };
  return null;
}
