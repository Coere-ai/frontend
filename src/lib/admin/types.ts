import type { MemoryView } from "@/lib/memory/view";
import type { OrgAccess } from "@/lib/org/access";

import type { DayPoint } from "./by-day";
import type { DayTotals } from "./totals";

/**
 * What each admin data route answers. The panels are client components and
 * the loaders hold the secret key, so the shapes live here, apart from both.
 * Every figure is a number; money is integer micro dollars.
 */

export interface StatisticsPayload {
  totals: {
    accounts: number;
    organizations: number;
    costMicros: number;
    tokensUsed: number;
    tokensSaved: number;
    memories: number;
    chats: number;
    contextImports: number;
    transfers: number;
    storageBytes: number;
    requests: number;
  };
  daily: DayTotals[];
  topAccounts: { id: string; name: string; tokensSaved: number }[];
  topOrgs: { id: string; name: string; tokensSaved: number }[];
}

export interface UserRow {
  id: string;
  email: string | null;
  username: string | null;
  plan: string;
  status: string;
  org: { id: string; name: string; role: string } | null;
  createdAt: string;
  lastSeenAt: string | null;
  devices: number;
  monthCostMicros: number;
  monthRequests: number;
  /** user_totals.cost_micros, what the lifetime limit is checked against. */
  lifetimeCostMicros: number;
  /** The account's own limits; null means the plan's. */
  monthlyLimitMicros: number | null;
  lifetimeLimitMicros: number | null;
  tokensSaved: number;
  memoryBytes: number;
}

export interface PlanRow {
  id: string;
  name: string;
  monthlyLimitMicros: number;
  /** Null means no lifetime limit. */
  lifetimeLimitMicros: number | null;
}

export interface UsersPayload {
  rows: UserRow[];
  /** True when there were more accounts than the panel reads. */
  capped: boolean;
  signups: DayPoint[];
  plans: PlanRow[];
}

export interface Totals {
  requests: number;
  tokensUsed: number;
  costMicros: number;
  tokensSaved: number;
  contextImports: number;
  transfers: number;
  extractions: number;
  coriChats: number;
  actionRuns: number;
  memories: number;
  entities: number;
  links: number;
  chats: number;
  storageBytes: number;
}

export interface DeviceRow {
  id: string;
  name: string;
  hint: string;
  version: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
}

export interface UserDetailPayload {
  user: UserRow & { displayName: string | null; memorySync: boolean; includeSensitive: boolean };
  totals: Totals;
  month: { costMicros: number; requests: number; inputTokens: number; outputTokens: number };
  memory: { bytes: number; memories: number; chats: number; uploadedAt: string | null } | null;
  devices: DeviceRow[];
  plans: PlanRow[];
}

export interface OrgRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  members: number;
  tokensSaved: number;
  memories: number;
  chats: number;
  costMicros: number;
  createdAt: string;
}

export interface OrgsPayload {
  rows: OrgRow[];
  plans: PlanRow[];
}

export interface OrgMemberRow {
  userId: string;
  name: string;
  email: string | null;
  role: "admin" | "member";
  /** Their own access, or null when the organization's default applies. */
  access: OrgAccess | null;
  effective: OrgAccess;
  shareMemory: boolean;
  addedBy: string;
  joinedAt: string;
  tokensSaved: number;
  memories: number;
  costMicros: number;
}

export interface OrgDetailPayload {
  org: OrgRow & { sharedSections: string[]; defaultAccess: OrgAccess };
  totals: Totals & { members: number };
  members: OrgMemberRow[];
  invites: { id: string; name: string; role: string; createdAt: string; expiresAt: string }[];
  sections: { key: string; name: string }[];
  plans: PlanRow[];
}

export interface WaitlistPayload {
  rows: { email: string; source: string | null; createdAt: string }[];
  total: number;
  byDay: DayPoint[];
}

export interface TableStat {
  schema: string;
  name: string;
  rows: number;
  bytes: number;
  rls: boolean;
  policies: number;
}

export interface BucketStat {
  bucket: string;
  objects: number;
  bytes: number;
}

export interface DatabasePayload {
  tables: TableStat[];
  buckets: BucketStat[];
  /** The largest folders in the memory bucket, named by account email where there is one. */
  folders: { folder: string; label: string; objects: number; bytes: number }[];
}

export interface SecurityPayload {
  days: number;
  daily: { date: string; signIns: number; failures: number; adminFailures: number }[];
  counts: Record<string, number>;
  rlsOff: TableStat[];
  memoryViews: { at: string; label: string }[];
}

export interface CostPayload {
  daily: DayPoint[];
  monthMicros: number;
  last24hMicros: number;
  byModel: { model: string; costMicros: number; requests: number }[];
  byAccount: { id: string | null; name: string; costMicros: number; requests: number }[];
  storageBytes: number;
  storageMonthMicros: number;
}

export interface MemoryPayload {
  center: string;
  names: Record<string, string>;
  view: MemoryView | null;
}
