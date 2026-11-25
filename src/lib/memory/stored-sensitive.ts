import { buildIndex } from "./build-index";
import { openCoere } from "./coere-zip";

/**
 * Whether a stored `.coere` file holds anything sensitive by today's rule
 * (build-index.ts): a fact with a sensitivity, or anything in the Health,
 * Money, or Beliefs and values sections. A copy stored before that rule has
 * `includes_sensitive` false in its row when only its facts were checked, so
 * where the person left sensitive memories out, the file itself is read
 * again. No file holds nothing. A file that no longer opens cannot be shown
 * to be plain, so it counts as holding some.
 */
export function storedHoldsSensitive(bytes: Uint8Array | null): boolean {
  if (bytes === null) return false;
  const opened = openCoere(bytes);
  if (!opened.ok) return true;
  return buildIndex(opened.manifest, opened.files, { includeSensitive: false }).includesSensitive;
}
