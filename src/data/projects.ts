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
  gallery: ProjectGalleryImage[];
}

export const projects: ProjectEntry[] = [
  {
    slug: "hololens-clinical-assistant",
    code: "MR-01",
    title: "HoloLens Clinical Assistant",
    summary: "Asistencia clínica manos libres para consultar información sin abandonar el entorno de trabajo.",
    description: "Concepto de experiencia de realidad mixta pensado para presentar información clínica de forma contextual, legible y accesible mediante interacción espacial.",
    category: "Realidad mixta · Salud",
    stack: "HoloLens 2 / MRTK / OpenXR",
    technologies: ["Unity", "C#", "HoloLens 2", "MRTK", "OpenXR"],
    useCase: "Consulta de datos y apoyo visual durante un flujo clínico en el que las manos deben permanecer disponibles.",
    objective: "Definir una navegación espacial clara que reduzca cambios de contexto y mantenga la información importante dentro del campo de visión.",
    outcome: "Concepto de interacción, jerarquía de información y recorrido funcional preparados para una fase de validación.",
    client: "Proyecto propio · Portfolio",
    partners: "Sin socios externos indicados",
    status: "Caso conceptual",
    accent: "blue",
    visual: "hololens",
    coverImage: "/projects/hololens-clinical-assistant/cover.svg",
    gallery: [
      { src: "/projects/hololens-clinical-assistant/interface.svg", alt: "Concepto visual de una interfaz clínica espacial para HoloLens", caption: "Interfaz espacial y consulta contextual" },
      { src: "/projects/hololens-clinical-assistant/cover.svg", alt: "Ilustración del proyecto HoloLens Clinical Assistant", caption: "Dirección visual del caso de estudio" }
    ]
  },
  {
    slug: "ar-research-prototype",
    code: "AR-02",
    title: "AR Research Prototype",
    summary: "Prototipos de realidad aumentada aplicados a investigación, interacción y visualización.",
    description: "Laboratorio de exploración para estudiar cómo situar capas de información digital sobre objetos y espacios físicos sin perder contexto.",
    category: "Realidad aumentada · Investigación",
    stack: "Unity / C# / AR",
    technologies: ["Unity", "C#", "AR Foundation", "Diseño de interacción"],
    useCase: "Ensayos de interacción aumentada, anotación espacial y presentación de resultados dentro del propio entorno observado.",
    objective: "Construir una base de prototipado rápido con la que comparar interacciones y validar su comprensión antes de desarrollar producto.",
    outcome: "Sistema visual y flujo experimental definidos para iterar diferentes hipótesis de interacción aumentada.",
    client: "Proyecto propio · Investigación",
    partners: "Sin socios externos indicados",
    status: "Prototipo exploratorio",
    accent: "orange",
    visual: "research",
    coverImage: "/projects/ar-research-prototype/cover.svg",
    gallery: [
      { src: "/projects/ar-research-prototype/interface.svg", alt: "Diagrama de anotaciones y puntos de seguimiento en realidad aumentada", caption: "Anotación espacial y puntos de interés" },
      { src: "/projects/ar-research-prototype/cover.svg", alt: "Ilustración del proyecto AR Research Prototype", caption: "Lenguaje visual del prototipo" }
    ]
  },
  {
    slug: "xr-medical-viewer",
    code: "XR-01",
    title: "XR Medical Viewer",
    summary: "Visualización inmersiva de información clínica para explorar datos complejos con claridad.",
    description: "Visor XR orientado a organizar información médica, modelos y datos de imagen dentro de un espacio de trabajo inmersivo comprensible.",
    category: "XR · Visualización médica",
    stack: "Three.js / WebXR / Salud",
    technologies: ["Three.js", "WebXR", "TypeScript", "DICOM", "NIfTI"],
    useCase: "Exploración de información clínica y modelos médicos en una composición espacial que facilite la lectura conjunta de varias fuentes.",
    objective: "Convertir datos médicos complejos en una experiencia visual ordenada, navegable y preparada para distintos dispositivos XR.",
    outcome: "Arquitectura de visor, distribución de paneles y representación volumétrica documentadas como base del producto.",
    client: "Proyecto propio · Portfolio",
    partners: "Sin socios externos indicados",
    status: "Caso en desarrollo",
    accent: "blue",
    visual: "medical",
    coverImage: "/projects/xr-medical-viewer/cover.svg",
    gallery: [
      { src: "/projects/xr-medical-viewer/interface.svg", alt: "Interfaz conceptual de un visor médico XR con paneles de datos", caption: "Organización del espacio de trabajo clínico" },
      { src: "/projects/xr-medical-viewer/cover.svg", alt: "Ilustración del proyecto XR Medical Viewer", caption: "Visualización volumétrica y capas de datos" }
    ]
  },
  {
    slug: "immersive-education-lab",
    code: "VR-03",
    title: "Immersive Education Lab",
    summary: "Experiencias educativas inmersivas que conectan aprendizaje, talleres y comunidad.",
    description: "Concepto de laboratorio educativo donde los contenidos se convierten en actividades espaciales, prácticas y colaborativas.",
    category: "XR · Educación",
    stack: "XR / UX / Comunidad",
    technologies: ["Unity", "XR", "UX", "Prototipado", "Diseño educativo"],
    useCase: "Talleres y sesiones formativas en las que el alumnado aprende mediante práctica, exploración y colaboración dentro de un entorno inmersivo.",
    objective: "Diseñar una experiencia educativa modular que pueda adaptar contenidos, retos y niveles de acompañamiento.",
    outcome: "Estructura de sesión, sistema de actividades y recorrido de aprendizaje definidos para futuras pruebas con usuarios.",
    client: "Laboratorio conceptual · Portfolio",
    partners: "Sin socios externos indicados",
    status: "Concepto de experiencia",
    accent: "rose",
    visual: "education",
    coverImage: "/projects/immersive-education-lab/cover.svg",
    gallery: [
      { src: "/projects/immersive-education-lab/interface.svg", alt: "Mapa conceptual de una experiencia educativa inmersiva", caption: "Recorrido modular de aprendizaje" },
      { src: "/projects/immersive-education-lab/cover.svg", alt: "Ilustración del proyecto Immersive Education Lab", caption: "Entorno de aprendizaje y colaboración" }
    ]
  },
  {
    slug: "meta-quest-training-lab",
    code: "VR-04",
    title: "Meta Quest Training Lab",
    summary: "Entorno inmersivo para formación, validación de flujos y aprendizaje práctico.",
    description: "Propuesta de entrenamiento VR centrada en aprender procedimientos mediante práctica guiada, feedback contextual y repetición segura.",
    category: "VR · Formación",
    stack: "Meta Quest / Meta XR SDK / Unity",
    technologies: ["Meta Quest", "Meta XR SDK", "Unity", "C#", "OpenXR"],
    useCase: "Formación práctica de tareas y procedimientos que necesitan repetición, secuenciación y feedback sin depender del espacio físico real.",
    objective: "Crear un flujo de entrenamiento claro, medible y reutilizable que guíe a la persona sin romper la sensación de presencia.",
    outcome: "Secuencia de entrenamiento, estados de ayuda y sistema de feedback definidos como base del prototipo inmersivo.",
    client: "Proyecto propio · Portfolio",
    partners: "Sin socios externos indicados",
    status: "Prototipo conceptual",
    accent: "blue",
    visual: "quest",
    coverImage: "/projects/meta-quest-training-lab/cover.svg",
    gallery: [
      { src: "/projects/meta-quest-training-lab/interface.svg", alt: "Secuencia de pasos de una experiencia de formación en Meta Quest", caption: "Flujo guiado y feedback contextual" },
      { src: "/projects/meta-quest-training-lab/cover.svg", alt: "Ilustración del proyecto Meta Quest Training Lab", caption: "Espacio de entrenamiento inmersivo" }
    ]
  }
];
