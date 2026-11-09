# Snowlight Studio assets

- `public/avatar.jpg`: original user-supplied portrait, retained unchanged.
- `public/avatar-cutout.webp`: background-removal edit of that portrait using the built-in image-editing tool, then encoded to WebP with alpha preserved. The exact edit prompt is stored in its `.webp.json` provenance sidecar (the tool’s supported fallback for WebP). Visual inspection compared the person against the source; no face retouch or identity change was requested. Alpha extrema are 0 and 1, with transparent surroundings and natural-edge pixels. File is approximately 190KB.
- `public/studio-fallback.webp`: transparent render of the original procedural workspace from `src/components/studio/workspace-scene.tsx`. The scene is authored with geometric meshes and local materials; no external models, textures, HDR images, or reference-site assets. Origin recorded in the matching `.webp.json` provenance sidecar.
- Scene lighting, open desk/laptop/lamp, original blocky developer, mug/steam, decorated snow-capped evergreen, gifts, and server blocks are original code-native geometry. They are visual atmosphere, not claims about a real office or personal possessions.
- Project diagrams are abstract geometric explanations of the CV-supported API/database and object-detection work; they are not product screenshots.
- Locally hosted DM Sans and Lora and their SIL Open Font licenses are retained in `src/app/fonts/`.

- Monitor code is an original illustrative texture generated with Canvas; it is not a project screenshot. The static scene fallback is imported as a hashed Next.js asset, so a scene update also refreshes image caches.
- Background music and navigation clicks are originally synthesized with Web Audio in `src/lib/studio-audio.ts`; no copyrighted song, third-party recording, or audio asset is included.
