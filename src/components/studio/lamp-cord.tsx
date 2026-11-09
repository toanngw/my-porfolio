import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Quaternion, Vector3 } from "three";
import type { Breeze } from "./breeze";

/** Decorative wind-driven cord; no switch or gesture hit target. */
export function LampCord({breeze}:{breeze:RefObject<Breeze>}) {
  const pivot=useRef<Group>(null),orientation=useRef(new Quaternion()),wind=useRef(new Vector3());
  useFrame(()=>{
    if(!pivot.current)return;
    pivot.current.parent?.getWorldQuaternion(orientation.current).invert();
    wind.current.set(breeze.current.x,0,breeze.current.z).applyQuaternion(orientation.current);
    pivot.current.rotation.set(-wind.current.z*.08,0,wind.current.x*.08);
  });
  return <group ref={pivot} position={[.16,.46,-.11]}>
    <mesh position={[0,-.1,0]} castShadow><cylinderGeometry args={[.006,.006,.2,6]}/><meshStandardMaterial color="#d5c7ae" roughness={.94}/></mesh>
    <mesh position={[0,-.21,0]} castShadow><capsuleGeometry args={[.022,.036,3,8]}/><meshStandardMaterial color="#bb8b4e" roughness={.45} metalness={.25}/></mesh>
  </group>;
}

/** A small bookmark charm supplies a second, restrained suspended detail. */
export function DeskCharm({ breeze }: { breeze: RefObject<Breeze> }) {
  const ref=useRef<Group>(null);
  const localWind=useRef(new Vector3()),orientation=useRef(new Quaternion());
  useFrame(()=>{
    if(!ref.current)return;
    ref.current.parent?.getWorldQuaternion(orientation.current).invert();
    localWind.current.set(breeze.current.x,0,breeze.current.z).applyQuaternion(orientation.current);
    ref.current.rotation.set(-localWind.current.z*0.1,0,localWind.current.x*0.1);
  });
  return <group position={[-0.85,1.35,0.47]} ref={ref}>
    <mesh position={[0,-0.12,0]}><cylinderGeometry args={[0.004,0.004,0.24,4]} /><meshStandardMaterial color="#bba77f" /></mesh>
    <mesh position={[0,-0.25,0]} castShadow><torusGeometry args={[0.03,0.008,4,12]} /><meshStandardMaterial color="#c9a765" metalness={0.35} roughness={0.5} /></mesh>
  </group>;
}
