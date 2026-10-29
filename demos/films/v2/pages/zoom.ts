/**
 * A stand in for one line of coere-v2 the film needs changed (a fix for
 * coere-v2 to make in apps/extension/src/onboarding/build/paint.ts):
 * frameAround never lets the camera of the growing graph and of Cori's
 * finish go further out than 0.05, `Math.max(0.05, least, k)`. At a
 * person's scale (here 700 memories, which onboarding draws as about 1,300
 * points over a layout some 140,000 units across) that floor leaves the
 * camera on empty space between the sections, and both screens draw
 * nothing. In this page that one call gets a floor of 0.002, so the
 * camera fits the whole graph as it does for a small one; every other use
 * of Math.max is left as it is. Imported before onboarding's own code.
 */
const max = Math.max;
Math.max = function (...a: number[]): number {
  return a.length === 3 && a[0] === 0.05 ? max(0.002, a[1]!, a[2]!) : max(...a);
};
