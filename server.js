// Serveur statique minimal pour le développement local, sans dépendances
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173; // même port par défaut que Vite
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body && res.method !== 'HEAD') res.end(body);
  else res.end();
}

function safeJoin(root, target) {
  const p = path.normalize(path.join(root, target));
  if (!p.startsWith(root)) return null; // empêche l'évasion du répertoire
  return p;
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = safeJoin(ROOT, rel);
  if (!filePath) return send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Si dossier demandé, tente index.html
      if (!err && stat && stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        return fs.readFile(indexPath, (e, data) => {
          if (e) return send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
          return send(res, 200, { 'Content-Type': MIME['.html'] || 'text/html' }, data);
        });
      }
      return send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const headers = {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    };
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, headers);
    stream.pipe(res);
    stream.on('error', () => send(res, 500, { 'Content-Type': 'text/plain' }, 'Server Error'));
  });
});

server.listen(PORT, () => {
  console.log(`Dev server running on http://localhost:${PORT}`);
});

