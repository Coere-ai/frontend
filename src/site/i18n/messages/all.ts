import type { Locale } from "../locales";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ja } from "./ja";
import { nl } from "./nl";
import type { Messages } from "./types";

/** Every language's messages, for the server and the tests. */
export const allMessages: Record<Locale, Messages> = { en, es, fr, nl, ja };
