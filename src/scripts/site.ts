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

  const browserLocale: Locale = navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
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

  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  if (toggle) {
    toggle.dataset.openLabel = dictionary.nav.menu;
    toggle.dataset.closeLabel = dictionary.nav.close;
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-label", isOpen ? dictionary.nav.close : dictionary.nav.menu);
  }
}

function initNavigation() {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-nav-menu]");
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-section-link]");

  const setMenuOpen = (isOpen: boolean) => {
    toggle?.setAttribute("aria-expanded", String(isOpen));
    toggle?.setAttribute("aria-label", isOpen ? toggle.dataset.closeLabel ?? "Close menu" : toggle.dataset.openLabel ?? "Open menu");
    menu?.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen && window.innerWidth <= 1180);
  };

  toggle?.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  links.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
      toggle?.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header?.contains(event.target as Node)) setMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1180) setMenuOpen(false);
  });

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > animationsConfig.navbarScrollThreshold);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.sectionLink === entry.target.id);
        });
      });
    },
    { rootMargin: "-40% 0px -52% 0px", threshold: 0.01 }
  );

  document.querySelectorAll<HTMLElement>("main section[id]").forEach((section) => sectionObserver.observe(section));
}

function initRevealAnimations() {
  const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!elements.length) return;

  // Reveal immediately when motion is reduced and avoid registering unnecessary observers.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  elements.forEach((element) => observer.observe(element));
}

function initHeroMotion() {
  const visual = document.querySelector<HTMLElement>("[data-hero-visual]");
  if (!visual || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Add restrained depth to the hero without competing with its future WebGL scene.
  visual.addEventListener("pointermove", (event) => {
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visual.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
  });

  visual.addEventListener("pointerleave", () => {
    visual.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}


function initHeroCameraOrbit() {
  const stage = document.querySelector<HTMLElement>("[data-tech-hero]");
  if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const resetCamera = () => {
    stage.style.setProperty("--camera-x", "0px");
    stage.style.setProperty("--camera-y", "0px");
    stage.style.setProperty("--camera-rotate-x", "0deg");
    stage.style.setProperty("--camera-rotate-y", "0deg");
  };

  const moveCamera = (event: PointerEvent) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    stage.style.setProperty("--camera-x", `${x * -58}px`);
    stage.style.setProperty("--camera-y", `${y * -42}px`);
    stage.style.setProperty("--camera-rotate-x", `${y * 9}deg`);
    stage.style.setProperty("--camera-rotate-y", `${x * -15}deg`);
  };

  stage.addEventListener("pointermove", moveCamera);
  stage.addEventListener("pointerleave", resetCamera);
  resetCamera();
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
  applyLocale(getInitialLocale());
  initNavigation();
  initRevealAnimations();
  initHeroMotion();
  initHeroCameraOrbit();
  initScrollTop();

  document.querySelectorAll<HTMLButtonElement>("[data-lang-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const locale = button.dataset.langChoice as Locale;
      if (portfolioConfig.supportedLocales.includes(locale)) applyLocale(locale);
    });
  });
}