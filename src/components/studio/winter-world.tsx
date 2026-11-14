import type { RefObject } from "react";
import type { Breeze } from "./breeze";
import { VoxelParts, type Voxel } from "./voxel-parts";
import { BrickLaptop } from "./brick-laptop";

const tableBricks:Voxel[]=[
  // Individual plates and staggered support bricks leave visible seams.
  ...Array.from({length:24},(_,i):Voxel=>[-.81+(i%6)*.324,.555,-.405+Math.floor(i/6)*.27,.316,.12,.262,i%3===0?'#bf9974':'#d1ad83']),
  ...[-.72,.72].flatMap(x=>[-.32,.32].flatMap(z=>Array.from({length:4},(_,i):Voxel=>[x+(i%2?.015:-.015),.065+i*.12,z,.3,.115,.29,i%2?'#859888':'#688374']))),
  [0,.625,.06,1.24,.014,.65,'#657c7b'],
];
export function CodingDesk({clock,active}:{clock:RefObject<number>;active:boolean;breeze:RefObject<Breeze>}) {
 return <group name="brick-floor-table" position={[-.48,0,-.14]}>
  <VoxelParts parts={tableBricks}/>
  {[-.84,.84].flatMap(x=>[-.38,-.13,.12,.37].map(z=><mesh key={`${x}-${z}`} position={[x,.628,z]} castShadow>
   <cylinderGeometry args={[.045,.045,.026,12]}/><meshStandardMaterial color="#d5b58e" roughness={.8}/>
  </mesh>))}
  <group position={[0,-.78,0]}><BrickLaptop clock={clock} active={active}/></group>
 </group>;
}
