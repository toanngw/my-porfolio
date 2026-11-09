# Portfolio refinement — November 2026

This pass builds on the existing winter scene and single-viewport portfolio. CV content, portrait identity, contact links, metadata, and hash navigation are preserved.

## Changes

- Original procedural brick character follows `public/character-reference.png`: layered individual dreadlocks, warm brown skin, serious eyes, shaped eyebrows, beard, mustache, cream hoodie, drawstrings, cloth seams, backpack and dark straps. No external character assets or logos.
- Existing standing animation rig retained: 24-second typing / reaching / coffee / returning sequence, with blinking, breathing, head turns, fingers, and steam. Mug resting position moved clear of the mouse; sip height adjusted to the mouth.
- Removed all ground snow, including the main tree's snow pad. Only snow on tree branches remains. Contact shadow is transparent and soft; no floor slab.
- Added small, fixed 3D pines in page gutters. Trunks and branches never sway; only suspended ornaments animate. Secondary canvas is DPR 1, unshadowed, noninteractive, and pauses with the main scene. Mobile has two smaller edge trees.
- Upright vertical lamp with a symmetrical shade. Real warm spotlight intensity 7, soft penumbra, local shadows, damped pointer changes, instantaneous keyboard/reduced-motion changes.
- Desktop shell now grows to 1660px. Responsive scene height reaches 680px; identity type reaches 70px, portrait 190px. Small screens retain contained content scrolling.
- Dark snowbank begins at 5px and approaches its 16px depth cap over 15 active seconds. Its irregular ridge stays under 14px, inside the bottom gutter. Both particles and snowbank fade out in light mode.
- Next.js development indicator disabled using documented `devIndicators: false`; compile/runtime errors remain available.
- Music player uses exactly the two supplied MP3 recordings. Includes media progress/time, seeking, previous/next, play/pause, volume, mute, real frequency visualizer, loading/error handling, and selected-track/volume persistence. No autoplay. Track configuration: `src/lib/music-tracks.ts`.
- Removed the unused procedural music scheduler; original short navigation click retained.

## Audio provenance

`afinfo` and browser decoding verify both recordings:

| File | Format | Approximate duration | Verified metadata |
| --- | --- | --- | --- |
| `public/audio/andriih.mp3` | MP3, 44.1kHz stereo, 256kbps | 2:17 | No embedded title or artist. UI uses the filename stem, with no invented artist credit. |
| `public/audio/Nebulite-Kyoto.mp3` | MP3, 44.1kHz stereo, 320kbps | 2:24 | ID3 title Kyoto, artist Nebulite, publisher Free To Use (freetouse.com), year 2020. |

These are user-provided files; no songs were downloaded. No lyric/instrumental classification is claimed because embedded metadata does not verify that. ID3 publisher metadata does not establish a redistribution license. Public deployment requires the user's appropriate audio rights and any required attribution; this task only updates the local project.

## Kowalski animation review

| Before | After | Why |
| --- | --- | --- |
| Tree branch groups sway continuously | Fixed tree structure; only ornament pivots move | Stable visual anchors, requested wind detail without extra movement |
| Mug rests on mouse and intersects desk slightly | Separate resting coordinates, base on desktop, shared hand/mug transform | Object contact reads clearly throughout the cycle |
| Drink pose reaches through lower face | Lowered cup center with rim at mouth | Better physical alignment |
| Slow, initially absent accumulation | Visible initial bank; 15-second bounded growth | Winter atmosphere is legible without covering content |
| Placeholder vocal slots and synthetic music | Actual MP3 playback, measured audio spectrum | UI reflects real media state |
| Existing damped camera controls | Preserved damping, immediate keyboard controls, 3-second auto-orbit delay | Interruptible gestures without slowing keyboard actions |

Animation work uses refs/shared clocks rather than per-frame React state. Progress updates follow media `timeupdate` events. Visualizer runs only while playing, open, visible, and motion-enabled. Character, scene auto-orbit, ornament motion, and snowfall stop when paused, hidden, or OS reduced motion applies. Manual camera/lamp controls remain functional.

## Verification

Final browser evidence and independent review findings are appended below after testing.

### Independent Impeccable assessment

Two isolated review agents assessed the source/render and browser behavior. The initial design review scored **25/32** before the final mobile/content polish; no post-polish score is claimed. Design specificity was judged authored and coherent: the floating world, cream hoodie, face-framing dreadlocks, beard, warm lamp, small edge pines, and quiet typography form a distinct identity.

| Heuristic | Initial score | Evidence |
| --- | --- | --- |
| System status | 3/4 | Current view, lamp state, music status and loading labels |
| Real-world match | 4/4 | Familiar sections and work/CV actions |
| User control | 3/4 | Reset, lamp, pause, keyboard camera and sound dismissal |
| Consistency | 3/4 | Warm neutral palette; music copy subsequently simplified |
| Error prevention | 3/4 | Explicit playback and safe defaults |
| Recognition | 3/4 | Text navigation; mobile action placement subsequently corrected |
| Efficiency | n/a | Experience surface |
| Minimalism | 3/4 | Strong desktop composition; mobile hierarchy subsequently corrected |
| Error recovery | 3/4 | Fallback and actionable media errors; later failure-tested |
| Documentation | n/a | No documentation task within the portfolio |

Cognitive load is low: six clearly grouped navigation choices, no memory bridge, no hidden main navigation. The scene provides a warm first impression; portrait and factual introduction establish professional context. Three initial priority findings were fixed:

1. **P2, mobile CTA placement:** work/CV actions now precede the secondary note, with tighter mobile gaps and identity spacing. Both actions are 44px high at y680–724, inside the initial panel ending y731 at 390×844. All copy remains accessible.
2. **P2, project hierarchy:** name, context, and substantive description precede the diagram. Mobile diagram height is 70px. No facts or projects changed.
3. **P3, audio metadata presentation:** player displays `andriih` as a filename-stem fallback and omits absent artist data. Kyoto retains verified Nebulite credit. No placeholders or invented titles/artists.

Persona checks: Casey can discover both Home actions before scrolling; Jordan sees a named project before its supporting diagram; Riley can inspect close-up details and recover with Reset. Intentional cropping during detail zoom is preserved. No additional priority questions were needed: the user had already specified the complete refinement scope and priority order.

Assessment B ran the deterministic detector once on `src/components/studio/workspace-scene.tsx`: exit 0, JSON `[]`, zero findings. Mutable browser injection preflight succeeded. The optional visualization server timed out; `live-server stop --keep-inject` reported no running server. No overlay was injected or claimed. Both review browser connections were closed, and the development server was preserved.

### Final browser evidence

Playwright MCP captured Home in **both themes** at **1920×1080, 1440×900, 1280×800, 768×1024, and 390×844**. Rendered screenshots were reviewed visually. Document dimensions matched every viewport exactly. Normal desktop retains a single screen; constrained/mobile content scrolls inside its panel. A 960×540 CSS viewport, equivalent to the available CSS space at 200% zoom on a 1920×1080 display, also fits. Short-height styling hides the studio signature and reduces scene height. A 26px footer gutter keeps the snowbank clear of text, including short screens.

- All six views were exercised in both themes at 1440px and 390px. Browser Back restored Contact; Forward restored Home. Experience, Projects, and Contact screenshots were captured in both themes at both sizes.
- Desktop drag changed the camera; wheel zoom increased 137.66 → 142.69. Automatic rotation paused on interaction and resumed after idle. Reset and keyboard arrows/plus/Home work.
- Actual CDP touch events: pinch zoom 61.86 → 88.45; one-finger drag changed camera from `5.200,3.900,-6.300` to `6.692,5.681,-3.015`.
- Canvas lamp hit test toggled on → off; keyboard Enter restored on. Paired screenshots show the desk illumination changing.
- Watched typing → reaching → coffee lift → return → typing. Cup returns to height 1.49 and clears mouse/desk geometry. Full sip pose targets 1.98; rim aligns with mouth, and the mirrored right thumb faces the handle. Steam continues upward.
- Dark bank starts near 5px and reaches 16.00; it remains capped. Light theme sets snowfall inactive and opacity 0 after the fade. Trunks/branches have no animated transforms; only ornament groups update.
- Fresh reduced-motion context: shared clock remained 0.00, auto-rotation false, no errors; ArrowLeft still changed the camera. WebGL2-disabled context: matching transparent poster loaded, no edge canvas mounted, and About navigation worked.
- Both MP3s decoded and played (136.65s / 144.21s). Seeking to 40s, previous/next, volume, mute, playback through section changes, and track/volume persistence worked. Refresh returns paused at 0.
- Instrumented audio context: **0 AudioContexts before interaction**; real playback waveform peak **0.02765**, muted peak **0**. Keyboard volume control produced 0.99 on the media element. Visualizer reads actual analyser data.
- A deliberately intercepted 404 produced the user-facing audio error. Retrying loaded the real file and reached readyState 4 with increasing playback time. Intentional failed-network diagnostics were isolated to that QA context.
- First Tab reaches Skip to content with a visible 2px focus outline. Scene/lamp/player targets remain accessible. Playback-position range is 44px high.
- Local CV, portrait, fallback, icon, and both MP3 URLs return HTTP 200. Verified CV social URLs remain unchanged. No placeholder links were added.
- Normal browsing: **0 JavaScript errors / 0 console warnings**. No visible Next.js indicator or starter branding. All temporary QA browser contexts were closed.

Screenshots are ignored local artifacts in `.playwright-mcp/`: `refined-{1920,1440,1280,768,390}-{dark,light}.png`, `refined-{experience,projects,contact}-{1440,390}-{dark,light}.png`, `refined-coffee-sip.png`, `refined-music-playing.png`, `refined-lamp-{on,off}.png`, `refined-reduced.png`, `refined-fallback.png`, and `refined-zoom-200.png`.

### Animation verdict and engineering checks

**Performance:** Shared clocks/refs drive character, steam, ornaments, and orbit. No per-frame React state. 32 individually curved hair strands are created once. Keyboard keys are instanced. Main scene reports about 260 draw calls / 68,132 triangles; main DPR ≤1.5, edge canvas DPR 1. Shadows use 1024px key and 512px lamp maps, plus cached contact shadow. No postprocessing, downloaded models, or new packages. Recordings use preload="none" and never audibly autoplay. This is browser/emulator verification, not a physical mobile GPU or speaker listening test.

**Timing/interruptibility:** Lamp brightness is damped from its current value. Camera damping and idle resume are retained. Keyboard actions are immediate. Existing navigation uses the project's 180ms ease-out; player controls update directly. Visualizer stops when closed, paused, reduced-motion, or hidden.

**Accessibility:** Reduced motion stops ambient movement; manual controls remain available. Pointer hover styling is fine-pointer gated. Focus stays visible; no modal/focus trap was introduced. Internal scrolling and the continuation control preserve content at small sizes and zoom.

**Kowalski verdict: Approve.** No feel-breaking animation regressions found in this refinement. Relevant sources: `developer-character.tsx:70`, `winter-world.tsx:21`, `workspace-scene.tsx:18`, `sound-controls.tsx:24`, and `snowfall.tsx:40`.

Final checks pass: `npm run lint`, `npx tsc --noEmit`, `git diff --check`, and default Turbopack `npm run build`. Initial sandbox build failed because the CSS worker could not bind a local port; its generated cache was preserved outside the repo, and the authorized build outside the sandbox passed. Existing Node CommonJS/ESM experimental CLI warnings remain unrelated to browser behavior.

Development preview remains running at http://127.0.0.1:3000. No deployment or commit was performed in this task. Remaining external input is any desired verified title/artist for the untagged recording and the user's public-playback license/attribution information before deployment.

Critique archive: `.impeccable/critique/2026-11-09T04-22-38Z__src-components-studio-workspace-scene-tsx.md`. Snapshot write/trend read succeeded; first run for this target, 25/32 before polish, no trend yet. The exact snapshot was read back and closed after resolving its three priority findings. Temporary critique body was removed. Impeccable's pre-existing design metadata/config drift was not repaired as a side effect of this refinement; a separate metadata refresh remains available.
