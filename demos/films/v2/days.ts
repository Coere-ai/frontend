/** The film's days, as coere-v2's v2/data.ts sets them for a film made on Oct 29, 2026: it starts twelve days before, and the first wave of new chats is in six days later. */
const START = Date.UTC(2026, 9, 17);
const HOUR = 3_600_000;
export const DAYS = { start: START + 9 * HOUR, waveOne: START + 6 * 24 * HOUR + 18 * HOUR, today: START + 12 * 24 * HOUR + 17 * HOUR };
