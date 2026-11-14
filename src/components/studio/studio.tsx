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
import { CoffeeEntry } from "./coffee-entry";
import { DoorEntry } from "./door-entry";
import { studioExperience } from "@/lib/entry-experience";
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
  const entry=studioExperience.entry;
  const story=useRef(createStory(entry)),focusAfterSkip=useRef(false),sceneUnavailable=useRef(false);
  const [introStarted,setIntroStarted]=useState(false);
  const [introComplete,setIntroComplete]=useState(false);
  const [sceneReady,setSceneReady]=useState(false);
  const [navigationMotion,setNavigationMotion]=useState(false);
  const shell=useRef<HTMLDivElement>(null),spacer=useRef<HTMLDivElement>(null),sceneAnchor=useRef<HTMLDivElement>(null),coffeeAnchor=useRef<HTMLDivElement>(null);
  const start=useCallback(async()=>{
    // Resume audio inside the visitor's gesture before advancing the welcome.
    await studioAudio.prepare();
    setIntroStarted(true);
    if(sceneUnavailable.current||reduced){skipStory(story.current);setIntroComplete(true);}
  },[reduced]);
  const finish=useCallback(()=>setIntroComplete(true),[]);
  const skip=useCallback(()=>{focusAfterSkip.current=!!document.activeElement?.matches(".skip-link");skipStory(story.current);setIntroComplete(true);},[]);
  const unavailable=useCallback(()=>{sceneUnavailable.current=true;if(introStarted)skip();},[introStarted,skip]);
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
  return <div ref={shell} className="studio-app" data-entry={entry} data-intro={introComplete?"complete":"playing"} data-view-transition={navigationMotion} onPointerDownCapture={()=>void studioAudio.prepare(true)} onKeyDownCapture={()=>void studioAudio.prepare(true)} onClickCapture={event => {
    void studioAudio.prepare(true);
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const anchor = (event.target as Element).closest("a");
    if (anchor && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname && views.some(item => anchor.hash === `#${item}`)) {event.preventDefault();goTo(viewFromHash(anchor.hash));}
  }}>
    {introComplete&&<ScrollNavigation view={view} panel={content} onNavigate={goTo} instant={reduced}/>}
    {!introComplete&&entry==='coffee'&&<div className="coffee-backdrop" aria-hidden="true"/>}
    {!introStarted&&!introComplete&&entry==='door'&&<DoorEntry onReady={()=>void start()} story={story} sceneAnchor={coffeeAnchor}/>}
    {!introStarted&&!introComplete&&entry==='coffee'&&<CoffeeEntry onReady={()=>void start()} story={story} sceneAnchor={coffeeAnchor} sceneReady={sceneReady}/>}
    {<a className="skip-link" href="#main" onClick={event => { event.preventDefault(); skip(); content.current?.focus(); }}>Skip to content</a>}
    <ViewportAtmosphere clock={clock} />
    <div className="app-shell" inert={!introStarted&&!introComplete}>
      <header className="app-header" inert={!introComplete}>
        <a href="#home" className="wordmark" aria-label="Cao-Toan Nguyen, Home"><Mark /><span>Cao-Toan Nguyen<span className="warm-dot">.</span></span></a>
        <div className="header-controls"><SoundControls autoPlay={introComplete}/><ThemeToggle /></div>
      </header>
      <main id="main" className="studio-main">
        <CinematicStage anchor={sceneAnchor} story={story} complete={introComplete} panel={content} spacer={spacer} onReveal={reveal}><WorkspaceStage anchor={sceneAnchor} coffeeAnchor={coffeeAnchor} clock={clock} story={story} running={entry==='door'||introStarted||introComplete} onRelease={finish} onUnavailable={unavailable} onSceneReady={()=>setSceneReady(true)}/></CinematicStage>
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
