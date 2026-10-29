import type { ReactNode } from "react";
import { Icon, type IconProps } from "./icon";

/** One line drawing per industry, keyed by name so content files stay plain data. */
const paths = {
  chart: <path d="M4 19.5h16M6.5 16V11M11 16V7M15.5 16v-6M20 16V5" />,
  cpu: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
    </>
  ),
  bolt: <path d="M13 3.5 5.5 13.5h6l-1 7 7.5-10h-6l1-7Z" />,
  pulse: <path d="M3.5 12h4l2-5 4 10 2-5h5" />,
  cap: <path d="M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5ZM6.5 11.5v4c3 2.5 8 2.5 11 0v-4M21.5 9.5v5" />,
  scale: <path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6a2.5 2.5 0 0 0 5 0L5 7ZM19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5Z" />
    </>
  ),
  cart: <path d="M3.5 4.5h2.5l2 11h10l2-8H7M9.5 19.5h.01M17 19.5h.01" />,
  factory: <path d="M3.5 20V10.5l5 3v-3l5 3v-3l5 3V4.5h2V20h-17ZM7 17h2M11.5 17h2M16 17h2" />,
} satisfies Record<string, ReactNode>;

export type IndustryIconName = keyof typeof paths;

export function IndustryIcon({ name, ...props }: IconProps & { name: IndustryIconName }) {
  return <Icon {...props}>{paths[name]}</Icon>;
}
