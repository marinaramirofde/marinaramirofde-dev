export type Locale = "es" | "en";

export interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
  variant: "light" | "dark" | "soft" | "accent";
}

export interface SocialLinks {
  instagram: string;
  youtube: string;
  linkedin: string;
  github: string;
  whatsapp: string;
  whatsappCommunity: string;
  email: string;
  cv: string;
}

export interface PortfolioConfig {
  brandName: string;
  handle: string;
  role: string;
  domain: string;
  defaultLocale: Locale;
  supportedLocales: Locale[];
  intro: {
    enabled: boolean;
    durationMs: number;
    sessionStorageKey: string;
  };
  features: {
    animations: boolean;
    xrIntro: boolean;
    scrollProgress: boolean;
  };
  form: {
    provider: "formspree" | "web3forms" | "emailjs" | "mailto";
    endpoint: string;
  };
  socialLinks: SocialLinks;
  sections: SectionConfig[];
}
