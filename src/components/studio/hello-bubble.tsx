import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { VoxelParts, type Voxel } from "./voxel-parts";
const alphabet:Record<string,string[]>={H:['101','101','111','101','101'],E:['111','100','110','100','111'],L:['100','100','100','100','111'],O:['111','101','101','101','111'],W:['10001','10001','10101','10101','01010'],T:['111','010','010','010','010'],F:['111','100','110','100','100'],'!':['1','1','1','0','1']};
export function HelloBubble({kind='hello',opacity}:{kind?:'hello'|'frustrated';opacity:RefObject<number>}){
 const ref=useRef<Group>(null),materials=useRef<MeshStandardMaterial[]>([]);
 const {pixels,width}=useMemo(()=>{
  const pixels:Voxel[]=[];let cursor=0;
  for(const letter of kind==='hello'?'HELLO!':'WTF!!'){
   const glyph=alphabet[letter];glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')pixels.push([cursor+x*.05,-y*.05,-.035,.045,.045,.07,kind==='hello'?'#384c46':'#733c32']);}));cursor+=(glyph[0].length+1)*.05;
  }
  return {pixels,width:cursor};
 },[kind]);
 const bubble=useMemo<Voxel[]>(()=>[[0,0,0,1.45,.43,.075,kind==='hello'?'#fff0cc':'#ffddc0'],[0,0,-.04,1.5,.38,.075,kind==='hello'?'#c9965c':'#ba7056'],[-.4,-.255,.03,.12,.12,.08,'#fff0cc'],[-.43,-.32,.03,.06,.06,.08,'#fff0cc']],[kind]);
 useLayoutEffect(()=>{
  materials.current=[];ref.current?.traverse(object=>{if(object instanceof Mesh){const items=Array.isArray(object.material)?object.material:[object.material];for(const item of items)if(item instanceof MeshStandardMaterial){item.transparent=true;item.depthWrite=false;item.needsUpdate=true;materials.current.push(item);}}});
 },[]);
 useFrame(()=>{for(const material of materials.current)material.opacity=opacity.current;});
 return <group ref={ref}><Billboard follow><VoxelParts parts={bubble}/><group position={[-width/2+.025,.10,.095]}><VoxelParts parts={pixels}/></group></Billboard></group>;
}
