"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { useDarkTheme, useMotionPaused, usePageVisible } from "@/lib/preferences";
import studioFallback from "../../../public/studio-fallback.webp";
const Scene = dynamic(() => import("./workspace-scene"), { ssr: false });

export function WorkspaceStage() {
  const pointer = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [paused] = useMotionPaused();
  const visible = usePageVisible();
  const dark = useDarkTheme();
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => setReady(false), []);
  const active = !paused && visible;
  return <div className="workspace-stage" data-ready={ready} data-motion={active ? "running" : "paused"}>
    <div className="scene-frame" role={ready ? "group" : "img"} aria-label={ready && active ? "Rotating snowy workspace with a developer typing and taking coffee breaks. Move your pointer, or use arrow keys to explore. Escape resets the pointer offset." : "Miniature snowy workspace with a developer, laptop, steaming coffee, warm lamp, and decorated evergreen tree."} tabIndex={ready && active ? 0 : -1} onPointerMove={event => {
      if (event.pointerType === "touch" || !active) return;
      const rect = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: ((event.clientX - rect.left) / rect.width - 0.5) * 2, y: ((event.clientY - rect.top) / rect.height - 0.5) * 2 };
    }} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }} onKeyDown={event => {
      if (!active) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"].includes(event.key)) {
        event.preventDefault();
        const { x, y } = pointer.current;
        pointer.current = { x: Math.max(-1, Math.min(1, x + (event.key === "ArrowLeft" ? -0.3 : event.key === "ArrowRight" ? 0.3 : 0))), y: Math.max(-1, Math.min(1, y + (event.key === "ArrowUp" ? -0.3 : event.key === "ArrowDown" ? 0.3 : 0))) };
        if (event.key === "Escape") pointer.current = { x: 0, y: 0 };
      }
    }}>
      <div className="scene-poster" aria-hidden="true"><Image src={studioFallback} alt="" fill sizes="(max-width: 760px) 320px, 460px" priority /></div>
      <Scene active={active} dark={dark} pointer={pointer} onReady={onReady} onUnavailable={onUnavailable} />
    </div>
    <div className="scene-caption"><span className="small-star" aria-hidden="true" />A small space for big ideas.<span className="scene-hint">Move to explore</span></div>
  </div>;
}
