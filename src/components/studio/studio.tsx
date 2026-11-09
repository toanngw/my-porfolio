"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "motion/react";
import { Mark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMotionPaused, useReducedMotionPreference } from "@/lib/preferences";
import { viewFromHash, viewLabels, views } from "@/lib/portfolio";
import { WorkspaceStage } from "./workspace-stage";
import { ViewContent } from "./view-content";
import { PanelContinuation } from "./panel-continuation";
import { ViewportAtmosphere } from "./viewport-atmosphere";
import { SoundControls } from "./sound-controls";
import { playNavigationClick } from "@/lib/studio-audio";
function subscribeNavigation(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => { window.removeEventListener("hashchange", callback); window.removeEventListener("popstate", callback); };
}
const getView = () => viewFromHash(window.location.hash);
export function Studio({ modelUrl }: { modelUrl: string | null }) {
  const view = useSyncExternalStore(subscribeNavigation, getView, () => "home" as const);
  const [pointerNavigation, setPointerNavigation] = useState(false);
  const [paused, togglePaused] = useMotionPaused();
  const reduced = useReducedMotionPreference();
  const clock = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => {
      if (!navigation.current?.contains(event.target as Node) && !menuButton.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {setMenuOpen(false);menuButton.current?.focus();}
    };
    const resize = () => {if(window.innerWidth >= 768)setMenuOpen(false);};
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {document.removeEventListener("pointerdown", outside);document.removeEventListener("keydown", key);window.removeEventListener("resize", resize);};
  }, [menuOpen]);
  const content = useRef<HTMLDivElement>(null);
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    content.current?.scrollTo({ top: 0 });
    if (document.activeElement === document.body) content.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [view]);
  const navigate = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setMenuOpen(false);
    // A selected link is about to become hidden on mobile. Keep focus visible.
    if (event.currentTarget.closest("nav") && window.innerWidth < 768) menuButton.current?.focus();
    setPointerNavigation(event.detail > 0);
    const target = event.currentTarget.hash;
    if (window.location.hash !== target) {
      window.history.pushState(null, "", target);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, []);
  return <div className="studio-app" onClickCapture={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const anchor = (event.target as Element).closest("a");
    if (anchor && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname && views.some(item => anchor.hash === `#${item}`)) playNavigationClick();
  }} onKeyDownCapture={() => setPointerNavigation(false)} onPointerDownCapture={() => setPointerNavigation(true)}>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); content.current?.focus(); }}>Skip to content</a>
    <ViewportAtmosphere clock={clock} />
    <div className="app-shell">
      <header ref={header} className="app-header" data-menu-open={menuOpen} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setMenuOpen(false);}}>
        <a href="#home" className="wordmark" onClick={navigate} aria-label="Cao-Toan Nguyen, Home"><Mark /><span>Cao-Toan Nguyen<span className="warm-dot">.</span></span></a>
        <nav ref={navigation} id="main-navigation" aria-label="Main navigation" data-open={menuOpen} data-instant={!pointerNavigation || reduced || paused} onBlur={event=>{if(!header.current?.contains(event.relatedTarget as Node))setMenuOpen(false);}}>{views.map(item => <a key={item} href={`#${item}`} aria-current={view === item ? "page" : undefined} onClick={navigate}>{viewLabels[item]}</a>)}</nav>
        <div className="header-controls"><SoundControls /><button className="icon-button motion-toggle" onClick={togglePaused} aria-pressed={paused} aria-label={paused ? "Resume motion" : "Pause motion"} title={paused ? "Resume motion" : "Pause motion"}><svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paused ? <path d="m8 5 11 7-11 7V5Z" /> : <><path d="M8 5v14M16 5v14" /></>}</svg></button><ThemeToggle /></div>
        <button ref={menuButton} type="button" className="icon-button menu-toggle" data-instant={!pointerNavigation || reduced || paused} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => {
          const opening = !menuOpen; setMenuOpen(opening);
          if (opening) requestAnimationFrame(() => {if(menuButton.current?.getAttribute("aria-expanded")==="true")navigation.current?.querySelector<HTMLAnchorElement>("a")?.focus({preventScroll:true});});
        }}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path className="menu-line-first" d="M4 8h16" /><path className="menu-line-last" d="M4 16h16" /></svg></button>
      </header>
      <main id="main" className="studio-main">
        <div className="scene-column"><WorkspaceStage clock={clock} modelUrl={modelUrl} /><div className="studio-signature"><span>Snowlight Studio</span><span>A quiet corner of the internet.</span></div></div>
        <div className="content-frame"><div ref={content} className="content-panel" role="region" aria-label={`${viewLabels[view]} content`} tabIndex={0}>
          <AnimatePresence initial={false} mode="sync"><ViewContent key={view} view={view} animate={pointerNavigation && !reduced && !paused} /></AnimatePresence>
        </div><PanelContinuation panel={content} view={view} /></div>
      </main>
      <footer className="app-footer"><span>© 2026 Cao-Toan Nguyen</span><span>Made with care, and a little winter.</span></footer>
    </div>
    <span className="sr-only" role="status" aria-live="polite">{viewLabels[view]} view</span>
  </div>;
}
