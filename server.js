require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const bookingHandler = require('./api/booking');
const homeServiceHandler = require('./api/home-service');
const getBookingsHandler = require('./api/get-bookings');
const signupHandler = require('./api/signup');
const loginHandler = require('./api/login');
const googleAuthHandler = require('./api/google-auth');
const userProfileHandler = require('./api/user-profile');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

// Helper mock Vercel req/res for Node.js http server
function createVercelResponseWrapper(res) {
  res.status = function (statusCode) {
    res.statusCode = statusCode;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };
  return res;
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Wrap res to support Vercel helper methods .status() and .json()
  createVercelResponseWrapper(res);

  // ── API Routes Handler ──
  if (cleanPath === '/api/booking') {
    req.body = await parseRequestBody(req);
    return bookingHandler(req, res);
  }
  if (cleanPath === '/api/home-service') {
    req.body = await parseRequestBody(req);
    return homeServiceHandler(req, res);
  }
  if (cleanPath === '/api/get-bookings') {
    return getBookingsHandler(req, res);
  }
  if (cleanPath === '/api/signup') {
    req.body = await parseRequestBody(req);
    return signupHandler(req, res);
  }
  if (cleanPath === '/api/login') {
    req.body = await parseRequestBody(req);
    return loginHandler(req, res);
  }
  if (cleanPath === '/api/google-auth') {
    req.body = await parseRequestBody(req);
    return googleAuthHandler(req, res);
  }
  if (cleanPath === '/api/user-profile') {
    req.body = await parseRequestBody(req);
    return userProfileHandler(req, res);
  }

  // ── SPA Direct Routes Handler ──
  if (pathname === '/dashboard' || pathname === '/dashboard/' || pathname === '/insights' || pathname === '/insights/') {
    const indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, (readErr, content) => {
      if (readErr) {
        res.statusCode = 500;
        return res.end('Server Error');
      }
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    });
    return;
  }

  // ── Static File Server Handler ──
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing or 404
      if (pathname.startsWith('/api/')) {
        res.statusCode = 404;
        return res.json({ success: false, message: 'API Endpoint Not Found' });
      }
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.statusCode = 500;
        return res.end('Server Error');
      }
      res.setHeader('Content-Type', contentType);
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🌸 The Style Room Local Server Running!`);
  console.log(`🚀 Open in Browser: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
