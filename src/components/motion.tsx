"use client";
import { Children, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Arrow } from "./icons";
const ease = [0.23, 1, 0.32, 1] as const;
export function Entrance({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return <div>{Children.map(children, (child, i) => <motion.div initial={{ opacity: 1, transform: "translateY(0px)" }} animate={{ opacity: reduce ? [0.96, 1] : [0.9, 1], transform: reduce ? ["translateY(0px)", "translateY(0px)"] : ["translateY(4px)", "translateY(0px)"] }} transition={{ duration: reduce ? 0.15 : 0.3, delay: reduce ? 0 : i * 0.05, ease }}>{child}</motion.div>)}</div>;
}
export function WorkItem({ title, category, tags, children }: { title: string; category: string; tags: string[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = title.toLowerCase().replaceAll(" ", "-");
  return <article className="work-item" data-open={open}>
    <h3><button className="work-trigger" aria-labelledby={`${id}-title`} aria-describedby={`${id}-category`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}><span><span id={`${id}-category`} className="work-category">{category}</span><span id={`${id}-title`} className="work-title">{title}</span><span className="tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</span></span><span className="work-action"><span>{open ? "Close" : "Read more"}</span><Arrow direction={open ? "up" : "down"} /></span></button></h3>
    <div id={id} className="work-content" hidden={!open}>{children}</div>
  </article>;
}
