/**
 * Simple Zero-Dependency Localhost Server for Prof. Dr. Aftab Hameed Memon's Website
 * Run with: node server.js
 * Access at: http://localhost:3050
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3050;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Normalize URL to remove query string and decode URI components
  let safeUrl = decodeURIComponent(req.url.split('?')[0]);
  if (safeUrl === '/' || safeUrl === '') {
    safeUrl = '/index.html';
  }

  // Prevent directory traversal attacks
  const filePath = path.normalize(path.join(PUBLIC_DIR, safeUrl));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${safeUrl}`);
      return;
    }

    let targetFile = filePath;
    if (stats.isDirectory()) {
      targetFile = path.join(filePath, 'index.html');
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(targetFile, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }
  return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
  const netIps = getLocalIpAddresses();
  console.log(`=======================================================`);
  console.log(`  Academic Website Server for Prof. Dr. Aftab Hameed Memon`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  Loopback:    http://127.0.0.1:${PORT}`);
  netIps.forEach(ip => {
    console.log(`  Network URL: http://${ip.address}:${PORT} (${ip.name})`);
  });
  console.log(`  Curriculum:  http://localhost:${PORT}/cv.html`);
  console.log(`=======================================================`);
  console.log(`Press Ctrl+C in this terminal to stop the server.`);
});

