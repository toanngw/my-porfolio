"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { studioAudio } from "@/lib/studio-audio";
import { updateCoffee, type CharacterStory } from "./character-story";

export function CoffeeEntry({ onReady, story, sceneAnchor, sceneReady }: { onReady: () => void; story: RefObject<CharacterStory>; sceneAnchor: RefObject<HTMLDivElement|null>; sceneReady: boolean }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const held = useRef(false), complete = useRef(false), progress = useRef(0);
  const stopSound = useRef<(() => void) | null>(null);
  const soundRevision = useRef({ revision: 0 });
  const [brewing, setBrewing] = useState(false);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const readyCallback = useRef(onReady);
  useEffect(() => { readyCallback.current = onReady; }, [onReady]);

  const release = useCallback(() => {
    held.current = false;
    updateCoffee(story,{brewing:false});
    soundRevision.current.revision++;
    stopSound.current?.(); stopSound.current = null;
    setBrewing(false);
  }, [story]);

  const begin = useCallback(() => {
    if (complete.current || held.current) return;
    held.current = true;
    updateCoffee(story,{brewing:true});
    setBrewing(true);
    // Unlock directly in the press, before any animation or timer.
    const revision = ++soundRevision.current.revision;
    void studioAudio.brew().then(stop => {
      if (revision !== soundRevision.current.revision || !held.current) stop();
      else stopSound.current = stop;
    }).catch(() => {});
  }, [story]);

  useEffect(() => {
    const soundLifecycle = soundRevision.current;
    let frame = 0, last = 0, finishedAt = 0;
    const tick = (now: number) => {
      const delta = last ? now - last : 0; last = now;
      if (!complete.current) {
        progress.current = Math.max(0, Math.min(1, progress.current + delta / (held.current ? 2200 : -1100)));
        root.current?.style.setProperty("--brew", String(progress.current));
        updateCoffee(story,{progress:progress.current});
        if (progress.current === 1) {
          complete.current = true; finishedAt = now; release(); setReady(true);
          void studioAudio.click().catch(()=>{});
        }
      } else if (now - finishedAt > 1200) {
        readyCallback.current(); return;
      } else if (now - finishedAt > 650) setLeaving(true);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const pause = () => { if (document.hidden) release(); };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", pause);
    return () => {
      cancelAnimationFrame(frame); soundLifecycle.revision++;
      stopSound.current?.(); stopSound.current = null;
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [release, story]);

  return <div ref={root} className="intro-welcome coffee-entry" data-3d={sceneReady} data-brewing={brewing} data-ready={ready} data-leaving={leaving}>
    <div className="coffee-entry-scene">
      <div className="coffee-eyebrow"><span /> IVL / ICED VANILLA COFFEE</div>
      <div className="coffee-machine" ref={sceneAnchor}>
        <svg className="coffee-illustration" viewBox="0 0 560 460" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${id}-body`} x1="140" y1="80" x2="410" y2="350" gradientUnits="userSpaceOnUse"><stop stopColor="#424849"/><stop offset=".45" stopColor="#24292b"/><stop offset="1" stopColor="#171b1d"/></linearGradient>
            <linearGradient id={`${id}-steel`} x1="180" y1="0" x2="392" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#686e6b"/><stop offset=".23" stopColor="#d3d6cc"/><stop offset=".4" stopColor="#909a94"/><stop offset=".78" stopColor="#d6d8ce"/><stop offset="1" stopColor="#626d68"/></linearGradient>
            <linearGradient id={`${id}-glass`} x1="230" y1="310" x2="330" y2="380" gradientUnits="userSpaceOnUse"><stop stopColor="#e4d9bb" stopOpacity=".35"/><stop offset=".5" stopColor="#dacbb0" stopOpacity=".06"/><stop offset="1" stopColor="#d5c5a4" stopOpacity=".25"/></linearGradient>
            <clipPath id={`${id}-cup`}><path d="M235 317h88l-9 60q-35 12-70 0Z"/></clipPath>
          </defs>
          <ellipse cx="285" cy="420" rx="190" ry="20" fill="#000" opacity=".3"/>
          <path d="m142 91 35-20h218l30 20v282l-28 23H142Z" fill="#101516" stroke="#090d0e" strokeWidth="3"/>
          <path d="m395 71 30 20v282l-28 23V91Z" fill="#161c1e"/>
          <rect x="140" y="91" width="257" height="306" rx="12" fill={`url(#${id}-body)`} stroke="#56605c" strokeWidth="2"/>
          <path d="M154 95h228" stroke="#88908a" strokeOpacity=".45" strokeWidth="2"/>
          <rect x="163" y="109" width="212" height="100" rx="5" fill="#1c2223" stroke="#4b5350"/>
          <text x="180" y="131" fill="#b4b8a9" fontFamily="monospace" fontSize="9" letterSpacing="3">SNOWLIGHT</text>
          <text x="180" y="143" fill="#6b7771" fontFamily="monospace" fontSize="5.5" letterSpacing="2">IVL / NO. 01</text>
          <circle cx="327" cy="155" r="28" fill="#101617" stroke={`url(#${id}-steel)`} strokeWidth="4"/>
          <path d="M308 165a21 21 0 1 1 38 0" stroke="#66716a" strokeWidth="2" strokeDasharray="1 5"/>
          <path className="coffee-gauge" d="m327 155 11-12" stroke="#e6b778" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="327" cy="155" r="3" fill="#c4cbbd"/>
          <rect x="180" y="169" width="78" height="18" rx="3" fill="#111718" stroke="#404a43"/>
          <circle className="coffee-indicator" cx="192" cy="178" r="3" fill="#daa266"/>
          <text x="204" y="181" fill="#acb7a6" fontFamily="monospace" fontSize="7" letterSpacing="1">{ready ? "READY" : brewing ? "BREWING" : "STANDBY"}</text>
          <path d="M165 221h207v137H165Z" fill="#111718"/>
          <path d="M174 226h189v118H174Z" fill="#151b1c"/>
          <path d="M180 226h178" stroke="#d3aa73" strokeOpacity=".5"/>
          <path d="M235 213h88v19q-44 16-88 0Z" fill={`url(#${id}-steel)`}/>
          <path d="M256 238h46v14h-46Z" fill="#85918a" stroke="#29302c" strokeWidth="2"/>
          <path d="M271 252v13m18-13v13" stroke="#a6afa5" strokeWidth="5"/>
          <path d="M316 224h70" stroke="#0a1010" strokeWidth="14" strokeLinecap="round"/>
          <path d="M324 220h57" stroke="#4e5753" strokeWidth="3" strokeLinecap="round"/>
          <g className="coffee-stream"><path d="M271 265v69m18-69v69" stroke="#c68b45" strokeWidth="3"/><path d="M272 265v69m18-69v69" stroke="#f0c07e" strokeOpacity=".5"/></g>
          <path d="M327 329h10c26 0 19 37-15 34" stroke="#b4b9aa" strokeWidth="9"/>
          <path d="M327 329h10c26 0 19 37-15 34" stroke="#424d47" strokeWidth="4"/>
          <g clipPath={`url(#${id}-cup)`}>
            <path d="M235 317h88l-9 60q-35 12-70 0Z" fill={`url(#${id}-glass)`}/>
            <g className="coffee-liquid"><rect x="235" y="324" width="90" height="62" fill="#70401f"/><ellipse cx="280" cy="326" rx="45" ry="7" fill="#d8a467"/><ellipse cx="279" cy="325" rx="32" ry="4" fill="#ba7e40"/></g>
            <path d="m246 326 5 43" stroke="#f0e9cf" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round"/>
          </g>
          <path d="M235 317h88l-9 60q-35 12-70 0Z" stroke="#c8cdb9" strokeOpacity=".65" strokeWidth="2"/>
          <ellipse cx="279" cy="317" rx="44" ry="6" stroke="#c8cdb9" strokeOpacity=".7" strokeWidth="2"/>
          <g className="coffee-steam" stroke="#ead5ae" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"><path d="M255 304c-15-15 12-18 0-34"/><path d="M280 301c-15-18 12-20 0-40"/><path d="M304 304c-13-13 12-18 0-32"/></g>
          <path d="M155 385h228l11 12v10H144v-10Z" fill={`url(#${id}-steel)`} stroke="#1c2421" strokeWidth="2"/>
          <path d="M164 392h212m-207 5h202m-191 5h180" stroke="#39453e" strokeWidth="3" strokeDasharray="3 4"/>
          <rect x="156" y="407" width="26" height="8" rx="2" fill="#101616"/><rect x="357" y="407" width="26" height="8" rx="2" fill="#101616"/>
          <path d="M419 160h18v51h-18" stroke={`url(#${id}-steel)`} strokeWidth="8"/>
          <circle cx="429" cy="171" r="12" fill="#1a2220" stroke="#66746b" strokeWidth="3"/>
        </svg>
        <button className="coffee-lever" type="button" aria-label="Hold to make Iced Vanilla Coffee and enter portfolio" aria-describedby="coffee-instruction" aria-disabled={ready}
          onPointerDown={event => { if(event.button!==0)return; event.currentTarget.setPointerCapture(event.pointerId); begin(); }}
          onPointerUp={()=>{void studioAudio.prepare();release();}} onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
          onContextMenu={event=>event.preventDefault()}
          onKeyDown={event=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();if(!event.repeat)begin();}}}
          onKeyUp={event=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();release();}}}
          onClick={event=>{if(event.detail===0)begin();}}>
          <svg viewBox="0 0 94 150" fill="none" aria-hidden="true"><path d="m23 125 29-88" stroke="#121817" strokeWidth="12"/><path d="m23 125 29-88" stroke="#b2bcb1" strokeWidth="6"/><path d="m23 125 29-88" stroke="#e0e0cd" strokeWidth="2"/><rect x="44" y="8" width="24" height="67" rx="11" transform="rotate(18 44 8)" fill="#75452e" stroke="#211b17" strokeWidth="3"/><path d="m49 18-14 43m22-40L44 65" stroke="#b37a4b" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round"/><circle cx="23" cy="125" r="7" fill="#b2bcb1" stroke="#303d34" strokeWidth="3"/></svg>
        </button>
      </div>
      <div className="coffee-caption">
        <h1>{ready ? "Your IVL is ready." : "Let’s grab some IVL and code."}</h1>
        <p id="coffee-instruction">{ready ? "Coffee in hand. Time to code." : brewing ? "Keep holding. Your IVL is on its way." : "Hold the lever to make your IVL."}</p>
        <div className="coffee-progress" aria-hidden="true"><span /></div>
        <span className="sr-only" role="status">{ready ? "Your Iced Vanilla Coffee is ready. Opening the portfolio." : "Hold the lever for two seconds. You can also focus it and hold Space or Enter."}</span>
      </div>
    </div>
    <span className="coffee-corner">CAO-TOAN NGUYEN <span> / </span> THE STUDIO</span>
  </div>;
}
