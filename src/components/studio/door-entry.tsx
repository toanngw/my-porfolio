"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { studioAudio, type DoorMotionSound } from "@/lib/studio-audio";
import { updateDoor, type CharacterStory } from "./character-story";

export function DoorEntry({ story, sceneAnchor, onReady }: { story: RefObject<CharacterStory>; sceneAnchor: RefObject<HTMLDivElement|null>; onReady: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useRef({ progress: 0, target: 0, dragging: false, pointerId: null as number|null, startX: 0, startProgress: 0, committed: false, finishedAt: 0 });
  const readyCallback = useRef(onReady);
  const sound = useRef({ controller: null as DoorMotionSound|null, starting: false, revision: 0 });
  const [opening, setOpening] = useState(false), [leaving, setLeaving] = useState(false);
  useEffect(() => { readyCallback.current = onReady; }, [onReady]);

  const startSound = useCallback(() => {
    const lifecycle=sound.current;
    if(lifecycle.controller||lifecycle.starting)return;
    lifecycle.starting=true;
    const revision=++lifecycle.revision;
    void studioAudio.startDoorMotion().then(controller=>{
      if(lifecycle.revision!==revision){controller?.stop();return;}
      lifecycle.controller=controller;lifecycle.starting=false;
    }).catch(()=>{if(lifecycle.revision===revision)lifecycle.starting=false;});
  }, []);

  const commit = useCallback(() => {
    const m = motion.current;
    if (m.committed) return;
    m.committed = true; m.target = 1; m.dragging = false;
    setOpening(true);
    startSound();
  }, [startSound]);

  const release = useCallback(() => {
    const m = motion.current;
    if (m.committed) return;
    m.dragging = false; m.pointerId = null;
    if (m.progress >= .55 || m.target >= .65) commit();
    else m.target = 0;
  }, [commit]);

  useEffect(() => {
    const lifecycle=sound.current;
    let frame = 0, last = 0;
    const tick = (now: number) => {
      const m = motion.current, delta = last ? Math.min(now - last, 100) : 0; last = now;
      const previous=m.progress;
      m.progress += (m.target - m.progress) * (1 - Math.exp(-delta / (m.dragging ? 60 : 180)));
      if (Math.abs(m.progress - m.target) < .001) m.progress = m.target;
      root.current?.style.setProperty("--door-open", String(m.progress));
      updateDoor(story, m.progress);
      const speed=delta>0?Math.abs(m.progress-previous)/(delta/1000):0;
      lifecycle.controller?.update(m.progress,document.hidden||!document.hasFocus()?0:speed);
      if (m.committed && m.progress >= .995) {
        if (!m.finishedAt) { m.finishedAt = now; setLeaving(true); }
        if (now - m.finishedAt > 850) { lifecycle.controller?.stop();readyCallback.current(); return; }
      }
      frame = requestAnimationFrame(tick);
    };
    const cancel = () => {
      const m = motion.current;
      if (!m.committed) { m.dragging = false; m.target = 0; }
      lifecycle.controller?.update(m.progress,0);
    };
    const visibility = () => { if (document.hidden) cancel(); };
    frame = requestAnimationFrame(tick);
    window.addEventListener("blur", cancel); document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame);lifecycle.revision++;lifecycle.controller?.stop();lifecycle.controller=null;lifecycle.starting=false;window.removeEventListener("blur", cancel); document.removeEventListener("visibilitychange", visibility); };
  }, [story]);

  return <div ref={root} className="intro-welcome door-entry" data-opening={opening} data-leaving={leaving}>
    <div className="door-heading"><span>CAO-TOAN NGUYEN</span><span>SOFTWARE ENGINEER</span></div>
    <div className="door-composition">
      <div className="door-frame" ref={sceneAnchor}>
        <div className="door-room-light" aria-hidden="true" />
        <div className="door-leaf">
          <div className="door-grain" aria-hidden="true" />
          <div className="door-inset door-inset-top" aria-hidden="true" />
          <div className="door-inset door-inset-bottom" aria-hidden="true" />
          <div className="door-plaque" aria-hidden="true"><span>01</span><strong>THE STUDIO</strong><span>COME ON IN</span></div>
          <span className="door-hinge door-hinge-top" aria-hidden="true" /><span className="door-hinge door-hinge-bottom" aria-hidden="true" />
          <button className="door-handle" type="button" aria-label="Open the studio door" aria-describedby="door-instruction" aria-disabled={opening}
            onPointerDown={event => {
              if (event.button !== 0 || motion.current.committed) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              const m = motion.current; m.dragging = true; m.pointerId = event.pointerId; m.startX = event.clientX; m.startProgress = m.progress;
              startSound(); void studioAudio.click().catch(() => {});
            }}
            onPointerMove={event => {
              const m = motion.current;
              if (!m.dragging || m.committed || m.pointerId !== event.pointerId) return;
              const distance = Math.max(100, (sceneAnchor.current?.clientWidth ?? 300) * .55);
              m.target = Math.max(0, Math.min(1, m.startProgress + (m.startX - event.clientX) / distance));
              if (m.target >= .95) commit();
            }}
            onPointerUp={event=>{if(motion.current.pointerId===event.pointerId){void studioAudio.prepare(true);startSound();release();}}}
            onPointerCancel={event=>{if(!motion.current.committed&&motion.current.pointerId===event.pointerId){motion.current.dragging=false;motion.current.pointerId=null;motion.current.target=0;}}}
            onLostPointerCapture={event=>{if(motion.current.dragging&&motion.current.pointerId===event.pointerId)release();}} onBlur={release} onContextMenu={event=>event.preventDefault()}
            onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat){void studioAudio.prepare();commit();}}}}
            onClick={event=>{if(event.detail===0)commit();}}>
            <span className="door-handle-plate" aria-hidden="true" /><span className="door-handle-bar" aria-hidden="true" />
          </button>
          <div className="door-bottom-line" aria-hidden="true" />
        </div>
        <div className="door-threshold" aria-hidden="true" />
      </div>
      <div className="door-caption"><h1>{opening ? "Make yourself at home." : "Good work starts here."}</h1><p id="door-instruction">{opening ? "Welcome to my little corner of the internet." : "Drag the handle left. Come on in."}</p><span className="door-drag-hint" aria-hidden="true">← <span>PULL TO OPEN</span></span></div>
    </div>
    <span className="sr-only" role="status">{opening ? "Opening the studio. Your portfolio is loading." : "Drag the door handle left, or focus the handle and press Enter or Space to open the studio."}</span>
    <span className="door-footer">BUILT WITH CARE. OPEN TO POSSIBILITIES.</span>
  </div>;
}
