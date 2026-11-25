import { download } from "@/lib/admin/http";
import { labCsv, loadLabAdmin } from "@/lib/admin/lab";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/lab/csv: one row per student and task, for evals.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("lab/csv", async () => download(labCsv(await loadLabAdmin()), "coere-lab.csv", "text/csv"));
}
