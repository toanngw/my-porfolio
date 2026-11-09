import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshBasicMaterial, Vector3, MathUtils } from "three";
import { Box } from "./scene-primitives";

const UP = new Vector3(0, 1, 0);
const smooth = (a: number, b: number, time: number) => MathUtils.smoothstep(time, a, b);

function Steam({ clock, active }: { clock: RefObject<number>; active: boolean }) {
  const wisps = useRef<Group>(null);
  useFrame(() => {
    if (!active || !wisps.current) return;
    wisps.current.children.forEach((child, index) => {
      const puff = child as Mesh;
      const phase = (clock.current * 0.42 + index / 7) % 1;
      puff.position.set(Math.sin(phase * 5 + index) * 0.035, 0.1 + phase * 0.43, Math.cos(phase * 4 + index) * 0.02);
      puff.scale.set(0.027 + phase * 0.04, 0.04 + phase * 0.055, 0.027 + phase * 0.04);
      (puff.material as MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * 0.24;
    });
  });
  return <group ref={wisps}>{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[0, 0.12 + i * 0.05, 0]} scale={0.03}>
    <icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color="#f7f3e9" transparent opacity={0.14} depthWrite={false} />
  </mesh>)}</group>;
}

function Coffee({ clock, active }: { clock: RefObject<number>; active: boolean }) {
  return <>
    <mesh><cylinderGeometry args={[0.087, 0.071, 0.16, 20]} /><meshStandardMaterial color="#e2d6bd" roughness={0.55} /></mesh>
    <mesh position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.072, 20]} /><meshStandardMaterial color="#493024" /></mesh>
    <mesh position={[0, 0.083, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.079, 0.008, 6, 20]} /><meshStandardMaterial color="#f4e7cf" /></mesh>
    <mesh position={[0.09, 0, 0]}><torusGeometry args={[0.05, 0.015, 6, 12]} /><meshStandardMaterial color="#e2d6bd" /></mesh>
    <Steam clock={clock} active={active} />
  </>;
}

/** Original primitive-built winter developer. All choreography shares the scene clock. */
export function DeveloperCharacter({ clock, active }: { clock: RefObject<number>; active: boolean }) {
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const leftForearm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const rightForearm = useRef<Group>(null);
  const leftHand = useRef<Group>(null);
  const rightHand = useRef<Group>(null);
  const mug = useRef<Group>(null);
  const direction = useRef(new Vector3());
  const shoulderLeft = useRef(new Vector3(-0.255, 1.28, 0));
  const shoulderRight = useRef(new Vector3(0.255, 1.28, 0));
  const elbowLeft = useRef(new Vector3(-0.32, 1.08, -0.36));
  const elbowRight = useRef(new Vector3());
  const handLeft = useRef(new Vector3());
  const handRight = useRef(new Vector3());
  const cup = useRef(new Vector3());

  useFrame(() => {
    if (!head.current || !mug.current) return;
    const t = clock.current;
    const cycle = t % 22;
    const reach = smooth(12.5, 13.4, cycle) * (1 - smooth(18.7, 19.6, cycle));
    const lift = smooth(13.6, 15.1, cycle) * (1 - smooth(17.1, 18.6, cycle));
    const sip = smooth(15.2, 15.9, cycle) * (1 - smooth(16.6, 17.1, cycle));
    const typing = active ? Math.sin(t * 17) * 0.014 : 0;
    cup.current.set(MathUtils.lerp(0.58, 0.12, lift), MathUtils.lerp(1.1, 1.64, lift), MathUtils.lerp(-0.63, -0.28, lift));
    mug.current.position.copy(cup.current);
    mug.current.rotation.z = sip * 0.3;
    handLeft.current.set(-0.2, 1.09 + typing, -0.75);
    direction.current.copy(cup.current); direction.current.x += 0.13;
    handRight.current.set(0.16, 1.09 - typing, -0.75).lerp(direction.current, reach);
    elbowRight.current.set(MathUtils.lerp(0.34, 0.46, reach), MathUtils.lerp(1.08, 1.35, lift), MathUtils.lerp(-0.34, -0.08, lift));
    const segment = (ref: RefObject<Group | null>, from: Vector3, to: Vector3) => {
      if (!ref.current) return;
      ref.current.position.copy(from).lerp(to, 0.5);
      ref.current.quaternion.setFromUnitVectors(UP, direction.current.copy(to).sub(from).normalize());
      ref.current.scale.y = from.distanceTo(to);
    };
    segment(leftArm, shoulderLeft.current, elbowLeft.current);
    segment(leftForearm, elbowLeft.current, handLeft.current);
    segment(rightArm, shoulderRight.current, elbowRight.current);
    segment(rightForearm, elbowRight.current, handRight.current);
    leftHand.current?.position.copy(handLeft.current);
    rightHand.current?.position.copy(handRight.current);
    head.current.rotation.x = -0.06 + (active ? Math.sin(t * 1.7) * 0.018 : 0) - sip * 0.07;
    head.current.rotation.y = -lift * 0.2;
  });

  return <group position={[-0.64, 0, 0.83]}>
    {/* The stool and bent legs keep the silhouette readable from every angle. */}
    <mesh position={[0, 0.62, 0.08]}><cylinderGeometry args={[0.32, 0.32, 0.1, 20]} /><meshStandardMaterial color="#785944" /></mesh>
    <mesh position={[0, 0.4, 0.08]}><cylinderGeometry args={[0.045, 0.06, 0.4, 10]} /><meshStandardMaterial color="#505657" /></mesh>
    <mesh position={[0, 0.22, 0.08]}><cylinderGeometry args={[0.25, 0.28, 0.045, 16]} /><meshStandardMaterial color="#505657" /></mesh>
    {[-0.14, 0.14].map(x => <group key={x}>
      <Box position={[x, 0.69, -0.18]} size={[0.21, 0.19, 0.52]} color="#384147" />
      <Box position={[x, 0.48, -0.37]} size={[0.19, 0.39, 0.18]} color="#384147" />
      <Box position={[x, 0.29, -0.43]} size={[0.22, 0.12, 0.34]} color="#eee5d6" radius={0.045} />
      <Box position={[x, 0.245, -0.43]} size={[0.23, 0.035, 0.35]} color="#b7ad9d" radius={0.012} />
    </group>)}
    <Box position={[0, 1.01, 0]} size={[0.51, 0.62, 0.32]} color="#35424c" radius={0.065} />
    <Box position={[0, 0.98, -0.168]} size={[0.025, 0.45, 0.013]} color="#b6b9b1" radius={0.004} />
    {[-0.12, 0.12].map(x => <Box key={x} position={[x, 0.86, -0.17]} size={[0.15, 0.12, 0.026]} color="#2c3740" radius={0.018} />)}
    <Box position={[0, 1.32, 0]} size={[0.43, 0.12, 0.34]} color="#aa7653" radius={0.045} />
    <Box position={[-0.16, 1.2, -0.2]} size={[0.1, 0.3, 0.065]} color="#aa7653" rotation={[0, 0, -0.08]} />
    <group ref={head} position={[0, 1.62, 0]}>
      <Box position={[0, 0, 0]} size={[0.44, 0.45, 0.4]} color="#deb18c" radius={0.065} />
      <Box position={[0, 0.205, 0.01]} size={[0.46, 0.15, 0.43]} color="#282b30" radius={0.045} />
      <Box position={[0, 0.13, 0.17]} size={[0.45, 0.23, 0.09]} color="#282b30" radius={0.025} />
      {[-0.15, -0.055, 0.045].map((x, i) => <Box key={x} position={[x, 0.13 - i * 0.018, -0.19]} size={[0.13, 0.12, 0.045]} color="#282b30" rotation={[0, 0, -0.12]} radius={0.018} />)}
      {[-0.105, 0.105].map(x => <group key={x}>
        <Box position={[x, -0.005, -0.203]} size={[0.035, 0.055, 0.015]} color="#292a2c" radius={0.01} />
        <Box position={[x, 0.06, -0.205]} size={[0.065, 0.016, 0.015]} color="#3d322e" radius={0.005} />
      </group>)}
      <Box position={[0, -0.1, -0.207]} size={[0.068, 0.016, 0.012]} color="#9a6350" radius={0.004} />
      {[-0.23, 0.23].map(x => <Box key={x} position={[x, -0.035, 0]} size={[0.065, 0.11, 0.09]} color="#deb18c" radius={0.025} />)}
    </group>
    <group ref={leftArm}><Box position={[0, 0, 0]} size={[0.19, 1, 0.19]} color="#35424c" radius={0.035} /></group>
    <group ref={rightArm}><Box position={[0, 0, 0]} size={[0.19, 1, 0.19]} color="#35424c" radius={0.035} /></group>
    <group ref={leftForearm}><Box position={[0, 0, 0]} size={[0.16, 1, 0.16]} color="#35424c" radius={0.03} /></group>
    <group ref={rightForearm}><Box position={[0, 0, 0]} size={[0.16, 1, 0.16]} color="#35424c" radius={0.03} /></group>
    <group ref={leftHand}><Box position={[0, 0, 0]} size={[0.14, 0.1, 0.15]} color="#deb18c" /></group>
    <group ref={rightHand}><Box position={[0, 0, 0]} size={[0.14, 0.1, 0.15]} color="#deb18c" /></group>
    <group ref={mug} position={[0.58, 1.1, -0.63]}><Coffee clock={clock} active={active} /></group>
  </group>;
}
