import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8'
};

function getLanIps() {
  const ips = [];
  const ifaces = os.networkInterfaces();
  for (const entries of Object.values(ifaces)) {
    for (const item of entries || []) {
      if (item.family === 'IPv4' && !item.internal) ips.push(item.address);
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  const reqUrl = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = reqUrl === '/' ? 'index.html' : reqUrl.replace(/^\/+/, '');
  const target = path.resolve(ROOT, rel);
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(target, (err, buf) => {
    if (err) {
      res.writeHead(404).end('Not Found');
      return;
    }
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nSkyline Protocol Dev Server running:`);
  console.log(`  Local Showcase : http://127.0.0.1:${PORT}/`);
  console.log(`  Pure Open Build: http://127.0.0.1:${PORT}/dist/skyline-protocol-open.html`);
  for (const ip of getLanIps()) {
    console.log(`  Mobile LAN URL : http://${ip}:${PORT}/`);
  }
  console.log(`\nOpen the Mobile LAN URL on iOS/Android over the same Wi-Fi to play immediately.\n`);
});
