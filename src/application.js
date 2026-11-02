import { createApp, createSSRApp } from 'vue';
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import { notFoundPage, pages, redirects } from './pages.js';
import { getPageMetadata } from './metadata.js';

export async function createApplication(path) {
  const isServer = typeof window === 'undefined';
  const router = createRouter({
    history: isServer ? createMemoryHistory() : createWebHistory(import.meta.env.BASE_URL),
    sensitive: true,
    routes: [
      ...pages.map(page => ({ path: page.path, name: page.name, component: page.component, meta: getPageMetadata(page) })),
      ...redirects.map(({ from, to }) => ({ path: from, redirect: to })),
      // These files already exist in dist; normalize their URLs without emitting redirects over them.
      ...pages.filter(page => page.path.endsWith('/')).map(page => ({ path: `${page.path}index.html`, redirect: page.path })),
      { path: '/:pathMatch(.*)*', name: 'missing', component: notFoundPage.component, meta: getPageMetadata(notFoundPage) },
    ],
    scrollBehavior: (to, from, savedPosition) => savedPosition || { top: 0 },
  });
  // Production hydrates the generated HTML; Vite development starts with an empty entry.
  const hasStaticContent = isServer || document.getElementById('app').childElementCount > 0;
  const app = hasStaticContent ? createSSRApp(App) : createApp(App);
  app.use(router);
  if (isServer) await router.push(path);
  await router.isReady();
  return { app, router };
}
