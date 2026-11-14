import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MathUtils } from "three";
import { Box } from "./scene-primitives";
import { VoxelParts } from "./voxel-parts";
import type { CharacterStory } from "./character-story";

export const STATION_CUP = [1.55, 1.6, -1.65] as const;
export const DESK_CUP = [-.15, 1.49, .11] as const;

/** This station and the actor share the workstation's renderer and coordinates. */
export function CoffeeStation({ story }: { story: RefObject<CharacterStory> }) {
  const group = useRef<Group>(null), lever = useRef<Group>(null), stream = useRef<Group>(null);
  const light = useRef<Mesh>(null);
  useFrame((_, delta) => {
    const s = story.current;
    if (group.current) group.current.visible = !s.released && !s.skipped && (s.entry!=="door" || !s.phase.startsWith("door-"));
    if (lever.current) lever.current.rotation.z = MathUtils.damp(lever.current.rotation.z, s.coffee.brewing ? -.5 : 0, 12, Math.min(delta,.1));
    if (stream.current) stream.current.visible = s.coffee.brewing;
    if (light.current) light.current.scale.x = Math.max(.01, s.coffee.progress);
  });
  return <group ref={group} visible={false} name="ivl-coffee-station" position={[1.6, 0, -1.2]}>
    <Box position={[0, 1.26, 0]} size={[1.5, .11, 1.05]} color="#76553e" radius={.01}/>
    {[-.62,.62].map(x=><Box key={x} position={[x,.61,.22]} size={[.055,1.22,.055]} color="#343b37" radius={.006}/>)}
    <Box position={[0,1.98,.17]} size={[1.05,1.32,.54]} color="#252e2d" radius={.025}/>
    <Box position={[0,2.59,.1]} size={[1.12,.12,.7]} color="#414c47" radius={.015}/>
    <Box position={[0,2.38,-.135]} size={[.91,.28,.045]} color="#151f1d" radius={.012}/>
    <Box position={[-.22,2.4,-.163]} size={[.29,.045,.008]} color="#bdad8d" radius={.003}/>
    <mesh position={[.25,2.39,-.17]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.105,.105,.025,24]}/><meshStandardMaterial color="#b9c5b4" metalness={.65} roughness={.3}/></mesh>
    <mesh position={[.25,2.39,-.188]}><circleGeometry args={[.085,24]}/><meshStandardMaterial color="#19221d"/></mesh>
    <Box position={[.27,2.415,-.192]} size={[.012,.065,.008]} rotation={[0,0,-.5]} color="#deb572" radius={.003}/>
    <Box position={[0,1.9,-.13]} size={[.87,.61,.03]} color="#111b18" radius={.005}/>
    <Box position={[0,2.15,-.28]} size={[.48,.14,.37]} color="#a6b4a4" radius={.012}/>
    <Box position={[.35,2.14,-.35]} size={[.45,.075,.075]} color="#222a23" radius={.03}/>
    <Box position={[-.05,2.04,-.45]} size={[.14,.1,.11]} color="#b4c2ad" radius={.01}/>
    <Box position={[0,1.4,-.28]} size={[1.03,.065,.74]} color="#889a87" radius={.008}/>
    <VoxelParts parts={Array.from({length:13},(_,i)=>[-.45+i*.075,1.437,-.28,.025,.005,.64,"#354b3d"])}/>
    <mesh ref={light} position={[-.21,2.27,-.163]}><boxGeometry args={[.28,.015,.01]}/><meshStandardMaterial color="#edbc73" emissive="#de9437" emissiveIntensity={1.5}/></mesh>
    <group ref={stream} position={[-.05,1.86,-.45]} visible={false}>{[-.035,.035].map(x=><mesh key={x} position={[x,0,0]}><cylinderGeometry args={[.006,.007,.31,6]}/><meshStandardMaterial color="#b8874b" transparent opacity={.85}/></mesh>)}</group>
    <group ref={lever} position={[.6,2.2,.03]}>
      <Box position={[.08,.17,0]} size={[.025,.35,.025]} color="#b6c2ae" rotation={[0,0,-.3]} radius={.006}/>
      <Box position={[.12,.37,0]} size={[.1,.29,.1]} color="#8d5b36" rotation={[0,0,-.3]} radius={.035}/>
    </group>
  </group>;
}
