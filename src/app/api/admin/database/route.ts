import { loadDatabase } from "@/lib/admin/database";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/database: table sizes, Row Level Security and Storage totals.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("database", loadDatabase);
}
