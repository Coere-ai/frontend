/**
 * The Chrome logo in its own colours, for buttons that install Coere from the
 * Chrome Web Store. Each colour runs along a line that touches the white
 * ring, as on the real mark. Decorative: the button's words say what it does.
 */
export function ChromeMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M20.66 7A10 10 0 0 0 3.34 7L7.67 14.5A5 5 0 0 1 12 7Z" fill="#ea4335" />
      <path d="M3.34 7A10 10 0 0 0 12 22L16.33 14.5A5 5 0 0 1 7.67 14.5Z" fill="#34a853" />
      <path d="M12 22A10 10 0 0 0 20.66 7H12A5 5 0 0 1 16.33 14.5Z" fill="#fbbc04" />
      <circle cx="12" cy="12" r="5" fill="#fff" />
      <circle cx="12" cy="12" r="4" fill="#1a73e8" />
    </svg>
  );
}
