// Tiny zero-dependency static server for the built site (the `out` folder).
// Usage: node serve.mjs   →  http://localhost:3000
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "out");
const port = Number(process.env.PORT) || 3000;
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".png": "image/png",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".pdf": "application/pdf",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) throw new Error("bad path");
    const s = await stat(file).catch(() => null);
    if (s?.isDirectory()) file = join(file, "index.html");
    else if (!s) file = (await stat(file + ".html").catch(() => null)) ? file + ".html" : join(root, "404.html");
    const body = await readFile(file);
    res.writeHead(file.endsWith("404.html") && !path.includes("404") ? 404 : 200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(500).end("error");
  }
}).listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`\n  Sagot ni Sam is running at ${url}\n  (keep this window open; press Ctrl+C to stop)\n`);
  if (process.argv.includes("--open")) exec(process.platform === "win32" ? `start ${url}` : `open ${url}`);
});
