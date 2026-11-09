import { useEffect, useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, MeshBasicMaterial, SRGBColorSpace } from "three";

const lines = [
  "// a little work, a little winter", "const studio = createWorkspace({", "  light: 'warm',", "  coffee: true,", "});", "", "async function build() {", "  const idea = await imagine();", "  return craft(idea);", "}", "", "await build();", "// keep making things.", "",
];

export function CodeScreen({ clock, active }: { clock: RefObject<number>; active: boolean }) {
  const lastDraw = useRef(-1);
  const material = useRef<MeshBasicMaterial>(null);
  const [screen] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return { canvas, texture };
  });
  useEffect(() => () => screen.texture.dispose(), [screen]);
  useFrame(() => {
    const sample = Math.floor(clock.current * 12);
    if (lastDraw.current === sample || (!active && lastDraw.current >= 0)) return;
    lastDraw.current = sample;
    const ctx = screen.canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#17262d";
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = "#293a42";
    ctx.fillRect(0, 0, 512, 32);
    ["#ce927f", "#dac18b", "#a2b6a0"].forEach((color, i) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(18 + i * 17, 16, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = "16px monospace";
    ctx.fillStyle = "#c4d2d7";
    ctx.fillText("snowlight.ts", 190, 22);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 38, 512, 282); ctx.clip();
    const offset = clock.current * 13;
    for (let row = -1; row < 13; row++) {
      const line = (Math.floor(offset / 26) + row + lines.length) % lines.length;
      const y = 64 + row * 26 - offset % 26;
      ctx.fillStyle = "#6a858f"; ctx.fillText(String(line + 1).padStart(2, "0"), 16, y);
      ctx.fillStyle = lines[line].startsWith("//") ? "#93aaa2" : lines[line].includes("const") || lines[line].includes("function") ? "#dcc29b" : "#c0dce3";
      ctx.fillText(lines[line], 56, y);
    }
    ctx.restore();
    if (material.current?.map) material.current.map.needsUpdate = true;
  });
  return <mesh position={[0, 0.015, 0.025]}><planeGeometry args={[0.62, 0.365]} /><meshBasicMaterial ref={material} map={screen.texture} toneMapped={false} /></mesh>;
}
