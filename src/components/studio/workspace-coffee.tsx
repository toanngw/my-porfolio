import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshBasicMaterial, Vector3, Quaternion } from "three";
import { Box } from "./scene-primitives";
import type { Breeze } from "./breeze";

function Steam({ clock, active, breeze }: { clock: RefObject<number>; active: boolean; breeze: RefObject<Breeze> }) {
  const wisps = useRef<Group>(null);
  const localWind=useRef(new Vector3()),orientation=useRef(new Quaternion());
  useFrame(() => {
    if (!active || !wisps.current) return;
    if (wisps.current.parent) wisps.current.quaternion.copy(wisps.current.parent.quaternion).invert();
    wisps.current.getWorldQuaternion(orientation.current).invert();
    localWind.current.set(breeze.current.x,0,breeze.current.z).applyQuaternion(orientation.current);
    wisps.current.children.forEach((child, index) => {
      const puff = child as Mesh;
      const phase = (clock.current * 0.38 + index / 9) % 1;
      const wind = localWind.current.x * phase * 0.13;
      puff.position.set(Math.sin(phase * 8 + index * 0.6) * phase * 0.055 + wind, 0.01 + phase * 0.5, Math.cos(phase * 7 + index) * phase * 0.035 + localWind.current.z * phase * 0.13);
      puff.scale.set(0.018 + phase * 0.047, 0.04 + phase * 0.065, 0.018 + phase * 0.047);
      (puff.material as MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * 0.26;
    });
  });
  return <group ref={wisps} position={[0, 0.11, 0]}>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, 0.12 + i * 0.045, 0]} scale={0.025}>
    <sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#f6f4ef" transparent opacity={0.13} depthWrite={false} />
  </mesh>)}</group>;
}
export function Coffee({ clock, active, breeze }: { clock: RefObject<number>; active: boolean; breeze: RefObject<Breeze> }) {
  return <>
    <Box position={[0, 0, 0]} size={[0.19, 0.19, 0.18]} color="#cf7953" radius={0.035} />
    <Box position={[0, 0.025, -0.094]} size={[0.065, 0.035, 0.008]} color="#f2dfb4" radius={0.004} />
    <mesh position={[0, 0.097, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[0.073, 20]} /><meshStandardMaterial color="#392219" roughness={0.27} /></mesh>
    <mesh position={[0, 0.098, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.08, 0.011, 6, 20]} /><meshStandardMaterial color="#e4a377" roughness={0.45} /></mesh>
    <mesh position={[0.115, 0, 0]} castShadow><torusGeometry args={[0.055, 0.019, 6, 12]} /><meshStandardMaterial color="#cf7953" roughness={0.5} /></mesh>
    <Steam clock={clock} active={active} breeze={breeze} />
  </>;
}
