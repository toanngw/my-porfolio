# Kowalski animation and interaction review

Scope: every animation and interaction in the portfolio. Applied installed `review-animations`, `animate`, `emil-design-eng`, and `animation-performance` guidance. This supersedes the initial motion section in docs/design-review.md.

## Findings and changes

| Before | After | Why |
| --- | --- | --- |
| Hero: initial=false suppressed its mount animation; configured 500ms / 60ms stagger / 8px | Visible SSR default; actual 300ms / 50ms stagger / 4px entrance, opacity 0.9–1 | One restrained first-visit moment; content is never hidden pending hydration |
| Portrait: 500ms scroll-triggered entrance | Static portrait | No additional information was conveyed by moving the photo |
| Work disclosures: opacity/translation state depended on prior pointer interaction | Immediate content and arrow state changes | Repeated interactions should be direct and consistent; no hidden exit animation or keyboard delay |
| Theme: body color fade while child surfaces changed immediately | Immediate theme change for pointer, touch, and keyboard | Avoid a disjoint partial-page crossfade and unnecessary full-page paint animation |
| Primary link: hover lift and press shrink | Fine-pointer-only 160ms opacity hover feedback; immediate press/focus | Preserve the control's position and text clarity |
| Theme button: press shrink | Immediate background feedback | Confirm input without scaling the icon or moving keyboard controls |
| Global smooth anchor navigation | Immediate native anchor navigation | Avoid long animated travel and keyboard-initiated scrolling |

Implementation locations: `src/components/motion.tsx:6` (hero), `src/components/motion.tsx:10` (disclosures), `src/components/theme-toggle.tsx:8` (theme), `src/app/globals.css:5` (navigation), `src/app/globals.css:19` (theme feedback), `src/app/globals.css:30` (primary action).

## Complete interaction inventory

| Surface | Final behavior | Purpose / decision |
| --- | --- | --- |
| Hero name, introduction, actions | Motion transform and opacity, 300ms, 50ms stagger, one iteration | Rare first-visit introduction; cubic-bezier(0.23,1,0.32,1) |
| Reduced-motion hero | 150ms opacity 0.96–1; no translation or stagger | Gentle alternative; stable server/client transform endpoint |
| Portrait, timeline, skills, education, contact | No scroll reveals or idle motion | Content remains still for reading |
| Work button, content, arrow | Immediate disclosure state, semantic aria-expanded/controls and hidden | Mouse, touch, Enter, Space; rapid changes cannot queue animation |
| Theme button | Immediate page theme, persistent saved choice; no icon rotation | Same direct state change for every input type |
| Primary action hover | CSS opacity transition only; 160ms ease | Near-imperceptible pointer feedback; interruptible |
| Primary action press and keyboard focus | Immediate state, no transform or transition | Direct feedback; stable target |
| Theme hover/press | Immediate background change | Small state indication; fine-pointer hover gate |
| Navigation, About experience link, footer top link | Native immediate anchors | Predictable navigation without scrolling choreography |
| Skip link and all focus rings | Immediate visible focus | Never defer keyboard access |
| Text/social/email/CV links | Native link/download actions; pointer underline/color, no animated transform | Clear affordances; no exit animation or artificial delay |
| Static SVG arrow orientation | State-dependent rotation without transition | Orientation indicates expanded/collapsed state; not decorative motion |

## Browser verification

Used configured Playwright MCP against the production build, with native Web Animations API interception before hydration:

- Normal mode recorded exactly six hero animation tracks: three opacity and three transform tracks. Each was 300ms; delays were 0, 50, 100ms. Transform endpoints were translateY(4px) and translateY(0px). No non-hero animations were recorded on mount.
- Reduced motion recorded three 150ms opacity tracks, each with zero delay; no transform animation was created. No hydration errors.
- Six repeated mouse toggles and keyboard Enter open/close passed. Disclosures and theme switching created no animation tracks.
- Keyboard Space on theme button: computed transform none, transition duration 0s.
- Pointer hover: computed transform none, transition property opacity; reversing the hover returned opacity to 1.
- Scrolling through About and Work created zero animation tracks.
- A separate mobile context used actual synthesized touch taps with hasTouch enabled: both disclosure states and dark-theme switching passed. Fine-pointer hover media query was false; controls stayed untransformed.
- Console: zero warnings and zero errors in production.
- Lint and production build passed. No new dependencies.

## Performance and verdict

Approve: no feel-breaking regressions or unnecessary repeated motion remain. The sole entrance uses full transform strings and opacity, observed through native WAAPI. No animated layout, filters, shadows, inherited custom properties, frame-by-frame React state, will-change hints, or persistent loops were introduced. No GPU/frame-rate guarantee is implied: physical mid-range-device profiling was not performed. Touch evidence is browser-synthesized, not a physical phone recording.
