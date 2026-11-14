import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";

/** A real lit surface; cached soft contact shadows sit just above it. */
export function InfiniteGround({ dark }: { dark: boolean }) {
  const material = useMemo(() => {
    const surface = new MeshStandardMaterial({ color: dark ? "#111114" : "#d8d0c2", roughness: 1, transparent: true, depthWrite: false });
    surface.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 groundPosition;\nvarying vec4 groundClip;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\ngroundPosition = position.xy;")
        .replace("#include <project_vertex>", "#include <project_vertex>\ngroundClip = gl_Position;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 groundPosition;\nvarying vec4 groundClip;")
        .replace("#include <opaque_fragment>", "vec2 groundUV = groundClip.xy / groundClip.w * 0.5 + 0.5;\nfloat groundEdge = min(min(groundUV.x, 1.0-groundUV.x), min(groundUV.y, 1.0-groundUV.y));\ndiffuseColor.a *= (1.0 - smoothstep(0.65, 4.2, length(groundPosition))) * smoothstep(0.0, 0.14, groundEdge);\n#include <opaque_fragment>");
    };
    return surface;
  }, [dark]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh name="infinite-ground" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]} material={material}>
    <planeGeometry args={[200, 200]} />
  </mesh>;
}
