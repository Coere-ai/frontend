"use client";

import { SCALE } from "./map-bands";

/** Side of one square zoom button. */
const ZOOM_BUTTON = 28;

/**
 * The map's corner: the shading scale beside the zoom buttons.
 *
 * One stretch row, so the scale bar is exactly as tall as the button stack
 * without anyone doing the arithmetic. The scale is a continuous gradient,
 * darkest at the top because more is up, and it sits inside the frame for the
 * same reason the zoom does: it belongs to the map, and a legend parked below
 * it costs the map height on every screen.
 */
export function MapControls({
  showScale,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  showScale: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute right-3 bottom-3 flex items-stretch gap-2">
      {showScale && (
        <div
          className="w-2.5 rounded-sm border"
          style={{
            borderColor: "var(--color-border)",
            // SCALE runs light to dark, and the bar reads dark at the top.
            backgroundImage: `linear-gradient(to top, ${SCALE.join(", ")})`,
          }}
        />
      )}
      <div
        className="flex flex-col overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <MapButton label="Zoom in" onClick={onZoomIn}>
          +
        </MapButton>
        <MapButton label="Zoom out" onClick={onZoomOut}>
          −
        </MapButton>
        <MapButton label="Reset view" onClick={onReset}>
          ○
        </MapButton>
      </div>
    </div>
  );
}

function MapButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      // The map is behind a drag handler on the wrapper; without this a click on
      // a control also starts a pan.
      onPointerDown={(e) => e.stopPropagation()}
      className="text-[13px] leading-none transition-colors"
      style={{ color: "var(--color-muted)", width: ZOOM_BUTTON, height: ZOOM_BUTTON }}
    >
      {children}
    </button>
  );
}
