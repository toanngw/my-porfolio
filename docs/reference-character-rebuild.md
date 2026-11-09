# Reference character replacement

Source: `public/reference-image.jpeg`, the newly supplied short-haired character wearing a tan jacket and teal shirt. The former dreadlock image is no longer present. This rebuild uses the new image.

## Geometry and composition

The old `character-head.tsx` and `character-details.tsx` implementations were removed. `reference-face.tsx` defines a new smooth section-based facial surface with integrated nasal relief, separate shaped lip surfaces, almond eye meshes, tapered brow strips and a silver ear stud. No old face mesh or jaw/beard deformation is reused. Subtle mustache strokes, blended chin color and fine chin stubble provide the requested light facial hair.

`reference-hair.tsx` uses 460 varied curl clusters and coils across two instanced meshes. `reference-outfit.tsx` defines the open tan jacket, teal shirt, folded gray hood, lining/zipper seams, necklace and silver pendant. No backpack or dreadlocks remain. `character-forms.tsx` contains shared seam and limb helpers. The existing ref-based animation controller and keyboard/mug coordinates are retained in `developer-character.tsx`.

| Review finding | Refinement | Reason |
| --- | --- | --- |
| Old character proportions had drifted from the new image | New face mesh and section landmarks | Remove accumulated facial changes |
| Brows and eyes looked too uniformly open | Tapered brow ends and relaxed upper eyelid | More restrained expression |
| Repeated curl pattern was too orderly | Small deterministic cluster offsets and varied rotations/scales | More natural hair silhouette |
| Rear skull blended too far into the neck | Smooth posterior contour and a closed chin pole | Cleaner side/back silhouette |
| Large full beard contradicted the youthful reference | Light mustache and sparse short chin stubble | Understated facial hair |

## Validation

Playwright screenshots: `.playwright-mcp/new-reference-final-{front,left,right,side,back,desktop,coffee,light,mobile}.png`. The last side-profile refinement is `.playwright-mcp/new-reference-polished-side.png`. Compared front and three-quarter views with the source and inspected side/back views.

- Fresh browser context: no console or page errors.
- Intro: 3.000 turns.
- Animation samples: typing, reaching, drinking and return to typing; blink closes to scale 0.07 and reopens to 1.
- Lamp keyboard button turns off/on, camera arrow/reset controls work, theme changes work.
- 390×844: no document width overflow; hamburger navigation reaches Experience.
- Lint, TypeScript, production build and diff whitespace checks pass.
- Transparent static fallback exported from the actual replacement scene.

The surrounding layout, public-facing name, navigation model, portfolio content, music, weather, lamp and desk implementations were preserved. No commit or deployment was performed.

## Art limitation

This is an original custom-mesh interpretation of a single image. A rigged GLB created through a dedicated sculpting, retopology and texture-authoring workflow would support more accurate likeness and film-quality surface detail. No Blender executable or 3D model-generation tool is available in this environment, so this work does not claim an exact reproduction or parity with a professionally sculpted asset. The existing workspace rig drives the new meshes; no external model or texture pretending to be a three-dimensional face is used.
