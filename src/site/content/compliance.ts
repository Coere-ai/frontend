/**
 * The standards Coere has to meet before it works with each industry, shown
 * on every industry page and named on the /industries cards. Coere is pre
 * launch and holds none of these yet, so the words say what Coere will meet,
 * never that it is certified, compliant or audited. compliance.test.ts holds
 * that line. What is in place today comes from the privacy policy
 * (privacy.ts); change both together.
 */

/**
 * One standard: its name, where it applies when not everywhere, and why it
 * matters to the field. `short` names it on the /industries cards when the
 * full name is long.
 */
export type Standard = { name: string; short?: string; where?: string; why: string };

/** An industry's standards, and whose data Coere must protect there, for the section's line. */
export type IndustryCompliance = { holder: string; standards: Standard[] };

const soc2 = (why: string): Standard => ({ name: "SOC 2 Type II", why });
const iso27001 = (why: string): Standard => ({ name: "ISO/IEC 27001", why });

export const industryCompliance: Record<string, IndustryCompliance> = {
  finance: {
    holder: "a firm's",
    standards: [
      soc2("Advisers and brokers ask for an independent report on a vendor's security controls, tested over months, before any client data is shared."),
      { name: "GLBA and Regulation S-P", short: "GLBA", why: "Firms must protect customer records and oversee every service provider that holds them, including notice of a breach within 72 hours." },
      { name: "SEC Rule 17a-4 and FINRA Rule 4511", short: "SEC Rule 17a-4", where: "With Rule 204-2 for investment advisers", why: "Business records and communications must be kept for set periods, so a tool that holds client context has to fit the firm's records policy." },
      { name: "NYDFS Part 500", where: "For firms licensed in New York", why: "Firms must check the security of every third party service provider that can reach their nonpublic information." },
    ],
  },
  technology: {
    holder: "a company's",
    standards: [
      soc2("The report software buyers ask for first in a security review, showing the controls worked over a full period."),
      iso27001("The international standard for running information security, expected by buyers in Europe and Asia."),
      { name: "GDPR", why: "Any personal data about people in the EU needs a data processing agreement and lawful terms for transfers out of Europe." },
      { name: "CCPA/CPRA", why: "California residents' personal information may be used only for the service, under a written service provider contract." },
    ],
  },
  commerce: {
    holder: "a company's",
    standards: [
      soc2("Partners and buyers ask for proof that the controls around their contracts and pricing are tested over time."),
      iso27001("The security standard trading partners across Europe and Asia most often ask for."),
      { name: "GDPR", why: "Contacts at European partners are personal data, so they need a processing agreement and safe terms for any transfer." },
      { name: "China's PIPL", short: "PIPL", where: "Where partners are on the mainland", why: "Personal information of people in China can leave the country only under set routes, such as a standard contract." },
    ],
  },
  consumer: {
    holder: "a brand's",
    standards: [
      soc2("Brands and their retail partners ask for an independent report on how shopper and partner data is protected."),
      { name: "GDPR", why: "Shopper data from the EU needs a lawful basis, a processing agreement and a way to honor each person's rights." },
      { name: "CCPA/CPRA", why: "Shoppers in California can ask what is held about them and have it deleted, and a vendor must help answer." },
      { name: "PCI DSS", where: "Wherever card data could pass through", why: "Card numbers must never be stored outside a tested environment. Coere already removes the card numbers it finds before anything is sent." },
    ],
  },
  manufacturing: {
    holder: "a plant's",
    standards: [
      soc2("Customers ask for an independent report on the controls around their drawings, quality records and orders."),
      iso27001("The security standard most manufacturers and their customers already run on."),
      { name: "ITAR and EAR", short: "ITAR, EAR", where: "For defense and dual use technical data", why: "Controlled drawings and specs may be stored and opened only where export rules allow, which decides where memory lives and who can read it." },
      { name: "CMMC and NIST SP 800-171", short: "CMMC", where: "For suppliers to the US Department of Defense", why: "Every tool that holds controlled unclassified information must meet NIST SP 800-171, and cloud services FedRAMP Moderate or its equivalent." },
      { name: "TISAX", where: "For automotive suppliers", why: "Carmakers ask suppliers for a TISAX label before they share prototype and design data." },
    ],
  },
  energy: {
    holder: "an operator's",
    standards: [
      soc2("Operators ask for an independent report on how site, asset and crew data is protected before a tool joins their stack."),
      { name: "NERC CIP", where: "For assets on the bulk electric system", why: "Operators must protect information about their critical cyber systems and manage the risk of every vendor, under CIP-011 and CIP-013." },
      iso27001("The security standard utilities and energy companies use to judge their suppliers."),
    ],
  },
  education: {
    holder: "a school's",
    standards: [
      { name: "FERPA", why: "A vendor holding student records works as a school official under the school's control, and may not use or share them for anything else." },
      { name: "COPPA", where: "For students under 13", why: "Children's data needs a parent's consent, or the school's for school use, and strict limits on what is kept. Coere is not for children under 13 today." },
      { name: "State student privacy laws", where: "Such as California's SOPIPA and New York's Education Law 2-d", why: "They ban selling student data or using it for ads, and many require a signed data privacy agreement with each district." },
      soc2("Districts and universities ask for an independent report on security controls in their vendor review."),
    ],
  },
  legal: {
    holder: "a firm's",
    standards: [
      { name: "ABA Model Rule 1.6 and Formal Opinion 512", short: "ABA Model Rule 1.6", why: "Lawyers must make reasonable efforts to keep client information confidential, and must know how an AI tool stores and shares what they put in." },
      soc2("Firms and their clients' security teams ask for an independent report on a vendor's controls in outside counsel reviews."),
      iso27001("The security standard large firms hold themselves, and ask of the tools that touch client matters."),
      { name: "HIPAA", short: "HIPAA where it applies", where: "Where a firm holds medical records for a client, such as in health care or malpractice work", why: "The firm is then a business associate, so any vendor that stores those records must sign a business associate agreement and meet the Security Rule." },
    ],
  },
};

/** What Coere already does today, in the privacy policy's own facts. */
export const inPlaceToday: string[] = [
  "Saved chats stay in the browser. coere.ai never stores them.",
  "Card numbers, passwords and API keys Coere finds are removed before anything is sent.",
  "Memories marked sensitive, such as health and money, stay out of the backup unless the person turns them on.",
  "Sign ins and connected browsers are recorded, and every support view of a memory is logged.",
  "Coere does not sell data or train any model on it.",
];

/** The standards' short names for a card, as one line. */
export function standardNames(slug: string): string | undefined {
  const entry = industryCompliance[slug];
  return entry?.standards.map((s) => s.short ?? s.name).join(", ");
}

/** An industry's standards, by slug. */
export function complianceFor(slug: string): IndustryCompliance | undefined {
  return industryCompliance[slug];
}
