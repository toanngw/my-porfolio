import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Bone, Group, MathUtils, Mesh, Object3D, Quaternion, SkinnedMesh, Vector3 } from "three";
import { Coffee } from "./workspace-coffee";
import type { Breeze } from "./breeze";

const SCALE=1.4;
const smooth=(a:number,b:number,t:number)=>MathUtils.smoothstep(t,a,b);
function createArm(scene:Object3D,side:string){
  const upper=scene.getObjectByName(side+'_upper_arm') as Bone;
  const fore=scene.getObjectByName(side+'_forearm') as Bone;
  const hand=scene.getObjectByName(side+'_hand') as Bone;
  const shoulder=upper.position.clone();
  return {upper,fore,hand,shoulder,upperRest:fore.position.clone().normalize(),foreRest:hand.position.clone().normalize(),
    l1:fore.position.length(),l2:hand.position.length(),sign:Math.sign(shoulder.x),
    direction:new Vector3(),bend:new Vector3(),elbow:new Vector3(),wrist:new Vector3(),target:new Vector3(),handDirection:new Vector3(),
    upperQ:new Quaternion(),foreQ:new Quaternion(),handQ:new Quaternion(),inverse:new Quaternion(),
    handRest:new Vector3(Math.sign(shoulder.x)*0.009,-0.075,0.025).normalize()};
}
function poseArm(arm:ReturnType<typeof createArm>,target:Vector3,grasp:number,sip:number){
  // Convert workspace-relative coordinates to the source model's +Z-forward units.
  arm.target.set(-target.x/SCALE,target.y/SCALE,-target.z/SCALE);
  arm.handDirection.set(0,MathUtils.lerp(-0.16,-1,grasp),MathUtils.lerp(1,0.12,grasp)).normalize();
  arm.handQ.setFromUnitVectors(arm.handRest,arm.handDirection);
  arm.wrist.copy(arm.target).addScaledVector(arm.handDirection,-0.077);
  arm.direction.copy(arm.wrist).sub(arm.shoulder);
  const distance=Math.min(arm.l1+arm.l2-0.002,Math.max(0.02,arm.direction.length()));arm.direction.normalize();
  arm.wrist.copy(arm.shoulder).addScaledVector(arm.direction,distance);
  const along=(arm.l1**2-arm.l2**2+distance**2)/(2*distance),height=Math.sqrt(Math.max(0,arm.l1**2-along**2));
  arm.bend.set(arm.sign*0.9,-0.35,-0.2);arm.bend.addScaledVector(arm.direction,-arm.bend.dot(arm.direction)).normalize();
  arm.elbow.copy(arm.shoulder).addScaledVector(arm.direction,along).addScaledVector(arm.bend,height);
  arm.direction.copy(arm.elbow).sub(arm.shoulder).normalize();arm.upperQ.setFromUnitVectors(arm.upperRest,arm.direction);
  arm.direction.copy(arm.wrist).sub(arm.elbow).normalize();arm.foreQ.setFromUnitVectors(arm.foreRest,arm.direction);
  arm.upper.quaternion.copy(arm.upperQ);
  arm.fore.quaternion.copy(arm.inverse.copy(arm.upperQ).invert()).multiply(arm.foreQ);
  arm.hand.quaternion.copy(arm.inverse.copy(arm.foreQ).invert()).multiply(arm.handQ);
  arm.hand.rotateZ(sip*0.08);
}

/** User-supplied meshes, with a derived GPU skinning rig. Original GLB is untouched. */
export function DeveloperCharacter({clock,active,breeze,modelUrl}:{clock:RefObject<number>;active:boolean;breeze:RefObject<Breeze>;modelUrl:string}){
  const {scene:source}=useGLTF(modelUrl);
  const rig=useMemo(()=>{
    const scene=SkeletonUtils.clone(source);
    scene.name='supplied-character-model';
    scene.traverse(object=>{if(object instanceof Mesh){object.castShadow=true;object.receiveShadow=true;object.frustumCulled=false;}});
    return {scene,left:createArm(scene,'right'),right:createArm(scene,'left'),head:scene.getObjectByName('workspace_head') as Bone,
      root:scene.getObjectByName('workspace_root') as Bone,eyes:['left_eye','right_eye'].map(n=>scene.getObjectByName(n) as Bone),
      leftTarget:new Vector3(),rightTarget:new Vector3(),grip:new Vector3(),cup:new Vector3()};
  },[source]);
  const animation=useRef<typeof rig|null>(null);
  useLayoutEffect(()=>{animation.current=rig;return()=>{animation.current=null;};},[rig]);
  useEffect(()=>()=>{
    const skeletons=new Set<SkinnedMesh['skeleton']>();
    rig.scene.traverse(object=>{if(object instanceof SkinnedMesh)skeletons.add(object.skeleton);});
    skeletons.forEach(skeleton=>skeleton.dispose());
  },[rig]);
  const mug=useRef<Group>(null),sample=useRef(-1);
  useFrame(({gl})=>{
    const rig=animation.current;if(!rig)return;
    const t=clock.current,c=t%24;
    const reach=smooth(11.8,13,c)*(1-smooth(20.2,21.4,c));
    const lift=smooth(13.4,15.3,c)*(1-smooth(18,20,c));
    const sip=smooth(15.5,16.3,c)*(1-smooth(17.4,18,c));
    const tap=(1-reach)*Math.sin(t*14)*0.006;
    rig.root.position.y=Math.sin(t*1.65)*0.002;
    rig.head.rotation.set(0.025+sip*0.035,Math.sin(t*0.45)*0.025-lift*0.04,Math.sin(t*0.6)*0.008);
    const blink=1-smooth(0,0.085,t%4.7)*(1-smooth(0.105,0.2,t%4.7))*0.94;
    rig.eyes.forEach(eye=>{eye.scale.y=blink;});
    rig.cup.set(MathUtils.lerp(0.50,0.015,lift),MathUtils.lerp(1.49,2.14,lift),MathUtils.lerp(-0.53,-0.25,lift));
    if(mug.current){
      mug.current.position.copy(rig.cup);mug.current.rotation.set(sip*0.35,0,sip*0.06);
      rig.grip.set(0.145,0,0).applyQuaternion(mug.current.quaternion).add(rig.cup);
    }
    rig.leftTarget.set(-0.16,1.47+tap,-0.61);
    rig.rightTarget.set(0.17,1.47-tap,-0.61).lerp(rig.grip,reach);
    poseArm(rig.left,rig.leftTarget,0,0);poseArm(rig.right,rig.rightTarget,reach,sip);
    if(Math.floor(t*4)!==sample.current){
      gl.domElement.dataset.characterPhase=lift>0.8?'drinking':reach>0.1?'reaching':'typing';
      gl.domElement.dataset.characterAsset='/model/character.glb';gl.domElement.dataset.mugHeight=rig.cup.y.toFixed(2);sample.current=Math.floor(t*4);
    }
  });
  return <group position={[-0.65,0,0.64]}>
    <group rotation={[0,Math.PI,0]} scale={SCALE}><primitive object={rig.scene} dispose={null}/></group>
    <group ref={mug} name="workspace-coffee-mug" position={[0.50,1.49,-0.53]}><Coffee clock={clock} active={active} breeze={breeze}/></group>
  </group>;
}
