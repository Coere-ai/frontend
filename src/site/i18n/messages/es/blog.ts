import type { Messages } from "../types";

export const blog: Messages["blog"] = {
  title: "El blog de Coere",
  line: "Noticias, lanzamientos y notas del equipo que construye la capa de memoria que es tuya.",
  readNewest: "Lee la última entrada",
  more: "Más entradas",
  filterLabel: "Filtrar entradas por categoría",
  all: "Todas",
  categories: { Company: "Empresa", Product: "Producto", Developers: "Desarrolladores" },
  count: { one: "{count} entrada", other: "{count} entradas" },
  countIn: { one: "{count} entrada en {category}", other: "{count} entradas en {category}" },
  minutes: "{minutes} min de lectura",
  posts: {
    "introducing-coere-connect": {
      title: "Presentamos Coere Connect, una sola memoria en todas las IA",
      excerpt: "Tus chats con todas las IA, guardados en un solo lugar y llevados a cada chat nuevo.",
    },
    "coere-solutions": {
      title: "Coere Solutions: una sola memoria para todo tu equipo",
      excerpt: "El conocimiento de la empresa y cada cliente, recordados por todo el equipo.",
    },
    "coere-forge": {
      title: "Forge: dale memoria a tu app desde el primer día",
      excerpt: "La API, el servidor MCP y los SDK para construir sobre Coere.",
    },
    "catalyst-26": {
      title: "Catalyst 26: lo que construimos este año",
      excerpt: "Hacia dónde va Coere y por qué la memoria debe pertenecer a las personas.",
    },
  },
};
