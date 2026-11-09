"use client";
import { useEffect, type ReactNode, type RefObject } from "react";
import type { CharacterStory } from "./character-story";
import { playScrollTick } from "@/lib/studio-audio";

/** The layout slot only anchors the camera; it never clips or resizes the renderer. */
export function CinematicStage({story,children,complete,panel,spacer,onReveal,anchor}:{story:RefObject<CharacterStory>;children:ReactNode;complete:boolean;panel:RefObject<HTMLDivElement|null>;spacer:RefObject<HTMLDivElement|null>;onReveal:(progress:number)=>void;anchor:RefObject<HTMLDivElement|null>}){
 useEffect(()=>{
  if(complete)return;
  let frame=0,lastTop=0,lastTick=0;
  const draw=()=>{
   const p=story.current.reveal;onReveal(p);
   if(panel.current){
    if(spacer.current)spacer.current.style.height=`${panel.current.clientHeight}px`;
    const top=panel.current.clientHeight*p;panel.current.scrollTop=top;
    if(top-lastTop>40&&performance.now()-lastTick>60){playScrollTick();lastTop=top;lastTick=performance.now();}
   }
   frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[story,complete,panel,spacer,onReveal]);
 return <div ref={anchor} className="scene-slot"><div className="scene-column">{children}</div></div>;
}
