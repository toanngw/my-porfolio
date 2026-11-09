"use client";
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Box3, Group, Mesh, Spherical, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DeveloperCharacter } from "./developer-character";
import { Coffee } from "./workspace-coffee";
import { CodingDesk } from "./winter-world";
import { Atmosphere, InfiniteGround } from "./atmosphere";
import { sampleBreeze, type Breeze } from "./breeze";
import { supportsWebGL } from "@/lib/webgl-support";

export type SceneCommands = { reset: () => void; key: (key: string) => void };
type SceneProps = { clock: RefObject<number>; modelUrl: string | null; active: boolean; reduced: boolean; dark: boolean; controls: RefObject<SceneCommands | null>; lampOn: boolean; lampInstant: boolean; onLampToggle: () => void; onReady: () => void; onUnavailable: () => void };
const CAMERA = new Vector3(5.2, 3.9, -6.3);
const TARGET = new Vector3(0, 1.18, 0);
function CameraControls({ active, reduced, controls: commandsRef, compositionRef, grabbedRef }: Pick<SceneProps,"active"|"reduced"|"controls"> & {compositionRef: RefObject<Group|null>;grabbedRef:RefObject<boolean>}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const idle = useRef({ interacting: false, resumeAt: 0 });
  const lastSample = useRef(0);
  const intro = useRef({ phase: "warming", frames: 0, delay: 0.2, time: 0, angle: 0 });
  const previousGrab = useRef(false);
  const cancelIntro = useRef(() => {});
  const { size, invalidate, get } = useThree();
  const fit = Math.min(size.width / 4.7, size.height / 3.5);
  const previousFit = useRef(fit);
  useEffect(() => {
    const camera = get().camera;
    const ratio = camera.zoom / previousFit.current;
    camera.zoom = previousFit.current === fit && camera.zoom === 70 ? fit : fit * Math.max(0.7,Math.min(2.1,ratio));
    previousFit.current = fit;
    camera.updateProjectionMatrix(); invalidate();
  },[get,fit,invalidate]);
  useEffect(() => {
    const camera = get().camera;
    const orbit = controls.current;
    if (!orbit) return;
    // Freeze the turntable at its current angle. Manual input takes priority;
    // neither the camera nor the composition translates at interruption.
    cancelIntro.current = () => {
      if (intro.current.phase === "complete" || intro.current.phase === "cancelled") return;
      intro.current.phase = "cancelled";
      orbit.autoRotate = false;
      idle.current.resumeAt = performance.now()+3000;
    };
    const immediate = (update: () => void) => {
      cancelIntro.current();
      orbit.autoRotate = false; orbit.enableDamping = false;
      orbit.update(); update(); camera.updateProjectionMatrix(); orbit.update();
      orbit.enableDamping = true;
      idle.current.resumeAt = performance.now()+3000; invalidate();
    };
    const reset = () => immediate(() => {if(compositionRef.current)compositionRef.current.rotation.y=0;camera.position.copy(CAMERA);camera.zoom=fit;orbit.target.copy(TARGET);});
    commandsRef.current = {reset, key: key => {
      if (key === "Escape" || key === "Home") {reset();return;}
      immediate(() => {
        if (key === "+" || key === "=" || key === "-") camera.zoom = Math.max(fit*0.7, Math.min(fit*2.1,camera.zoom*(key === "-" ? 0.9 : 1.1)));
        else {
          const spherical = new Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
          spherical.theta += key === "ArrowLeft" ? 0.16 : key === "ArrowRight" ? -0.16 : 0;
          spherical.phi = Math.max(0.4,Math.min(1.4,spherical.phi+(key === "ArrowUp" ? -0.1 : key === "ArrowDown" ? 0.1 : 0)));
          camera.position.copy(new Vector3().setFromSpherical(spherical).add(orbit.target));
        }
      });
    }};
    return () => {commandsRef.current=null;};
  },[get,commandsRef,fit,invalidate,compositionRef]);
  useFrame(({gl,camera},delta) => {
    const orbit = controls.current;
    if (!orbit) return;
    const state = intro.current;
    if (reduced && state.phase !== "complete" && state.phase !== "cancelled") {
      cancelIntro.current(); state.phase = "complete";
    }
    if (grabbedRef.current) cancelIntro.current();
    if (previousGrab.current && !grabbedRef.current) {
      idle.current.interacting = false; idle.current.resumeAt = performance.now()+3000;
    }
    previousGrab.current = grabbedRef.current;
    // Compile/render the first frames before spending the visible intro budget.
    // Otherwise a slow first shader compilation can consume the entire spin.
    if (state.phase === "warming" && ++state.frames >= 3) state.phase = "pending";
    if (state.phase === "pending" && active) {
      state.delay = Math.max(0, state.delay - Math.min(delta,0.05));
      if (state.delay === 0) {state.phase = "running";delta=0;}
    }
    if (state.phase === "running" && active && compositionRef.current) {
      state.time = Math.min(1.8, state.time + Math.min(delta,0.05));
      const p = state.time / 1.8;
      // Three exact turns in 1.8 seconds: fast at entry, easeOutCubic to rest.
      // Only the centered parent rotates; camera, ground and atmosphere stay still.
      state.angle = Math.PI * 6 * (1 - (1 - p) ** 3);
      compositionRef.current.rotation.y = state.angle;
      if (p === 1) {
        compositionRef.current.rotation.y = 0;
        state.phase = "complete"; idle.current.resumeAt = performance.now()+1500;
      }
    }
    orbit.autoRotate = active && state.phase !== "warming" && state.phase !== "running" && state.phase !== "pending" && !grabbedRef.current && !idle.current.interacting && performance.now() >= idle.current.resumeAt;
    lastSample.current += delta;
    if (lastSample.current > 0.25 || !active) {
      gl.domElement.dataset.intro = state.phase;
      gl.domElement.dataset.introTime = state.time.toFixed(3);
      gl.domElement.dataset.pivot = compositionRef.current?.position.toArray().join(",") ?? "";
      gl.domElement.dataset.introTurns = (state.angle / (Math.PI * 2)).toFixed(3);
      gl.domElement.dataset.autoRotate = String(orbit.autoRotate);
      gl.domElement.dataset.camera = camera.position.toArray().map(n=>n.toFixed(3)).join(",");
      gl.domElement.dataset.zoom = camera.zoom.toFixed(2);
      lastSample.current = 0;
    }
  }, -1.5);
  return <OrbitControls ref={controls} makeDefault target={TARGET} enablePan={false} enableDamping dampingFactor={0.075} rotateSpeed={0.65} zoomSpeed={0.7} minZoom={fit*0.7} maxZoom={fit*2.1} minPolarAngle={0.4} maxPolarAngle={1.4} autoRotateSpeed={0.65} onStart={() => {cancelIntro.current();idle.current.interacting=true; if(controls.current)controls.current.autoRotate=false;}} onEnd={() => {idle.current.interacting=false;idle.current.resumeAt=performance.now()+3000;}} />;
}
function Workspace({ active, dark, clock: elapsed, onReady, ...props }: SceneProps) {
  const sample = useRef(0), readyFrames = useRef(0);
  const compositionRef = useRef<Group>(null), grabbedRef = useRef(false);
  const offsetRef = useRef<Group>(null), artworkRef = useRef<Group>(null);
  useLayoutEffect(() => {
    const turntable = compositionRef.current, offset = offsetRef.current, artwork = artworkRef.current;
    if (!turntable || !offset || !artwork) return;
    artwork.updateWorldMatrix(true, true);
    const bounds = new Box3(), part = new Box3();
    // Measure the actual opaque figurine and furniture, excluding invisible
    // touch targets, steam, lights, atmosphere and the shadow receiver.
    artwork.traverse(object => {
      const mesh = object as Mesh;
      if (!mesh.isMesh || !mesh.castShadow) return;
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
    sample.current+=delta;
    if(sample.current>0.25 || !active){gl.domElement.dataset.idleTime=elapsed.current.toFixed(2);gl.domElement.dataset.wind=breeze.current.strength.toFixed(3);gl.domElement.dataset.drawCalls=String(gl.info.render.calls);gl.domElement.dataset.triangles=String(gl.info.render.triangles);sample.current=0;}
  },-2);
  const ambient = {clock:elapsed,active,breeze,grabbedRef};
  return <>
    <ambientLight intensity={dark ? 0.55 : 0.85} />
    <hemisphereLight args={["#c7dcf2","#9a7d65",1.2]} />
    <InfiniteGround dark={dark} />
    <group ref={compositionRef} name="workspace-turntable" position={[-0.48,0,0.2]}>
    <group ref={offsetRef} position={[0.48,0,-0.2]}>
    <directionalLight position={[-3,6,-4]} intensity={2.6} color="#fff0d7" castShadow shadow-intensity={0.32} shadow-radius={4} shadow-blurSamples={8} shadow-mapSize={[1024,1024]} shadow-camera-left={-3.5} shadow-camera-right={3.5} shadow-camera-top={4} shadow-camera-bottom={-3} shadow-normalBias={0.035} shadow-bias={-0.0003} />
    <directionalLight position={[4,3,4]} intensity={1.6} color="#a8c7e8" />
    <group ref={artworkRef} name="workspace-artwork">
    <CodingDesk {...ambient} lampOn={props.lampOn} lampInstant={props.lampInstant} onLampToggle={props.onLampToggle} />
    {props.modelUrl ? <DeveloperCharacter {...ambient} modelUrl={props.modelUrl} /> : <group position={[-0.15,1.49,0.11]}><Coffee {...ambient} /></group>}
    </group>
    <ContactShadows position={[0,0.001,0]} opacity={dark ? 0.3 : 0.22} scale={7} blur={3} far={3.2} resolution={256} frames={1} color="#08080b" />
    </group></group>
    <Atmosphere {...ambient} dark={dark} />
    <CameraControls active={active} reduced={props.reduced} controls={props.controls} compositionRef={compositionRef} grabbedRef={grabbedRef} />
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
  if(!supported)return null;
  return <RenderBoundary onError={props.onUnavailable}><Canvas shadows="variance" orthographic camera={{position:CAMERA.toArray(),zoom:70,near:0.1,far:100}} dpr={[1,1.5]} frameloop={props.active ? "always" : "demand"} gl={{antialias:true,alpha:true,powerPreference:"low-power"}} fallback={null} onCreated={({gl})=>{gl.setClearColor(0x000000,0);gl.domElement.setAttribute("aria-hidden","true");}}><ContextGuard onLost={()=>{setSupported(false);props.onUnavailable();}} /><Workspace {...props} /></Canvas></RenderBoundary>;
}
function ContextGuard({onLost}:{onLost:()=>void}) {
  const gl=useThree(state=>state.gl);
  useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener("webglcontextlost",onLost);return()=>canvas.removeEventListener("webglcontextlost",onLost);},[gl,onLost]);
  return null;
}
