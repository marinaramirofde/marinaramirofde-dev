import type { PortfolioConfig } from "../types/portfolio";

export const portfolioConfig: PortfolioConfig = {
  brandName: "Marina Ramiro",
  handle: "marinaramirofde_dev",
  role: "XR Developer & Software Engineer",
  domain: "marinaramirofde.dev",
  defaultLocale: "es",
  supportedLocales: ["es", "en"],
  intro: {
    enabled: false,
    durationMs: 4200,
    sessionStorageKey: "marina-xr-intro-seen"
  },
  features: {
    animations: true,
    xrIntro: false,
    scrollProgress: true
  },
  form: {
    provider: "formspree",
    endpoint: ""
  },
  socialLinks: {
    instagram: "",
    youtube: "",
    linkedin: "https://www.linkedin.com/in/marinaramirofde",
    github: "",
    whatsapp: "",
    whatsappCommunity: "",
    email: "",
    cv: ""
  },
  sections: [
    { id: "hero", enabled: true, order: 1, variant: "light" },
    { id: "dashboard", enabled: true, order: 2, variant: "dark" },
    { id: "about", enabled: true, order: 3, variant: "soft" },
    { id: "projects", enabled: true, order: 4, variant: "light" },
    { id: "research", enabled: true, order: 5, variant: "dark" },
    { id: "events", enabled: true, order: 6, variant: "soft" },
    { id: "talks", enabled: true, order: 7, variant: "light" },
    { id: "services", enabled: true, order: 8, variant: "dark" },
    { id: "skills", enabled: true, order: 9, variant: "soft" },
    { id: "gallery", enabled: true, order: 10, variant: "light" },
    { id: "community", enabled: true, order: 11, variant: "accent" },
    { id: "contact", enabled: true, order: 12, variant: "dark" }
  ]
};
