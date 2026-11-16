export type EventProfile = {
  slug: string;
  image: string;
  alt: string;
  period: string;
};

export const eventProfiles: EventProfile[] = [
  {
    slug: "european-researchers-night-2025-26",
    image: "experience/hololens-menu-original-v8.webp",
    alt: "Marina Ramiro interactuando con una interfaz de realidad extendida",
    period: "2025/26"
  },
  {
    slug: "vds-2025-26",
    image: "experience/hololens-brain-v2.webp",
    alt: "Demostración de visualización médica con HoloLens",
    period: "2025/26"
  },
  {
    slug: "go-digital-2026",
    image: "community-tech-network.png",
    alt: "Comunidad tecnológica compartiendo conocimiento",
    period: "2026"
  },
  {
    slug: "valencia-tech-talent-connect",
    image: "experience/workstation.webp",
    alt: "Entorno de desarrollo de experiencias XR",
    period: "Valencia"
  },
  {
    slug: "talent-land-malaga",
    image: "experience/hololens-interaction.webp",
    alt: "Marina Ramiro probando una interacción espacial",
    period: "Málaga"
  },
  {
    slug: "vr-day-2025-roundtable",
    image: "experience/hololens-spine-v2.webp",
    alt: "Marina Ramiro manipulando una visualización médica en realidad extendida",
    period: "2025"
  },
  {
    slug: "xr-workshop",
    image: "events/xr-demo.jpg",
    alt: "Demostración práctica de una experiencia XR",
    period: "XR"
  }
];
