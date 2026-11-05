// The Storage half of the fake Supabase, in memory: the object routes
// storage-js calls (upload, download, info, list, remove, signed upload
// and download addresses). Each object is mirrored into storage.objects in
// PGlite, so the admin panel's Storage totals count it. Signed addresses
// answer any origin, since the extension PUTs the memory file to one
// straight from its own pages.

import { randomBytes } from "node:crypto";

export function createStorage(db) {
  /** "bucket/path" to { bytes, type }. */
  const files = new Map();
  /** Signed tokens to "bucket/path". */
  const tokens = new Map();

  async function put(key, bytes, type) {
    files.set(key, { bytes, type: type || "application/octet-stream" });
    const [bucket, ...rest] = key.split("/");
    const name = rest.join("/");
    await db.query("delete from storage.objects where bucket_id = $1 and name = $2", [bucket, name]);
    await db.query("insert into storage.objects (bucket_id, name, metadata) values ($1, $2, $3)", [
      bucket,
      name,
      JSON.stringify({ size: bytes.byteLength, mimetype: type }),
    ]);
  }

  async function remove(key) {
    files.delete(key);
    const [bucket, ...rest] = key.split("/");
    await db.query("delete from storage.objects where bucket_id = $1 and name = $2", [bucket, rest.join("/")]);
  }

  const raw = (f) => ({ status: 200, raw: f.bytes, headers: { "content-type": f.type } });
  const missing = { status: 400, body: { statusCode: "404", error: "not_found", message: "Object not found" } };

  async function storage(method, path, url, headers, body, bytes) {
    let m;
    if ((m = /^\/object\/upload\/sign\/(.+)$/.exec(path))) {
      if (method === "POST") {
        const token = randomBytes(16).toString("hex");
        tokens.set(token, m[1]);
        return { status: 200, body: { url: `/object/upload/sign/${m[1]}?token=${token}`, token } };
      }
      if (method === "PUT") {
        if (tokens.get(url.searchParams.get("token")) !== m[1]) return { status: 400, body: { message: "invalid token" } };
        await put(m[1], bytes, headers["content-type"]);
        return { status: 200, body: { Key: m[1] } };
      }
    }
    if ((m = /^\/object\/sign\/(.+)$/.exec(path))) {
      if (method === "POST") {
        const token = randomBytes(16).toString("hex");
        tokens.set(token, m[1]);
        return { status: 200, body: { signedURL: `/object/sign/${m[1]}?token=${token}` } };
      }
      if (method === "GET") {
        const f = tokens.get(url.searchParams.get("token")) === m[1] ? files.get(m[1]) : null;
        return f ? raw(f) : missing;
      }
    }
    if ((m = /^\/object\/info\/(.+)$/.exec(path))) {
      const f = files.get(m[1]);
      return f ? { status: 200, body: { name: m[1], size: f.bytes.byteLength, content_type: f.type } } : missing;
    }
    if ((m = /^\/object\/list\/([^/]+)$/.exec(path)) && method === "POST") {
      const prefix = `${m[1]}/${String(body?.prefix ?? "").replace(/\/$/, "")}/`;
      const out = [];
      for (const [key, f] of files) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (rest.includes("/")) continue;
        out.push({ name: rest, id: key, metadata: { size: f.bytes.byteLength, mimetype: f.type } });
      }
      return { status: 200, body: out };
    }
    if ((m = /^\/object\/([^/]+)$/.exec(path)) && method === "DELETE") {
      const removed = [];
      for (const p of body?.prefixes ?? []) {
        const key = `${m[1]}/${p}`;
        if (files.has(key)) removed.push({ name: p });
        await remove(key);
      }
      return { status: 200, body: removed };
    }
    if ((m = /^\/object\/(?:authenticated\/)?(.+)$/.exec(path))) {
      if (method === "GET") {
        const f = files.get(m[1]);
        return f ? raw(f) : missing;
      }
      if (method === "HEAD") return files.has(m[1]) ? { status: 200, body: null } : { status: 404, body: null };
      if (method === "POST" || method === "PUT") {
        await put(m[1], bytes, headers["content-type"]);
        return { status: 200, body: { Key: m[1], Id: m[1] } };
      }
    }
    return { status: 404, body: { message: `no fake for ${method} ${path}` } };
  }

  return { storage, put, files };
}
