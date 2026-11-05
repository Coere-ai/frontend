// The admin panel's pictures: signed in with the USER and PASSWORD the run
// was started with, every page at 1440 wide, one account (Maya's) and one
// organization (Fernhill Creative) each with its knowledge graph opened,
// and Security after them, so it lists those two memory views.

const PAGES = [
  ["statistics", "/admin"],
  ["analytics", "/admin/analytics"],
  ["users", "/admin/users"],
  ["organizations", "/admin/organizations"],
  ["interested", "/admin/interested"],
  ["launch", "/admin/launch"],
  ["limits", "/admin/limits"],
  ["database", "/admin/database"],
  ["cost", "/admin/cost"],
];

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  // Each panel reads its data after the page draws.
  await page.waitForFunction(() => !/Loading/.test(document.body.innerText), null, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

export async function shootAdmin(browser, base, shooter, { user, password, mayaId, orgId, scale }) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: scale });
  const page = await context.newPage();
  await shooter.prepare(page);
  await page.goto(`${base}/admin`);
  await shooter.shot(page, "admin", "sign-in");
  await page.fill("#username", user);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await page.getByRole("button", { name: "Sign out" }).waitFor({ timeout: 30_000 });

  for (const [name, path] of PAGES) {
    await page.goto(`${base}${path}`);
    await settle(page);
    // Users lists every account; the picture keeps the first screens of the list.
    await shooter.shot(page, "admin", name, { full: true, ...(name === "launch" ? { still: true } : {}), ...(name === "users" ? { clip: { x: 0, y: 0, width: 1440, height: 2600 } } : {}) });
  }
  for (const [name, path] of [["user", `/admin/users/${mayaId}`], ["organization", `/admin/organizations/${orgId}`]]) {
    await page.goto(`${base}${path}`);
    await settle(page);
    await shooter.shot(page, "admin", name, { full: true });
    await page.getByRole("button", { name: "Open the knowledge graph" }).click();
    await page.waitForFunction(() => !/Loading the graph/.test(document.body.innerText), null, { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await shooter.shot(page, "admin", `${name}-graph`, { full: true });
  }
  // Security last, after the two graphs were opened, so its memory views list them.
  await page.goto(`${base}/admin/security`);
  await settle(page);
  await shooter.shot(page, "admin", "security", { full: true });
  await context.close();
}
