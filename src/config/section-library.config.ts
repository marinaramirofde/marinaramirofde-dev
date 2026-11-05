export type SectionExampleCategory = "projects" | "about" | "content" | "contact";

export interface SectionExample {
  id: string;
  name: string;
  category: SectionExampleCategory;
  description: string;
  inspiration: string;
}

export const sectionExamples: SectionExample[] = [
  {
    id: "projects-perspective-carousel",
    name: "Carrusel de proyectos en perspectiva",
    category: "projects",
    description: "Una baraja horizontal de casos de estudio con foco central, navegación lateral y acceso directo a cada proyecto.",
    inspiration: "nowarlab.com"
  }
];

/**
 * Selector de variantes públicas.
 * Usa el id de una sección guardada o null para conservar el diseño actual.
 */
export const selectedSectionExamples: Record<SectionExampleCategory, string | null> = {
  projects: null,
  about: null,
  content: null,
  contact: null
};

export const isSectionExampleSelected = (category: SectionExampleCategory, id: string) =>
  selectedSectionExamples[category] === id;
