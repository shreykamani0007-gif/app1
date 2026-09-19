const http = require('http');
const fs = require('fs');
const path = require('path');

<<<<<<< HEAD
const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
=======
const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
>>>>>>> 3a4ee8c0c8ad29dfdfad35dab3977bd904b6505f
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
<<<<<<< HEAD
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Normalize and prevent directory traversal
  const safeUrl = path.normalize(req.url.split('?')[0]).replace(/^(\.\.[\/\\])+/, '');
  let relativePath = safeUrl === '/' || safeUrl === '\\' ? 'login.html' : safeUrl;
  let filePath = path.join(__dirname, relativePath);

  // If path is a directory, look for index.html or login.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'login.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
=======
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/login.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'login.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
>>>>>>> 3a4ee8c0c8ad29dfdfad35dab3977bd904b6505f
  });
});

server.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server is running at http://localhost:${PORT}/`);
  console.log(`Open http://localhost:${PORT}/login.html in your browser.`);
=======
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Login page: http://localhost:${PORT}/login.html`);
>>>>>>> 3a4ee8c0c8ad29dfdfad35dab3977bd904b6505f
});
