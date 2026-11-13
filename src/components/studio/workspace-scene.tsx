"use client";
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, TrackballControls } from "@react-three/drei";
import { Box3, Group, InstancedMesh, Mesh, Quaternion, Vector3, MathUtils, type OrthographicCamera } from "three";
import type { TrackballControls as TrackballControlsImpl } from "three-stdlib";
import type { CharacterStory } from "./character-story";
import { DeveloperCharacter } from "./developer-character";
import { CodingDesk } from "./winter-world";
import { CoffeeStation } from "./coffee-station";
import { Atmosphere, InfiniteGround } from "./atmosphere";
import { sampleBreeze, type Breeze } from "./breeze";
import { supportsWebGL } from "@/lib/webgl-support";

export type SceneCommands = { key: (key: string) => void };
type SceneProps = { anchor:RefObject<HTMLDivElement|null>;coffeeAnchor:RefObject<HTMLDivElement|null>;running:boolean;interaction:RefObject<HTMLDivElement|null>; story:RefObject<CharacterStory>;onRelease:()=>void; clock: RefObject<number>; active: boolean; reduced: boolean; dark: boolean; controls: RefObject<SceneCommands | null>; onReady: () => void; onUnavailable: () => void };
const TARGET = new Vector3(-0.48, 1.18, 0.235);
const CAMERA = new Vector3(5.2, 2.72, -6.3).add(TARGET);
// Stable camera options prevent React updates (including scroll state) resetting zoom.
const CAMERA_OPTIONS={position:CAMERA.toArray(),zoom:70,near:0.01,far:200,manual:true};
const MIN_ZOOM=0.45,MAX_ZOOM=2.5;
const WORLD_UP=new Vector3(0,1,0);
/** The window must show a warm room, not the page through a transparent canvas. */
function yieldRoom(gl:{setClearColor:(color:number,alpha?:number)=>void},progress:number){
 if(progress<.995)gl.setClearColor(0x2a2018,1);
 else gl.setClearColor(0x000000,0);
}
function CameraControls({active,controls:commandsRef,story,anchor,coffeeAnchor,interaction,reduced}:Pick<SceneProps,"active"|"controls"|"story"|"anchor"|"coffeeAnchor"|"interaction"|"reduced">){
 const controls=useRef<TrackballControlsImpl>(null),idle=useRef({interacting:false,resumeAt:0}),fit=useRef(70),previousFit=useRef(0),sample=useRef(0);
 const {size,get,invalidate}=useThree();
 const coffeeFrame=useRef({width:560,height:460,cx:0,cy:0});
 useEffect(()=>{
  const camera=get().camera,orbit=controls.current;if(!orbit)return;
  const immediate=(update:()=>void)=>{orbit.staticMoving=true;orbit.update();update();camera.updateProjectionMatrix();orbit.update();idle.current.resumeAt=performance.now()+3000;invalidate();};
  const reset=()=>immediate(()=>{orbit.reset();camera.position.copy(CAMERA);camera.up.set(0,1,0);camera.zoom=fit.current;orbit.target.copy(TARGET);});
  commandsRef.current={key:key=>{
   if(key==="Escape"||key==="Home"){reset();return;}
   immediate(()=>{
    if(["+","=","-"].includes(key))camera.zoom=Math.max(fit.current*MIN_ZOOM,Math.min(fit.current*MAX_ZOOM,camera.zoom*(key==="-"?.9:1.1)));
    else{
     const axis=new Vector3();if(key==="ArrowLeft"||key==="ArrowRight")axis.copy(camera.up).normalize();else camera.getWorldDirection(axis).cross(camera.up).normalize();
     const q=new Quaternion().setFromAxisAngle(axis,(key==="ArrowRight"||key==="ArrowDown"?-1:1)*.18);camera.position.sub(orbit.target).applyQuaternion(q).add(orbit.target);camera.up.applyQuaternion(q).normalize();
    }
   });
  }};
  return()=>{commandsRef.current=null;};
 },[get,commandsRef,invalidate]);
 useFrame(({camera,gl},delta)=>{
  const orbit=controls.current;if(!orbit)return;
  const box=anchor.current?.getBoundingClientRect(),p=story.current.reveal;
  const width=box?.width??size.width,height=box?.height??size.height;
  const cx=MathUtils.lerp(size.width/2,(box?.left??0)+width/2,p),cy=MathUtils.lerp(size.height/2,(box?.top??0)+height/2,p);
  const introFit=Math.min(size.width/3.7,size.height/4.5),slotFit=Math.min(width/3.6,height/2.95),layoutFit=MathUtils.lerp(introFit,slotFit,p);
  const s=story.current;
  orbit.enabled=s.released;
  const frame=coffeeAnchor.current?.getBoundingClientRect();
  if(frame)Object.assign(coffeeFrame.current,{width:frame.width,height:frame.height,cx:frame.left+frame.width/2,cy:frame.top+frame.height/2});
  if(s.entry==='door'&&!s.door.done){
   const door=coffeeAnchor.current,progress=s.door.progress,d=s.door;
   // The glazed window must show a room, not the page behind the canvas.
   const room=yieldRoom(gl,progress);
   const rect=door?.getBoundingClientRect();
   // Match the glazed opening in globals.css: 16% inset, 68% by 40% of the leaf.
   const win=rect?{width:rect.width*.68,height:rect.height*.40,left:rect.left+rect.width*.16,top:rect.top+rect.height*.16}:null;
   // A peephole that follows him: you see him at the desk, then walking to the door.
   const follow=MathUtils.smoothstep(d.presence,0,1);
   const winFit=win?Math.min(win.width/1.4,win.height/1.45):Math.min((rect?.width??280)/3.6,(rect?.height??450)/3.4);
   // As the leaf swings, ease out from the glazed opening to the whole doorway.
   const pull=Math.max(follow*.35,MathUtils.smoothstep(progress,0,1));
   const doorFit=win?MathUtils.lerp(winFit,Math.min(rect!.width/3.1,rect!.height/3.35),pull):winFit;
   const doorCenterX=win?MathUtils.lerp(win.left+win.width/2,rect!.left+rect!.width/2,pull):size.width/2;
   const doorCenterY=win?MathUtils.lerp(win.top+win.height/2,rect!.top+rect!.height/2,pull):size.height/2;
   // Aim straight at him so the peephole keeps him centred as he walks up.
   const targetX=s.pose.x,targetY=2.0,targetZ=s.pose.z;
   // Once the doorway beat ends, hand the framing back to the normal layout.
   const handoff=MathUtils.smoothstep(d.handoff,0,1);
   orbit.target.set(MathUtils.lerp(targetX,TARGET.x,handoff),MathUtils.lerp(targetY,TARGET.y,handoff),MathUtils.lerp(targetZ,TARGET.z,handoff));
   camera.position.set(CAMERA.x,CAMERA.y-.75*(1-handoff),CAMERA.z);
   camera.up.set(0,1,0);camera.lookAt(orbit.target);
   camera.zoom=MathUtils.lerp(doorFit,layoutFit,handoff);previousFit.current=layoutFit;fit.current=layoutFit;
   const centerX=MathUtils.lerp(win?doorCenterX:size.width/2,cx,handoff),centerY=MathUtils.lerp(win?doorCenterY:size.height/2,cy,handoff);
   const projection=camera as OrthographicCamera,shiftX=(size.width/2-centerX)/camera.zoom,shiftY=(centerY-size.height/2)/camera.zoom;
   projection.left=-size.width/2+shiftX;projection.right=size.width/2+shiftX;projection.top=size.height/2+shiftY;projection.bottom=-size.height/2+shiftY;projection.updateProjectionMatrix();
   gl.domElement.dataset.doorProgress=progress.toFixed(3);
   gl.domElement.dataset.doorFollow=follow.toFixed(2);
   gl.domElement.dataset.doorTarget=orbit.target.toArray().map(n=>n.toFixed(2)).join(',');
   gl.domElement.dataset.doorZoom=camera.zoom.toFixed(1);
   gl.domElement.dataset.doorActor=[s.pose.x,s.pose.z].map(n=>n.toFixed(2)).join(',');
   return;
  }
  if(s.phase.startsWith('coffee-')&&!s.skipped){
   const smooth=(n:number)=>{const t=MathUtils.clamp(n,0,1);return t*t*(3-2*t);};
   const travel=s.phase==='coffee-return-front'?smooth(s.time/2)*.55:s.phase==='coffee-return-side'?.55+smooth(s.time/1.65)*.45:['coffee-place','coffee-sit'].includes(s.phase)?1:0;
   const shot=coffeeFrame.current;
   const machineFit=Math.min(shot.width/4.5,shot.height/3.7);
   const follow=reduced?(travel>0?1:0):travel;
   orbit.target.set(MathUtils.lerp(1.6,TARGET.x,follow),MathUtils.lerp(1.65,TARGET.y,follow),MathUtils.lerp(-1.2,TARGET.z,follow));
   camera.position.set(orbit.target.x+MathUtils.lerp(1.7,5.2,follow),orbit.target.y+MathUtils.lerp(1,2.72,follow),orbit.target.z+MathUtils.lerp(-6,-6.3,follow));
   camera.up.set(0,1,0);camera.lookAt(orbit.target);
   camera.zoom=MathUtils.lerp(machineFit,layoutFit,follow);previousFit.current=layoutFit;fit.current=layoutFit;
   const centerX=MathUtils.lerp(shot.cx||size.width/2,cx,follow),centerY=MathUtils.lerp(shot.cy||size.height/2,cy,follow);
   const projection=camera as OrthographicCamera,shiftX=(size.width/2-centerX)/camera.zoom,shiftY=(centerY-size.height/2)/camera.zoom;
   projection.left=-size.width/2+shiftX;projection.right=size.width/2+shiftX;projection.top=size.height/2+shiftY;projection.bottom=-size.height/2+shiftY;projection.updateProjectionMatrix();
   anchor.current?.closest<HTMLElement>('.studio-app')?.style.setProperty('--coffee-world',String(follow));
   gl.domElement.dataset.coffeeCamera=follow<1?'following':'desk';
   return;
  }
  if(!previousFit.current)camera.zoom=layoutFit;
  else if(Math.abs(layoutFit-previousFit.current)>.001)camera.zoom*=layoutFit/previousFit.current;
  previousFit.current=layoutFit;fit.current=layoutFit;
  if(story.current.phase!=="work"&&!idle.current.interacting&&performance.now()>idle.current.resumeAt){
   const desired=layoutFit*(story.current.released?1-story.current.pose.stand*.22:1);camera.zoom=MathUtils.damp(camera.zoom,desired,6,Math.min(delta,.05));
  }
  camera.zoom=Math.max(layoutFit*MIN_ZOOM,Math.min(layoutFit*MAX_ZOOM,camera.zoom));orbit.maxDistance=Math.sqrt(layoutFit*MIN_ZOOM);
  // Off-axis orthographic projection places the scene at its layout anchor while
  // retaining the entire viewport as drawable space, including outside the slot.
  const projection=camera as OrthographicCamera;const shiftX=(size.width/2-cx)/camera.zoom,shiftY=(cy-size.height/2)/camera.zoom;projection.left=-size.width/2+shiftX;projection.right=size.width/2+shiftX;projection.top=size.height/2+shiftY;projection.bottom=-size.height/2+shiftY;projection.updateProjectionMatrix();
  const autoRotate=story.current.released&&active&&!idle.current.interacting&&performance.now()>=idle.current.resumeAt;
  if(autoRotate){const angle=-Math.min(delta,.05)*.21;camera.position.sub(orbit.target).applyAxisAngle(WORLD_UP,angle).add(orbit.target);camera.up.applyAxisAngle(WORLD_UP,angle);}
  sample.current+=delta;if(sample.current>.2){
   sample.current=0;gl.domElement.dataset.camera=camera.position.toArray().map(n=>n.toFixed(3)).join(",");gl.domElement.dataset.cameraUp=camera.up.toArray().map(n=>n.toFixed(3)).join(",");gl.domElement.dataset.zoom=camera.zoom.toFixed(2);gl.domElement.dataset.anchor=[cx,cy,width,height].map(n=>n.toFixed(1)).join(",");gl.domElement.dataset.autoRotate=String(autoRotate);
  }
 },-1.5);
 return <TrackballControls ref={controls} domElement={interaction.current??undefined} makeDefault target={TARGET} noPan maxDistance={0} rotateSpeed={2.8} zoomSpeed={.65} dynamicDampingFactor={.24} keys={["","",""]} onChange={()=>{const camera=get().camera;camera.zoom=Math.max(fit.current*MIN_ZOOM,Math.min(fit.current*MAX_ZOOM,camera.zoom));camera.updateProjectionMatrix();}} onStart={()=>{idle.current.interacting=true;if(controls.current)controls.current.staticMoving=false;}} onEnd={()=>{idle.current.interacting=false;idle.current.resumeAt=performance.now()+3000;}}/>;
}
function Workspace({ active, dark, clock: elapsed, onReady, ...props }: SceneProps) {
  const sample = useRef(0), readyFrames = useRef(0);
  const compositionRef = useRef<Group>(null),desk=useRef<Group>(null);
  const offsetRef = useRef<Group>(null), artworkRef = useRef<Group>(null);
  useLayoutEffect(() => {
    const turntable = compositionRef.current, offset = offsetRef.current, artwork = artworkRef.current;
    if (!turntable || !offset || !artwork) return;
    artwork.updateWorldMatrix(true, true);
    const bounds = new Box3(), part = new Box3();
    // Measure the actual opaque figurine and furniture, excluding invisible
    // touch targets, steam, lights, atmosphere and the shadow receiver.
    artwork.traverseVisible(object => {
      const mesh = object as Mesh;
      if (!mesh.isMesh || !mesh.castShadow) return;
      if(mesh instanceof InstancedMesh){mesh.computeBoundingBox();if(mesh.boundingBox)bounds.union(part.copy(mesh.boundingBox).applyMatrix4(mesh.matrixWorld));return;}
      mesh.geometry.computeBoundingBox();
      if (mesh.geometry.boundingBox) bounds.union(part.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld));
    });
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new Vector3()); center.y = 0;
    turntable.position.copy(center); offset.position.copy(center).negate();
    turntable.userData.horizontalBounds = [bounds.min.x,bounds.max.x,bounds.min.z,bounds.max.z];
  }, []);
  const breeze = useRef<Breeze>({strength:0,phase:0,x:0,z:0});
  useFrame(({gl,invalidate},delta) => {
    if (readyFrames.current < 2) {
      readyFrames.current++;
      if (readyFrames.current === 2) onReady(); else invalidate();
    }
    sampleBreeze(elapsed.current,breeze.current);
    if(desk.current)desk.current.visible=!['coffee-enter','coffee-pickup','coffee-toast'].includes(props.story.current.phase);
    if(desk.current){const impact=props.story.current.pose.impact;desk.current.position.y=impact*.004;desk.current.rotation.z=Math.sin(props.story.current.elapsed*65)*impact*.004;}
    gl.domElement.dataset.pivot=compositionRef.current?.position.toArray().join(",")??"";
    sample.current+=delta;
    if(sample.current>0.25 || !active){gl.domElement.dataset.idleTime=elapsed.current.toFixed(2);gl.domElement.dataset.wind=breeze.current.strength.toFixed(3);gl.domElement.dataset.drawCalls=String(gl.info.render.calls);gl.domElement.dataset.triangles=String(gl.info.render.triangles);sample.current=0;}
  },-2);
  const ambient = {clock:elapsed,active,breeze};
  return <>
    <ambientLight intensity={dark ? 0.55 : 0.85} />
    <hemisphereLight args={["#c7dcf2","#9a7d65",1.2]} />
    <InfiniteGround dark={dark||!props.story.current.released} />
    <group ref={compositionRef} name="workspace-turntable" position={[-0.48,0,0.2]}>
    <group ref={offsetRef} position={[0.48,0,-0.2]}>
    <directionalLight position={[-3,6,-4]} intensity={2.6} color="#fff0d7" castShadow shadow-intensity={0.32} shadow-radius={4} shadow-blurSamples={8} shadow-mapSize={[1024,1024]} shadow-camera-left={-3.5} shadow-camera-right={3.5} shadow-camera-top={4} shadow-camera-bottom={-3} shadow-normalBias={0.035} shadow-bias={-0.0003} />
    <directionalLight position={[4,3,4]} intensity={1.1} color="#a8c7e8" />
    <group ref={artworkRef} name="workspace-artwork">
    <group ref={desk}><CodingDesk {...ambient}/></group>
    {props.story.current.entry==='coffee'&&<CoffeeStation story={props.story}/>}
    <DeveloperCharacter {...ambient} running={props.running} story={props.story} reduced={props.reduced} onRelease={props.onRelease}/>
    </group>
    <ContactShadows position={[0,0.001,0]} opacity={dark ? 0.3 : 0.22} scale={7} blur={3} far={3.2} resolution={256} frames={Infinity} color="#08080b" />
    </group></group>
    <Atmosphere {...ambient} dark={dark} />
    <CameraControls anchor={props.anchor} coffeeAnchor={props.coffeeAnchor} interaction={props.interaction} active={active} controls={props.controls} story={props.story} reduced={props.reduced} />
  </>;
}
class RenderBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(){this.props.onError();}
  render(){return this.state.failed ? null : this.props.children;}
}
export default function WorkspaceScene(props:SceneProps) {
  const [supported,setSupported]=useState(supportsWebGL);
  useEffect(()=>{if(!supported)props.onUnavailable();},[supported,props.onUnavailable]);
  if(!supported)return null;
  return <RenderBoundary onError={props.onUnavailable}><Canvas eventSource={props.interaction as RefObject<HTMLElement>} eventPrefix="client" resize={{debounce:0}} shadows="variance" orthographic camera={CAMERA_OPTIONS} dpr={[1,1.25]} frameloop={props.active ? "always" : "demand"} gl={{antialias:true,alpha:true,powerPreference:"low-power"}} fallback={null} onCreated={({gl})=>{gl.setClearColor(0x000000,0);gl.domElement.setAttribute("aria-hidden","true");}}><ContextGuard onLost={()=>{setSupported(false);props.onUnavailable();}} /><Workspace {...props} /></Canvas></RenderBoundary>;
}
function ContextGuard({onLost}:{onLost:()=>void}) {
  const gl=useThree(state=>state.gl);
  useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener("webglcontextlost",onLost);return()=>canvas.removeEventListener("webglcontextlost",onLost);},[gl,onLost]);
  return null;
}
