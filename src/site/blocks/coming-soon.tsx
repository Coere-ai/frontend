import { launchSettings } from "@/lib/launch/store";
import type { LaunchProduct } from "@/site/content/launch";
import { InterestForm } from "@/site/launch/interest-form";
import { LaunchStage } from "@/site/launch/launch-stage";
import { Container } from "@/site/ui/container";

/**
 * The page behind every button for something not out yet: Install leads to
 * Coere Connect's, Try it free to Coere for Teams'. The heading, a countdown
 * to the moment the operator set in /admin/launch, and I'm interested, which
 * takes an email for the admin panel's Interested list.
 */
export async function ComingSoon({ product }: { product: LaunchProduct }) {
  const setting = (await launchSettings())[product];
  return (
    <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-40">
      {/* The hero's pale sky, fading out before the countdown. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-mist to-white" />
      <Container className="relative">
        <LaunchStage product={product} setting={setting}>
          <InterestForm product={product} />
        </LaunchStage>
      </Container>
    </section>
  );
}
