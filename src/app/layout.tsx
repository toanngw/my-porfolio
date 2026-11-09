import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const body = localFont({ src: "./fonts/dm-sans.ttf", variable: "--font-body", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: "Cao-Toan Nguyen — Software Engineer",
  description: "Software engineer based in Ho Chi Minh City, Vietnam. Java backend development, RESTful APIs, and computer vision. Explore my experience and work.",
  openGraph: { title: "Cao-Toan Nguyen — Software Engineer", description: "Backend systems, APIs, and a journey from Hungary to Vietnam.", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning className={body.variable}><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
