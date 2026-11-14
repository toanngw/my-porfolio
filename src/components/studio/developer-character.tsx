import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Vector3, Quaternion } from "three";
import { advanceStory, type CharacterStory, type ActorPose } from "./character-story";
import { SleepLetters } from "./sleep-letters";
import { HelloBubble } from "./hello-bubble";
import { playDeskThump, playFootstep, playHelloGreeting, playKnock, playPageSwoosh, playPaperRustle } from "@/lib/studio-audio";
import { Coffee } from "./workspace-coffee";
import { STATION_CUP, DESK_CUP } from "./coffee-station";
import type { Breeze } from "./breeze";
import { VoxelParts, type Voxel } from "./voxel-parts";

const skin="#dba580", light="#e8b694", shade="#c38b6a", hair="#302c2c", hairLight="#443b35", sage="#587b72", seam="#42665f";
const headParts:Voxel[]=[
 [0,0,0,.62,.57,.51,skin],[0,-.265,-.015,.49,.08,.43,shade],
 [0,.045,-.258,.51,.32,.018,light],
 // Ears with tragus and helix detail.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.333,-.035,.01,.075,.16,.12,skin],[s*.372,-.025,-.025,.008,.07,.045,shade],[s*.355,-.04,-.01,.012,.045,.03,"#c5876a"],[s*.232,-.11,-.263,.105,.09,.015,"#dca080"],[s*.315,.03,-.01,.018,.035,.025,shade]]),
 // Nose: bridge, tip, nostrils, philtrum.
 [0,-.035,-.287,.075,.115,.07,skin],[0,-.084,-.314,.105,.045,.04,light],
 [0,-.025,-.298,.028,.085,.015,light],[0,-.082,-.32,.055,.022,.022,shade],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.038,-.092,-.318,.018,.018,.016,"#c8846a"]]),
 [0,-.115,-.288,.032,.042,.012,shade],
 // Chin cleft and jaw definition.
 [0,-.27,-.22,.08,.025,.03,shade],[0,-.278,-.21,.14,.018,.025,shade],
 // Cheekbones with gentle highlight.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.225,-.06,-.258,.065,.055,.018,"#e8b98a"],[s*.21,-.085,-.272,.04,.035,.012,"#f0c698"]]),
 // Close cropped jaw line, separated moustache and a warm, smiling lip.
 [0,-.245,-.244,.37,.055,.048,hairLight],[0,-.21,-.265,.27,.042,.025,"#655047"],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.218,-.18,-.25,.065,.13,.035,hairLight],[s*.263,-.13,-.235,.038,.13,.04,hairLight],[s*.062,-.125,-.279,.1,.025,.025,hairLight],[s*.103,-.171,-.282,.025,.02,.018,"#8e5b4d"]]),
 [0,-.179,-.284,.18,.018,.018,"#945f51"],[0,-.197,-.282,.12,.015,.014,light],
 // Upper lip bow and corner details.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.055,-.168,-.288,.028,.012,.012,"#c97060"],[s*.155,-.178,-.278,.018,.022,.01,"#b8674e"]]),
 [0,-.195,-.29,.06,.018,.01,"#d47a68"],
 // Intentional stepped hair silhouette, undercut, sideburns and swept fringe.
 [0,.285,.025,.65,.12,.56,hair],[0,.353,.065,.53,.055,.45,hair],
 [-.205,.39,.015,.19,.055,.36,hairLight],[-.07,.395,.065,.13,.04,.36,"#39322e"],
 [.235,.3,.01,.17,.15,.51,hair],[-.27,.255,.02,.12,.18,.52,hair],
 [0,.245,.235,.63,.22,.08,hair],
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.295,.1,.065,.045,.23,.39,hair],[s*.28,-.027,-.195,.04,.1,.045,hairLight]]),
 [-.18,.23,-.27,.22,.12,.055,hairLight],[-.035,.265,-.274,.13,.1,.06,hair],[.08,.285,-.27,.12,.08,.06,hair],[.205,.26,-.26,.12,.085,.055,hair],
 [-.24,.18,-.27,.09,.08,.05,hair],
 // Hair texture strands on top.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.12,.41,.085,.04,.02,.3,"#39322e"],[s*.24,.375,.045,.035,.02,.28,"#2d2828"]]),
 [0,.43,.095,.05,.02,.25,"#3a3030"],
 // Eyebrows: thicker with tail taper and slight arch.
 [-.145,.102,-.273,.14,.028,.025,hair],[.145,.102,-.273,.14,.028,.025,hair],
 [-.19,.098,-.271,.045,.022,.022,hair],[.19,.098,-.271,.045,.022,.022,hair],
 [-.11,.108,-.274,.06,.02,.02,hairLight],[.11,.108,-.274,.06,.02,.02,hairLight],
 // Under-eye shadow and lash line.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.145,-.038,-.278,.13,.008,.01,shade],[s*.145,.038,-.278,.118,.006,.008,hair]]),
];
const eyeParts:Voxel[]=[
 ...[-1,1].flatMap((s):Voxel[]=>[
  [s*.145,0,0,.126,.07,.018,"#f4dfc6"],          // white sclera
  [s*.132,-.003,-.012,.057,.064,.018,"#352f30"],  // iris + pupil
  [s*.132,-.002,-.016,.03,.03,.01,"#28202a"],     // pupil dark center
  [s*.132-.012,.015,-.024,.018,.018,.008,"#fff6dc"],// catchlight
  [s*.132+.008,.018,-.022,.009,.009,.006,"#ffe8b8"],// secondary catchlight
  [s*.145,-.04,.002,.128,.012,.012,shade],         // lower lid
  [s*.145,.04,.001,.12,.01,.01,"#c8956a"],         // upper lid crease
 ])
];
const bodyParts:Voxel[]=[
 // Torso: henley with layered collar, chest seam and ribbed hem.
 [0,1.35,.02,.58,.62,.36,sage],[0,1.65,.045,.48,.12,.4,seam],[0,1.72,-.005,.18,.12,.18,skin],
 // Collar: fold-over with visible inner and button placket.
 [0,1.655,-.187,.24,.07,.05,"#9cbbb0"],[0,1.54,-.176,.014,.22,.014,seam],
 [0,1.71,-.19,.12,.025,.025,"#4a6b63"],[0,1.72,-.196,.055,.018,.018,"#3d5a53"],
 // Button placket with three buttons.
 ...[0,1,2].map((i):Voxel=>[0,1.69-i*.065,-.194,.018,.018,.01,"#8ab5a8"]),
 ...[0,1,2].map((i):Voxel=>[0,1.69-i*.065,-.199,.008,.008,.005,"#2a4a44"]),
 // Chest pocket.
 [-.21,1.56,-.185,.085,.075,.018,"#4f7169"],[-.21,1.595,-.189,.075,.008,.012,"#3d5a53"],
 // Sleeve seams and cuff rings.
 ...[-1,1].flatMap((s):Voxel[]=>[[s*.09,1.55,-.19,.015,.15,.014,"#dfd9bd"],[s*.09,1.475,-.19,.024,.025,.024,"#c4b799"],[s*.205,1.14,-.18,.04,.11,.025,seam],[s*.185,1.08,-.18,.025,.025,.025,"#3d5a53"]]),
 // Lower shirt band and waist hem with contrast stitch.
 [0,1.15,-.174,.32,.13,.035,"#63867b"],[0,1.08,.02,.57,.06,.37,seam],
 [0,1.065,.02,.55,.014,.35,"#4a6b63"],
 // Seated thighs, trouser hems, ankles and layered sneaker soles.
 ...[-1,1].flatMap((s):Voxel[]=>[
 [s*.16,.95,-.13,.25,.24,.61,"#343d49"],[s*.16,.62,-.37,.23,.55,.24,"#343d49"],
 [s*.16,.6,-.496,.16,.38,.012,"#414c58"],[s*.16,.348,-.37,.24,.06,.25,"#29333f"],
 [s*.16,.27,-.38,.16,.11,.17,"#d9b18d"],[s*.16,.17,-.46,.26,.16,.4,"#e4ddcc"],
 // Shoe: tongue tab, toe cap, sole edge.
 [s*.16,.095,-.47,.28,.055,.43,"#b7c1b9"],[s*.16,.2,-.58,.23,.055,.14,"#f2e9d6"],
 [s*.16,.14,-.575,.2,.035,.12,"#d8d4ca"],[s*.16,.085,-.58,.26,.018,.14,"#8a9490"],
 ...[0,1,2].map((i):Voxel=>[s*.16,.258-i*.014,-.46-i*.04,.13,.012,.018,"#fff2d7"]),
 [s*.295,.17,-.44,.014,.045,.12,sage]])
];
const handParts:Voxel[]=[[0,0,0,.13,.065,.13,skin],...Array.from({length:4},(_,i):Voxel=>[-.048+i*.032,-.006,-.1,.026,.046,.11,i%2?skin:light]),[.08,-.015,-.025,.045,.05,.08,shade]];
const sleeve:Voxel[]=[[0,-.14,0,.22,.28,.23,sage],[0,-.265,0,.205,.04,.22,seam]];
const forearm:Voxel[]=[[0,0,.14,.17,.17,.28,sage],[0,0,.29,.175,.15,.045,"#86a296"]];
// Watch sits on the left forearm, just clear of the sleeve cuff.
const watchedForearm:Voxel[]=[...forearm,[0,0,.255,.185,.185,.055,"#3a4048"],[0,.098,.255,.05,.012,.05,"#c8bfb0"],[0,.104,.255,.038,.008,.038,"#1a2228"]];
const torsoParts=bodyParts.filter(part=>part[1]>1.04);
const thighParts:Voxel[]=[[0,-.23,0,.25,.46,.24,"#343d49"],[.126,-.23,0,.009,.35,.12,"#414c58"]];
const shinDetails:Voxel[]=bodyParts.filter(p=>p[0]>0&&p[1]>.30&&p[1]<.9).map(([x,y,z,w,h,d,c])=>[x-.16,y-.95,z+.37,w,h,d,c]);
const shinParts:Voxel[]=[[0,-.035,0,.23,.09,.24,"#343d49"],...shinDetails];
const shoeParts:Voxel[]=bodyParts.filter(p=>p[0]>0&&p[1]<.30).map(([x,y,z,w,h,d,c])=>[x-.16,y-.33,z+.37,w,h,d,c]);
const down=new Vector3(0,-1,0),forward=new Vector3(0,0,1);
const HIP=1.03,SCOOT=.38;
const pelvisParts:Voxel[]=[[0,1.015,.015,.52,.19,.32,"#343d49"]];
const headCorners=headParts.flatMap(([x,y,z,w,h,d])=>[-1,1].flatMap(sx=>[-1,1].flatMap(sy=>[-1,1].map(sz=>new Vector3(x+sx*w/2,y+sy*h/2,z+sz*d/2)))));
/** Two-bone solve used by both arms and legs: joints stay connected at every pose. */
function solve(hip:Vector3,target:Vector3,l1:number,l2:number,bend:Vector3,knee:Vector3,direction:Vector3){
 direction.copy(target).sub(hip);const distance=Math.min(l1+l2-.001,Math.max(.01,direction.length()));direction.normalize();target.copy(hip).addScaledVector(direction,distance);
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
 bend.addScaledVector(direction,-bend.dot(direction)).normalize();
 knee.copy(hip).addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
}
function Arm({side,clock,pose,lift,body,coffeeHand}:{side:number;clock:RefObject<number>;pose:ActorPose;lift:RefObject<number>;body:RefObject<Group|null>;coffeeHand?:RefObject<Group|null>}) {
 const upper=useRef<Group>(null),fore=useRef<Group>(null),hand=useRef<Group>(null),fingers=useRef<Group>(null);
 const v=useMemo(()=>({shoulder:new Vector3(),elbow:new Vector3(),wrist:new Vector3(),direction:new Vector3(),bend:new Vector3(),inverse:new Quaternion()}),[]);
 useFrame((_,delta)=>{
  if(!upper.current||!fore.current||!hand.current)return;
  const t=clock.current,stand=pose.stand,sip=side===1?lift.current:0,tap=Math.sin(t*12+side*2)*.008*(1-pose.stare)*(1-pose.pullReach);
  v.shoulder.set(side*.33,1.57,0);
  const swing=Math.sin(pose.gait+side*Math.PI/2)*pose.walk;
  v.wrist.set(MathUtils.lerp(side*.16,side*.35,stand),MathUtils.lerp(1.46+tap,1.05,stand),MathUtils.lerp(-.57,-.04+swing*.24,stand));
  if(sip>0)v.wrist.lerp(v.bend.set(.275,1.80,-.36),sip);
  if(side===1&&pose.coffeeReach>0){
   const target=pose.coffeePlace>0?DESK_CUP:STATION_CUP;
   const yaw=body.current?.parent?.rotation.y??pose.yaw;
   const dx=target[0]-pose.x,dz=target[2]-pose.z,cos=Math.cos(yaw),sin=Math.sin(yaw);
   v.bend.set(cos*dx-sin*dz,target[1]-(stand*.38-.78*(1-stand))-.02,sin*dx+cos*dz+.08);
   v.bend.lerp(v.direction.set(.33,1.55+pose.coffeeToast*.25,-.38),pose.coffeeCarry);
   v.wrist.lerp(v.bend,pose.coffeeReach);
  }
  if(side===1&&pose.wave>0)v.wrist.lerp(v.bend.set(.48,2.10,-.07),pose.wave);
  if(side===1&&pose.pullReach>0){
   // Reach sideways, grip the offscreen page, and draw it toward the torso.
   const lift=pose.pullLift;
   v.wrist.lerp(v.bend.set(.85-lift*.6,1.55,-.12-lift*.3),pose.pullReach);
  }
  if(pose.sleep>0)v.wrist.lerp(v.bend.set(side*.22,1.3,-.27),pose.sleep);
  if(pose.anger>0)v.wrist.lerp(v.bend.set(side*.48,(side===1?2.08:1.94)+Math.sin(t*9)*.025,side===1?-.18:-.32),pose.anger);
  // Knocking fist near the face, thrusting toward the door on each strike.
  if(side===1&&pose.knock>0)v.wrist.lerp(v.bend.set(.1,1.9+pose.knockImpact*.06,-.42-pose.knockImpact*.16),pose.knock);
  // Left hand reaches the handle, then pushes the leaf away from the visitor.
  if(side===-1&&pose.push>0)v.wrist.lerp(v.bend.set(-.14,1.2+.04*pose.push,-.42-pose.push*.24),pose.push);
  // A cheerful lift of both arms while airborne.
  if(pose.hopArms>0)v.wrist.lerp(v.bend.set(side*.3,1.62+pose.hopArms*.18,-.12),pose.hopArms*.7);
  if(pose.bonk>0&&body.current){
   v.bend.set(side*.38,1.425,-.45).sub(body.current.position).applyQuaternion(v.inverse.copy(body.current.quaternion).invert());v.bend.y+=HIP;v.wrist.lerp(v.bend,pose.bonk);
  }
  v.bend.set(side*.8,-.35,.12);solve(v.shoulder,v.wrist,.32,.34,v.bend,v.elbow,v.direction);
  upper.current.position.copy(v.shoulder);v.direction.copy(v.elbow).sub(v.shoulder);upper.current.scale.y=v.direction.length()/.28;upper.current.quaternion.setFromUnitVectors(down,v.direction.normalize());
  fore.current.position.copy(v.elbow);v.direction.copy(v.wrist).sub(v.elbow);fore.current.scale.z=v.direction.length()/.33;fore.current.quaternion.setFromUnitVectors(forward,v.direction.normalize());
  if(fingers.current)fingers.current.rotation.x=side===1?-Math.max(pose.pullGrip,pose.coffeeGrip,pose.knock)*1.18:side===-1?-pose.push*.5:0;
  hand.current.position.copy(v.wrist);hand.current.rotation.set(stand*.6+(side===1?pose.pullReach*.8:0)+pose.knock*.45,0,side===1?Math.sin(t*10)*pose.wave*.5:0);
  if(pose.bonk>.8&&body.current)hand.current.quaternion.copy(v.inverse.copy(body.current.quaternion).invert());
  else hand.current.rotation.x=MathUtils.damp(hand.current.rotation.x,stand*.6+pose.wave*.8+tap*3+(side===1?pose.pullReach*.8+pose.knock*.45:0),12,delta);
  if(coffeeHand)coffeeHand.current=hand.current;
 });
 return <><group ref={upper}><VoxelParts parts={sleeve}/></group><group ref={fore}><VoxelParts parts={side===-1?watchedForearm:forearm}/></group><group ref={hand}>
   <VoxelParts parts={[handParts[0],handParts[5]]}/>
   <group ref={fingers} position={[0,0,-.055]}><group position={[0,0,.055]}><VoxelParts parts={handParts.slice(1,5)}/></group></group>
  </group></>;
}
function Leg({side,pose}:{side:number;pose:ActorPose}){
 const thigh=useRef<Group>(null),shin=useRef<Group>(null),shoe=useRef<Group>(null);
 const v=useMemo(()=>({hip:new Vector3(),ankle:new Vector3(),knee:new Vector3(),direction:new Vector3(),bend:new Vector3()}),[]);
 useFrame(()=>{
  if(!thigh.current||!shin.current||!shoe.current)return;
  const phase=((pose.gait/(Math.PI*2)+(side===1?.5:0))%1),swing=phase>.6?Math.sin((phase-.6)/.4*Math.PI):0;
  const stride=phase<.6?-.18+phase/.6*.36:.18-((phase-.6)/.4)*.36;
  v.hip.set(side*.16,.95+pose.stand*.38-.78*(1-pose.stand)-pose.walk*.025-pose.crouch*.16,pose.bonk*SCOOT);
  // Stance slides backward in actor coordinates as the root advances; swing lifts only on return.
  const adjust=MathUtils.smoothstep(pose.stand,side===1?.25:0,side===1?1:.75);
  v.ankle.set(side*.16,.2625+swing*.095*pose.walk+Math.sin(adjust*Math.PI)*.07*(1-pose.walk)+pose.tuck*.3,MathUtils.lerp(-.37,-.035,adjust)+stride*pose.walk+pose.tuck*.2);
  const seated=1-pose.stand;
  v.ankle.x=MathUtils.lerp(v.ankle.x,-side*.12,seated);
  v.ankle.z=MathUtils.lerp(v.ankle.z,-.65,seated);
  v.ankle.y=MathUtils.lerp(v.ankle.y,.24,seated);
  v.bend.set(side*seated,.2*seated,-1+seated*.8);solve(v.hip,v.ankle,.46,.62,v.bend,v.knee,v.direction);
  thigh.current.position.copy(v.hip);v.direction.copy(v.knee).sub(v.hip);thigh.current.quaternion.setFromUnitVectors(down,v.direction.normalize());
  shin.current.position.copy(v.knee);v.direction.copy(v.ankle).sub(v.knee);shin.current.quaternion.setFromUnitVectors(down,v.direction.normalize());
  shoe.current.position.copy(v.ankle);shoe.current.rotation.x=-swing*.12*pose.walk;
 });
 return <><group ref={thigh} scale={[side,1,1]}><VoxelParts parts={thighParts}/></group><group ref={shin} scale={[side,1,1]}><VoxelParts parts={shinParts}/></group><group ref={shoe} scale={[side,1,1]}><VoxelParts parts={shoeParts}/></group></>;
}
export function DeveloperCharacter({clock,active,breeze,story,reduced,onRelease,running=true}:{clock:RefObject<number>;active:boolean;breeze:RefObject<Breeze>;story:RefObject<CharacterStory>;reduced:boolean;onRelease:()=>void;running?:boolean}) {
 const root=useRef<Group>(null),head=useRef<Group>(null),eyes=useRef<Group>(null),body=useRef<Group>(null),pelvis=useRef<Group>(null),bubble=useRef<Group>(null),swear=useRef<Group>(null),coffeeHand=useRef<Group>(null);
 const lift=useRef(0),reaction=useRef(-100),released=useRef(false),lastImpact=useRef(-1),helloOpacity=useRef(0),swearOpacity=useRef(0),corner=useRef(new Vector3());
 const cues=useRef({key:"",fired:new Set<string>(),knocks:0,step:0});
 const pose=story.current.pose;
 const helloPlayed=useRef(false);
 const greetingVisit=useRef(story.current.greetingVisit);
 const helloAttempt=useRef({requested:false,pending:false});
 const greetVisitor=useCallback(()=>{
  if(helloPlayed.current||helloAttempt.current.pending)return;
  const visit=greetingVisit.current;
  helloAttempt.current.pending=true;
  void playHelloGreeting().then(played=>{
   if(visit!==greetingVisit.current)return;
   helloPlayed.current=played;helloAttempt.current.pending=false;
   // Show the greeting again if audio was blocked until after the welcome wave.
   if(played&&story.current.phase!=='wave')reaction.current=story.current.elapsed;
  });
 },[story]);
 useEffect(()=>{
  const retry=()=>{
   if(active&&helloAttempt.current.requested)greetVisitor();
  };
  // Resume directly inside a completed tap or keyboard gesture, including on iOS.
  window.addEventListener('click',retry);
  window.addEventListener('keydown',retry);
  return()=>{window.removeEventListener('click',retry);window.removeEventListener('keydown',retry);};
 },[active,greetVisitor]);
 useFrame(({pointer,gl},delta)=>{
  if(active&&running)advanceStory(story.current,Math.min(delta,.1),reduced);
  const state=story.current,t=state.elapsed,p=state.pose;
  gl.domElement.dataset.storyPhase=state.phase;
  gl.domElement.dataset.storyReveal=state.reveal.toFixed(3);
  if(active&&greetingVisit.current!==state.greetingVisit){
   greetingVisit.current=state.greetingVisit;
   helloPlayed.current=false;
   helloAttempt.current={requested:false,pending:false};
   reaction.current=-100;
   released.current=false;
   lastImpact.current=-1;
  }
  if(state.released&&!released.current){released.current=true;onRelease();}
  if(state.phase==='bonk'&&state.time>=.55&&lastImpact.current!==state.cycle){lastImpact.current=state.cycle;playDeskThump();}
  // Keep a blocked welcome pending beyond the wave; reduced motion still gets a hello.
  if(active&&running&&!helloAttempt.current.requested&&((state.phase==='wave'||state.phase==='coffee-toast')&&p.bubble>.15||state.skipped)){
   helloAttempt.current.requested=true;
   if(state.skipped)reaction.current=t;
   greetVisitor();
  }
  // Soft walking, knocking and paper cues driven by the story, once per phase.
  if(active&&running){
   const key=`${state.greetingVisit}:${state.phase}`;
   const mark=(name:string)=>{if(cues.current.key!==key){cues.current.key=key;cues.current.fired.clear();}if(cues.current.fired.has(name))return false;cues.current.fired.add(name);return true;};
   const step=Math.floor(p.gait/Math.PI);
   if(p.walk>.25&&p.walk<.95){if(cues.current.key!==key||cues.current.step!==step){cues.current.step=step;playFootstep(p.walk*.7);}}
   if(state.phase==='door-hop'){
    if(mark('launch'))playPageSwoosh();
    if(state.time>.72&&mark('land'))playDeskThump();
   }
   if(state.phase==='door-knock'&&state.door.knocks>cues.current.knocks){cues.current.knocks=state.door.knocks;playKnock();}
   if(state.phase==='door-open'&&state.door.opening&&mark('latch')){playKnock();}
   if(state.phase==='pull-reach'&&state.time>.55&&mark('grip'))playPaperRustle();
   if(state.phase==='pull-lift'&&mark('lift'))playPageSwoosh();
  }
  const c=state.time%24;lift.current=state.phase==='settle'&&!reduced?MathUtils.smoothstep(c,.15,.85)*(1-MathUtils.smoothstep(c,1.35,2.3)):state.phase==='work'?MathUtils.smoothstep(c,13.4,15.3)*(1-MathUtils.smoothstep(c,18,20)):0;
  const greet=Math.max(0,1-(t-reaction.current)/1.4),height=p.stand*.38-.78*(1-p.stand)-p.walk*.025-p.crouch*.1;
  if(greet>0){p.bubble=Math.max(p.bubble,Math.sin(greet*Math.PI));if(state.phase==='work'&&!reduced)p.wave=Math.max(p.wave,Math.sin(greet*Math.PI));}
  if(root.current){root.current.visible=running||state.entry==='door';root.current.position.set(p.x,p.hop+.36*p.sleep,p.z);root.current.rotation.z=p.sleep*Math.PI/2;const angle=Math.atan2(Math.sin(p.yaw-root.current.rotation.y),Math.cos(p.yaw-root.current.rotation.y));root.current.rotation.y=running?root.current.rotation.y+angle*(1-Math.exp(-9*delta)):p.yaw;}
  if(pelvis.current)pelvis.current.position.set(0,height,p.bonk*SCOOT);
  if(head.current){
   const attention=p.pullReach;
   head.current.rotation.y=MathUtils.damp(head.current.rotation.y,-pointer.x*.12*(1-p.stare)*(1-p.pullReach)+Math.sin(t*.43)*.025*(1-p.stare)-attention*.18+Math.sin(t*11)*p.shake*.24,14,delta);
   head.current.rotation.x=MathUtils.damp(head.current.rotation.x,(.035+pointer.y*.035-greet*.12)*(1-p.stare)-p.bonk*1.16+attention*(.12-p.pullLift*.32),18,delta);
   head.current.rotation.z=Math.sin(t*.6)*.014*(1-p.stare)+Math.sin(greet*Math.PI*3)*greet*.06+p.shake*Math.sin(t*8)*.025;
  }
  if(body.current){
   body.current.position.set(0,HIP+height+Math.sin(t*1.65)*.004*(1-p.stare),p.bonk*SCOOT);
   body.current.rotation.x=MathUtils.damp(body.current.rotation.x,-p.bonk*.76+p.pullReach*.045*(1-p.pullLift),18,delta);
   body.current.rotation.y=MathUtils.damp(body.current.rotation.y,-p.pullReach*.12,14,delta);
   // Keep every sculpted head voxel above the actual desk/mat/keyboard surfaces.
   // This contact correction uses the current joint transforms, not a camera trick.
   if(p.bonk>.2&&head.current){
    let correction=0;
    for(const vertex of headCorners){
     const v=corner.current.copy(vertex).applyEuler(head.current.rotation).add(head.current.position);v.y-=HIP;v.applyEuler(body.current.rotation).add(body.current.position);v.x+=p.x;v.z+=p.z;
     if(v.x> -1.45&&v.x<.49&&v.z>-.66&&v.z<.385){
      const keyboard=v.x>-.99&&v.x<-.31&&v.z>-.22&&v.z<.115;
      correction=Math.max(correction,(keyboard?1.463:1.425)-v.y);
     }
    }
    body.current.position.y+=Math.max(0,correction);
   }
  }
  const blink=t%4.7;if(eyes.current)eyes.current.scale.y=(1-MathUtils.smoothstep(blink,0,.075)*(1-MathUtils.smoothstep(blink,.105,.19))*.96)*(1-p.stare*.12)*(1-.96*p.sleep);
  helloOpacity.current=p.bubble;swearOpacity.current=p.swear;
  if(bubble.current){bubble.current.position.set(p.x,3.25+Math.sin(t*6)*.055,p.z);bubble.current.scale.setScalar(Math.max(.001,p.bubble));bubble.current.visible=p.bubble>.001;}
  if(swear.current){swear.current.position.set(p.x,2.92+Math.sin(t*7)*.045,p.z);swear.current.scale.setScalar(1+Math.sin(t*8)*.025);swear.current.visible=p.swear>.001;}
  gl.domElement.dataset.characterPhase=state.phase;gl.domElement.dataset.storyTime=state.time.toFixed(2);gl.domElement.dataset.storyElapsed=state.elapsed.toFixed(2);gl.domElement.dataset.reveal=state.reveal.toFixed(3);gl.domElement.dataset.bonk=p.bonk.toFixed(3);
 },-2.5);
 return <group name="voxel-developer">
  <group ref={root} position={[-.65,0,.64]}>
   <group ref={pelvis}><VoxelParts parts={pelvisParts}/></group>
   <group ref={body} position={[0,HIP,0]}><group position={[0,-HIP,0]}>
    <VoxelParts parts={torsoParts}/><group ref={head} position={[0,2.025,-.01]} onClick={event=>{if(active&&event.delta<6){event.stopPropagation();reaction.current=story.current.elapsed;void playHelloGreeting();}}}><VoxelParts parts={headParts}/><group ref={eyes} position={[0,.025,-.276]}><VoxelParts parts={eyeParts}/></group></group>
    <Arm side={-1} clock={clock} pose={pose} lift={lift} body={body}/><Arm side={1} clock={clock} pose={pose} lift={lift} body={body} coffeeHand={coffeeHand}/>
   </group></group>
   <Leg side={-1} pose={pose}/><Leg side={1} pose={pose}/>
  </group>
  <group ref={bubble} visible={false}><HelloBubble opacity={helloOpacity}/></group>
  <group ref={swear} visible={false}><HelloBubble kind="frustrated" opacity={swearOpacity}/></group>
  <SleepLetters story={story} head={head} active={active&&!reduced}/>
  <CarriedCoffee clock={clock} active={active} breeze={breeze} story={story} hand={coffeeHand} lift={lift}/>
 </group>;
}

function CarriedCoffee({clock,active,breeze,story,hand,lift}:{clock:RefObject<number>;active:boolean;breeze:RefObject<Breeze>;story:RefObject<CharacterStory>;hand:RefObject<Group|null>;lift:RefObject<number>}){
 const cup=useRef<Group>(null),point=useRef(new Vector3());
 useFrame(({gl})=>{
  if(!cup.current)return;
  const s=story.current,p=s.pose,atDesk=s.coffee.atDesk||s.phase==='coffee-place';
  cup.current.visible=s.entry!=='door'||s.door.handoff>0||!s.phase.startsWith('door-');
  cup.current.position.fromArray(atDesk?DESK_CUP:STATION_CUP);
  if(hand.current&&p.coffeeGrip>0){
   point.current.set(0,.02,-.08);hand.current.localToWorld(point.current);cup.current.parent?.worldToLocal(point.current);
   cup.current.position.lerp(point.current,p.coffeeGrip);
  }else if(atDesk&&s.phase==='work'){
   cup.current.position.set(-.65+MathUtils.lerp(.5,.13,lift.current),MathUtils.lerp(.71,1.02,lift.current),.64+MathUtils.lerp(-.53,-.36,lift.current));
  }
  cup.current.rotation.x=atDesk?lift.current*.25:0;
  gl.domElement.dataset.coffeeLocation=p.coffeeGrip>.99?'hand':atDesk?'desk':'machine';
  gl.domElement.dataset.coffeePosition=cup.current.position.toArray().map(n=>n.toFixed(3)).join(',');
 });
 return <group ref={cup} position={[...STATION_CUP]}><Coffee clock={clock} active={active} breeze={breeze} story={story}/></group>;
}
