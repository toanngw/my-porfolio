import { useLayoutEffect, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";

export type Voxel = [x:number,y:number,z:number,w:number,h:number,d:number,color:string];
/** One box geometry and one material per articulated part; details use instance colors. */
export function VoxelParts({parts}:{parts:Voxel[]}) {
  const mesh=useRef<InstancedMesh>(null);
  useLayoutEffect(()=>{
    if(!mesh.current)return;
    const transform=new Object3D(),color=new Color();
    parts.forEach(([x,y,z,w,h,d,tint],i)=>{
      transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.updateMatrix();
      mesh.current!.setMatrixAt(i,transform.matrix);mesh.current!.setColorAt(i,color.set(tint));
    });
    mesh.current.instanceMatrix.needsUpdate=true;
    if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
    mesh.current.computeBoundingSphere();
  },[parts]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,parts.length]} castShadow receiveShadow><boxGeometry/><meshStandardMaterial roughness={0.88} flatShading/></instancedMesh>;
}
