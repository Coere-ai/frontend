// Fills the fake Supabase with the screenshots' made up world, in one call.

import { seedAccounts } from "./accounts.mjs";
import { seedOrgGraph } from "./org-graph.mjs";
import { seedSite } from "./site.mjs";
import { seedUsage } from "./usage.mjs";

/** Seeds everything and answers the people and organization ids the shots need. */
export async function seed(fake, now = Date.now()) {
  const world = await seedAccounts(fake.db, fake.passwords, now);
  await seedUsage(fake.db, world);
  await seedOrgGraph(fake.storage, world.people, world.orgId, now);
  await seedSite(fake.db, now);
  await fake.db.exec("analyze");
  return world;
}
