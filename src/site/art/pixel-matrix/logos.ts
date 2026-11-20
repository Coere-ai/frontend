import { LOGO_BLADE } from "@/components/logo";

/** Every mark the pixel wall can draw. */
export type MatrixLogoId = "coere" | "chatgpt" | "claude" | "gemini" | "copilot" | "perplexity" | "grok" | "deepseek" | "meta" | "kimi";

/**
 * One mark and how it takes the palette: `tone` is its home on the ramp
 * (0 cyan to 1 magenta in the default palette) and `hue` is the brand's own
 * main hue, which lands on that home. A one color mark gives no hue.
 */
export type MatrixLogo = {
  id: MatrixLogoId;
  label: string;
  /** A file in /public, or the SVG itself for the Coere mark. */
  src: string;
  tone: number;
  hue: number;
  /** Colors the whole mark along one soft sweep of the ramp, ignoring its own hues. */
  mono?: boolean;
};

const coereSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff"><path d="${LOGO_BLADE}"/><path d="${LOGO_BLADE}" transform="rotate(180 256 256)"/></svg>`;

export const MATRIX_LOGOS: Record<MatrixLogoId, MatrixLogo> = {
  coere: { id: "coere", label: "Coere", src: `data:image/svg+xml,${encodeURIComponent(coereSvg)}`, tone: 0.28, hue: 0 },
  chatgpt: { id: "chatgpt", label: "ChatGPT", src: "/openai.svg", tone: 0.06, hue: 0 },
  claude: { id: "claude", label: "Claude", src: "/claude-color.svg", tone: 0.93, hue: 15 },
  gemini: { id: "gemini", label: "Gemini", src: "/gemini-color.svg", tone: 0.4, hue: 217 },
  copilot: { id: "copilot", label: "Copilot", src: "/copilot-color.svg", tone: 0.45, hue: 200, mono: true },
  perplexity: { id: "perplexity", label: "Perplexity", src: "/perplexity-color.svg", tone: 0.02, hue: 186 },
  grok: { id: "grok", label: "Grok", src: "/grok.svg", tone: 0.66, hue: 0 },
  deepseek: { id: "deepseek", label: "DeepSeek", src: "/deepseek-color.svg", tone: 0.34, hue: 230 },
  meta: { id: "meta", label: "Meta AI", src: "/meta-color.svg", tone: 0.22, hue: 212 },
  kimi: { id: "kimi", label: "Kimi", src: "/kimi.svg", tone: 0.82, hue: 0 },
};

/** The AIs in the order the wall places them, nearest and most known first. */
export const AI_LOGO_IDS: readonly MatrixLogoId[] = ["chatgpt", "claude", "gemini", "copilot", "perplexity", "grok", "deepseek", "meta", "kimi"];

/**
 * The SVG text ready to draw on a canvas. The site's marks are written for
 * an icon size of 1em and some fill with currentColor, which an image
 * cannot resolve, so both are set here: white for currentColor and a real
 * pixel size.
 */
export function prepareSvg(text: string, px: number): string {
  return text
    .replace(/currentColor/g, "#ffffff")
    .replace(/\swidth="[^"]*"/, ` width="${px}"`)
    .replace(/\sheight="[^"]*"/, ` height="${px}"`);
}
