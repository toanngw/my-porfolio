import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";

import { refineBricks, type Brick } from "./brick-detail";
export type Voxel = Brick;
/** One box geometry and one material per articulated part; details use instance colors. */
export function VoxelParts({parts}:{parts:Voxel[]}) {
  const bricks=useMemo(()=>refineBricks(parts),[parts]);
  const mesh=useRef<InstancedMesh>(null);
  useLayoutEffect(()=>{
    if(!mesh.current)return;
    const transform=new Object3D(),color=new Color();
    bricks.forEach(([x,y,z,w,h,d,tint],i)=>{
      transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.updateMatrix();
      mesh.current!.setMatrixAt(i,transform.matrix);mesh.current!.setColorAt(i,color.set(tint));
    });
    mesh.current.instanceMatrix.needsUpdate=true;
    if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
    mesh.current.computeBoundingSphere();
  },[bricks]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,bricks.length]} castShadow receiveShadow><boxGeometry/><meshStandardMaterial roughness={0.88} flatShading/></instancedMesh>;
}
