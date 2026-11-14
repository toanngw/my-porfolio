import { useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Group, Mesh, Material, Vector3 } from "three";
import type { CharacterStory } from "./character-story";
import { VoxelParts, type Voxel } from "./voxel-parts";

const pixels:Voxel[]=['11111','00010','00100','01000','11111'].flatMap((row,y)=>[...row].flatMap((cell,x):Voxel[]=>cell==='1'?[[x*.045,-y*.045,0,.041,.041,.045,'#edd9a8']]:[]));
export function SleepLetters({story,head,active}:{story:RefObject<CharacterStory>;head:RefObject<Group|null>;active:boolean}){
 const root=useRef<Group>(null),letters=useRef<(Group|null)[]>([]),point=useRef(new Vector3());
 const materials=useRef<Material[][]>([]);
 useLayoutEffect(()=>{
  materials.current=letters.current.map(letter=>{
   const result:Material[]=[];
   letter?.traverse(object=>{if(object instanceof Mesh)for(const material of Array.isArray(object.material)?object.material:[object.material]){material.transparent=true;material.depthWrite=false;result.push(material);}});
   return result;
  });
 },[]);
 useFrame(()=>{
  if(!root.current||!head.current)return;
  const s=story.current;
  root.current.visible=s.phase==='sleep'&&active;
  if(!root.current.visible)return;
  head.current.getWorldPosition(point.current);root.current.parent?.worldToLocal(point.current);
  root.current.position.copy(point.current);root.current.position.y+=.35;
  letters.current.forEach((letter,i)=>{
   if(!letter)return;
   const progress=(s.time/3+i/3)%1;
   letter.position.set(progress*.45,progress*.95,0);
   letter.scale.setScalar(.5+progress*.65);
   for(const material of materials.current[i]??[])material.opacity=Math.sin(progress*Math.PI);
  });
 });
 return <group ref={root} name="sleep-zzz" visible={false}><Billboard>{[0,1,2].map(i=><group key={i} ref={node=>{letters.current[i]=node;}}><VoxelParts parts={pixels}/></group>)}</Billboard></group>;
}
