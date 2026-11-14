import type { RefObject } from "react";
import { VoxelParts, type Voxel } from "./voxel-parts";
import { BrickStuds } from "./brick-studs";
import { CodeScreen } from "./code-screen";

const shell: Voxel[] = [
  [0,.025,0,.94,.05,.64,"#302722"],
  ...Array.from({length:8},(_,i):Voxel=>[-.411+i*.1175,.075,0,.114,.05,.64,i%3===0?"#4b382d":"#594234"]),
  [0,.105,-.02,.76,.012,.34,"#292522"],
  [0,.111,.22,.2,.013,.12,"#78604b"],
  [-.055,.12,.3,.085,.014,.035,"#856b52"],[.055,.12,.3,.085,.014,.035,"#856b52"],
  [.472,.065,.05,.006,.018,.2,"#211e1b"],
  ...Array.from({length:5},(_,i):Voxel=>[.472,.07,-.23+i*.032,.006,.02,.014,"#3b3027"]),
  [-.29,.12,-.27,.17,.09,.1,"#6d5540"],[.29,.12,-.27,.17,.09,.1,"#6d5540"],
];
const keys: Voxel[] = [
  ...Array.from({length:40},(_,i):Voxel=>[-.324+(i%10)*.072,.123,-.135+Math.floor(i/10)*.074,.061,.025,.058,i<10?"#8c745b":"#b49b7b"]),
  [0,.126,.135,.28,.025,.035,"#a68a67"],
];
const lid: Voxel[] = [
  [0,.32,0,.94,.64,.095,"#3b2d25"],
  [0,.33,.052,.8,.48,.016,"#211e1b"],
  ...Array.from({length:160},(_,i):Voxel=>[-.440625+(i%16)*.05875,.032+Math.floor(i/16)*.064,-.053,.05675,.062,.018,i%4===0?"#644b38":"#594234"]),
  [-.36,.055,.058,.04,.012,.012,"#729a72"],
];
const heartBricks: Voxel[] = [];
for(let y=0;y<13;y++)for(let x=0;x<15;x++){
 const px=(x-7)/6,py=(6-y)/5.5;
 if(Math.pow(px*px+py*py-1,3)-px*px*py*py*py<=0){
  heartBricks.push([(x-7)*.022,.33+(6-y)*.022,-.075,.0205,.0205,.025,y<5?"#d77465":"#b94f4b"]);
 }
}

/** A thick, hinged vintage notebook assembled from visible plastic bricks. */
export function BrickLaptop({clock,active}:{clock:RefObject<number>;active:boolean}) {
  return <group name="brick-vintage-laptop" position={[-.17,1.412,.015]}>
    <VoxelParts parts={shell}/><VoxelParts parts={keys}/>
    <group name="laptop-lid" position={[0,.13,-.27]} rotation={[-.18,0,0]}>
      <VoxelParts parts={lid}/>
      <group position={[0,.32,.045]} scale={[1.16,1.12,1]}><CodeScreen clock={clock} active={active}/></group>
      <group name="heart-logo"><VoxelParts parts={heartBricks}/></group>
      <group rotation={[Math.PI/2,0,0]}>
        <BrickStuds positions={[-.38,.38].flatMap(x=>Array.from({length:8},(_,i)=>[x,-.072,-(.09+i*.065)] as [number,number,number]))} radius={.012} height={.009} color="#7b5d43"/>
      </group>
    </group>
  </group>;
}
