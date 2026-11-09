# Final portfolio refinement

Targeted update to the existing portfolio. Previous uncommitted work and CV content are preserved. No dependencies, audio tracks, sections, or external models were added.

## Implementation

- **Branding:** restored the original N monogram, SVG icon and favicon from `e87333a`. Header, hero, footer, browser title, Open Graph title/image and portrait alt text now use **Toan Nguyen**. The character's back lettering remains **Toan Cao**. Legal CV and verified account information remain unchanged.
- **Intro:** `workspace-scene.tsx` measures the opaque character/furniture geometry once, recenters a dedicated turntable parent with an inverse child offset, and rotates only its Y axis. Three exact turns complete in **1.8 seconds**, using easeOutCubic. The camera, ground and environmental effects remain stationary during the intro. Manual input freezes the turntable immediately; Reset restores both the group and camera. Idle rotation resumes after interaction. The intro does not restart on section or theme changes and is skipped under reduced motion.
- **Character:** `character-details.tsx` gathers the existing 32 individually curved dreadlocks into a layered ponytail with a dark tie, preserving their strand thickness and materials. `developer-character.tsx` adds slightly longer/full cheeks and a broader beveled jaw. Jaw/chin beard and mustache geometry are fuller. Black hoodie, dark denim, shoes, hoodie lettering, and typing/blinking/breathing/drinking remain.
- **Environment:** the existing lit, fading 200-unit ground and cached soft contact shadows remain. No platform, corner trees or bottom snowbank returns.
- **Full-screen weather:** new `viewport-atmosphere.tsx` renders eight thin progressive wind strokes and 76 varied snowflakes in one pointer-free Canvas 2D layer. Paths extend beyond the viewport; flakes wrap only outside its edges. Snow fades out in light mode. The persistent clock is shared with the 3D breeze, leaves, cord, charm, steam and character. Maple leaves now also receive shared breeze displacement/tumbling. Wind and snow stop under reduced motion; pause freezes the environment, and hidden tabs stop its frame loop.
- **Lamp:** shortened the cord from 0.30 to 0.20 world units; the bead rises 0.10 units. Existing pointer capture, enlarged touch target, spring return, damped wind response, warm light and accessible external toggle remain.
- **Navigation:** the existing six anchors become an anchored hamburger disclosure below 768px. No second navigation system was added. The button morphs into an X; the panel uses an origin-aware 180ms transform/opacity transition. Keyboard/reduced-motion activation is immediate. Selection, outside pointer, Escape, leaving the header and resizing to desktop close it. Escape and selection preserve visible focus. Desktop/tablet navigation remains horizontal.
- **Copy:** retains “I build backend systems and APIs.” and uses the requested “A little curiosity, a lot of care, and a passion for building things that matter.”
- **Fallback:** refreshed the transparent WebGL-exported workspace poster from the actual procedural scene, including the updated character. Provenance is recorded alongside it.

## Motion / design review

Applied the installed `emil-design-eng`, `animate`, `animation-performance`, `review-animations` and Impeccable guidance.

| Before | After | Why |
| --- | --- | --- |
| 14-second intro around an off-center origin | Geometry-centered group, three turns / 1.8 seconds, easeOutCubic | Energetic first-load introduction without orbital translation |
| Interruption transfers orientation into the camera | Freeze group rotation and hand control directly to OrbitControls | No camera jump or competing animation controller |
| Scene-bounded wind and snow | Viewport-sized pointer-free canvas | Continuous edge-to-edge travel without a rectangular scene boundary |
| Independent local rendering clock | Shared persistent clock and breeze sample | Leaves, cord, steam and environmental strokes follow the same breeze envelope |
| Two-row mobile link grid | Existing links in a 180ms anchored disclosure | Compact navigation, clear hierarchy and accessible focus |
| Long cord handle lower on the desk | 0.10-unit higher handle, same direct pull and spring release | Reachable, unobstructed interaction |

**Animation verdict: Approve for this scoped refinement.** UI transitions stay below 300ms; the requested rare first-load spin is the deliberate exception. Keyboard actions remain immediate. Continuous animation uses refs and frame loops without React state updates per frame. Event listeners and animation frames are cleaned up. Real-device GPU profiling remains outside the desktop browser test coverage.

Impeccable's manual source detector scanned six target files: **0 anti-pattern failures**, with advisory notes about existing DESIGN.md type-ramp drift, mask colors and the menu shadow. These are not a parsed-page accessibility certification. The existing palette/type system was preserved. Visual review covered desktop composition, mobile wrapping, both menu themes, hoodie lettering, coffee pose, ground blending and reduced-motion/fallback states. Menu text contrast is 4.52:1 in light mode and 7.11:1 in dark mode; selected light text is 11.24:1.

## Browser evidence

Configured Playwright MCP, actual Chromium rendering and CDP touch gestures:

| Check | Result |
| --- | --- |
| 1920×1080, 1440×900, 1280×800, 768×1024, 390×844, 375×667 | Both themes captured; document width/height match viewport at every size |
| Full-screen weather surface | Bounds exactly match viewport; pointer-events none; painted particles/strokes present in all four screen quadrants |
| Intro samples | 0.254s / 1.100 turns → 1.037s / 2.772 → 1.800s / 3.000; camera remains [5.2,3.9,-6.3] throughout |
| Fixed pivot | [-0.48,0,0.3443274], matching geometry's horizontal bounds; unchanged across sampled frames |
| Theme/navigation during intro | Intro continues from existing progress, without replay |
| Manual interruption / reset / idle | Intro cancelled by drag; reset restores default camera; idle rotation resumes after delay |
| Mouse wheel | Zoom changes from 137.66 to 142.69 |
| Mobile touch | Pinch zoom reaches 94.56; touch drag changes camera to [7.929,4.532,-0.142] |
| Raised cord | Desktop and actual touch pull toggle lamp once; bead local Y is -0.21 |
| Wind physics | Wind 0→1→0; cord sway 0→0.087→0; lamp remains ON through the whole breeze |
| Character cycle | Typing → reaching at 12.10s → drinking at 16.32s → returned mug / typing by 22.33s |
| Maple leaves | Drift during breeze, settle by 20.23s; ground remains separate from browser bottom |
| Reduced motion | Intro complete at zero turns, clock stays 0.00, wind/snow hidden; navigation remains usable |
| WebGL unavailable | Updated static poster, working HTML navigation, no page errors |
| Constrained/zoom layout | 960×540 available viewport: document remains 960×540; panel internally scrolls (345px client / 563px content) |
| Navigation | All six views in both themes at desktop/mobile; active links, selection close, back/forward verified |
| Mobile keyboard | Escape closes and restores button focus; Tab from closed menu button reaches scene rather than hidden links |
| Outside close | Pointer outside menu closes it |
| Both MP3s | Native playback progresses; durations 136.646531s and 144.206259s |
| Music controls | Next/previous, pause, volume 62%, mute/unmute and seeking to 35s work; playback continues across navigation |
| Autoplay blocked | One initial attempt, visible Enable music fallback, successful native playback on explicit activation |
| Local links/assets | CV, both MP3s, icon and fallback return HTTP 200; verified CV social URLs preserved |
| Runtime errors | Fresh browser contexts and final primary preview reload: no JavaScript/console errors |

Screenshots are stored under the ignored `.playwright-mcp/` directory:

- `refinement-final-{1920,1440,1280,768,390,375}-{dark,light}-home.png`
- `refinement-final-{1440,390}-{dark,light}-{experience,contact}.png`
- `refinement-final-mobile-menu-{dark,light}.png`
- `refinement-wind-desktop.png`, `refinement-hoodie-back.png`
- `refinement-final-coffee.png`, `refinement-final-settled.png`
- `refinement-final-reduced.png`, `refinement-final-fallback.png`

## Engineering checks / limits

- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass, including refreshed fallback asset.
- `git diff --check`: pass.
- Existing Node CommonJS/ESM experimental CLI warnings remain; browser checks are clean.
- The existing two-track player is preserved; audible autoplay remains subject to browser permission.
- Touch tests use Chromium mobile emulation/CDP, not a physical handset. External social URLs retain their verified CV values; this pass checks their rendered targets rather than external service availability.
- No deployment or commit performed. Local preview: `http://127.0.0.1:3000` (`npm run dev` if stopped). Production: `npm run build` then `npm start`.

## Follow-up: startup, weather visibility and navigation audio

This follow-up supersedes the earlier persistent-pause and reduced-motion weather behavior.

| Before | After | Why |
| --- | --- | --- |
| Persisted Pause can disable later visits | Pause applies to the current document; new visits follow the OS motion preference | Normal-motion visits start automatically, including with legacy saved pause keys |
| Intro can begin before the first visible frame | Client-preference gate, two rendered warm-up frames, poster fade delay and bounded intro deltas | Slow graphics initialization cannot consume the visible spin |
| Faint snow in a negative stacking layer | Explicit weather/content layers, slightly clearer 84-flake field | Reliable full-screen visibility without blocking clicks |
| Eight faint wind strokes | Two clearer, shorter strokes per breeze | Visible but restrained motion |
| Leaves shrink at cycle end | Leaves settle then fade opacity to zero | Natural disappearance without a scale-to-zero effect |
| Very quiet navigation click; hero hash link omitted | Original click gain restored to an audible level, delegated section-anchor handling | One click per section navigation, including the hero CTA |

Reduced motion still skips the intro and pauses ambient movement by default. Snow remains visible as a static field in dark mode. Explicit Resume motion enables moving weather and ambient 3D motion; light mode hides snow. Pause freezes the current visit and no longer persists across reloads.

Additional Playwright checks:

- Seeded both legacy pause keys: automatic intro runs, completes three turns / 1.8 animated seconds; reload after Pause starts a new running visit.
- Delayed the first WebGL draw by 800ms in a QA-only context: intro remains visible and still completes all three turns.
- Dark mobile weather paints 708+ visible pixels; light mode hides snow; returning to dark restores it. No document overflow.
- Reduced-motion visit: clock remains 0.00, static snow is visible; explicit Resume advances the weather clock.
- Light-mode wind isolation: 1218 painted stroke pixels during breeze; zero after strokes exit. Leaf opacity is approximately 0.58 during fade, then zero with all three leaves hidden.
- Native Web Audio instrumentation: running context, one oscillator per selected navigation, analyser peak 187/255, click output gain 0.55. Hero CTA uses the same handler. Navigation-click checkbox remains functional.
- Fresh contexts: no JavaScript or console errors. Lint, TypeScript and production build pass.
- Screenshots: `.playwright-mcp/motion-weather-audio-fixed-{desktop,mobile}.png`.

No new dependencies or tracks. Browser/system audio output still controls actual playback volume. Physical-speaker listening and real-handset GPU profiling are outside automated browser coverage.

## Follow-up: reference-based brick head and full name

Used `public/character-reference.png` for the facial direction and reviewed craftz.dog for its restrained, beveled miniature aesthetic. Added a reusable `character-head.tsx`: tapered rounded head geometry, focused eyes and brows, modeled nose and lips, ears, and a shaped jawline beard. Preserved the tied-back dreadlocks, black hoodie, its “Toan Cao” lettering, and existing character animation controller. Refreshed the transparent WebGL fallback from the actual final scene.

The header wordmark and accessible label now read “Cao-Toan Nguyen,” consistent with the hero, title, Open Graph image and footer. The existing N logo symbol is retained.

Playwright visual review covered the full scene, close-up face, coffee-drinking pose, desktop layout and mobile menu. At 1440px, 390px and 320px, the complete wordmark fits with no document overflow. Fresh browser context: no console or JavaScript errors. Lint, TypeScript, production build and diff whitespace checks pass. Screenshots: `.playwright-mcp/head-refinement-final-{detail,desktop,mobile,coffee}.png`. No commit or deployment performed.

## Follow-up: human-shaped head

| Before | After | Why |
| --- | --- | --- |
| Rounded rectangular skull | Continuous oval cranium, curved cheeks, tapered jaw and rounded chin | Give the character a human silhouette in front and profile views |
| Box-shaped facial features | Sculpted nasal bridge, rounded ears, oval eyes, curved brows and lips | Carry the organic shape through the face |
| Beard following a squared perimeter | Beard sampled from the skull surface, tapering behind the ears | Keep facial hair fitted to the new jaw |
| Rectangular hair foundation | Rounded scalp beneath the unchanged individual dreadlocks | Remove the remaining rectangular outline without replacing the hairstyle |

Geometry is constructed at mount; existing blink, typing, head-motion and coffee controllers are unchanged. Playwright verified three intro turns, blinking (eyelid scale 0.07), drinking and return to typing. Inspected desktop, mobile, front/detail and profile screenshots; no mobile document overflow or browser errors. Refreshed the actual-scene transparent fallback. Lint, TypeScript, production build and whitespace checks pass. Evidence: `.playwright-mcp/human-head-{desktop,detail,profile,mobile,coffee}.png`. No commit or deployment performed.

## Follow-up: correct the pointed jaw

Compared the face directly against `public/character-reference.png`. Replaced the rapidly narrowing lower skull profile with a fuller curved mandible and wider rounded chin. Lowered the beard around the sides of the jaw and flattened its lower contour to remove the V-shaped silhouette. More hooded eyelids bring the expression closer to the reference. Hair, clothing and animation controllers are preserved.

Reviewed front, three-quarter and profile screenshots, plus the 390px layout. Verified blink, drinking and return-to-typing poses; no browser errors or mobile overflow. Updated the static scene fallback. Lint, TypeScript and whitespace checks pass. Evidence: `.playwright-mcp/reference-jaw-final-{front,detail,profile,desktop,mobile}.png`.

## Follow-up: full character interpretation of the illustration

The latest request supersedes the brick aesthetic, tied-back hair, black hoodie and absent backpack. Reworked the character against `public/character-reference.png`, retaining the workspace and animation rig.

| Before | After | Why |
| --- | --- | --- |
| Cube-based torso, limbs, hands and shoes | Contoured cloth torso, capsule sleeves and trousers, rounded fingers and sneakers | Carry the natural shape through the complete character |
| Tied-back locks | Individually tapered loose locks with layered crown and asymmetric forehead strands | Follow the reference hairstyle |
| Black hoodie | Cream hoodie, folded collar, drawstrings, cuffs and brown backpack straps | Follow the reference clothing |
| Solid beard shell and attached nose pieces | Continuous sculpted nasal bridge and tip, blended vertex-color facial hair and fine stubble | Reduce the toy-like face construction |
| Oversized head relative to shoulders | Smaller head and broader fitted shoulders | More human proportions |

Added `character-forms.tsx` for reusable smooth garment and body forms. Geometry and textures are built at mount and disposed on unmount; animation still uses the existing refs and clock. No new dependency, image texture posing as a head, or downloaded character model. Updated canvas description and transparent fallback.

Playwright: 1440×900 and 390×844; three-turn intro, blink (0.07 eyelid scale), drinking/return-to-typing, camera/reset and mobile About navigation pass. Reviewed face, side, back, desktop, mobile and coffee screenshots. No console/page errors in a fresh browser context or mobile document overflow. Lint, TypeScript and whitespace checks pass. Screenshots: `.playwright-mcp/reference-human-{desktop,mobile,face,profile,back,coffee}.png` and `reference-human-final-{desktop,face}.png`.

Limit: this is a procedural 3D interpretation of a single illustration. It does not reproduce its likeness exactly. Exact facial proportions, hand-authored topology and illustration shading would require a dedicated sculpted and rigged character asset. No commit or deployment performed.
