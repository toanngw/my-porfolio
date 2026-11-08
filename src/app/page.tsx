import Image from "next/image";
import { Arrow, Download, Mark } from "@/components/icons";
import { Entrance, WorkItem } from "@/components/motion";
import { ThemeToggle } from "@/components/theme-toggle";

const skills = [
  { title: "Languages & runtime", items: "Java · TypeScript · Python · Node.js" },
  { title: "Backend & APIs", items: "Spring Boot · FastAPI · RESTful APIs · Swagger / OpenAPI" },
  { title: "Data", items: "SQL · T-SQL · Microsoft SQL Server · NoSQL" },
  { title: "Tools & practices", items: "Git · Jenkins · Agile / Scrum · OpenCV" },
];

export default function Home() {
  return (
    <div className="site-shell mx-auto w-full max-w-[944px] px-6 sm:px-10">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header flex items-center justify-between">
        <a href="#" className="wordmark" aria-label="Cao-Toan Nguyen, back to top"><Mark /><span>Toan<span className="brand-surname"> Nguyen</span><span className="accent">.</span></span></a>
        <div className="flex items-center gap-3 sm:gap-7">
          <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-5">
            <a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="intro-heading">
          <Entrance>
            <h1 id="intro-heading">Cao-Toan<br /><span>Nguyen<span className="name-period">.</span></span></h1>
            <div className="hero-description">
              <p className="role">Software Engineer</p>
              <p>I build backend systems and APIs.<br className="hidden sm:block" /> Based in Ho Chi Minh City, shaped by my time in Hungary.</p>
            </div>
            <div className="hero-actions flex flex-wrap items-center gap-x-7 gap-y-3">
              <a className="primary-link" href="#work">Explore my work <Arrow direction="down" /></a>
              <a className="text-link" href="/cv.pdf" download="Cao-Toan-Nguyen-CV.pdf">Download CV <Download /></a>
            </div>
          </Entrance>
          <div className="hero-footnote"><span>Java, APIs & everything in between.</span><span className="location"><span className="location-dot" />Ho Chi Minh City, VN</span></div>
        </section>
        <section id="about" className="about-section section" aria-labelledby="about-heading">
          <div className="about-copy">
            <h2 id="about-heading">A little about me</h2>
            <p>I’m Toan, a software engineer with a background in Java backend development and computer vision.</p>
            <p>My work has taken me from detecting objects with Python and OpenCV in Hungary to building APIs for an enterprise insurance application at FPT Software in Vietnam.</p>
            <p>Along the way, I studied Computer Science Engineering in Hungarian and mentored international Erasmus students. Working across languages and cultures is part of my story.</p>
            <a className="text-link" href="#experience">More about my experience <Arrow /></a>
          </div>
          <figure className="portrait-wrap"><div className="portrait"><Image src="/avatar.jpg" alt="Cao-Toan Nguyen standing beside a snow-covered evergreen tree" fill loading="eager" sizes="(max-width: 600px) 80vw, 280px" /></div><figcaption>A face to go with the code.</figcaption></figure>
        </section>
        <section id="work" className="section work-section" aria-labelledby="work-heading">
          <div className="section-heading"><h2 id="work-heading">Selected work</h2><p>From my professional experience</p></div>
          <div className="work-list">
            <WorkItem title="Enterprise insurance application" category="FPT Software · Backend engineering" tags={["Java", "Spring Boot", "SQL Server"]}>
              <p>Contributed to an enterprise insurance application, developing RESTful APIs and working with T-SQL queries and stored procedures.</p>
              <div className="work-details"><h4>My contribution</h4><p>API specification and code generation with Swagger/OpenAPI, query optimization, and API deployment through Jenkins-based CI/CD pipelines. Collaborated with business analysts, QC engineers, and developers in an Agile/Scrum team.</p></div>
            </WorkItem>
            <WorkItem title="Computer vision system" category="John von Neumann University · Internship" tags={["Python", "OpenCV", "FastAPI"]}>
              <p>Developed a system to detect and count objects in machine-packaged boxes, with a Python API to expose the detection system.</p>
              <div className="work-details"><h4>My contribution</h4><p>Researched and implemented image processing and object detection algorithms, addressing free-form objects and optimizing detection accuracy and efficiency. Built the backend service with FastAPI.</p></div>
            </WorkItem>
          </div>
        </section>
        <section id="experience" className="section" aria-labelledby="experience-heading">
          <h2 id="experience-heading">The path so far</h2>
          <ol className="timeline">
            <li><div className="timeline-date">Oct 2025 — Jul 2026</div><div className="timeline-body"><h3>Software Engineer</h3><p className="organization">FPT Software <span>· Ho Chi Minh City, Vietnam</span></p><p>Java backend development for an enterprise insurance application. RESTful APIs, database queries, and CI/CD in an Agile/Scrum team.</p></div></li>
            <li><div className="timeline-date">Jun — Sep 2024</div><div className="timeline-body"><h3>Computer Vision Intern</h3><p className="organization">John von Neumann University <span>· Kecskemét, Hungary</span></p><p>Object detection and counting with Python and OpenCV, connected to a FastAPI backend service.</p></div></li>
          </ol>
        </section>
        <section className="section" aria-labelledby="skills-heading"><h2 id="skills-heading">Tools I work with</h2><dl className="skills-grid">{skills.map((skill) => <div key={skill.title}><dt>{skill.title}</dt><dd>{skill.items}</dd></div>)}</dl></section>
        <section className="section education" aria-labelledby="education-heading">
          <h2 id="education-heading">Learning across borders</h2>
          <div className="education-grid">
            <div><p className="date">Sep 2021 — Jan 2025</p><h3>BSc in Computer Science Engineering</h3><p className="organization">John von Neumann University</p><p>Kecskemét, Hungary. Studied in Hungarian.<br />GPA: 4.34 / 5</p></div>
            <div className="mentoring"><h3>Erasmus student mentor</h3><p>Supported more than 10 students from Europe, Asia, and Africa with university procedures, study planning, and adapting to local life.</p><p className="languages"><span>Languages</span>English · Hungarian · Vietnamese</p></div>
          </div>
        </section>
        <section id="contact" className="contact-section section" aria-labelledby="contact-heading">
          <h2 id="contact-heading">Let’s start a conversation<span className="accent">.</span></h2>
          <p>Have a question about my work, or something in mind?<br className="hidden sm:block" /> I’d be glad to hear from you.</p>
          <a className="email-link" href="mailto:caotoan940@gmail.com"><span>caotoan940@gmail.com</span><Arrow /></a>
          <div className="contact-links flex flex-wrap gap-x-7 gap-y-2"><a href="https://github.com/toanngw" className="text-link">GitHub <Arrow /></a><a href="https://www.linkedin.com/in/caotoancs/" className="text-link">LinkedIn <Arrow /></a><a href="/cv.pdf" download="Cao-Toan-Nguyen-CV.pdf" className="text-link">Download CV <Download /></a></div>
        </section>
      </main>
      <footer className="site-footer"><span>© 2026 Cao-Toan Nguyen</span><a href="#" className="text-link">Back to top <Arrow direction="up" /></a></footer>
    </div>
  );
}
