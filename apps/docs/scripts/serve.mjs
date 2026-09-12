/* global process, URL */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const baseUrl = '/mystique-mini/';
const host = process.env.DOCS_HOST ?? '127.0.0.1';
const port = Number(process.env.DOCS_PORT ?? 4175);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

async function resolveRequest(pathname) {
  if (!pathname.startsWith(baseUrl)) return;

  const relativePath = pathname.slice(baseUrl.length);
  let candidate = resolve(siteRoot, relativePath);
  if (candidate !== siteRoot && !candidate.startsWith(`${siteRoot}${sep}`))
    return;

  let metadata;
  try {
    metadata = await stat(candidate);
  } catch {
    return;
  }

  if (metadata.isDirectory()) candidate = join(candidate, 'index.html');
  try {
    return (await stat(candidate)).isFile() ? candidate : undefined;
  } catch {
    return;
  }
}

const server = createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url ?? '/', `http://${host}`).pathname,
    );
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const file = await resolveRequest(pathname);
  if (!file) {
    response.writeHead(404).end('Not found');
    return;
  }

  response.setHeader(
    'Content-Type',
    contentTypes[extname(file)] ?? 'application/octet-stream',
  );
  response.setHeader(
    'Cache-Control',
    pathname.includes('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  );

  if (request.method === 'HEAD') {
    response.writeHead(200).end();
    return;
  }

  createReadStream(file)
    .on('error', () => response.destroy())
    .pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(
    `Mystique docs available at http://${host}:${port}${baseUrl}\n`,
  );
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
