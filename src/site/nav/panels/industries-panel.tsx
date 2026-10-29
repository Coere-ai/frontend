import { applications, industries } from "@/site/content/industries";
import { productBySlug } from "@/site/content/products";
import { IndustryIcon } from "@/site/ui/icons/industry-icons";
import { PanelLabel, PanelLink, PanelMore } from "./panel-parts";

/**
 * Industries menu: on the left, the ways to use Coere, each pointing at the
 * product that does it; on the right, the industries it serves.
 */
export function IndustriesPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] gap-12">
      <div>
        <PanelLabel>Applications</PanelLabel>
        <ul className="mt-3 space-y-1">
          {applications.map((app) => {
            const product = productBySlug(app.product);
            return (
              <li key={app.slug}>
                <PanelLink
                  href={`/products/${app.product}`}
                  title={app.name}
                  summary={`${app.summary} With ${product?.name}.`}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-l border-neutral-200 pl-12">
        <div className="flex items-baseline justify-between">
          <PanelLabel>Industries</PanelLabel>
          <PanelMore href="/industries">All industries</PanelMore>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 2xl:grid-cols-3">
          {industries.map((industry) => (
            <li key={industry.slug}>
              <PanelLink
                href={`/industries#${industry.slug}`}
                title={industry.name}
                summary={industry.summary}
                icon={<IndustryIcon name={industry.icon} size={18} />}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
