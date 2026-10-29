import { fakeStatus } from '@v2/apps/extension/src/console/testing/fake-memory-status'
import type { World } from '../../stage/world'

/**
 * What the dashboard's Settings page asks the extension, for Maya once her
 * memory is built (the film records with her memory in place): its status,
 * the library her three AIs filled, how long Cori's chats are kept, and the
 * library's size. Dev Tools starts off, so the rail holds neither
 * Benchmarks nor Evals until she turns it on.
 */
const PLATFORMS = ['chatgpt', 'claude', 'gemini'] as const
const DAY = 86_400_000
const NOW = Date.parse('2026-10-29T13:50:00Z')

const TITLES = [
  'Notion PM role',
  'PearX interview prep',
  'GitHub handles for the team',
  'Applying to Stripe',
  'History reading list',
  'PHYS 137 lab 1 done',
  'A coworker wedding',
  'Sparrowhawk database upgrade',
  'SkipDoodle setup',
  'Lisbon trip',
  'Flight times for the trip',
  'DATA 100 problem set due date',
]

const rows = TITLES.map((title, i) => {
  const platform = PLATFORMS[i % 3]!
  return { id: `${platform}:c${i + 1}`, platform, platformConvId: `c${i + 1}`, title, created: NOW - (i + 2) * DAY, updated: NOW - (i + 1) * DAY, messageCount: 6 + (i % 5) * 2, bytes: 4_000 + i * 900, hash: `h${i}`, archived: false, changedDuringRun: false }
})

export function setupConsole(world: World): void {
  // She has opened the dashboard before, so Cori said his hello then (console/cori/hello.ts).
  world.write('local', { 'coere.cori.hello': { at: NOW - 3 * DAY } })
  world
    .engine('memory.status', () =>
      fakeStatus('ready', {
        until: null,
        set: null,
        counts: { memories: 412, dueSoon: 6, review: 0, sourceChats: 38, sourceChatsBy: { chatgpt: 16, claude: 13, gemini: 9 }, held: 0, chatsRead: 38, chatsInLibrary: 38, failedJobs: 0, refusedJobs: 0 },
        spend: { monthMicros: 1_840_000, capMicros: 20_000_000 },
        poolSlots: { used: 0, capacity: 6 },
      } as never),
    )
    .engine('memory.buildEstimate', () => ({ chats: 38, seconds: 0, measured: true, progress: null }))
    // The voice models' status (a message with no type): Voice mode is not set up.
    .on('', () => null)
    .engine('memory.chat.keep', () => ({ keep: 'forever', cleared: 0 }))
    .engine('listConversations', () => ({ rows, total: rows.length }))
    .engine('stats', () => ({
      conversations: 38,
      chunks: 410,
      projects: 0,
      textBytes: 612_000,
      dbBytes: 4_800_000,
      byPlatform: { chatgpt: { conversations: 16, bytes: 260_000 }, claude: { conversations: 13, bytes: 214_000 }, gemini: { conversations: 9, bytes: 138_000 } },
    }))
}
