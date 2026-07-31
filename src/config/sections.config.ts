import { portfolioConfig } from "./portfolio.config";

export const enabledSections = portfolioConfig.sections
  .filter((section) => section.enabled)
  .sort((a, b) => a.order - b.order);
