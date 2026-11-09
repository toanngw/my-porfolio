"use client";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import type { CharacterStory } from "./character-story";
import { playScrollTick } from "@/lib/studio-audio";

/** One persistent canvas moves from the full-screen stage to its normal layout slot. */
export function CinematicStage({story,children,complete,panel,spacer,onReveal}:{story:RefObject<CharacterStory>;children:ReactNode;complete:boolean;panel:RefObject<HTMLDivElement|null>;spacer:RefObject<HTMLDivElement|null>;onReveal:(progress:number)=>void}){
 const slot=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let frame=0,lastTop=0,lastTick=0;
  const draw=()=>{
   const box=slot.current?.getBoundingClientRect(),node=stage.current;
   if(box&&node){
    const p=complete?1:story.current.reveal;
    node.style.left=`${box.left*p}px`;node.style.top=`${box.top*p}px`;
    node.style.width=`${innerWidth+(box.width-innerWidth)*p}px`;node.style.height=`${innerHeight+(box.height-innerHeight)*p}px`;
    if(!complete){
     onReveal(p);
     if(panel.current){if(spacer.current)spacer.current.style.height=`${panel.current.clientHeight}px`;const top=panel.current.clientHeight*p;panel.current.scrollTop=top;
      if(top-lastTop>40&&performance.now()-lastTick>60){playScrollTick();lastTop=top;lastTick=performance.now();}
     }
    }
   }
   if(!complete)frame=requestAnimationFrame(draw);
  };
  const resize=()=>{if(complete)draw();};
  const observer=new ResizeObserver(resize);if(slot.current)observer.observe(slot.current);window.addEventListener("resize",resize);
  frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("resize",resize);};
 },[story,complete,panel,spacer,onReveal]);
 return <div ref={slot} className="scene-slot"><div ref={stage} className="scene-column cinematic-stage" data-complete={complete}>{children}</div></div>;
}
