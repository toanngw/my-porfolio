import { MathUtils } from "three";

/** One world-space breeze drives strokes, leaves, steam, and suspended details. */
export type Breeze = { strength: number; phase: number; x: number; z: number };
export function sampleBreeze(time: number, target: Breeze) {
  const phase = time % 26;
  const strength = MathUtils.smoothstep(phase, 2, 6) * (1 - MathUtils.smoothstep(phase, 12, 17));
  target.phase = phase;
  target.strength = strength;
  target.x = strength * (0.88 + Math.sin(time * 0.7) * 0.12);
  target.z = strength * -0.22;
}
