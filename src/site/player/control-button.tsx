import type { ReactNode } from "react";

/**
 * A round icon button on the dark control bar. The label is spoken by screen
 * readers and shown as the browser's tooltip, with the shortcut beside it.
 */
export function ControlButton({
  label,
  shortcut,
  pressed,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white ${
        pressed ? "text-white" : "text-white/85 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
