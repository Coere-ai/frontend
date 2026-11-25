import type { Messages } from "../types";

export const blog: Messages["blog"] = {
  title: "De Coere-blog",
  line: "Nieuws, lanceringen en notities van het team dat de geheugenlaag bouwt die van jou is.",
  readNewest: "Lees het nieuwste bericht",
  more: "Meer berichten",
  filterLabel: "Filter berichten op categorie",
  all: "Alles",
  categories: { Company: "Bedrijf", Product: "Product", Developers: "Ontwikkelaars" },
  count: { one: "{count} bericht", other: "{count} berichten" },
  countIn: { one: "{count} bericht in {category}", other: "{count} berichten in {category}" },
  minutes: "{minutes} min lezen",
  posts: {
    "introducing-coere-connect": {
      title: "Maak kennis met Coere Connect, één geheugen in elke AI",
      excerpt: "Je chats met elke AI, op één plek bewaard en meegenomen naar elke nieuwe chat.",
    },
    "coere-solutions": {
      title: "Coere Solutions: één geheugen voor je hele team",
      excerpt: "Bedrijfskennis en elke klant, onthouden door het hele team.",
    },
    "coere-forge": {
      title: "Forge: geef je app vanaf dag één een geheugen",
      excerpt: "De API, de MCP-server en de SDK's om op Coere te bouwen.",
    },
    "catalyst-26": {
      title: "Catalyst 26: wat we dit jaar bouwen",
      excerpt: "Waar Coere naartoe gaat, en waarom geheugen van mensen hoort te zijn.",
    },
  },
};
