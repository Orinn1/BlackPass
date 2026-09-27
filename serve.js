const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3300;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const crypto = require('crypto');
const VIP_SECRET = 'b1c7af121565c79c916f738bbbbed70a97d1600c14c9218dc8c14e8033b27812';

function signToken(payloadObj) {
  const b64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto.createHmac('sha256', VIP_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

function verifyToken(tokenStr) {
  if (!tokenStr || typeof tokenStr !== 'string' || !tokenStr.includes('.')) return { valid: false };
  const [b64, sig] = tokenStr.trim().split('.');
  const expectedSig = crypto.createHmac('sha256', VIP_SECRET).update(b64).digest('base64url');
  if (sig !== expectedSig) return { valid: false };
  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return { valid: false, expired: true };
    return { valid: true, data };
  } catch(e) {
    return { valid: false };
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  let reqPath = decodeURI(urlObj.pathname);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoints ---
  if (reqPath === '/api/gate/start') {
    const sessionTicket = {
      t: 'gate_ticket',
      slug: urlObj.searchParams.get('slug') || 'hub-access',
      minSec: 85,
      startedAt: Date.now(),
      exp: Date.now() + (30 * 60 * 1000)
    };
    const ticket = signToken(sessionTicket);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, ticket, minSec: sessionTicket.minSec, startedAt: sessionTicket.startedAt }));
    return;
  }

  if (reqPath === '/api/gate/verify' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      let body = {};
      try { body = JSON.parse(bodyData); } catch(e) {}
      const ticket = body.ticket || '';
      const v = verifyToken(ticket);
      if (!v.valid || v.data?.t !== 'gate_ticket') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid or forged ticket signature' }));
        return;
      }
      const elapsed = Math.floor((Date.now() - v.data.startedAt) / 1000);
      const minRequired = v.data.minSec || 85;
      if (elapsed < minRequired) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: `Anti-Bypass Protection: คุณดูโฆษณาไปเพียง ${elapsed} วินาที (เซิร์ฟเวอร์กำหนดขั้นต่ำ ${minRequired} วินาที)`,
          elapsed,
          minRequired
        }));
        return;
      }
      const expiry24h = Date.now() + (24 * 60 * 60 * 1000);
      const passData = { t: 'gate_pass', exp: expiry24h, createdAt: Date.now() };
      const passToken = signToken(passData);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': `blackpass_token=${passToken}; Path=/; Max-Age=86400; SameSite=Lax`
      });
      res.end(JSON.stringify({
        success: true,
        passToken,
        expiresAt: expiry24h,
        redirectUrl: `/?pass_token=${encodeURIComponent(passToken)}`
      }));
    });
    return;
  }

  if (reqPath === '/api/gate/check-pass' || reqPath === '/api/check-session') {
    const token = urlObj.searchParams.get('token') || '';
    const v = verifyToken(token);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (v.valid) {
      res.end(JSON.stringify({ valid: true, verified: true, expiresAt: v.data.exp }));
    } else {
      res.end(JSON.stringify({ valid: false, error: v.expired ? 'Token expired' : 'Invalid token' }));
    }
    return;
  }

  // --- Static Files Serving ---
  if (reqPath.startsWith('/gateflow/')) {
    reqPath = reqPath.replace('/gateflow', '');
  }
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(ROOT, reqPath);

  // Security check: ensure within ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Access Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BlackPass Local Server running at http://localhost:${PORT}/`);
  console.log(`Landing Page: http://localhost:${PORT}/index.html`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`Locker Page: http://localhost:${PORT}/locker.html?slug=blox-fruits-v48`);
});
