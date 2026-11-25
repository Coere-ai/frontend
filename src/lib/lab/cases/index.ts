import type { LabCase, LabPair } from "../types";

import { greenbox } from "./greenbox";
import { ledgerly } from "./ledgerly";
import { parcelpoint } from "./parcelpoint";
import { shiftwise } from "./shiftwise";

/** Every case, by pair, in a fixed order the assignment counts on. */
export const LAB_PAIRS: Record<LabPair, readonly [LabCase, LabCase]> = {
  build: [shiftwise, ledgerly],
  strategy: [greenbox, parcelpoint],
};

export const LAB_CASES: readonly LabCase[] = [...LAB_PAIRS.build, ...LAB_PAIRS.strategy];

export function labCase(id: string): LabCase | null {
  return LAB_CASES.find((c) => c.id === id) ?? null;
}
