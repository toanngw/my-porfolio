"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type RefObject } from "react";
import { useClientReady, useDarkTheme, usePageVisible, useReducedMotionPreference } from "@/lib/preferences";
import type { SceneCommands } from "./workspace-scene";
import studioFallback from "../../../public/studio-fallback.webp";
const Scene=dynamic(()=>import("./workspace-scene"),{ssr:false});
export function WorkspaceStage({ clock, modelUrl }: { clock: RefObject<number>; modelUrl: string | null }) {
  const controls=useRef<SceneCommands|null>(null);
  const [ready,setReady]=useState(false);
  const visible=usePageVisible(),dark=useDarkTheme();
  const onReady=useCallback(()=>setReady(true),[]);
  const onUnavailable=useCallback(()=>setReady(false),[]);
  const clientReady=useClientReady();
  const active=clientReady&&visible;
  const reduced=useReducedMotionPreference();
  return <div className="workspace-stage" data-ready={ready} data-motion={active ? "running" : "paused"} data-lamp="true">
    <div className="scene-frame" role={ready ? "group" : "img"} aria-label="Interactive voxel developer at a wooden workstation with coffee, a plant, and a warm desk lamp" aria-describedby="scene-instructions" tabIndex={ready ? 0 : -1} onKeyDown={event=>{
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Escape","Home"].includes(event.key)){event.preventDefault();controls.current?.key(event.key);}
    }}>
      <div className="scene-poster" aria-hidden="true"><Image src={studioFallback} alt="" fill sizes="(max-width:480px) 320px, (max-width:800px) 440px, (min-width:1600px) 760px, 650px" loading="eager" /></div>
      {clientReady && <Scene clock={clock} modelUrl={modelUrl} active={active} reduced={reduced} dark={dark} controls={controls} onReady={onReady} onUnavailable={onUnavailable} />}
    </div>
    <p className="sr-only" id="scene-instructions">Drag or swipe to rotate freely. Scroll or pinch to zoom. Keyboard: arrow keys rotate, plus and minus zoom, Escape resets.</p>
  </div>;
}
