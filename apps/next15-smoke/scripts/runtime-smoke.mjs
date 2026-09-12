import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const fixture = 'next15-smoke';
const expectedVersion = '15.5.25';
const port = 4315;
const baseUrl = `http://127.0.0.1:${port}`;
const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const output = [];

function invariant(value, message) {
  if (!value) throw new Error(`[${fixture}] ${message}`);
}

function emotionStyleTags(html) {
  const tags = [];
  const stylePattern = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
  for (const match of html.matchAll(stylePattern)) {
    const dataEmotion = match[1].match(/\bdata-emotion=(['"])(.*?)\1/i)?.[2];
    if (dataEmotion?.startsWith('mystique')) {
      tags.push({ css: match[2], dataEmotion });
    }
  }
  return tags;
}

function assertMystiqueSsr(html, marker, label) {
  invariant(
    html.includes(`data-smoke="${marker}"`),
    `${label} SSR marker is missing`,
  );
  invariant(
    html.includes('mystique-box'),
    `${label} did not render a Mystique component class`,
  );
  const styles = emotionStyleTags(html);
  invariant(
    styles.length > 0,
    `${label} did not emit Emotion style tags with the mystique key`,
  );
  invariant(
    styles.some(({ css }) => css.includes('--mystique-colors-accent')),
    `${label} did not emit Mystique token CSS`,
  );
  return styles;
}

function assertUniqueEmotionIds(styles) {
  const ids = new Set();
  let count = 0;
  for (const { dataEmotion } of styles) {
    const [key, ...styleIds] = dataEmotion.trim().split(/\s+/);
    for (const id of styleIds) {
      const identity = `${key}:${id}`;
      invariant(!ids.has(identity), `duplicate Emotion id ${identity}`);
      ids.add(identity);
      count += 1;
    }
  }
  invariant(count > 0, 'Pages SSR emitted no extractable Emotion ids');
}

async function waitForManifest(server) {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    invariant(
      server.exitCode === null,
      `next start exited early\n${output.join('')}`,
    );
    try {
      const response = await globalThis.fetch(`${baseUrl}/api/smoke`, {
        cache: 'no-store',
        signal: globalThis.AbortSignal.timeout(2_000),
      });
      if (response.ok) return response;
    } catch (error) {
      lastError = error;
    }
    await delay(150);
  }
  throw new Error(
    `[${fixture}] server did not become ready: ${String(lastError)}\n${output.join('')}`,
  );
}

async function getHtml(pathname) {
  const response = await globalThis.fetch(`${baseUrl}${pathname}`, {
    cache: 'no-store',
    headers: {
      'accept-encoding': 'identity',
      'user-agent': 'mystique-runtime-smoke',
    },
  });
  invariant(response.ok, `${pathname} returned ${response.status}`);
  return response.text();
}

async function readStreamingRoute() {
  const response = await globalThis.fetch(`${baseUrl}/streaming`, {
    cache: 'no-store',
    headers: {
      'accept-encoding': 'identity',
      'user-agent': 'mystique-runtime-smoke',
    },
  });
  invariant(response.ok, `/streaming returned ${response.status}`);
  invariant(response.body, '/streaming returned no readable body');

  const chunks = [];
  const decoder = new globalThis.TextDecoder();
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value.byteLength > 0)
      chunks.push(decoder.decode(value, { stream: true }));
  }
  chunks.push(decoder.decode());

  const html = chunks.join('');
  const fallbackIndex = html.indexOf('data-smoke="streaming-fallback"');
  const resolvedIndex = html.indexOf('data-smoke="streaming-resolved"');
  let streamed = '';
  let fallbackChunk = -1;
  let resolvedChunk = -1;
  chunks.forEach((chunk, index) => {
    streamed += chunk;
    if (
      fallbackChunk < 0 &&
      streamed.includes('data-smoke="streaming-fallback"')
    )
      fallbackChunk = index;
    if (
      resolvedChunk < 0 &&
      streamed.includes('data-smoke="streaming-resolved"')
    )
      resolvedChunk = index;
  });
  invariant(
    chunks.filter(Boolean).length >= 2,
    'Suspense response arrived in fewer than two chunks',
  );
  invariant(fallbackIndex >= 0, 'streaming fallback marker is missing');
  invariant(
    resolvedIndex > fallbackIndex,
    'resolved marker did not arrive after the fallback',
  );
  invariant(
    resolvedChunk > fallbackChunk,
    'fallback and resolved segment were not streamed separately',
  );
  return chunks.filter(Boolean).length;
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;
  const exited = once(server, 'exit');
  server.kill('SIGTERM');
  const graceful = await Promise.race([
    exited.then(() => true),
    delay(5_000, false),
  ]);
  if (graceful) return;
  const killed = once(server, 'exit');
  server.kill('SIGKILL');
  await killed;
}

const server = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
  cwd: new globalThis.URL('..', import.meta.url),
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', (chunk) => output.push(chunk.toString()));
server.stderr.on('data', (chunk) => output.push(chunk.toString()));

try {
  const manifestResponse = await waitForManifest(server);
  invariant(
    manifestResponse.headers.get('x-mystique-smoke') === fixture,
    'API smoke header does not identify the fixture',
  );
  const manifest = await manifestResponse.json();
  invariant(
    manifest.fixture === fixture,
    'API manifest fixture does not match',
  );
  invariant(
    manifest.framework?.version === expectedVersion,
    'API manifest version does not match',
  );
  invariant(
    manifest.framework?.bundler === 'webpack-default',
    'API manifest bundler does not match',
  );

  const appHtml = await getHtml('/');
  assertMystiqueSsr(appHtml, 'app-router-ssr', 'App Router');

  const pagesHtml = await getHtml('/pages-smoke');
  const pagesStyles = assertMystiqueSsr(
    pagesHtml,
    'pages-router-ssr',
    'Pages Router',
  );
  invariant(
    pagesHtml.includes('name="mystique-pages-ssr" content="emotion-extracted"'),
    'Pages Router Emotion extraction meta marker is missing',
  );
  assertUniqueEmotionIds(pagesStyles);

  const streamChunks = await readStreamingRoute();
  globalThis.console.log(
    JSON.stringify({ fixture, ok: true, streamChunks }, null, 2),
  );
} catch (error) {
  globalThis.console.error(output.join(''));
  globalThis.console.error(error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
