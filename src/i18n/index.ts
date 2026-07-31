import { en } from "./en";
import { es } from "./es";
import type { Locale } from "../types/portfolio";

export const dictionaries = { es, en };

export type TranslationKey = keyof typeof es;

export function getDictionary(locale: Locale = "es") {
  return dictionaries[locale] ?? dictionaries.es;
}
