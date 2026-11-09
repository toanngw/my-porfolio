import { RoundedBox } from "@react-three/drei";

type BoxProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  radius?: number;
  rotation?: [number, number, number];
  emissive?: string;
};

export function Box({ position, size, color, radius = 0.025, rotation, emissive }: BoxProps) {
  return <RoundedBox position={position} args={size} radius={Math.min(radius, Math.min(...size) / 3)} smoothness={2} bevelSegments={2} rotation={rotation} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.8} emissive={emissive} emissiveIntensity={emissive ? 0.45 : 0} />
  </RoundedBox>;
}
