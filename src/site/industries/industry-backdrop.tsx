import { SizedPhoto } from "@/site/ui/sized-photo";

/**
 * An industry page's opening backdrop: the field's own photo, full bleed,
 * as the pages had it before the redesign, under the same dark shade from
 * the left that keeps white words readable. A phone stacks the words over
 * the photo, so there the shade runs from the top.
 */
export function IndustryBackdrop({ photo, alt }: { photo: string; alt: string }) {
  return (
    <div className="absolute inset-0 bg-neutral-950">
      <SizedPhoto src={photo} alt={alt} fill preload sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/55 to-neutral-950/35 lg:bg-gradient-to-r lg:from-neutral-950/75 lg:via-neutral-950/35 lg:to-neutral-950/10" />
    </div>
  );
}
