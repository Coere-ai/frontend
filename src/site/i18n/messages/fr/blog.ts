import type { Messages } from "../types";

export const blog: Messages["blog"] = {
  title: "Le blog de Coere",
  line: "Actualités, lancements et notes de l’équipe qui construit la couche de mémoire qui vous appartient.",
  readNewest: "Lire le dernier article",
  more: "Plus d’articles",
  filterLabel: "Filtrer les articles par catégorie",
  all: "Tous",
  categories: { Company: "Entreprise", Product: "Produit", Developers: "Développeurs" },
  count: { one: "{count} article", other: "{count} articles" },
  countIn: { one: "{count} article dans {category}", other: "{count} articles dans {category}" },
  minutes: "{minutes} min de lecture",
  posts: {
    "introducing-coere-connect": {
      title: "Voici Coere Connect, une seule mémoire dans toutes les IA",
      excerpt: "Vos conversations avec toutes les IA, réunies au même endroit et apportées à chaque nouvelle conversation.",
    },
    "coere-solutions": {
      title: "Coere Solutions : une seule mémoire pour toute votre équipe",
      excerpt: "Le savoir de l’entreprise et chaque client, retenus par toute l’équipe.",
    },
    "coere-forge": {
      title: "Forge : une mémoire pour votre app dès le premier jour",
      excerpt: "L’API, le serveur MCP et les SDK pour bâtir sur Coere.",
    },
    "catalyst-26": {
      title: "Catalyst 26 : ce que nous construisons cette année",
      excerpt: "Où va Coere, et pourquoi la mémoire doit appartenir aux personnes.",
    },
  },
};
