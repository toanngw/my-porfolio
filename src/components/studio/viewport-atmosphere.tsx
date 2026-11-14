"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useDarkTheme, usePageVisible } from "@/lib/preferences";
import { sampleBreeze, type Breeze } from "./breeze";

/** One transparent, pointer-free canvas. Its clock also drives the 3D breeze. */
export function ViewportAtmosphere({ clock }: { clock: RefObject<number> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = usePageVisible(), dark = useDarkTheme();
  const weather = useRef({ wind: { strength: 0, phase: 0, x: 0, z: 0 } as Breeze });

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context) return;
    let width = 0, height = 0, frame = 0, last = 0;
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width * dpr); surface.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!frame && visible) frame = requestAnimationFrame(draw);
    };
    const draw = (now: number) => {
      frame = 0;
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const moving = visible;
      if (moving) clock.current += delta;
      const state = weather.current;
      sampleBreeze(clock.current, state.wind);
      context.clearRect(0, 0, width, height);

      // Open calligraphic arcs, sampled once per stroke. Every path extends
      // beyond both viewport edges, so no scene-sized clipping rectangle exists.
      for (let i = 0; i < 2; i++) {
        const progress = (state.wind.phase - 1.3 - i * 0.65) / 8;
        if (progress <= 0 || progress >= 1.4) continue;
        const head = progress * 1.22, tail = head - 0.22;
        const baseline = height * (0.34 + i * 0.27 + Math.sin(Math.floor(clock.current / 26) * 2.1) * 0.12);
        const amplitude = Math.min(height * 0.09, 85) * (i % 2 ? -1 : 1);
        const point = (t: number) => ({
          x: -width * 0.3 + t * width * 1.6,
          y: baseline + Math.sin(t * Math.PI * 2 + i * 0.35) * amplitude + Math.sin(t * Math.PI) * amplitude * 0.3,
        });
        const start = Math.max(0, tail), end = Math.min(1, head);
        const segments = 72;
        for (let j = 0; j < segments; j++) {
          const t = start + (end - start) * j / segments;
          const a = point(t), b = point(start + (end - start) * (j + 1) / segments);
          const taper = Math.sin(Math.PI * Math.max(0, Math.min(1, (t - tail) / 0.22)));
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
          context.lineWidth = (i ? 0.95 : 1.4) * (0.45 + taper * 0.55);
          context.strokeStyle = dark ? `rgba(246,241,230,${taper * 0.38})` : `rgba(115,105,85,${taper * 0.24})`;
          context.lineCap = "round"; context.stroke();
        }
      }
      surface.dataset.wind = state.wind.strength.toFixed(3);
      surface.dataset.time = clock.current.toFixed(2);
      if (visible) frame = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [clock, dark, visible]);

  return <canvas ref={canvas} className="viewport-atmosphere" aria-hidden="true" />;
}
