import type { RefObject } from "react";
import type { Breeze } from "./breeze";
import { VoxelParts, type Voxel } from "./voxel-parts";
import { BrickStuds } from "./brick-studs";
import { BrickLaptop } from "./brick-laptop";

const tableBricks:Voxel[]=[
  // Individual plates and staggered support bricks leave visible seams.
  ...Array.from({length:180},(_,i):Voxel=>[-.918+(i%18)*.108,.555,-.486+Math.floor(i/18)*.108,.105,.12,.105,i%3===0?'#67432f':'#80563b']),
  ...[-.72,.72].flatMap(x=>[-.32,.32].flatMap(z=>Array.from({length:8},(_,i):Voxel=>[x+(i%2?.005:-.005),.035+i*.06,z,.3,.057,.29,i%2?'#60432f':'#4b3428']))),
  [0,.625,.06,1.24,.014,.65,'#383731'],
];
export function CodingDesk({clock,active}:{clock:RefObject<number>;active:boolean;breeze:RefObject<Breeze>}) {
 return <group name="brick-floor-table" position={[-.48,0,-.14]}>
  <VoxelParts parts={tableBricks}/>
  <BrickStuds positions={Array.from({length:18},(_,x)=>Array.from({length:10},(_,z)=>[-.918+x*.108,.628,-.486+z*.108] as [number,number,number])).flat().filter(([x,,z])=>Math.abs(x)>.68||Math.abs(z)>.42)} radius={.021} height={.014} color="#956b49"/>
  <group position={[0,-.78,0]}><BrickLaptop clock={clock} active={active}/></group>
 </group>;
}
