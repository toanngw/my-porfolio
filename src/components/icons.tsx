export function Arrow({ direction = "diagonal" }: { direction?: "diagonal" | "down" | "up" }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: direction === "down" ? "rotate(135deg)" : direction === "up" ? "rotate(-45deg)" : undefined }}><path d="M6 18 18 6M6 6h12v12" /></svg>;
}
export function Download() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></svg>;
}
export function Mark() {
  return <svg aria-hidden="true" width="25" height="25" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 22V6l18 16V6M5 14h18" /></svg>;
}
