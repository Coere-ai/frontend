import type { Messages } from "../types";

export const home: Messages["home"] = {
  hero: {
    title: "[Aceleramos] la IA con una memoria que es tuya.",
    paragraph:
      "Coere acelera la IA al dar a cada persona la propiedad de su memoria y su contexto en las herramientas de IA que ya usa. Coere elimina el trabajo repetitivo, mejora la colaboración y hace que cada interacción con la IA sea más eficaz.",
    extractionAlt: "Coere guardando los chats de Maya: 74 de 570 chats guardados, quedan unos 5 minutos y ChatGPT va por 18 de 240",
    graphAlt: "El grafo de la página Memoria: Información personal, Personas, Tono y voz, Estilo de escritura y Trabajo, que salen de la persona",
  },
  ais: {
    title: "Lleva tu memoria a todas las IA",
    line: "Lo que le contaste a una IA, la siguiente ya lo sabe.",
    loop: "Las IA con las que funciona Coere",
  },
  products: {
    title: "Una sola memoria para ti, tu equipo y tu app",
    line: "Elige el Coere que encaja contigo y descubre lo que hace.",
    kinds: { connect: "Para usuarios", solutions: "Para equipos", forge: "Para desarrolladores" },
  },
  solves: {
    switchLabel: "Mostrar la IA sin Coere o con Coere",
    today: {
      tab: "Sin Coere",
      title: "Cada IA empieza desde cero",
      line: "Hoy, las aplicaciones de IA tienen una memoria fragmentada de sus usuarios.",
      scenes: {
        switch: { title: "Pasar de una IA a otra", line: "Cada vez que alguien cambia de aplicación, vuelve a empezar sin ningún contexto." },
        newChat: { title: "Un chat nuevo en la misma IA", line: "Incluso dentro de una misma app, un chat nuevo no conoce tus proyectos, tus preferencias ni tu historial, así que te toca explicarte otra vez." },
        longChat: { title: "Dentro de un chat largo", line: "Los detalles del principio quedan enterrados o se pierden, y volver a pegarlo todo sobrecarga el chat, así que las respuestas empeoran." },
      },
      developers: { lead: "Los desarrolladores tienen el mismo problema desde el otro lado.", rest: "Cada empresa de IA construye su propia memoria aislada, y sus apps siguen sin saber nada de un usuario nuevo el primer día." },
      waitlist: "Resuélvelo para tu app en la lista de espera para desarrolladores",
    },
    coere: {
      tab: "Con Coere",
      title: "Una memoria que sigue a la persona, no a la app",
      line: "Coere es una capa de memoria universal que pertenece al usuario. Añade el contexto que necesita cada respuesta, para que la IA tenga lo relevante y nada más.",
      scenes: {
        switch: { title: "En cualquier app", line: "La siguiente IA empieza con lo que aprendió la anterior, porque tu memoria te sigue." },
        newChat: { title: "En cada chat nuevo", line: "Tus proyectos y preferencias llegan con tu primer mensaje, así que nunca tienes que volver a explicarte." },
        longChat: { title: "En cualquier momento de la conversación", line: "El detalle que quedó enterrado vuelve cuando importa, y el chat se mantiene ligero." },
      },
      developers: { lead: "Con el permiso del usuario,", rest: "los desarrolladores pueden integrar nuestra API para acceder a ese contexto y personalizar sus apps desde el primer día, sin construir sus propios sistemas de memoria." },
      waitlist: "Únete a la lista de espera para desarrolladores",
    },
  },
  faqTitle: "Lo que la gente pregunta sobre Coere",
  blog: { title: "Noticias del equipo", read: "Leer el blog" },
  closing: {
    title: "Tu memoria te pertenece.",
    text: "Habla con los fundadores sobre Coere para ti, tu equipo o tu app.",
  },
};
