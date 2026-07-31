import { portfolioConfig } from "../config/portfolio.config";

export const socialLinks = portfolioConfig.socialLinks;

export const socialItems = [
  { id: "instagram", label: "Instagram", href: socialLinks.instagram },
  { id: "youtube", label: "YouTube", href: socialLinks.youtube },
  { id: "linkedin", label: "LinkedIn", href: socialLinks.linkedin },
  { id: "github", label: "GitHub", href: socialLinks.github },
  { id: "email", label: "Email", href: socialLinks.email ? `mailto:${socialLinks.email}` : "" },
  { id: "whatsapp", label: "WhatsApp", href: socialLinks.whatsapp }
];
