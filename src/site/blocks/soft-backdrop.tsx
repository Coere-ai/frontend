/**
 * The backdrop for heroes without an animation of their own: flat white,
 * or the flat near black of a page in the dark theme. The owner does not
 * want generic gradient washes, so the soft blue pools and the faint grid
 * that were here are gone; the component stays so each such hero keeps one
 * place to change its ground.
 */
export function SoftBackdrop() {
  return <div className="absolute inset-0 bg-white dark:bg-night" />;
}
