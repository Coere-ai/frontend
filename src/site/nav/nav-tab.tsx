import Link from "next/link";

/**
 * One navbar tab. Hovering draws a black line under the label that grows out
 * from the middle; the line stays while the tab's menu is open.
 */
export function NavTab({
  label,
  href,
  active,
  onOpen,
}: {
  label: string;
  href: string;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      aria-expanded={active}
      aria-controls="site-menu"
      className="group flex h-[72px] items-center px-4 text-[15px] text-neutral-950 outline-none"
    >
      <span className="relative py-1">
        {label}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-center bg-neutral-950 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
          }`}
        />
      </span>
    </Link>
  );
}
