// The public site's pictures, signed out, at 1440 wide (the whole page
// when it is long) and a few at 390, plus the account pages: sign in,
// sign up, the connect page, /account and /sign-out.

import { MAYA } from "../seed/people.mjs";

const PRODUCTS = ["connect", "solutions", "forge", "agents"];
const INDUSTRIES = ["finance", "technology", "commerce", "consumer", "manufacturing", "energy", "education", "legal"];
const HOME_SECTIONS = ["ais", "products", "solves", "blog"];

async function open(page, base, path) {
  await page.goto(`${base}${path}`, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
}

export async function shootSite(browser, base, shooter, { scale }) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: scale });
  const page = await context.newPage();
  await shooter.prepare(page, { allNear: true });
  // Whole pages wait for their films to start, and the countdown pages are taken still.
  // What Coere solves on the home page settles on its stills too, so no scene is caught mid turn.
  const STILL = new Set(["home", "install", "try-teams"]);
  const s = (name, o) => shooter.shot(page, "site", name, { ...(o?.full ? { settle: 5000 } : {}), ...(STILL.has(name) ? { still: true } : {}), ...o });

  await open(page, base, "/");
  await s("home", { full: true });
  await s("home-hero");
  // The sticky navbar would sit over the top of each section picture, so it steps aside for them.
  // The hero steps aside too: every part counts as on screen here, so its moving WebGL backgrounds would
  // keep drawing and starve the frames an element picture waits on.
  const bar = await page.addStyleTag({ content: "body > header, header.sticky { visibility: hidden !important; } section#hero { display: none !important; }" });
  for (const id of HOME_SECTIONS) {
    const el = page.locator(`section#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    // What Coere solves plays its scenes in turn; its pictures are the stills they settle on, without Coere and then with it.
    await s(`home-${id}`, { element: el, ...(id === "solves" ? { still: true, settle: 1500 } : {}) });
    if (id === "solves") {
      await page.getByRole("tab", { name: "With Coere" }).click();
      await s("home-solves-coere", { element: el, still: true, settle: 1500 });
      await page.getByRole("tab", { name: "Without Coere" }).click();
    }
  }
  await bar.evaluate((node) => node.remove());
  // The home hero in each of the other languages, and the language menu open over the Japanese one.
  for (const lang of ["es", "fr", "nl", "ja"]) {
    await open(page, base, `/${lang}`);
    await s(`home-hero-${lang}`, { still: true });
  }
  await page.locator('header button[aria-haspopup="menu"]').first().click();
  await page.locator('[role="menu"]').waitFor();
  await s("language-menu", { still: true });
  await page.keyboard.press("Escape");
  for (const slug of PRODUCTS) {
    await open(page, base, `/products/${slug}`);
    await s(`product-${slug}`, { full: true });
  }
  await open(page, base, "/industries");
  await s("industries", { full: true });
  for (const slug of INDUSTRIES) {
    await open(page, base, `/industries/${slug}`);
    await s(`industry-${slug}`);
  }
  await open(page, base, "/pricing");
  await s("pricing", { full: true });
  // About, down to where its team starts: no real person's name or photo goes into a picture.
  await open(page, base, "/about");
  const team = await page.locator("section#team").evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));
  await s("about", { full: true, clip: { x: 0, y: 0, width: 1440, height: team } });
  // The blog with the newest post in its hero, that post, and careers.
  for (const [name, path] of [["blog", "/blog"], ["blog-post", "/blog/introducing-coere-connect"], ["careers", "/careers"]]) {
    await open(page, base, path);
    await s(name, { full: true });
  }
  for (const [name, path] of [["resources", "/resources"], ["developer-waitlist", "/developers/waitlist"], ["install", "/install"], ["try-teams", "/try-teams"], ["privacy", "/privacy"], ["portable-ai-memory", "/portable-ai-memory"]]) {
    await open(page, base, path);
    await s(name, { full: true });
  }

  // The privacy policy's first screen, for the README; privacy.webp is the whole policy.
  await open(page, base, "/privacy");
  await s("privacy-top");

  await open(page, base, "/resources/endpoints");
  await s("resources-endpoints");

  // Sign in and sign up: a username and a password, the username typed as a person mid way through.
  await open(page, base, "/sign-in");
  await page.getByLabel("Username").fill(MAYA.username);
  await s("sign-in");
  await open(page, base, "/sign-up");
  await page.getByLabel("Username").fill("sam_rivera");
  await s("sign-up");

  // The connect page as the extension opens it, signed in as Maya.
  await open(page, base, "/sign-in");
  await page.getByLabel("Username").fill(MAYA.username);
  await page.getByLabel("Password", { exact: true }).fill(MAYA.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 }).catch(() => {});
  const ext = "kfpnhnhmcmhdhlbkdmlnoeiogdgnfoap";
  await open(page, base, `/connect?ext=${ext}&state=${"Q".repeat(21)}w&challenge=${"c".repeat(42)}Q&v=4.0.3`);
  await s("connect");
  // /account, signed in as Maya: what a device token may not do, from any browser.
  await open(page, base, "/account");
  await s("account", { full: true });
  await s("account-top");
  // /sign-out as a link from another site leaves it, waiting for its button. Typed, or from this site, it signs out at once.
  await page.goto("about:blank");
  await page.setContent(`<a href="${base}/sign-out">Sign out</a>`);
  await page.getByRole("link", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: "Sign out of Coere" }).waitFor({ timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await s("sign-out");
  // Without the extension, the dashboard says how to get it.
  await open(page, base, "/dashboard");
  // The host asks each allowed id with coere.hello before it says Coere is missing, which outlasts a fixed wait on a cold dev server.
  await page.getByRole("heading", { name: "Your dashboard is in Coere" }).waitFor({ timeout: 90_000 }).catch(() => {});
  await shooter.shot(page, "dashboard", "install");
  await context.close();

  // A few at phone width.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: scale, isMobile: true, hasTouch: true });
  const p = await phone.newPage();
  await shooter.prepare(p, { allNear: true });
  for (const [name, path] of [["phone-home", "/"], ["phone-product-connect", "/products/connect"], ["phone-pricing", "/pricing"], ["phone-install", "/install"], ["phone-sign-in", "/sign-in"], ["phone-about", "/about"], ["phone-blog", "/blog"]]) {
    await open(p, base, path);
    await shooter.shot(p, "site", name, { full: name === "phone-home", still: name === "phone-install" || name === "phone-home", settle: 3000 });
  }
  await phone.close();
}
