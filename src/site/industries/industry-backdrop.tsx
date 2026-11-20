import { PixelPicture } from "@/site/art/pixel-picture";

/**
 * An industry page's opening backdrop: the field's photo redrawn as an LED
 * wall of small square cells in the Coere palette, the Solutions hero's
 * style, which colors in once as the page opens. A plain dark shade sits
 * behind the words only, from the left on a wide screen and from the top
 * where a phone stacks the words above the app (there the picture sits
 * round the app, see PixelPicture).
 */
export function IndustryBackdrop({ photo, focus }: { photo: string; focus?: readonly [number, number] }) {
  return (
    <div className="absolute inset-0 bg-[#0b0a12]">
      <PixelPicture photo={photo} focus={focus} intro />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,18,0.8),rgba(11,10,18,0.6)_42%,rgba(11,10,18,0.15)_62%,transparent_78%)] lg:bg-[linear-gradient(90deg,rgba(11,10,18,0.88),rgba(11,10,18,0.74)_30%,rgba(11,10,18,0.45)_42%,rgba(11,10,18,0.12)_52%,transparent_60%)]" />
    </div>
  );
}
