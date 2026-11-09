# Tactile section scrolling

The reading panel still displays one section at a time. Input moves freely inside the active section; continuing the same wheel, trackpad, or touch gesture loads a progressive detent at its edge. There is no gesture cooldown or requirement to lift and swipe again. Crossing upward enters the previous section at its bottom.

`src/lib/scroll-detent.ts` owns the tunable physics: a 44px approach zone, 76px base input threshold, and at most 9px of visual compliance. Velocity adds up to 22% resistance. Pressure memory permits gentle wheel input; the visual nudge settles quickly when input stops. Reversal unloads resistance immediately. Layout dimensions define scroll limits, so the nudge cannot create phantom overflow.

`scroll-navigation.tsx` retains proportional wheel deltas and native trackpad inertia. Touch moves directly with the finger, then receives a bounded, damped momentum tail. Crossing a notch absorbs momentum. Nested scrollers, editable controls, browser zoom, and the 3D canvas retain their input. Keyboard navigation bypasses the resistance threshold at an edge. Reduced motion disables compliance, interpolation, and touch inertia.

`studio-audio.ts` emits distance-based dry ticks and a heavier boundary clack with a low-pass noise impact. A compressor limits the effect mix independently of music. Browser activation is still required. Haptics request 3ms for reading ticks and 11ms for boundaries, with a silent fallback where unsupported.

Validation: `node scripts/verify-scroll-detent.mjs` and `npx next build --webpack`. Browser checks covered both directions, slow wheel input, reversal, an uninterrupted touch crossing with momentum, nested native scrolling, 3D wheel isolation, audio source output, haptic requests, and reduced motion.
