import { renderToString } from 'vue/server-renderer';
import { createApplication } from './application.js';
import { pages, redirects } from './pages.js';
import { getPageMetadata } from './metadata.js';

export const staticPages = pages.map(page => ({ path: page.path, ...getPageMetadata(page) }));
export const staticRedirects = redirects;
export async function render(path) {
  const { app } = await createApplication(path);
  return renderToString(app);
}
