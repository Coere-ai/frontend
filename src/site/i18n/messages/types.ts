import type { Widen } from "../types";
import type { en } from "./en";

/** Every language's messages: English's keys and lists, each string its own. */
export type Messages = Widen<typeof en>;
