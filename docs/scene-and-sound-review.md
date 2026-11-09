# Scene, portrait, and sound refinement — 9 November 2026

This pass preserves the approved Snowlight Studio composition, single-screen navigation, and all CV-backed content. The supplied portrait and existing transparent cutout are unchanged.

| Before | After | Why |
| --- | --- | --- |
| Unframed torso cutout | Circular headshot, tighter crop, quiet surface and fine border | A composed personal identity beside the name; no face alteration. Image delivery accounts for the enlarged crop to preserve mobile sharpness. |
| Wall obscured the desk from behind | Open workspace with individual keys, tree ornaments, gifts, and an original blocky developer | Detail and readable silhouettes throughout a full turn, without borrowed models or artwork. |
| Small oscillating yaw; static laptop and cup | Continuous 60-second rotation, damped pointer offset, typing, 22-second coffee breaks, rising steam, and scrolling illustrative code | The user-requested activity belongs inside the miniature. One shared scene clock keeps it coherent and pauseable. |
| Silent navigation | Short, quiet synthesized clicks with a separate off switch | Immediate feedback without a downloaded audio file or navigation delay. |
| No background music | Optional original instrumental lo-fi, play/pause, master volume, and hidden-tab suspension | Relaxed atmosphere under the visitor's control, without autoplay or external music dependencies. |

Kowalski guidance informed damped pointer response, continuous unwrapped rotation, immediate keyboard UI, and shared reduced-motion/pause behavior. The new sound disclosure uses native HTML and opens immediately. No additional interface animation was introduced. React state is not updated per animation frame. The laptop texture updates at 12 Hz; the 3D scene remains dynamically imported and uses the existing capped pixel ratio and primitive geometry. Impeccable's craft floor and a rendered polish pass informed portrait crop, theme consistency, header spacing, touch targets, and contained scrolling.

## Verification

- Lint, TypeScript, and production build passed. The local Node 23 process prints its existing CommonJS/ES-module experimental notices; no application build errors occurred.
- Playwright inspected all six views in light and dark at 1440×900, 1280×800, 768×1024, 390×844, and 320×568. No document overflow; constrained content panels reached their bottom. Home, selected work, contact, and sound-panel screenshots are stored locally under ignored `.playwright-mcp/` paths.
- The sound panel remained within the viewport at 320px. Enter opened it, keyboard activation played music, ArrowRight adjusted volume, and Escape closed it and returned focus. Back/forward restored the expected views.
- Reduced-motion default froze the scene clock at 0.11 seconds across samples; normal motion resumed. Snow was active in dark and inactive in light. Hidden-tab simulation paused scene motion and produced silent music output.
- A long-running scene sample reached 168.03 seconds and 17.4536 radians of yaw, approximately 2.797 full revolutions from its initial heading. Pointer/arrow-key exploration and Escape reset remained usable. Screenshots reviewed both typing and the steaming-cup coffee break.
- Web Audio instrumentation found no audio context before a sound gesture. Navigation produced nonzero output; music ran with nonzero output. Master volume zero, pause, and disabled navigation clicks each produced zero sampled output. This verifies browser audio generation; no physical speaker or mobile-device listening test was performed.
- WebGL loss switched to the new matching transparent fallback while portfolio content remained usable. The deliberate context-loss test generated a Three.js warning during renderer disposal; a normal reload had zero browser errors or warnings. With WebGL and AudioContext unavailable, navigation remained usable and the music control reported audio unavailability.
- A 720×450 CSS viewport, corresponding to the available CSS space at 200% zoom on a 1440×900 display, retained panel access and contained the sound controls. This is a viewport equivalence check, not a physical browser-zoom test.
- Impeccable's mechanical detector ran once. Findings were advisory: existing typography values outside its frontmatter ramp and the new intentional sound-panel radius/shadow. The panel's 12px radius and soft offset shadow are documented in DESIGN.md. No blocker was reported.
- The fallback is a fresh transparent canvas capture, imported as a hashed asset to avoid retaining the previous scene in image caches. It is approximately 17KB. No dependencies were added.

The development preview remains on port 3000. The temporary production test server was stopped. Changes are uncommitted.
