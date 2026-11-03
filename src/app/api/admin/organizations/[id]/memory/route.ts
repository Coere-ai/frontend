import { isUuid, notFound } from "@/lib/admin/http";
import { loadOrgMemory } from "@/lib/admin/memory-view";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/organizations/<id>/memory: the organization's merged graph.
// Each call writes an admin_viewed_memory event naming the organization.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: RouteContext<"/api/admin/organizations/[id]/memory">): Promise<Response> {
  const { id } = await ctx.params;
  return adminRoute("organizations/id/memory", async () => (isUuid(id) ? ((await loadOrgMemory(id, req.headers)) ?? notFound()) : notFound()));
}
