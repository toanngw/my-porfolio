import type { Texture } from "three";
import { RoundedBox } from "@react-three/drei";

type BoxProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  radius?: number;
  rotation?: [number, number, number];
  emissive?: string;
  fabric?: Texture;
};

export function Box({ position, size, color, radius = 0.025, rotation, emissive, fabric }: BoxProps) {
  return <RoundedBox position={position} args={size} radius={Math.min(radius, Math.min(...size) / 3)} smoothness={2} bevelSegments={2} rotation={rotation} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={fabric ? 0.95 : 0.8} bumpMap={fabric} bumpScale={fabric ? 0.006 : 0} emissive={emissive} emissiveIntensity={emissive ? 0.45 : 0} />
  </RoundedBox>;
}
