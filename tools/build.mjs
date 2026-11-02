import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const vite = resolve('node_modules/vite/bin/vite.js');
for (const args of [['build'], ['build', '--ssr', 'src/entry-server.js', '--outDir', '.prerender']]) {
  const result = spawnSync(process.execPath, [vite, ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const { render, staticPages, staticRedirects } = await import(pathToFileURL(resolve('.prerender/entry-server.js')).href);
const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<!--ssr-outlet-->')) throw new Error('Missing static rendering outlet.');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const renderedPages = new Map();
const outputRoot = resolve('dist') + sep;
const claimedOutputs = new Set();

function outputFile(path) {
  const output = path.endsWith('.html') ? `dist${path}` : `dist${path}index.html`;
  const absolute = resolve(output);
  if (!absolute.startsWith(outputRoot)) throw new Error(`Page outside dist: ${path}`);
  if (claimedOutputs.has(absolute)) throw new Error(`Pages write the same output file: ${path}`);
  claimedOutputs.add(absolute);
  return output;
}

for (const page of staticPages) {
  const output = outputFile(page.path);
  await mkdir(resolve(output, '..'), { recursive: true });
  const markup = await render(page.path);
  const metadata = page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${escape(page.canonical)}">`;
  const html = template.replace('<!--ssr-outlet-->', markup)
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace('</head>', `  ${metadata}\n</head>`);
  await writeFile(output, html);
  renderedPages.set(page.path, html);
  console.log(`Generated ${output}`);
}

for (const { from, to } of staticRedirects) {
  const target = renderedPages.get(to);
  if (!target) throw new Error(`Missing redirect destination: ${to}`);
  const output = outputFile(from);
  await mkdir(resolve(output, '..'), { recursive: true });
  // Real destination content remains readable even if automatic forwarding is disabled.
  const html = target.replace('</head>', `  <meta http-equiv="refresh" content="0;url=${escape(to)}">\n  <meta name="robots" content="noindex">\n</head>`);
  await writeFile(output, html);
  console.log(`Generated redirect ${from} → ${to}`);
}
