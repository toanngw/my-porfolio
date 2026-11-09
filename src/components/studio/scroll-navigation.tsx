"use client";
import { useEffect, useRef, type RefObject } from "react";
import { studioAudio, playScrollTick, playBoundaryClack } from "@/lib/studio-audio";
import { consumeScroll, createDetent, detentProgress, feedDetent, DETENT } from "@/lib/scroll-detent";
import { views, viewLabels, type View } from "@/lib/portfolio";

type Props={view:View;panel:RefObject<HTMLDivElement|null>;onNavigate:(view:View,fromScroll?:boolean)=>void;instant:boolean};
const excluded='.scene-frame, .header-controls, .scroll-navigation, input, textarea, select, [contenteditable="true"], [data-scroll-native]';
/** Proportional reading with a progressive, velocity-aware notch at each section edge. */
export function ScrollNavigation({view,panel,onNavigate,instant}:Props){
 const current=useRef(view),navigate=useRef(onNavigate),sync=useRef<(view:View)=>void>(()=>{}),rail=useRef<HTMLDivElement>(null);
 useEffect(()=>{navigate.current=onNavigate;current.current=view;sync.current(view);},[view,onNavigate]);
 useEffect(()=>{
  const el=panel.current;if(!el)return;
  const detent=createDetent();
  let frame=0,target=el.scrollTop,lastTime=0,lastTop=el.scrollTop,tickDistance=0,lastTick=0,deflection=0,ownedTop=el.scrollTop;
  let pending:View|null=null,entryDirection=1,queued=0,coast=0,lastFeed=0,releaseDirection=0,inputDirection=0;
  let touch:{x:number;y:number;time:number;velocity:number;axis:'pending'|'vertical'|'horizontal'}|null=null;
  const oldTouchAction=el.style.touchAction;el.style.touchAction='pan-y pinch-zoom';
  const max=()=>{
   const section=el.querySelector<HTMLElement>('.scroll-section[data-active="true"]'),style=getComputedStyle(el);
   // Use layout dimensions: the compliant visual nudge must not change scroll limits.
   return Math.max(0,(section?.offsetHeight??el.scrollHeight)+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)-el.clientHeight);
  };
  const write=(top:number)=>{el.scrollTop=top;ownedTop=el.scrollTop;};
  const pulse=(heavy=false)=>{try{navigator.vibrate?.(heavy?11:3);}catch{/* Unsupported haptics leave scrolling intact. */}};
  const prepare=()=>studioAudio.prepare();
  const ignored=(event:Event)=>{
   if(!(event.target instanceof Element))return false;
   if(event.target.closest(excluded))return true;
   // Nested scrollers keep native input, including their own edge behavior.
   let node:Element|null=event.target;
   while(node&&node!==el&&node!==document.body){
    const style=getComputedStyle(node);
    if(node.scrollHeight>node.clientHeight+2&&/auto|scroll/.test(style.overflowY))return true;
    node=node.parentElement;
   }
   return false;
  };
  const clearNotch=()=>{releaseDirection=0;detent.pressure=0;detent.direction=0;detent.velocity=0;};
  const tick=()=>{playScrollTick();pulse();};
  const sample=()=>{
   if(pending)return;
   tickDistance+=Math.abs(el.scrollTop-lastTop);lastTop=el.scrollTop;
   const now=performance.now();
   if(tickDistance>=32&&now-lastTick>=42){tickDistance%=32;lastTick=now;tick();}
  };
  const ensureFrame=()=>{if(!frame){lastTime=performance.now();frame=requestAnimationFrame(update);}};
  const choose=(next:View,direction:number,heavy=true,landAtStart=false)=>{
   if(next===current.current||pending)return false;
   pending=next;entryDirection=landAtStart?1:direction;clearNotch();
   el.style.setProperty('--section-direction',String(direction));
   if(heavy){playBoundaryClack();pulse(true);}
   navigate.current(next,true);ensureFrame();return true;
  };
  const feed=(delta:number,now:number,source:'wheel'|'touch'|'coast'|'key')=>{
   if(!delta)return false;
   if(pending){queued=Math.max(-240,Math.min(240,queued+delta));return false;}
   const direction=Math.sign(delta),index=views.indexOf(current.current),next=views[index+direction];
   // A reversed gesture immediately unloads the notch and responds in the new direction.
   if(inputDirection&&inputDirection!==direction){target=el.scrollTop;clearNotch();}
   inputDirection=direction;
   if(source!=='coast'&&now-lastFeed>200&&Math.abs(target-el.scrollTop)<2)target=el.scrollTop;
   lastFeed=now;
   const result=consumeScroll(target,max(),delta,instant?0:DETENT.approach);
   target=result.position;
   if(source==='touch'||instant){write(target);sample();}
   let crossed=false;
   if(result.overflow&&next){
    if(!releaseDirection&&feedDetent(detent,result.overflow,now,instant?32:DETENT.threshold)){
     if(Math.abs(target-el.scrollTop)>1.5&&!instant&&source!=='touch'){
      releaseDirection=direction;detent.direction=direction;detent.pressure=detent.threshold;
     }else crossed=choose(next,direction);
    }
   }else if(!result.overflow)clearNotch();
   ensureFrame();return crossed;
  };
  const update=(now:number)=>{
   frame=0;const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;
   if(!touch&&Math.abs(coast)>.015){
    const crossed=feed(coast*1000*dt,now,'coast');
    coast*=Math.exp(-8.5*dt)*(crossed?.35:1);
   }else if(Math.abs(coast)<=.015)coast=0;
   if(!pending){
    target=Math.max(0,Math.min(max(),target));
    if(instant||Math.abs(target-el.scrollTop)<.8)write(target);
    else if(!touch)write(el.scrollTop+(target-el.scrollTop)*(1-Math.exp(-24*dt)));
   }
   if(!pending&&releaseDirection&&Math.abs(target-el.scrollTop)<1.5){
    const direction=releaseDirection,next=views[views.indexOf(current.current)+direction];
    if(next&&choose(next,direction))coast*=.35;
   }
   const pressure=detentProgress(detent,now);
   const progress=pressure*Math.exp(-Math.max(0,now-detent.lastInput-100)/140),desired=instant?0:-detent.direction*progress*DETENT.maxDeflection;
   deflection+=(desired-deflection)*(1-Math.exp(-27*dt));
   if(Math.abs(deflection)<.03)deflection=0;
   el.style.setProperty('--detent-shift',`${deflection.toFixed(2)}px`);
   rail.current?.style.setProperty('--detent-shift',`${(-deflection*.5).toFixed(2)}px`);
   el.dataset.detent=progress.toFixed(3);
   if(pending||Math.abs(target-el.scrollTop)>.8||Math.abs(coast)>.015||progress>.002||Math.abs(deflection)>.03)ensureFrame();
  };
  sync.current=(next)=>{
   const internal=pending===next;
   if(!internal){coast=0;queued=0;inputDirection=0;clearNotch();}
   const top=internal&&entryDirection<0?max():0;
   current.current=next;pending=null;target=top;write(top);lastTop=el.scrollTop;tickDistance=0;
   if(document.activeElement?.closest('.scroll-section[hidden]'))el.focus({preventScroll:true});
   const input=queued;queued=0;
   // Preserve new input through a React commit, without replaying discarded inertia.
   if(input){target=consumeScroll(target,max(),input,instant?0:DETENT.approach).position;if(touch||instant){write(target);lastTop=el.scrollTop;}}
   ensureFrame();
  };
  const wheel=(event:WheelEvent)=>{
   if(event.ctrlKey||event.metaKey||event.altKey||ignored(event)||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
   event.preventDefault();coast=0;
   feed(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?el.clientHeight:1),performance.now(),'wheel');
  };
  const key=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.altKey||ignored(event)||event.target instanceof Element&&event.target.closest('button,a,summary'))return;
   const direction=['ArrowDown','PageDown',' '].includes(event.key)?(event.shiftKey?-1:1):['ArrowUp','PageUp'].includes(event.key)?-1:0;
   if(event.key==='Home'||event.key==='End'){event.preventDefault();coast=0;choose(views[event.key==='Home'?0:views.length-1],event.key==='Home'?-1:1,true,true);return;}
   if(!direction)return;event.preventDefault();coast=0;
   // Keyboard users get ordinary reading and immediate edge navigation, without extra presses.
   const room=direction>0?max()-target:target;
   if(room<2)choose(views[Math.max(0,Math.min(views.length-1,views.indexOf(current.current)+direction))],direction);
   else feed(direction*(event.key.startsWith('Arrow')?64:el.clientHeight*.8),performance.now(),'key');
  };
  const start=(event:TouchEvent)=>{
   touch=null;if(ignored(event)||event.touches.length!==1)return;
   coast=0;target=el.scrollTop;clearNotch();prepare();
   touch={x:event.touches[0].clientX,y:event.touches[0].clientY,time:performance.now(),velocity:0,axis:'pending'};
  };
  const move=(event:TouchEvent)=>{
   if(!touch||event.touches.length!==1){touch=null;return;}
   const point=event.touches[0],dy=touch.y-point.clientY,dx=touch.x-point.clientX,now=performance.now();
   if(touch.axis==='pending'){
    if(Math.hypot(dx,dy)<3)return;
    touch.axis=Math.abs(dy)>=Math.abs(dx)?'vertical':'horizontal';
   }
   if(touch.axis==='horizontal')return;
   event.preventDefault();
   const velocity=dy/Math.max(8,now-touch.time);
   touch.velocity=touch.velocity*.4+Math.max(-2.2,Math.min(2.2,velocity))*.6;
   const crossed=feed(dy,now,'touch');if(crossed)touch.velocity*=.35;
   touch.x=point.clientX;touch.y=point.clientY;touch.time=now;
  };
  const end=()=>{
   if(touch&&touch.axis==='vertical'&&!instant&&performance.now()-touch.time<80)coast=touch.velocity;
   touch=null;ensureFrame();
  };
  const cancel=()=>{touch=null;coast=0;clearNotch();target=el.scrollTop;ensureFrame();};
  const externalScroll=()=>{sample();if(!pending&&Math.abs(el.scrollTop-ownedTop)>1.5){target=el.scrollTop;ownedTop=el.scrollTop;coast=0;clearNotch();ensureFrame();}else if(!frame&&!touch&&!pending)target=el.scrollTop;};
  el.addEventListener('scroll',externalScroll,{passive:true});window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);
  window.addEventListener('pointerdown',prepare,{passive:true});window.addEventListener('keydown',prepare);window.addEventListener('touchend',prepare,{passive:true});
  window.addEventListener('touchstart',start,{passive:true});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);window.addEventListener('touchcancel',cancel);window.addEventListener('blur',cancel);
  ensureFrame();
  return()=>{cancelAnimationFrame(frame);sync.current=()=>{};el.style.touchAction=oldTouchAction;el.style.removeProperty('--detent-shift');rail.current?.style.removeProperty('--detent-shift');delete el.dataset.detent;el.removeEventListener('scroll',externalScroll);window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('pointerdown',prepare);window.removeEventListener('keydown',prepare);window.removeEventListener('touchend',prepare);window.removeEventListener('touchstart',start);window.removeEventListener('touchmove',move);window.removeEventListener('touchend',end);window.removeEventListener('touchcancel',cancel);window.removeEventListener('blur',cancel);};
 },[panel,instant]);
 return <div ref={rail} className="scroll-navigation">
  <div className="scroll-track" aria-hidden="true"><span className="scroll-thumb" style={{top:`${views.indexOf(view)/(views.length-1)*100}%`}}/></div>
  <input type="range" min={0} max={views.length-1} step={1} value={views.indexOf(view)} aria-label="Navigate portfolio sections" aria-orientation="vertical" aria-valuetext={viewLabels[view]} onChange={event=>{playBoundaryClack();navigate.current(views[Number(event.target.value)],true);}}/>
  <span className="sr-only">Scroll freely within this section. Continue scrolling through a gentle notch to reach the next section. Arrow keys read; Home and End select the first and last sections.</span>
 </div>;
}
