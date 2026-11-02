import MainMenu from './components/MainMenu.vue';
import AboutView from './views/AboutView.vue';
import ToolboxView from './views/ToolboxView.vue';
import ContactView from './views/ContactView.vue';
import ImprintView from './views/ImprintView.vue';
import NotFoundView from './views/NotFoundView.vue';
import { profile } from './content/profile.js';

const title = label => `${label} - ${profile.name}`;

// One registry controls Vue routes, menu entries, and the generated HTML pages.
export const pages = [
  { name: 'menu', path: '/', title: `${profile.name}'s personal space`, component: MainMenu },
  { name: 'about', path: '/about/', label: 'About me', title: title('About'), component: AboutView, menu: true },
  { name: 'toolbox', path: '/toolbox/', label: 'Toolbox', title: title('Toolbox'), component: ToolboxView, menu: true },
  { name: 'contact', path: '/contact/', label: 'Say hello', title: title('Contact'), component: ContactView, menu: true },
  { name: 'legal-notice', path: '/legal-notice/', title: title('Legal notice'), component: ImprintView },
  { name: 'notfound', path: '/404.html', title: title('Page not found'), component: NotFoundView, noindex: true },
];
export const menuPages = pages.filter(page => page.menu);
export const notFoundPage = pages.find(page => page.name === 'notfound');

// Emit a static redirect as well as handling old links during client navigation.
export const redirects = [{ from: '/imprint/', to: '/legal-notice/' }];
