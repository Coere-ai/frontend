/**
 * chrome.tabs.get for an extension page in this film: the tabs Extract all
 * opens stand in the background, never filmed, and the World knows them
 * (extract.ts answers `demo.tab`), so onboarding's look at a run's tab gets
 * the tab, as the browser would give it, instead of nothing. The shared
 * stage's chrome answers every tabs call with nothing, and a tab of
 * nothing has no windowId to read.
 */
const chromeApi = (window as unknown as { chrome: { tabs: Record<string, unknown>; runtime: { sendMessage(m: unknown): Promise<{ ok: boolean; result: unknown }> } } }).chrome;
chromeApi.tabs.get = async (tabId: number) => {
  const reply = await chromeApi.runtime.sendMessage({ type: "demo.tab", tabId });
  if (!reply?.result) throw new Error(`No tab with id: ${tabId}.`);
  return reply.result;
};
