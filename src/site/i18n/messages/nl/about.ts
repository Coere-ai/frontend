import type { Messages } from "../types";

export const about: Messages["about"] = {
  seo: {
    title: "Over Coere: het team achter de geheugenlaag die van jou is",
    description: "Waarom Coere bestaat en wie het bouwt. Coere is de draagbare AI-geheugenlaag die van jou is.",
  },
  title: "Over ons",
  line: "We bouwen de geheugenlaag die van mensen zelf is",
  story: [
    "Coere begon toen we steeds dezelfde projecten opnieuw uitlegden aan elke AI waar we naar overstapten. Elke AI kende een stukje van ons, en geen enkele kende de rest.",
    "Als gebruikers en ontwikkelaars van AI zagen we de behoefte aan één verenigd geheugen in elke AI, van de gebruiker zelf. Dus bouwden we één plek die bewaart wat elke AI over je leert, dat meeneemt naar elke nieuwe chat en van jou blijft.",
  ],
  diagram: {
    label: "Waarom Coere",
    step: "Stap {n}",
    steps: [
      { title: "AI is versnipperd.", text: "Je gebruikt één AI voor code, een andere voor school en een derde voor al het andere. Ze praten niet met elkaar." },
      { title: "Elke app houdt een stukje van je vast.", text: "Elke app onthoudt zijn eigen deel van wat je vertelde. Je kunt die stukjes niet zien en niet meenemen." },
      { title: "Coere brengt het samen.", text: "Coere bewaart je chats uit elke AI en bouwt er één geheugen van, met elk deel gekoppeld aan de chat waar het vandaan komt." },
      { title: "En het geheugen is van jou.", text: "Je ziet het, bewerkt het en beslist welke AI's en apps het mogen lezen. Je geheugen is van jou, niet van de apps." },
    ],
    pieces: ["Je code", "Je lessen", "Je reis", "Je onderzoek", "Je werk", "Je smaak"],
    yourMemory: "Je geheugen",
    from: "Uit",
    whoCanRead: "Wie je geheugen mag lezen",
    allowed: "Toegestaan",
    notAllowed: "Niet toegestaan",
  },
  team: {
    eyebrow: "Ons team",
    title: "De mensen achter Coere",
    founders: [
      {
        role: "Medeoprichter, CEO",
        majors: ["Bedrijfskunde", "Informatica"],
        highlights: [
          "Liet een bedrijf groeien tot 25 vestigingen in de Bay Area",
          "Richtte MyNeighborExpert op, een platform dat leerlingen koppelt aan lokale experts voor coaching en bijles in sport, schoolvakken en muziek",
          "Geeft les aan meer dan 150 studenten bij Berkeley Haas over 3D-modellering en CAD-tools in productontwikkeling",
          "Liep stage bij de campagne van Sam Liccardo, voor fondsenwerving en enquêteonderzoek",
          "Inspirit AI Scholar in machine learning en deep learning",
          "Deed mee aan de Blue Ocean Student Entrepreneur Competition 2024",
        ],
      },
      {
        role: "Medeoprichter, CTO",
        majors: ["EECS", "Bio-engineering"],
        highlights: [
          "Software engineer bij Optagon Labs, verantwoordelijk voor backend-API's in productie, databases, authenticatie, facturatie, cloudinfrastructuur en beveiliging",
          "Bracht apps uit die door meer dan 10.000 mensen gebruikt worden, waarvan meerdere uitgelicht door Google",
          "Bouwt robotica- en automatiseringssoftware voor een platform voor neuronkweek bij Neurotech@Berkeley",
          "Machine learning bij Enhanced Ultrasound, met pipelines voor segmentatie van echobeelden",
          "Drie jaar ervaring met veilige full-stack cloudapplicaties",
          "Regents' Scholar op meerdere UC-campussen, de meest prestigieuze beurs van het UC-systeem",
          "Walt Disney Scholar, toegekend door The Walt Disney Company",
        ],
      },
    ],
  },
  closing: { title: "Help ons de stukjes weer bij elkaar te brengen.", text: "We zoeken een oprichtend team en horen graag van je." },
  demo: {
    seo: {
      title: "Coere-demo: het product, live",
      description: "Zie hoe Coere zich instelt, je chats uit elke AI importeert, één geheugen bouwt dat van jou is en dat meeneemt naar elke nieuwe chat, live op de eigen code van Coere.",
    },
    title: "Zie Coere in actie",
    line: "Het hele product, live op de eigen code van Coere: de installatie, het importeren, het geheugen dat het bouwt en wat je ermee kunt.",
  },
};
