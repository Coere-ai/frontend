import type { Messages } from "../types";

export const pricing: Messages["pricing"] = {
  title: "Een abonnement voor jou, je team of je app",
  line: "Coere is gratis voor één persoon. Teams en ontwikkelaars nemen contact met ons op.",
  plansLabel: "Abonnementen",
  plans: {
    consumer: {
      name: "Particulier",
      kind: "Voor jou",
      price: "Gratis",
      priceNote: "Coere Connect, voor één persoon",
      line: "Eén geheugen dat van jou is, in elke AI die je gebruikt.",
      features: ["Onbeperkt overzetten tussen AI's", "Onbeperkt je chats extraheren", "Eén geheugen in ChatGPT, Claude, Gemini en meer", "Lokaal eerst, met een back-up op coere.ai"],
      cta: "Gratis beginnen",
    },
    team: {
      name: "Team",
      kind: "Voor bedrijven",
      price: "Neem contact op",
      priceNote: "Coere Solutions, voor je hele team",
      line: "Eén gedeeld geheugen voor het bedrijf, zijn mensen en zijn klanten.",
      features: ["Beveiliging op bedrijfsniveau", "Single sign-on (SSO)", "Auditlogs", "Een gedeeld teamgeheugen", "Beheer van uitnodigingen, rollen en toegang"],
      cta: "Plan een demo",
    },
    developer: {
      name: "Ontwikkelaar",
      kind: "Voor je app",
      price: "Per gebruiker",
      priceNote: "Coere Forge, op basis van gebruik",
      line: "Geef de gebruikers van je app het geheugen dat ze al opbouwden.",
      features: ["De geheugen-API", "Een MCP-server voor je agents", "SDK's voor TypeScript en Python", "Tokens met beperkte rechten die de persoon kan intrekken", "Op basis van gebruik, per gebruiker"],
      cta: "Meld je aan voor de wachtlijst",
    },
  },
  closing: { title: "Weet je niet welk abonnement past?", text: "Praat met de oprichters over Coere voor jou, je team of je app." },
};
