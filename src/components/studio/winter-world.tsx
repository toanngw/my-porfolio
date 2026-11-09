import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { Box } from "./scene-primitives";
import type { Breeze } from "./breeze";
import { LampCord, DeskCharm } from "./lamp-cord";
import { VoxelParts, type Voxel } from "./voxel-parts";
import { CodeScreen } from "./code-screen";

type AmbientProps = { clock: RefObject<number>; active: boolean; breeze: RefObject<Breeze> };
function Keyboard() {
  const ref = useRef<InstancedMesh>(null);
  const { invalidate } = useThree();
  const matrices = useMemo(() => {
    const item = new Object3D();
    return Array.from({length:40},(_,i) => {item.position.set(-0.255 + (i%10)*0.057,0.014,-0.08+Math.floor(i/10)*0.054); item.updateMatrix(); return item.matrix.clone();});
  },[]);
  // Static keys share one draw call, rather than forty beveled components.
  useFrame(() => {
    if (!ref.current || ref.current.userData.initialized) return;
    matrices.forEach((matrix,i) => ref.current!.setMatrixAt(i,matrix));
    ref.current.instanceMatrix.needsUpdate = true; ref.current.userData.initialized = true; invalidate();
  });
  return <group position={[-0.17,1.418,0.09]}>
    <Box position={[0,0,0]} size={[0.66,0.035,0.3]} color="#39434a" radius={0.025} />
    <instancedMesh ref={ref} args={[undefined,undefined,40]} castShadow receiveShadow><boxGeometry args={[0.044,0.018,0.038]} /><meshStandardMaterial color="#b4c8c9" roughness={0.65} /></instancedMesh>
    <Box position={[0,0.025,0.135]} size={[0.23,0.012,0.028]} color="#d8b78c" radius={0.005} />
  </group>;
}
function DeskLamp({ breeze }: Pick<AmbientProps,"breeze">) {
  const target = useMemo(() => {const object = new Object3D(); object.position.set(-0.25,1.34,0.1); return object;},[]);
  return <>
    <primitive object={target} />
    <group position={[0.68,1.4,-0.3]}>
      <mesh position={[0,0.025,0]} castShadow receiveShadow><cylinderGeometry args={[0.14,0.16,0.05,20]} /><meshStandardMaterial color="#967143" roughness={0.5} metalness={0.25} /></mesh>
      <Box position={[0,0.28,0]} size={[0.035,0.5,0.035]} color="#b99459" radius={0.01} />
      <group position={[0,0.55,0]}>
        <mesh castShadow><cylinderGeometry args={[0.075,0.22,0.19,24,1,true]} /><meshStandardMaterial color="#c8984f" roughness={0.5} metalness={0.18} side={2} /></mesh>
        <mesh position={[0,-0.085,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[0.195,24]} /><meshStandardMaterial color="#ffe6ad" emissive="#ffb354" emissiveIntensity={2.5} side={2} /></mesh>
        <spotLight position={[0,-0.12,0]} target={target} color="#ffc477" intensity={7} distance={4.5} angle={1.1} penumbra={0.9} decay={2} castShadow shadow-intensity={0.28} shadow-radius={3} shadow-blurSamples={6} shadow-mapSize={[512,512]} shadow-bias={-0.001} />
      </group>
      <LampCord breeze={breeze} />
    </group>
  </>;
}
export function CodingDesk({ clock, active, breeze }: AmbientProps) {
  return <group position={[-0.48,0,-0.14]}>
    <Box position={[0,1.32,0]} size={[1.94,0.14,1.05]} color="#b58a64" radius={0.008} />
    <Box position={[0,1.405,0.06]} size={[1.24,0.013,0.65]} color="#657c7b" radius={0.03} />
    {[-0.8,0.8].map(x=><group key={x}>
      <Box position={[x,0.66,0]} size={[0.075,1.22,0.075]} color="#39474b" radius={0.018} />
      <Box position={[x,0.06,0]} size={[0.1,0.09,0.78]} color="#465458" radius={0.025} />
      <Box position={[x,1.2,0]} size={[0.09,0.06,0.8]} color="#465458" radius={0.015} />
    </group>)}
    <Box position={[0,1.05,-0.35]} size={[1.6,0.045,0.05]} color="#39474b" radius={0.01} />
    <VoxelParts parts={[
      ...Array.from({length:7},(_,i):Voxel=>[0,1.391,-.44+i*.145,1.85,.006,.008,"#98704f"]),
      [.72,1.48,.02,.21,.17,.21,"#c88562"],[.72,1.57,.02,.24,.035,.24,"#e3aa82"],
      [.72,1.59,.02,.18,.012,.18,"#4c4033"],[.72,1.69,.02,.035,.23,.035,"#617958"],
      [.65,1.72,.02,.13,.055,.08,"#79976b"],[.78,1.77,.02,.12,.055,.08,"#90a77a"],
      [.72,1.84,.02,.075,.08,.08,"#68895e"],
    ]}/>
    <Keyboard />
    <group position={[-0.17,1.76,-0.3]} rotation={[-0.1,0,0]}>
      <Box position={[0,0,0]} size={[0.89,0.59,0.055]} color="#3a4851" radius={0.038} />
      <group scale={1.19}><CodeScreen clock={clock} active={active} /></group>
      <Box position={[0,0,-0.032]} size={[0.16,0.09,0.008]} color="#71858b" radius={0.018} />
      <Box position={[0,0.32,0]} size={[0.065,0.035,0.045]} color="#25343b" radius={0.012} />
      <mesh position={[0,0.322,0.025]}><sphereGeometry args={[0.01,8,6]} /><meshStandardMaterial color="#526b77" /></mesh>
    </group>
    <Box position={[-0.17,1.49,-0.33]} size={[0.06,0.2,0.06]} color="#536772" radius={0.012} />
    <Box position={[-0.17,1.423,-0.3]} size={[0.34,0.035,0.2]} color="#455861" radius={0.02} />
    <group position={[0.42,1.44,0.14]}>
      <Box position={[0,0,0]} size={[0.13,0.065,0.2]} color="#e0dfd5" radius={0.04} />
      <Box position={[0,0.035,-0.015]} size={[0.012,0.016,0.04]} color="#768b8c" radius={0.005} />
    </group>
    <DeskLamp breeze={breeze} />
    <DeskCharm breeze={breeze} />
    <group position={[-0.77,1.43,-0.26]} rotation={[0,0.2,0]}>
      {["#b77255","#7095a1","#d1b883"].map((color,i)=><group key={color} position={[0,i*0.048,0]}>
        <Box position={[0,0,0]} size={[0.24,0.045,0.3]} color={color} radius={0.008} />
        <Box position={[0.012,0,0]} size={[0.225,0.026,0.265]} color="#f1e6d0" radius={0.003} />
      </group>)}
    </group>
    <group position={[0.69,1.43,0.29]} rotation={[Math.PI/2,0,0.25]}>
      <mesh castShadow><torusGeometry args={[0.105,0.022,6,20,Math.PI]} /><meshStandardMaterial color="#34454d" roughness={0.8} /></mesh>
      {[-0.105,0.105].map(x=><Box key={x} position={[x,0,0]} size={[0.075,0.11,0.09]} color="#3c515b" radius={0.025} />)}
    </group>
    <group position={[-0.85,1.44,0.28]}>
      <mesh castShadow><cylinderGeometry args={[0.065,0.055,0.11,12]} /><meshStandardMaterial color="#d0b38a" /></mesh>
      {[-0.03,0,0.025].map((x,i)=><Box key={i} position={[x,0.12,0]} size={[0.013,0.2+i*0.025,0.013]} color={i%2 ? "#708f93" : "#bd7453"} rotation={[0,0,x*3]} radius={0.004} />)}
    </group>
  </group>;
}
