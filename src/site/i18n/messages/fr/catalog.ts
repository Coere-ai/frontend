import type { Messages } from "../types";

export const catalog: Messages["catalog"] = {
  products: {
    connect: {
      kind: "La mémoire des personnes",
      tagline: "Votre mémoire, dans toutes les IA.",
      description: "Une couche de mémoire qui vous appartient. Elle enregistre vos conversations avec chaque IA que vous utilisez et apporte le bon contexte à chaque nouvelle conversation.",
    },
    solutions: {
      kind: "La mémoire des équipes",
      tagline: "Une seule mémoire pour toute l’entreprise.",
      description: "Une mémoire partagée pour une entreprise, ses collaborateurs et ses clients. Chaque conversation part de ce que l’équipe sait déjà.",
    },
    forge: {
      kind: "La mémoire des développeurs",
      tagline: "L’infrastructure de mémoire de vos apps.",
      description: "L’API, le serveur MCP et les SDK qui permettent à vos apps et à vos agents d’utiliser Coere comme couche de mémoire, avec l’accord de la personne.",
    },
    agents: {
      kind: "Des agents pour chaque secteur",
      tagline: "Un assistant, des possibilités infinies, bâti sur votre mémoire.",
      description: "Cori, l’assistant de Coere, dans une version pour chaque secteur. Chacun travaille à partir de votre mémoire et répartit les grandes tâches entre plusieurs agents.",
    },
  },
  features: {
    memory: {
      name: "Mémoire",
      title: "Tout ce que vos conversations lui ont appris, dans un seul graphe",
      description: "Coere classe ce que disent vos conversations en sections et en dossiers, et le dessine autour de vous. Chaque souvenir garde les messages dont il vient.",
    },
    extraction: {
      name: "Extraction",
      title: "Toutes vos conversations, réunies au même endroit",
      description: "Le bouton Extract all lit ChatGPT, Claude et Gemini et enregistre chaque conversation sur votre ordinateur. Ensuite, les nouvelles arrivent toutes seules.",
    },
    "smart-context": {
      name: "Contexte intelligent",
      title: "Le bon contexte s’ajoute pendant que vous tapez",
      description: "Une ligne au-dessus de la zone de saisie indique ce que Coere va ajouter et de quelles IA il l’a appris. Une seule touche Entrée envoie votre message, précédé du contexte.",
    },
    voice: {
      name: "Voix",
      title: "Posez votre question à voix haute, écoutez la réponse",
      description: "Maintenez la touche Option droite et parlez. Cori affiche vos mots à mesure que vous parlez et répond à voix haute quand vous relâchez.",
    },
    cori: {
      name: "Cori",
      title: "Un seul assistant sur toutes les IA",
      description: "Cori retrouve vos anciennes conversations avec des mots simples et explique le fonctionnement de Coere, sur le tableau de bord, dans la barre d’outils et sur n’importe quel site d’IA.",
    },
    actions: {
      name: "Actions",
      title: "Des e-mails écrits dans votre style",
      description: "Demandez un e-mail à Cori, il le rédige dans son propre onglet Gmail avec ce que sait votre mémoire. Il vous demande avant d’écrire à quelqu’un que vous n’avez pas nommé.",
    },
    writer: {
      name: "Rédaction",
      title: "Améliorez votre texte là où il se trouve",
      description: "Sélectionnez du texte dans Gmail, Docs ou une zone de chat. Cori le corrige ou l’améliore et marque chaque modification en bleu jusqu’à ce que vous la gardiez ou l’annuliez.",
    },
    "any-site": {
      name: "Tous les sites",
      title: "Formulaires et quiz à partir de ce que vous savez déjà",
      description: "Sur n’importe quelle page, Cori avance étape par étape à partir de votre mémoire, demande avant d’envoyer et s’arrête si une page tente de lui donner des ordres.",
    },
    workers: {
      name: "Travail en parallèle",
      title: "Une recherche répartie sur plusieurs onglets",
      description: "Une grande tâche s’exécute dans plusieurs onglets à la fois. Leurs résultats se réunissent dans un seul tableau, chaque valeur avec la page d’où elle vient.",
    },
  },
  seeAllFeatures: "Voir toutes les fonctionnalités",
  applications: {
    consumer: { name: "Particuliers", summary: "Une seule mémoire dans toutes les IA." },
    developer: { name: "Développeurs", summary: "Des apps et des agents qui lisent la mémoire." },
    business: { name: "Entreprises", summary: "La mémoire de l’entreprise et de ses clients." },
  },
  industries: {
    finance: { name: "Finance", summary: "Chaque conseiller part de l’historique complet.", uses: ["Mémoire des clients", "Suivi des réunions"], alt: "La Bourse de New York à Wall Street" },
    technology: { name: "Technologie", summary: "Le contexte technique, d’un outil à l’autre.", uses: ["Mémoire des projets", "Contexte des agents"], alt: "San Francisco la nuit, avec la Salesforce Tower" },
    commerce: { name: "Commerce", summary: "Accords et engagements sur tous les marchés.", uses: ["Mémoire des comptes", "Historique des partenaires"], alt: "Les gratte-ciel de Hong Kong de l’autre côté du port Victoria" },
    consumer: { name: "Grande consommation", summary: "Des clients reconnus sur chaque canal.", uses: ["Mémoire des clients", "Contexte du support"], alt: "Un rayon de supermarché aux étagères pleines" },
    manufacturing: { name: "Industrie", summary: "Ce que la ligne a appris reste dans l’usine.", uses: ["Notes sur les lignes et les machines", "Mémoire des passations"], alt: "Des bras robotisés sur une chaîne de montage" },
    energy: { name: "Énergie", summary: "Le savoir du terrain reste dans l’entreprise.", uses: ["Notes sur les sites et les équipements", "Mémoire des passations"], alt: "Des éoliennes sur les collines de Livermore, au-dessus du brouillard" },
    education: { name: "Éducation", summary: "Des cours qui reprennent là où ils s’étaient arrêtés.", uses: ["Mémoire des cours", "Contexte d’étude"], alt: "La tour Sather de UC Berkeley" },
    legal: { name: "Juridique", summary: "Dossiers et précédents dans tout le cabinet.", uses: ["Mémoire des dossiers", "Historique des clients"], alt: "La Cour suprême des États-Unis" },
  },
  guides: {
    "portable-ai-memory": { name: "Mémoire d’IA portable", kind: "Ce que c’est" },
    "chatgpt-to-claude-memory": { name: "De ChatGPT à Claude", kind: "Changer d’IA" },
    "ai-agent-memory": { name: "Mémoire pour agents d’IA", kind: "Pour les développeurs" },
  },
};
