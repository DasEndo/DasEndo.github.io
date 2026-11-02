import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createPreviewServer } from '../tools/preview.mjs';
import { render } from '../.prerender/entry-server.js';

let server;
let origin;
before(async () => {
  server = createPreviewServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
});

test('clean URLs serve the correct content as HTML before JavaScript runs', async () => {
  for (const [path, expected] of [
    ['/', 'Game development, personal projects &amp; more.'],
    ['/about/', 'mostly working on games'],
    ['/toolbox/', 'The toolbox.'],
    ['/contact/', 'dasendo@pm.me'],
    ['/legal-notice/', 'Website provider'],
  ]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert(html.includes(expected), `Missing prerendered content at ${path}`);
    assert(!html.includes('<!--ssr-outlet-->'));
    assert(!/class="[^"]*\bis-ready\b/.test(html), 'Animation must wait until JavaScript is interactive');
    assert(!html.includes('href="#'), `Hash navigation at ${path}`);
    assert.match(html, /href="\/"[^>]*class="[^"]*back-link|href="\/about\/"/);
  }
});

test('unknown and deeply nested paths return the custom page with HTTP 404', async () => {
  for (const path of ['/missing/', '/missing/deep/page', '/404.html']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 404, path);
    const html = await response.text();
    assert(html.includes('Nothing here.'));
    assert(html.includes('href="/"'));
    assert(html.includes('name="robots" content="noindex"'));
    assert(html.includes('src="/assets/'));
  }
});

test('slashless page URLs redirect to their static directory', async () => {
  const response = await fetch(origin + '/about?source=profile', { redirect: 'manual' });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), '/about/?source=profile');
});

test('legal notice links use the canonical URL and the previous URL forwards', async () => {
  const home = await (await fetch(origin + '/')).text();
  assert(home.includes('href="/legal-notice/"'));
  assert(!home.includes('href="/imprint/"'));
  const previous = await fetch(origin + '/imprint/');
  assert.equal(previous.status, 200);
  const html = await previous.text();
  assert(html.includes('http-equiv="refresh" content="0;url=/legal-notice/"'));
  assert(html.includes('rel="canonical" href="https://dasendo.github.io/legal-notice/"'));
  assert(html.includes('Website provider'));
});

test('contact page exposes both email and Discord without JavaScript', async () => {
  const html = await (await fetch(origin + '/contact/')).text();
  assert(html.includes('href="mailto:dasendo@pm.me"'));
  assert(html.includes('Copy email'));
  assert(html.includes('Copy username'));
  assert(html.includes('>dasendo</code>'));
});

test('production scripts, styles, and icons resolve from nested pages', async () => {
  const html = await (await fetch(origin + '/about/')).text();
  const urls = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+|\/favicon.svg)"/g)].map(match => match[1]);
  assert(urls.length >= 3);
  for (const url of urls) assert.equal((await fetch(origin + url)).status, 200, url);
});

test('physical index.html URLs resolve to the same Vue views as clean URLs', async () => {
  for (const path of ['/', '/about/', '/toolbox/', '/contact/', '/legal-notice/']) {
    assert.equal(await render(`${path}index.html`), await render(path), path);
  }
});

test('preview handles HEAD, malformed paths, traversal, and unsupported methods', async () => {
  const head = await fetch(origin + '/missing/', { method: 'HEAD' });
  assert.equal(head.status, 404);
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('cache-control'), 'no-store');
  assert.equal((await fetch(origin + '/%ZZ')).status, 400);
  assert.equal((await fetch(origin + '/%00')).status, 400);
  assert.equal((await fetch(origin + '/%2e%2e%2foutside.txt')).status, 403);
  const post = await fetch(origin + '/', { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('preview keeps serving when a custom 404 file is missing', async context => {
  const directory = await mkdtemp(join(tmpdir(), 'endo-preview-test-'));
  const fallbackServer = createPreviewServer(directory);
  context.after(async () => {
    await new Promise(resolve => fallbackServer.close(resolve));
    await rmdir(directory);
  });
  await new Promise((resolve, reject) => {
    fallbackServer.once('error', reject);
    fallbackServer.listen(0, '127.0.0.1', resolve);
  });
  const response = await fetch(`http://127.0.0.1:${fallbackServer.address().port}/missing/`);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Page not found');
});
