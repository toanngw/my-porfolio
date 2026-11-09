import { useId } from "react";

export function Arrow({ direction = "diagonal" }: { direction?: "diagonal" | "down" | "up" }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: direction === "down" ? "rotate(135deg)" : direction === "up" ? "rotate(-45deg)" : undefined }}><path d="M6 18 18 6M6 6h12v12" /></svg>;
}
export function Download() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></svg>;
}
export function Mark() {
  const id=useId();
  return <svg className="brand-mark" aria-hidden="true" width="34" height="34" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id={`${id}-tile`} x1="10" y1="4" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#55535a"/><stop offset=".45" stopColor="#2e2e35"/><stop offset="1" stopColor="#18191e"/></linearGradient>
      <linearGradient id={`${id}-gold`} x1="18" y1="14" x2="46" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#fff0cd"/><stop offset=".5" stopColor="#e2bb82"/><stop offset="1" stopColor="#a97743"/></linearGradient>
    </defs>
    <rect x="6" y="9" width="52" height="51" rx="14" fill="#101116" opacity=".22"/>
    <rect x="6" y="7" width="52" height="51" rx="14" fill="#15161c"/>
    <rect x="6" y="3" width="52" height="51" rx="14" fill={`url(#${id}-tile)`} stroke="#78747a" strokeOpacity=".45"/>
    <path d="M18 45V16l27 27V16M18 30h27" transform="translate(1 3)" stroke="#704d2e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 45V16l27 27V16M18 30h27" stroke={`url(#${id}-gold)`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 9h27" stroke="white" strokeOpacity=".2" strokeLinecap="round"/>
  </svg>;
}
