"use client";

import { useTransform, type MotionValue } from "motion/react";

/**
 * Maps a value through points, linearly between them and flat past the ends.
 * input must not decrease.
 */
export function ramp(value: number, input: readonly number[], output: readonly number[]): number {
  if (value <= input[0]) return output[0];
  for (let i = 1; i < input.length; i += 1) {
    if (value <= input[i]) {
      const span = input[i] - input[i - 1] || 1;
      return output[i - 1] + ((value - input[i - 1]) / span) * (output[i] - output[i - 1]);
    }
  }
  return output[output.length - 1];
}

/**
 * Like useTransform with ranges, but always computed in JavaScript. Motion
 * hands range based opacity and transforms to the browser's scroll timeline,
 * which reads progress over a different range than this pinned section, so
 * the story's values come out wrong there. A function transform never does.
 */
export function useRamp(progress: MotionValue<number>, input: readonly number[], output: readonly number[]) {
  return useTransform(progress, (value) => ramp(value, input, output));
}

/** useRamp for CSS lengths, such as "42%". */
export function useRampPercent(progress: MotionValue<number>, input: readonly number[], output: readonly number[]) {
  return useTransform(progress, (value) => `${ramp(value, input, output)}%`);
}
