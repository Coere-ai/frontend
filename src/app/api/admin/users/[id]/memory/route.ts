import { isUuid, notFound } from "@/lib/admin/http";
import { loadUserMemory } from "@/lib/admin/memory-view";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/users/<id>/memory: the account's knowledge graph. Each call
// writes an admin_viewed_memory event, so the page asks for it only when the
// operator opens the graph, and never polls it.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: RouteContext<"/api/admin/users/[id]/memory">): Promise<Response> {
  const { id } = await ctx.params;
  return adminRoute("users/id/memory", async () => (isUuid(id) ? ((await loadUserMemory(id, req.headers)) ?? notFound()) : notFound()));
}
