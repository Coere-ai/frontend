// Makes the extension Maya's, the way she would: install opens the connect
// page, she signs in with her password and presses Connect Coere; then her
// chats go into the Library and her memory file is imported on the Memory
// page, as Import memory does. After that the site's dashboard frames a
// Console that holds her chats and memory.

import { libraryConversations } from "../maya/chats.mjs";
import { MAYA } from "../seed/people.mjs";
import { engineCall, tabMatching } from "./extension.mjs";

const CONNECT = /^https:\/\/www\.coere\.ai\/(sign-in|connect)/;
const ONBOARDING = /^chrome-extension:\/\/([a-p]{32})\/onboarding\.html/;

export async function connectMaya(context, memoryFile, now) {
  const tab = await tabMatching(context, CONNECT);
  await tab.waitForLoadState("load");
  await tab.getByRole("button", { name: "Use a password instead" }).click();
  await tab.getByLabel("Email or username").fill(MAYA.email);
  await tab.getByLabel("Password").fill(MAYA.password);
  await tab.getByRole("button", { name: "Sign in", exact: true }).click();
  await tab.waitForURL(/\/connect\?/, { timeout: 60_000 });
  // The connect page loads itself once as a whole document after a sign in (src/lib/connect/loaded-path.ts).
  await tab.waitForFunction(() => performance.getEntriesByType("navigation")[0]?.name.includes("/connect?"), null, { timeout: 30_000 });
  await tab.waitForLoadState("load");
  await tab.getByRole("button", { name: "Connect Coere" }).click();
  const onboarding = await tabMatching(context, ONBOARDING);
  const extensionId = ONBOARDING.exec(onboarding.url())[1];
  const consoleUrl = `chrome-extension://${extensionId}/console.html`;

  // Her chats, as Extract all would have saved them.
  await onboarding.goto(`${consoleUrl}?tab=home`);
  await onboarding.waitForTimeout(1500);
  await engineCall(onboarding, "upsertConversations", { convs: libraryConversations(now) });
  // The AIs she uses, chosen on Home's own cards.
  for (const id of ["chatgpt", "claude", "gemini"]) await onboarding.locator(`.cx-ai[data-platform="${id}"]`).getByRole("checkbox").check();

  // Her memory, imported from the file the way a person imports one.
  await onboarding.goto(`${consoleUrl}?tab=memory`);
  await onboarding.locator('input[type="file"][accept=".coere"]').setInputFiles(memoryFile, { timeout: 60_000 });
  const sheet = onboarding.getByRole("dialog", { name: "Import memory" });
  await sheet.waitFor({ timeout: 30_000 }).catch(() => {});
  await onboarding.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: 120_000 }).catch(() => {});
  await onboarding.waitForTimeout(3000);
  const close = sheet.getByRole("button", { name: "Close" });
  if (await close.isVisible().catch(() => false)) await close.click();
  // Every chat is read already: the memory came with the file, so nothing waits for a build.
  for (const platform of ["chatgpt", "claude", "gemini"]) {
    const ids = libraryConversations(now).filter((c) => c.platform === platform).map((c) => c.platformConvId);
    await engineCall(onboarding, "memory.skipChats", { platform, ids }).catch(() => null);
  }
  return { extensionId, consoleUrl, page: onboarding };
}
