import { readInterestList } from "@/lib/admin/interest-lists";
import { loadInterested } from "@/lib/admin/interested";
import { json } from "@/lib/admin/http";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/interested?list=developers|connect|teams: one list, its
// count by day, and how many each list holds.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return adminRoute("interested", async () => {
    const list = readInterestList(new URL(request.url).searchParams.get("list"));
    return list ? loadInterested(list) : json(400, { error: "Unknown list." });
  });
}
