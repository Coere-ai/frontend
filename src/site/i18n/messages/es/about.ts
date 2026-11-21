import type { Messages } from "../types";

export const about: Messages["about"] = {
  seo: {
    title: "Sobre Coere: el equipo que construye la capa de memoria que es tuya",
    description: "Por qué existe Coere y quién lo construye. Coere es la capa de memoria de IA portátil que te pertenece.",
  },
  title: "Sobre nosotros",
  line: "Construimos la capa de memoria que pertenece a las personas",
  story: [
    "Coere nació cuando nos vimos explicando los mismos proyectos a cada IA a la que cambiábamos. Cada una sabía una parte de nosotros, y ninguna sabía el resto.",
    "Como usuarios y desarrolladores de IA, vimos la necesidad de una memoria unificada, propiedad del usuario, en todas las IA. Así que construimos un solo lugar que guarda lo que cada IA aprende de ti, lo lleva a cada chat nuevo y sigue siendo tuyo.",
  ],
  diagram: {
    label: "Por qué Coere",
    step: "Paso {n}",
    steps: [
      { title: "La IA está fragmentada.", text: "Usas una IA para programar, otra para clase y una tercera para todo lo demás. Ninguna habla con las otras." },
      { title: "Cada app guarda un trozo de ti.", text: "Cada una recuerda su propia parte de lo que le has contado. No puedes ver esos trozos ni llevártelos." },
      { title: "Coere lo une todo.", text: "Coere guarda tus chats de todas las IA y construye con ellos una sola memoria, con cada parte ligada al chat del que salió." },
      { title: "Y la memoria es tuya.", text: "La ves, la editas y decides qué IA y qué apps pueden leerla. Tu memoria te pertenece a ti, no a las apps." },
    ],
    pieces: ["Tu código", "Tus clases", "Tu viaje", "Tu investigación", "Tu trabajo", "Tus gustos"],
    yourMemory: "Tu memoria",
    from: "Desde",
    whoCanRead: "Quién puede leer tu memoria",
    allowed: "Permitido",
    notAllowed: "No permitido",
  },
  team: {
    eyebrow: "Nuestro equipo",
    title: "Las personas que construyen Coere",
    founders: [
      {
        role: "Cofundadora y CEO",
        majors: ["Empresariales", "Informática"],
        highlights: [
          "Hizo crecer un negocio hasta 25 locales en el Área de la Bahía",
          "Fundó MyNeighborExpert, una plataforma que conecta a estudiantes con expertos locales para clases y entrenamiento en deporte, estudios y música",
          "Da clase a más de 150 estudiantes en Berkeley Haas sobre cómo llevar el modelado 3D y las herramientas CAD al desarrollo de producto",
          "Hizo prácticas en la campaña de Sam Liccardo, en captación de fondos e investigación con encuestas",
          "Becaria de Inspirit AI en aprendizaje automático y aprendizaje profundo",
          "Compitió en la Blue Ocean Student Entrepreneur Competition de 2024",
        ],
      },
      {
        role: "Cofundador y CTO",
        majors: ["EECS", "Bioingeniería"],
        highlights: [
          "Ingeniero de software en Optagon Labs, responsable de las API de backend en producción, bases de datos, autenticación, facturación, infraestructura en la nube y seguridad",
          "Ha lanzado apps que usan más de 10.000 personas, varias de ellas destacadas por Google",
          "Desarrolla software de robótica y automatización para una plataforma de cultivo de neuronas en Neurotech@Berkeley",
          "Aprendizaje automático en Enhanced Ultrasound, con pipelines de segmentación de ecografías",
          "Tres años construyendo aplicaciones en la nube full-stack y seguras",
          "Regents' Scholar en varios campus de la UC, la beca más prestigiosa del sistema UC",
          "Walt Disney Scholar, beca concedida por The Walt Disney Company",
        ],
      },
    ],
  },
  closing: { title: "Ayúdanos a juntar las piezas.", text: "Estamos formando un equipo fundador y nos encantaría saber de ti." },
  demo: {
    seo: {
      title: "Demo de Coere: el producto, en directo",
      description: "Mira cómo Coere se configura, importa tus chats de todas las IA, construye una memoria que es tuya y la lleva a cada chat nuevo, en directo sobre el propio código de Coere.",
    },
    title: "Mira Coere en acción",
    line: "Todo el producto, en directo sobre el propio código de Coere: la configuración, la importación, la memoria que construye y lo que puedes hacer con ella.",
  },
};
