"use client";
import { useEffect, useRef, useState } from "react";
import { studioAudio } from "@/lib/studio-audio";

export function SoundControls() {
  const details = useRef<HTMLDetailsElement>(null);
  const [playing, setPlaying] = useState(false);
  const [clicks, setClicks] = useState(true);
  const [volume, setVolume] = useState(35);
  const [error, setError] = useState("");
  const playingRef = useRef(false);
  const request = useRef({ revision: 0 });
  useEffect(() => {
    const lifecycle = request.current;
    const outside = (event: PointerEvent) => { if (!details.current?.contains(event.target as Node)) details.current?.removeAttribute("open"); };
    const visibility = () => {
      if (document.hidden) studioAudio.stopMusic();
      else if (playingRef.current) void studioAudio.startMusic().catch(() => {});
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      lifecycle.revision++;
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("visibilitychange", visibility);
      studioAudio.dispose();
    };
  }, []);

  const toggle = async () => {
    const currentRequest = ++request.current.revision;
    if (playing) { playingRef.current = false; setPlaying(false); studioAudio.stopMusic(); return; }
    try {
      const started = await studioAudio.startMusic();
      if (currentRequest !== request.current.revision) return;
      playingRef.current = started; setPlaying(started);
      setError(started ? "" : "Audio is unavailable in this browser.");
    } catch { setError("Audio could not start. Try playing again."); }
  };

  return <details ref={details} className="sound-settings" data-playing={playing} onKeyDown={event => {
    if (event.key === "Escape") { details.current?.removeAttribute("open"); details.current?.querySelector("summary")?.focus(); }
  }}>
    <summary className="icon-button sound-toggle" aria-label={playing ? "Sound settings, music playing" : "Sound settings"} title="Sound settings">
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="12" width="4" height="8" rx="2" /><rect x="17" y="12" width="4" height="8" rx="2" /></svg>
    </summary>
    <div className="sound-panel">
      <p className="sound-heading">A little atmosphere</p>
      <p className="sound-description">Original instrumental lo-fi.</p>
      <button className="music-button" onClick={toggle} aria-pressed={playing}>{playing ? "Pause music" : "Play music"}<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">{playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 3 8 5-8 5z" />}</svg></button>
      <label className="volume-label" htmlFor="studio-volume"><span>Volume</span><output>{volume}%</output></label>
      <input id="studio-volume" type="range" min="0" max="100" value={volume} onChange={event => { const next = Number(event.target.value); setVolume(next); studioAudio.setVolume(next / 100); }} />
      <label className="click-sounds"><input type="checkbox" checked={clicks} onChange={event => { setClicks(event.target.checked); studioAudio.clicksEnabled = event.target.checked; }} />Navigation clicks</label>
      {error && <p className="sound-error" role="status">{error}</p>}
    </div>
  </details>;
}
