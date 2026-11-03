import "server-only";

import { supabase } from "@/lib/supabase";

import { MEMORY_BUCKET } from "./index-types";

/**
 * The `memory` bucket through the secret key (docs/accounts.md 10). Every
 * caller passes a path it built from an id it already checked, so nothing
 * here decides whose files are whose. Failures log the storage error's name,
 * never a path, which names a person.
 */

const bucket = () => supabase().storage.from(MEMORY_BUCKET);

/** Writes a JSON file in place and answers its size in bytes. */
export async function putJson(path: string, value: unknown): Promise<number> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const { error } = await bucket().upload(path, bytes, { contentType: "application/json", upsert: true, cacheControl: "0" });
  if (error) throw new Error(`storage write failed: ${error.name}`);
  return bytes.byteLength;
}

/** A JSON file, or null when there is none. */
export async function getJson<T>(path: string): Promise<T | null> {
  const { data, error } = await bucket().download(path);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return null;
  }
}

export async function getBytes(path: string): Promise<Uint8Array | null> {
  const { data, error } = await bucket().download(path);
  if (error || !data) return null;
  return new Uint8Array(await data.arrayBuffer());
}

/** The file's size from Storage's own record, or null when it is missing. */
export async function objectSize(path: string): Promise<number | null> {
  const { data, error } = await bucket().info(path);
  if (error || !data) return null;
  const size = Number((data as { size?: number }).size ?? NaN);
  return Number.isFinite(size) ? size : null;
}

export async function removePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await bucket().remove(paths);
  if (error) console.error("storage remove failed", error.name);
}

/** The names of the files directly in a folder. */
export async function listFolder(folder: string): Promise<string[]> {
  const { data, error } = await bucket().list(folder, { limit: 1000 });
  if (error || !data) return [];
  return data.filter((f) => f.id !== null).map((f) => f.name);
}

/**
 * Moves a staged file over the stored one. Storage refuses a move onto an
 * existing name, so the old file is removed and the move tried again.
 */
export async function moveOver(from: string, to: string): Promise<boolean> {
  const first = await bucket().move(from, to);
  if (!first.error) return true;
  await removePaths([to]);
  const second = await bucket().move(from, to);
  if (second.error) console.error("storage move failed", second.error.name);
  return !second.error;
}

/** A signed upload address for a new file, which lives 2 hours. */
export async function signedUpload(path: string): Promise<string | null> {
  const { data, error } = await bucket().createSignedUploadUrl(path);
  if (error || !data) {
    console.error("signed upload failed", error?.name);
    return null;
  }
  return data.signedUrl;
}

export async function signedDownload(path: string, seconds: number, fileName: string): Promise<string | null> {
  const { data, error } = await bucket().createSignedUrl(path, seconds, { download: fileName });
  if (error || !data) return null;
  return data.signedUrl;
}
