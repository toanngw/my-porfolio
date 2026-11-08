# Cao-Toan Nguyen — Portfolio

Next.js App Router, TypeScript, Tailwind CSS, and Motion. Content is sourced from `public/cv.pdf`; the portrait is `public/avatar.jpg`.

## Local development

Use a supported Node LTS release (Node 22.13+ or 24 LTS), then:

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run lint
npm run build
npm start
```

## Deployment

Deploy as a standard Next.js application to Vercel or another Node-compatible host. Build command: `npm run build`; start command: `npm start`. Vercel configures the production metadata origin automatically. On other hosts, set `SITE_URL` to the final absolute HTTPS origin before building so Open Graph URLs use the correct domain. No backend services or credentials are required.

## Content and design

- `src/app/page.tsx`: CV-supported content and section structure.
- `src/components/`: motion, work disclosures, icons, theme control.
- `src/app/globals.css`: semantic colors, responsive layout, typography.
- `src/app/fonts/`: self-hosted fonts and SIL Open Font licenses.
- `src/app/opengraph-image.tsx`: generated share image.
- `PRODUCT.md`, `DESIGN.md`: factual constraints and design rules.
- `docs/design-review.md`: five prioritized improvements and verification evidence.

The two selected work examples come from professional experience. No standalone personal projects or project URLs were provided. There are no fake links or public-facing placeholders.

Screenshots and browser logs are local QA artifacts under `.playwright-mcp/`; they are not deployed by Next.js.
