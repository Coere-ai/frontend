/**
 * The Coere Solutions hero's backdrop, on near black. This is a stand in:
 * the pixel matrix of AI logos (src/site/art/pixel-matrix-logos.tsx) takes
 * its place. Whatever goes here fills the hero behind the words and the
 * app, and should leave the left side dark enough for white words.
 */
export function SolutionsBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_75%_30%,#1f2a7a_0%,#0f1233_45%,#0b0a12_80%)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0a12]/85 via-[#0b0a12]/40 to-transparent" />
    </div>
  );
}
