import type { Messages } from "../types";

export const catalog: Messages["catalog"] = {
  products: {
    connect: {
      kind: "Memoria para personas",
      tagline: "Tu memoria, en todas las IA.",
      description: "Una capa de memoria que te pertenece. Guarda tus chats de todas las IA que usas y lleva el contexto adecuado a cada chat nuevo.",
    },
    solutions: {
      kind: "Memoria para equipos",
      tagline: "Una sola memoria para toda la empresa.",
      description: "Una memoria compartida para una empresa, su gente y sus clientes. Cada chat parte de lo que el equipo ya sabe.",
    },
    forge: {
      kind: "Memoria para desarrolladores",
      tagline: "Infraestructura de memoria para tus apps.",
      description: "La API, el servidor MCP y los SDK que permiten a tus apps y agentes usar Coere como capa de memoria, con el permiso de la persona.",
    },
    agents: {
      kind: "Agentes para cada sector",
      tagline: "Un solo asistente, infinitas posibilidades, sobre tu memoria.",
      description: "Cori, el asistente de Coere, en una versión para cada sector. Cada uno trabaja a partir de tu memoria y reparte las tareas grandes entre varios trabajadores.",
    },
  },
  features: {
    memory: {
      name: "Memoria",
      title: "Todo lo que aprendió de tus chats, en un solo grafo",
      description: "Coere ordena lo que dicen tus chats en secciones y carpetas y lo dibuja a tu alrededor. Cada recuerdo conserva los mensajes de los que salió.",
    },
    extraction: {
      name: "Extracción",
      title: "Todos tus chats, guardados en un solo lugar",
      description: "El botón Extract all lee ChatGPT, Claude y Gemini y guarda cada chat en tu ordenador. Después, los chats nuevos llegan solos.",
    },
    "smart-context": {
      name: "Contexto inteligente",
      title: "El contexto adecuado entra mientras escribes",
      description: "Una línea sobre el cuadro de chat dice qué añadirá Coere y de qué IA lo aprendió. Un solo Enter envía tu mensaje con el contexto delante.",
    },
    voice: {
      name: "Voz",
      title: "Pregunta en voz alta y escucha la respuesta",
      description: "Mantén pulsada la tecla Opción derecha y habla. Cori muestra tus palabras mientras hablas y responde en voz alta al soltarla.",
    },
    cori: {
      name: "Cori",
      title: "Un solo asistente en todas las IA",
      description: "Cori encuentra tus chats antiguos con palabras sencillas y explica cómo funciona Coere, en el panel, en la barra de herramientas y en cualquier sitio de IA.",
    },
    actions: {
      name: "Acciones",
      title: "Correos escritos con tu propio estilo",
      description: "Pídele un correo a Cori y lo escribe en su propia pestaña de Gmail con lo que sabe tu memoria. Pregunta antes de enviarlo a alguien que no nombraste.",
    },
    writer: {
      name: "Redacción",
      title: "Mejora tu texto justo donde está",
      description: "Selecciona texto en Gmail, Docs o un cuadro de chat. Cori lo corrige o lo mejora y marca cada cambio en azul hasta que lo aceptes o lo deshagas.",
    },
    "any-site": {
      name: "Cualquier sitio",
      title: "Formularios y cuestionarios con lo que ya sabes",
      description: "En cualquier página, Cori avanza paso a paso desde tu memoria, pregunta antes de enviar y se detiene si una página intenta darle órdenes.",
    },
    workers: {
      name: "Trabajadores",
      title: "Investigación repartida en muchas pestañas",
      description: "Una tarea grande se ejecuta en varias pestañas a la vez. Lo que encuentran se une en una sola tabla, cada dato con la página de la que salió.",
    },
  },
  seeAllFeatures: "Ver todas las funciones",
  applications: {
    consumer: { name: "Particulares", summary: "Una sola memoria en todas las IA." },
    developer: { name: "Desarrolladores", summary: "Apps y agentes que leen la memoria." },
    business: { name: "Empresas", summary: "La memoria de la empresa y sus clientes." },
  },
  industries: {
    finance: { name: "Finanzas", summary: "Cada asesor parte del historial completo.", uses: ["Memoria de clientes", "Seguimiento de reuniones"], alt: "La Bolsa de Nueva York en Wall Street" },
    technology: { name: "Tecnología", summary: "Contexto de ingeniería, de herramienta en herramienta.", uses: ["Memoria de proyectos", "Contexto para agentes"], alt: "San Francisco de noche con la Salesforce Tower" },
    commerce: { name: "Comercio", summary: "Acuerdos y compromisos en todos los mercados.", uses: ["Memoria de cuentas", "Historial de socios"], alt: "El horizonte de Hong Kong al otro lado del puerto Victoria" },
    consumer: { name: "Consumo", summary: "Clientes reconocidos en todos los canales.", uses: ["Memoria de clientes", "Contexto de soporte"], alt: "Un pasillo de supermercado con los estantes llenos" },
    manufacturing: { name: "Fabricación", summary: "Lo que aprendió la línea se queda en la planta.", uses: ["Notas de líneas y máquinas", "Memoria de relevos"], alt: "Brazos robóticos en una línea de montaje" },
    energy: { name: "Energía", summary: "El conocimiento de campo se queda en la empresa.", uses: ["Notas de sitios y equipos", "Memoria de relevos"], alt: "Aerogeneradores en las colinas de Livermore sobre la niebla" },
    education: { name: "Educación", summary: "Clases que retoman donde lo dejaron.", uses: ["Memoria de cursos", "Contexto de estudio"], alt: "La torre Sather de UC Berkeley" },
    legal: { name: "Legal", summary: "Asuntos y precedentes en todo el despacho.", uses: ["Memoria de asuntos", "Historial de clientes"], alt: "El Tribunal Supremo de los Estados Unidos" },
  },
  guides: {
    "portable-ai-memory": { name: "Memoria de IA portátil", kind: "Qué es" },
    "chatgpt-to-claude-memory": { name: "Memoria de ChatGPT a Claude", kind: "Cambiar de IA" },
    "ai-agent-memory": { name: "Memoria para agentes de IA", kind: "Para desarrolladores" },
  },
};
