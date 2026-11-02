# Endo's personal space

The source for [dasendo.github.io](https://dasendo.github.io/), Endo's personal website. A minimal, mostly grayscale design with a game-inspired main menu and a subtle animated background.

The site introduces me, my development toolbox, and ways to get in touch. The separate [GitHub profile repository](https://github.com/DasEndo/DasEndo) provides the README menu that links here.

## Built with

- Vue and Vue Router for components and navigation.
- Vite and a small build-time renderer that generates HTML for every page.
- GitHub Pages for static hosting, deployed through GitHub Actions.

Direct links and page refreshes work without hash URLs or a server-side application. Content and links remain readable without JavaScript. Client-side navigation adds transitions, keyboard controls, and contact copying. The background can be paused and respects reduced-motion preferences.

## Local development

Requires **Node.js 24** and **pnpm 11.25.0**.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server runs at <http://127.0.0.1:5173/>.

To build, verify, and preview the static output:

```sh
pnpm test
pnpm build
pnpm test:static
pnpm preview
```

The production preview runs at <http://127.0.0.1:4173/>. It serves the generated files with real 404 responses, unlike the development server's fallback routing. Run a new build to preview source changes.

## Project structure

```text
src/
  components/       Shared interface components
  content/          Profile, toolbox, contact, and legal-notice content
  views/            Page components
  styles/           Shared theme and responsive layout
  pages.js          Routes and main-menu entries
  metadata.js       Production origin and page metadata
  application.js    Shared client and rendering setup
  entry-server.js   Build-time rendering entry
public/             Static assets
tools/              Build and static preview scripts
tests/              Navigation and generated-site checks
.github/workflows/  GitHub Pages deployment
```

Page content is maintained in `src/content/`. Routes and menu entries are defined in `src/pages.js`; the production origin is configured in `src/metadata.js`.

`node_modules/`, `dist/`, and `.prerender/` are generated locally and excluded from Git. Source files, tests, build tools, the deployment workflow, and `pnpm-lock.yaml` are versioned so the site can be built reproducibly from a fresh checkout.

## Deployment

The [Pages workflow](.github/workflows/pages.yml) installs locked dependencies, runs the checks, generates the static site, and deploys `dist/`. It runs on pushes to `main` and can also be started manually.

The repository uses **GitHub Actions** as its Pages deployment source. Each public route has its own HTML file; unknown URLs use the custom `404.html`. The previous `/imprint/` URL forwards to `/legal-notice/`.
