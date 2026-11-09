# Snowlight Studio assets

- `public/avatar.jpg`: original user-supplied portrait, retained unchanged.
- `public/avatar-cutout.webp`: background-removal edit of that portrait using the built-in image-editing tool, then encoded to WebP with alpha preserved. The exact edit prompt is stored in its `.webp.json` provenance sidecar (the tool’s supported fallback for WebP). Visual inspection compared the person against the source; no face retouch or identity change was requested. Alpha extrema are 0 and 1, with transparent surroundings and natural-edge pixels. File is approximately 190KB.
- `public/studio-fallback.webp`: transparent render from an earlier revision of the original procedural workspace, retained as an archival asset; it is no longer displayed while loading or when WebGL is unavailable. The scene is authored with geometric meshes and local materials; no external models, textures, HDR images, or reference-site assets. Origin recorded in the matching `.webp.json` provenance sidecar.
- Scene lighting, desk/monitor/lamp, voxel developer, chair, plant, and mug/steam are original code-native geometry. They are visual atmosphere, not claims about a real office or personal possessions.
- Project diagrams are abstract geometric explanations of the CV-supported API/database and object-detection work; they are not product screenshots.
- Locally hosted DM Sans and its SIL Open Font license are retained in `src/app/fonts/`.

- Monitor code is an original illustrative texture generated with Canvas; it is not a project screenshot. The archived scene image is not imported into the live interface.
- Scrolling ticks and boundary clacks are synthesized with Web Audio in `src/lib/studio-audio.ts`. Background music uses the user-supplied recordings in `public/audio/`, listed in `src/lib/music-tracks.ts`; credits follow their verified embedded metadata.
