/** One state machine owns the actor and page reveal; camera input is independent. */
export type StoryPhase='settle'|'stand'|'exit'|'approach'|'wave'|'return-front'|'return-side'|'sit'|'pull-reach'|'pull-lift'|'pull-release'|'work'|'stare'|'exclaim'|'hands-up'|'bonk'|'recover'|'frustrated'|'break-stand'|'wander-out'|'wander-front'|'calm'|'wander-back'|'wander-home'|'break-sit';
export type ActorPose={x:number;z:number;yaw:number;stand:number;gait:number;walk:number;wave:number;pullReach:number;pullLift:number;pullGrip:number;anger:number;stare:number;shake:number;bonk:number;impact:number;bubble:number;swear:number;chair:number};
export type CharacterStory={phase:StoryPhase;time:number;elapsed:number;cycle:number;greetingVisit:number;started:boolean;skipped:boolean;released:boolean;reveal:number;pose:ActorPose};
export function createStory():CharacterStory{return {phase:'settle',time:0,elapsed:0,cycle:0,greetingVisit:0,started:false,skipped:false,released:false,reveal:0,pose:{x:-.65,z:.64,yaw:0,stand:0,gait:0,walk:0,wave:0,pullReach:0,pullLift:0,pullGrip:0,anger:0,stare:0,shake:0,bonk:0,impact:0,bubble:0,swear:0,chair:0}};}
export function restartStory(s:CharacterStory){
 const next=createStory(),pose=s.pose,greetingVisit=s.greetingVisit+1;
 // Arms and legs hold this pose object, so keep its identity across visits.
 Object.assign(pose,next.pose);Object.assign(s,next,{pose,greetingVisit});
}
export const ease=(n:number)=>{const x=Math.max(0,Math.min(1,n));return x*x*(3-2*x);};
const sequence:StoryPhase[]=['settle','stand','exit','approach','wave','pull-reach','pull-lift','pull-release','return-front','return-side','sit','work','stare','exclaim','hands-up','bonk','recover','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'];
const duration:Record<StoryPhase,number>={settle:.45,stand:1.3,exit:2.1,approach:1.85,wave:2.1,'return-front':1.85,'return-side':2.1,sit:1.2,'pull-reach':.9,'pull-lift':1.8,'pull-release':.95,work:24,stare:.9,exclaim:1.35,'hands-up':1.1,bonk:1.15,recover:1.65,frustrated:1.3,'break-stand':1.4,'wander-out':2.4,'wander-front':2.2,calm:2.4,'wander-back':2.2,'wander-home':2.4,'break-sit':1.4};
export function skipStory(s:CharacterStory){s.skipped=true;s.released=true;s.reveal=1;s.phase='work';s.time=0;s.started=true;}
export function advanceStory(s:CharacterStory,dt:number,reduced:boolean){
 if(!s.started)s.started=true;
 s.elapsed+=dt;s.time+=dt;
 let length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 // The welcome plays on every visit; reduced motion suppresses the idle cycle.
 if(reduced&&s.released&&s.phase!=='work')skipStory(s);
 if(s.time>=length){
  s.time-=length;
  if(s.phase==='break-sit'){s.phase='work';s.cycle++;}
  else if(s.phase==='work'&&reduced)s.time=0;
  else s.phase=sequence[sequence.indexOf(s.phase)+1]??'work';
  length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 }
 const p=s.pose,u=ease(s.time/length);
 Object.assign(p,{x:-.65,z:.64,yaw:0,stand:0,walk:0,wave:0,pullReach:0,pullLift:0,pullGrip:0,anger:0,stare:0,shake:0,bonk:0,impact:0,bubble:0,swear:0,chair:0});
 const walking=(x1:number,z1:number,x2:number,z2:number)=>{
  p.x=x1+(x2-x1)*u;p.z=z1+(z2-z1)*u;p.yaw=Math.atan2(-(x2-x1),-(z2-z1));p.stand=1;
  p.walk=ease(s.time/.25)*ease((length-s.time)/.25);
  p.gait+=Math.hypot(x2-x1,z2-z1)*6*(s.time/length)*(1-s.time/length)/length*dt*10.5;p.chair=1;
 };
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
