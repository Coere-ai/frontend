import { createBatchTally, type ModelTally } from "./usage";

/**
 * Passes a batch's results through unchanged while tallying their usage,
 * and calls `onEnd` with the totals only when the whole stream has been
 * read. A reader who stops early or a stream that breaks never reaches
 * `flush`, so nothing is metered and the next full read meters instead.
 * The readable side closes only after `onEnd` settles, so the function
 * stays alive until the usage is written. When `onEnd` fails, the read
 * breaks instead of ending: the extension deletes a batch after one whole
 * read, and a batch deleted unmetered is charged its worst case, so a read
 * that was not metered must not pass for a whole one. The extension then
 * reads again, skips the items it has, and the metering is tried again.
 */
export function meteredResults(
  body: ReadableStream<Uint8Array>,
  onEnd: (totals: Map<string, ModelTally>) => Promise<void>,
): ReadableStream<Uint8Array> {
  const tally = createBatchTally();
  const meter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      tally.push(chunk);
      controller.enqueue(chunk);
    },
    async flush() {
      await onEnd(tally.end());
    },
  });
  return body.pipeThrough(meter);
}
