# Cao-Toan Nguyen — Snowlight Studio

An interactive single-screen portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Motion, React Three Fiber, and Drei. All professional content is sourced from `public/cv.pdf`.

## Local development

Use Node 22.13+ or Node 24 LTS:

```sh
npm install
npm run dev
```

Open http://localhost:3000. Navigation uses `#home`, `#about`, `#experience`, `#projects`, `#skills`, and `#contact`. Browser back/forward works without full-page reloads. Old `#work` links resolve to Projects.

```sh
npm run lint
npx tsc --noEmit
npm run build
npm start
```

## Architecture

- `src/app/page.tsx`: server-rendered entry and preserved SEO layout.
- `src/components/studio/studio.tsx`: persistent app shell, hash navigation, bounded content panel.
- `src/components/studio/view-content.tsx`: six content views and selectors.
- `src/components/studio/workspace-scene.tsx`: original procedural 3D workspace.
- `src/components/studio/workspace-stage.tsx`: dynamic client-only scene and static fallback.
- `src/components/studio/snowfall.tsx`: lightweight dark-mode-only Canvas snowfall.
- `src/lib/portfolio.ts`: CV-supported content.
- `src/lib/preferences.ts`: theme, pause, and document visibility subscriptions.
- `src/app/globals.css`: semantic theme tokens and responsive viewport layout.

The workspace stays mounted across view changes. Ambient animation stops for reduced motion, the pause control, and hidden tabs. The 3D renderer is split from the initial application bundle; its static render is visible immediately and remains available when WebGL is unsupported. The original portrait is retained beside a transparent background-removal edit. See `docs/assets.md` for provenance.

Desktop uses a fixed viewport. On short screens, mobile, and enlarged layouts, only the content panel scrolls; essential content is not clipped or omitted. Navigation remains outside that panel.

## Deployment

Deploy as a standard Next.js application. Build: `npm run build`; Node start: `npm start`. On Vercel, the production origin is resolved automatically. On other hosts set `SITE_URL` to the final absolute HTTPS origin before building so social metadata uses the correct domain. No database, authentication, external model host, or API key is required at runtime.

## Review evidence

`DESIGN.md`, `PRODUCT.md`, and `.impeccable/design.json` record the current system. Earlier reviews under `docs/` describe the first portfolio iteration; the Snowlight Studio review covers this redesign. Local screenshots in `.playwright-mcp/` are ignored by Git and are not deployment assets.
