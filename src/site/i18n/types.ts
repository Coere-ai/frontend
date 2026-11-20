/**
 * The shape every language's messages must have: English's own shape with
 * each string widened to any string. Arrays keep their length, so a
 * language that drops or adds a question to a list fails the type check,
 * as a missing key does.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : { readonly [K in keyof T]: Widen<T[K]> };

/**
 * Fills the {name} holes in a message. A hole with no value stays as it is,
 * so a mistake shows on the page instead of an empty space.
 */
export function format(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (hole, name: string) => (name in values ? String(values[name]) : hole));
}
