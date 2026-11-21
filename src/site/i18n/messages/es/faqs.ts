import type { Messages } from "../types";

export const faqs: Messages["faqs"] = {
  home: [
    {
      q: "¿Qué es Coere?",
      a: "Coere es una capa de memoria de IA portátil que te pertenece. Coere Connect, una extensión de Chrome, guarda en tu ordenador tus chats con las IA que usas, construye con ellos un único grafo de memoria y añade el contexto adecuado a cada chat nuevo mientras escribes.",
      link: "Qué significa una memoria de IA portátil",
    },
    {
      q: "¿Con qué IA funciona Coere?",
      a: "{ais}. Todas alimentan la misma memoria, así que un chat nuevo en cualquiera de ellas parte de lo que ya dijiste en las demás.",
    },
    {
      q: "¿En qué se diferencia Coere de la memoria de ChatGPT o Claude?",
      a: "La memoria propia de cada IA se construye con lo que le contaste a esa IA y se queda dentro de ella. Claude y Gemini ya pueden importar a mano un resumen de otra IA. Coere construye una sola memoria con tus chats en todas las IA, guarda cada recuerdo junto a los chats de los que salió y te muestra lo que entra en un chat, en una línea sobre el cuadro de chat, antes de enviarlo.",
      link: "Pasar de ChatGPT a Claude",
    },
    {
      q: "¿Dónde se guarda mi memoria y quién puede leerla?",
      a: "Cada chat se guarda en tu ordenador. Coere te pregunta con qué construir la memoria, y nada llega a una IA hasta que dices que sí. Una app solo puede leer tu memoria con un token que tú autorices, y puedes revocarlo en cualquier momento.",
    },
    {
      q: "¿Coere también es para equipos y desarrolladores?",
      a: "Sí. Coere Solutions construye una memoria compartida de una empresa y sus clientes, y un borrador sobre un cliente solo recibe la memoria de ese cliente. Coere Forge da a las apps y a los agentes de IA la memoria de una persona a través de una API, un servidor MCP y SDK para TypeScript y Python, con el permiso de esa persona.",
      link: "Memoria para agentes de IA",
    },
    {
      q: "¿Puedo usar Coere hoy?",
      a: "Todavía no. Coere está en prelanzamiento y la lista de espera está abierta. Hasta el lanzamiento, puedes escribir a los fundadores sobre Coere para ti, tu equipo o tu app.",
      link: "Escribe a los fundadores",
    },
  ],
};
