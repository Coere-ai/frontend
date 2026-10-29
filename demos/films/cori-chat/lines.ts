/**
 * What Maya asks Cori in this film, and where (tools/demo-video/cori-chat.demo.ts):
 * on the dashboard's Cori page, in the toolbar popup, and on Claude.
 * bake.mts asks them in Node; the film types them.
 */
export const ZONE = 'America/Los_Angeles'
/** The day her memory is read on, near the day the film was made. */
export const NOW = Date.parse('2026-10-29T13:00:00Z')

export const ASK_PAGE = 'when is my cs 162 project due?'
export const ASK_POPUP = 'what do you know about priya raman'
export const ASK_CLAUDE = 'what do you know about cs 162'

export const LINES = [
  { line: ASK_PAGE, asker: { surface: 'dashboard' } },
  { line: ASK_POPUP, asker: { surface: 'popup' } },
  { line: ASK_CLAUDE, asker: { surface: 'page', site: 'claude' } },
] as const
