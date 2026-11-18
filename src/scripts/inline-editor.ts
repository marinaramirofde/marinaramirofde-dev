import content from "../data/site-content.json";

type SiteContent = typeof content & {
  textOverrides?: Record<string, string>;
  assetOverrides?: Record<string, string>;
};

const adminOrigin = "http://127.0.0.1:4173";
const editorFlag = "marina-inline-editor";
const editorStylesId = "inline-editor-styles";
const editorToolbarId = "inline-editor-toolbar";
const editableSelector = "[data-i18n]";

let currentContent: SiteContent | null = null;
let saveTimer: number | undefined;
let saveInFlight = false;
let saveQueued = false;
let statusTimer: number | undefined;

function getBasePath() {
  const basePath = document.documentElement.dataset.basePath || "/";
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function getRouteKey() {
  const basePath = getBasePath();
  let pathname = window.location.pathname;
  if (basePath !== "/" && pathname.startsWith(basePath)) pathname = pathname.slice(basePath.length - 1);
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (pathname !== "/" && !pathname.endsWith("/")) pathname = `${pathname}/`;
  return pathname;
}

function getImages() {
  return Array.from(document.querySelectorAll<HTMLImageElement>("main img")).filter((image) => !image.closest("[data-inline-editor-ui]"));
}

function imageKey(index: number) {
  return `${getRouteKey()}::image:${index}`;
}

function getGenericTextElements() {
  const selectors = "main h1, main h2, main h3, main h4, main p, main li, main strong, main small, main figcaption, main span, main a, main button, footer p";
  return Array.from(document.querySelectorAll<HTMLElement>(selectors)).filter((element) => {
    if (element.closest("[data-inline-editor-ui], [data-i18n]")) return false;
    if (element.children.length > 0) return false;
    if (element.matches("[aria-hidden='true']")) return false;
    return (element.textContent || "").trim().length > 1;
  });
}

function textKey(index: number) {
  return `${getRouteKey()}::text:${index}`;
}

function resolveAssetPath(assetPath: string) {
  if (/^(?:https?:|data:|blob:)/.test(assetPath)) return assetPath;
  return `${getBasePath()}${assetPath.replace(/^\/+/, "")}`;
}

function getNestedValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (Array.isArray(value)) return value[Number(key)];
    if (value && typeof value === "object") return (value as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

function setNestedValue(source: unknown, path: string, nextValue: string) {
  const keys = path.split(".");
  let current = source as Record<string, unknown> | unknown[];

  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    if (Array.isArray(current)) {
      const arrayIndex = Number(key);
      if (isLast) current[arrayIndex] = nextValue;
      else current = current[arrayIndex] as Record<string, unknown> | unknown[];
      return;
    }
    if (isLast) current[key] = nextValue;
    else current = current[key] as Record<string, unknown> | unknown[];
  });
}

function applyOverrides(source: SiteContent = content as SiteContent) {
  const locale = document.documentElement.lang === "en" ? "en" : "es";
  document.querySelectorAll<HTMLElement>(editableSelector).forEach((element) => {
    const key = element.dataset.i18n;
    const value = key ? getNestedValue(source[locale], key) : undefined;
    if (typeof value === "string" && !element.matches(":focus")) element.textContent = value;
  });

  const textOverrides = source.textOverrides ?? {};
  getGenericTextElements().forEach((element, index) => {
    const override = textOverrides[textKey(index)];
    if (typeof override === "string" && !element.matches(":focus")) element.textContent = override;
  });

  const overrides = source.assetOverrides ?? {};
  getImages().forEach((image, index) => {
    const override = overrides[imageKey(index)];
    if (override) image.src = resolveAssetPath(override);
  });
}

export function applyStoredOverrides() {
  applyOverrides(content as SiteContent);
}

function isLocalEditorRequested() {
  const localHost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
  if (!localHost) return false;
  const requested = new URLSearchParams(window.location.search).get("adminEdit") === "1";
  if (requested) sessionStorage.setItem(editorFlag, "1");
  return requested || sessionStorage.getItem(editorFlag) === "1";
}

function setStatus(message: string, state: "idle" | "busy" | "success" | "error" = "idle") {
  const status = document.querySelector<HTMLElement>("[data-editor-status]");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
  if (statusTimer) window.clearTimeout(statusTimer);
  if (state === "success") statusTimer = window.setTimeout(() => setStatus("Todo guardado"), 2200);
}

function showToast(message: string, isError = false) {
  document.querySelector("[data-editor-toast]")?.remove();
  const toast = document.createElement("div");
  toast.dataset.editorToast = "";
  toast.dataset.inlineEditorUi = "";
  toast.className = `inline-editor-toast${isError ? " is-error" : ""}`;
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

async function loadContent() {
  const response = await fetch(`${adminOrigin}/api/content`, { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo conectar con el editor local.");
  currentContent = await response.json() as SiteContent;
  currentContent.assetOverrides ??= {};
  currentContent.textOverrides ??= {};
  applyOverrides(currentContent);
}

async function saveContentNow() {
  if (!currentContent) return;
  if (saveInFlight) {
    saveQueued = true;
    return;
  }
  saveInFlight = true;
  setStatus("Guardando…", "busy");
  try {
    const response = await fetch(`${adminOrigin}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentContent)
    });
    const result = await response.json() as { message?: string; error?: string };
    if (!response.ok) throw new Error(result.error || "No se pudieron guardar los cambios.");
    setStatus("Guardado", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron guardar los cambios.";
    setStatus("Error al guardar", "error");
    showToast(message, true);
  } finally {
    saveInFlight = false;
    if (saveQueued) {
      saveQueued = false;
      void saveContentNow();
    }
  }
}

function queueSave(delay = 650) {
  setStatus("Cambios sin guardar", "busy");
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => void saveContentNow(), delay);
}

function finishTextEdit(element: HTMLElement) {
  if (!currentContent) return;
  const key = element.dataset.i18n;
  const value = (element.innerText || element.textContent || "").replace(/\s*\n\s*/g, " ").trim();
  if (key) {
    const locale = document.documentElement.lang === "en" ? "en" : "es";
    setNestedValue(currentContent[locale], key, value);
    document.querySelectorAll<HTMLElement>(`[data-i18n="${CSS.escape(key)}"]`).forEach((match) => {
      if (match !== element) match.textContent = value;
    });
  } else {
    const overrideKey = element.dataset.inlineTextKey;
    if (!overrideKey) return;
    currentContent.textOverrides ??= {};
    currentContent.textOverrides[overrideKey] = value;
  }
  element.removeAttribute("contenteditable");
  element.classList.remove("is-inline-editing");
  queueSave();
}

function beginTextEdit(element: HTMLElement, event: Event) {
  if (element.closest("[data-inline-editor-ui]")) return;
  event.preventDefault();
  event.stopPropagation();
  document.querySelectorAll<HTMLElement>(".is-inline-editing").forEach((active) => {
    if (active !== element) finishTextEdit(active);
  });
  element.setAttribute("contenteditable", "plaintext-only");
  element.classList.add("is-inline-editing");
  element.focus({ preventScroll: true });
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
  setStatus("Editando texto", "busy");
}

function bindTextElement(element: HTMLElement) {
  if (element.dataset.inlineEditorBound === "1") return;
  element.dataset.inlineEditorBound = "1";
  element.classList.add("inline-editable-text");
  element.title = "Pulsa para editar este texto";
  element.addEventListener("click", (event) => beginTextEdit(element, event));
  element.addEventListener("blur", () => {
    if (element.classList.contains("is-inline-editing")) finishTextEdit(element);
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (currentContent) applyOverrides(currentContent);
      element.removeAttribute("contenteditable");
      element.classList.remove("is-inline-editing");
      element.blur();
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      element.blur();
    }
  });
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

async function replaceImage(image: HTMLImageElement, index: number, file: File) {
  if (!currentContent) return;
  const previousSource = image.src;
  const previewSource = URL.createObjectURL(file);
  image.src = previewSource;
  setStatus("Subiendo imagen…", "busy");
  try {
    const response = await fetch(`${adminOrigin}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, data: await readImage(file) })
    });
    const result = await response.json() as { path?: string; error?: string };
    if (!response.ok || !result.path) throw new Error(result.error || "No se pudo subir la imagen.");
    currentContent.assetOverrides ??= {};
    currentContent.assetOverrides[imageKey(index)] = result.path;
    image.src = resolveAssetPath(result.path);
    await saveContentNow();
    showToast("Imagen actualizada");
  } catch (error) {
    image.src = previousSource;
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen.";
    setStatus("Error al subir", "error");
    showToast(message, true);
  } finally {
    URL.revokeObjectURL(previewSource);
  }
}

function bindImage(image: HTMLImageElement, index: number) {
  if (image.dataset.inlineEditorBound === "1") return;
  image.dataset.inlineEditorBound = "1";
  image.classList.add("inline-editable-image");
  image.title = "Pulsa para sustituir esta imagen";
  image.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/png,image/jpeg,image/webp";
    picker.hidden = true;
    picker.addEventListener("change", () => {
      const file = picker.files?.[0];
      if (file) void replaceImage(image, index, file);
      picker.remove();
    });
    document.body.append(picker);
    picker.click();
  });
}

function bindEditableContent() {
  document.querySelectorAll<HTMLElement>(editableSelector).forEach(bindTextElement);
  getGenericTextElements().forEach((element, index) => {
    element.dataset.inlineTextKey = textKey(index);
    bindTextElement(element);
  });
  getImages().forEach(bindImage);
}

function addEditorStyles() {
  if (document.getElementById(editorStylesId)) return;
  const link = document.createElement("link");
  link.id = editorStylesId;
  link.rel = "stylesheet";
  link.href = `${getBasePath()}admin-inline.css`;
  document.head.append(link);
}

function exitEditor() {
  sessionStorage.removeItem(editorFlag);
  const url = new URL(window.location.href);
  url.searchParams.delete("adminEdit");
  window.location.href = url.toString();
}

async function publishChanges() {
  const publishButton = document.querySelector<HTMLButtonElement>("[data-editor-publish]");
  publishButton?.setAttribute("disabled", "true");
  setStatus("Comprobando y publicando…", "busy");
  try {
    await saveContentNow();
    const response = await fetch(`${adminOrigin}/api/publish`, { method: "POST" });
    const result = await response.json() as { message?: string; error?: string };
    if (!response.ok) throw new Error(result.error || "No se pudo publicar.");
    setStatus("Publicado", "success");
    showToast(result.message || "Cambios publicados");
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo publicar.";
    setStatus("Error al publicar", "error");
    showToast(message, true);
  } finally {
    publishButton?.removeAttribute("disabled");
  }
}

function addToolbar() {
  if (document.getElementById(editorToolbarId)) return;
  const toolbar = document.createElement("aside");
  toolbar.id = editorToolbarId;
  toolbar.dataset.inlineEditorUi = "";
  toolbar.className = "inline-editor-toolbar";
  toolbar.setAttribute("aria-label", "Editor visual");
  const currentRoute = getRouteKey();
  const pageOptions = [
    ["/", "Inicio"],
    ["/sobre-mi/", "Sobre mí"],
    ["/formacion-experiencia/", "Formación y experiencia"],
    ["/proyectos/", "Proyectos"],
    ["/investigacion/", "Investigación"],
    ["/eventos/", "Eventos"],
    ["/charlas/", "Charlas"],
    ["/servicios/", "Servicios"],
    ["/contenido/", "Contenido"],
    ["/contacto/", "Contacto"]
  ];
  const routeIsListed = pageOptions.some(([route]) => route === currentRoute);
  const optionMarkup = `${routeIsListed ? "" : `<option value="${currentRoute}" selected>Página actual</option>`}${pageOptions
    .map(([route, label]) => `<option value="${route}"${route === currentRoute ? " selected" : ""}>${label}</option>`)
    .join("")}`;
  toolbar.innerHTML = `
    <div class="inline-editor-toolbar__identity">
      <span class="inline-editor-toolbar__pulse" aria-hidden="true"></span>
      <div><strong>Edición visual</strong><small data-editor-status>Conectando…</small></div>
    </div>
    <label class="inline-editor-toolbar__pages"><span>Página</span><select data-editor-page>${optionMarkup}</select></label>
    <div class="inline-editor-toolbar__hint">Pulsa un texto o una imagen para editar</div>
    <div class="inline-editor-toolbar__actions">
      <button type="button" data-editor-save>Guardar</button>
      <a href="${adminOrigin}" target="_blank" rel="noreferrer">Panel avanzado</a>
      <button class="is-primary" type="button" data-editor-publish>Publicar</button>
      <button class="is-icon" type="button" data-editor-exit aria-label="Salir del modo edición">×</button>
    </div>`;
  document.body.append(toolbar);
  toolbar.querySelector<HTMLSelectElement>("[data-editor-page]")?.addEventListener("change", (event) => {
    const route = (event.currentTarget as HTMLSelectElement).value;
    window.location.href = `${getBasePath()}${route.replace(/^\/+/, "")}`;
  });
  toolbar.querySelector("[data-editor-save]")?.addEventListener("click", () => void saveContentNow());
  toolbar.querySelector("[data-editor-publish]")?.addEventListener("click", () => void publishChanges());
  toolbar.querySelector("[data-editor-exit]")?.addEventListener("click", exitEditor);
}

export async function initInlineEditor() {
  applyStoredOverrides();
  if (!isLocalEditorRequested()) return;
  document.documentElement.classList.add("inline-editor-active");
  addEditorStyles();
  addToolbar();
  bindEditableContent();
  try {
    await loadContent();
    bindEditableContent();
    setStatus("Todo guardado", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar el editor.";
    setStatus("Sin conexión", "error");
    showToast(message, true);
  }
}
