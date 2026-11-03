import { randomBytes } from "node:crypto";

import { isRecord } from "@/lib/v1/body";

import { userIncomingPrefix } from "./index-types";

/**
 * The rules of the memory upload (docs/accounts.md 8.6): what the extension
 * may ask to upload, where a staged file goes, and which staged path a
 * commit may name. A staged path is checked against the caller's own
 * folder, so one account can never commit another's file.
 */

/** No memory file is ever over 64 MiB, whatever the plan. */
export const MEMORY_FILE_CAP = 64 * 1024 * 1024;

export function fileLimit(planStorageBytes: number): number {
  return Math.min(Math.max(0, planStorageBytes), MEMORY_FILE_CAP);
}

export interface UploadRequest {
  bytes: number;
  digest: string;
}

export function parseUploadRequest(body: unknown): UploadRequest | null {
  if (!isRecord(body)) return null;
  const { bytes, digest } = body;
  if (typeof bytes !== "number" || !Number.isInteger(bytes) || bytes < 1) return null;
  if (typeof digest !== "string" || !/^[0-9a-f]{64}$/.test(digest)) return null;
  return { bytes, digest };
}

/** A fresh staged path: `<user id>/incoming/<22 random characters>.coere`. */
export function stagedPath(userId: string): string {
  return `${userIncomingPrefix(userId)}${randomBytes(16).toString("base64url")}.coere`;
}

/** The commit's `path` when it is a staged file in the caller's own folder, else null. */
export function parseCommitPath(body: unknown, userId: string): string | null {
  if (!isRecord(body) || typeof body.path !== "string") return null;
  const prefix = userIncomingPrefix(userId);
  const path = body.path;
  if (!path.startsWith(prefix)) return null;
  return /^[A-Za-z0-9_-]{22}\.coere$/.test(path.slice(prefix.length)) ? path : null;
}
