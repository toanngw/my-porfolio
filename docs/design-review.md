# Portfolio critique and implementation

Method: dual-agent — independent design assessment A (`/root/design_assessment`) and mechanical/browser assessment B (`/root/browser_assessment`). A inspected source and a parent-captured desktop screenshot; B inspected its own fresh browser tab. Initial browser profile contention was resolved by sequentially releasing browser ownership. This report concerns the original starter and the five improvements implemented from it.

## Initial critique

Design specificity was absent: the page displayed Next.js branding, setup instructions, and Vercel onboarding rather than Cao-Toan Nguyen's identity and work. Its semantic main, simple reading sequence, real links, and 48px main buttons were useful foundations. Empty intervals separated unrelated setup content. Visitors could neither evaluate nor contact the engineer.

| Heuristic | Initial score | Evidence |
| --- | --- | --- |
| System status | n/a | No stateful portfolio workflow |
| Real-world match | 0/4 | Setup instructions instead of portfolio |
| Control and freedom | 3/4 | Ordinary links, some unexpected new tabs |
| Consistency | 3/4 | Consistent but irrelevant starter identity |
| Error prevention | n/a | No input or consequential workflow |
| Recognition over recall | 1/4 | Portfolio destinations absent |
| Flexibility and efficiency | n/a | Informational portfolio |
| Aesthetic and minimalist design | 2/4 | Restrained, but wrong audience and purpose |
| Error recovery | n/a | No error-producing flow |
| Help/documentation | n/a | Not required for this surface |
| Total | 9/20 | Poor against the intended portfolio task |

Cognitive load was numerically low (no decision point over four choices), but all choices served the wrong task. First-time visitors could not identify the owner; mobile visitors lost width to 64px side padding; keyboard visitors had no authored focus treatment. The emotional journey began with an unfinished scaffold and ended in framework onboarding.

## Five priorities implemented

| Priority | Before | After | Why |
| --- | --- | --- | --- |
| P0 — Identity | No name, role, or introduction | Expressive name, software engineering introduction, location, portrait | Establish whose work visitors are evaluating |
| P1 — Visitor paths | Deploy and framework documentation links | Work, About, Contact, CV download, email and verified social URLs | Give each visitor a useful next step |
| P1 — Evidence | No professional information | CV-supported work disclosures, timeline, categorized skills, education and mentoring | Support assessment with facts rather than invented claims |
| P1 — Visual identity | Default neutral scaffold and framework branding | Locally hosted Lora/DM Sans, ivory/sage palette, narrow editorial layout | Make hierarchy and personal character explicit |
| P2 — Responsive and finishing quality | No user theme control, default metadata, unreviewed mobile focus | Persistent theme, semantic headings, skip link, 44px nav targets, reduced motion, metadata and share image | Make the portfolio usable across devices and inputs |

No personal-project facts were supplied; selected work is explicitly attributed to professional experience. No project URLs were invented.

## Mechanical and browser evidence

The initial CLI detector returned zero findings. The browser detector independently found one minor straggler at original `src/app/page.tsx:26`: “center.” alone on the last line. This demonstrated the limit of a zero-finding source scan: it did not establish portfolio readiness. The runtime detector overlay was injected successfully in B's Human tab and its temporary live server was stopped with `--keep-inject`. The source was untouched by injection. No ignore list existed.

Final QA used configured Playwright MCP on the actual local application:

- 320, 390, 768, 1440px widths: document width equals viewport width; no horizontal overflow.
- Main navigation: each target at least 44px wide and 44px high.
- Work disclosures: mouse and Enter open/close correctly; aria-expanded and content visibility checked.
- Theme: explicit dark choice survives reload; keyboard activation bypasses theme transition.
- Skip link and Contact navigation reach their intended anchors.
- Reduced motion: scrolling becomes immediate; translation removed; a discovered SSR/client transform mismatch was fixed and errors rechecked.
- CV returns HTTP 200 application/pdf; Open Graph image returns HTTP 200 image/png.
- Sampled contrast: body 12.32:1, secondary text on work surface 4.70:1, accent 5.50:1, dark secondary text 6.80:1, primary button 5.78:1.

## Motion review

| Before | After | Why |
| --- | --- | --- |
| Server/client reduced-motion endpoint differed | Same translateY(0px) endpoint in both modes | Prevent hydration mismatch |
| Theme icon would rotate on keyboard input | Stable icon and immediate keyboard state response | Keep keyboard interactions direct |
| Unexamined reveal frequency | One hero entrance and one portrait reveal; no repeated section choreography | Avoid competing with reading |

Verdict: approve from code and browser inspection. Full transform strings and opacity are used for Motion entrance/reveal/disclosure; 200ms interactive feedback and 500ms first-visit entrances use cubic-bezier(0.23,1,0.32,1). Physical mid-range-device frame profiling and assistive-technology testing were not performed; viewport simulation is not a physical-device test.

## Delivery notes

The production build initially failed because a sandboxed Turbopack worker could not bind its port. A clean build after stopping preview and preserving the failed cache under /tmp succeeded. No deployment was requested in this revision; README documents local development and deployment, including SITE_URL for non-Vercel hosting.

Screenshots: `.playwright-mcp/portfolio-desktop.png`, `portfolio-mobile.png`, `portfolio-tablet.png`, `portfolio-dark.png`. Local QA artifacts are ignored by Git and not deployed.

Questions skipped: the user had already supplied the design direction and explicitly requested implementation of the five most important improvements.
