// Coere's dashboard, its own entry from coere-v2, in a demo tab, with the
// Memory page's own sheets in place. memory.css pulls page/*.css in with
// @import, which Vite's ?inline puts in place; the demo's text loader leaves
// the @import lines, which a style element ignores mid sheet, so the graph
// card, the search over it and the side sheets would draw unstyled. Here
// esbuild bundles memory.css whole beside this script (console.css, with the
// imports in place), and the page's sheet takes it where its @import lines
// stand, as Vite's build has it.
import '../../stage/tab/ext-setup'
import '@v2/apps/extension/src/entrypoints/console/main'
import '@v2/apps/extension/src/console/memory/memory.css'

const IMPORTS = /@import '\.\/page\/[\w-]+\.css';/g
const whole = fetch(new URL('console.css', document.currentScript instanceof HTMLScriptElement ? document.currentScript.src : location.href)).then((r) => r.text())

async function inline(): Promise<void> {
  const css = await whole
  for (const style of document.querySelectorAll('style')) {
    const text = style.textContent ?? ''
    if (!text.includes("@import './page/")) continue
    let first = true
    style.textContent = text.replace(IMPORTS, () => (first ? ((first = false), css) : ''))
  }
}
void inline()
new MutationObserver(() => void inline()).observe(document.head, { childList: true })
