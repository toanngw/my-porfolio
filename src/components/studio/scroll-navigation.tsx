"use client";
import { useEffect, useRef, type RefObject } from "react";
import { studioAudio, playScrollTick } from "@/lib/studio-audio";
import { views, viewLabels, viewFromHash, type View } from "@/lib/portfolio";

type Props = {view:View; panel:RefObject<HTMLDivElement|null>; onNavigate:(view:View,fromScroll?:boolean)=>void; instant:boolean};
const excluded='.scene-frame, .scene-toolbar, .header-controls, input, textarea, select, button, a, summary, [contenteditable="true"]';

/** Native touch momentum, lightly damped wheel input, and distance-driven feedback. */
export function ScrollNavigation({view,panel,onNavigate,instant}:Props) {
  const thumb=useRef<HTMLSpanElement>(null),input=useRef<HTMLInputElement>(null);
  const navigate=useRef(onNavigate),initialized=useRef(false);
  useEffect(()=>{navigate.current=onNavigate;},[onNavigate]);
  useEffect(()=>{
    const el=panel.current;if(!el)return;
    let frame=0,target=el.scrollTop,lastTime=0,lastTop=el.scrollTop,distance=0,lastTick=0;
    let active:View=viewFromHash(location.hash);
    let touch:{x:number;y:number;time:number;velocity:number}|null=null;
    const max=()=>Math.max(0,el.scrollHeight-el.clientHeight);
    const clamp=(value:number)=>Math.max(0,Math.min(max(),value));
    const ignored=(event:Event)=>event.target instanceof Element&&!!event.target.closest(excluded);
    const stop=()=>{cancelAnimationFrame(frame);frame=0;target=el.scrollTop;};
    const prepare=()=>studioAudio.prepare();
    const feedback=()=>{
      playScrollTick();
      try{navigator.vibrate?.(4);}catch{/* Haptics are optional on this device. */}
    };
    const sample=()=>{
      const top=el.scrollTop,limit=max(),progress=limit?top/limit:0;
      if(thumb.current)thumb.current.style.top=`${progress*100}%`;
      if(input.current)input.current.value=String(progress*100);
      distance+=Math.abs(top-lastTop);lastTop=top;
      const now=performance.now();
      // One tooth per 36px of real movement. Bound playback rate on fast flings.
      if(distance>=36&&now-lastTick>=42){distance%=36;lastTick=now;feedback();}
      const sections=Array.from(el.querySelectorAll<HTMLElement>('[data-scroll-view]'));
      const line=el.getBoundingClientRect().top+el.clientHeight*.35;
      let next=views[0] as View;
      for(const section of sections){if(section.getBoundingClientRect().top<=line)next=section.dataset.scrollView as View;}
      if(top>=limit-2&&limit>0)next=views[views.length-1];
      if(next!==active){active=next;navigate.current(next,true);}
    };
    const smoothTo=(value:number)=>{
      target=clamp(value);
      if(instant){el.scrollTop=target;return;}
      if(frame)return;
      lastTime=performance.now();
      const update=(now:number)=>{
        const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;
        target=clamp(target);
        const difference=target-el.scrollTop;
        if(Math.abs(difference)<1){el.scrollTop=target;frame=0;return;}
        el.scrollTop+=difference*(1-Math.exp(-22*dt));
        frame=requestAnimationFrame(update);
      };
      frame=requestAnimationFrame(update);
    };
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.metaKey||ignored(event)||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      event.preventDefault();
      // Preserve pixel deltas and the trackpad's own inertia; never multiply velocity.
      if(!frame)target=el.scrollTop;
      smoothTo(target+event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?el.clientHeight:1));
    };
    const scrollToView=(requested:View,immediate=false)=>{
      const section=el.querySelector<HTMLElement>(`[data-scroll-view="${requested}"]`);
      if(section){stop();const top=section.getBoundingClientRect().top-el.getBoundingClientRect().top+el.scrollTop; if(immediate){el.scrollTop=top;lastTop=el.scrollTop;distance=0;}else smoothTo(top);}
    };
    const route=(event:Event)=>scrollToView((event as CustomEvent<View>).detail);
    const history=()=>scrollToView(viewFromHash(location.hash));
    const key=(event:KeyboardEvent)=>{
      if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.altKey||ignored(event))return;
      const delta=event.key==='ArrowDown'?48:event.key==='ArrowUp'?-48:['PageDown',' '].includes(event.key)?el.clientHeight*.85*(event.shiftKey?-1:1):event.key==='PageUp'?-el.clientHeight*.85:0;
      if(event.key==='Home'||event.key==='End'){event.preventDefault();smoothTo(event.key==='Home'?0:max());}
      else if(delta){event.preventDefault();smoothTo((frame?target:el.scrollTop)+delta);}
    };
    const start=(event:TouchEvent)=>{
      touch=null;stop();if(ignored(event)||event.touches.length!==1)return;
      // The reading surface gets the browser's native touch scrolling and inertia.
      if(event.target instanceof Node&&el.contains(event.target))return;
      touch={x:event.touches[0].clientX,y:event.touches[0].clientY,time:performance.now(),velocity:0};
    };
    const move=(event:TouchEvent)=>{
      if(!touch||event.touches.length!==1)return;
      const point=event.touches[0],dy=touch.y-point.clientY,now=performance.now();
      if(Math.abs(dy)<Math.abs(touch.x-point.clientX))return;
      event.preventDefault();el.scrollTop+=dy;
      touch.velocity=dy/Math.max(8,now-touch.time);touch.y=point.clientY;touch.x=point.clientX;touch.time=now;
    };
    const end=()=>{
      if(touch&&!instant&&performance.now()-touch.time<80)smoothTo(el.scrollTop+Math.max(-300,Math.min(300,touch.velocity*160)));
      touch=null;
    };
    const cancel=()=>{touch=null;stop();};
    const drag=()=>{stop();el.scrollTop=max()*Number(input.current?.value??0)/100;};
    input.current?.addEventListener('input',drag);
    el.addEventListener('scroll',sample,{passive:true});
    window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);
    window.addEventListener('pointerdown',prepare,{passive:true});window.addEventListener('keydown',prepare);window.addEventListener('touchend',prepare,{passive:true});
    window.addEventListener('touchstart',start,{passive:true});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);window.addEventListener('touchcancel',cancel);window.addEventListener('blur',cancel);
    window.addEventListener('studio-scroll-to',route);window.addEventListener('hashchange',history);window.addEventListener('popstate',history);
    const resize=new ResizeObserver(sample);resize.observe(el);for(const child of el.children)resize.observe(child);
    if(!initialized.current){scrollToView(active,true);initialized.current=true;}
    sample();
    const slider=input.current;
    return()=>{stop();resize.disconnect();slider?.removeEventListener('input',drag);el.removeEventListener('scroll',sample);window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('pointerdown',prepare);window.removeEventListener('keydown',prepare);window.removeEventListener('touchend',prepare);window.removeEventListener('touchstart',start);window.removeEventListener('touchmove',move);window.removeEventListener('touchend',end);window.removeEventListener('touchcancel',cancel);window.removeEventListener('blur',cancel);window.removeEventListener('studio-scroll-to',route);window.removeEventListener('hashchange',history);window.removeEventListener('popstate',history);};
    // View changes report the scroll position; they must never restart scrolling.
  },[panel,instant]);
  return <div className="scroll-navigation">
    <div className="scroll-track" aria-hidden="true"><span ref={thumb} className="scroll-thumb"/></div>
    <input ref={input} type="range" min={0} max={100} step="any" defaultValue={0} aria-label="Scroll portfolio" aria-orientation="vertical" aria-valuetext={viewLabels[view]}/>
    <span className="sr-only">Scroll freely through the portfolio, or drag this control. Arrow keys scroll; Home and End move to the beginning and end.</span>
  </div>;
}
