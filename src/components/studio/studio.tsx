"use client";
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { studioAudio } from "@/lib/studio-audio";
import { createStory, skipStory } from "./character-story";
import { CinematicStage } from "./cinematic-stage";
import { Mark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useReducedMotionPreference } from "@/lib/preferences";
import { viewFromHash, viewLabels, views, type View } from "@/lib/portfolio";
import { WorkspaceStage } from "./workspace-stage";
import { ViewContent } from "./view-content";
import { PanelContinuation } from "./panel-continuation";
import { ViewportAtmosphere } from "./viewport-atmosphere";
import { SoundControls } from "./sound-controls";
import { ScrollNavigation } from "./scroll-navigation";
function subscribeNavigation(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  window.addEventListener("popstate-scroll", callback);
  return () => { window.removeEventListener("hashchange", callback); window.removeEventListener("popstate", callback);window.removeEventListener("popstate-scroll", callback); };
}
const getView = () => viewFromHash(window.location.hash);
export function Studio() {
  const view = useSyncExternalStore(subscribeNavigation, getView, () => "home" as const);
  const reduced = useReducedMotionPreference();
  const story=useRef(createStory()),focusAfterSkip=useRef(false);
  const [introStarted,setIntroStarted]=useState(false);
  const [introComplete,setIntroComplete]=useState(false);
  const [navigationMotion,setNavigationMotion]=useState(false);
  const shell=useRef<HTMLDivElement>(null),spacer=useRef<HTMLDivElement>(null),sceneAnchor=useRef<HTMLDivElement>(null);
  const start=useCallback(async()=>{
    // Resume inside the visitor's gesture before advancing the welcome timeline.
    await studioAudio.prepare();
    setIntroStarted(true);
  },[]);
  const finish=useCallback(()=>setIntroComplete(true),[]);
  const skip=useCallback(()=>{focusAfterSkip.current=!!document.activeElement?.matches(".skip-link, .intro-skip");skipStory(story.current);setIntroComplete(true);},[]);
  const unavailable=useCallback(()=>{skip();},[skip]);
  const reveal=useCallback((progress:number)=>{shell.current?.style.setProperty("--story-reveal",String(progress));},[]);
  const clock = useRef(0);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    if(introComplete){content.current?.scrollTo({top:0});shell.current?.style.setProperty("--story-reveal","1");
      if(focusAfterSkip.current){content.current?.focus({preventScroll:true});focusAfterSkip.current=false;}
    }
  },[introComplete]);
  const goTo = useCallback((target: View, fromScroll = false) => {
    if(viewFromHash(window.location.hash)===target)return;
    setNavigationMotion(true);
    window.history[fromScroll?"replaceState":"pushState"](null,"",`#${target}`);
    window.dispatchEvent(new Event("popstate-scroll"));
  }, []);
  return <div ref={shell} className="studio-app" data-intro={introComplete?"complete":"playing"} data-view-transition={navigationMotion} onPointerDownCapture={()=>studioAudio.prepare()} onKeyDownCapture={()=>studioAudio.prepare()} onClickCapture={event => {
    studioAudio.prepare();
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const anchor = (event.target as Element).closest("a");
    if (anchor && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname && views.some(item => anchor.hash === `#${item}`)) {event.preventDefault();goTo(viewFromHash(anchor.hash));}
  }}>
    {introComplete&&<ScrollNavigation view={view} panel={content} onNavigate={goTo} instant={reduced}/>}
    {!introStarted&&!introComplete&&<div className="intro-welcome" role="group" aria-label="Welcome">
      <p>A little hello before you explore.</p>
      <button type="button" className="intro-enter" onClick={()=>void start()}>Enter portfolio</button>
      <span>Includes sound</span>
      <button type="button" className="intro-skip" onClick={skip}>Skip intro</button>
    </div>}
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); skip(); content.current?.focus(); }}>Skip to content</a>
    <ViewportAtmosphere clock={clock} />
    <div className="app-shell">
      <header className="app-header" inert={!introComplete}>
        <a href="#home" className="wordmark" aria-label="Cao-Toan Nguyen, Home"><Mark /><span>Cao-Toan Nguyen<span className="warm-dot">.</span></span></a>
        <div className="header-controls"><SoundControls autoPlay={introComplete}/><ThemeToggle /></div>
      </header>
      <main id="main" className="studio-main">
        <CinematicStage anchor={sceneAnchor} story={story} complete={introComplete} panel={content} spacer={spacer} onReveal={reveal}><WorkspaceStage anchor={sceneAnchor} clock={clock} story={story} running={introStarted||introComplete} onRelease={finish} onUnavailable={unavailable}/></CinematicStage>
        <div className="content-frame" inert={!introComplete}><div ref={content} className="content-panel" role="region" aria-label="Portfolio sections" tabIndex={0}>
          {!introComplete&&<div ref={spacer} className="intro-scroll-spacer" aria-hidden="true"/>}
          {views.map(item=><div key={item} className="scroll-section" hidden={introComplete&&view!==item} data-scroll-view={item} data-active={view===item}><ViewContent view={item}/></div>)}
        </div><PanelContinuation panel={content} view={view} /></div>
      </main>
      <footer className="app-footer" inert={!introComplete}><span>© 2026 Cao-Toan Nguyen</span><span>Made with care, and a little winter.</span></footer>
    </div>
    <span className="sr-only" role="status" aria-live="polite">{viewLabels[view]} view</span>
  </div>;
}
