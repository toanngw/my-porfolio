"use client";
import { useSyncExternalStore } from "react";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
export function useDarkTheme() {
  return useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme === "dark", () => false);
}
function subscribePause(callback: () => void) {
  window.addEventListener("studio-motion", callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener("studio-motion", callback); window.removeEventListener("storage", callback); };
}
type MotionChoice = "play" | "pause" | "system";
let sessionChoice: MotionChoice = "system";
function getMotionChoice(): MotionChoice {
  try {
    const saved = localStorage.getItem("studio-motion-choice");
    if (saved === "play" || saved === "pause") return saved;
    return localStorage.getItem("studio-motion-paused") === "true" ? "pause" : "system";
  } catch { return sessionChoice; }
}
export function useMotionPaused() {
  const choice = useSyncExternalStore(subscribePause, getMotionChoice, () => "system" as const);
  const reduced = useReducedMotionPreference();
  const paused = choice === "pause" || (choice === "system" && reduced);
  return [paused, () => {
    sessionChoice = paused ? "play" : "pause";
    try {
      localStorage.setItem("studio-motion-choice", sessionChoice);
      localStorage.removeItem("studio-motion-paused");
    } catch { /* Session preference still works. */ }
    window.dispatchEvent(new Event("studio-motion"));
  }] as const;
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
export function usePageVisible() {
  return useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
}
function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
}
