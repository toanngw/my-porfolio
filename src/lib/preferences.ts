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
let sessionPaused = false;
function getPaused() {
  try { return localStorage.getItem("studio-motion-paused") === "true"; } catch { return sessionPaused; }
}
export function useMotionPaused() {
  const paused = useSyncExternalStore(subscribePause, getPaused, () => false);
  return [paused, () => {
    sessionPaused = !getPaused();
    try { localStorage.setItem("studio-motion-paused", String(sessionPaused)); } catch { /* Session preference still works. */ }
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
