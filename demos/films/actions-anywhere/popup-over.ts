import type { DemoHost } from "../../stage/host";
import type { PagesBridge } from "./bridge";

/**
 * The toolbar popup as Chrome draws it: a 360 by 600 box hung under
 * Coere's toolbar button at the window's right, over the page it was opened
 * on, with Chrome's own shadow. This tab covers the stage and lets the
 * page show through around the box. The popup asks Chrome for the active
 * tab of its window, and gets the page under it, as Chrome answers a
 * popup opened there (the toolbar press grants activeTab for it).
 */
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const bridge = host.extra.anywhere as PagesBridge;

const tabs = (window as unknown as { chrome: { tabs: Record<string, unknown> } }).chrome.tabs;
tabs.query = async (q: { active?: boolean }) => {
  const t = q?.active ? bridge.activeTab() : null;
  return t ? [{ id: t.id, windowId: 1, url: t.url, active: true, index: 0, pinned: false, highlighted: true, incognito: false, selected: true, discarded: false, autoDiscardable: true, groupId: -1 }] : [];
};
// Closing the popup is the film's to do, when it cuts away.
window.close = () => undefined;

const style = document.createElement("style");
style.textContent = `
html,body{background:transparent!important;width:100%;height:100%;overflow:hidden;color-scheme:normal}
#app{position:absolute;left:1068px;top:6px;width:360px;height:600px;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(8,14,36,.12),0 12px 40px rgba(8,14,36,.22)}
`;
document.head.append(style);
