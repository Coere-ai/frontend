// The Auth half of the fake Supabase: the GoTrue routes supabase-js calls
// for this site (password, email code, sign up, the session's user, sign
// out, and the admin reads), over auth.users in PGlite. Every email code
// is CODE, so the screenshot tool can type it. Sessions are HS256 tokens
// signed with a key made for this run; the REST half reads them back to
// act as the person.

import { createHmac, randomBytes, randomUUID } from "node:crypto";

/** The code every email "sends". */
export const CODE = "246810";

const SECRET = randomBytes(32);
const b64 = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");

function sign(payload) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  const mac = createHmac("sha256", SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${mac}`;
}

/** The claims of a token this fake signed, or null. */
export function verify(token) {
  const [head, body, mac] = String(token ?? "").split(".");
  if (!head || !body || !mac) return null;
  const want = createHmac("sha256", SECRET).update(`${head}.${body}`).digest("base64url");
  if (want !== mac) return null;
  const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  return claims.exp * 1000 > Date.now() ? claims : null;
}

function userJson(row) {
  const at = new Date(row.created_at).toISOString();
  return {
    id: row.id,
    aud: "authenticated",
    role: "authenticated",
    email: row.email,
    email_confirmed_at: row.email_confirmed_at ? new Date(row.email_confirmed_at).toISOString() : null,
    confirmed_at: row.email_confirmed_at ? new Date(row.email_confirmed_at).toISOString() : null,
    phone: "",
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: row.raw_user_meta_data ?? {},
    identities: [],
    created_at: at,
    updated_at: at,
    is_anonymous: false,
  };
}

const refreshTokens = new Map();

function session(row) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 7 * 24 * 3600;
  const user = userJson(row);
  const access = sign({ sub: row.id, role: "authenticated", aud: "authenticated", email: row.email, iat: now, exp: now + expiresIn, session_id: randomUUID() });
  const refresh = randomBytes(18).toString("base64url");
  refreshTokens.set(refresh, row.id);
  return { access_token: access, token_type: "bearer", expires_in: expiresIn, expires_at: now + expiresIn, refresh_token: refresh, user };
}

const fail = (status, code, msg) => ({ status, body: { code: status, error_code: code, msg, error: code, error_description: msg } });

export function createAuth(db, passwords) {
  async function byEmail(email) {
    const { rows } = await db.query("select * from auth.users where lower(email) = lower($1)", [String(email ?? "")]);
    return rows[0] ?? null;
  }
  async function byId(id) {
    const { rows } = await db.query("select * from auth.users where id = $1", [id]);
    return rows[0] ?? null;
  }

  return async function auth(method, path, url, headers, body) {
    const bearer = String(headers.authorization ?? "").replace(/^Bearer /i, "");
    if (method === "POST" && path === "/token") {
      const grant = url.searchParams.get("grant_type");
      if (grant === "password") {
        const row = await byEmail(body?.email);
        if (!row || passwords.get(row.email.toLowerCase()) !== body?.password) return fail(400, "invalid_credentials", "Invalid login credentials");
        return { status: 200, body: session(row) };
      }
      if (grant === "refresh_token") {
        const id = refreshTokens.get(body?.refresh_token);
        const row = id ? await byId(id) : null;
        return row ? { status: 200, body: session(row) } : fail(400, "refresh_token_not_found", "Invalid Refresh Token");
      }
      return fail(400, "unsupported_grant_type", "unsupported grant");
    }
    if (method === "POST" && path === "/otp") {
      const known = await byEmail(body?.email);
      if (!known && body?.create_user === false) return fail(422, "otp_disabled", "Signups not allowed for otp");
      if (!known) await db.query("insert into auth.users (email, raw_user_meta_data) values (lower($1), $2)", [body.email, JSON.stringify(body.data ?? {})]);
      return { status: 200, body: {} };
    }
    if (method === "POST" && path === "/verify") {
      if (body?.token !== CODE && !body?.token_hash) return fail(403, "otp_expired", "Token has expired or is invalid");
      const row = await byEmail(body?.email);
      if (!row) return fail(403, "otp_expired", "Token has expired or is invalid");
      await db.query("update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = $1", [row.id]);
      return { status: 200, body: session(await byId(row.id)) };
    }
    if (method === "POST" && path === "/signup") {
      if (await byEmail(body?.email)) return { status: 200, body: { ...userJson(await byEmail(body.email)), identities: [] } };
      const { rows } = await db.query("insert into auth.users (email, raw_user_meta_data) values (lower($1), $2) returning *", [body.email, JSON.stringify(body.data ?? {})]);
      passwords.set(rows[0].email, body.password);
      return { status: 200, body: userJson(rows[0]) };
    }
    if (method === "GET" && path === "/user") {
      const claims = verify(bearer);
      const row = claims ? await byId(claims.sub) : null;
      return row ? { status: 200, body: userJson(row) } : fail(401, "bad_jwt", "invalid JWT");
    }
    if (method === "PUT" && path === "/user") {
      const claims = verify(bearer);
      const row = claims ? await byId(claims.sub) : null;
      if (!row) return fail(401, "bad_jwt", "invalid JWT");
      if (body?.password) passwords.set(row.email.toLowerCase(), body.password);
      return { status: 200, body: userJson(row) };
    }
    if (method === "POST" && path === "/logout") return { status: 204, body: null };
    const admin = /^\/admin\/users\/([0-9a-f-]{36})$/.exec(path);
    if (admin && method === "GET") {
      const row = await byId(admin[1]);
      return row ? { status: 200, body: userJson(row) } : fail(404, "user_not_found", "User not found");
    }
    if (admin && method === "DELETE") {
      await db.query("delete from auth.users where id = $1", [admin[1]]);
      return { status: 200, body: {} };
    }
    if (method === "GET" && path === "/settings") return { status: 200, body: { external: { email: true }, disable_signup: false, mailer_autoconfirm: false } };
    return fail(404, "not_found", `no fake for ${method} ${path}`);
  };
}
