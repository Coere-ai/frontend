import { loadOrgs } from "@/lib/admin/orgs";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/organizations: every organization with its plan and totals.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("organizations", loadOrgs);
}
