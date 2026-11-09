"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { studioAudio } from "@/lib/studio-audio";
import { useDarkTheme, usePageVisible, useReducedMotionPreference } from "@/lib/preferences";

import { musicTracks as tracks, formatPlaybackTime } from "@/lib/music-tracks";

function subscribeSettings(callback: () => void) {
  window.addEventListener("studio-audio-settings", callback);
  window.addEventListener("storage", callback);
  return () => {window.removeEventListener("studio-audio-settings", callback);window.removeEventListener("storage", callback);};
}
const sessionSettings = new Map<string,string>();
function useSavedSetting(key: string, fallback: string) {
  const value = useSyncExternalStore(subscribeSettings, () => {
    try {return localStorage.getItem(key) ?? sessionSettings.get(key) ?? fallback;} catch {return sessionSettings.get(key) ?? fallback;}
  }, () => fallback);
  const save=useCallback((next: string) => {
    sessionSettings.set(key,next);
    try {localStorage.setItem(key,next);} catch { /* Session-only when storage is unavailable. */ }
    window.dispatchEvent(new Event("studio-audio-settings"));
  },[key]);
  return [value, save] as const;
}
function AudioVisualizer({ playing, open }: {playing:boolean;open:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const visible=usePageVisible(),reduced=useReducedMotionPreference(),dark=useDarkTheme();
  useEffect(()=>{
    const ctx=canvas.current?.getContext("2d");if(!ctx)return;
    const data=new Uint8Array(32);
    let frame=0;
    const color=getComputedStyle(document.documentElement).getPropertyValue("--accent");
    const draw=()=>{
      studioAudio.readSpectrum(data);ctx.clearRect(0,0,208,24);
      ctx.fillStyle=color;
      for(let i=0;i<26;i++) {const height=playing ? Math.max(1,data[i]/255*22) : 1;ctx.fillRect(i*8,24-height,3,height);}
      if(playing&&open&&visible&&!reduced)frame=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(frame);
  },[playing,open,visible,reduced,dark]);
  return <canvas className="audio-visualizer" ref={canvas} width="208" height="24" aria-hidden="true" />;
}
export function SoundControls({autoPlay=false}:{autoPlay?:boolean}) {
  const details=useRef<HTMLDetailsElement>(null);
  const [playing,setPlaying]=useState(false),[open,setOpen]=useState(false);
  const [muted,setMuted]=useState(false);
  const [savedVolume,saveVolume]=useSavedSetting("studio-music-volume","40");
  const [savedTrack,saveTrack]=useSavedSetting("studio-music-track",tracks[0].id);
  const volume=Math.max(0,Math.min(100,Number(savedVolume)||0));
  const index=Math.max(0,tracks.findIndex(item=>item.id===savedTrack));
  const [error,setError]=useState(""),[loading,setLoading]=useState(false);
  const [current,setCurrent]=useState(0),[duration,setDuration]=useState(0);
  const audio=useRef<HTMLAudioElement>(null);
  const playingRef=useRef(false),request=useRef({revision:0});
  const autoAttempted=useRef(false),autoPending=useRef(false);
  const track=tracks[index];
  const start=useCallback(async(automatic=false)=>{
    const element=audio.current;if(!element)return;
    const revision=++request.current.revision;
    setError("");setLoading(true);
    if(element.error)element.load();
    try {
      // The reveal may request playback; the browser still decides whether it is allowed.
      const playback = element.play();
      void studioAudio.connectRecording(element).catch(()=>{});
      await playback;
      if(revision!==request.current.revision)return;
      setLoading(false);
    } catch (cause) {
      if(revision!==request.current.revision)return;
      playingRef.current=false;setPlaying(false);setLoading(false);
      if(cause instanceof DOMException && cause.name === "NotAllowedError") {
        autoPending.current=automatic;
        if(!automatic)setError("Press Play music to enable playback in your browser.");
      }
      else if (!(cause instanceof DOMException && cause.name === "AbortError")) setError("This track could not play. Check your connection and try again.");
    }
  },[]);
  useEffect(()=>{
    if(!autoPlay||autoAttempted.current)return;
    autoAttempted.current=true;saveVolume("40");
    if(audio.current)audio.current.volume=.4;
    playingRef.current=true;void start(true);
  },[autoPlay,start,saveVolume]);
  useEffect(()=>{
    const retry=()=>{
      if(!autoPending.current)return;
      autoPending.current=false;playingRef.current=true;void start(true);
    };
    // Retry inside a permitted gesture, without waiting for a render or starting early.
    window.addEventListener("click",retry);window.addEventListener("keydown",retry);
    return()=>{window.removeEventListener("click",retry);window.removeEventListener("keydown",retry);};
  },[start]);
  useEffect(()=>{
    const lifecycle=request.current;
    const element=audio.current;
    const outside=(event:PointerEvent)=>{if(!details.current?.contains(event.target as Node))details.current?.removeAttribute("open");};
    document.addEventListener("pointerdown",outside);
    return()=>{lifecycle.revision++;element?.pause();document.removeEventListener("pointerdown",outside);studioAudio.dispose();};
  },[]);
  useEffect(()=>{if(audio.current){audio.current.volume=volume/100;audio.current.muted=muted;}},[volume,muted]);
  useEffect(()=>{
    const element=audio.current;if(!element)return;
    element.load();
    // Track changes preserve an explicit playback choice; idle music remains off.
    if(playingRef.current) void start();
    // start reads refs, and only a source change should reload the media element.
  },[track.src,start]);
  const select=(next:number)=>{
    autoPending.current=false;
    const selected=(next+tracks.length)%tracks.length;
    if(selected===index)return;
    request.current.revision++;audio.current?.pause();setPlaying(false);setCurrent(0);setDuration(0);setError("");setLoading(false);saveTrack(tracks[selected].id);
  };
  const toggle=()=>{
    autoPending.current=false;
    if(playingRef.current){request.current.revision++;playingRef.current=false;audio.current?.pause();setPlaying(false);setLoading(false);return;}
    playingRef.current=true;void start();
  };
  return <details ref={details} className="sound-settings" data-playing={playing} onToggle={event=>setOpen(event.currentTarget.open)} onKeyDown={event=>{if(event.key==="Escape"){details.current?.removeAttribute("open");details.current?.querySelector("summary")?.focus();}}}>
    <summary className="icon-button sound-toggle" aria-label={playing ? "Sound settings, music playing" : "Sound settings"} title="Sound settings"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="12" width="4" height="8" rx="2" /><rect x="17" y="12" width="4" height="8" rx="2" /></svg></summary>
    <audio ref={audio} src={track.src} preload="none" onPlaying={()=>{setPlaying(true);setLoading(false);}} onPause={()=>setPlaying(false)} onWaiting={()=>{if(playingRef.current)setLoading(true);}} onLoadedMetadata={event=>setDuration(event.currentTarget.duration)} onDurationChange={event=>setDuration(event.currentTarget.duration)} onTimeUpdate={event=>setCurrent(event.currentTarget.currentTime)} onEnded={()=>select(index+1)} onError={()=>{request.current.revision++;playingRef.current=false;setPlaying(false);setLoading(false);setError("Audio could not load. Try another track or play again.");}} />
    <div className="sound-panel">
      <p className="sound-heading">A little atmosphere</p>
      <div className="track-info" aria-live="polite" aria-atomic="true"><p className="track-title">{track.title}</p>{track.credit && <p className="track-credit">{track.credit}</p>}</div>
      <AudioVisualizer playing={playing} open={open} />
      <div className="music-transport">
        <button className="transport-button" aria-label="Previous track" onClick={()=>select(index-1)}><svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M4 4h2v12H4zm12 0v12L7 10Z" /></svg></button>
        <button className="music-button" onClick={toggle} aria-pressed={playing}>{loading ? "Cancel loading" : playing ? "Pause music" : "Play music"}<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">{playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 3 8 5-8 5z" />}</svg></button>
        <button className="transport-button" aria-label="Next track" onClick={()=>select(index+1)}><svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M14 4h2v12h-2zM4 4l9 6-9 6Z" /></svg></button>
      </div>
      <input className="playback-progress" aria-label="Playback position" aria-valuetext={`${formatPlaybackTime(current)} of ${formatPlaybackTime(duration)}`} type="range" min="0" max={Number.isFinite(duration)&&duration>0 ? duration : 1} step="0.1" value={current} disabled={!Number.isFinite(duration)||duration<=0} onChange={event=>{if(audio.current){audio.current.currentTime=Number(event.target.value);setCurrent(audio.current.currentTime);}}} />
      <div className="playback-times"><span>{formatPlaybackTime(current)}</span><span>{formatPlaybackTime(duration)}</span></div>
      <div className="playlist" aria-label="Music tracks">{tracks.map((item,i)=><button key={item.title} aria-pressed={index===i} onClick={()=>select(i)}><span>{item.title}</span><span>{index===i ? "Selected" : "MP3"}</span></button>)}</div>
      <label className="volume-label" htmlFor="studio-volume"><span>Volume</span><output>{muted ? "Muted" : `${volume}%`}</output></label>
      <div className="volume-controls"><button className="transport-button" aria-label={muted ? "Unmute music" : "Mute music"} aria-pressed={muted} onClick={()=>{setMuted(!muted);}}><svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7v6h3l4 3V4L6 7Z" />{muted ? <path d="m13 7 5 6m0-6-5 6" /> : <path d="M13 7a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" />}</svg></button><input id="studio-volume" type="range" min="0" max="100" value={volume} onChange={event=>{const next=Number(event.target.value);saveVolume(String(next));setMuted(false);}} /></div>
      {error&&<p className="sound-error" role="status">{error}</p>}
    </div>
  </details>;
}
