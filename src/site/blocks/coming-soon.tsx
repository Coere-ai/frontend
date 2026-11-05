import { launchSettings } from "@/lib/launch/store";
import type { LaunchProduct } from "@/site/content/launch";
import { InterestForm } from "@/site/launch/interest-form";
import { LaunchStage } from "@/site/launch/launch-stage";
import { buttonClass } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { ChromeMark } from "@/site/ui/icons/chrome-mark";

/**
 * Where Add to Chrome leads once Coere Connect is out: COERE_STORE_URL, the
 * listing's address once the Chrome Web Store gives it, else a search of
 * the store for Coere.
 */
const storeUrl = () => process.env.COERE_STORE_URL || "https://chromewebstore.google.com/search/Coere";

/**
 * The page behind every button for something not out yet: Install leads to
 * Coere Connect's, Try it free to Coere for Teams'. The heading, a countdown
 * to the moment the operator set in /admin/launch, and I'm interested, which
 * takes an email for the admin panel's Interested list. Once Coere Connect
 * is out, Add to Chrome takes the place of I'm interested.
 */
export async function ComingSoon({ product }: { product: LaunchProduct }) {
  const setting = (await launchSettings())[product];
  return (
    <section className="bg-white pt-20 pb-28 md:pt-28 md:pb-40">
      <Container>
        <LaunchStage
          product={product}
          setting={setting}
          here={
            product === "connect" ? (
              <div className="mt-12 flex justify-center">
                <a href={storeUrl()} className={buttonClass("primary", "h-14 px-6 text-[16px]")}>
                  <ChromeMark size={22} />
                  Add to Chrome
                </a>
              </div>
            ) : undefined
          }
        >
          <InterestForm product={product} />
        </LaunchStage>
      </Container>
    </section>
  );
}
