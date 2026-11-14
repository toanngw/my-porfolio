import type { EntryExperience } from "@/lib/entry-experience";

/** One state machine owns the actor and page reveal; camera input is independent. */
export type StoryPhase='door-idle'|'door-hop'|'door-walk-out'|'door-walk-front'|'door-knock'|'door-wait'|'door-open'|'door-exit'|'coffee-brew'|'coffee-enter'|'coffee-pickup'|'coffee-toast'|'coffee-return-front'|'coffee-return-side'|'coffee-place'|'coffee-sit'|'settle'|'stand'|'exit'|'approach'|'wave'|'return-front'|'return-side'|'sit'|'pull-reach'|'pull-lift'|'pull-release'|'work'|'stare'|'exclaim'|'hands-up'|'bonk'|'recover'|'frustrated'|'break-stand'|'wander-out'|'wander-front'|'calm'|'wander-back'|'wander-home'|'break-sit';
export type ActorPose={coffeeReach:number;coffeeCarry:number;coffeeToast:number;coffeeGrip:number;coffeePlace:number;x:number;z:number;yaw:number;stand:number;gait:number;walk:number;wave:number;pullReach:number;pullLift:number;pullGrip:number;anger:number;stare:number;shake:number;bonk:number;impact:number;bubble:number;swear:number;chair:number;knock:number;knockImpact:number;push:number;hop:number;crouch:number;tuck:number;hopArms:number;follow:number};
export type DoorState={progress:number;answered:boolean;opening:boolean;done:boolean;handoff:number;knocks:number;strike:number;impact:number;presence:number};
export type CharacterStory={entry:EntryExperience;door:DoorState;coffee:{progress:number;brewing:boolean;atDesk:boolean};phase:StoryPhase;time:number;elapsed:number;cycle:number;greetingVisit:number;started:boolean;skipped:boolean;released:boolean;reveal:number;pose:ActorPose};
export function createStory(entry:EntryExperience='coffee'):CharacterStory{return {entry,door:{progress:0,answered:false,opening:false,done:false,handoff:0,knocks:0,strike:0,impact:0,presence:0},coffee:{progress:0,brewing:false,atDesk:false},phase:entry==='door'?'door-idle':'coffee-enter',time:0,elapsed:0,cycle:0,greetingVisit:0,started:false,skipped:false,released:false,reveal:0,pose:{coffeeReach:0,coffeeCarry:0,coffeeToast:0,coffeeGrip:0,coffeePlace:0,x:entry==='door'?-.65:3.65,z:entry==='door'?.64:-1.85,yaw:entry==='door'?Math.PI/2:Math.PI/2,stand:entry==='door'?0:1,gait:0,walk:0,wave:0,pullReach:0,pullLift:0,pullGrip:0,anger:0,stare:0,shake:0,bonk:0,impact:0,bubble:0,swear:0,chair:0,knock:0,knockImpact:0,push:0,hop:0,crouch:0,tuck:0,hopArms:0,follow:0}};}
export function restartStory(s:CharacterStory){
 const next=createStory(s.entry),pose=s.pose,greetingVisit=s.greetingVisit+1;
 // Arms and legs hold this pose object, so keep its identity across visits.
 Object.assign(pose,next.pose);Object.assign(s,next,{pose,greetingVisit});
}
export const ease=(n:number)=>{const x=Math.max(0,Math.min(1,n));return x*x*(3-2*x);};
const smoother=(n:number)=>{const x=Math.max(0,Math.min(1,n));return x*x*x*(x*(x*6-15)+10);};
export function updateCoffee(s:{readonly current:CharacterStory},update:Partial<CharacterStory['coffee']>){Object.assign(s.current.coffee,update);}
export function answerDoor(s:{readonly current:CharacterStory}){s.current.door.answered=true;}
const sequence:StoryPhase[]=['coffee-enter','coffee-pickup','coffee-toast','coffee-return-front','coffee-return-side','coffee-place','coffee-sit','work','stare','exclaim','hands-up','bonk','recover','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'];
const doorLead:StoryPhase[]=['door-idle','door-hop','door-walk-out','door-walk-front','door-knock','door-wait','door-open','door-exit','coffee-enter','coffee-brew','coffee-pickup','coffee-return-front','coffee-return-side','coffee-place','exit','approach','wave','pull-reach','pull-lift','pull-release'];
const doorSequence:StoryPhase[]=[...doorLead,'return-front','return-side','sit',...sequence.slice(7)];
const duration:Record<StoryPhase,number>={'door-idle':.7,'door-hop':1.15,'door-walk-out':.7,'door-walk-front':.95,'door-knock':1.7,'door-wait':1.95,'door-open':1.75,'door-exit':1.1,'coffee-brew':2.2,'coffee-enter':1.35,'coffee-pickup':.95,'coffee-toast':1.1,'coffee-return-front':2,'coffee-return-side':1.65,'coffee-place':1.2,'coffee-sit':.8,settle:2.4,stand:1.3,exit:2.1,approach:1.85,wave:2.1,'return-front':1.85,'return-side':2.1,sit:1.2,'pull-reach':.9,'pull-lift':1.8,'pull-release':.95,work:24,stare:.9,exclaim:1.35,'hands-up':1.1,bonk:1.15,recover:1.65,frustrated:1.3,'break-stand':1.4,'wander-out':2.4,'wander-front':2.2,calm:2.4,'wander-back':2.2,'wander-home':2.4,'break-sit':1.4};
 export function skipStory(s:CharacterStory){s.skipped=true;s.coffee.atDesk=true;s.coffee.progress=1;s.coffee.brewing=false;s.released=true;s.reveal=1;s.phase='work';s.time=0;s.started=true;if(s.entry==='door')Object.assign(s.door,{progress:1,answered:true,opening:true,done:true,handoff:1});}
export function advanceStory(s:CharacterStory,dt:number,reduced:boolean){
 if(!s.started)s.started=true;
 s.elapsed+=dt;s.time+=dt;
 let length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 // The welcome plays once per page load; reduced motion suppresses the idle cycle.
 if(reduced&&s.released&&s.phase!=='work')skipStory(s);
 // Answering the door cuts the wait short instead of finishing the full beat.
 const answeredEarly=s.entry==='door'&&s.door.answered&&!s.door.opening&&(s.phase==='door-wait'||(s.phase==='door-knock'&&s.time>length*.5));
 if(s.time>=length||answeredEarly){
  s.time=answeredEarly?0:s.time-length;
  if(s.phase==='break-sit'){s.phase='work';s.cycle++;}
  else if(s.phase==='work'&&reduced)s.time=0;
  else if(s.entry==='door'&&s.phase.startsWith('door-'))s.phase=nextDoorPhase(s);
  else {const timeline=s.entry==='door'?doorSequence:sequence;s.phase=timeline[timeline.indexOf(s.phase)+1]??'work';}
  length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 }
 const p=s.pose,u=ease(s.time/length);
 Object.assign(p,{coffeeReach:0,coffeeCarry:0,coffeeToast:0,coffeeGrip:0,coffeePlace:0,x:-.65,z:.64,yaw:0,stand:0,walk:0,wave:0,pullReach:0,pullLift:0,pullGrip:0,anger:0,stare:0,shake:0,bonk:0,impact:0,bubble:0,swear:0,chair:0,knock:0,knockImpact:0,push:0,hop:0,crouch:0,tuck:0,hopArms:0,follow:0});
 const walking=(x1:number,z1:number,x2:number,z2:number)=>{
  p.x=x1+(x2-x1)*u;p.z=z1+(z2-z1)*u;p.yaw=Math.atan2(-(x2-x1),-(z2-z1));p.stand=1;
  p.walk=ease(s.time/.25)*ease((length-s.time)/.25);
  p.gait+=Math.hypot(x2-x1,z2-z1)*6*(s.time/length)*(1-s.time/length)/length*dt*10.5;p.chair=1;
 };
 // A visitor waits outside: he hops off the chair, walks to the door, and knocks.
 if(s.entry==='door'&&s.phase.startsWith('door-'))doorBeat(s,reduced,length,u);
 // The IVL is collected before the camera follows the actor home.
 if(s.phase==='coffee-enter')walking(s.entry==='door'?1.1:3.65,s.entry==='door'?-.94:-1.85,1,-1.85);
 if(s.phase==='coffee-brew'){
  p.x=1;p.z=-1.85;p.yaw=-Math.PI/2;p.stand=1;p.chair=1;
  p.coffeeReach=ease(s.time/.35)*ease((length-s.time)/.35);
  s.coffee.progress=u;s.coffee.brewing=s.time<length-.1;
 }
 if(s.phase==='coffee-pickup')s.coffee.brewing=false;
 if(s.phase==='coffee-pickup'||s.phase==='coffee-toast'){
  p.x=1;p.z=-1.85;p.yaw=-Math.PI/2;p.stand=1;p.chair=1;
  if(s.phase==='coffee-pickup'){
   p.coffeeReach=ease(s.time/.35);p.coffeeGrip=ease((s.time-.35)/.25);p.coffeeCarry=ease((s.time-.6)/.35);
  }else{
   p.yaw=-Math.PI/2+(Math.PI/2-.45)*ease(s.time/.45);
   p.coffeeReach=1;p.coffeeGrip=1;p.coffeeCarry=1;
   p.coffeeToast=ease(s.time/.3)*ease((length-s.time)/.3);p.bubble=p.coffeeToast;
  }
 }
 if(s.phase==='coffee-return-front')walking(1,-1.85,1.1,.72);
 if(s.phase==='coffee-return-side')walking(1.1,.72,-.65,.64);
 if(s.phase==='coffee-return-front'||s.phase==='coffee-return-side'){p.coffeeReach=1;p.coffeeGrip=1;p.coffeeCarry=1;}
 if(s.phase==='coffee-place'){
  p.stand=s.entry==='door'?1:1-.35*ease(s.time/.35);p.chair=1;p.coffeeReach=1;p.coffeePlace=ease(s.time/.6);p.coffeeCarry=1-p.coffeePlace;
  p.coffeeGrip=1-ease((s.time-.85)/.25);
  if(s.time>=.85)s.coffee.atDesk=true;
 }
 if(s.phase==='coffee-sit'){
  p.stand=.65*(1-u);p.chair=1-u;s.reveal=u;
  if(s.time>length-.08)s.released=true;
 }
 if(s.phase==='stand'||s.phase==='break-stand'){p.stand=u;p.chair=u;}
 if(s.phase==='exit'||s.phase==='wander-out')walking(-.65,.64,1.10,.72);
 if(s.phase==='approach'||s.phase==='wander-front')walking(1.10,.72,1.10,-.94);
 if(s.phase==='wave'||s.phase==='calm'){
  p.x=1.1;p.z=-.94;p.stand=1;p.chair=1;p.yaw=s.phase==='wave'?-.65:-.25;
  if(s.phase==='wave'){p.wave=ease(s.time/.35)*ease((length-s.time)/.3);p.bubble=ease(s.time/.2)*ease((length-s.time)/.25);}
 }
 if(s.phase==='return-front'||s.phase==='wander-back')walking(1.10,-.94,1.10,.72);
 if(s.phase==='return-side'||s.phase==='wander-home')walking(1.10,.72,-.65,.64);
 if(s.phase==='sit'||s.phase==='break-sit'){p.stand=1-u;p.chair=1-u;p.yaw=Math.PI/2*(1-u);}
 // Reach down, grasp the page edge, and lift it with the same progress as the wrist.
 if(s.phase.startsWith('pull-')){
  p.x=1.1;p.z=-.94;p.yaw=-.65;p.stand=1;p.chair=1;
  if(s.phase==='pull-reach'){
   p.pullReach=ease(s.time/.65);p.pullGrip=ease((s.time-.55)/.35);
  }else if(s.phase==='pull-lift'){
   p.pullReach=1;p.pullGrip=1;p.pullLift=u;s.reveal=u;
  }else{
   p.pullReach=1-u;p.pullLift=1;p.pullGrip=1-ease(s.time/.3);s.reveal=1;
   // Finish the lift and release the page before normal navigation resumes.
   if(s.time>.18)s.released=true;
  }
 }
 if(s.phase==='work'){s.reveal=1;s.released=true;}
 if(['stare','exclaim','hands-up','bonk','recover','frustrated'].includes(s.phase))p.stare=1;
 if(s.phase==='exclaim')p.swear=ease(s.time/.2);
 if(s.phase==='hands-up'){p.swear=1-ease((s.time-.2)/.65);p.anger=ease(s.time/.35);}
 if(s.phase==='bonk'){p.anger=1-ease(s.time/.28);p.bonk=ease(s.time/.55);p.impact=s.time>=.55?Math.exp(-(s.time-.55)*20):0;}
 if(s.phase==='recover')p.bonk=1-u;
 if(s.phase==='frustrated')p.shake=ease(s.time/.2)*ease((length-s.time)/.3);
 return p;
}
function nextDoorPhase(s:CharacterStory){
 // A silent visitor keeps him knocking until the door is answered.
 if(s.phase==='door-knock')return 'door-wait';
 if(s.phase==='door-wait'){if(!s.door.answered)s.door.strike=0;return s.door.answered?'door-open':'door-knock';}
 if(s.phase==='door-open')return 'door-exit';
 return (doorSequence[doorSequence.indexOf(s.phase)+1]??'work') as StoryPhase;
}
/** The two knuckles land at these moments inside the knock beat. */
const KNOCK_STRIKES=[.58,1.03];
/** Knock taps: two strikes, each pulled back a hair before the knuckle lands. */
function knuckle(time:number){
 let sum=0;
 for(const strike of KNOCK_STRIKES){const d=time-strike;if(d>0)sum+=Math.exp(-d*9);else if(d>-.19)sum-=.42*Math.sin((d+.19)/.19*Math.PI);}
 return sum;
}
function doorBeat(s:CharacterStory,reduced:boolean,length:number,u:number){
 const p=s.pose,d=s.door;
 // Presence lets the light under the door show him approaching.
 const target=s.phase==='door-idle'?0:s.phase==='door-hop'?.35:'door-walk-out'===s.phase||s.phase==='door-walk-front'?1:1;
 d.presence+=(target-d.presence)*(reduced?1:.12);
 d.impact=Math.max(0,d.impact*(reduced?0:.86));
 if(s.phase==='door-idle'){
  p.yaw=Math.PI/2;p.stand=0;p.chair=0;
  if(reduced)s.phase='door-knock';
 }
 if(s.phase==='door-hop'){
  // Anticipation, airborne arc with a light tuck, and a two-stage landing.
  const t=s.time;
  const launch=smoother((t-.16)/.36),drop=smoother((t-.66)/.32);
  p.stand=ease(t/.18);p.chair=1-ease(t/.22);
  p.hop=Math.sin(Math.PI*Math.min(1,Math.max(0,(t-.16)/.7)))*.42*(1-drop*.25);
  p.crouch=Math.exp(-Math.pow((t-.16)/.09,2))*.55+Math.exp(-Math.pow((t-.78)/.1,2))*.6;
  p.tuck=Math.sin(Math.PI*Math.min(1,Math.max(0,(t-.26)/.44)))*.5;
  p.hopArms=Math.sin(Math.PI*Math.min(1,Math.max(0,(t-.04)/.6)));
  p.x=-.65+(-.2+.65)*launch;p.z=.64;
  p.yaw=Math.PI/2;
  p.walk=0;
 }
 if(s.phase==='door-walk-out'){
  if(reduced){p.x=1.3;p.z=.5;p.yaw=0;p.stand=1;p.chair=1;}
  else{p.x=-.2+(1.3+.2)*u;p.z=.64+(.5-.64)*u;p.yaw=Math.atan2(-1.5,-.14);p.stand=1;p.chair=1;p.walk=ease(s.time/.2)*ease((length-s.time)/.2);}
 }
 if(s.phase==='door-walk-front'){
  if(reduced){p.x=1.1;p.z=-.94;p.yaw=-.65;p.stand=1;p.chair=1;}
  else{p.x=1.3+(1.1-1.3)*u;p.z=.5+(-.94-.5)*u;p.yaw=Math.atan2(.2,-1.44);p.stand=1;p.chair=1;p.walk=ease(s.time/.2)*ease((length-s.time)/.2);}
 }
 if(s.phase==='door-knock'||s.phase==='door-wait'){
  p.x=1.1;p.z=-.94;p.yaw=-.65;p.stand=1;p.chair=1;
  if(s.phase==='door-knock'){
   const raise=ease(s.time/.32)*(1-ease((length-s.time)/.3));
   p.knock=raise;
   const tap=knuckle(s.time);
   p.knockImpact=Math.max(0,tap);
   // The body leans in behind each knock.
   p.crouch=0;
   p.follow=Math.max(0,tap)*.5;
   // Each of the two raps counts as one knock, so its own label and sound fire.
   const landed=KNOCK_STRIKES.filter(strike=>s.time>=strike).length;
   if(landed!==d.strike){d.knocks+=Math.abs(landed-d.strike);d.strike=landed;}
   d.impact=tap;
  }
 }
 if(s.phase==='door-open'){
  // Turn the handle, then push the leaf away from the visitor.
  p.x=1.1;p.z=-.94;p.yaw=0;p.stand=1;p.chair=1;
  const push=smoother((s.time-.25)/.55);
  p.push=push;p.knock=1-push*.7;
  if(s.time>.3&&!s.door.opening)s.door.opening=true;
 }
 if(s.phase==='door-exit'){
  p.x=1.1;p.z=-.94;p.stand=1;p.chair=1;p.yaw=0;
  // The overlay eases the camera back while he stays in the doorway for the hello.
  if(reduced)p.x=.72;
 }
}
