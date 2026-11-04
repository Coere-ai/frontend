import { csvName, readInterestList } from "@/lib/admin/interest-lists";
import { interestedCsv } from "@/lib/admin/interested";
import { download, json } from "@/lib/admin/http";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/interested/csv?list=developers|connect|teams|all: a list,
// or every list with a product column, as a file to save.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return adminRoute("interested/csv", async () => {
    const raw = new URL(request.url).searchParams.get("list");
    const list = raw === "all" ? "all" : readInterestList(raw);
    if (!list) return json(400, { error: "Unknown list." });
    return download(await interestedCsv(list), csvName(list), "text/csv");
  });
}
