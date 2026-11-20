import { applicationsIn, industriesIn } from "@/site/content/industries";
import { productBySlug } from "@/site/content/products";
import { useMessages } from "@/site/i18n/client";
import { format } from "@/site/i18n/types";
import { IndustryIcon } from "@/site/ui/icons/industry-icons";
import { PanelLabel, PanelLink, PanelMore } from "./panel-parts";

/**
 * Industries menu: on the left, who Coere is for (consumer, developer,
 * business), each pointing at the product that serves them; on the right,
 * the industries, each opening its own page.
 */
export function IndustriesPanel() {
  const catalog = useMessages("catalog");
  const t = useMessages("chrome").nav;
  const applications = applicationsIn(catalog);
  const industries = industriesIn(catalog);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] gap-12">
      <div>
        <PanelLabel>{t.whoFor}</PanelLabel>
        <ul className="mt-3 space-y-1">
          {applications.map((app) => {
            const product = productBySlug(app.product);
            return (
              <li key={app.slug}>
                <PanelLink
                  href={`/products/${app.product}`}
                  title={app.name}
                  summary={format(t.withProduct, { summary: app.summary, product: product?.name ?? "" })}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pl-12">
        <div className="flex items-baseline justify-between">
          <PanelLabel>{t.industries}</PanelLabel>
          <PanelMore href="/industries">{t.allIndustries}</PanelMore>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 2xl:grid-cols-3">
          {industries.map((industry) => (
            <li key={industry.slug}>
              <PanelLink
                href={`/industries/${industry.slug}`}
                title={industry.name}
                summary={industry.summary}
                icon={<IndustryIcon name={industry.icon} size={24} />}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
