import type { RefObject } from "react";
import { VoxelParts, type Voxel } from "./voxel-parts";
import { CodeScreen } from "./code-screen";

const shell: Voxel[] = [
  [0,.025,0,.94,.05,.64,"#77766a"],
  ...Array.from({length:8},(_,i):Voxel=>[-.411+i*.1175,.075,0,.114,.05,.64,i%3===0?"#c1b99c":"#d3cbb0"]),
  [0,.105,-.02,.76,.012,.34,"#555c53"],
  [0,.111,.22,.2,.013,.12,"#8e9383"],
  [-.055,.12,.3,.085,.014,.035,"#b6b197"],[.055,.12,.3,.085,.014,.035,"#b6b197"],
  [.472,.065,.05,.006,.018,.2,"#343e38"],
  ...Array.from({length:5},(_,i):Voxel=>[.472,.07,-.23+i*.032,.006,.02,.014,"#50594e"]),
  [-.29,.12,-.27,.17,.09,.1,"#8c8f7d"],[.29,.12,-.27,.17,.09,.1,"#8c8f7d"],
];
const keys: Voxel[] = [
  ...Array.from({length:40},(_,i):Voxel=>[-.324+(i%10)*.072,.123,-.135+Math.floor(i/10)*.074,.061,.025,.058,i<10?"#9faaa0":"#e4dfc9"]),
  [0,.126,.135,.28,.025,.035,"#d0c8ac"],
];
const lid: Voxel[] = [
  [0,.32,0,.94,.64,.095,"#b4ac91"],
  [0,.33,.052,.8,.48,.016,"#343e38"],
  ...Array.from({length:40},(_,i):Voxel=>[-.411+(i%8)*.1175,.064+Math.floor(i/8)*.128,-.053,.113,.123,.018,i%4===0?"#c4bca1":"#d3cbb0"]),
  [-.36,.055,.058,.04,.012,.012,"#729a72"],
];
const heart = ["0110110","1111111","1111111","0111110","0011100","0001000"];
const heartBricks: Voxel[] = heart.flatMap((row,y)=>[...row].flatMap((cell,x):Voxel[]=>cell==='1'?[[ (x-3)*.046,.44-y*.046,-.075,.043,.043,.025,y<2?"#d77465":"#b94f4b"]]:[]));

/** A thick, hinged vintage notebook assembled from visible plastic bricks. */
export function BrickLaptop({clock,active}:{clock:RefObject<number>;active:boolean}) {
  return <group name="brick-vintage-laptop" position={[-.17,1.412,.015]}>
    <VoxelParts parts={shell}/><VoxelParts parts={keys}/>
    <group name="laptop-lid" position={[0,.13,-.27]} rotation={[-.18,0,0]}>
      <VoxelParts parts={lid}/>
      <group position={[0,.32,.045]} scale={[1.16,1.12,1]}><CodeScreen clock={clock} active={active}/></group>
      <group name="heart-logo"><VoxelParts parts={heartBricks}/></group>
      {[-.35,.35].flatMap(x=>[.12,.25,.38,.51].map(y=><mesh key={`${x}-${y}`} position={[x,y,-.07]} rotation={[Math.PI/2,0,0]} castShadow>
        <cylinderGeometry args={[.027,.027,.017,12]}/><meshStandardMaterial color="#d7cfb4" roughness={.75}/>
      </mesh>))}
    </group>
  </group>;
}
