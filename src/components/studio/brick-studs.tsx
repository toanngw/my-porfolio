import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";

/** Small connector studs share one draw call regardless of their count. */
export function BrickStuds({positions,radius,height,color}:{positions:[number,number,number][];radius:number;height:number;color:string}){
 const mesh=useRef<InstancedMesh>(null);
 useLayoutEffect(()=>{
  if(!mesh.current)return;
  const item=new Object3D();
  positions.forEach((position,i)=>{item.position.fromArray(position);item.updateMatrix();mesh.current!.setMatrixAt(i,item.matrix);});
  mesh.current.instanceMatrix.needsUpdate=true;mesh.current.computeBoundingSphere();
 },[positions]);
 return <instancedMesh ref={mesh} args={[undefined,undefined,positions.length]} castShadow receiveShadow><cylinderGeometry args={[radius,radius,height,10]}/><meshStandardMaterial color={color} roughness={.75}/></instancedMesh>;
}
