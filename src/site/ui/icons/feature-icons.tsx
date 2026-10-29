import type { ReactNode } from "react";
import { Icon, type IconProps } from "./icon";

/** One line drawing per capability, keyed by name so content files stay plain data. */
const paths = {
  graph: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="19" cy="6" r="1.8" />
      <circle cx="6" cy="19" r="1.8" />
      <circle cx="18.5" cy="18" r="1.8" />
      <path d="m6.4 7.2 3.8 3M17.6 7.2l-3.8 3M7.3 17.8l2.9-4M16.9 16.7l-3-3" />
    </>
  ),
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  sparkle: <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.9L12 18.5l-1.8-5.8-5.7-1.9L10.2 9 12 3.5Z" />,
  mic: <path d="M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v3.5" />,
  chat: <path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3.5v-3.5h0.5a2 2 0 0 1-2-2v-8Z" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  pen: <path d="M15.5 4.5 19.5 8.5 9 19H5v-4L15.5 4.5ZM13.5 6.5l4 4" />,
  cursor: <path d="M5 4.5 18.5 11l-6 1.5L10 18.5 5 4.5Z" />,
  columns: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.2 4.5v15M14.8 4.5v15" />
    </>
  ),
  gauge: <path d="M4 16.5a8 8 0 1 1 16 0M12 16.5l3.5-5M4 16.5h2M18 16.5h2" />,
  building: <path d="M5 20.5V5.5l7-2v17M12 8.5l7 2v10M3.5 20.5h17M8 8.5h1M8 12h1M8 15.5h1M15 13h1M15 16.5h1" />,
  folder: <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7Z" />,
  share: <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
    </>
  ),
  key: <path d="M14.5 4a5.5 5.5 0 1 1-4.6 8.5L4 18.5V21h3v-2h2v-2h2l1.4-1.4A5.5 5.5 0 0 1 14.5 4ZM16 8.5h.01" />,
  code: <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15" />,
  plug: <path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0v-3ZM12 16v4.5" />,
  shield: <path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-2.5Z" />,
  people: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.5c1.8.9 3 2.9 3 5.5" />,
} satisfies Record<string, ReactNode>;

export type FeatureIconName = keyof typeof paths;

export function FeatureIcon({ name, size = 26, ...props }: IconProps & { name: FeatureIconName }) {
  return <Icon size={size} {...props}>{paths[name]}</Icon>;
}
