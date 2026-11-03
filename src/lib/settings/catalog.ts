import type { SyncedKey, SyncedSettings } from "./synced-keys";

/**
 * The synced settings the dashboard can change, with the same labels and
 * short explanations the extension's Settings uses, grouped as it groups
 * them. Each entry names one field of one synced key. A change is written
 * as that key's whole value: the extension's defaults, then what is
 * stored, then the change, so a key the extension never pushed still
 * reads complete. Pure, so the page, the server action and the tests agree.
 */

export type SettingValue = boolean | string | number;

export interface Choice {
  value: string | number;
  label: string;
  about?: string;
}

export interface SettingEntry {
  id: string;
  key: SyncedKey;
  path: string[];
  label: string;
  about?: string;
  choices?: Choice[];
  /** Fields set to true with the change, which tell the extension the person chose it. */
  marks?: string[][];
}

export interface SettingGroup {
  title: string;
  about?: string;
  entries: SettingEntry[];
}

/** The extension's own defaults for each key the page writes (coere-v2 lib/*.ts). Browser Use never carries `on` or `grantedAt`. */
export const DEFAULTS: Partial<Record<SyncedKey, Record<string, unknown>>> = {
  "coere.prefs": { v: 5, search: false, agent: true, agentDone: true, agentAlways: false, keys: { chat: "rightOption", search: "optionDouble" }, chosen: { agent: false, agentAlways: false } },
  "coere.run.settings": { v: 1, includeChats: true, includeProjects: true, includeArchived: false, includeBranches: false },
  "coere.memory.prefs": { v: 1, autosave: true, context: { mode: "auto", budget: 1500, standing: true, sensitive: false, skipRecent: false } },
  "coere.memory.recall": { v: 1, on: true },
  "coere.memorylinks": { v: 1, on: false },
  "coere.stripdisplay": { v: 1, always: false, hidden: false },
  "coere.fileupload": { v: 1, on: false, chars: 6000 },
  "coere.devtools": { v: 1, on: false },
  "coere.voice": { on: false, speak: true, rate: "normal" },
  "coere.browser_use": { level: "autonomous", model: "bolt", blocked: [] },
};

const sw = (id: string, key: SyncedKey, path: string[], label: string, about?: string, marks?: string[][]): SettingEntry => ({ id, key, path, label, about, marks });

export const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "Memory",
    entries: [
      sw("autosave", "coere.memory.prefs", ["autosave"], "Automatically save new chats", "Saves new chats and new messages on every AI site you have open."),
      sw("recall", "coere.memory.recall", ["on"], "Show memory in the search sheet"),
    ],
  },
  {
    title: "Add my context to chats",
    entries: [
      {
        id: "context-mode",
        key: "coere.memory.prefs",
        path: ["context", "mode"],
        label: "Add my context to chats",
        choices: [
          { value: "auto", label: "Auto", about: "Coere matches what you type and adds your context when you send, never in a chat the AI marks temporary. A line above the box shows what went in." },
          { value: "suggest", label: "Suggest", about: "The line shows what would go in. Press Tab or click it to add it to the box yourself." },
          { value: "manual", label: "Manual", about: "Nothing is matched as you type. Ask Cori or use search to bring context in." },
          { value: "off", label: "Off", about: "No matching and no line above the box." },
        ],
      },
      {
        id: "context-budget",
        key: "coere.memory.prefs",
        path: ["context", "budget"],
        label: "Most context to add",
        choices: [500, 1500, 3000].map((n) => ({ value: n, label: `${n.toLocaleString("en-US")} tokens` })),
      },
      sw("context-standing", "coere.memory.prefs", ["context", "standing"], "Add my standing instructions to each new chat"),
      sw("context-sensitive", "coere.memory.prefs", ["context", "sensitive"], "Include sensitive memories", "Lets context from memories marked sensitive go into your chats."),
      sw("context-skip", "coere.memory.prefs", ["context", "skipRecent"], "Skip what this AI got in the last 7 days"),
      sw("strip-always", "coere.stripdisplay", ["always"], "Always show Coere Memory Import", 'Keeps the Coere line on the chat box of AI sites even when nothing will be added. Then it reads "No memories to import".'),
      sw(
        "strip-hidden",
        "coere.stripdisplay",
        ["hidden"],
        "Hide Coere memory imports",
        "Never shows the Coere line on AI sites. Coere still adds your memory when you send, and the AI site still shows that block in your sent message.",
      ),
    ],
  },
  {
    title: "Search",
    entries: [sw("search", "coere.prefs", ["search"], "Search chats as I type", "Search chats opens by itself while you type in an AI's chat box.")],
  },
  {
    title: "Cori agent",
    entries: [
      sw("agent", "coere.prefs", ["agent"], "Use Cori agent", "Cori finds, saves and moves your chats on each AI site.", [["chosen", "agent"]]),
      sw("agent-always", "coere.prefs", ["agentAlways"], "Always show Cori", "Keeps Cori in the corner of each AI site. When off, Cori shows when you open his chat and leaves when you close it.", [["chosen", "agentAlways"]]),
      sw("agent-done", "coere.prefs", ["agentDone"], "Show Cori when a task finishes", "Cori opens the chat to say a task is done."),
    ],
  },
  {
    title: "Extract all",
    about: "What Extract all saves from each AI.",
    entries: [
      sw("run-chats", "coere.run.settings", ["includeChats"], "Chats"),
      sw("run-projects", "coere.run.settings", ["includeProjects"], "Projects"),
      sw("run-archived", "coere.run.settings", ["includeArchived"], "Archived chats"),
      sw("run-branches", "coere.run.settings", ["includeBranches"], "Alternate branches"),
    ],
  },
  {
    title: "Voice",
    about: "Voice mode itself is turned on in each browser, since it needs that computer's microphone.",
    entries: [
      sw("voice-speak", "coere.voice", ["speak"], "Speak Cori's replies", "Cori says his reply line out loud, never your memories or chats."),
      {
        id: "voice-rate",
        key: "coere.voice",
        path: ["rate"],
        label: "Voice speed",
        about: "How fast Cori talks.",
        choices: [
          { value: "slower", label: "Slower" },
          { value: "normal", label: "Normal" },
          { value: "faster", label: "Faster" },
        ],
      },
    ],
  },
  {
    title: "Browser Use",
    about: "Turning Browser Use on stays something you do in each browser.",
    entries: [
      {
        id: "browser-level",
        key: "coere.browser_use",
        path: ["level"],
        label: "Level",
        choices: [
          { value: "autonomous", label: "Autonomous", about: "Cori works on its own and asks first before sending to someone you didn't name or doing something you can't undo." },
          { value: "review", label: "Human Review", about: "You allow each step, such as pressing Send." },
        ],
      },
      {
        id: "browser-model",
        key: "coere.browser_use",
        path: ["model"],
        label: "Thinking model",
        about: "Bolt uses Haiku 5.5. Pro and Ultra use Sonnet 5.5.",
        choices: [
          { value: "bolt", label: "Bolt", about: "Fastest, and costs the least." },
          { value: "pro", label: "Pro", about: "Thinks more, which helps on sites Cori doesn't know." },
          { value: "ultra", label: "Ultra", about: "Thinks longest and costs the most." },
        ],
      },
    ],
  },
  {
    title: "Dev Tools",
    entries: [
      sw("devtools", "coere.devtools", ["on"], "Enable Dev Tools", "Shows Restart onboarding and Saved chats in Settings."),
      sw("memorylinks", "coere.memorylinks", ["on"], "Show memory links", "Draws the links between things on the Memory graph as dashed lines. Takes effect with Dev Tools on."),
      sw("fileupload", "coere.fileupload", ["on"], "File Upload (beta)", "Sends a long context to the AI as a file, with one line in your message that points to it. Takes effect with Dev Tools on."),
    ],
  },
];

const ENTRIES = new Map(SETTING_GROUPS.flatMap((g) => g.entries).map((e) => [e.id, e]));

export const findEntry = (id: string): SettingEntry | null => ENTRIES.get(id) ?? null;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const at = (value: unknown, path: readonly string[]): unknown => path.reduce<unknown>((v, k) => (isObject(v) ? v[k] : undefined), value);

/** Whether a value fits the entry: one of its choices, else a boolean. */
export function fits(entry: SettingEntry, value: unknown): value is SettingValue {
  return entry.choices ? entry.choices.some((c) => c.value === value) : typeof value === "boolean";
}

/** The entry's value: what is stored when it fits, else the extension's default. */
export function readEntry(settings: SyncedSettings, entry: SettingEntry): SettingValue {
  const stored = at(settings[entry.key], entry.path);
  if (fits(entry, stored)) return stored;
  const fallback = at(DEFAULTS[entry.key], entry.path);
  return fits(entry, fallback) ? fallback : false;
}

/** A deep copy with one field set, making the objects on the way. */
function setAt(value: Record<string, unknown>, path: readonly string[], to: unknown): Record<string, unknown> {
  const [head, ...rest] = path;
  if (head === undefined) return value;
  const inner = isObject(value[head]) ? (value[head] as Record<string, unknown>) : {};
  return { ...value, [head]: rest.length === 0 ? to : setAt(inner, rest, to) };
}

/** Lays `over` on `base`, objects merged key by key, so a stored record missing a nested field keeps its default. */
function layer(base: Record<string, unknown>, over: unknown): Record<string, unknown> {
  if (!isObject(over)) return { ...base };
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObject(v) && isObject(base[k]) ? layer(base[k] as Record<string, unknown>, v) : v;
  return out;
}

/** The whole value to store for the entry's key once it holds `value`. */
export function writeEntry(settings: SyncedSettings, entry: SettingEntry, value: SettingValue): Record<string, unknown> {
  let next = setAt(layer(DEFAULTS[entry.key] ?? {}, settings[entry.key]), entry.path, value);
  for (const mark of entry.marks ?? []) next = setAt(next, mark, true);
  return next;
}
