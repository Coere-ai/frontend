import type { Messages } from "../types";

export const about: Messages["about"] = {
  seo: {
    title: "À propos de Coere : l’équipe derrière votre couche de mémoire",
    description: "Pourquoi Coere existe et qui le construit. Coere est la couche de mémoire d’IA portable qui vous appartient.",
  },
  title: "À propos",
  line: "Nous construisons la couche de mémoire qui appartient aux personnes",
  story: [
    "Coere est né quand nous nous sommes surpris à réexpliquer les mêmes projets à chaque IA vers laquelle nous passions. Chacune connaissait une partie de nous, aucune ne connaissait le reste.",
    "En tant qu’utilisateurs et développeurs d’IA, nous avons vu le besoin d’une mémoire unifiée, détenue par l’utilisateur, dans toutes les IA. Nous avons donc construit un seul endroit qui garde ce que chaque IA apprend de vous, l’apporte à chaque nouvelle conversation et reste à vous.",
  ],
  diagram: {
    label: "Pourquoi Coere",
    step: "Étape {n}",
    steps: [
      { title: "L’IA est fragmentée.", text: "Vous utilisez une IA pour le code, une autre pour les cours et une troisième pour tout le reste. Aucune ne parle aux autres." },
      { title: "Chaque app garde un morceau de vous.", text: "Chacune se souvient de sa propre part de ce que vous lui avez dit. Vous ne voyez pas ces morceaux et ne pouvez pas les emporter." },
      { title: "Coere rassemble tout.", text: "Coere enregistre vos conversations avec toutes les IA et en tire une seule mémoire, chaque partie reliée à la conversation dont elle vient." },
      { title: "Et la mémoire est à vous.", text: "Vous la voyez, la modifiez et décidez quelles IA et quelles apps peuvent la lire. Votre mémoire vous appartient, pas aux apps." },
    ],
    pieces: ["Votre code", "Vos cours", "Votre voyage", "Vos recherches", "Votre travail", "Vos goûts"],
    yourMemory: "Votre mémoire",
    from: "Depuis",
    whoCanRead: "Qui peut lire votre mémoire",
    allowed: "Autorisé",
    notAllowed: "Non autorisé",
  },
  team: {
    eyebrow: "Notre équipe",
    title: "Les personnes qui construisent Coere",
    founders: [
      {
        role: "Cofondatrice, CEO",
        majors: ["Commerce", "Informatique"],
        highlights: [
          "A développé une entreprise jusqu’à 25 sites dans la baie de San Francisco",
          "A fondé MyNeighborExpert, une plateforme qui met en relation des apprenants et des experts locaux pour du coaching et du soutien en sport, en études et en musique",
          "Enseigne à plus de 150 étudiants à Berkeley Haas comment intégrer la modélisation 3D et les outils de CAO au développement produit",
          "Stagiaire dans la campagne de Sam Liccardo, sur la collecte de fonds et les enquêtes d’opinion",
          "Boursière Inspirit AI en apprentissage automatique et apprentissage profond",
          "A concouru à la Blue Ocean Student Entrepreneur Competition 2024",
        ],
      },
      {
        role: "Cofondateur, CTO",
        majors: ["EECS", "Bio-ingénierie"],
        highlights: [
          "Ingénieur logiciel chez Optagon Labs, responsable des API backend en production, des bases de données, de l’authentification, de la facturation, de l’infrastructure cloud et de la sécurité",
          "A lancé des apps utilisées par plus de 10 000 personnes, dont plusieurs mises en avant par Google",
          "Développe des logiciels de robotique et d’automatisation pour une plateforme de culture de neurones à Neurotech@Berkeley",
          "Apprentissage automatique chez Enhanced Ultrasound, sur des pipelines de segmentation d’échographies",
          "Trois ans à construire des applications cloud full-stack sécurisées",
          "Regents’ Scholar sur plusieurs campus de l’UC, la bourse la plus prestigieuse du système UC",
          "Walt Disney Scholar, bourse attribuée par The Walt Disney Company",
        ],
      },
    ],
  },
  closing: { title: "Aidez-nous à recoller les morceaux.", text: "Nous recrutons une équipe fondatrice et serions ravis d’avoir de vos nouvelles." },
  demo: {
    seo: {
      title: "Démo de Coere : le produit, en direct",
      description: "Regardez Coere s’installer, importer vos conversations de toutes les IA, construire une mémoire qui vous appartient et l’apporter à chaque nouvelle conversation, en direct sur le code même de Coere.",
    },
    title: "Coere en action",
    line: "Tout le produit, en direct sur le code même de Coere : l’installation, l’import, la mémoire qu’il construit et ce que vous pouvez en faire.",
  },
};
