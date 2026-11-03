import { Chrome } from "./browser-glyphs";
import { Unknown, box, line, type GlyphProps } from "./glyph-kit";

// Operating system marks and device classes, for the "What they use" table.
// The OS marks keep their brand colours for the reason browser-glyphs.tsx
// gives; a form factor has no vendor, so devices are plain line marks.

function Apple({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.2 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.5Z"
        fill="currentColor"
      />
      <path
        d="M14.2 5.8c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 0 2-.5 2.7-1.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Windows({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className} fill="#00a4ef">
      <path d="M3 5.6 10.8 4.5v7.1H3Z" />
      <path d="M11.9 4.3 21 3v8.6h-9.1Z" />
      <path d="M3 12.6h7.8v7.1L3 18.6Z" />
      <path d="M11.9 12.6H21V21l-9.1-1.3Z" />
    </svg>
  );
}

function Android({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className} fill="#3ddc84">
      <path d="M6 10.6h12v6.6a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 17.2Z" />
      <rect x="3" y="10.6" width="2.2" height="6" rx="1.1" />
      <rect x="18.8" y="10.6" width="2.2" height="6" rx="1.1" />
      <rect x="8.4" y="18.4" width="2.2" height="4" rx="1.1" />
      <rect x="13.4" y="18.4" width="2.2" height="4" rx="1.1" />
      <path d="M6 9.4a6 6 0 0 1 12 0Z" />
      <circle cx="9.2" cy="6.6" r="0.7" fill="#0b3d20" />
      <circle cx="14.8" cy="6.6" r="0.7" fill="#0b3d20" />
    </svg>
  );
}

function Linux({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M12 2.6c2.4 0 3.6 2 3.6 4.6 0 1.6.6 2.4 1.5 3.8 1 1.5 1.9 2.9 1.9 4.6 0 2.4-2.1 4-6.9 4s-7-1.6-7-4c0-1.7.9-3.1 1.9-4.6.9-1.4 1.5-2.2 1.5-3.8 0-2.6 1.2-4.6 3.5-4.6Z"
        fill="currentColor"
      />
      <ellipse cx="10.2" cy="7.6" rx="1.1" ry="1.5" fill="#fff" />
      <ellipse cx="13.8" cy="7.6" rx="1.1" ry="1.5" fill="#fff" />
      <circle cx="10.4" cy="7.9" r="0.6" fill="#111" />
      <circle cx="13.6" cy="7.9" r="0.6" fill="#111" />
      <path d="M12 10.2 13.9 12 12 13.1 10.1 12Z" fill="#f5a623" />
    </svg>
  );
}

function ChromeOs({ size = 18, className }: GlyphProps) {
  return <Chrome size={size} className={className} />;
}

function Mobile({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className} {...line}>
      <rect x="7" y="2.6" width="10" height="18.8" rx="2.2" />
      <path d="M10.6 18.6h2.8" />
    </svg>
  );
}

function Tablet({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className} {...line}>
      <rect x="4.4" y="3" width="15.2" height="18" rx="2.2" />
      <path d="M10.4 18h3.2" />
    </svg>
  );
}

function Desktop({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className} {...line}>
      <rect x="2.6" y="4.4" width="18.8" height="12" rx="2" />
      <path d="M8.4 20h7.2M12 16.4V20" />
    </svg>
  );
}

/** Keyed on the exact strings lib/analytics/client.ts writes. */
const PLATFORMS: Record<string, (p: GlyphProps) => React.ReactElement> = {
  macOS: Apple,
  iOS: Apple,
  Windows,
  Android,
  Linux,
  ChromeOS: ChromeOs,
};

const DEVICES: Record<string, (p: GlyphProps) => React.ReactElement> = {
  mobile: Mobile,
  tablet: Tablet,
  desktop: Desktop,
};

export function PlatformGlyph({ name, size, className }: { name: string } & GlyphProps) {
  const C = PLATFORMS[name] ?? Unknown;
  return <C size={size} className={className} />;
}

export function DeviceGlyph({ name, size, className }: { name: string } & GlyphProps) {
  const C = DEVICES[name] ?? Unknown;
  return <C size={size} className={className} />;
}
