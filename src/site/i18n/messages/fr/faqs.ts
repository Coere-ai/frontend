import type { Messages } from "../types";

export const faqs: Messages["faqs"] = {
  home: [
    {
      q: "Qu’est-ce que Coere ?",
      a: "Coere est une couche de mémoire d’IA portable qui vous appartient. Coere Connect, une extension Chrome, enregistre sur votre ordinateur vos conversations avec les IA que vous utilisez, en tire un seul graphe de mémoire et ajoute le bon contexte à chaque nouvelle conversation pendant que vous tapez.",
      link: "Ce que veut dire une mémoire d’IA portable",
    },
    {
      q: "Avec quelles IA Coere fonctionne-t-il ?",
      a: "{ais}. Toutes alimentent la même mémoire, donc une nouvelle conversation sur l’une d’elles part de ce que vous avez déjà dit sur les autres.",
    },
    {
      q: "En quoi Coere diffère-t-il de la mémoire de ChatGPT ou de Claude ?",
      a: "La mémoire propre à chaque IA se construit à partir de ce que vous avez dit à cette IA, et elle y reste. Claude et Gemini peuvent désormais importer à la main un résumé venu d’une autre IA. Coere construit une seule mémoire à partir de vos conversations sur toutes les IA, garde chaque souvenir à côté des conversations dont il vient et vous montre ce qui entre dans une conversation, sur une ligne au-dessus de la zone de saisie, avant l’envoi.",
      link: "Passer de ChatGPT à Claude",
    },
    {
      q: "Où ma mémoire est-elle conservée, et qui peut la lire ?",
      a: "Chaque conversation est enregistrée sur votre ordinateur. Coere vous demande à partir de quoi construire la mémoire, et rien ne part vers une IA sans votre accord. Une app ne peut lire votre mémoire qu’avec un jeton que vous autorisez, et vous pouvez le révoquer à tout moment.",
    },
    {
      q: "Coere s’adresse-t-il aussi aux équipes et aux développeurs ?",
      a: "Oui. Coere Solutions construit une mémoire partagée d’une entreprise et de ses clients, et un brouillon sur un client ne reçoit que la mémoire de ce client. Coere Forge donne aux apps et aux agents d’IA la mémoire d’une personne via une API, un serveur MCP et des SDK TypeScript et Python, avec l’accord de cette personne.",
      link: "La mémoire des agents d’IA",
    },
    {
      q: "Coere, est-ce la même chose que Cohere ?",
      a: "Non. Coere n’est pas Cohere et n’a aucun lien avec cette société. Le nom vient du latin cohaerere, relier. Coere construit une couche de mémoire pour les personnes, les équipes et les apps.",
    },
    {
      q: "Puis-je utiliser Coere aujourd’hui ?",
      a: "Pas encore. Coere est en prélancement et la liste d’attente est ouverte. D’ici le lancement, vous pouvez écrire aux fondateurs au sujet de Coere pour vous, votre équipe ou votre app.",
      link: "Écrire aux fondateurs",
    },
  ],
};
