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
- `src/components/studio/workspace-scene.tsx`: original procedural 3D workspace and continuous turntable motion.
- `src/components/studio/developer-character.tsx`: typing, coffee break, and steam choreography.
- `src/components/studio/code-screen.tsx`: scrolling illustrative code texture.
- `src/components/studio/sound-controls.tsx` and `src/lib/studio-audio.ts`: optional original instrumental lo-fi, navigation clicks, and volume controls.
- `src/components/studio/workspace-stage.tsx`: dynamic client-only scene and static fallback.
- `src/components/studio/snowfall.tsx`: lightweight dark-mode-only Canvas snowfall.
- `src/lib/portfolio.ts`: CV-supported content.
- `src/lib/preferences.ts`: theme, pause, and document visibility subscriptions.
- `src/app/globals.css`: semantic theme tokens and responsive viewport layout.

The workspace stays mounted across view changes. Ambient animation follows the system reduced-motion preference by default. The motion control explicitly enables or pauses both the scene and snow, persists that choice, and always stops rendering in hidden tabs. The 3D renderer is split from the initial application bundle; its static render is visible immediately and remains available when WebGL is unsupported. The original portrait is retained beside a transparent background-removal edit. See `docs/assets.md` for provenance.

Desktop uses a fixed viewport. On short screens, mobile, and enlarged layouts, only the content panel scrolls; essential content is not clipped or omitted. Navigation remains outside that panel.

## Deployment

Deploy as a standard Next.js application. Build: `npm run build`; Node start: `npm start`. On Vercel, the production origin is resolved automatically. On other hosts set `SITE_URL` to the final absolute HTTPS origin before building so social metadata uses the correct domain. No database, authentication, external model host, or API key is required at runtime.

## Review evidence

The latest scene, portrait, and audio verification is recorded in `docs/scene-and-sound-review.md`.

`DESIGN.md`, `PRODUCT.md`, and `.impeccable/design.json` record the current system. Earlier reviews under `docs/` describe the first portfolio iteration; the Snowlight Studio review covers this redesign. Local screenshots in `.playwright-mcp/` are ignored by Git and are not deployment assets.

## Sound and scene details

Open the headphones control in the header and select **Play music**. Music requires this explicit gesture; it does not autoplay. Adjust Volume or turn Navigation clicks off independently. Volume zero silences both. Audio is generated locally with Web Audio, with no song files, lyrics, third-party samples, or network requests. Music stops in hidden tabs and resumes when returning if enabled. The scene makes a full rotation every 60 seconds; the original blocky developer types and takes a coffee break every 22 seconds. All scene motion shares the existing pause and reduced-motion controls. The circular portrait uses the existing transparent cutout; the original photo is untouched.
