/**
 * What an extension page in this film needs beyond the shared setup: the
 * dashboard's own address leads to this film's console.html (onboarding's
 * Show me around and Open the dashboard go there), and the tabs Extract
 * all opened answer Chrome's questions about them through the World, the
 * way the real tabs would.
 */
import type { DemoHost } from "../../../stage/host";

const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tab = (frameElement as HTMLIFrameElement).dataset.tab ?? "";
type Reply = { ok: boolean; result?: unknown };
const ask = (type: string, extra: Record<string, unknown>) => host.world.handle({ type, ...extra }, tab) as Promise<Reply>;

const c = (window as unknown as { chrome: { runtime: Record<string, unknown>; tabs: Record<string, unknown> } }).chrome;
const getURL = c.runtime.getURL as (p: string) => string;
c.runtime.getURL = (path: string) => (/^\/?console\.html$/.test(path) ? new URL("console.html", location.href).pathname : getURL(path));
c.tabs.get = async (id: number) => {
  const r = await ask("demo.tab", { tabId: id });
  if (!r.result) throw new Error("No tab with id: " + id);
  return r.result;
};
c.tabs.getCurrent = async () => ({ id: 1, windowId: 1 });
const send = c.tabs.sendMessage as (id: number, m: unknown) => unknown;
c.tabs.sendMessage = async (id: number, m: { type?: string }) => (m?.type === "run.state" ? ask("demo.runState", { tabId: id }) : send(id, m));
