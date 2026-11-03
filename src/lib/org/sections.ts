/**
 * The memory sections every Coere memory starts with, in the product's
 * order, so an admin can pick shared sections before any member has shared
 * one. Sections a member's memory adds are named by the graph itself.
 */
export const BASE_SECTIONS: ReadonlyArray<{ key: string; name: string }> = [
  { key: "personal", name: "Personal info" },
  { key: "people", name: "People" },
  { key: "work", name: "Work" },
  { key: "school", name: "School" },
  { key: "projects", name: "Projects" },
  { key: "plans", name: "Plans and deadlines" },
  { key: "preferences", name: "Preferences" },
  { key: "knowledge", name: "Information" },
  { key: "style", name: "Writing style" },
  { key: "tone", name: "Tone and voice" },
];

/** Every section to offer, base ones first, then any other the graph or the settings name, each once. */
export function sectionChoices(...more: ReadonlyArray<ReadonlyArray<{ key: string; name?: string } | string>>): Array<{ key: string; name: string }> {
  const out = new Map(BASE_SECTIONS.map((s) => [s.key, s.name]));
  for (const list of more)
    for (const s of list) {
      const key = typeof s === "string" ? s : s.key;
      if (!out.has(key)) out.set(key, typeof s === "string" ? key : (s.name ?? key));
    }
  return [...out].map(([key, name]) => ({ key, name }));
}
