/**
 * The memory index: what the server keeps beside a person's `.coere` file so
 * the dashboard never unzips a large file (docs/accounts.md 8.7). An
 * organization's index has the same shape, with the member who brought each
 * fact as `contributor` (14.2).
 */

export interface IndexSection {
  key: string;
  name: string;
}

export interface IndexEntity {
  id: string;
  kind: string;
  name: string;
  section: string;
  parent: string | null;
  importance: number;
}

export interface IndexFact {
  id: string;
  subject: string;
  under: string | null;
  kind: string;
  key: string | null;
  text: string;
  importance: number;
  status: string;
  sensitivity: string | null;
  first: string | null;
  last: string | null;
  /** How many chats back this memory. */
  sources: number;
  /** Only in an organization's index: the member who brought it. */
  contributor?: string;
}

export interface IndexRelation {
  id: string;
  from: string;
  type: string;
  to: string;
}

export interface IndexSource {
  id: string;
  platform: string;
  title: string;
  capturedAt: string | null;
  messages: number;
}

export interface IndexDocument {
  path: string;
  title: string;
}

export interface MemoryIndex {
  v: 1;
  digest: string;
  created: string;
  timeZone: string | null;
  self: string | null;
  sections: IndexSection[];
  entities: IndexEntity[];
  facts: IndexFact[];
  relations: IndexRelation[];
  sources: IndexSource[];
  documents: IndexDocument[];
  /** True when the index kept only the most important 50,000 facts. */
  truncated: boolean;
}

/** Where a person's and an organization's files sit in the `memory` bucket. */
export const MEMORY_BUCKET = "memory";
export const userMemoryPath = (userId: string) => `${userId}/memory.coere`;
export const userIndexPath = (userId: string) => `${userId}/index.json`;
export const userIncomingPrefix = (userId: string) => `${userId}/incoming/`;
export const orgIndexPath = (orgId: string) => `org/${orgId}/index.json`;
export const orgMemberPartPath = (orgId: string, userId: string) => `org/${orgId}/members/${userId}.json`;
export const orgPrefix = (orgId: string) => `org/${orgId}/`;
