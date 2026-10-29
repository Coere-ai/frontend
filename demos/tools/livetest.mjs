// node demos/tools/livetest.mjs <path> <seconds> <out prefix> [every ms]: signs in to the dev server, opens a live demo page, prints its console and errors, and saves a screenshot every `every` ms.
import { createRequire } from "node:module";
const require = createRequire("/home/user/frontend/package.json");
const p = require("puppeteer-core");
const [path, secs, out, every = "1000"] = process.argv.slice(2);
const b = await p.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
pg.on("console", (m) => { const t = m.text(); if (!/DevTools|HMR/.test(t)) console.log("console", m.type(), t.slice(0, 400)); });
pg.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 400)));
pg.on("requestfailed", (r) => console.log("failed", r.url().slice(0, 200)));
pg.on("response", (r) => { if (r.status() >= 400) console.log("status", r.status(), r.url().slice(0, 200)); });
await pg.goto("http://localhost:3000/access", { waitUntil: "networkidle0" });
await pg.type("input[name=user]", "tester"); await pg.type("input[name=password]", "s3cret-pass");
await Promise.all([pg.waitForNavigation(), pg.click("form button")]);
await pg.goto("http://localhost:3000" + path, { waitUntil: "load" });
const n = Math.round((Number(secs) * 1000) / Number(every));
for (let i = 0; i < n; i++) {
  await new Promise((r) => setTimeout(r, Number(every)));
  if (out) await pg.screenshot({ path: `${out}-${String(i).padStart(2, "0")}.png` });
}
await b.close();
