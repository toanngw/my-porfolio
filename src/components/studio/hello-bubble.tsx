import { Billboard } from "@react-three/drei";
import { VoxelParts, type Voxel } from "./voxel-parts";
const glyphs=[['101','101','111','101','101'],['111','100','110','100','111'],['100','100','100','100','111'],['100','100','100','100','111'],['111','101','101','101','111'],['1','1','1','0','1']];
const pixels:Voxel[]=[];
let cursor=0;
for(const glyph of glyphs){glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')pixels.push([cursor+x*.05,-y*.05,-.035,.045,.045,.07,'#384c46']);}));cursor+=(glyph[0].length+1)*.05;}
const bubble:Voxel[]=[[0,0,0,1.45,.43,.075,'#fff0cc'],[0,0,-.04,1.5,.38,.075,'#c9965c'],[-.4,-.255,.03,.12,.12,.08,'#fff0cc'],[-.43,-.32,.03,.06,.06,.08,'#fff0cc']];
export function HelloBubble(){return <Billboard follow><VoxelParts parts={bubble}/><group position={[-cursor/2+.025,.10,.095]}><VoxelParts parts={pixels}/></group></Billboard>;}
