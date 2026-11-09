import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, Group, MathUtils, Mesh, MeshStandardMaterial, Shape, ShapeGeometry, Vector3 } from "three";
import type { Breeze } from "./breeze";

type EnvironmentProps = { clock: RefObject<number>; breeze: RefObject<Breeze>; active: boolean; dark: boolean };

/** A real lit surface; cached soft contact shadows sit just above it. */
export function InfiniteGround({ dark }: { dark: boolean }) {
  const material = useMemo(() => {
    const surface = new MeshStandardMaterial({ color: dark ? "#111114" : "#d8d0c2", roughness: 1, transparent: true, depthWrite: false });
    surface.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 groundPosition;\nvarying vec4 groundClip;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\ngroundPosition = position.xy;")
        .replace("#include <project_vertex>", "#include <project_vertex>\ngroundClip = gl_Position;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 groundPosition;\nvarying vec4 groundClip;")
        .replace("#include <opaque_fragment>", "vec2 groundUV = groundClip.xy / groundClip.w * 0.5 + 0.5;\nfloat groundEdge = min(min(groundUV.x, 1.0-groundUV.x), min(groundUV.y, 1.0-groundUV.y));\ndiffuseColor.a *= (1.0 - smoothstep(0.65, 2.1, length(groundPosition))) * smoothstep(0.0, 0.14, groundEdge);\n#include <opaque_fragment>");
    };
    return surface;
  }, [dark]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh name="infinite-ground" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]} material={material}>
    <planeGeometry args={[200, 200]} />
  </mesh>;
}

function makeLeaf() {
  // Serrated lobes, deep clefts, a narrow petiole, and a gently cupped surface.
  const shape = new Shape();
  const outline = [[0,-0.65],[-0.055,-0.32],[-0.4,-0.43],[-0.31,-0.22],[-0.7,-0.14],[-0.53,0.02],[-0.68,0.21],[-0.28,0.16],[-0.35,0.54],[-0.15,0.43],[0,0.91],[0.15,0.43],[0.35,0.54],[0.28,0.16],[0.68,0.21],[0.53,0.02],[0.7,-0.14],[0.31,-0.22],[0.4,-0.43],[0.055,-0.32]];
  shape.moveTo(...outline[0] as [number,number]); outline.slice(1).forEach(point => shape.lineTo(...point as [number,number])); shape.closePath();
  const geometry = new ShapeGeometry(shape);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) position.setZ(i, Math.abs(position.getX(i)) * 0.16 + position.getY(i) ** 2 * 0.04);
  geometry.computeVertexNormals(); return geometry;
}
function MapleLeaves({ clock, breeze }: Pick<EnvironmentProps,"clock"|"breeze">) {
  const leaves = useRef<Group>(null);
  const sample = useRef(-1);
  const geometry = useMemo(() => makeLeaf(), []);
  const curves = useMemo(() => [0,1,2].map(i => new CatmullRomCurve3([
    new Vector3(-2.6-i*0.16, 1.5+i*0.4, 1.5+i*0.2),
    new Vector3(-1.5, 2.5+i*0.24, 1.65+i*0.18),
    new Vector3(0.45, 2.85+i*0.16, 1.6+i*0.16),
    new Vector3(1.6+i*0.18, 2.1-i*0.1, 0.9),
    new Vector3(1.9+i*0.15, 1.2, -0.5),
    new Vector3(1.65+i*0.3, 0.15, -1.15),
    new Vector3(1.45+i*0.35, 0.027, -0.9-i*0.2),
  ])), []);
  const point = useMemo(() => new Vector3(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({gl}) => {
    if (!leaves.current) return;
    const time = clock.current % 26;
    leaves.current.children.forEach((leaf, i) => {
      const p = MathUtils.clamp((time - 3.5 - i * 1.1) / (i === 0 ? 15 : 11), 0, 1);
      leaf.visible = time > 3.5 + i * 1.1 && time < 22;
      curves[i].getPoint(p, point); leaf.position.copy(point);
      const settle = MathUtils.smoothstep(p, 0.83, 1);
      const carry = Math.sin(p * Math.PI) * (1 - settle);
      leaf.position.x += breeze.current.x * carry * 0.16;
      leaf.position.z += breeze.current.z * carry * 0.16;
      leaf.rotation.set(MathUtils.lerp(Math.sin(p * 11 + i) * 0.65, -Math.PI / 2, settle), MathUtils.lerp(p * 9, 9, settle) + i, (Math.sin(p * 15 + i) * 0.5 + breeze.current.strength * 0.12) * (1-settle));
      leaf.scale.setScalar(i === 0 ? 0.18 : 0.135);
      const opacity = 1 - MathUtils.smoothstep(time, 19.5, 22);
      leaf.children.forEach(part => {((part as Mesh).material as MeshStandardMaterial).opacity = opacity;});
    });
    if(Math.floor(clock.current * 4) !== sample.current) {
      gl.domElement.dataset.leafPhase = time >= 22 ? "rest" : time > 19 ? "settled" : time > 3.5 ? "drifting" : "rest";
      sample.current = Math.floor(clock.current * 4);
    }
  });
  return <group ref={leaves}>{["#b5693b","#ad4936","#c6964c"].map((color,i)=><group key={color} visible={false}>
    <mesh geometry={geometry} castShadow><meshStandardMaterial color={color} side={DoubleSide} roughness={0.85} transparent depthWrite={false} /></mesh>
    <mesh position={[0,0.13,0.013]}><boxGeometry args={[0.013,1.15,0.008]} /><meshStandardMaterial color="#e0b176" roughness={1} transparent depthWrite={false} /></mesh>
    {[-1,1].map(side=><mesh key={side} position={[side*0.14,0.2,0.035]} rotation={[0,0,side*-0.8]}><boxGeometry args={[0.009,0.48,0.008]} /><meshStandardMaterial color={i ? "#d49c60" : "#deb17a"} roughness={1} transparent depthWrite={false} /></mesh>)}
  </group>)}</group>;
}

export function Atmosphere(props: EnvironmentProps) {
  return <group name="world-atmosphere"><MapleLeaves clock={props.clock} breeze={props.breeze} /></group>;
}
