import type { Messages } from "../types";

export const faqs: Messages["faqs"] = {
  home: [
    {
      q: "Wat is Coere?",
      a: "Coere is een draagbare AI-geheugenlaag die van jou is. Coere Connect, een Chrome-extensie, bewaart je chats met de AI's die je gebruikt op je computer, bouwt er één geheugengraaf van en voegt de juiste context toe aan elke nieuwe chat terwijl je typt.",
      link: "Wat draagbaar AI-geheugen betekent",
    },
    {
      q: "Met welke AI's werkt Coere?",
      a: "{ais}. Ze voeden allemaal hetzelfde geheugen, dus een nieuwe chat in een van hen begint bij wat je al in de andere zei.",
    },
    {
      q: "Wat is het verschil tussen Coere en het geheugen van ChatGPT of Claude?",
      a: "Het eigen geheugen van elke AI is gebouwd uit wat je die AI vertelde, en het blijft in die AI. Claude en Gemini kunnen nu met de hand een samenvatting uit een andere AI importeren. Coere bouwt één geheugen uit je chats in elke AI, bewaart elke herinnering naast de chats waar ze vandaan komt en toont op een regel boven het chatvak wat er in een chat gaat voordat je verstuurt.",
      link: "Overstappen van ChatGPT naar Claude",
    },
    {
      q: "Waar wordt mijn geheugen bewaard, en wie kan het lezen?",
      a: "Elke chat wordt op je computer bewaard. Coere vraagt waaruit het geheugen gebouwd mag worden, en niets gaat naar een AI voordat je ja zegt. Een app kan je geheugen alleen lezen met een token dat jij toestaat, en dat token kun je op elk moment intrekken.",
    },
    {
      q: "Is Coere ook voor teams en ontwikkelaars?",
      a: "Ja. Coere Solutions bouwt één gedeeld geheugen van een bedrijf en zijn klanten, en een concept over één klant krijgt alleen het geheugen van die klant. Coere Forge geeft apps en AI-agents het geheugen van een persoon via een API, een MCP-server en SDK's voor TypeScript en Python, met toestemming van die persoon.",
      link: "Geheugen voor AI-agents",
    },
    {
      q: "Is Coere hetzelfde als Cohere?",
      a: "Nee. Coere is niet Cohere en heeft er geen banden mee. De naam komt van het Latijnse cohaerere, verbinden. Coere bouwt een geheugenlaag voor mensen, teams en apps.",
    },
    {
      q: "Kan ik Coere nu al gebruiken?",
      a: "Nog niet. Coere zit in de prelancering en de wachtlijst is open. Tot de lancering kun je de oprichters mailen over Coere voor jou, je team of je app.",
      link: "Mail de oprichters",
    },
  ],
};
