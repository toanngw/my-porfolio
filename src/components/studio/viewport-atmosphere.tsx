"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useDarkTheme, useMotionPaused, usePageVisible } from "@/lib/preferences";
import { sampleBreeze, type Breeze } from "./breeze";

/** One transparent, pointer-free canvas. Its clock also drives the 3D breeze. */
export function ViewportAtmosphere({ clock }: { clock: RefObject<number> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paused] = useMotionPaused();
  const visible = usePageVisible(), dark = useDarkTheme();
  const weather = useRef({ snow: 0, wind: { strength: 0, phase: 0, x: 0, z: 0 } as Breeze });

  const particles = useRef(Array.from({ length: 84 }, (_, i) => ({
      x: ((i * 0.61803399) % 1), y: ((i * 0.41421356) % 1),
      radius: 0.85 + (i % 5) * 0.28, speed: 13 + (i % 7) * 3.7,
      opacity: 0.3 + (i % 4) * 0.085,
    })));

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context) return;
    let width = 0, height = 0, frame = 0, last = 0;
    const flakes = particles.current;
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
      const moving = !paused && visible;
      if (moving) clock.current += delta;
      const state = weather.current;
      sampleBreeze(clock.current, state.wind);
      const target = dark ? 1 : 0;
      state.snow = moving ? target + (state.snow - target) * Math.exp(-delta * 12) : target;
      context.clearRect(0, 0, width, height);

      // Full-height travel: wrapping happens beyond the screen, never mid-frame.
      if (state.snow > 0.001) flakes.forEach((flake, i) => {
        if (moving) {
          flake.y += flake.speed * delta / (height + 24);
          flake.x += (Math.sin(clock.current * 0.45 + i) * 3 + state.wind.x * 14) * delta / (width + 48);
          if (flake.y > 1) flake.y -= 1;
          if (flake.x > 1) flake.x -= 1;
          if (flake.x < 0) flake.x += 1;
        }
        context.beginPath();
        context.arc(flake.x * (width + 48) - 24, flake.y * (height + 24) - 12, flake.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(246,247,250,${flake.opacity * state.snow})`;
        context.fill();
      });

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
      surface.dataset.snow = dark ? "visible" : "hidden";
      surface.dataset.wind = state.wind.strength.toFixed(3);
      surface.dataset.time = clock.current.toFixed(2);
      if (visible && (moving || Math.abs(state.snow - target) > 0.001)) frame = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [clock, dark, paused, visible]);

  return <canvas ref={canvas} className="viewport-atmosphere" aria-hidden="true" />;
}
