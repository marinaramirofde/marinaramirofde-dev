const sectionLabels = {
  meta: "SEO y metadatos", nav: "Navegación", intro: "Introducción XR", home: "Inicio",
  hero: "Portada principal", dashboard: "Resumen profesional", about: "Sobre mí",
  experience: "Formación y experiencia", projects: "Proyectos", research: "Investigación",
  events: "Eventos", talks: "Charlas", youtube: "YouTube", services: "Servicios",
  skills: "Habilidades", technologies: "Tecnologías", gallery: "Galería",
  recommendations: "Recomendados", faq: "Preguntas frecuentes", community: "Comunidad",
  contact: "Contacto", footer: "Pie de página", privacy: "Privacidad",
  pages: "Páginas auxiliares", common: "Textos comunes", eventProfiles: "Fichas e imágenes de eventos"
};

const fieldLabels = {
  eyebrow: "Etiqueta de sección", title: "Título", titleStart: "Primera parte del título",
  titleEnd: "Segunda parte del título", text: "Texto introductorio", intro: "Introducción",
  summary: "Resumen", description: "Descripción", role: "Especialidad profesional",
  items: "Elementos", courses: "Cursos", facts: "Puntos destacados", panel: "Conceptos destacados",
  image: "Imagen", alt: "Texto alternativo", slug: "Dirección de la página", period: "Fecha o periodo",
  cta: "Texto del botón", contact: "Texto de contacto", closing: "Texto de cierre",
  article: "Página de cada evento", body: "Contenido principal", note: "Nota",
  noteTitle: "Título de la nota", featured: "Etiqueta destacada", latest: "Título de novedades",
  newsroom: "Cabecera editorial", location: "Ubicación", year: "Año", format: "Formato",
  formatValue: "Tipo de formato", previous: "Texto: evento anterior", next: "Texto: evento siguiente"
};

const tupleLabels = {
  events: ["Categoría y fecha", "Título del evento", "Resumen"],
  home: ["Título", "Descripción"], dashboard: ["Etiqueta", "Contenido"],
  gallery: ["Título", "Categoría"], faq: ["Pregunta", "Respuesta"],
  projects: ["Título", "Descripción"], community: ["Título", "Descripción"]
};

const routeMap = {
  home: "/", hero: "/", dashboard: "/", about: "/sobre-mi/",
  experience: "/formacion-experiencia/", projects: "/proyectos/", research: "/investigacion/",
  events: "/eventos/", eventProfiles: "/eventos/", talks: "/charlas/",
  youtube: "/contenido/#youtube", gallery: "/contenido/#gallery",
  recommendations: "/contenido/#recomendados", services: "/servicios/",
  community: "/contacto/#community", contact: "/contacto/"
};

const editor = document.querySelector("#editor");
const sectionList = document.querySelector("#section-list");
const sectionTitle = document.querySelector("#section-title");
const breadcrumbs = document.querySelector("#breadcrumbs");
const saveState = document.querySelector("#save-state");
const toast = document.querySelector("#toast");
const publishDialog = document.querySelector("#publish-dialog");
const publishLog = document.querySelector("#publish-log");
const previewDialog = document.querySelector("#preview-dialog");
const previewFrame = document.querySelector("#preview-frame");
const previewTitle = document.querySelector("#preview-title");
const visibilityControl = document.querySelector("#visibility-control");
const visibilityToggle = document.querySelector("#visibility-toggle");

let content = null;
let language = "es";
let selectedSection = "events";
let dirty = false;
let toastTimer;

const clone = (value) => structuredClone(value);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function labelFor(key, path = []) {
  if (path.length === 0 && sectionLabels[key]) return sectionLabels[key];
  if (typeof path.at(-1) === "number" && typeof path.at(-2) === "number") {
    return tupleLabels[selectedSection]?.[path.at(-1)] || `Campo ${path.at(-1) + 1}`;
  }
  return fieldLabels[key] || sectionLabels[key] || String(key).replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function previewFor(value, maxLength = 135) {
  let result = "";
  if (Array.isArray(value)) {
    const preferred = typeof value[1] === "string" ? value[1] : value.find((item) => typeof item === "string");
    result = preferred || `${value.length} elementos`;
  } else if (value && typeof value === "object") {
    result = value.text || value.summary || value.description || value.title || value.name || value.slug || "Contenido agrupado";
  } else result = String(value ?? "");
  return result.length > maxLength ? `${result.slice(0, maxLength).trim()}…` : result;
}

function sectionExcerpt(key) {
  if (key === "eventProfiles") return `${content.eventProfiles.length} páginas de eventos con imagen y metadatos`;
  return previewFor(content[language]?.[key], 72) || "Contenido editable";
}

function markDirty() {
  dirty = true;
  saveState.textContent = "Cambios sin guardar";
  saveState.classList.add("is-dirty");
}

function markSaved() {
  dirty = false;
  saveState.textContent = "Guardado";
  saveState.classList.remove("is-dirty");
}

function showToast(message, error = false) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast is-visible${error ? " is-error" : ""}`;
  toastTimer = setTimeout(() => { toast.className = "toast"; }, 3500);
}

function setAt(path, value) {
  const parent = path.slice(0, -1).reduce((item, key) => item[key], content);
  parent[path.at(-1)] = value;
  markDirty();
}

function blankLike(sample) {
  if (Array.isArray(sample)) return sample.map(blankLike);
  if (sample && typeof sample === "object") return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, blankLike(value)]));
  if (typeof sample === "boolean") return false;
  if (typeof sample === "number") return 0;
  return "";
}

function isImageField(key, value) {
  return /image|imagen|photo|foto|cover|portada|logo/i.test(String(key)) || /\.(png|jpe?g|webp|svg)$/i.test(String(value || ""));
}

function renderSidebar(filter = "") {
  sectionList.replaceChildren();
  const keys = [...Object.keys(content[language]), "eventProfiles"];
  keys.filter((key) => labelFor(key).toLowerCase().includes(filter.toLowerCase())).forEach((key) => {
    const button = el("button", `section-button${selectedSection === key ? " is-active" : ""}`);
    button.type = "button";
    button.dataset.section = key;
    const check = el("span", "section-button__check", selectedSection === key ? "✓" : "");
    const copy = el("span", "section-button__copy");
    copy.append(el("strong", "", labelFor(key)), el("small", "", sectionExcerpt(key)));
    if (content.sectionVisibility && key in content.sectionVisibility && content.sectionVisibility[key] === false) {
      button.classList.add("is-hidden-section");
      copy.append(el("em", "", "Oculta en la web"));
    }
    button.append(check, copy);
    button.addEventListener("click", () => {
      selectedSection = key;
      renderSidebar(document.querySelector("#section-search").value);
      renderEditor();
    });
    sectionList.append(button);
  });
}

function createToolbar(index, array) {
  const bar = el("div", "array-toolbar");
  [["↑", "Subir", -1], ["↓", "Bajar", 1]].forEach(([symbol, title, offset]) => {
    const button = el("button", "icon-button", symbol);
    button.type = "button";
    button.title = title;
    button.disabled = index + offset < 0 || index + offset >= array.length;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const target = index + offset;
      [array[index], array[target]] = [array[target], array[index]];
      markDirty();
      renderEditor();
    });
    bar.append(button);
  });
  const duplicate = el("button", "icon-button", "⧉");
  duplicate.type = "button";
  duplicate.title = "Duplicar";
  duplicate.addEventListener("click", (event) => {
    event.preventDefault();
    array.splice(index + 1, 0, clone(array[index]));
    markDirty();
    renderEditor();
  });
  const remove = el("button", "icon-button icon-button--danger", "×");
  remove.type = "button";
  remove.title = "Eliminar";
  remove.addEventListener("click", (event) => {
    event.preventDefault();
    array.splice(index, 1);
    markDirty();
    renderEditor();
  });
  bar.append(duplicate, remove);
  return bar;
}

function buildField(key, value, path) {
  if (value && typeof value === "object") return buildComplex(key, value, path);
  const wrap = el("div", typeof value === "boolean" ? "boolean-field" : "field");
  const label = el("label", "", labelFor(key, path));
  if (typeof value === "boolean") {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = value;
    input.addEventListener("change", () => setAt(path, input.checked));
    wrap.append(input, label);
    return wrap;
  }
  const long = String(value ?? "").length > 90 || /text|description|summary|intro|body|note|consent/i.test(String(key));
  const input = document.createElement(long ? "textarea" : "input");
  if (!long) input.type = typeof value === "number" ? "number" : "text";
  input.value = value ?? "";
  input.addEventListener("input", () => setAt(path, typeof value === "number" ? Number(input.value) : input.value));
  if (isImageField(key, value)) {
    const row = el("div", "field-row");
    const upload = el("button", "upload-button", "Cambiar imagen");
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/png,image/jpeg,image/webp";
    picker.hidden = true;
    upload.type = "button";
    upload.addEventListener("click", () => picker.click());
    picker.addEventListener("change", async () => {
      const file = picker.files?.[0];
      if (!file) return;
      upload.disabled = true;
      upload.textContent = "Añadiendo…";
      try {
        const data = await fileToDataUrl(file);
        const result = await api("/api/upload", { name: file.name, data });
        setAt(path, result.path);
        renderEditor();
        showToast("Imagen añadida al proyecto.");
      } catch (error) { showToast(error.message, true); }
    });
    row.append(input, upload, picker);
    wrap.append(label, row);
  } else wrap.append(label, input);
  return wrap;
}

function buildArrayItem(item, index, array, path) {
  const itemCard = document.createElement("details");
  itemCard.className = "content-item";
  const summary = document.createElement("summary");
  const text = el("span", "content-item__title");
  text.append(el("strong", "", previewFor(item, 70) || `Elemento ${index + 1}`), el("small", "", `Elemento ${index + 1}`));
  summary.append(el("span", "content-item__index", String(index + 1).padStart(2, "0")), text, el("span", "content-item__open", "Editar"));
  const body = el("div", "content-item__body");
  body.append(createToolbar(index, array));
  if (Array.isArray(item)) item.forEach((child, childIndex) => body.append(buildField(String(childIndex + 1), child, [...path, index, childIndex])));
  else if (item && typeof item === "object") Object.entries(item).forEach(([childKey, childValue]) => body.append(buildField(childKey, childValue, [...path, index, childKey])));
  else body.append(buildField(String(index + 1), item, [...path, index]));
  itemCard.append(summary, body);
  return itemCard;
}

function buildComplex(key, value, path) {
  const group = document.createElement("details");
  group.className = "group";
  const summary = document.createElement("summary");
  const summaryCopy = el("span", "group-summary__copy");
  summaryCopy.append(el("strong", "", labelFor(key, path)), el("small", "", previewFor(value)));
  summary.append(summaryCopy, el("span", "group-summary__meta", Array.isArray(value) ? `${value.length} elementos` : `${Object.keys(value).length} campos`));
  const body = el("div", "group-body");
  if (Array.isArray(value)) {
    const list = el("div", "array-list");
    value.forEach((item, index) => list.append(buildArrayItem(item, index, value, path)));
    const add = el("button", "add-button", "+ Añadir elemento");
    add.type = "button";
    add.addEventListener("click", () => {
      value.push(value.length ? blankLike(value.at(-1)) : "");
      markDirty();
      renderEditor();
    });
    body.append(list, add);
  } else {
    const nested = el("div", "nested-object");
    Object.entries(value).forEach(([childKey, childValue]) => nested.append(buildField(childKey, childValue, [...path, childKey])));
    body.append(nested);
  }
  group.append(summary, body);
  return group;
}

function renderVisibilityControl() {
  const available = selectedSection !== "eventProfiles" && content.sectionVisibility && selectedSection in content.sectionVisibility;
  visibilityControl.hidden = !available;
  if (available) visibilityToggle.checked = content.sectionVisibility[selectedSection] !== false;
}

function renderEditor() {
  const isProfiles = selectedSection === "eventProfiles";
  const value = isProfiles ? content.eventProfiles : content[language]?.[selectedSection];
  sectionTitle.textContent = labelFor(selectedSection);
  breadcrumbs.textContent = `Contenido / ${isProfiles ? "General" : language.toUpperCase()} / ${labelFor(selectedSection)}`;
  editor.replaceChildren();
  renderVisibilityControl();
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === language);
    button.disabled = isProfiles;
  });
  if (value === undefined) {
    editor.append(el("div", "empty-state", "Esta sección no contiene campos editables."));
    return;
  }
  const fieldCount = value && typeof value === "object" ? Object.keys(value).length : 1;
  const overview = el("article", "section-overview");
  const overviewCopy = el("div", "section-overview__copy");
  overviewCopy.append(el("span", "section-overview__label", "Contenido de la sección"), el("h2", "", previewFor(value, 90) || labelFor(selectedSection)));
  const overviewStats = el("div", "section-overview__stats");
  overviewStats.append(el("span", "", `${fieldCount} bloques`), el("span", "", isProfiles ? `${value.length} eventos` : language.toUpperCase()));
  overview.append(overviewCopy, overviewStats);
  editor.append(overview);
  const rootPath = isProfiles ? ["eventProfiles"] : [language, selectedSection];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, item]) => editor.append(buildField(key, item, [...rootPath, key])));
  } else editor.append(buildField(selectedSection, value, rootPath));
}

async function api(url, body) {
  const response = await fetch(url, { method: body ? "POST" : "GET", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No se pudo completar la acción.");
  return result;
}

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
  reader.readAsDataURL(file);
});

function refreshPreview() {
  if (!previewFrame.src) return;
  const source = new URL(previewFrame.src);
  source.searchParams.set("adminPreview", Date.now());
  previewFrame.src = source.toString();
}

async function save() {
  const button = document.querySelector("#save-button");
  button.disabled = true;
  button.textContent = "Guardando…";
  try {
    const result = await api("/api/content", content);
    markSaved();
    refreshPreview();
    showToast(result.message);
    return true;
  } catch (error) {
    showToast(error.message, true);
    return false;
  } finally {
    button.disabled = false;
    button.textContent = "Guardar";
  }
}

async function publish() {
  publishLog.hidden = true;
  const button = document.querySelector("#confirm-publish");
  button.disabled = true;
  button.textContent = "Publicando…";
  try {
    if (dirty && !(await save())) throw new Error("No se pudo guardar el contenido. Revisa el error antes de publicar.");
    const result = await api("/api/publish", {});
    publishLog.textContent = result.log || "";
    publishLog.hidden = !result.log;
    showToast(result.message);
    button.textContent = "Publicado";
    setTimeout(() => publishDialog.close(), 1800);
  } catch (error) {
    publishLog.textContent = error.message;
    publishLog.hidden = false;
    showToast(error.message, true);
    button.textContent = "Reintentar";
  } finally { button.disabled = false; }
}

function openPreview() {
  const route = routeMap[selectedSection] || "/";
  previewTitle.textContent = labelFor(selectedSection);
  previewFrame.src = `http://127.0.0.1:4321${route}`;
  previewDialog.showModal();
}

async function init() {
  try {
    content = await api("/api/content");
    content.sectionVisibility ||= {};
    renderSidebar();
    renderEditor();
  } catch (error) {
    editor.replaceChildren(el("div", "empty-state", error.message));
    showToast(error.message, true);
  }
}

document.querySelector("#section-search").addEventListener("input", (event) => renderSidebar(event.target.value));
document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => {
  language = button.dataset.language;
  renderSidebar(document.querySelector("#section-search").value);
  renderEditor();
}));
visibilityToggle.addEventListener("change", () => {
  content.sectionVisibility[selectedSection] = visibilityToggle.checked;
  markDirty();
  renderSidebar(document.querySelector("#section-search").value);
});
document.querySelector("#save-button").addEventListener("click", save);
document.querySelector("#preview-button").addEventListener("click", openPreview);
document.querySelector("#close-preview").addEventListener("click", () => previewDialog.close());
document.querySelector("#publish-button").addEventListener("click", () => publishDialog.showModal());
document.querySelector("#cancel-publish").addEventListener("click", () => publishDialog.close());
document.querySelector("#confirm-publish").addEventListener("click", publish);
window.addEventListener("beforeunload", (event) => { if (dirty) event.preventDefault(); });
window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    save();
  }
});
init();
