"use client";

import { useEffect, useState, type RefObject } from "react";

/** iPhone Safari can only put the video element itself in full screen. */
type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Full screen for the whole player, so the custom controls and captions come
 * along. Where only the bare video can go full screen, it falls back to that.
 */
export function useFullscreen(target: RefObject<HTMLElement | null>, video: RefObject<HTMLVideoElement | null>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(document.fullscreenElement !== null && document.fullscreenElement === target.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [target]);

  async function toggle() {
    const element = target.current;
    if (!element) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (element.requestFullscreen) {
      await element.requestFullscreen().catch(() => {});
      return;
    }
    (video.current as WebkitVideo | null)?.webkitEnterFullscreen?.();
  }

  return { active, toggle };
}
