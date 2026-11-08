# Responsive and accessibility verification

Tested the complete single-page portfolio with configured Playwright MCP against the production build at 375px, 768px, and 1440px widths. Visually inspected full-page screenshots covering navigation, hero, portrait, selected work, experience, skills, education, contact, and footer.

## Issues found and fixed

1. The skip link changed the fragment without moving keyboard focus. Added tabindex=-1 to main; verified activeElement becomes main after activation.
2. Home-link height was 25–29px and the main CTA was 43.4px. Both now have a 44px minimum height. Every visible interactive target is at least 44×44px at the requested widths.
3. At doubled text size, mobile content overflowed to 477px in a 375px viewport. The header can now wrap, long headings can break, email text can wrap without shrinking its icon, and the footer can wrap. Expanded text now fits at all three widths.
4. Work button names included employer, title, technologies, and changing action copy. They now use aria-labelledby for the project title and aria-describedby for the employer/context, retaining aria-expanded and aria-controls.

## Final results

| Check | 375px | 768px | 1440px |
| --- | --- | --- | --- |
| Document width equals viewport | Pass | Pass | Pass |
| No content extends outside viewport | Pass | Pass | Pass |
| Doubled text fits without horizontal scrolling | Pass | Pass | Pass |
| Visible controls at least 44×44px | Pass | Pass | Pass |
| Light-theme axe violations | 0 | 0 | 0 |
| Dark-theme axe violations | 0 | 0 | 0 |
| Expanded work-details axe violations | 0 | 0 | 0 |
| Skip link moves focus to main | Pass | Pass | Pass |
| Keyboard focus indicators | Pass | Pass | Pass |
| Work toggles: mouse, Enter, Space | Pass | Pass | Pass |
| Navigation and experience anchors | Pass | Pass | Pass |
| Back-to-top link | Pass | Pass | Pass |
| Theme switching and reload persistence | Pass | Pass | Pass |
| Both CV links initiate the named PDF download | Pass | Pass | Pass |
| CV response / portrait load | 200 / loaded | 200 / loaded | 200 / loaded |

A separate 375px mobile context used synthesized touch taps to verify the work disclosure and Contact navigation. Email and social destinations were checked against the CV-backed href values; no email was sent or external account interaction attempted.

Accessibility scan: axe-core 4.10.3, loaded from a temporary file without adding dependencies. Selected WCAG 2 A/AA, 2.1 AA, 2.2 AA, and best-practice rules returned no violations or incomplete findings in light and dark modes. These automated results supplement manual keyboard, focus, structure, image, contrast, responsive, and disclosure checks; they do not constitute a complete WCAG conformance certification. Screen-reader speech and physical devices were not tested.

The enlarged-text test doubled each element's computed font size while retaining the viewport width. This is a text-sizing stress test, not a claim of testing a browser's native zoom controls. Both normal and reduced-motion behavior were checked in the preceding animation pass; these fixes preserve that behavior.

Final console: zero errors, zero warnings. Lint, TypeScript/production build, and git diff whitespace checks passed.

## Evidence

For each requested width, screenshots are retained locally under `.playwright-mcp/`:

- `responsive-{width}-light.png`
- `responsive-{width}-dark.png`
- `responsive-{width}-expanded.png`
- `responsive-{width}-enlarged.png`

The browser scanner was temporary and was not included in application code or dependencies. Local screenshots are ignored by Git. The temporary preview server was stopped after verification.
