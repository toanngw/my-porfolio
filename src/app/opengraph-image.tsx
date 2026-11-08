import { ImageResponse } from "next/og";
export const alt = "Cao-Toan Nguyen — Software Engineer, Ho Chi Minh City, Vietnam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#f6f5ef", padding: 85, display: "flex", flexDirection: "column", justifyContent: "center", color: "#2b302b" }}><div style={{ fontSize: 86, letterSpacing: -3 }}>Cao-Toan Nguyen.</div><div style={{ fontSize: 30, color: "#53694c", marginTop: 30 }}>Software Engineer</div><div style={{ fontSize: 23, marginTop: 65 }}>Backend systems & APIs · Ho Chi Minh City, Vietnam</div></div>, size);
}
