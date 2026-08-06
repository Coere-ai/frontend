/** 10400 becomes "10,400". */
export function formatTokens(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

/** 252 becomes "4m 12s", 5 becomes "5s". */
export function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;
  return `${Math.floor(total / 60)}m ${total % 60}s`;
}
