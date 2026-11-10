import type { EntryExperience } from "@/lib/entry-experience";

/** One state machine owns the actor and page reveal; camera input is independent. */
export type StoryPhase='door-welcome'|'coffee-enter'|'coffee-pickup'|'coffee-toast'|'coffee-return-front'|'coffee-return-side'|'coffee-place'|'coffee-sit'|'settle'|'stand'|'exit'|'approach'|'wave'|'return-front'|'return-side'|'sit'|'pull-reach'|'pull-lift'|'pull-release'|'work'|'stare'|'exclaim'|'hands-up'|'bonk'|'recover'|'frustrated'|'break-stand'|'wander-out'|'wander-front'|'calm'|'wander-back'|'wander-home'|'break-sit';
export type ActorPose={coffeeReach:number;coffeeCarry:number;coffeeToast:number;coffeeGrip:number;coffeePlace:number;x:number;z:number;yaw:number;stand:number;gait:number;walk:number;wave:number;pullReach:number;pullLift:number;pullGrip:number;anger:number;stare:number;shake:number;bonk:number;impact:number;bubble:number;swear:number;chair:number};
export type CharacterStory={entry:EntryExperience;door:{progress:number};coffee:{progress:number;brewing:boolean;atDesk:boolean};phase:StoryPhase;time:number;elapsed:number;cycle:number;greetingVisit:number;started:boolean;skipped:boolean;released:boolean;reveal:number;pose:ActorPose};
export function createStory(entry:EntryExperience='coffee'):CharacterStory{return {entry,door:{progress:0},coffee:{progress:entry==='door'?1:0,brewing:false,atDesk:entry==='door'},phase:entry==='door'?'door-welcome':'coffee-enter',time:0,elapsed:0,cycle:0,greetingVisit:0,started:false,skipped:false,released:false,reveal:0,pose:{coffeeReach:0,coffeeCarry:0,coffeeToast:0,coffeeGrip:0,coffeePlace:0,x:entry==='door'?-.65:3.65,z:entry==='door'?.64:-1.85,yaw:entry==='door'?0:Math.PI/2,stand:entry==='door'?0:1,gait:0,walk:0,wave:0,pullReach:0,pullLift:0,pullGrip:0,anger:0,stare:0,shake:0,bonk:0,impact:0,bubble:0,swear:0,chair:0}};}
export function restartStory(s:CharacterStory){
 const next=createStory(s.entry),pose=s.pose,greetingVisit=s.greetingVisit+1;
 // Arms and legs hold this pose object, so keep its identity across visits.
 Object.assign(pose,next.pose);Object.assign(s,next,{pose,greetingVisit});
}
export const ease=(n:number)=>{const x=Math.max(0,Math.min(1,n));return x*x*(3-2*x);};
export function updateCoffee(s:{readonly current:CharacterStory},update:Partial<CharacterStory['coffee']>){Object.assign(s.current.coffee,update);}
export function updateDoor(s:{readonly current:CharacterStory},progress:number){s.current.door.progress=progress;}
const sequence:StoryPhase[]=['coffee-enter','coffee-pickup','coffee-toast','coffee-return-front','coffee-return-side','coffee-place','coffee-sit','work','stare','exclaim','hands-up','bonk','recover','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'];
const doorSequence:StoryPhase[]=['door-welcome',...sequence.slice(7)];
const duration:Record<StoryPhase,number>={'door-welcome':2.8,'coffee-enter':1.35,'coffee-pickup':.95,'coffee-toast':1.1,'coffee-return-front':2,'coffee-return-side':1.65,'coffee-place':1.2,'coffee-sit':.8,settle:2.4,stand:1.3,exit:2.1,approach:1.85,wave:2.1,'return-front':1.85,'return-side':2.1,sit:1.2,'pull-reach':.9,'pull-lift':1.8,'pull-release':.95,work:24,stare:.9,exclaim:1.35,'hands-up':1.1,bonk:1.15,recover:1.65,frustrated:1.3,'break-stand':1.4,'wander-out':2.4,'wander-front':2.2,calm:2.4,'wander-back':2.2,'wander-home':2.4,'break-sit':1.4};
export function skipStory(s:CharacterStory){s.skipped=true;s.coffee.atDesk=true;s.coffee.progress=1;s.coffee.brewing=false;s.released=true;s.reveal=1;s.phase='work';s.time=0;s.started=true;}
export function advanceStory(s:CharacterStory,dt:number,reduced:boolean){
 if(!s.started)s.started=true;
 s.elapsed+=dt;s.time+=dt;
 let length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 // The welcome plays once per page load; reduced motion suppresses the idle cycle.
 if(reduced&&s.released&&s.phase!=='work')skipStory(s);
 if(s.time>=length){
  s.time-=length;
  if(s.phase==='break-sit'){s.phase='work';s.cycle++;}
  else if(s.phase==='work'&&reduced)s.time=0;
  else {const timeline=s.entry==='door'?doorSequence:sequence;s.phase=timeline[timeline.indexOf(s.phase)+1]??'work';}
  length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 }
 const p=s.pose,u=ease(s.time/length);
 Object.assign(p,{coffeeReach:0,coffeeCarry:0,coffeeToast:0,coffeeGrip:0,coffeePlace:0,x:-.65,z:.64,yaw:0,stand:0,walk:0,wave:0,pullReach:0,pullLift:0,pullGrip:0,anger:0,stare:0,shake:0,bonk:0,impact:0,bubble:0,swear:0,chair:0});
 const walking=(x1:number,z1:number,x2:number,z2:number)=>{
  p.x=x1+(x2-x1)*u;p.z=z1+(z2-z1)*u;p.yaw=Math.atan2(-(x2-x1),-(z2-z1));p.stand=1;
  p.walk=ease(s.time/.25)*ease((length-s.time)/.25);
  p.gait+=Math.hypot(x2-x1,z2-z1)*6*(s.time/length)*(1-s.time/length)/length*dt*10.5;p.chair=1;
 };
 // Opening the door receives a short seated welcome, then reveals the page.
 if(s.phase==='door-welcome'){
  p.bubble=ease(s.time/.3)*ease((length-s.time)/.5);p.wave=p.bubble*.85;
  s.reveal=ease((s.time-.9)/1.5);
  if(s.time>2.6)s.released=true;
 }
 // The IVL is collected before the camera follows the actor home.
 if(s.phase==='coffee-enter')walking(3.65,-1.85,1,-1.85);
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
  p.stand=1-.35*ease(s.time/.35);p.chair=1;p.coffeeReach=1;p.coffeePlace=ease(s.time/.6);p.coffeeCarry=1-p.coffeePlace;
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
