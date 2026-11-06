export interface ProjectGalleryImage {
  src: string;
  alt: string;
  caption: string;
}

export interface ProjectEntry {
  slug: string;
  code: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  role: string;
  stack: string;
  technologies: string[];
  useCase: string;
  objective: string;
  outcome: string;
  client: string;
  partners: string;
  status: string;
  accent: "blue" | "orange" | "rose";
  visual: "medical" | "research" | "education" | "hololens" | "quest";
  coverImage: string;
  externalUrl?: string;
  gallery: ProjectGalleryImage[];
}

export const projects: ProjectEntry[] = [
  {
    slug: "vr-ehabilitar",
    code: "VR-01",
    title: "VR·EHABILITAR",
    summary: "Aplicación de realidad virtual para la rehabilitación del miembro superior después de un ictus.",
    description: "Experiencia de rehabilitación post-ictus desarrollada en Unity para Meta Quest 2, con actividades adaptadas e interacción mediante seguimiento de manos o controladores.",
    category: "Realidad virtual · Salud",
    role: "Desarrollo de aplicación VR",
    stack: "Unity / Meta Quest 2 / Hand Tracking",
    technologies: ["Unity", "C#", "Meta Quest 2", "Hand Tracking", "Controladores VR"],
    useCase: "Rehabilitación del miembro superior mediante ejercicios inmersivos que permiten practicar movimientos y recibir feedback dentro de un entorno accesible y motivador.",
    objective: "Ofrecer una experiencia de rehabilitación personalizable que combine accesibilidad, autonomía y una interacción adecuada para diferentes capacidades motoras.",
    outcome: "Aplicación VR desarrollada con actividades específicas, feedback de aciertos y fallos y dos modalidades de interacción: seguimiento de manos y controladores.",
    client: "No indicado",
    partners: "No indicados",
    status: "Proyecto desarrollado",
    accent: "orange",
    visual: "quest",
    coverImage: "/projects/vr-ehabilitar/cover.png",
    gallery: [
      {
        src: "/projects/vr-ehabilitar/cover.png",
        alt: "Composición de pantallas, ejercicios y modalidades de interacción de VR Ehabilitar",
        caption: "Recorrido, actividades y modalidades de interacción"
      },
      {
        src: "/projects/xr-projects-overview.png",
        alt: "Presentación conjunta de los proyectos VR Ehabilitar y ARTEMISA",
        caption: "VR·EHABILITAR dentro de la selección de proyectos XR"
      }
    ]
  },
  {
    slug: "artemisa",
    code: "AR-01",
    title: "ARTEMISA",
    summary: "Plataforma de realidad aumentada e imagen médica para apoyar la planificación neuroquirúrgica.",
    description: "Desarrollo y coordinación técnica de una plataforma AR para visualizar información clínica y modelos cerebrales en HoloLens 2 durante la planificación neuroquirúrgica.",
    category: "Realidad aumentada · Salud",
    role: "Desarrollo y coordinación técnica",
    stack: "Unity / HoloLens 2 / Imagen médica",
    technologies: ["Unity", "C#", "HoloLens 2", "Holographic Remoting", "Imagen médica"],
    useCase: "Planificación neuroquirúrgica con visualización espacial de estudios médicos, cortes multiplanares y modelos cerebrales dentro de una interfaz aumentada.",
    objective: "Transformar datos de imagen médica en una herramienta espacial comprensible que facilite la exploración, la medición y la preparación de intervenciones.",
    outcome: "Participación en todo el ciclo del proyecto: diseño, desarrollo en Unity, coordinación técnica, pruebas y validación con neurocirujanos.",
    client: "Proyecto ARTEMISA",
    partners: "Neurocirujanos, equipo multidisciplinar y socios tecnológicos",
    status: "Plataforma desarrollada y validada",
    accent: "blue",
    visual: "medical",
    coverImage: "/projects/artemisa/cover.png",
    externalUrl: "https://artemisapro.com/",
    gallery: [
      {
        src: "/projects/artemisa/cover.png",
        alt: "Composición del sistema ARTEMISA con interfaz clínica, visualización cerebral y uso en quirófano",
        caption: "Interfaz clínica, visualización cerebral y contexto de uso"
      },
      {
        src: "/projects/xr-projects-overview.png",
        alt: "Presentación conjunta de los proyectos VR Ehabilitar y ARTEMISA",
        caption: "ARTEMISA dentro de la selección de proyectos XR"
      }
    ]
  }
];
