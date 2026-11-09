"use client";
import { Component, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, ContactShadows, OrthographicCamera } from "@react-three/drei";
import { Group, MathUtils, OrthographicCamera as ThreeOrthographicCamera } from "three";

type SceneProps = { active: boolean; dark: boolean; pointer: RefObject<{ x: number; y: number }>; onReady: () => void; onUnavailable: () => void };
type BoxProps = { position: [number, number, number]; size: [number, number, number]; color: string; radius?: number; rotation?: [number, number, number]; emissive?: string };
function Box({ position, size, color, radius = 0.025, rotation, emissive }: BoxProps) {
  return <RoundedBox position={position} args={size} radius={Math.min(radius, Math.min(...size) / 3)} smoothness={2} bevelSegments={2} rotation={rotation} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.8} emissive={emissive} emissiveIntensity={emissive ? 0.45 : 0} /></RoundedBox>;
}
function Pine() {
  return <group position={[1.14, 0.17, 0.25]}>
    <mesh position={[0, 0.34, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 0.65, 8]} /><meshStandardMaterial color="#81664b" /></mesh>
    {[{ y: 0.67, r: 0.62, h: 0.9 }, { y: 1.16, r: 0.48, h: 0.86 }, { y: 1.62, r: 0.33, h: 0.77 }].map(({ y, r, h }) => <group key={y}>
      <mesh position={[0, y, 0]} castShadow receiveShadow><coneGeometry args={[r, h, 9]} /><meshStandardMaterial color="#496459" roughness={1} /></mesh>
      <mesh position={[0, y + h * 0.13, 0]} castShadow receiveShadow><coneGeometry args={[r * 0.81, h * 0.8, 9]} /><meshStandardMaterial color="#edf1ee" roughness={1} /></mesh>
    </group>)}
  </group>;
}
function Workspace({ active, pointer, dark, onReady }: SceneProps) {
  const group = useRef<Group>(null);
  const cameraRef = useRef<ThreeOrthographicCamera>(null);
  const elapsed = useRef(0);
  const lastSample = useRef(0);
  const { size, invalidate } = useThree();
  useEffect(() => {
    cameraRef.current?.lookAt(0, 0.9, 0);
    invalidate();
  }, [size.width, size.height, invalidate]);
  useEffect(() => { onReady(); }, [onReady]);
  useFrame(({ gl }, delta) => {
    const object = group.current;
    if (!object) return;
    const step = Math.min(delta, 0.05);
    if (active) elapsed.current += step;
    const time = elapsed.current;
    const desiredY = active ? Math.sin(time * 0.62) * 0.045 : 0;
    const desiredYaw = -0.12 + (active ? Math.sin(time * 0.25) * 0.065 + pointer.current.x * 0.18 : 0);
    if (active) {
      object.position.y = MathUtils.damp(object.position.y, desiredY, 4, step);
      object.rotation.y = MathUtils.damp(object.rotation.y, desiredYaw, 4.5, step);
      object.rotation.x = MathUtils.damp(object.rotation.x, pointer.current.y * 0.045, 4.5, step);
    }
    // Lightweight observability for the renderer fallback and browser validation.
    if (time - lastSample.current > 0.25 || !active) {
      gl.domElement.setAttribute("data-idle-time", time.toFixed(2));
      gl.domElement.setAttribute("data-yaw", object.rotation.y.toFixed(4));
      lastSample.current = time;
    }
  });
  const wood = "#af8260";
  const frame = "#78563e";
  return <>
    <OrthographicCamera ref={cameraRef} makeDefault position={[5.4, 4.2, 6]} zoom={Math.min(size.width / 5.65, size.height / 4.45)} near={0.1} far={100} />
    <ambientLight intensity={dark ? 1.0 : 1.3} />
    <hemisphereLight args={["#d6e5f0", "#8c7262", 1.3]} />
    <directionalLight position={[-3, 6, 5]} intensity={2.8} color="#fff0d9" />
    <directionalLight position={[4, 3, -3]} intensity={1.3} color="#c5d8eb" />
    <group ref={group} rotation={[0, -0.12, 0]}>
      <Box position={[0, -0.13, 0]} size={[3.7, 0.3, 2.85]} color="#7a776e" radius={0.15} />
      <Box position={[0, 0.045, 0]} size={[3.72, 0.09, 2.87]} color="#e9eee9" radius={0.12} />
      <Box position={[-0.47, 0.145, -0.26]} size={[2.22, 0.13, 1.9]} color={frame} />
      {Array.from({ length: 7 }, (_, i) => <Box key={i} position={[-0.47, 0.223, -1.04 + i * 0.26]} size={[2.15, 0.035, 0.25]} color={i % 2 ? "#b88e6a" : wood} radius={0.008} />)}
      <Box position={[-0.47, 1.21, -1.07]} size={[2.16, 1.9, 0.055]} color="#e8dcc5" emissive={dark ? "#665335" : undefined} />
      {[-1.55, 0.61].map(x => <Box key={x} position={[x, 1.2, -1.035]} size={[0.085, 2.05, 0.1]} color={frame} />)}
      {[0.25, 1.2, 2.16].map(y => <Box key={y} position={[-0.47, y, -1.02]} size={[2.25, 0.065, 0.11]} color={frame} />)}
      {[-1.02, -0.47, 0.08].map(x => <Box key={x} position={[x, 1.2, -1.025]} size={[0.025, 1.85, 0.035]} color="#9c7956" radius={0.005} />)}
      {[0.7, 1.67].map(y => <Box key={y} position={[-0.47, y, -1.025]} size={[2.1, 0.025, 0.035]} color="#9c7956" radius={0.005} />)}
      <Box position={[-0.47, 2.21, -1.04]} size={[2.34, 0.065, 0.19]} color="#f0f3ed" />
      <group position={[-0.49, 0, -0.08]}>
        <Box position={[0, 0.95, 0]} size={[1.78, 0.12, 0.92]} color={wood} radius={0.04} />
        {[-0.73, 0.73].flatMap(x => [-0.31, 0.31].map(z => <Box key={`${x}-${z}`} position={[x, 0.57, z]} size={[0.07, 0.72, 0.07]} color={frame} />))}
        <Box position={[-0.15, 1.033, -0.02]} size={[0.71, 0.035, 0.46]} color="#5e6b71" radius={0.02} />
        <Box position={[-0.15, 1.051, -0.01]} size={[0.54, 0.008, 0.27]} color="#3e4b50" radius={0.01} />
        <group position={[-0.15, 1.28, -0.23]} rotation={[-0.16, 0, 0]}>
          <Box position={[0, 0, 0]} size={[0.72, 0.48, 0.035]} color="#44545b" radius={0.025} />
          <Box position={[0, 0.015, 0.025]} size={[0.62, 0.365, 0.009]} color="#b4d1d4" emissive="#77acb3" radius={0.006} />
          {[0.08, 0.01, -0.06].map((y, i) => <Box key={y} position={[-0.08 + i * 0.015, y, 0.033]} size={[0.26 - i * 0.045, 0.014, 0.005]} color={i === 1 ? "#748e92" : "#e7f2ed"} radius={0.001} />)}
        </group>
        <group position={[0.6, 1.02, -0.27]}>
          <mesh position={[0, 0.014, 0]}><cylinderGeometry args={[0.12, 0.13, 0.03, 16]} /><meshStandardMaterial color="#625748" /></mesh>
          <mesh position={[0, 0.29, 0]}><cylinderGeometry args={[0.016, 0.016, 0.55, 8]} /><meshStandardMaterial color="#625748" /></mesh>
          <mesh position={[0, 0.57, 0]}><coneGeometry args={[0.22, 0.19, 24]} /><meshStandardMaterial color="#c79552" roughness={0.65} /></mesh>
          <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.18, 24]} /><meshStandardMaterial color="#ffdda0" emissive="#ffbb64" emissiveIntensity={1.5} side={2} /></mesh>
          <pointLight position={[0, 0.43, 0]} intensity={dark ? 1.1 : 0.45} color="#ffcf89" distance={2.4} decay={2} />
        </group>
        <group position={[-0.68, 1.1, 0.17]}>
          <mesh><cylinderGeometry args={[0.085, 0.07, 0.15, 16]} /><meshStandardMaterial color="#ddd8c9" /></mesh>
          <mesh position={[0, 0.078, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.068, 16]} /><meshStandardMaterial color="#594437" /></mesh>
          <mesh position={[-0.09, 0.005, 0]}><torusGeometry args={[0.05, 0.015, 6, 12]} /><meshStandardMaterial color="#ddd8c9" /></mesh>
        </group>
        <Box position={[0.53, 1.04, 0.2]} size={[0.28, 0.055, 0.23]} color="#8b9fa6" radius={0.01} />
        <Box position={[0.53, 1.074, 0.2]} size={[0.25, 0.018, 0.21]} color="#eee8d8" radius={0.005} />
      </group>
      <Pine />
      {[[1.1, 0.12, 0.97], [1.45, 0.13, 0.8], [-1.53, 0.1, 0.97]].map((p, i) => <mesh key={i} position={p as [number, number, number]} scale={[0.22 + i * 0.02, 0.12, 0.18]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#e8eeea" roughness={1} /></mesh>)}
      <group position={[-1.24, 0.29, 0.68]}>
        <Box position={[0, 0, 0]} size={[0.34, 0.16, 0.3]} color="#819293" />
        <Box position={[0, 0.18, 0]} size={[0.34, 0.16, 0.3]} color="#9cadac" />
        {[0, 0.18].map(y => <mesh key={y} position={[-0.09, y, 0.153]}><sphereGeometry args={[0.015, 6, 6]} /><meshStandardMaterial color="#e7e6c4" emissive="#b8bd89" /></mesh>)}
      </group>
    </group>
    <ContactShadows position={[0, -0.4, 0]} opacity={dark ? 0.4 : 0.28} scale={7} blur={2.5} far={4} resolution={256} frames={1} color="#171819" />
  </>;
}
class RenderBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function canRender() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch { return false; }
}
export default function WorkspaceScene(props: SceneProps) {
  const [supported, setSupported] = useState(canRender);
  if (!supported) return null;
  return <RenderBoundary fallback={null} onError={props.onUnavailable}><Canvas orthographic camera={{ position: [5.4, 4.2, 6], zoom: 70, near: 0.1, far: 100 }} dpr={[1, 1.5]} frameloop={props.active ? "always" : "demand"} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} fallback={null} onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); gl.domElement.setAttribute("aria-hidden", "true"); }}><ContextGuard onLost={() => { setSupported(false); props.onUnavailable(); }} /><Workspace {...props} /></Canvas></RenderBoundary>;
}
function ContextGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [gl, onLost]);
  return null;
}
