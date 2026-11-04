"use server";

import { revalidatePath, updateTag } from "next/cache";

import { adminAction, done, refused, type AdminResult } from "@/lib/admin/action";
import { checkLaunchInput } from "@/lib/launch/moment";
import { LAUNCH_PATHS, LAUNCH_TAG, saveLaunch } from "@/lib/launch/store";
import { isLaunchProduct, launchCopy } from "@/site/content/launch";

/**
 * Saves one product's launch countdown from /admin/launch. It re-checks the
 * admin session, the moment and the switch, refuses a moment in the past
 * unless the operator confirmed it, then expires the cached read and both
 * coming soon pages so the change shows at once.
 */
export async function saveLaunchAction(product: string, input: { at: unknown; show: unknown; confirmPast: unknown }): Promise<AdminResult> {
  return adminAction("saveLaunch", async () => {
    if (!isLaunchProduct(product)) return refused("That product does not exist. Reload the page.");
    const form = input && typeof input === "object" ? input : { at: null, show: null, confirmPast: null };
    const checked = checkLaunchInput(form, Date.now());
    if (!checked.ok) return refused(checked.error);
    await saveLaunch(product, checked.setting);
    updateTag(LAUNCH_TAG);
    for (const path of LAUNCH_PATHS) revalidatePath(path);
    const page = launchCopy[product].path;
    if (!checked.setting.show) return done(`Saved. ${page} says coming soon without the timer.`);
    return done(checked.past ? `Saved. ${page} now says ${launchCopy[product].name} is here.` : `Saved. ${page} counts to the new moment now.`);
  });
}
