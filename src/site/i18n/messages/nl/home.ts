import type { Messages } from "../types";

export const home: Messages["home"] = {
  hero: {
    title: "[Versnel] AI met een geheugen dat van jou is.",
    paragraph:
      "Coere versnelt AI door gebruikers eigenaar te maken van hun geheugen en context in de AI-tools die ze al gebruiken. Coere schrapt herhaald werk, verbetert de samenwerking en maakt elke interactie met AI effectiever.",
    extractionAlt: "Coere bewaart Maya's chats: 74 van 570 chats bewaard, nog ongeveer 5 minuten, en ChatGPT op 18 van 240",
    graphAlt: "De graaf op de pagina Geheugen: Persoonlijke info, Mensen, Toon en stem, Schrijfstijl en Werk, vertakkend vanuit de persoon",
  },
  ais: {
    title: "Neem je geheugen mee naar elke AI",
    line: "Wat je de ene AI vertelde, weet de volgende al.",
    loop: "De AI's waarmee Coere werkt",
  },
  products: {
    title: "Eén geheugen voor jou, je team en je app",
    line: "Kies de Coere die bij je past en zie wat hij doet.",
    kinds: { connect: "Voor gebruikers", solutions: "Voor teams", forge: "Voor ontwikkelaars" },
  },
  solves: {
    switchLabel: "Toon AI zonder of met Coere",
    today: {
      tab: "Zonder Coere",
      title: "Elke AI begint bij nul",
      line: "Vandaag hebben AI-toepassingen een versnipperd geheugen van hun gebruikers.",
      scenes: {
        switch: { title: "Van AI naar AI", line: "Elke keer dat iemand van toepassing wisselt, begint die opnieuw zonder enige context." },
        newChat: { title: "Een nieuwe chat in dezelfde AI", line: "Zelfs binnen één app kent een nieuwe chat je projecten, je voorkeuren en je geschiedenis niet, dus leg je jezelf elke keer opnieuw uit." },
        longChat: { title: "Binnen één lange chat", line: "Eerdere details raken ondergesneeuwd of vallen weg, en alles opnieuw plakken maakt de chat log, dus worden de antwoorden slechter." },
      },
      developers: { lead: "Ontwikkelaars hebben hetzelfde probleem, van de andere kant.", rest: "Elk AI-bedrijf bouwt zijn eigen geïsoleerde geheugen, en hun apps weten op dag één nog steeds niets van een nieuwe gebruiker." },
      waitlist: "Los het op voor je app via de wachtlijst voor ontwikkelaars",
    },
    coere: {
      tab: "Met Coere",
      title: "Geheugen dat de persoon volgt, niet de app",
      line: "Coere is een universele geheugenlaag die van de gebruiker is. Hij voegt de context toe die elk antwoord nodig heeft, zodat de AI heeft wat relevant is, niets meer.",
      scenes: {
        switch: { title: "In elke app", line: "De volgende AI begint met wat de vorige leerde, want je geheugen volgt jou." },
        newChat: { title: "In elke nieuwe chat", line: "Je projecten en voorkeuren komen mee met je eerste bericht, dus je hoeft jezelf nooit opnieuw uit te leggen." },
        longChat: { title: "Op elk moment in een gesprek", line: "Het detail dat ondersneeuwde komt terug wanneer het ertoe doet, en de chat blijft licht." },
      },
      developers: { lead: "Met toestemming van de gebruiker", rest: "kunnen ontwikkelaars onze API integreren om die context te gebruiken en hun apps vanaf dag één te personaliseren, in plaats van hun eigen geheugensystemen te bouwen." },
      waitlist: "Meld je aan voor de wachtlijst voor ontwikkelaars",
    },
  },
  faqTitle: "Wat mensen vragen over Coere",
  blog: { title: "Nieuws van het team", read: "Lees de blog" },
  closing: {
    title: "Jouw geheugen is van jou.",
    text: "Praat met de oprichters over Coere voor jou, je team of je app.",
  },
};
