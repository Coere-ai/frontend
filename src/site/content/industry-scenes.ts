import type { SceneShot } from "@/site/ui/screen-scene";
import type { DemoKey } from "./industry-stories/types";

/**
 * The shots of each industry demo. Every field has the same seven screens,
 * built from real app screens with that field's own made up people, clients
 * and work (scripts/industries), so one framing fits all of them.
 */
export function industryScenes(slug: string): Record<DemoKey, SceneShot[]> {
  const at = (name: string) => `/preview/screens/industries/${slug}/${name}.html`;
  return {
    context: [
      { src: at("chat-new"), view: { x: 200, y: 0, w: 1100 }, hold: 2400 },
      { src: at("chat-sent"), view: { x: 240, y: 40, w: 1200 }, hold: 3200 },
    ],
    graph: [
      { src: at("graph") },
      { src: at("client"), view: { x: 300, y: 40, w: 1140 } },
    ],
    confidential: [
      { src: at("client-line"), view: { x: 400, y: 230, w: 900 } },
      { src: at("cori"), view: { x: 560, y: 120, w: 880 } },
    ],
    app: [{ src: at("terminal"), view: { x: 120, y: 50, w: 980 }, hold: 4200 }],
  };
}
