---
name: Snowlight Studio
description: A quiet winter workspace for Cao-Toan Nguyen’s software engineering portfolio.
colors:
  light-background: "#f4f0e8"
  light-foreground: "#28272b"
  light-muted: "#69656a"
  light-accent: "#9b693f"
  light-surface: "#e9e4da"
  light-line: "#d8d2c9"
  light-button: "#343237"
  light-button-text: "#faf8f2"
  light-selected: "#e8dfd1"
  light-diagram: "#647b80"
  dark-background: "#111114"
  dark-foreground: "#efedf0"
  dark-muted: "#aaa5ae"
  dark-accent: "#d9b892"
  dark-surface: "#1b1b20"
  dark-line: "#323138"
  dark-button: "#e7d5bb"
  dark-button-text: "#252127"
  dark-selected: "#29262a"
  dark-diagram: "#a9c4c8"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "47px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1.28
    letterSpacing: "-0.03em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    lineHeight: 1.85
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
rounded:
  tag: "4px"
  control: "5px"
  circular: "50%"
spacing:
  compact: "8px"
  inset: "16px"
  section: "24px"
  desktop-gap: "48px"
components:
  button-primary:
    backgroundColor: "{colors.light-button}"
    textColor: "{colors.light-button-text}"
    rounded: "{rounded.control}"
    padding: "8px 17px"
  button-primary-dark:
    backgroundColor: "{colors.dark-button}"
    textColor: "{colors.dark-button-text}"
    rounded: "{rounded.control}"
    padding: "8px 17px"
  navigation-selected:
    backgroundColor: "{colors.light-selected}"
    textColor: "{colors.light-foreground}"
    rounded: "{rounded.control}"
    padding: "0 12px"
  technology-tag:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-muted}"
    rounded: "{rounded.tag}"
    padding: "3px 8px"
---
# Design System: Snowlight Studio

## Overview

**Creative North Star: "Snowlight Studio"**

Snowlight Studio is a quiet winter workspace: an original miniature timber alcove, warm lamp, laptop, shoji frame, and snowy pine sit beside compact portfolio content. The scene supplies the material character; charcoal and ivory interface surfaces keep professional evidence easy to read.

The persistent workspace accompanies six hash-linked views. Local typography, a transparent portrait, restrained controls, and subtle ambient movement make the setting personal without replacing the CV-backed work.

**Key Characteristics:**
- Persistent original procedural workspace with a matching static fallback.
- Neutral dark and ivory light themes with warm accents.
- Compact content, quiet separators, and small rounded controls.
- Ambient motion respects pause, reduced motion, and tab visibility.

## Colors

The palette is neutral charcoal or ivory, warmed by small timber-colored accents. Frontmatter records the exact semantic values from `src/app/globals.css`; light/dark pairs map to the same runtime custom property. Components switch through those properties, not separate hardcoded themes.

### Primary

- **Warm timber / lamplight** (`light-accent`, `dark-accent`): identity dots, keyboard focus, selected timeline nodes, and email emphasis.

### Neutral

- **Ivory / night charcoal** (`*-background`): full viewport.
- **Ink / soft white** (`*-foreground`): headings and primary text.
- **Quiet gray** (`*-muted`): supporting copy, labels, navigation.
- **Inset tone** (`*-surface`): tags, selected experience, theme control, project diagrams.
- **Fine divider** (`*-line`): section boundaries and scrollbars.
- **Action pair** (`*-button`, `*-button-text`): primary links.
- **Selected tone** (`*-selected`): active navigation and project choices.
- **Diagram slate** (`*-diagram`): abstract API and detection illustrations, not a general marketing accent.

**The Warm Accent Rule.** Use the accent for small identity marks, focus, selected timeline nodes, and contact emphasis; keep the large interface surfaces neutral.

## Typography

**Display Font:** DM Sans, locally hosted (`dm-sans.ttf`), with sans-serif fallback for the home identity.
**Body Font:** DM Sans, locally hosted, with sans-serif fallback.
**Editorial Font:** Lora regular and italic, locally hosted, with Georgia and serif fallbacks. Font licenses remain beside the assets.

### Hierarchy

- **Display:** home identity uses the frontmatter display role; it becomes 41px at 1030px, 44px at 800px, and 35px at 480px.
- **Headline:** Lora view titles use the headline role; contact uses 39px. At 480px, view titles become 29px and contact 32px.
- **Title:** DM Sans section headings use the title role; tertiary headings use 14px, weight 500.
- **Body:** body defaults to the frontmatter role; panel paragraphs use 13px, with 15px home introduction/lead. At 480px, paragraphs use 12px and home introduction/lead 13px.
- **Label:** navigation and actions use the label role; experience dates/location, technology tags, project attribution, contact account IDs, About languages, and home location use 12px; captions use 9–10px. These are supporting text, not a reusable eyebrow system.

**The Two Voices Rule.** Use DM Sans for the home identity and interface; use Lora for view titles and the studio signature.

## Layout

The document stays within the viewport (`100dvh`, body overflow hidden). A centered shell has a maximum width of 1170px, desktop padding of 24px 40px 18px, and header/content/footer rows separated by 24px. The main area uses two columns (`1.04fr / 1fr`) with a 48px gap. The 410px scene sits opposite a content frame whose height is `min(600px,100%)`; the frame is a flex column and the scrollable panel uses `flex: 1`, `min-height: 0`, and padding of 24px 16px 16px 5px. A dedicated continuation strip sits outside the scroll viewport when needed. Scroll belongs to the content panel, including constrained screens, rather than the document.

At 1030px, horizontal shell padding becomes 28px, the main gap 25px, scene height 360px, and portrait 120×160px. At 800px, navigation moves below the header, the main area becomes one column with rows `min(29dvh,290px) minmax(0,1fr)` and a 20px gap. The scene stays present, signature hides, and the content frame uses a 560px maximum width and 100% height, while panel padding becomes 10px 16px 16px. The home panel drops its desktop top padding. The portrait is 145×170px.

At 480px, shell padding is 10px 18px, shell gap 12px, navigation is a three-column/two-row grid, and the scene row is `min(25dvh,210px)` with a 10px main gap and 320px scene maximum width. Panel padding becomes 8px 8px 12px; portrait becomes 112×136px. On desktop at heights ≤650px, scene height becomes 310px, shell gap 15px, and shell block padding 14px. At widths ≤800px and heights ≤600px, the scene row becomes `min(20dvh,120px)`, its frame fills that row, the decorative caption hides, and shell gap/block padding become 8px. Preserve panel keyboard access, wrapping, and contained vertical scrolling at every size.

## Elevation & Depth

Depth belongs primarily to the original Three.js workspace: orthographic camera, rounded geometry, warm/cool lighting, and contact shadows. Interface sections use tone and fine dividers rather than raised cards. The portrait has one subtle drop shadow (`0 8px 12px rgb(0 0 0 / .09)`).

**The Scene Owns Depth Rule.** Let the workspace carry dimensionality; keep content containers quiet and avoid adding floating card shadows.

## Shapes

Controls and diagram containers have gently rounded corners (frontmatter `control`); tags use the smaller `tag` radius. Theme and motion controls are circular. Borders are thin and quiet. The transparent portrait retains the supplied person's silhouette; it is not a circular or square photograph crop.

## Components

### Buttons

Primary links use the action color pair, 44px minimum height, a small radius, 12px medium text, 8px 17px padding, and an inline SVG arrow. At 480px, text remains 12px and horizontal padding becomes 12px. Fine-pointer hover lowers opacity to .88 over 160ms; focus/press feedback has no transition. Text links keep a 44px minimum height and underline on fine-pointer hover. All focusable controls use a 2px accent outline with 5px offset.

### Chips

Technology tags use inset-tone fill, muted 12px text, a small radius, and 3px 8px padding. Skills tags use 12px text and 4px 10px padding. These are informational lists, not interactive filters.

### Cards / Containers

Content is largely unboxed. Selected experience rows use the inset surface, 70px minimum height, and 12px 14px padding; project illustrations use a 100px-high tonal container. Contact rows use fine top/bottom dividers and a 69px minimum height. Do not infer a generic elevated-card system.

### Navigation

Six ordinary anchors target `#home`, `#about`, `#experience`, `#projects`, `#skills`, and `#contact`; `#work` remains a compatibility alias. Active navigation uses `aria-current="page"` and selected tone. History navigation updates the view; panel scroll resets after a view change. Outgoing content is inert and hidden from accessibility APIs. Experience/project choices are buttons with `aria-pressed` and live detail regions.

### Panel continuation

A small “More below” button occupies a dedicated strip below the scroll viewport, aligned to the right with 6px 16px 0 0 margin. It appears only when active content needs scrolling and its bottom remains below the panel bottom; the measurement excludes artificial trailing padding and outgoing views, with a 2px tolerance. It uses the background/foreground pair, fine divider border, 5px radius, 44px minimum height, 12px text, and 6px 12px padding. Activating it scrolls immediately by 75% of panel height (at least 100px); it hides at the content end. Its accessible name identifies the current view. Resize, content changes, and scrolling recompute availability.

### Workspace and atmosphere

The original procedural scene persists across views. Pointer movement and arrow keys alter its orientation; Escape resets it. Touch retains vertical panning. A locally rendered image of the same original Three.js model (`public/studio-fallback.webp`) remains visible before readiness and when WebGL is unavailable. The scene is decorative context with an accessible description, never a substitute for work evidence.

Canvas snowfall appears only in dark mode. Scene and snow animation loops run only with normal motion, user motion enabled, and an active tab; pause, reduced motion, and hidden tabs freeze ambient movement. The scene uses demand rendering while inactive. Reduced-motion preference subscribes to media-query changes and updates during the session without a reload. View transitions use 180ms and small vertical offsets only after pointer navigation and when pause/reduced-motion settings allow; keyboard navigation is immediate. Project selection uses 160ms/4px after pointer activation and respects reduced motion. Snow visibility uses 250ms opacity and poster readiness uses 180ms; reduced motion shortens these opacity transitions to 150ms. Theme preference initializes before hydration and follows system preference until explicitly saved.

## Do's and Don'ts

### Do:

- **Do** preserve the six hash-linked views and persistent workspace.
- **Do** keep interactive controls at least 44px high and provide visible keyboard focus.
- **Do** preserve both themes, local fonts, and the supplied portrait identity.
- **Do** stop ambient animation loops for user pause, reduced motion, or hidden tabs.

### Don't:

- **Don't** replace the original scene with borrowed reference-site assets or code.
- **Don't** add saturated interface surfaces or decorative card shadows.
- **Don't** turn project diagrams into screenshots or imply unverified outcomes.
