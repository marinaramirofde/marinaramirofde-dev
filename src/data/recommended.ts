export interface RecommendedProduct {
  title: string;
  category: string;
  description: string;
  href: string;
  visual: "headset" | "mouse" | "audio" | "hub" | "reader" | "storage";
}

export const recommendedProducts: RecommendedProduct[] = [
  {
    title: "Meta Quest 3",
    category: "XR",
    description: "Gafas de realidad mixta para probar experiencias inmersivas, demos XR y prototipos interactivos.",
    href: "https://www.amazon.es/s?k=Meta+Quest+3",
    visual: "headset"
  },
  {
    title: "Logitech MX Master 3S",
    category: "Productividad",
    description: "Ratón cómodo y preciso para diseño, desarrollo y jornadas largas frente al ordenador.",
    href: "https://www.amazon.es/s?k=Logitech+MX+Master+3S",
    visual: "mouse"
  },
  {
    title: "AirPods Pro",
    category: "Audio",
    description: "Auriculares compactos con cancelación de ruido para concentrarse, grabar ideas y trabajar en movilidad.",
    href: "https://www.amazon.es/s?k=AirPods+Pro",
    visual: "audio"
  },
  {
    title: "Hub USB-C Anker",
    category: "Setup",
    description: "Adaptador útil para conectar pantallas, tarjetas y accesorios cuando trabajo con portátil.",
    href: "https://www.amazon.es/s?k=hub+usb+c+anker",
    visual: "hub"
  },
  {
    title: "Kindle Paperwhite",
    category: "Lectura",
    description: "Lector ligero para estudiar documentación, libros técnicos y referencias sin distracciones.",
    href: "https://www.amazon.es/s?k=Kindle+Paperwhite",
    visual: "reader"
  },
  {
    title: "Samsung T7 SSD",
    category: "Almacenamiento",
    description: "SSD externo rápido para proyectos, recursos visuales, copias y material de trabajo pesado.",
    href: "https://www.amazon.es/s?k=Samsung+T7+SSD",
    visual: "storage"
  }
];