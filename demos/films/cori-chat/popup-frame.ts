/** Chrome's toolbar popup: 360 by 600, its top right corner under Coere's toolbar button (actions/stage.ts POPUP). */
const POPUP = { width: 360, height: 600, x: 1440 - 360 - 12, y: 6 };

const style = document.createElement("style");
style.textContent = `
html,body{width:100%;height:100%}
#under{position:fixed;inset:0;width:1440px;height:900px;border:0;pointer-events:none}
#app{position:fixed;left:${POPUP.x}px;top:${POPUP.y}px;width:${POPUP.width}px;height:${POPUP.height}px;border-radius:10px;overflow:hidden;background:var(--coere-bg,#fff);box-shadow:0 0 0 1px rgba(8,14,36,.12),0 12px 40px rgba(8,14,36,.22)}
`;
document.head.append(style);

const under = document.createElement("iframe");
under.id = "under";
under.src = "gmail.html";
under.tabIndex = -1;
under.setAttribute("aria-hidden", "true");
document.body.prepend(under);
