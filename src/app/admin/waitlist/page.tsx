import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

/** The developer waitlist is now the Developers list on the Interested page. */
export default async function WaitlistPage() {
  await requireAdmin();
  redirect("/admin/interested?list=developers");
}
