// The dashboard's pictures: coere.ai/dashboard framing the extension's own
// Console (the fake v4 build from coere-v2, with Maya's chats and memory),
// one picture per section, the Account card in Settings, a chat open in
// the Library, and Organization as an admin and as a member. Every picture
// is the real Console inside the real host page.

import { connectMaya } from "../lib/maya-browser.mjs";
import { launchWithExtension } from "../lib/extension.mjs";

const SITE = "https://www.coere.ai";

/** Opens a dashboard address and waits until the framed Console has drawn its section. */
async function openSection(page, path) {
  const frame = page.frameLocator(`iframe[title="Coere"]`);
  // The dev server sometimes drops a load while it compiles, so a section that does not draw is loaded again.
  for (let attempt = 1; ; attempt++) {
    await page.goto(`${SITE}${path}`);
    try {
      await frame.getByRole("tablist", { name: "Sections" }).waitFor({ timeout: 40_000 });
      break;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
  await page.waitForTimeout(3500);
  return frame;
}

/** Scrolls the framed Console so `target` sits near the top. */
async function scrollTo(target, room = 48) {
  await target.evaluate((el, gap) => {
    el.scrollIntoView({ block: "start" });
    // A little room above, so the card the target opens shows its top edge.
    let box = el.parentElement;
    while (box && box.scrollHeight <= box.clientHeight) box = box.parentElement;
    (box ?? document.scrollingElement)?.scrollBy(0, -gap);
  }, room);
  await target.page().waitForTimeout(900);
}

export async function shootDashboard(playwright, shooter, { coereV2, proxy, supabaseSpki, memoryFile, fake, mayaId, now, scale }) {
  const browser = await launchWithExtension(playwright, { coereV2, proxy, supabaseSpki, viewport: { width: 1440, height: 1000 }, scale });
  try {
    await connectMaya(browser.context, memoryFile, now);
    const page = await browser.context.newPage();
    await shooter.prepare(page);
    const s = (name, o) => shooter.shot(page, "dashboard", name, o);

    await openSection(page, "/dashboard");
    await s("home");

    let f = await openSection(page, "/dashboard/memory");
    await s("memory");
    // Room enough above the search box that the Graph and List switch beside it clears the page's header.
    await scrollTo(f.locator("input[type=search], [role=searchbox]").first(), 140);
    await s("memory-graph");

    f = await openSection(page, "/dashboard/library");
    await s("library");
    const chat = f.getByText("Bend shoot logistics").first();
    await chat.focus().catch(() => {});
    await chat.click({ timeout: 10_000 }).catch(async () => chat.press("Enter"));
    await page.waitForTimeout(1500);
    await s("library-chat");

    f = await openSection(page, "/dashboard/settings");
    await s("settings");
    await scrollTo(f.getByRole("heading", { name: "Account", exact: true }));
    await s("settings-account");

    await openSection(page, "/dashboard/statistics");
    await s("statistics");

    f = await openSection(page, "/dashboard/organization");
    // From the shared graph down, so its root shows with the members' cards under it.
    await scrollTo(f.getByRole("heading", { name: "Shared memory", exact: true }));
    await s("organization-admin");
    await scrollTo(f.getByRole("heading", { name: "Members", exact: true }));
    await s("organization-admin-members");

    // The same section for a member: Maya's role set to member, as an admin's Make member would.
    await fake.db.query("update public.org_members set role = 'member' where user_id = $1", [mayaId]);
    f = await openSection(page, "/dashboard/organization");
    await s("organization-member");
    await fake.db.query("update public.org_members set role = 'admin' where user_id = $1", [mayaId]);

    // Phone width.
    await page.setViewportSize({ width: 390, height: 844 });
    await openSection(page, "/dashboard");
    await s("phone-home");
  } finally {
    await browser.close();
  }
}
