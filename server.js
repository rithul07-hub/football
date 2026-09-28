'use strict';
/**
 * LUXEWEAR — static file server (no dependencies, just Node.js).
 * Serves ONLY the ./public folder.
 *
 *   node server.js            -> http://localhost:3000
 *   PORT=8080 node server.js  -> http://localhost:8080
 *   (Windows PowerShell:  $env:PORT=8080; node server.js)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, extra) {
  res.writeHead(
    status,
    Object.assign({ 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }, extra)
  );
  res.end(body);
}

const server = http.createServer(function (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    return send(res, 400, 'Bad Request');
  }
  if (pathname.indexOf('\0') !== -1) return send(res, 400, 'Bad Request');
  if (pathname.endsWith('/')) pathname += 'index.html';

  // Resolve inside PUBLIC_DIR only — blocks ../ path traversal.
  const filePath = path.join(PUBLIC_DIR, path.normalize(pathname));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Forbidden');

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) return send(res, 404, 'Not Found');

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();

    fs.createReadStream(filePath)
      .on('error', function () { res.destroy(); })
      .pipe(res);
  });
});

server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Try another one, e.g.  PORT=' + (PORT + 1) + ' node server.js');
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, function () {
  console.log('LUXEWEAR running -> http://localhost:' + PORT);
});
