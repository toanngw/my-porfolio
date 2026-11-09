# Snowlight Studio — design and validation review

## Delivered

The existing portfolio now uses one viewport with persistent labeled navigation and six hash-linked views. The original procedural timber workspace remains mounted across view changes. Its laptop, lamp, shoji-style panel, evergreen, server blocks, geometry, and materials are locally authored; no reference-site artwork or models are used. A transparent cutout of the supplied portrait appears on Home. The original source photograph is retained.

Dark mode uses neutral #111114 with soft-white snowfall. Light mode uses ivory #f4f0e8 with no visible snowfall. The snowfall Canvas is behind content and has pointer-events:none. The 3D and snowfall loops respond to pause, live reduced-motion changes, and document visibility. Rendering resolution is capped at1.5 DPR. The static illustration is a15KB render of the actual scene and is shown during loading or when WebGL is unavailable.

## Independent Impeccable critique

Method: independent design/finish assessment A (`/root/impeccable_finish_reviewer`) and detector/browser assessment B (`/root/studio_evidence_review`). The reviewer inspected all60 settled screenshots: six views, five requested viewport sizes, both themes. The comparison authority was the user-approved Snowlight Studio direction, not an image mockup. Current design tokens and component documentation are in DESIGN.md and .impeccable/design.json.

The initial full critique judged the site authored rather than category-interchangeable. Strengths: the original physical workspace, restrained unboxed content, persistent navigation, and honest attribution of professional work. Type, scene material, neutral/ivory ground, supplied portrait, and six-view composition matched the approved direction. The short-screen reading window was the principal usability weakness.

| Heuristic | Initial assessment |
| --- | --- |
| Visibility of system status | 3/4 |
| Match with the real world | 4/4 |
| User control and freedom | 4/4 |
| Consistency and standards | 3/4 |
| Error prevention | 3/4 |
| Recognition rather than recall | 3/4 |
| Flexibility and efficiency | n/a |
| Aesthetic and minimalist design | 3/4 |
| Error recovery | n/a |
| Help/documentation | n/a |
| Total | 23/28, Good, before the material fixes |

The review requested readable factual metadata and a continuation affordance for overflow. Dates, locations, attribution, technology tags, language information, and contact account identifiers were raised to12px. The first continuation implementation overlaid text and used padding-inclusive overflow; the reviewer rejected it. The final control occupies a separate strip outside the reading viewport, measures actual content bounds, appears only when real content remains below, and disappears at the end. Focus returns to the content region when the button disappears after activation.

Final verdict: **ship — both scored material fixes resolved**. The verdict pass confirmed no overlap and no false continuation cues in the affected both-theme recaptures. It did not issue a new whole-site numerical score.

Detector evidence: one source scan returned [] with exit0. Browser overlays caught small supporting typography; useful factual type was corrected. The cream-palette warning was contextual, not a defect. Low contrast inside the aria-hidden explanatory diagram was decorative rather than essential text. The temporary overlay server on8400 was stopped and no instrumentation was left in app source.

## Kowalski motion review

| Before | After | Why |
| --- | --- | --- |
| Traditional scrolling and isolated entrances | One persistent scene and180ms view swap | Make location changes clear without moving the overall composition |
| View-sized content could shift the reading area | Fixed-height flex frame | Keep the interface stable between views |
| Installed Motion reduced-motion hook retained mount-time preference | Live matchMedia/useSyncExternalStore subscription | Freeze ambient loops immediately when preference changes, without reload |
| A floating overflow control covered text | Separate continuation strip with immediate scroll action | Preserve reading and direct keyboard feedback |

The scene uses small sinusoidal idle offsets and damped pointer orientation. No React state changes per animation frame. View transitions and the160ms project-detail transition animate full transform strings and opacity; keyboard and reduced-motion view changes are immediate. Exiting views are inert and hidden from assistive technology. Scene and snow pause in hidden tabs, and subscriptions, observers, frame requests, and event listeners are cleaned up. There are no external textures, HDR maps, heavy downloaded models, or post-processing passes.

Observed runtime proof: idle time advanced while untouched; pointer movement changed yaw; pause froze both the scene clock and snow bitmap. Changing reduced motion without reloading froze time at0.63 across a500ms interval and left the snowfall bitmap stable. Light-mode snowfall opacity reached0; dark mode reached1. Physical mid-range-device GPU/frame profiling was not performed, so no universal FPS guarantee is claimed.

## Playwright MCP validation

| Requested viewport | All six views | Document overflow | Theme/accessibility matrix |
| --- | --- | --- | --- |
| 1440×900 | Pass | None | Light/dark pass |
| 1280×800 | Pass | None | Light/dark pass |
| 768×1024 | Pass | None | Light/dark pass |
| 390×844 | Pass | None | Light/dark pass |
| 320×568 | Pass; inner-panel scrolling | None | Light/dark pass |

Final production matrix:60 combinations, zero axe violations against selected WCAG A/AA and best-practice rules, no horizontal clipping in the content panel, no overlap between the continuation control and reading viewport. Screenshots were captured after exactly one view remained and transitions settled; early captures with ghost exits were discarded and replaced.

Additional checks:

- All six views at720×450 and640×400 (effective200% desktop reflow): no document/panel overflow, content remains scrollable. A separate doubled-computed-text Home stress test at320px also fit; this does not claim native browser zoom automation.
- Native hash back/forward returned About and Projects correctly. Rapid switching left exactly one active view.
- Keyboard Enter/Space activated navigation, selectors, theme, and continuation controls. Skip link focused the current content panel without changing its view. End scrolled the panel while document scrollY remained0.
- On320px About, the continuation control reached the content end, disappeared, and returned focus to the region. Later checks confirmed no false cue where content fits.
- Synthesized mobile touch activated navigation and project selection.
- Both CV links initiated Cao-Toan-Nguyen-CV.pdf downloads. CV, cutout, static fallback, and Open Graph image returned HTTP200. Email/social hrefs match the CV-backed data; no mail was sent or account action taken.
- Blocking WebGL in a fresh browser context left a loaded, visible static scene with zero3D canvases and no page error.
- Portrait alpha extrema are0 and1; transparent surroundings are real alpha, not a CSS background mask.
- Final production browser console: zero errors and zero warnings.
- ESLint, standalone TypeScript check, Next production build, and git diff whitespace check passed.

These checks supplement rather than replace physical-device and screen-reader speech testing. No formal WCAG conformance certification is claimed.

## Evidence and local preview

60 final captures are retained locally as `.playwright-mcp/studio-{light|dark}-{1440|1280|768|390|320}-{home|about|experience|projects|skills|contact}.png`. Review aliases are in `.impeccable/review/`. QA screenshots are ignored by Git.

Development preview remains available at http://localhost:3000/#home. README documents local development and deployment. The temporary production verifier on3001 was stopped after validation. No backend service, database, authentication, or runtime API key was added.
