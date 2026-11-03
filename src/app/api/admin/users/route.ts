import { adminRoute } from "@/lib/admin/route";
import { loadUsers } from "@/lib/admin/users";

// GET /api/admin/users: every account with its plan, organization, devices,
// spend and memory size, and sign ups by day.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("users", loadUsers);
}
