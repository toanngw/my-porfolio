import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";
import { advanceStory, type CharacterStory, type ActorPose } from "./character-story";
import { HelloBubble } from "./hello-bubble";
import { Coffee } from "./workspace-coffee";
import type { Breeze } from "./breeze";
import { VoxelParts, type Voxel } from "./voxel-parts";

const skin="#dba580", light="#e8b694", shade="#c38b6a", hair="#302c2c", hairLight="#443b35", sage="#587b72", seam="#42665f";
const headParts:Voxel[]=[
 [0,0,0,.62,.57,.51,skin],[0,-.265,-.015,.49,.08,.43,shade],
 [0,.045,-.258,.51,.32,.018,light],
 // Ears, inner ear pixels, cheek planes and a shallow bridge.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.333,-.035,.01,.075,.16,.12,skin],[s*.372,-.025,-.025,.008,.07,.045,shade],[s*.232,-.11,-.263,.105,.09,.015,"#dca080"]]),
 [0,-.035,-.287,.075,.115,.07,skin],[0,-.084,-.314,.105,.045,.04,light],
 // Close cropped jaw line, separated moustache and a warm, smiling lip.
 [0,-.245,-.244,.37,.055,.048,hairLight],[0,-.21,-.265,.27,.042,.025,"#655047"],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.218,-.18,-.25,.065,.13,.035,hairLight],[s*.263,-.13,-.235,.038,.13,.04,hairLight],[s*.062,-.125,-.279,.1,.025,.025,hairLight],[s*.103,-.171,-.282,.025,.02,.018,"#8e5b4d"]]),
 [0,-.179,-.284,.18,.018,.018,"#945f51"],[0,-.197,-.282,.12,.015,.014,light],
 // Intentional stepped hair silhouette, undercut, sideburns and swept fringe.
 [0,.285,.025,.65,.12,.56,hair], [0,.353,.065,.53,.055,.45,hair],
 [-.205,.39,.015,.19,.055,.36,hairLight],[-.07,.395,.065,.13,.04,.36,"#39322e"],
 [.235,.3,.01,.17,.15,.51,hair],[-.27,.255,.02,.12,.18,.52,hair],
 [0,.245,.235,.63,.22,.08,hair],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.295,.1,.065,.045,.23,.39,hair],[s*.28,-.027,-.195,.04,.1,.045,hairLight]]),
 [-.18,.23,-.27,.22,.12,.055,hairLight],[-.035,.265,-.274,.13,.1,.06,hair],[.08,.285,-.27,.12,.08,.06,hair],[.205,.26,-.26,.12,.085,.055,hair],
 [-.24,.18,-.27,.09,.08,.05,hair],
 // Eyebrows sit above the separately animated eyes.
 [-.145,.102,-.273,.14,.028,.025,hair],[.145,.102,-.273,.14,.028,.025,hair],
];
const eyeParts:Voxel[]=[...[-1,1].flatMap((s):Voxel[]=>[[s*.145,0,0,.126,.07,.018,"#f4dfc6"],[s*.132,-.003,-.012,.057,.064,.018,"#352f30"],[s*.132-.012,.015,-.024,.018,.018,.008,"#fff6dc"],[s*.145,-.04,.002,.128,.012,.012,shade]])];
const bodyParts:Voxel[]=[
 [0,1.35,.02,.58,.62,.36,sage],[0,1.65,.045,.48,.12,.4,seam],[0,1.72,-.005,.18,.12,.18,skin],
 [0,1.655,-.187,.24,.07,.05,"#9cbbb0"],[0,1.54,-.176,.014,.22,.014,seam],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.09,1.55,-.19,.015,.15,.014,"#dfd9bd"],[s*.09,1.475,-.19,.024,.025,.024,"#c4b799"],[s*.205,1.14,-.18,.04,.11,.025,seam]]),
 [0,1.15,-.174,.32,.13,.035,"#63867b"],[0,1.08,.02,.57,.06,.37,seam],
 // Seated thighs, trouser hems, ankles and layered sneaker soles.
 ...[-1,1].flatMap((s):Voxel[]=>[
 [s*.16,.95,-.13,.25,.24,.61,"#343d49"],[s*.16,.62,-.37,.23,.55,.24,"#343d49"],
 [s*.16,.6,-.496,.16,.38,.012,"#414c58"],[s*.16,.348,-.37,.24,.06,.25,"#29333f"],
 [s*.16,.27,-.38,.16,.11,.17,"#d9b18d"],[s*.16,.17,-.46,.26,.16,.4,"#e4ddcc"],
 [s*.16,.095,-.47,.28,.055,.43,"#b7c1b9"],[s*.16,.2,-.58,.23,.055,.14,"#f2e9d6"],
 ...[0,1,2].map((i):Voxel=>[s*.16,.258-i*.014,-.46-i*.04,.13,.012,.018,"#fff2d7"]),
 [s*.295,.17,-.44,.014,.045,.12,sage]])
];
const chairParts:Voxel[]=[
 [0,.82,.08,.7,.13,.61,"#bb825f"],[0,1.23,.29,.68,.72,.13,"#bb825f"],
 [0,1.25,.21,.57,.57,.05,"#d6a179"],[0,.45,.12,.09,.65,.09,"#4b5557"],
 [0,.09,.12,.78,.065,.075,"#465255"],[0,.09,.12,.075,.065,.72,"#465255"],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.34,1.05,.05,.07,.33,.07,"#465255"],[s*.34,1.2,-.02,.1,.055,.36,"#bb825f"],[s*.36,.055,.12,.09,.08,.13,"#303e43"],[0,.055,.12+s*.33,.13,.08,.09,"#303e43"]])
];
const handParts:Voxel[]=[[0,0,0,.13,.065,.13,skin],...Array.from({length:4},(_,i):Voxel=>[-.048+i*.032,-.006,-.1,.026,.046,.11,i%2?skin:light]),[.08,-.015,-.025,.045,.05,.08,shade]];
const sleeve:Voxel[]=[[0,-.14,0,.22,.28,.23,sage],[0,-.265,0,.205,.04,.22,seam]];
const forearm:Voxel[]=[[0,0,.14,.17,.17,.28,sage],[0,0,.29,.175,.15,.045,"#86a296"]];

const torsoParts=bodyParts.filter(part=>part[1]>1.04);
const thighParts:Voxel[]=[[0,-.23,0,.25,.46,.24,"#343d49"],[.126,-.23,0,.009,.35,.12,"#414c58"]];
const shinDetails:Voxel[]=bodyParts.filter(p=>p[0]>0&&p[1]>.30&&p[1]<.9).map(([x,y,z,w,h,d,c])=>[x-.16,y-.95,z+.37,w,h,d,c]);
const shinParts:Voxel[]=[[0,-.035,0,.23,.09,.24,"#343d49"],...shinDetails];
const shoeParts:Voxel[]=bodyParts.filter(p=>p[0]>0&&p[1]<.30).map(([x,y,z,w,h,d,c])=>[x-.16,y-.33,z+.37,w,h,d,c]);
const down=new Vector3(0,-1,0),forward=new Vector3(0,0,1);
/** Two-bone solve used by both arms and legs: joints stay connected at every pose. */
function solve(hip:Vector3,target:Vector3,l1:number,l2:number,bend:Vector3,knee:Vector3,direction:Vector3){
 direction.copy(target).sub(hip);const distance=Math.min(l1+l2-.001,Math.max(.01,direction.length()));direction.normalize();target.copy(hip).addScaledVector(direction,distance);
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
 bend.addScaledVector(direction,-bend.dot(direction)).normalize();
 knee.copy(hip).addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
}
function Arm({side,clock,pose,lift}:{side:number;clock:RefObject<number>;pose:ActorPose;lift:RefObject<number>}) {
 const upper=useRef<Group>(null),fore=useRef<Group>(null),hand=useRef<Group>(null);
 const v=useMemo(()=>({shoulder:new Vector3(),elbow:new Vector3(),wrist:new Vector3(),direction:new Vector3(),bend:new Vector3()}),[]);
 useFrame((_,delta)=>{
  if(!upper.current||!fore.current||!hand.current)return;
  const t=clock.current,stand=pose.stand,sip=side===1?lift.current:0,tap=Math.sin(t*12+side*2)*.008*(1-pose.anger);
  v.shoulder.set(side*.33,1.57+stand*.38-pose.walk*.025,0);
  const swing=Math.sin(pose.gait+side*Math.PI/2)*pose.walk;
  v.wrist.set(MathUtils.lerp(side*.16,side*.35,stand),MathUtils.lerp(1.46+tap,1.05,stand)+stand*.38,MathUtils.lerp(-.57,-.04+swing*.24,stand));
  if(sip>0)v.wrist.lerp(v.bend.set(.275,1.80,-.36),sip);
  if(side===1&&pose.wave>0)v.wrist.lerp(v.bend.set(.48,2.47,-.07),pose.wave);
  if(pose.push>0)v.wrist.lerp(v.bend.set(side*.22,2.1-pose.stroke*.65,-.58),pose.push);
  if(pose.anger>0)v.wrist.lerp(v.bend.set(side*.48,(side===1?1.99:1.76)+Math.sin(t*9)*.025,side===1?-.18:-.32),pose.anger);
  v.bend.set(side*.8,-.35,.12);solve(v.shoulder,v.wrist,.32,.34,v.bend,v.elbow,v.direction);
  upper.current.position.copy(v.shoulder);v.direction.copy(v.elbow).sub(v.shoulder);upper.current.scale.y=v.direction.length()/.28;upper.current.quaternion.setFromUnitVectors(down,v.direction.normalize());
  fore.current.position.copy(v.elbow);v.direction.copy(v.wrist).sub(v.elbow);fore.current.scale.z=v.direction.length()/.33;fore.current.quaternion.setFromUnitVectors(forward,v.direction.normalize());
  hand.current.position.copy(v.wrist);hand.current.rotation.set(stand*.6+pose.push*.35,0,side===1?Math.sin(t*10)*pose.wave*.5:0);
  hand.current.rotation.x=MathUtils.damp(hand.current.rotation.x,stand*.6+pose.wave*.8+pose.push*.35+tap*3,12,delta);
 });
 return <><group ref={upper}><VoxelParts parts={sleeve}/></group><group ref={fore}><VoxelParts parts={forearm}/></group><group ref={hand}><VoxelParts parts={handParts}/></group></>;
}
function Leg({side,pose}:{side:number;pose:ActorPose}){
 const thigh=useRef<Group>(null),shin=useRef<Group>(null),shoe=useRef<Group>(null);
 const v=useMemo(()=>({hip:new Vector3(),ankle:new Vector3(),knee:new Vector3(),direction:new Vector3(),bend:new Vector3()}),[]);
 useFrame(()=>{
  if(!thigh.current||!shin.current||!shoe.current)return;
  const phase=((pose.gait/(Math.PI*2)+(side===1?.5:0))%1),swing=phase>.6?Math.sin((phase-.6)/.4*Math.PI):0;
  const stride=phase<.6?-.18+phase/.6*.36:.18-((phase-.6)/.4)*.36;
  v.hip.set(side*.16,.95+pose.stand*.38-pose.walk*.025,0);
  // Stance slides backward in actor coordinates as the root advances; swing lifts only on return.
  const adjust=MathUtils.smoothstep(pose.stand,side===1?.25:0,side===1?1:.75);
  v.ankle.set(side*.16,.2625+swing*.095*pose.walk+Math.sin(adjust*Math.PI)*.07*(1-pose.walk),MathUtils.lerp(-.37,-.035,adjust)+stride*pose.walk);
  v.bend.set(0,0,-1);solve(v.hip,v.ankle,.46,.62,v.bend,v.knee,v.direction);
  thigh.current.position.copy(v.hip);v.direction.copy(v.knee).sub(v.hip);thigh.current.quaternion.setFromUnitVectors(down,v.direction.normalize());
  shin.current.position.copy(v.knee);v.direction.copy(v.ankle).sub(v.knee);shin.current.quaternion.setFromUnitVectors(down,v.direction.normalize());
  shoe.current.position.copy(v.ankle);shoe.current.rotation.x=-swing*.12*pose.walk;
 });
 return <><group ref={thigh} scale={[side,1,1]}><VoxelParts parts={thighParts}/></group><group ref={shin} scale={[side,1,1]}><VoxelParts parts={shinParts}/></group><group ref={shoe} scale={[side,1,1]}><VoxelParts parts={shoeParts}/></group></>;
}
export function DeveloperCharacter({clock,active,breeze,story,reduced,onRelease}:{clock:RefObject<number>;active:boolean;breeze:RefObject<Breeze>;story:RefObject<CharacterStory>;reduced:boolean;onRelease:()=>void}) {
 const root=useRef<Group>(null),head=useRef<Group>(null),eyes=useRef<Group>(null),body=useRef<Group>(null),chair=useRef<Group>(null),bubble=useRef<Group>(null),mug=useRef<Group>(null),lift=useRef(0),reaction=useRef(-100),released=useRef(false);
 const pose=story.current.pose;
 useFrame(({pointer,gl},delta)=>{
  if(active)advanceStory(story.current,Math.min(delta,.05),reduced);
  const state=story.current,t=state.elapsed,p=state.pose;
  if(state.released&&!released.current){released.current=true;onRelease();}
  const c=state.time%24;lift.current=state.phase==='work'?MathUtils.smoothstep(c,13.4,15.3)*(1-MathUtils.smoothstep(c,18,20)):0;
  const greet=Math.max(0,1-(t-reaction.current)/1.4);
  if(root.current){root.current.position.set(p.x,0,p.z);const angle=Math.atan2(Math.sin(p.yaw-root.current.rotation.y),Math.cos(p.yaw-root.current.rotation.y));root.current.rotation.y+=angle*(1-Math.exp(-9*delta));}
  if(chair.current)chair.current.position.z=.64+p.chair*.55;
  if(head.current){
   head.current.rotation.y=MathUtils.damp(head.current.rotation.y,-pointer.x*.12+Math.sin(t*(p.anger?13:.43))*(p.anger?.24:.025),7,delta);
   head.current.rotation.x=MathUtils.damp(head.current.rotation.x,.035+pointer.y*.035-greet*.12+p.push*.12,6,delta);
   head.current.rotation.z=Math.sin(t*.6)*.014+Math.sin(greet*Math.PI*3)*greet*.06+p.anger*Math.sin(t*8)*.04;
  }
  if(body.current){body.current.position.y=p.stand*.38-p.walk*.025+Math.sin(t*1.65)*.004;body.current.rotation.x=p.anger*.035;}
  const blink=t%4.7;if(eyes.current)eyes.current.scale.y=1-MathUtils.smoothstep(blink,0,.075)*(1-MathUtils.smoothstep(blink,.105,.19))*.96;
  if(bubble.current){bubble.current.position.set(p.x,3.25+Math.sin(t*6)*.055,p.z);bubble.current.scale.setScalar(Math.max(.001,p.bubble));bubble.current.visible=p.bubble>.001;}
  if(mug.current){mug.current.position.set(-.65+MathUtils.lerp(.5,.13,lift.current),MathUtils.lerp(1.49,1.80,lift.current),.64+MathUtils.lerp(-.53,-.36,lift.current));mug.current.rotation.x=lift.current*.25;}
  gl.domElement.dataset.characterPhase=state.phase;gl.domElement.dataset.storyTime=state.time.toFixed(2);gl.domElement.dataset.storyElapsed=state.elapsed.toFixed(2);gl.domElement.dataset.reveal=state.reveal.toFixed(3);
 },-2.5);
 return <group name="voxel-developer">
  <group ref={chair} position={[-.65,0,.64]}><VoxelParts parts={chairParts}/></group>
  <group ref={root} position={[-.65,0,.64]}>
   <group ref={body}><VoxelParts parts={torsoParts}/><group ref={head} position={[0,2.025,-.01]} onClick={event=>{if(active&&event.delta<6){event.stopPropagation();reaction.current=story.current.elapsed;}}}><VoxelParts parts={headParts}/><group ref={eyes} position={[0,.025,-.276]}><VoxelParts parts={eyeParts}/></group></group></group>
   <Arm side={-1} clock={clock} pose={pose} lift={lift}/><Arm side={1} clock={clock} pose={pose} lift={lift}/><Leg side={-1} pose={pose}/><Leg side={1} pose={pose}/>
  </group>
  <group ref={bubble} visible={false}><HelloBubble/></group>
  <group ref={mug} position={[-.15,1.49,.11]}><Coffee clock={clock} active={active} breeze={breeze}/></group>
 </group>;
}
