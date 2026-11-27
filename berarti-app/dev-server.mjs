// Local server: serves dist/ and runs api/*.js the way Vercel does (mock storage, mock AI unless keys are set).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = path.dirname(new URL(import.meta.url).pathname), DIST = path.join(ROOT, 'dist'), PORT = Number(process.env.PORT || 8787);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  res.status = c => { res.statusCode = c; return res; };
  res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
  if (u.pathname.startsWith('/api/')) {
    const f = path.join(ROOT, 'api', u.pathname.slice(5) + '.js');
    if (u.pathname.includes('_lib') || !fs.existsSync(f)) return res.status(404).json({ ok: false });
    let raw = ''; for await (const c of req) raw += c;
    req.body = raw ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : {};
    try { const mod = await import(pathToFileURL(f).href + '?t=' + fs.statSync(f).mtimeMs); await mod.default(req, res); }
    catch (e) { console.error(e); if (!res.writableEnded) res.status(500).json({ ok: false }); }
    return;
  }
  let p = path.join(DIST, decodeURIComponent(u.pathname));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(DIST, 'index.html');
  res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream'); fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`BERARTI dev server on http://localhost:${PORT} (mock store: ${!process.env.APPS_SCRIPT_URL})`));
