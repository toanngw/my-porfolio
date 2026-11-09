# Cao-Toan Nguyen — Snowlight Studio

A portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Motion, React Three Fiber, and Drei. Professional content comes from `public/cv.pdf`.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:3000. The six sections use `#home`, `#about`, `#experience`, `#projects`, `#skills`, and `#contact`; old `#work` links resolve to Projects.

## Verification

```sh
npx tsc --noEmit
node scripts/verify-character-story.mjs
node scripts/verify-scroll-detent.mjs
npm run build
```

`npx next build --webpack` is also supported. `npm run lint` runs ESLint.

## Architecture

- `src/app/page.tsx`: server entry; `layout.tsx` provides metadata, the original monogram favicon, and locally hosted DM Sans.
- `src/components/studio/studio.tsx`: persistent shell, section selection, and intro accessibility.
- `character-story.ts`, `developer-character.tsx`, `hello-bubble.tsx`: articulated voxel rig, greeting, one-handed profile pull-up, and varied work/break cycle with a fading frustration bubble and contact-limited desk bonk. No external character model is required.
- `cinematic-stage.tsx`: keeps the canvas mounted while the character reveals the portfolio. The keyboard skip-to-content link and reduced motion provide immediate access; loading stays visually silent, and unavailable WebGL immediately unlocks the portfolio.
- `workspace-stage.tsx` and `workspace-scene.tsx`: transparent full-viewport rendering, lighting, responsive off-axis camera framing, unrestricted trackball rotation, and zoom. A separate layout-sized gesture surface leaves page controls and scrolling accessible while allowing artwork to render beyond its slot.
- `scroll-navigation.tsx` and `src/lib/scroll-detent.ts`: proportional reading, progressive boundary resistance, touch momentum, keyboard navigation, and the right-edge indicator. One section is displayed at a time.
- `viewport-atmosphere.tsx`, `atmosphere.tsx`, and `breeze.ts`: snowfall, leaves, wind, and the shared animation clock. Hidden tabs pause rendering.
- `sound-controls.tsx`, `src/lib/music-tracks.ts`, and `src/lib/studio-audio.ts`: user-supplied music recordings and independent synthesized scrolling ticks/clacks and desk impacts. Music requests playback at 40% when the profile is revealed; if browser policy blocks it, the next permitted click or key press retries. Manual play/pause, track selection, and volume remain available. Scrolling sounds have no toggle and unlock independently with permitted user interaction. Haptics are optional device capabilities.
- `src/lib/portfolio.ts` and `view-content.tsx`: CV-supported content and interactive experience/project selectors.

The header keeps branding, music settings, and the theme toggle. The lamp stays lit and character animations run automatically. Only DM Sans is loaded. Original portrait/reference assets and provenance are retained; see `docs/assets.md`. Mechanical scrolling details are in `docs/tactile-scrolling.md`. Other review documents record earlier iterations and are historical.

## Deployment

Deploy as a standard Next.js application: build with `npm run build`, then run `npm start`. Vercel resolves the production origin automatically; elsewhere set `SITE_URL` to the final HTTPS origin before building. No database, authentication service, external model host, or API key is required at runtime.
