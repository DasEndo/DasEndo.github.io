// One origin and metadata rule for both generated HTML and client navigation.
export const siteOrigin = 'https://dasendo.github.io';

export function getPageMetadata(page) {
  return {
    title: page.title,
    canonical: page.noindex ? null : new URL(page.path, siteOrigin).href,
    noindex: Boolean(page.noindex),
  };
}
