import type { Messages } from "../types";

export const pricing: Messages["pricing"] = {
  title: "Un plan para ti, tu equipo o tu app",
  line: "Coere es gratis para una persona. Para equipos y desarrolladores, hablemos.",
  plansLabel: "Planes",
  plans: {
    consumer: {
      name: "Personal",
      kind: "Para ti",
      price: "Gratis",
      priceNote: "Coere Connect, para una persona",
      line: "Una memoria que es tuya, en todas las IA que usas.",
      features: ["Transferencias ilimitadas entre IA", "Extracción ilimitada de tus chats", "Una sola memoria en ChatGPT, Claude, Gemini y más", "Primero en local, con copia de seguridad en coere.ai"],
      cta: "Empieza gratis",
    },
    team: {
      name: "Equipo",
      kind: "Para empresas",
      price: "Contáctanos",
      priceNote: "Coere Solutions, para todo tu equipo",
      line: "Una memoria compartida para la empresa, su gente y sus clientes.",
      features: ["Seguridad empresarial", "Inicio de sesión único (SSO)", "Registros de auditoría", "Una memoria compartida del equipo", "Controles de administración para invitaciones, roles y accesos"],
      cta: "Reserva una demo",
    },
    developer: {
      name: "Desarrollador",
      kind: "Para tu app",
      price: "Por usuario",
      priceNote: "Coere Forge, según el uso",
      line: "Da a los usuarios de tu app la memoria que ya construyeron.",
      features: ["La API de memoria", "Un servidor MCP para tus agentes", "SDK para TypeScript y Python", "Tokens con permisos limitados que la persona puede revocar", "Según el uso, por usuario"],
      cta: "Únete a la lista de espera",
    },
  },
  closing: { title: "¿No sabes qué plan te conviene?", text: "Habla con los fundadores sobre Coere para ti, tu equipo o tu app." },
};
