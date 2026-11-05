// Serves the local dev site as https://www.coere.ai, for the dashboard
// pictures: the extension frames its Console only inside www.coere.ai and
// sends its account calls there, so the browser must reach the site under
// that name. Chrome maps the name to this proxy (--host-resolver-rules) and
// trusts its certificate by key hash (lib/tls.mjs).
//
// The dev server only hands its own scripts and live reload socket to its
// own origin, so for those the proxy says the request came from localhost.
// Pages and API calls keep www.coere.ai as their host and origin.

import { request } from "node:http";
import { createServer } from "node:https";
import { connect } from "node:net";
import { runCert } from "./tls.mjs";

export const SITE_HOST = "www.coere.ai";

/** Headers for the dev server: its own assets and socket see a localhost origin. */
function forwarded(req, target) {
  const headers = { ...req.headers, "x-forwarded-proto": "https", "x-forwarded-host": SITE_HOST };
  if (req.url.startsWith("/_next/") || req.url.startsWith("/__nextjs")) {
    if (headers.origin) headers.origin = target;
    if (headers.referer) headers.referer = `${target}/`;
    delete headers["sec-fetch-site"];
  }
  return headers;
}

export async function startHostProxy(targetPort) {
  const tls = runCert([SITE_HOST]);
  const target = `http://localhost:${targetPort}`;
  const server = createServer({ key: tls.key, cert: tls.cert }, (req, res) => {
    const up = request({ host: "127.0.0.1", port: targetPort, method: req.method, path: req.url, headers: forwarded(req, target) }, (r) => {
      res.writeHead(r.statusCode ?? 502, r.headers);
      r.pipe(res);
    });
    // The dev server can drop a request mid answer (a reload while it compiles); the browser simply sees it end.
    up.on("error", () => {
      if (!res.headersSent) res.writeHead(502);
      res.end();
    });
    req.pipe(up);
  });
  // The live reload socket: the upgrade request is passed on as raw bytes, then both ends are piped.
  server.on("upgrade", (req, socket, head) => {
    const up = connect(targetPort, "127.0.0.1", () => {
      const headers = forwarded(req, target);
      headers.host = `localhost:${targetPort}`;
      const lines = [`${req.method} ${req.url} HTTP/1.1`, ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`), "", ""];
      up.write(lines.join("\r\n"));
      up.write(head);
      up.pipe(socket);
      socket.pipe(up);
    });
    up.on("error", () => socket.destroy());
    socket.on("error", () => up.destroy());
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    port: server.address().port,
    spki: tls.spki,
    close: async () => {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(() => resolve()));
      tls.dispose();
    },
  };
}
