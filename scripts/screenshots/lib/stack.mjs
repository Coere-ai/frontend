// Starts everything the pictures need, in order: the fake Supabase with its
// made up world, the site on next dev pointed at it, and the proxy that
// serves the site as https://www.coere.ai. stop() undoes all of it.

import { randomBytes } from "node:crypto";
import { PUBLISHABLE_KEY, SECRET_KEY, startFakeSupabase } from "../fake-supabase/server.mjs";
import { seed } from "../seed/index.mjs";
import { startHostProxy } from "./host-proxy.mjs";
import { startNext } from "./next.mjs";

export async function startStack({ port, user, password, now = Date.now() }) {
  const fake = await startFakeSupabase();
  const world = await seed(fake, now);
  const next = await startNext({
    port,
    env: {
      SUPABASE_URL: fake.url,
      NODE_EXTRA_CA_CERTS: fake.tls.certPath,
      SUPABASE_SECRET_KEY: SECRET_KEY,
      SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY,
      SECURITY_SALT: randomBytes(24).toString("hex"),
      USER: user,
      PASSWORD: password,
      // next.config.ts turns the dev badge off for a screenshot run.
      COERE_SCREENSHOTS: "1",
    },
  });
  const proxy = await startHostProxy(port);
  return {
    fake,
    world,
    next,
    proxy,
    stop: async () => {
      await proxy.close();
      await next.stop();
      await fake.close();
    },
  };
}
