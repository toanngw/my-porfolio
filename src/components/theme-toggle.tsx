"use client";
import { useDarkTheme } from "@/lib/preferences";
export function ThemeToggle() {
  const dark = useDarkTheme();
  return <button className="icon-button theme-toggle" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* Theme works without storage. */ }
  }}><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />}</svg></button>;
}
