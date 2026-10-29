import { Icon, type IconProps } from "./icon";

/** Icons for the video player's controls. The play shapes are filled so they read at a glance. */

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />
  </Icon>
);

export const PauseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6.5" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" />
    <rect x="14" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" />
  </Icon>
);

export const ReplayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7" />
  </Icon>
);

export const BackTenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7" />
    <text x="12.3" y="15.2" fontSize="6.4" fontWeight="600" textAnchor="middle" fill="currentColor" stroke="none">
      10
    </text>
  </Icon>
);

export const ForwardTenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v3.7h-3.7" />
    <text x="11.7" y="15.2" fontSize="6.4" fontWeight="600" textAnchor="middle" fill="currentColor" stroke="none">
      10
    </text>
  </Icon>
);

export const CaptionsIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="M10.5 10.3a2 2 0 1 0 0 3.4M16.5 10.3a2 2 0 1 0 0 3.4" />
  </Icon>
);

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2.8" />
    <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
  </Icon>
);

export const ChaptersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 7h11M9 12h11M9 17h11" />
    <circle cx="4.75" cy="7" r="0.9" fill="currentColor" />
    <circle cx="4.75" cy="12" r="0.9" fill="currentColor" />
    <circle cx="4.75" cy="17" r="0.9" fill="currentColor" />
  </Icon>
);

export const FullscreenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 9V5.5a1 1 0 0 1 1-1H9M15 4.5h3.5a1 1 0 0 1 1 1V9M19.5 15v3.5a1 1 0 0 1-1 1H15M9 19.5H5.5a1 1 0 0 1-1-1V15" />
  </Icon>
);

export const ExitFullscreenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4.5V8a1 1 0 0 1-1 1H4.5M19.5 9H16a1 1 0 0 1-1-1V4.5M15 19.5V16a1 1 0 0 1 1-1h3.5M4.5 15H8a1 1 0 0 1 1 1v3.5" />
  </Icon>
);
