/* Tiny static file server for local preview: node serve.mjs  ->  http://localhost:3000 */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let path = normalize(decodeURIComponent(url.pathname));
      let file = join(ROOT, path);
      if (file !== ROOT && !file.startsWith(ROOT + sep)) throw Object.assign(new Error("outside root"), { code: "EACCES" });
      let info = await stat(file).catch(() => null);
      if (info && info.isDirectory()) { file = join(file, "index.html"); info = await stat(file).catch(() => null); }
      if (!info) throw Object.assign(new Error("not found"), { code: "ENOENT" });
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(body);
    } catch (e) {
      res.writeHead(e.code === "ENOENT" ? 404 : 403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(e.code === "ENOENT" ? "Not found" : "Forbidden");
    }
  })
  .listen(PORT, () => console.log("Serving " + ROOT + " at http://localhost:" + PORT));
