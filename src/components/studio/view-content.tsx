"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, useIsPresent } from "motion/react";
import { useReducedMotionPreference } from "@/lib/preferences";
import { Arrow, Download } from "@/components/icons";
import { experience, projects, skills, type View } from "@/lib/portfolio";

function Tags({ items }: { items: string[] }) {
  return <ul className="technology-list" aria-label="Technologies">{items.map(item => <li key={item}>{item}</li>)}</ul>;
}
function Home() {
  return <>
    <div className="home-identity">
      <div><h1 tabIndex={-1} id="view-title-home">Cao-Toan<br />Nguyen<span className="warm-dot">.</span></h1><p className="home-role">Software Engineer</p></div>
      <div className="portrait-cutout"><Image src="/avatar-cutout.webp" alt="Cao-Toan Nguyen" fill sizes="(max-width: 480px) 144px, 190px" priority /></div>
    </div>
    <p className="home-intro">I build backend systems and APIs.<br />A little curiosity, a lot of care, and a journey from Hungary to Vietnam.</p>
    <p className="home-note">Java backend development, with experience in computer vision.</p>
    <div className="action-row"><a href="#projects" className="primary-link">Explore my work <Arrow /></a><a href="/cv.pdf" download="Cao-Toan-Nguyen-CV.pdf" className="text-link">Download CV <Download /></a></div>
    <div className="location-note"><span aria-hidden="true" />Ho Chi Minh City, Vietnam</div>
  </>;
}
function About() {
  return <><h1 tabIndex={-1} id="view-title-about" className="view-title">A little about me<span className="warm-dot">.</span></h1>
    <p className="lead">A software engineer with a background in Java backend development and computer vision.</p>
    <p>My work has taken me from detecting objects with Python and OpenCV in Hungary to building APIs for an enterprise insurance application at FPT Software in Vietnam.</p>
    <div className="education-block"><h2>Learning across borders</h2><h3>BSc in Computer Science Engineering</h3><p>John von Neumann University, Hungary<br /><span className="secondary">Sep 2021 — Jan 2025 · GPA 4.34 / 5</span></p><p>Studied in Hungarian. Mentored more than 10 Erasmus students from Europe, Asia, and Africa, supporting university procedures, study planning, and adapting to local life.</p></div>
    <p className="language-line"><span>Languages</span> English · Hungarian · Vietnamese</p>
  </>;
}
function Experience() {
  const [selected, setSelected] = useState(0);
  const item = experience[selected];
  return <><h1 tabIndex={-1} id="view-title-experience" className="view-title">The path so far<span className="warm-dot">.</span></h1>
    <div className="experience-selector" role="group" aria-label="Choose an experience">{experience.map((entry, index) => <button key={entry.company} className="experience-option" aria-pressed={selected === index} onClick={() => setSelected(index)}><span className="timeline-node" aria-hidden="true" /><span><strong>{entry.company}</strong><span>{entry.date}</span></span><Arrow /></button>)}</div>
    <div className="experience-detail" aria-live="polite" aria-atomic="true"><h2>{item.role}</h2><p className="detail-location">{item.location}</p><p>{item.description}</p><p>{item.details}</p><Tags items={item.technologies} /></div>
  </>;
}
function ProjectDiagram({ type }: { type: string }) {
  return <div className={`project-diagram ${type}`} aria-hidden="true">{type === "api" ? <><span className="diagram-node">API</span><span className="diagram-connector" /><span className="diagram-node diagram-center"><svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.3"><ellipse cx="16" cy="8" rx="10" ry="4" /><path d="M6 8v16c0 5 20 5 20 0V8M6 16c0 5 20 5 20 0" /></svg></span><span className="diagram-connector" /><span className="diagram-node">SQL</span></> : <><span className="detection-box one" /><span className="detection-box two" /><span className="detection-box three" /><span className="detection-corner tl" /><span className="detection-corner br" /><span className="vision-label">Object detection</span></>}</div>;
}
function Projects() {
  const [selected, setSelected] = useState(0);
  const [pointerSelection, setPointerSelection] = useState(false);
  const reduced = useReducedMotionPreference();
  const item = projects[selected];
  return <><h1 tabIndex={-1} id="view-title-projects" className="view-title">Selected work<span className="warm-dot">.</span></h1><p className="view-description">Two systems from my professional experience.</p>
    <div className="project-selector" role="group" aria-label="Choose a project">{projects.map((project, index) => <button key={project.title} aria-pressed={selected === index} onClick={event => { setSelected(index); setPointerSelection(event.detail > 0); }}>{index === 0 ? "Backend engineering" : "Computer vision"}</button>)}</div>
    <div aria-live="polite" aria-atomic="true"><motion.div key={item.title} className="project-detail" initial={pointerSelection && !reduced ? { opacity: 0.6, transform: "translateY(4px)" } : false} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: pointerSelection && !reduced ? 0.16 : 0, ease: [0.23, 1, 0.32, 1] }}><ProjectDiagram type={item.diagram} /><h2>{item.title}</h2><p className="project-context">{item.type}</p><p>{item.description}</p><Tags items={item.technologies} /></motion.div></div>
  </>;
}
function Skills() {
  return <><h1 tabIndex={-1} id="view-title-skills" className="view-title">My working toolkit<span className="warm-dot">.</span></h1><p className="view-description">The technologies and practices behind my work.</p><div className="skills-list">{skills.map(group => <section key={group.title}><h2>{group.title}</h2><Tags items={group.items} /></section>)}</div><p className="skills-note">Different tools. The same attention to the details.</p></>;
}
function Contact() {
  return <div className="contact-view"><h1 tabIndex={-1} id="view-title-contact" className="view-title">Good things start<br />with a hello<span className="warm-dot">.</span></h1><p>Have a question about my work, or something in mind? I’d be glad to hear from you.</p><a className="email-link" href="mailto:caotoan940@gmail.com"><span>caotoan940@gmail.com</span><Arrow /></a><div className="contact-links"><a className="contact-link" href="https://github.com/toanngw"><span>GitHub<span className="secondary">toanngw</span></span><Arrow /></a><a className="contact-link" href="https://www.linkedin.com/in/caotoancs/"><span>LinkedIn<span className="secondary">Cao-Toan Nguyen</span></span><Arrow /></a></div><a href="/cv.pdf" download="Cao-Toan-Nguyen-CV.pdf" className="text-link cv-link">Take a copy of my CV <Download /></a></div>;
}
const content: Record<View, () => React.ReactNode> = { home: Home, about: About, experience: Experience, projects: Projects, skills: Skills, contact: Contact };
export function ViewContent({ view, animate }: { view: View; animate: boolean }) {
  const present = useIsPresent();
  const Content = content[view];
  return <motion.section className={`view-content view-${view}`} aria-labelledby={`view-title-${view}`} aria-hidden={!present} inert={!present} initial={animate ? { opacity: 0, transform: "translateY(6px)" } : false} animate={{ opacity: 1, transform: "translateY(0px)" }} exit={{ opacity: 0, transform: animate ? "translateY(-4px)" : "translateY(0px)" }} transition={{ duration: animate ? 0.18 : 0, ease: [0.23, 1, 0.32, 1] }}><Content /></motion.section>;
}
