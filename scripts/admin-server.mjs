import http from "node:http";
import { spawn } from "node:child_process";
import { access, copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminDirectory = path.join(root, "tools", "admin");
const contentPath = path.join(root, "src", "data", "site-content.json");
const backupDirectory = path.join(root, ".admin-backups");
const uploadDirectory = path.join(root, "public", "uploads");
const host = "127.0.0.1";
const port = Number(process.env.ADMIN_PORT || 4173);
const npmLauncher = process.env.npm_execpath
  ? { command: process.execPath, prefix: [process.env.npm_execpath] }
  : process.platform === "win32"
    ? { command: process.env.ComSpec || "cmd.exe", prefix: ["/d", "/s", "/c", "npm"] }
    : { command: "npm", prefix: [] };
const gitCommand = process.platform === "win32" ? "git.exe" : "git";
let devServer;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function corsHeaders(request) {
  const origin = request.headers.origin;
  const allowed = new Set(["http://127.0.0.1:4321", "http://localhost:4321"]);
  return origin && allowed.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", Vary: "Origin" }
    : {};
}

function send(response, status, body, contentType = "application/json; charset=utf-8", headers = {}) {
  response.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store", ...headers });
  response.end(Buffer.isBuffer(body) ? body : typeof body === "string" ? body : JSON.stringify(body));
}

async function readBody(request, maxBytes = 12 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("La solicitud supera el tamaño permitido.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function validateContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) throw new Error("El contenido no es válido.");
  if (!content.es || !content.en || !Array.isArray(content.eventProfiles)) throw new Error("Faltan idiomas o fichas de eventos.");
}

async function saveContent(content) {
  validateContent(content);
  await mkdir(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-");
  await copyFile(contentPath, path.join(backupDirectory, `site-content-${stamp}.json`));
  const temporaryPath = `${contentPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporaryPath, contentPath);
}

function run(command, argumentsList, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, {
      cwd: root,
      env: { ...process.env, ...options.env },
      shell: false,
      windowsHide: true
    });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || options.allowFailure) resolve({ code, output: output.slice(-24000) });
      else reject(new Error(output || `${command} terminó con código ${code}.`));
    });
  });
}

function runNpm(argumentsList, options = {}) {
  return run(npmLauncher.command, [...npmLauncher.prefix, ...argumentsList], options);
}

async function pathExists(target) {
  try { await access(target); return true; } catch { return false; }
}

async function publish() {
  const branch = (await run(gitCommand, ["branch", "--show-current"])).output.trim();
  if (branch !== "main") throw new Error(`La publicación solo está habilitada desde la rama main. Rama actual: ${branch || "desconocida"}.`);

  const build = await runNpm(["run", "build"]);
  const addTargets = ["src/data/site-content.json"];
  if (await pathExists(uploadDirectory)) addTargets.push("public/uploads");
  await run(gitCommand, ["add", ...addTargets]);
  const stagedChanges = await run(gitCommand, ["diff", "--cached", "--quiet"], { allowFailure: true });
  if (stagedChanges.code === 0) return { message: "No hay cambios nuevos que publicar.", log: build.output };

  const commit = await run(gitCommand, ["commit", "-m", `content: update from local admin ${new Date().toISOString().slice(0, 10)}`]);
  const push = await run(gitCommand, ["push", "origin", "main"]);
  return { message: "Cambios publicados en GitHub. La web se actualizará en unos segundos.", log: `${build.output}\n${commit.output}\n${push.output}` };
}

async function uploadImage(payload) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/s.exec(payload.data || "");
  if (!match) throw new Error("El archivo debe ser una imagen PNG, JPG o WebP.");
  const extension = match[1] === "image/jpeg" ? ".jpg" : `.${match[1].split("/")[1]}`;
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 8 * 1024 * 1024) throw new Error("La imagen supera el límite de 8 MB.");
  const baseName = path.basename(payload.name || "imagen", path.extname(payload.name || ""))
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "imagen";
  const fileName = `${Date.now()}-${baseName}${extension}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), bytes);
  return `uploads/${fileName}`;
}

async function serveStatic(requestPath, response) {
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const resolved = path.resolve(adminDirectory, relativePath);
  if (!resolved.startsWith(adminDirectory)) return send(response, 403, "No permitido", "text/plain; charset=utf-8");
  try {
    const fileStats = await stat(resolved);
    const filePath = fileStats.isDirectory() ? path.join(resolved, "index.html") : resolved;
    const body = await readFile(filePath);
    send(response, 200, body, mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  } catch {
    send(response, 404, "No encontrado", "text/plain; charset=utf-8");
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  const headers = corsHeaders(request);
  try {
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      response.writeHead(204, headers);
      return response.end();
    }
    if (url.pathname === "/api/content" && request.method === "GET") {
      return send(response, 200, JSON.parse(await readFile(contentPath, "utf8")), undefined, headers);
    }
    if (url.pathname === "/api/content" && request.method === "POST") {
      await saveContent(await readBody(request));
      return send(response, 200, { message: "Cambios guardados en el proyecto." }, undefined, headers);
    }
    if (url.pathname === "/api/upload" && request.method === "POST") {
      return send(response, 200, { path: await uploadImage(await readBody(request)) }, undefined, headers);
    }
    if (url.pathname === "/api/publish" && request.method === "POST") {
      return send(response, 200, await publish(), undefined, headers);
    }
    if (url.pathname === "/api/health") return send(response, 200, { ok: true, preview: "http://127.0.0.1:4321/?adminEdit=1" }, undefined, headers);
    return await serveStatic(url.pathname, response);
  } catch (error) {
    send(response, 500, { error: error instanceof Error ? error.message : "Error inesperado." }, undefined, headers);
  }
});

function openBrowser(url) {
  if (process.env.ADMIN_NO_OPEN === "1") return;
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: false });
  child.unref();
}

function startPreview() {
  if (process.env.ADMIN_NO_PREVIEW === "1") return;
  const astroCli = path.join(root, "node_modules", "astro", "astro.js");
  devServer = spawn(process.execPath, [astroCli, "dev", "--host", host], { cwd: root, stdio: "ignore", windowsHide: true });
}

server.listen(port, host, () => {
  startPreview();
  const url = `http://${host}:${port}`;
  console.log(`\nPanel de administración: ${url}`);
  const editorUrl = "http://127.0.0.1:4321/?adminEdit=1";
  console.log(`Editor visual: ${editorUrl}`);
  console.log(`Panel avanzado: ${url}\n`);
  setTimeout(() => openBrowser(editorUrl), 900);
});

function close() {
  if (devServer && !devServer.killed) devServer.kill();
  server.close(() => process.exit(0));
}

process.on("SIGINT", close);
process.on("SIGTERM", close);
