/**
 * Run once at deploy, with SUPABASE_URL and SUPABASE_SECRET_KEY set:
 *   npx tsx --conditions=react-server scripts/memory/sweep-sensitive.mts
 * Removes each stored memory copy that holds a sensitive section while its
 * account leaves sensitive memories out (src/lib/memory/sweep-sensitive.ts).
 * Prints counts only.
 */
import { sweepSensitiveCopies } from "@/lib/memory/sweep-sensitive";

const { checked, removed } = await sweepSensitiveCopies();
console.log(`checked ${checked} stored copies, removed ${removed}`);
