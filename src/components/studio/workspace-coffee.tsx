import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import type { Breeze } from "./breeze";
import type { CharacterStory } from "./character-story";

/** One persistent glass of IVL, from the machine to the actor's hand to the desk. */
export function Coffee({ story }: { clock: RefObject<number>; active: boolean; breeze: RefObject<Breeze>; story: RefObject<CharacterStory> }) {
  const liquid = useRef<Mesh>(null), ice = useRef<Group>(null);
  useFrame(() => {
    const p = story.current.coffee.progress;
    if (liquid.current) { liquid.current.scale.y = Math.max(.001, p); liquid.current.position.y = -.115 + p * .095; }
    if (ice.current) ice.current.visible = p > .6;
  });
  return <group name="ivl-glass">
    <mesh castShadow><cylinderGeometry args={[.12,.09,.26,12,1,true]}/><meshStandardMaterial color="#d9e6d4" transparent opacity={.24} roughness={.17} metalness={.1} depthWrite={false} side={2}/></mesh>
    <mesh ref={liquid}><cylinderGeometry args={[.109,.085,.19,12]}/><meshStandardMaterial color="#b5814d" roughness={.42}/></mesh>
    <mesh position={[0,.13,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.12,.008,6,16]}/><meshStandardMaterial color="#e1e8d8" transparent opacity={.7} roughness={.2}/></mesh>
    <mesh position={[0,-.13,0]}><cylinderGeometry args={[.092,.092,.012,12]}/><meshStandardMaterial color="#c7d3bf" transparent opacity={.65}/></mesh>
    <group ref={ice}>{[[-.04,.077,-.025],[.035,.083,.025],[.025,.095,-.035]].map((p,i)=><mesh key={i} position={p as [number,number,number]} rotation={[.2,i*.7,.3]}><boxGeometry args={[.068,.05,.065]}/><meshStandardMaterial color="#e9e8cd" transparent opacity={.8} roughness={.18}/></mesh>)}</group>
    <mesh position={[-.06,0,-.092]} rotation={[.08,0,.08]}><boxGeometry args={[.014,.19,.004]}/><meshBasicMaterial color="#f1f2df" transparent opacity={.45}/></mesh>
  </group>;
}
