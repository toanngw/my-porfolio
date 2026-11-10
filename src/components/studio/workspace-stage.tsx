"use client";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type RefObject } from "react";
import { useClientReady, useDarkTheme, usePageVisible, useReducedMotionPreference } from "@/lib/preferences";
import type { CharacterStory } from "./character-story";
import type { SceneCommands } from "./workspace-scene";
const Scene=dynamic(()=>import("./workspace-scene"),{ssr:false});
export function WorkspaceStage({ clock, story,anchor,onRelease,onUnavailable: unavailable }: { clock: RefObject<number>;anchor:RefObject<HTMLDivElement|null>;story:RefObject<CharacterStory>;onRelease:()=>void;onUnavailable:()=>void }) {
  const interaction=useRef<HTMLDivElement>(null);
  const controls=useRef<SceneCommands|null>(null);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);
  const visible=usePageVisible(),dark=useDarkTheme();
  const onReady=useCallback(()=>setReady(true),[]);
  const onUnavailable=useCallback(()=>{setReady(false);setFailed(true);unavailable();},[unavailable]);
  const clientReady=useClientReady();
  const active=clientReady&&visible;
  const reduced=useReducedMotionPreference();
  return <><div className="workspace-stage" data-ready={ready} data-motion={active ? "running" : "paused"} data-lamp="true">
    <div ref={interaction} className="scene-frame" role="group" aria-busy={!ready&&!failed} aria-label="Interactive voxel developer at a wooden workstation with coffee, a plant, and a warm desk lamp" aria-describedby="scene-instructions" tabIndex={ready ? 0 : -1} onKeyDown={event=>{
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Escape","Home"].includes(event.key)){event.preventDefault();controls.current?.key(event.key);}
    }}>
      {failed&&<p className="scene-loading" role="status">3D preview unavailable. Your portfolio is ready below.</p>}

    </div>
    <p className="sr-only" id="scene-instructions">Drag or swipe to rotate freely. Scroll or pinch to zoom. Keyboard: arrow keys rotate, plus and minus zoom, Escape resets.</p>
  </div><div className="webgl-viewport" data-ready={ready} aria-hidden="true">{clientReady && <Scene anchor={anchor} interaction={interaction} story={story} onRelease={onRelease} clock={clock} active={active} reduced={reduced} dark={dark} controls={controls} onReady={onReady} onUnavailable={onUnavailable} />}</div></>;
}
