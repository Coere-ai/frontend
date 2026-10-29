import type { ReactNode } from "react";
import { Icon, type IconProps } from "./icon";

/** One line drawing per industry, keyed by name so content files stay plain data. */
const paths = {
  sparkles: <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.9L12 18.5l-1.8-5.8-5.7-1.9L10.2 9 12 3.5ZM18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />,
  rocket: <path d="M14.5 4.5c3 0 5 2 5 5-1.5 4-5 6.5-7.5 7.5L7 12c1-2.5 3.5-6 7.5-7.5ZM7 12l-2.5.5L3.5 15l3.5.5M12 17l-.5 2.5L9 20.5 8.5 17M14.5 9.5h.01" />,
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
  bag: <path d="M5.5 8.5h13l-1 11.5h-11l-1-11.5ZM9 8.5V7a3 3 0 0 1 6 0v1.5" />,
  film: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M7.5 5v14M16.5 5v14M3.5 9.5h4M3.5 14.5h4M16.5 9.5h4M16.5 14.5h4" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IndustryIconName = keyof typeof paths;

export function IndustryIcon({ name, ...props }: IconProps & { name: IndustryIconName }) {
  return <Icon {...props}>{paths[name]}</Icon>;
}
