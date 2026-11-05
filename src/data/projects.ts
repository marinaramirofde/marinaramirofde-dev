export interface ProjectEntry {
  slug: string;
  code: string;
  title: string;
  summary: string;
  stack: string;
  accent: "blue" | "orange" | "rose";
  visual: "medical" | "research" | "education" | "hololens" | "quest";
}

export const projects: ProjectEntry[] = [
  {
    slug: "hololens-clinical-assistant",
    code: "MR-01",
    title: "HoloLens Clinical Assistant",
    summary: "Concepto de asistencia clínica manos libres para consultar información dentro del entorno de trabajo.",
    stack: "HoloLens 2 / MRTK / OpenXR",
    accent: "blue",
    visual: "hololens"
  },
  {
    slug: "ar-research-prototype",
    code: "AR-02",
    title: "AR Research Prototype",
    summary: "Prototipos de realidad aumentada aplicados a investigación, interacción y visualización.",
    stack: "Unity / C# / AR",
    accent: "orange",
    visual: "research"
  },
  {
    slug: "xr-medical-viewer",
    code: "XR-01",
    title: "XR Medical Viewer",
    summary: "Visualización inmersiva de información clínica para explorar datos complejos con claridad.",
    stack: "Three.js / WebXR / Salud",
    accent: "blue",
    visual: "medical"
  },
  {
    slug: "immersive-education-lab",
    code: "VR-03",
    title: "Immersive Education Lab",
    summary: "Experiencias educativas inmersivas que conectan aprendizaje, talleres y comunidad.",
    stack: "XR / UX / Comunidad",
    accent: "rose",
    visual: "education"
  },
  {
    slug: "meta-quest-training-lab",
    code: "VR-04",
    title: "Meta Quest Training Lab",
    summary: "Entorno inmersivo orientado a formación, validación de flujos y aprendizaje práctico.",
    stack: "Meta Quest / Meta XR SDK / Unity",
    accent: "blue",
    visual: "quest"
  }
];
