"use client";
import { useEffect, useState, type RefObject } from "react";
import { Arrow } from "@/components/icons";
import { viewLabels, type View } from "@/lib/portfolio";

export function PanelContinuation({ panel, view }: { panel: RefObject<HTMLDivElement | null>; view: View }) {
  const [more, setMore] = useState(false);
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    let frame = 0;
    function measure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = element!.querySelector<HTMLElement>('.scroll-section[data-active="true"] .view-content');
        const container = element!.parentElement;
        if (!active || !container) { setMore(false); return; }
        const paddingTop = parseFloat(getComputedStyle(element!).paddingTop);
        const needsScrolling = active.offsetHeight + paddingTop > container.clientHeight + 2;
        const remaining = active.getBoundingClientRect().bottom - element!.getBoundingClientRect().bottom;
        setMore(needsScrolling && remaining > 2);
      });
    }
    const resize = new ResizeObserver(measure);
    function observeContent() {
      resize.disconnect();
      resize.observe(element!);
      for (const child of element!.children) resize.observe(child);
      measure();
    }
    const mutation = new MutationObserver(observeContent);
    mutation.observe(element, { childList: true });
    element.addEventListener("scroll", measure, { passive: true });
    observeContent();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); element.removeEventListener("scroll", measure); };
  }, [panel, view]);
  return <button hidden={!more} className="panel-more" aria-label={`Scroll to more ${viewLabels[view]} content`} onClick={() => {
    const element = panel.current;
    if (!element) return;
    element.scrollBy({ top: Math.max(100, element.clientHeight * 0.75), behavior: "auto" });
    const active = element.querySelector<HTMLElement>('.scroll-section[data-active="true"] .view-content');
    if (active && active.getBoundingClientRect().bottom <= element.getBoundingClientRect().bottom + 2) element.focus({ preventScroll: true });
  }}>More below <Arrow direction="down" /></button>;
}
