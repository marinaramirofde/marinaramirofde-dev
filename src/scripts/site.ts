import { dictionaries } from "../i18n";
import { portfolioConfig } from "../config/portfolio.config";
import { animationsConfig } from "../config/animations.config";
import type { Locale } from "../types/portfolio";

const localeKey = "marina-preferred-locale";

function getNestedValue(source: unknown, path: string): string {
  return path.split(".").reduce<unknown>((value, key) => {
    if (Array.isArray(value)) return value[Number(key)];
    if (value && typeof value === "object") return (value as Record<string, unknown>)[key];
    return undefined;
  }, source) as string;
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(localeKey) as Locale | null;
  if (stored && portfolioConfig.supportedLocales.includes(stored)) return stored;

  const browserLocale = navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
  localStorage.setItem(localeKey, browserLocale);
  return browserLocale;
}

function applyLocale(locale: Locale) {
  const dictionary = dictionaries[locale];
  document.documentElement.lang = locale;
  localStorage.setItem(localeKey, locale);

  // Update all translated text nodes from the central dictionaries.
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (!key) return;
    const value = getNestedValue(dictionary, key);
    if (typeof value === "string") element.textContent = value;
  });

  document.querySelectorAll<HTMLMetaElement>("[data-i18n-content]").forEach((element) => {
    const key = element.dataset.i18nContent;
    if (!key) return;
    const value = getNestedValue(dictionary, key);
    if (typeof value === "string") element.setAttribute("content", value);
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((element) => {
    const key = element.dataset.i18nAria;
    if (!key) return;
    const value = getNestedValue(dictionary, key);
    if (typeof value === "string") element.setAttribute("aria-label", value);
  });

  document.querySelectorAll<HTMLButtonElement>("[data-lang-choice]").forEach((button) => {
    const isActive = button.dataset.langChoice === locale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function initNavigation() {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-nav-menu]");
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-section-link]");

  toggle?.addEventListener("click", () => {
    const nextState = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(nextState));
    menu?.classList.toggle("is-open", nextState);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      menu?.classList.remove("is-open");
    });
  });

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > animationsConfig.navbarScrollThreshold);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.sectionLink === entry.target.id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 }
  );

  document.querySelectorAll<HTMLElement>("main section[id]").forEach((section) => observer.observe(section));
}

function initScrollTop() {
  const button = document.querySelector<HTMLButtonElement>("[data-scroll-top]");
  if (!button) return;
  const circle = button.querySelector<SVGCircleElement>("circle");
  const circumference = 2 * Math.PI * 17;
  if (circle) {
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
  }

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    button.classList.toggle("is-visible", window.scrollY > animationsConfig.scrollTopThreshold);
    if (circle) circle.style.strokeDashoffset = `${circumference * (1 - progress)}`;
  };

  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
  window.addEventListener("scroll", update, { passive: true });
}

export function initSite() {
  const locale = getInitialLocale();
  applyLocale(locale);
  initNavigation();
  initScrollTop();

  document.querySelectorAll<HTMLButtonElement>("[data-lang-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const locale = button.dataset.langChoice as Locale;
      if (portfolioConfig.supportedLocales.includes(locale)) applyLocale(locale);
    });
  });
}
