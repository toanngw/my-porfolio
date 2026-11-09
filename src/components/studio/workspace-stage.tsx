"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type RefObject } from "react";
import { useClientReady, useDarkTheme, useMotionPaused, usePageVisible, useReducedMotionPreference } from "@/lib/preferences";
import type { SceneCommands } from "./workspace-scene";
import studioFallback from "../../../public/studio-fallback.webp";
const Scene=dynamic(()=>import("./workspace-scene"),{ssr:false});
export function WorkspaceStage({ clock, modelUrl }: { clock: RefObject<number>; modelUrl: string | null }) {
  const controls=useRef<SceneCommands|null>(null);
  const [ready,setReady]=useState(false);
  const [lamp,setLamp]=useState({on:true,instant:false});
  const [paused]=useMotionPaused();
  const visible=usePageVisible(),dark=useDarkTheme();
  const onReady=useCallback(()=>setReady(true),[]);
  const onUnavailable=useCallback(()=>setReady(false),[]);
  const toggleLamp=useCallback(()=>setLamp(value=>({on:!value.on,instant:false})),[]);
  const clientReady=useClientReady();
  const active=clientReady&&!paused&&visible;
  const reduced=useReducedMotionPreference();
  return <div className="workspace-stage" data-ready={ready} data-motion={active ? "running" : "paused"} data-lamp={lamp.on}>
    <div className="scene-frame" role={ready ? "group" : "img"} aria-label="Interactive voxel developer at a wooden workstation with coffee, a plant, and a pull-cord desk lamp" aria-describedby="scene-instructions" tabIndex={ready ? 0 : -1} onKeyDown={event=>{
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Escape","Home"].includes(event.key)){event.preventDefault();controls.current?.key(event.key);}
    }}>
      <div className="scene-poster" aria-hidden="true"><Image src={studioFallback} alt="" fill sizes="(max-width:480px) 320px, (max-width:800px) 440px, (min-width:1600px) 760px, 650px" loading="eager" /></div>
      {clientReady && <Scene clock={clock} modelUrl={modelUrl} active={active} reduced={reduced} dark={dark} controls={controls} lampOn={lamp.on} lampInstant={lamp.instant||!active} onLampToggle={toggleLamp} onReady={onReady} onUnavailable={onUnavailable} />}
    </div>
    <div className="scene-toolbar">
      <button type="button" disabled={!ready} onClick={()=>controls.current?.reset()} aria-label="Reset 3D view"><svg aria-hidden="true" viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 7a6.5 6.5 0 1 1-.3 5M4 3v4h4" /></svg>Reset view</button>
      <span className="scene-toolbar-divider" aria-hidden="true" />
      <button type="button" disabled={!ready} aria-pressed={lamp.on} aria-label={lamp.on ? "Turn desk lamp off" : "Turn desk lamp on"} onClick={event=>setLamp(value=>({on:!value.on,instant:event.detail===0||!active}))}><svg aria-hidden="true" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="m6 3-3 7h10l-3-7ZM8 10v6M4 17h8M11 4l4 4v9" /><path d="M15 2v2m2 1 2-1" /></svg>Lamp {lamp.on ? "on" : "off"}</button>
    </div>
    <p className="scene-caption" id="scene-instructions">{ready ? "Drag to rotate · Scroll to zoom" : "A little winter, wherever you are."}<span className="sr-only">. Touch: drag with one finger, pinch with two. Pull or tap the lamp cord to switch the light. Keyboard: arrow keys rotate, plus and minus zoom, Escape resets.</span></p>
  </div>;
}
