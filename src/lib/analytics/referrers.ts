// Naming the place a visit came from
//
// The write path stores a referrer as a bare host ("t.co", "www.google.com")
// or as nothing at all, and a bare host is not an answer to "how did they find
// us": nobody browses t.co. This turns the host into the name of the thing the
// person was actually using, and gives every row a sentence saying what it
// means, because "Direct" tells you nothing unless you already know.

const SOURCES: { name: string; meaning: string; re: RegExp }[] = [
  { name: "Google", meaning: "Clicked a Google search result", re: /(^|\.)google\.[a-z.]+$/ },
  { name: "Google", meaning: "Clicked a Google search result", re: /^google$/ },
  { name: "Bing", meaning: "Clicked a Bing search result", re: /(^|\.)bing\.com$/ },
  { name: "DuckDuckGo", meaning: "Clicked a DuckDuckGo search result", re: /(^|\.)duckduckgo\.com$/ },
  { name: "Yahoo", meaning: "Clicked a Yahoo search result", re: /(^|\.)search\.yahoo\.[a-z.]+$/ },
  { name: "Ecosia", meaning: "Clicked an Ecosia search result", re: /(^|\.)ecosia\.org$/ },
  { name: "Brave Search", meaning: "Clicked a Brave search result", re: /(^|\.)search\.brave\.com$/ },
  { name: "Yandex", meaning: "Clicked a Yandex search result", re: /(^|\.)yandex\.[a-z.]+$/ },
  { name: "Baidu", meaning: "Clicked a Baidu search result", re: /(^|\.)baidu\.com$/ },

  { name: "ChatGPT", meaning: "Followed a link ChatGPT gave them", re: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/ },
  { name: "Claude", meaning: "Followed a link Claude gave them", re: /(^|\.)claude\.ai$/ },
  { name: "Perplexity", meaning: "Followed a link Perplexity gave them", re: /(^|\.)perplexity\.ai$/ },
  { name: "Gemini", meaning: "Followed a link Gemini gave them", re: /(^|\.)gemini\.google\.com$/ },
  { name: "Copilot", meaning: "Followed a link Copilot gave them", re: /(^|\.)copilot\.microsoft\.com$/ },

  { name: "X (Twitter)", meaning: "Clicked a link in a post on X", re: /(^|\.)(t\.co|x\.com|twitter\.com)$/ },
  { name: "LinkedIn", meaning: "Clicked a link on LinkedIn", re: /(^|\.)(linkedin\.com|lnkd\.in)$/ },
  { name: "Facebook", meaning: "Clicked a link on Facebook", re: /(^|\.)(facebook\.com|fb\.me|l\.facebook\.com)$/ },
  { name: "Instagram", meaning: "Clicked a link on Instagram", re: /(^|\.)(instagram\.com|l\.instagram\.com)$/ },
  { name: "Reddit", meaning: "Clicked a link on Reddit", re: /(^|\.)(reddit\.com|redd\.it)$/ },
  { name: "Hacker News", meaning: "Clicked a link on Hacker News", re: /(^|\.)(news\.ycombinator\.com|hn\.algolia\.com)$/ },
  { name: "YouTube", meaning: "Clicked a link from a YouTube video", re: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { name: "Discord", meaning: "Clicked a link shared in Discord", re: /(^|\.)discord(app)?\.com$/ },
  { name: "Slack", meaning: "Clicked a link shared in Slack", re: /(^|\.)slack\.com$/ },
  { name: "WhatsApp", meaning: "Clicked a link shared on WhatsApp", re: /(^|\.)whatsapp\.com$/ },
  { name: "Telegram", meaning: "Clicked a link shared on Telegram", re: /(^|\.)(t\.me|telegram\.org)$/ },

  { name: "Gmail", meaning: "Clicked a link in an email", re: /(^|\.)mail\.google\.com$/ },
  { name: "Outlook", meaning: "Clicked a link in an email", re: /(^|\.)(outlook\.(live|office|com)|outlook\.office365\.com)$/ },

  { name: "GitHub", meaning: "Clicked a link on GitHub", re: /(^|\.)github\.(com|io)$/ },
  { name: "Substack", meaning: "Clicked a link in a Substack post", re: /(^|\.)substack\.com$/ },
  { name: "Medium", meaning: "Clicked a link in a Medium post", re: /(^|\.)medium\.com$/ },
  { name: "Product Hunt", meaning: "Clicked a link on Product Hunt", re: /(^|\.)producthunt\.com$/ },
  { name: "Crunchbase", meaning: "Clicked a link on Crunchbase", re: /(^|\.)crunchbase\.com$/ },
  { name: "Notion", meaning: "Clicked a link in a Notion page", re: /(^|\.)notion\.(so|site)$/ },
];

/** What to call the source. The host itself when we have no better name for
 *  it, because a host we do not recognise is still a real place. */
export function referrerLabel(host: string): string {
  if (!host) return "Direct";
  const h = host.toLowerCase().replace(/^www\./, "");
  return SOURCES.find((s) => s.re.test(h))?.name ?? h;
}

/** One sentence saying what the row actually means, for the column beside it. */
export function referrerMeaning(host: string): string {
  if (!host) {
    // The row people ask about. It is not "we do not know": it is everything
    // that arrives with no referring page attached.
    return "Typed the address";
  }
  const h = host.toLowerCase().replace(/^www\./, "");
  return SOURCES.find((s) => s.re.test(h))?.meaning ?? `Clicked a link on ${h}`;
}
