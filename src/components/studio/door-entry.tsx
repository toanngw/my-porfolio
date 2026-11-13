"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { studioAudio, type DoorMotionSound } from "@/lib/studio-audio";
import { answerDoor, type CharacterStory } from "./character-story";
import { playKnock } from "@/lib/studio-audio";

type DoorStage = "knocking" | "answering" | "leaving";

export function DoorEntry({ story, sceneAnchor, onReady }: { story: RefObject<CharacterStory>; sceneAnchor: RefObject<HTMLDivElement|null>; onReady: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useRef({ progress: 0, speed: 0, opening: false, finishedAt: 0, startedAt: 0, answered: false, answeredAt: 0, knocks: 0, lastKnockSound: 0 });
  const readyCallback = useRef(onReady);
  const sound = useRef({ controller: null as DoorMotionSound|null, starting: false, revision: 0 });
  const [stage, setStage] = useState<DoorStage>("knocking");
  const [knocks, setKnocks] = useState(0);
  const [knockSide, setKnockSide] = useState(0);
  useEffect(() => { readyCallback.current = onReady; }, [onReady]);

  const startSound = useCallback(() => {
    const lifecycle = sound.current;
    if (lifecycle.controller || lifecycle.starting) return;
    lifecycle.starting = true;
    const revision = ++lifecycle.revision;
    void studioAudio.startDoorMotion().then(controller => {
      if (lifecycle.revision !== revision) { controller?.stop(); return; }
      lifecycle.controller = controller; lifecycle.starting = false;
    }).catch(() => { if (lifecycle.revision === revision) lifecycle.starting = false; });
  }, []);

  // A visitor's click (or Enter/Space on the leaf) answers the knock. The leaf itself
  // only swings when his hand reaches the handle, so he is the one opening the door.
  const answer = useCallback(() => {
    const m = motion.current;
    if (m.answered) return;
    m.answered = true;
    m.answeredAt = performance.now();
    answerDoor(story);
    // Resume the audio graph inside this gesture; every later cue depends on it.
    void studioAudio.prepare(true);
    void studioAudio.click().catch(() => {});
  }, [story]);

  useEffect(() => {
    const lifecycle = sound.current;
    let frame = 0, last = 0;
    const tick = (now: number) => {
      const m = motion.current, door = story.current.door;
      const delta = last ? Math.min(now - last, 100) : 0; last = now;
      if (door.knocks !== m.knocks) {
        m.knocks = door.knocks;
        setKnocks(door.knocks);
        setKnockSide(door.knocks % 2);
      }
      if (m.answered && !m.opening) {
        // Wait for the story's push; the watchdog covers a scene that never advances.
        const pushing = door.opening || story.current.phase === "door-open";
        if (pushing || now - m.answeredAt > 2600) {
          m.opening = true; m.startedAt = now;
          setStage("answering");
          startSound();
          playKnock();
        }
      }
      if (m.opening && !m.finishedAt) {
        const raw = Math.min(1, (now - m.startedAt) / 1150);
        const eased = raw < .5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const previous = m.progress;
        m.progress = eased;
        m.speed = delta > 0 ? Math.abs(eased - previous) / (delta / 1000) : 0;
        door.progress = eased;
        lifecycle.controller?.update(eased, document.hidden || !document.hasFocus() ? 0 : m.speed);
        if (raw >= 1) { m.finishedAt = now; setStage("leaving"); }
      }
      // After the doorway beat, ease the camera back to the page layout.
      if (story.current.phase === "door-exit" && !door.done) {
        door.handoff = Math.min(1, door.handoff + delta / 850);
        if (door.handoff >= 1) door.done = true;
      }
      root.current?.style.setProperty("--door-open", String(m.progress));
      root.current?.style.setProperty("--door-shake", String(Math.max(0, door.impact) * 3.2));
      root.current?.style.setProperty("--door-fade", String(Math.max(0, 1 - door.handoff * 1.35)));
      if (m.finishedAt && (now - m.finishedAt > 2600 || door.done)) { lifecycle.controller?.stop(); readyCallback.current(); return; }
      frame = requestAnimationFrame(tick);
    };
    const cancel = () => { if (!motion.current.opening) { lifecycle.controller?.update(motion.current.progress, 0); } };
    const visibility = () => { if (document.hidden) cancel(); };
    frame = requestAnimationFrame(tick);
    window.addEventListener("blur", cancel); document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); lifecycle.revision++; lifecycle.controller?.stop(); lifecycle.controller = null; lifecycle.starting = false; window.removeEventListener("blur", cancel); document.removeEventListener("visibilitychange", visibility); };
  }, [story, startSound]);

  const answered = stage !== "knocking";
  return <div ref={root} className="intro-welcome door-entry" data-stage={stage} data-leaving={stage === "leaving"}>
    <div className="door-heading"><span>CAO-TOAN NGUYEN</span><span>SOFTWARE ENGINEER</span></div>
    <div className="door-composition">
      <div className="door-frame" ref={sceneAnchor}>
        <div className="door-room-light" aria-hidden="true" />
        <div className="door-bloom" aria-hidden="true" />
        <div className="door-wash" aria-hidden="true" />
        <button className="door-leaf" type="button" aria-label="Open the studio door" aria-describedby="door-instruction" aria-disabled={answered}
          onClick={event => { if (!answered) { event.preventDefault(); answer(); } }}
          onKeyDown={event => { if (!answered && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); answer(); } }}>
          <span className="door-face" aria-hidden="true" />
          <span className="door-grain" aria-hidden="true" />
          <span className="door-inset door-inset-bottom" aria-hidden="true" />
          <span className="door-window" aria-hidden="true">
            <span className="door-glass" />
            <span className="door-sill" />
          </span>
          <span className="door-plaque" aria-hidden="true"><span>01</span><strong>THE STUDIO</strong><span>COME ON IN</span></span>
          <span className="door-hinge door-hinge-top" aria-hidden="true" /><span className="door-hinge door-hinge-bottom" aria-hidden="true" />
          <span className="door-handle" aria-hidden="true"><span className="door-handle-plate" /><span className="door-handle-bar" /></span>
          {knocks > 0 && !answered && <span key={knocks} className="door-knock-word" data-side={knockSide} aria-hidden="true">KNOCK</span>}
        </button>
        <div className="door-threshold" aria-hidden="true" />
      </div>
      <div className="door-caption">
        <h1>{stage === "leaving" ? "Make yourself at home." : stage === "answering" ? "Coming out." : knocks > 0 ? "Knock knock." : "Someone's at the door."}</h1>
        <p id="door-instruction">{stage === "knocking" ? "He's on his way. Click the door to answer." : stage === "answering" ? "The door is opening." : "Welcome to my little corner of the internet."}</p>
        <span className="door-drag-hint" aria-hidden="true">{stage === "knocking" ? <>↗ <span>CLICK TO ANSWER</span></> : <span>WELCOME IN</span>}</span>
      </div>
    </div>
    <span className="sr-only" role="status">{stage === "knocking" ? "Someone is knocking at the studio door. Click the door, or focus it and press Enter, to answer." : stage === "answering" ? "The door is opening." : "Welcome to the studio. Your portfolio is loading."}</span>
    <span className="door-footer">BUILT WITH CARE. OPEN TO POSSIBILITIES.</span>
  </div>;
}
