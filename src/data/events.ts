import content from "./site-content.json";

export type EventProfile = {
  slug: string;
  image: string;
  alt: string;
  period: string;
};

export const eventProfiles: EventProfile[] = content.eventProfiles;
