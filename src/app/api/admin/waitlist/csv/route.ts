import { download } from "@/lib/admin/http";
import { adminRoute } from "@/lib/admin/route";
import { waitlistCsv } from "@/lib/admin/waitlist";

// GET /api/admin/waitlist/csv: the whole waitlist as a file to save.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("waitlist/csv", async () => download(await waitlistCsv(), "coere-developer-waitlist.csv", "text/csv"));
}
