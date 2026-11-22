import type { Messages } from "../types";

export const home: Messages["home"] = {
  hero: {
    title: "[Accélérer] l’IA avec une mémoire qui vous appartient.",
    paragraph:
      "Coere accélère l’IA en rendant à chacun la propriété de sa mémoire et de son contexte dans les outils d’IA qu’il utilise déjà. Coere supprime les tâches répétitives, améliore la collaboration et rend chaque échange avec l’IA plus efficace.",
    extractionAlt: "Coere enregistre les conversations de Maya : 74 sur 570 enregistrées, environ 5 minutes restantes, et ChatGPT à 18 sur 240",
    graphAlt: "Le graphe de la page Mémoire : Infos personnelles, Personnes, Ton et voix, Style d’écriture et Travail, qui partent de la personne",
  },
  ais: {
    title: "Transférez votre mémoire entre toutes les IA",
    line: "Ce que vous avez dit à une IA, la suivante le sait déjà.",
    loop: "Les IA avec lesquelles Coere fonctionne",
  },
  products: {
    title: "Une seule mémoire pour vous, votre équipe et votre app",
    line: "Choisissez le Coere qui vous convient et découvrez ce qu’il fait.",
    kinds: { connect: "Pour les utilisateurs", solutions: "Pour les équipes", forge: "Pour les développeurs" },
  },
  solves: {
    switchLabel: "Afficher l’IA sans Coere ou avec Coere",
    today: {
      tab: "Sans Coere",
      title: "Chaque IA repart de zéro",
      line: "Aujourd’hui, les applications d’IA ont une mémoire fragmentée de leurs utilisateurs.",
      scenes: {
        switch: { title: "Passer d’une IA à l’autre", line: "Chaque fois qu’on change d’application, on repart sans aucun contexte." },
        newChat: { title: "Une nouvelle conversation dans la même IA", line: "Même dans une seule app, une nouvelle conversation ignore vos projets, vos préférences et votre historique, alors vous réexpliquez tout à chaque fois." },
        longChat: { title: "Au fil d’une longue conversation", line: "Les premiers détails se perdent ou disparaissent, et tout recoller alourdit la conversation, alors les réponses se dégradent." },
      },
      developers: { lead: "Les développeurs ont le même problème, de l’autre côté.", rest: "Chaque entreprise d’IA construit sa propre mémoire isolée, et leurs apps ne savent toujours rien d’un nouvel utilisateur le premier jour." },
      waitlist: "Réglez-le pour votre app sur la liste d’attente des développeurs",
    },
    coere: {
      tab: "Avec Coere",
      title: "Une mémoire qui suit la personne, pas l’app",
      line: "Coere est une couche de mémoire universelle qui appartient à l’utilisateur. Elle ajoute le contexte nécessaire à chaque réponse, pour que l’IA ait ce qui compte, rien de plus.",
      scenes: {
        switch: { title: "Dans n’importe quelle app", line: "L’IA suivante part de ce que la précédente a appris, car votre mémoire vous suit." },
        newChat: { title: "Dans chaque nouvelle conversation", line: "Vos projets et vos préférences arrivent avec votre premier message, vous n’avez plus jamais à vous réexpliquer." },
        longChat: { title: "À tout moment d’une conversation", line: "Le détail oublié revient quand il compte, et la conversation reste légère." },
      },
      developers: { lead: "Avec l’accord de l’utilisateur,", rest: "les développeurs peuvent intégrer notre API pour accéder à ce contexte et personnaliser leurs apps dès le premier jour, sans construire leur propre système de mémoire." },
      waitlist: "Rejoindre la liste d’attente des développeurs",
    },
  },
  faqTitle: "Ce qu’on nous demande sur Coere",
  blog: { title: "Les nouvelles de l’équipe", read: "Lire le blog" },
  closing: {
    title: "Votre mémoire vous appartient.",
    text: "Parlez aux fondateurs de Coere pour vous, votre équipe ou votre app.",
  },
};
