import { isUuid, notFound } from "@/lib/admin/http";
import { loadOrg } from "@/lib/admin/org-detail";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/organizations/<id>: its settings, totals, members and open invites.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/organizations/[id]">): Promise<Response> {
  const { id } = await ctx.params;
  return adminRoute("organizations/id", async () => (isUuid(id) ? ((await loadOrg(id)) ?? notFound()) : notFound()));
}
