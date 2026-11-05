// A stand in for a Supabase project, for the screenshot tool only: the
// real migration in PGlite (with the db:check harness's stand ins for what
// Supabase provides) behind the REST, Auth and Storage routes supabase-js
// calls. The site talks to it exactly as it talks to Supabase, through
// SUPABASE_URL and its two keys, so no page code changes for a picture.

import { createServer } from "node:https";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { bootDatabase } from "../../db/harness.mjs";
import { runCert } from "../lib/tls.mjs";
import { createAuth, verify } from "./auth.mjs";
import { createRest, restError } from "./rest.mjs";
import { createStorage } from "./storage.mjs";

const MIGRATION = fileURLToPath(new URL("../../../supabase/migrations/20261103000000_coere.sql", import.meta.url));

export const SECRET_KEY = "sb_secret_screenshots_only_000000000000";
export const PUBLISHABLE_KEY = "sb_publishable_screenshots_only_0000000";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, x-upsert, x-client-info, cache-control, prefer, accept, accept-profile, content-profile, x-application-name",
};

/** Who a request acts as: the secret key, the publishable key alone, or a signed in person. */
function whoFor(headers) {
  const bearer = String(headers.authorization ?? "").replace(/^Bearer /i, "");
  if (bearer === SECRET_KEY || headers.apikey === SECRET_KEY) return { role: "service_role", claims: { role: "service_role" } };
  const claims = verify(bearer);
  if (claims) return { role: "authenticated", claims };
  return { role: "anon", claims: null };
}

/** Lets one request at a time near the database, since PGlite has one connection. */
function serial() {
  let tail = Promise.resolve();
  return (fn) => {
    const run = tail.then(fn, fn);
    tail = run.catch(() => {});
    return run;
  };
}

/**
 * Boots the database, runs the migration, and serves on `port` (0 picks
 * one) over https as localhost, with a certificate made for the run: the
 * extension PUTs the memory file to Storage's signed address and takes
 * only an https one. Answers { url, db, storage, passwords, tls, close },
 * where tls.certPath is for the site's NODE_EXTRA_CA_CERTS and tls.spki
 * for Chrome.
 */
export async function startFakeSupabase({ port = 0 } = {}) {
  const db = await bootDatabase();
  await db.exec(await readFile(MIGRATION, "utf8"));
  const passwords = new Map();
  const rest = await createRest(db);
  const auth = createAuth(db, passwords);
  const store = createStorage(db);
  const one = serial();
  const tls = runCert(["localhost", "127.0.0.1"]);

  const server = createServer({ key: tls.key, cert: tls.cert }, (req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const bytes = Buffer.concat(chunks);
      const url = new URL(req.url ?? "/", "http://fake");
      const method = req.method ?? "GET";
      const headers = req.headers;
      if (method === "OPTIONS") {
        if (process.env.FAKE_SUPABASE_LOG === "all") console.error(`[fake supabase] OPTIONS ${url.pathname}`);
        res.writeHead(204, CORS);
        res.end();
        return;
      }
      const isJson = String(headers["content-type"] ?? "").includes("json");
      let body = null;
      try {
        body = isJson && bytes.length ? JSON.parse(bytes.toString("utf8")) : null;
      } catch {
        body = null;
      }
      const who = whoFor(headers);
      if (process.env.FAKE_SUPABASE_LOG === "all") console.error(`[fake supabase] ${method} ${url.pathname}`);
      const answer = one(async () => {
        const p = url.pathname;
        try {
          if (p.startsWith("/rest/v1/rpc/")) return await rest.rpc(p.slice("/rest/v1/rpc/".length), body, who);
          if (p.startsWith("/rest/v1/")) return await rest.table(method, decodeURIComponent(p.slice("/rest/v1/".length)), url, headers, body, who);
          if (p.startsWith("/auth/v1/")) return await auth(method, p.slice("/auth/v1".length), url, headers, body);
          if (p.startsWith("/storage/v1/")) return await store.storage(method, decodeURIComponent(p.slice("/storage/v1".length)), url, headers, body, bytes);
          return { status: 404, body: { message: "not found" } };
        } catch (error) {
          if (process.env.FAKE_SUPABASE_LOG) console.error(`[fake supabase] ${method} ${p}`, error.message);
          return restError(error, who.role);
        }
      });
      void answer.then((r) => {
        const out = { ...CORS, ...(r.headers ?? {}) };
        if (r.raw) {
          res.writeHead(r.status, out);
          res.end(Buffer.from(r.raw));
        } else if (r.body === null || r.body === undefined) {
          res.writeHead(r.status, out);
          res.end();
        } else {
          res.writeHead(r.status, { ...out, "content-type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(r.body));
        }
      });
    });
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  const url = `https://localhost:${server.address().port}`;
  return {
    url,
    db,
    storage: store,
    passwords,
    tls,
    close: async () => {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(() => resolve()));
      await db.close();
      tls.dispose();
    },
  };
}
