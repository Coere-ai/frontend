import type { Messages } from "../types";

export const pricing: Messages["pricing"] = {
  title: "Une offre pour vous, votre équipe ou votre app",
  line: "Coere est gratuit pour une personne. Équipes et développeurs, parlons-en.",
  plansLabel: "Offres",
  plans: {
    consumer: {
      name: "Particulier",
      kind: "Pour vous",
      price: "Gratuit",
      priceNote: "Coere Connect, pour une personne",
      line: "Une mémoire à vous, dans toutes les IA que vous utilisez.",
      features: ["Transferts illimités entre IA", "Extraction illimitée de vos conversations", "Une seule mémoire pour ChatGPT, Claude, Gemini et d’autres", "Local d’abord, avec une sauvegarde sur coere.ai"],
      cta: "Commencer gratuitement",
    },
    team: {
      name: "Équipe",
      kind: "Pour les entreprises",
      price: "Nous contacter",
      priceNote: "Coere Solutions, pour toute votre équipe",
      line: "Une mémoire partagée pour l’entreprise, ses collaborateurs et ses clients.",
      features: ["Sécurité de niveau entreprise", "Authentification unique (SSO)", "Journaux d’audit", "Une mémoire d’équipe partagée", "Gestion des invitations, des rôles et des accès"],
      cta: "Réserver une démo",
    },
    developer: {
      name: "Développeur",
      kind: "Pour votre app",
      price: "Par utilisateur",
      priceNote: "Coere Forge, à l’usage",
      line: "Donnez aux utilisateurs de votre app la mémoire qu’ils ont déjà construite.",
      features: ["L’API de mémoire", "Un serveur MCP pour vos agents", "Des SDK TypeScript et Python", "Des jetons à portée limitée, révocables par la personne", "À l’usage, par utilisateur"],
      cta: "Rejoindre la liste d’attente",
    },
  },
  closing: { title: "Vous ne savez pas quelle offre choisir ?", text: "Parlez aux fondateurs de Coere pour vous, votre équipe ou votre app." },
};
