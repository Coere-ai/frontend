import type { Messages } from "../types";

export const catalog: Messages["catalog"] = {
  products: {
    connect: {
      kind: "Geheugen voor mensen",
      tagline: "Jouw geheugen, in elke AI.",
      description: "Een geheugenlaag die van jou is. Hij bewaart je chats uit elke AI die je gebruikt en geeft elke nieuwe chat de juiste context.",
    },
    solutions: {
      kind: "Geheugen voor teams",
      tagline: "Eén geheugen voor het hele bedrijf.",
      description: "Een gedeeld geheugen voor een bedrijf, zijn mensen en zijn klanten. Elke chat begint bij wat het team al weet.",
    },
    forge: {
      kind: "Geheugen voor ontwikkelaars",
      tagline: "Geheugeninfrastructuur voor je apps.",
      description: "De API, de MCP-server en de SDK's waarmee je apps en agents Coere als geheugenlaag gebruiken, met toestemming van de persoon.",
    },
    agents: {
      kind: "Agents voor elke sector",
      tagline: "Eén assistent, eindeloze mogelijkheden, gebouwd op jouw geheugen.",
      description: "Cori, de assistent in Coere, in een versie voor elke sector. Elke versie werkt vanuit jouw geheugen en verdeelt grote taken over meerdere werkers.",
    },
  },
  features: {
    memory: {
      name: "Geheugen",
      title: "Alles wat je chats het leerden, in één graaf",
      description: "Coere ordent wat je chats zeggen in secties en mappen en tekent het rond jou. Elke herinnering bewaart de berichten waar ze vandaan komt.",
    },
    extraction: {
      name: "Extractie",
      title: "Al je chats, op één plek bewaard",
      description: "De knop Extract all leest ChatGPT, Claude en Gemini en bewaart elke chat op je computer. Daarna komen nieuwe chats vanzelf binnen.",
    },
    "smart-context": {
      name: "Slimme context",
      title: "De juiste context gaat mee terwijl je typt",
      description: "Een regel boven het chatvak zegt wat Coere toevoegt en van welke AI het dat leerde. Eén keer Enter stuurt je bericht met de context ervoor.",
    },
    voice: {
      name: "Spraak",
      title: "Vraag het hardop en hoor het antwoord",
      description: "Houd de rechter Option-toets ingedrukt en praat. Cori toont je woorden terwijl je spreekt en antwoordt hardop zodra je loslaat.",
    },
    cori: {
      name: "Cori",
      title: "Eén assistent op elke AI",
      description: "Cori vindt je oude chats in gewone woorden en legt uit hoe Coere werkt, op het dashboard, in de werkbalk en op elke AI-site.",
    },
    actions: {
      name: "Acties",
      title: "E-mail in je eigen stijl",
      description: "Vraag Cori om een e-mail en hij schrijft die in zijn eigen Gmail-tabblad met wat je geheugen weet. Hij vraagt het eerst voordat hij iets stuurt naar iemand die je niet noemde.",
    },
    writer: {
      name: "Schrijven",
      title: "Verbeter je tekst precies waar hij staat",
      description: "Selecteer tekst in Gmail, Docs of een chatvak. Cori verbetert hem en markeert elke wijziging in blauw tot je hem houdt of terugdraait.",
    },
    "any-site": {
      name: "Elke site",
      title: "Formulieren en quizzen vanuit wat je al weet",
      description: "Op elke pagina werkt Cori stap voor stap vanuit je geheugen, vraagt het voordat hij iets verstuurt en stopt als een pagina hem bevelen probeert te geven.",
    },
    workers: {
      name: "Werkers",
      title: "Onderzoek verdeeld over veel tabbladen",
      description: "Een grote taak draait in meerdere tabbladen tegelijk. Wat ze vinden komt samen in één tabel, elke waarde met de pagina waar ze vandaan komt.",
    },
  },
  seeAllFeatures: "Bekijk alle functies",
  applications: {
    consumer: { name: "Consumenten", summary: "Eén geheugen in elke AI." },
    developer: { name: "Ontwikkelaars", summary: "Apps en agents die het geheugen lezen." },
    business: { name: "Bedrijven", summary: "Geheugen van het bedrijf en zijn klanten." },
  },
  industries: {
    finance: { name: "Financiën", summary: "Elke adviseur begint bij de volledige geschiedenis.", uses: ["Klantgeheugen", "Opvolging van vergaderingen"], alt: "De New York Stock Exchange aan Wall Street" },
    technology: { name: "Technologie", summary: "Technische context, van tool naar tool.", uses: ["Projectgeheugen", "Context voor agents"], alt: "San Francisco bij nacht met de Salesforce Tower" },
    commerce: { name: "Handel", summary: "Afspraken en beloften in elke markt.", uses: ["Accountgeheugen", "Partnergeschiedenis"], alt: "De skyline van Hongkong aan de overkant van de Victoria Harbour" },
    consumer: { name: "Consumentenmarkt", summary: "Klanten herkend op elk kanaal.", uses: ["Klantgeheugen", "Context voor support"], alt: "Een gangpad in een supermarkt met volle schappen" },
    manufacturing: { name: "Productie", summary: "Wat de lijn leerde, blijft in de fabriek.", uses: ["Notities over lijnen en machines", "Overdrachtsgeheugen"], alt: "Robotarmen aan een assemblagelijn in een fabriek" },
    energy: { name: "Energie", summary: "Kennis uit het veld blijft bij het bedrijf.", uses: ["Notities over locaties en installaties", "Overdrachtsgeheugen"], alt: "Windturbines op de heuvels van Livermore boven de mist" },
    education: { name: "Onderwijs", summary: "Lessen die verdergaan waar ze stopten.", uses: ["Cursusgeheugen", "Studiecontext"], alt: "De Sather Tower van UC Berkeley" },
    legal: { name: "Juridisch", summary: "Dossiers en precedenten in het hele kantoor.", uses: ["Dossiergeheugen", "Klantgeschiedenis"], alt: "Het Hooggerechtshof van de Verenigde Staten" },
  },
  guides: {
    "portable-ai-memory": { name: "Draagbaar AI-geheugen", kind: "Wat het is" },
    "chatgpt-to-claude-memory": { name: "Van ChatGPT naar Claude", kind: "Van AI wisselen" },
    "ai-agent-memory": { name: "Geheugen voor AI-agents", kind: "Voor ontwikkelaars" },
  },
};
