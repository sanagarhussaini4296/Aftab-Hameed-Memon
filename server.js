/**
 * Zero-Dependency Academic Website & Content Management Server
 * For Prof. Dr. Aftab Hameed Memon
 * Features: Static File Server + Secure Admin API for Direct Live Updates & Backups
 * Access at: http://localhost:3050
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = process.env.PORT || 3050;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const BACKUPS_DIR = path.join(__dirname, 'backups');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Ensure data and backups directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

// Initial credentials fallback
const DEFAULT_CONFIG = {
  username: 'admin',
  password: 'aftab2026',
  name: 'Prof. Dr. Aftab Hameed Memon',
  updatedAt: new Date().toISOString()
};

function getAdminConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading admin config:', err.message);
  }
  return DEFAULT_CONFIG;
}

function saveAdminConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
}

// Active session tokens
const activeTokens = new Set();

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
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 25 * 1024 * 1024) { // Max 25MB (ample for rich html)
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token && activeTokens.has(token);
}

function createBackup(filename) {
  const sourcePath = path.join(PUBLIC_DIR, filename);
  if (!fs.existsSync(sourcePath)) return null;

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const backupName = `${base}_${timestamp}${ext}`;
  const backupPath = path.join(BACKUPS_DIR, backupName);

  fs.copyFileSync(sourcePath, backupPath);

  // Prune old backups, keep last 20
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith(base) && f.endsWith(ext))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUPS_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length > 20) {
      files.slice(20).forEach(f => {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, f.name)); } catch (_) {}
      });
    }
  } catch (e) {
    console.error('Backup cleanup notice:', e.message);
  }

  return backupName;
}

const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end();
    return;
  }

  // ------------------------------------------------------------------
  // ADMIN API ENDPOINTS
  // ------------------------------------------------------------------
  if (req.url.startsWith('/api/admin/')) {
    const endpoint = req.url.split('?')[0];

    // 1. Admin Login
    if (endpoint === '/api/admin/login' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const config = getAdminConfig();

        if (body.username === config.username && body.password === config.password) {
          const token = crypto.randomBytes(32).toString('hex');
          activeTokens.add(token);
          return sendJson(res, 200, {
            success: true,
            token,
            username: config.username,
            name: config.name || 'Prof. Dr. Aftab Hameed Memon'
          });
        } else {
          return sendJson(res, 401, {
            success: false,
            error: 'Invalid username or password. Please try again.'
          });
        }
      } catch (err) {
        return sendJson(res, 400, { success: false, error: err.message });
      }
    }

    // 2. Verify Session
    if (endpoint === '/api/admin/verify' && (req.method === 'GET' || req.method === 'POST')) {
      if (isAuthorized(req)) {
        const config = getAdminConfig();
        return sendJson(res, 200, { success: true, authorized: true, name: config.name });
      } else {
        return sendJson(res, 401, { success: false, authorized: false });
      }
    }

    // 3. Admin Logout
    if (endpoint === '/api/admin/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) activeTokens.delete(token);
      return sendJson(res, 200, { success: true, message: 'Logged out successfully' });
    }

    // Protect subsequent endpoints
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { success: false, error: 'Unauthorized administrative access.' });
    }

    // 4. Save Updated Page HTML (Direct Disk Write + Automated Backup)
    if (endpoint === '/api/admin/save-page' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        if (!body.html || typeof body.html !== 'string' || body.html.length < 500) {
          return sendJson(res, 400, { success: false, error: 'Payload does not contain valid HTML content.' });
        }

        const targetFile = body.filename || 'index.html';
        const safeTarget = path.normalize(path.join(PUBLIC_DIR, targetFile));
        if (!safeTarget.startsWith(PUBLIC_DIR)) {
          return sendJson(res, 403, { success: false, error: 'Target path invalid.' });
        }

        const backupCreated = createBackup(targetFile);
        fs.writeFileSync(safeTarget, body.html, 'utf8');

        console.log(`[Admin] Saved changes to ${targetFile}. Backup: ${backupCreated}`);
        return sendJson(res, 200, {
          success: true,
          message: `Successfully saved changes to ${targetFile}!`,
          backup: backupCreated,
          savedAt: new Date().toLocaleTimeString()
        });
      } catch (err) {
        console.error('[Admin Save Error]:', err);
        return sendJson(res, 500, { success: false, error: err.message });
      }
    }

    // 5. Add Publication Directly to publications-data.js
    if (endpoint === '/api/admin/add-publication' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { item, type = 'journals' } = body;
        if (!item || !item.title) {
          return sendJson(res, 400, { success: false, error: 'Publication details incomplete.' });
        }

        const pubFile = path.join(PUBLIC_DIR, 'js', 'publications-data.js');
        if (!fs.existsSync(pubFile)) {
          return sendJson(res, 404, { success: false, error: 'publications-data.js file not found.' });
        }

        createBackup('js/publications-data.js');

        let rawContent = fs.readFileSync(pubFile, 'utf8');
        // Find section target in publicationsData
        const sectionMatch = new RegExp(`("${type}"|'${type}'|${type})\\s*:\\s*\\[`, 'i');
        const match = rawContent.match(sectionMatch);

        if (!match) {
          return sendJson(res, 400, { success: false, error: `Section ${type} not found in publications dataset.` });
        }

        const insertIndex = match.index + match[0].length;
        const formattedItem = '\n    ' + JSON.stringify(item, null, 2).replace(/\n/g, '\n    ') + ',';
        const updatedContent = rawContent.slice(0, insertIndex) + formattedItem + rawContent.slice(insertIndex);

        fs.writeFileSync(pubFile, updatedContent, 'utf8');
        console.log(`[Admin] Added new publication: "${item.title}"`);
        return sendJson(res, 200, {
          success: true,
          message: `Publication added successfully to ${type}!`,
          title: item.title
        });
      } catch (err) {
        console.error('[Admin Add Pub Error]:', err);
        return sendJson(res, 500, { success: false, error: err.message });
      }
    }

    // 6. Change Admin Credentials
    if (endpoint === '/api/admin/change-credentials' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const config = getAdminConfig();

        if (body.currentPassword !== config.password) {
          return sendJson(res, 400, { success: false, error: 'Current password does not match.' });
        }

        if (!body.newPassword || body.newPassword.length < 4) {
          return sendJson(res, 400, { success: false, error: 'New password must be at least 4 characters.' });
        }

        const newConfig = {
          ...config,
          username: body.newUsername ? body.newUsername.trim() : config.username,
          password: body.newPassword.trim(),
          updatedAt: new Date().toISOString()
        };

        saveAdminConfig(newConfig);
        console.log(`[Admin] Updated credentials for user: ${newConfig.username}`);
        return sendJson(res, 200, {
          success: true,
          message: 'Admin username and password updated successfully!'
        });
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message });
      }
    }

    return sendJson(res, 404, { success: false, error: 'API endpoint not found.' });
  }

  // ------------------------------------------------------------------
  // STATIC FILE SERVING
  // ------------------------------------------------------------------
  let safeUrl = decodeURIComponent(req.url.split('?')[0]);
  if (safeUrl === '/' || safeUrl === '') {
    safeUrl = '/index.html';
  }

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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
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
  console.log(`  Local URL:       http://localhost:${PORT}`);
  console.log(`  Loopback:        http://127.0.0.1:${PORT}`);
  netIps.forEach(ip => {
    console.log(`  Network URL:     http://${ip.address}:${PORT}`);
  });
  console.log(`  Admin Trigger:   Click "Profiles:" label on Home Page`);
  console.log(`  Default Admin:   Username: admin | Password: aftab2026`);
  console.log(`=======================================================`);
});
