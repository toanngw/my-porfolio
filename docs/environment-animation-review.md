# Toan Cao — environment and animation refinement

Refinement of the existing Next.js portfolio, November 9, 2026. The supplied `public/wind.png` was inspected directly: open off-white arcs, tapered tips, separated strokes, and generous negative space guided the original 3D curves. No reference-site assets or character models were imported.

## Completed

- A stationary, lit ground plane begins just below the shoes at y = −0.006. Its opacity fades into the surrounding space; no floor slab or rectangular platform is present. Cached, blurred contact shading anchors the workspace without long black ground shadows.
- Removed viewport corner trees, the workspace Christmas tree, and the browser-bottom snowbank. Sparse, dark-only snow now lives inside the Three.js scene.
- Six thin curve-based strokes progressively reveal and disappear during a 26-second breeze cycle. Three cupped, serrated maple leaves tumble around the workspace, settle on the ground, and fade before the next cycle. Paths stay outside the desk and character volume.
- One world-space breeze drives the wind sequence, steam, a small hanging desk charm, and the lamp's damped pendulum. Local coordinate conversion keeps these responses aligned while the composition rotates.
- Black fabric hoodie, preserved folds/hood/drawstrings, a surface-mounted “Toan Cao” back print, and dark-blue denim. Removed the backpack and straps. Dreadlocks, face, typing, breathing, blinking, and coffee choreography remain.
- Updated public header, hero, footer, title, Open Graph image/metadata, portrait alternative text, monogram, and favicons to Toan Cao. CV contents, download filename, history, and verified social-account identity remain intact.
- A single controller orchestrates three exact turntable rotations over 14 active seconds using ease-out sine, followed by gentle idle orbit. Ground and atmosphere stay outside the turntable. Scene interaction cancels the introduction and transfers orientation into the camera. Reset restores the default view. Navigation and theme changes do not restart the intro.
- A physical lamp cord has a visible bead, pointer capture, direct pulling, a spring return, and damped two-axis wind sway. Its invisible hit area scales for small canvases. Mouse/touch pulls toggle once on release; wind never toggles the light. The existing 44px keyboard-operated lamp button remains.
- Music attempts native, unmuted playback once after readiness. A blocked request is caught and exposes a direct Enable music control. One intentional interaction may unlock playback; there is no retry loop. An explicit pause prevents navigation from starting music again. Native autoplay precedes Web Audio routing so a suspended context cannot silently suppress permitted playback.
- Refreshed the transparent procedural fallback. It exports the current character/workspace and soft contact shading; dynamic atmosphere and the live ground are omitted. No new dependencies or audio downloads.

## Kowalski animation review

| Before | After | Why |
| --- | --- | --- |
| Independent ambient drift | One breeze sampled from a shared active clock | Related objects respond coherently; no per-frame React state |
| Idle-only camera | Interruptible intro, manual control, and idle states in one controller | Prevents competing rotation drivers (`workspace-scene.tsx:40`, `:72`) |
| Potential view discontinuity on intro interruption | Transfer composition orientation into the camera; lighting travels with the composition | Preserves the projected view when manual exploration begins |
| Lamp click only | Direct captured pull; mass 1 / stiffness 100 / damping 10 return spring | Immediate gesture feedback and a natural release (`lamp-cord.tsx:29`) |
| One large simulation step on slow frames | Bounded 1/120-second physics substeps | Stable return/sway on slower frames |
| Reversing yaw near leaf landing | Smoothly approach a final orientation | Leaves settle without an unnatural spin reversal |
| Movement on reduced-motion visits | Skip the multi-spin intro; freeze the shared clock by default | Manual camera and lamp controls remain usable |
| Autoplay policy failure could become an error/retry cycle | One caught attempt and explicit recovery control | Clear state without repeated requests (`sound-controls.tsx:58`, `:93`) |

Verdict: **Approve** for the inspected browser flows. The long intro is a specifically requested first-visit authored moment, separate from short interface feedback. Existing navigation remains immediate for keyboard input. Environmental animation uses `useFrame`, refs, prebuilt curves/geometry, and uniforms; hidden tabs and the existing motion preference suspend ambient rendering. Device-specific frame rate still depends on GPU and browser.

## Impeccable polish

Reviewed rendered dark/light composition, typography, hierarchy, alignment, scene integration, focus targets, responsive layout, and the audio disclosure. Fixed hard ground shadows, increased back-lettering readability, enlarged the cord hit area, improved the smallest mobile scene height, and made the Enable music label perform its stated action.

The manual detector was run once over the changed UI. It flagged typography/color documentation drift, including existing responsive sizes, 3D material colors, and black used as an alpha mask. These are intentional rendering/layout values in the inspected implementation. Existing Impeccable metadata/config drift was reported and left untouched; refreshing its sidecar is separate from this refinement.

## Browser validation

Actual Playwright MCP testing against the running site:

| Check | Result |
| --- | --- |
| 1920×1080, 1440×900, 1280×800, 768×1024, 390×844, 320×568 | Viewport dimensions match document dimensions; no document overflow |
| All six views at 1440 and 390, both themes | Correct headings, hashes, active navigation, and internal content scrolling |
| Browser history | Back to Skills, forward to Contact |
| 200% desktop-equivalent space, 960×540 | No document overflow; internal panel scrolls (345px viewport / 514px content in the tested state) |
| Intro | Exactly 3.000 turns at 14 active seconds, ending at camera [5.2, 3.9, −6.3]; no restart across view/theme changes |
| Idle orbit | Starts after the introduction; pauses for interaction and resumes after idle |
| Desktop camera | Drag changes orientation; wheel zoom 137.66 → 142.69; reset restores camera/zoom |
| Mobile camera | Actual CDP touch drag and pinch; zoom 61.86 → 98.14 |
| Character | Typing, reaching, drinking, and return observed; back lettering inspected from behind |
| Lamp | Mouse pull, touch pull, and keyboard toggle pass; wind leaves lamp state unchanged |
| Cord physics | Pull displacement 0.167, release 0.144, settled 0.002; camera remains fixed during the pull |
| Dark-only snow | Shader opacity 0.48 in dark, 0 in light; no old viewport snow/tree canvases |
| Reduced motion | Intro skipped, clock stays 0.00, auto-rotation off; manual arrow-key camera still works |
| WebGL unavailable | Updated image loads; About navigation works; no page errors |
| Permitted autoplay | Separate Chrome QA process with permissive autoplay policy: one native attempt, time advancing, volume 0.35, muted false |
| Blocked autoplay | Forced first policy rejection in QA only: one attempt, no idle retries, Enable music recovers |
| Tracks | Both existing MP3s load/play; approximately 136.65s and 144.21s; next while playing and explicit pause across navigation pass |
| Music controls/preferences | Volume 0.62, mute/unmute, seeking to 35s, uninterrupted playback through Skills navigation, and saved Kyoto/62% preference after reload pass |
| Local asset links | CV, both MP3s, fallback image, and icon return HTTP 200 |
| Fresh full animation flow | No page errors or console warnings |

Screenshots are in ignored `.playwright-mcp/`: `environment-final-*`, `environment-wind-polish.png`, `environment-leaves.png`, `environment-hoodie-back.png`, `environment-intro-coffee.png`, `environment-settled-final.png`, `environment-enable-music-mobile.png`, `environment-reduced.png`, `environment-fallback-final.png`, and `environment-zoom-final.png`.

Development-only intermediate hot updates briefly exposed mismatched component props and an asset import while its file was being rewritten; subsequent clean reloads and fresh browser contexts passed. Resizing through multiple responsive image candidates can produce Chrome's unused-preload notice. No such warning appeared during the fresh full animation flow. Asset replacement now uses an atomic rename.

## Engineering checks and preview

- `npm run lint` — pass.
- `npx tsc --noEmit` — pass.
- `git diff --check` — pass.
- `npm run build` — pass, static routes generated. The sandbox initially blocked the CSS worker's local port; the failed compiler cache was preserved aside and the authorized build completed outside the sandbox. Existing Node CommonJS/ESM experimental CLI notices remain unrelated to app rendering.

Preview: http://127.0.0.1:3000. Local development: `npm run dev`. Production: `npm run build`, then `npm run start`. No deployment or commit was performed.

Browser autoplay permission remains outside the site's control. The leaf and cord motion use a lightweight authored simulation, not general collision/cloth physics. No low-end physical-device frame-rate guarantee is claimed. Audio remains the two supplied MP3s; embedded metadata alone does not establish publication rights. Earlier review documents describe previous scene iterations.
