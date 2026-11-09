import { useRef, useState, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { Group, MathUtils, Mesh, Quaternion, Vector3 } from "three";
import type { OrbitControls } from "three-stdlib";
import type { Breeze } from "./breeze";

export function LampCord({ breeze, active, onToggle, grabbedRef }: { breeze: RefObject<Breeze>; active: boolean; onToggle: () => void; grabbedRef: RefObject<boolean> }) {
  const pivot = useRef<Group>(null), cord = useRef<Group>(null);
  const hit = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const sample = useRef(0);
  const localWind = useRef(new Vector3()), orientation = useRef(new Quaternion());
  const gesture = useRef({ pointer: -1, startY: 0, extension: 0, displacement: 0, velocity: 0, angle: 0, angularVelocity: 0, depthAngle: 0, depthVelocity: 0 });
  const { get, invalidate } = useThree();
  useCursor(hovered, "pointer");
  const release = (event: ThreeEvent<PointerEvent>, cancelled = false) => {
    const value = gesture.current;
    if (value.pointer !== event.pointerId) return;
    event.stopPropagation();
    const shouldToggle = !cancelled && (Math.abs(event.nativeEvent.clientY - value.startY) < 6 || value.extension > 0.035);
    value.pointer = -1; value.extension = 0; grabbedRef.current = false;
    const controls = get().controls as OrbitControls | null;
    if (controls) controls.enabled = true;
    (event.target as unknown as Element).releasePointerCapture?.(event.pointerId);
    if (shouldToggle) onToggle();
    invalidate();
  };
  useFrame(({gl,camera}, delta) => {
    // Enlarge only the invisible hit target on smaller renders; keep the bead delicate.
    hit.current?.scale.setScalar(MathUtils.clamp(22 / camera.zoom,0.085,0.42));
    const value = gesture.current;
    if (pivot.current?.parent) pivot.current.parent.getWorldQuaternion(orientation.current).invert();
    localWind.current.set(breeze.current.x,0,breeze.current.z).applyQuaternion(orientation.current);
    // Semi-implicit spring, mass 1 / stiffness 100 / damping 10. Pointer pulling
    // is direct; only release rebounds. A separate damped pendulum follows wind.
    if (value.pointer >= 0) { value.displacement = value.extension; value.velocity = 0; }
    else if (!active) { value.displacement = 0; value.velocity = 0; }
    // Bounded substeps keep the same spring timing on slower mobile frames.
    if (active) {
      let remaining = Math.min(delta, 0.05);
      while (remaining > 0) {
        const dt = Math.min(remaining, 1 / 120); remaining -= dt;
        if (value.pointer < 0) {
          value.velocity += (-100 * value.displacement - 10 * value.velocity) * dt;
          value.displacement += value.velocity * dt;
        }
        value.angularVelocity += (localWind.current.x * 0.7 - 8 * value.angle - 3.2 * value.angularVelocity) * dt;
        value.angle += value.angularVelocity * dt;
        value.depthVelocity += (-localWind.current.z * 0.7 - 8 * value.depthAngle - 3.2 * value.depthVelocity) * dt;
        value.depthAngle += value.depthVelocity * dt;
      }
    }
    if (pivot.current) {pivot.current.rotation.z = value.angle; pivot.current.rotation.x = value.depthAngle;}
    if (cord.current) cord.current.scale.y = 1 + value.displacement / 0.2;
    sample.current += delta;
    if(sample.current > 0.25 || !active) {
      gl.domElement.dataset.cordPull = value.displacement.toFixed(3);
      gl.domElement.dataset.cordSway = value.angle.toFixed(3);
      sample.current = 0;
    }
  });
  return <group name="lamp-pull-cord" ref={pivot} position={[0.16, 0.46, -0.11]}>
    <group ref={cord}>
      <mesh position={[0, -0.1, 0]} castShadow><cylinderGeometry args={[0.006, 0.006, 0.2, 6]} /><meshStandardMaterial color="#d5c7ae" roughness={0.94} /></mesh>
      <group position={[0, -0.21, 0]}>
        <mesh castShadow><capsuleGeometry args={[0.022, 0.036, 3, 8]} /><meshStandardMaterial color={hovered ? "#f5d095" : "#bb8b4e"} roughness={0.45} metalness={0.25} /></mesh>
        <mesh ref={hit} onPointerOver={event=>{event.stopPropagation();setHovered(true);}} onPointerOut={()=>setHovered(false)}
          onPointerDown={event=>{
            if (gesture.current.pointer >= 0 || event.button !== 0) return;
            event.stopPropagation();
            gesture.current.pointer = event.pointerId; gesture.current.startY = event.nativeEvent.clientY;
            grabbedRef.current = true;
            const controls = get().controls as OrbitControls | null;
            if (controls) {controls.autoRotate = false;controls.enabled = false;}
            (event.target as unknown as Element).setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={event=>{
            if (gesture.current.pointer !== event.pointerId) return;
            event.stopPropagation();
            gesture.current.extension = MathUtils.clamp((event.nativeEvent.clientY - gesture.current.startY) / get().camera.zoom, 0, 0.2);
            invalidate();
          }} onPointerUp={event=>release(event)} onPointerCancel={event=>release(event,true)} onClick={event=>event.stopPropagation()}>
          <sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  </group>;
}

/** A small bookmark charm supplies a second, restrained suspended detail. */
export function DeskCharm({ breeze }: { breeze: RefObject<Breeze> }) {
  const ref=useRef<Group>(null);
  const localWind=useRef(new Vector3()),orientation=useRef(new Quaternion());
  useFrame(()=>{
    if(!ref.current)return;
    ref.current.parent?.getWorldQuaternion(orientation.current).invert();
    localWind.current.set(breeze.current.x,0,breeze.current.z).applyQuaternion(orientation.current);
    ref.current.rotation.set(-localWind.current.z*0.1,0,localWind.current.x*0.1);
  });
  return <group position={[-0.85,1.35,0.47]} ref={ref}>
    <mesh position={[0,-0.12,0]}><cylinderGeometry args={[0.004,0.004,0.24,4]} /><meshStandardMaterial color="#bba77f" /></mesh>
    <mesh position={[0,-0.25,0]} castShadow><torusGeometry args={[0.03,0.008,4,12]} /><meshStandardMaterial color="#c9a765" metalness={0.35} roughness={0.5} /></mesh>
  </group>;
}
