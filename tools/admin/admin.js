const sectionLabels={meta:"SEO y metadatos",nav:"Navegación",intro:"Introducción XR",home:"Inicio",hero:"Portada principal",dashboard:"Resumen profesional",about:"Sobre mí",experience:"Formación y experiencia",projects:"Proyectos",research:"Investigación",events:"Eventos",talks:"Charlas",youtube:"YouTube",services:"Servicios",skills:"Habilidades",technologies:"Tecnologías",gallery:"Galería",recommendations:"Recomendados",faq:"Preguntas frecuentes",community:"Comunidad",contact:"Contacto",privacy:"Privacidad",pages:"Páginas auxiliares",common:"Textos comunes",eventProfiles:"Fichas e imágenes de eventos"};
const routeMap={home:"/",hero:"/",dashboard:"/",about:"/sobre-mi/",experience:"/formacion-experiencia/",projects:"/proyectos/",research:"/investigacion/",events:"/eventos/",talks:"/charlas/",youtube:"/contenido/#youtube",gallery:"/contenido/#gallery",recommendations:"/contenido/#recomendados",services:"/servicios/",community:"/contacto/#community",contact:"/contacto/"};
const editor=document.querySelector("#editor"),sectionList=document.querySelector("#section-list"),sectionTitle=document.querySelector("#section-title"),breadcrumbs=document.querySelector("#breadcrumbs"),saveState=document.querySelector("#save-state"),toast=document.querySelector("#toast"),dialog=document.querySelector("#publish-dialog"),publishLog=document.querySelector("#publish-log");
let content=null,language="es",selectedSection="events",dirty=false,toastTimer;

const labelFor=(key)=>sectionLabels[key]||String(key).replace(/([A-Z])/g," $1").replace(/^./,value=>value.toUpperCase());
const clone=(value)=>structuredClone(value);
const getAt=(path)=>path.reduce((value,key)=>value[key],content);
const setAt=(path,value)=>{const parent=path.slice(0,-1).reduce((item,key)=>item[key],content);parent[path.at(-1)]=value;markDirty();};
function markDirty(){dirty=true;saveState.textContent="Cambios sin guardar";saveState.classList.add("is-dirty");}
function markSaved(){dirty=false;saveState.textContent="Guardado";saveState.classList.remove("is-dirty");}
function showToast(message,error=false){clearTimeout(toastTimer);toast.textContent=message;toast.className=`toast is-visible${error?" is-error":""}`;toastTimer=setTimeout(()=>toast.className="toast",3500)}
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
function blankLike(sample){if(Array.isArray(sample))return sample.map(blankLike);if(sample&&typeof sample==="object")return Object.fromEntries(Object.entries(sample).map(([key,value])=>[key,blankLike(value)]));if(typeof sample==="boolean")return false;if(typeof sample==="number")return 0;return ""}
function isImageField(key,value){return /image|imagen|photo|foto|cover|portada|logo/i.test(String(key))||(/\.(png|jpe?g|webp|svg)$/i.test(String(value||"")))}

function renderSidebar(filter=""){
  sectionList.replaceChildren();
  const keys=[...Object.keys(content[language]),"eventProfiles"];
  keys.filter(key=>labelFor(key).toLowerCase().includes(filter.toLowerCase())).forEach((key,index)=>{
    const button=el("button",`section-button${selectedSection===key?" is-active":""}`);
    button.type="button";button.dataset.section=key;
    button.append(el("span","",String(index+1).padStart(2,"0")),document.createTextNode(labelFor(key)));
    button.addEventListener("click",()=>{selectedSection=key;renderSidebar(document.querySelector("#section-search").value);renderEditor()});
    sectionList.append(button);
  });
}

function createToolbar(index,array){
  const bar=el("div","array-toolbar");
  [["↑","Subir",-1],["↓","Bajar",1]].forEach(([symbol,title,offset])=>{const button=el("button","icon-button",symbol);button.type="button";button.title=title;button.disabled=index+offset<0||index+offset>=array.length;button.addEventListener("click",()=>{const target=index+offset;[array[index],array[target]]=[array[target],array[index]];markDirty();renderEditor()});bar.append(button)});
  const duplicate=el("button","icon-button","⧉");duplicate.type="button";duplicate.title="Duplicar";duplicate.addEventListener("click",()=>{array.splice(index+1,0,clone(array[index]));markDirty();renderEditor()});bar.append(duplicate);
  const remove=el("button","icon-button icon-button--danger","×");remove.type="button";remove.title="Eliminar";remove.addEventListener("click",()=>{array.splice(index,1);markDirty();renderEditor()});bar.append(remove);return bar;
}

function buildField(key,value,path){
  if(value&&typeof value==="object")return buildComplex(key,value,path);
  const wrap=el("div",typeof value==="boolean"?"boolean-field":"field");
  const label=el("label","",labelFor(key));
  if(typeof value==="boolean"){
    const input=document.createElement("input");input.type="checkbox";input.checked=value;input.addEventListener("change",()=>setAt(path,input.checked));wrap.append(input,label);return wrap;
  }
  const long=String(value??"").length>90||/text|description|summary|intro|body|note|consent/i.test(String(key));
  const input=document.createElement(long?"textarea":"input");if(!long)input.type=typeof value==="number"?"number":"text";input.value=value??"";input.addEventListener("input",()=>setAt(path,typeof value==="number"?Number(input.value):input.value));
  if(isImageField(key,value)){
    const row=el("div","field-row"),upload=el("button","upload-button","Subir imagen"),picker=document.createElement("input");picker.type="file";picker.accept="image/png,image/jpeg,image/webp";picker.hidden=true;upload.type="button";upload.addEventListener("click",()=>picker.click());picker.addEventListener("change",async()=>{const file=picker.files?.[0];if(!file)return;upload.disabled=true;upload.textContent="Subiendo…";try{const data=await fileToDataUrl(file),result=await api("/api/upload",{name:file.name,data});setAt(path,result.path);renderEditor();showToast("Imagen añadida al proyecto.")}catch(error){showToast(error.message,true)}finally{upload.disabled=false}});row.append(input,upload,picker);wrap.append(label,row);
  }else wrap.append(label,input);
  return wrap;
}

function buildComplex(key,value,path){
  const group=el("section","group"),header=el("div","group-header"),title=el("h2","",labelFor(key));header.append(title,el("small","",Array.isArray(value)?`${value.length} elementos`:"Apartado"));group.append(header);const body=el("div","group-body");
  if(Array.isArray(value)){
    const list=el("div","array-list");value.forEach((item,index)=>{const card=el("div","array-item");card.append(createToolbar(index,value),buildField(String(index+1),item,[...path,index]));list.append(card)});body.append(list);const add=el("button","add-button","+ Añadir elemento");add.type="button";add.addEventListener("click",()=>{value.push(value.length?blankLike(value.at(-1)):"");markDirty();renderEditor()});body.append(add);
  }else{
    const nested=el("div","nested-object");Object.entries(value).forEach(([childKey,childValue])=>nested.append(buildField(childKey,childValue,[...path,childKey])));body.append(nested);
  }
  group.append(body);return group;
}

function renderEditor(){
  const isProfiles=selectedSection==="eventProfiles",value=isProfiles?content.eventProfiles:content[language]?.[selectedSection];
  sectionTitle.textContent=labelFor(selectedSection);breadcrumbs.textContent=`Contenido / ${isProfiles?"General":language.toUpperCase()} / ${labelFor(selectedSection)}`;editor.replaceChildren();
  document.querySelectorAll("[data-language]").forEach(button=>{button.classList.toggle("is-active",button.dataset.language===language);button.disabled=isProfiles});
  if(value===undefined){editor.append(el("div","empty-state","Esta sección no contiene campos editables."));return}
  const rootPath=isProfiles?["eventProfiles"]:[language,selectedSection];
  if(value&&typeof value==="object"&&!Array.isArray(value))Object.entries(value).forEach(([key,item])=>editor.append(buildField(key,item,[...rootPath,key])));else editor.append(buildField(selectedSection,value,rootPath));
}

async function api(url,body){const response=await fetch(url,{method:body?"POST":"GET",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const result=await response.json();if(!response.ok)throw new Error(result.error||"No se pudo completar la acción.");return result}
const fileToDataUrl=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("No se pudo leer la imagen."));reader.readAsDataURL(file)});
async function save(){const button=document.querySelector("#save-button");button.disabled=true;button.textContent="Guardando…";try{const result=await api("/api/content",content);markSaved();showToast(result.message);return true}catch(error){showToast(error.message,true);return false}finally{button.disabled=false;button.textContent="Guardar"}}
async function publish(){publishLog.hidden=true;const button=document.querySelector("#confirm-publish");button.disabled=true;button.textContent="Publicando…";try{if(dirty&&!(await save()))throw new Error("No se pudo guardar el contenido. Revisa el error antes de publicar.");const result=await api("/api/publish",{});publishLog.textContent=result.log||"";publishLog.hidden=!result.log;showToast(result.message);button.textContent="Publicado";setTimeout(()=>dialog.close(),1800)}catch(error){publishLog.textContent=error.message;publishLog.hidden=false;showToast(error.message,true);button.textContent="Reintentar"}finally{button.disabled=false}}

async function init(){try{content=await api("/api/content");renderSidebar();renderEditor()}catch(error){editor.replaceChildren(el("div","empty-state",error.message));showToast(error.message,true)}}
document.querySelector("#section-search").addEventListener("input",event=>renderSidebar(event.target.value));
document.querySelectorAll("[data-language]").forEach(button=>button.addEventListener("click",()=>{language=button.dataset.language;renderSidebar(document.querySelector("#section-search").value);renderEditor()}));
document.querySelector("#save-button").addEventListener("click",save);
document.querySelector("#preview-button").addEventListener("click",()=>window.open(`http://127.0.0.1:4321${routeMap[selectedSection]||"/"}`,"portfolio-preview"));
document.querySelector("#publish-button").addEventListener("click",()=>dialog.showModal());
document.querySelector("#cancel-publish").addEventListener("click",()=>dialog.close());
document.querySelector("#confirm-publish").addEventListener("click",publish);
window.addEventListener("beforeunload",event=>{if(dirty)event.preventDefault()});
window.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){event.preventDefault();save()}});
init();
