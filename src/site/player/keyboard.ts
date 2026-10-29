/** What a key press asks the player to do. */
export type PlayerAction =
  | { type: "toggle" }
  | { type: "seekBy"; seconds: number }
  | { type: "seekTo"; fraction: number }
  | { type: "speedStep"; step: 1 | -1 }
  | { type: "fullscreen" }
  | { type: "captions" }
  | { type: "chapters" };

type KeyLike = Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey">;

/**
 * The same shortcuts YouTube uses, so they feel familiar: space or k to play
 * and pause, j and l for ten seconds, the arrows for five, f for full screen,
 * c for captions, 0 to 9 to jump through the film, and the angle brackets
 * for speed. Presses with ctrl, alt or cmd belong to the browser.
 */
export function actionForKey(event: KeyLike): PlayerAction | null {
  if (event.ctrlKey || event.altKey || event.metaKey) return null;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (key === " " || key === "k") return { type: "toggle" };
  if (key === "j") return { type: "seekBy", seconds: -10 };
  if (key === "l") return { type: "seekBy", seconds: 10 };
  if (key === "ArrowLeft") return { type: "seekBy", seconds: -5 };
  if (key === "ArrowRight") return { type: "seekBy", seconds: 5 };
  if (key === "Home") return { type: "seekTo", fraction: 0 };
  if (key === "End") return { type: "seekTo", fraction: 1 };
  if (/^[0-9]$/.test(key)) return { type: "seekTo", fraction: Number(key) / 10 };
  if (key === ">" || key === ".") return { type: "speedStep", step: 1 };
  if (key === "<" || key === ",") return { type: "speedStep", step: -1 };
  if (key === "f") return { type: "fullscreen" };
  if (key === "c") return { type: "captions" };
  if (key === "m") return { type: "chapters" };
  return null;
}
