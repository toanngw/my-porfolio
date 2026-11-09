export const views = ["home", "about", "experience", "projects", "skills", "contact"] as const;
export type View = (typeof views)[number];
export const viewLabels: Record<View, string> = {
  home: "Home", about: "About", experience: "Experience", projects: "Projects", skills: "Skills", contact: "Contact",
};
export function viewFromHash(hash: string): View {
  const name = hash.replace(/^#\/?/, "").toLowerCase();
  if (name === "work") return "projects";
  return views.includes(name as View) ? name as View : "home";
}
export const experience = [
  { company: "FPT Software", role: "Software Engineer", date: "Oct 2025 — Jul 2026", location: "Ho Chi Minh City, Vietnam", description: "Contributed to an enterprise insurance application, building RESTful APIs and working with T-SQL queries and stored procedures.", details: "Designed API specifications and code generation with Swagger/OpenAPI. Participated in Jenkins-based deployments and worked with business analysts, QC engineers, and developers in an Agile/Scrum team.", technologies: ["Java", "Spring Boot", "SQL Server", "T-SQL", "OpenAPI", "Jenkins"] },
  { company: "John von Neumann University", role: "Computer Vision Intern", date: "Jun — Sep 2024", location: "Kecskemét, Hungary", description: "Developed a computer vision system to detect and count objects in machine-packaged boxes.", details: "Researched image processing and object detection algorithms, including the challenges of free-form objects. Built a Python backend with FastAPI to expose the system as an API.", technologies: ["Python", "OpenCV", "FastAPI", "Object detection"] },
];
export const projects = [
  { title: "Enterprise insurance application", type: "Professional work · FPT Software", description: "Contributed RESTful APIs, API specifications, and code generation with Swagger/OpenAPI. Developed and optimized stored procedures and T-SQL queries, and participated in API deployment through Jenkins-based CI/CD pipelines.", technologies: ["Java", "Spring Boot", "T-SQL", "SQL Server", "OpenAPI", "Jenkins"], diagram: "api" },
  { title: "Computer vision system", type: "Internship · John von Neumann University", description: "Developed object detection and image processing algorithms using Python and OpenCV, addressing free-form objects while optimizing detection accuracy and efficiency. Built a FastAPI service to make the computer vision system accessible through an API.", technologies: ["Python", "OpenCV", "FastAPI"], diagram: "vision" },
];
export const skills = [
  { title: "Languages & runtime", items: ["Java", "TypeScript", "Python", "Node.js"] },
  { title: "Backend & APIs", items: ["Spring Boot", "FastAPI", "RESTful APIs", "Swagger / OpenAPI"] },
  { title: "Data", items: ["SQL", "T-SQL", "Microsoft SQL Server", "NoSQL"] },
  { title: "Tools & practices", items: ["Git", "Jenkins", "Agile / Scrum", "OpenCV"] },
];
