import { FakeDataServer } from "@v2/tests/fake-sites/server/fake-data-server";

/**
 * The replica site's own data API, served in the page. Coere reads a
 * site's chats the way it reads the real one's, through the site's API;
 * the films answer from coere-v2's FakeDataServer in Node, and a demo runs
 * the same server here, over the chats the page was built with.
 */
export function serveSiteData(host: string, platform: string): void {
  let server: FakeDataServer | null = null;
  const data = () => {
    if (server) return server;
    const chats = JSON.parse(document.getElementById("__demo_chats__")?.textContent ?? "[]");
    server = new FakeDataServer(platform as never, { conversations: chats });
    return server;
  };
  const origin = `https://${host}`;
  const real = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
    if (url.origin !== origin && url.origin !== location.origin) return real(input, init);
    if (!url.pathname.startsWith("/__coere_fake__/")) return real(input, init);
    const answer = await data().handleApi(init?.method ?? "GET", url);
    return new Response(answer.body as BodyInit, { status: answer.status, headers: { "content-type": answer.contentType, ...answer.headers } });
  };
}
