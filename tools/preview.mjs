// A strict static preview for the generated GitHub Pages files.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../dist/', import.meta.url));
const htmlType = 'text/html; charset=utf-8';
const types = { '.html': htmlType, '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

export function createPreviewServer(directory = defaultRoot) {
  const root = resolve(directory);
  return http.createServer(async (request, response) => {
    const send = (status, data, type = 'text/plain; charset=utf-8') => {
      response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : data);
    };
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD');
      send(405, 'Method not allowed');
      return;
    }
    let url;
    let pathname;
    try {
      url = new URL(request.url, 'http://localhost');
      pathname = decodeURIComponent(url.pathname);
      if (pathname.includes('\0')) throw new URIError('Invalid path');
    } catch {
      send(400, 'Bad request');
      return;
    }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) {
      send(403, 'Forbidden');
      return;
    }
    try {
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(301, { Location: url.pathname + '/' + url.search, 'Cache-Control': 'no-store' }).end();
          return;
        }
        file = resolve(file, 'index.html');
      }
      send(pathname === '/404.html' ? 404 : 200, await readFile(file), types[extname(file)] || 'application/octet-stream');
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR'].includes(error.code)) {
        send(500, 'Unable to read the requested file.');
        return;
      }
      try {
        send(404, await readFile(resolve(root, '404.html')), htmlType);
      } catch {
        send(404, 'Page not found');
      }
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await stat(resolve(defaultRoot, '404.html')).catch(() => { throw new Error('Run pnpm build before pnpm preview.'); });
  createPreviewServer().listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173/'));
}
