"use client";
import { useCallback, useRef, useSyncExternalStore } from "react";
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
export function Studio({ modelUrl }: { modelUrl: string | null }) {
  const view = useSyncExternalStore(subscribeNavigation, getView, () => "home" as const);
  const reduced = useReducedMotionPreference();
  const clock = useRef(0);
  const content = useRef<HTMLDivElement>(null);
  const goTo = useCallback((target: View, fromScroll = false) => {
    if(fromScroll){
      window.history.replaceState(null, "", `#${target}`);
      window.dispatchEvent(new Event("popstate-scroll"));
    }else{
      window.history.pushState(null, "", `#${target}`);
      window.dispatchEvent(new CustomEvent("studio-scroll-to",{detail:target}));
    }
  }, []);
  return <div className="studio-app" onClickCapture={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const anchor = (event.target as Element).closest("a");
    if (anchor && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname && views.some(item => anchor.hash === `#${item}`)) {event.preventDefault();goTo(viewFromHash(anchor.hash));}
  }}>
    <ScrollNavigation view={view} panel={content} onNavigate={goTo} instant={reduced}/>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); content.current?.focus(); }}>Skip to content</a>
    <ViewportAtmosphere clock={clock} />
    <div className="app-shell">
      <header className="app-header">
        <a href="#home" className="wordmark" aria-label="Cao-Toan Nguyen, Home"><Mark /><span>Cao-Toan Nguyen<span className="warm-dot">.</span></span></a>
        <div className="header-controls"><SoundControls /><ThemeToggle /></div>
      </header>
      <main id="main" className="studio-main">
        <div className="scene-column"><WorkspaceStage clock={clock} modelUrl={modelUrl} /></div>
        <div className="content-frame"><div ref={content} className="content-panel" role="region" aria-label="Portfolio sections" tabIndex={0}>
          {views.map(item=><div key={item} className="scroll-section" data-scroll-view={item} data-active={view===item}><ViewContent view={item} animate={false}/></div>)}
        </div><PanelContinuation panel={content} view={view} /></div>
      </main>
      <footer className="app-footer"><span>© 2026 Cao-Toan Nguyen</span><span>Made with care, and a little winter.</span></footer>
    </div>
    <span className="sr-only" role="status" aria-live="polite">{viewLabels[view]} view</span>
  </div>;
}
