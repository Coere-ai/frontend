import { isUuid, notFound } from "@/lib/admin/http";
import { adminRoute } from "@/lib/admin/route";
import { loadUser } from "@/lib/admin/user-detail";

// GET /api/admin/users/<id>: one account's totals, month, memory file and devices.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">): Promise<Response> {
  const { id } = await ctx.params;
  return adminRoute("users/id", async () => (isUuid(id) ? ((await loadUser(id)) ?? notFound()) : notFound()));
}
