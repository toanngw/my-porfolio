"use client";
import { useEffect, useRef } from "react";
import { useDarkTheme, useMotionPaused, usePageVisible } from "@/lib/preferences";

type Flake = { x: number; y: number; radius: number; speed: number; phase: number; opacity: number };
export function Snowfall() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Flake[]>([]);
  const dimensions = useRef({ width: 0, height: 0 });
  const dark = useDarkTheme();
  const [paused] = useMotionPaused();
  const visible = usePageVisible();
  useEffect(() => {
    const element = canvas.current;
    if (!element || !dark) return;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let last = 0;
    let width = 0;
    let height = 0;
    let flakes = particles.current;
    let seed = 90421;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element!.width = Math.round(width * dpr);
      element!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (dimensions.current.width !== width || dimensions.current.height !== height) {
        flakes = Array.from({ length: width < 600 ? 32 : 72 }, () => ({ x: random() * width, y: random() * height, radius: 0.7 + random() * 1.4, speed: 18 + random() * 24, phase: random() * Math.PI * 2, opacity: 0.22 + random() * 0.38 }));
        particles.current = flakes;
        dimensions.current = { width, height };
      }
      draw(0);
    }
    function draw(time: number) {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      ctx!.clearRect(0, 0, width, height);
      for (const flake of flakes) {
        if (!paused && visible) {
          flake.y = (flake.y + flake.speed * dt) % height;
          flake.x = (flake.x + Math.sin(time * 0.00025 + flake.phase) * dt * 8 + width) % width;
        }
        ctx!.fillStyle = `rgba(246,247,251,${flake.opacity})`;
        ctx!.beginPath(); ctx!.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2); ctx!.fill();
      }
    }
    function tick(time: number) { draw(time); frame = requestAnimationFrame(tick); }
    resize();
    window.addEventListener("resize", resize);
    if (!paused && visible) frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [dark, paused, visible]);
  return <canvas ref={canvas} className="snowfall" data-active={dark} aria-hidden="true" />;
}
