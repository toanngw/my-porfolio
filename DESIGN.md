# Portfolio design system

The interface uses a warm editorial composition, a narrow centered column, and restrained asymmetry. The name, portrait, and CV-supported work provide the identity. No fabricated project imagery or outcomes.

## Tokens
| Role | Light | Dark |
| --- | --- | --- |
| Background | #f6f5ef | #20251f |
| Foreground | #2b302b | #eeeee4 |
| Secondary text | #646b60 | #b5bcae |
| Accent | #53694c | #bacdab |
| Work surface | #eceee5 | #2a3227 |
| Divider | #d7dacf | #414a3b |

All UI colors use semantic custom properties in src/app/globals.css. Spacing uses 4–8px increments, 55–78px section separation, and 24–40px mobile/desktop gutters. The overall shell is at most 944px including gutters.

## Typography
Locally hosted Lora regular/italic for name, section headings, and work titles; locally hosted DM Sans for body and navigation. Body 14–15px with generous leading, headings 27–38px, hero 59–96px. Tracking never below -0.04em. Font licenses live beside the assets.

## Components and behavior
Navigation remains visible as ordinary anchors on mobile. Project disclosures are real buttons with aria-expanded and aria-controls; hidden content is excluded from keyboard navigation. Theme uses system preference until a saved explicit choice; it initializes before hydration. All key targets are at least 44px high. Photos reserve aspect ratio and use next/image.

## Motion
The hero is the only entrance: 300ms, 50ms stagger, 4px translation, and opacity 0.9–1, using cubic-bezier(0.23,1,0.32,1). Reduced motion uses a 150ms opacity change with no translation or stagger. Content starts visible and interactive. The portrait stays still. Work disclosures, theme switches, focus, and anchor navigation respond immediately for every input type. The primary link has a fine-pointer-only opacity hover transition (160ms); press and keyboard focus feedback are immediate. No lift, shrink, scroll reveal, looping motion, layout animation, or page-wide theme transition.

## Responsive rules
At 700px, supporting columns tighten. At 600px, layouts become single-column and the portrait is a square crop. Below 380px, the header surname is hidden to preserve navigation target sizes; the accessible home-link label retains the full name.
