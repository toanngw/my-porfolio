/** One timeline owns the actor and page reveal. Camera gestures never alter it. */
export type StoryPhase='settle'|'stand'|'exit'|'approach'|'wave'|'push'|'return-front'|'return-side'|'sit'|'work'|'frustrated'|'break-stand'|'wander-out'|'wander-front'|'calm'|'wander-back'|'wander-home'|'break-sit';
export type ActorPose={x:number;z:number;yaw:number;stand:number;gait:number;walk:number;wave:number;push:number;stroke:number;anger:number;bubble:number;chair:number};
export type CharacterStory={phase:StoryPhase;time:number;elapsed:number;cycle:number;started:boolean;skipped:boolean;released:boolean;reveal:number;pose:ActorPose};
export function createStory():CharacterStory{return {phase:'settle',time:0,elapsed:0,cycle:0,started:false,skipped:false,released:false,reveal:0,pose:{x:-.65,z:.64,yaw:0,stand:0,gait:0,walk:0,wave:0,push:0,stroke:0,anger:0,bubble:0,chair:0}};}
export const ease=(n:number)=>{const x=Math.max(0,Math.min(1,n));return x*x*(3-2*x);};
const sequence:StoryPhase[]=['settle','stand','exit','approach','wave','push','return-front','return-side','sit','work','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'];
const duration:Record<StoryPhase,number>={settle:.45,stand:1.3,exit:2.4,approach:2.2,wave:2.4,push:1.8,'return-front':2.2,'return-side':2.4,sit:1.4,work:24,frustrated:2.8,'break-stand':1.4,'wander-out':2.4,'wander-front':2.2,calm:2.4,'wander-back':2.2,'wander-home':2.4,'break-sit':1.4};
export function skipStory(story:CharacterStory){story.skipped=true;story.released=true;story.reveal=1;story.phase='work';story.time=0;story.started=true;}
export function advanceStory(s:CharacterStory,dt:number,reduced:boolean){
 if(!s.started){s.started=true;if(reduced)skipStory(s);}
 s.elapsed+=dt;s.time+=dt;
 let length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 if(reduced&&s.phase!=='work'){skipStory(s);}
 if(s.time>=length){
  s.time-=length;
  if(s.phase==='break-sit'){s.phase='work';s.cycle++;}
  else if(s.phase==='work'&&reduced){s.time=0;}
  else s.phase=sequence[sequence.indexOf(s.phase)+1]??'work';
  length=s.phase==='work'?22+((s.cycle*7+3)%13):duration[s.phase];
 }
 const p=s.pose,u=ease(s.time/length),wave=s.phase==='wave';
 Object.assign(p,{x:-.65,z:.64,yaw:0,stand:0,walk:0,wave:0,push:0,stroke:0,anger:0,bubble:0,chair:0});
 const walking=(x1:number,z1:number,x2:number,z2:number)=>{
  // Ease only at the endpoints; distance drives the alternating planted-foot gait.
  p.x=x1+(x2-x1)*u;p.z=z1+(z2-z1)*u;
  p.yaw=Math.atan2(-(x2-x1),-(z2-z1));p.stand=1;
  p.walk=ease(s.time/.25)*ease((length-s.time)/.25);
  const speed=Math.hypot(x2-x1,z2-z1)*6*(s.time/length)*(1-s.time/length)/length;
  p.gait+=speed*dt*10.5;p.chair=1;
 };
 if(s.phase==='stand'||s.phase==='break-stand'){p.stand=u;p.chair=u;}
 if(s.phase==='exit'||s.phase==='wander-out')walking(-.65,.64,1.10,.72);
 if(s.phase==='approach'||s.phase==='wander-front')walking(1.10,.72,1.10,-.94);
 if(wave||s.phase==='push'||s.phase==='calm'){
  p.x=1.1;p.z=-.94;p.stand=1;p.chair=1;p.yaw=wave?-.65:s.phase==='push'?-1.15:-.25;
  if(wave){p.wave=ease(s.time/.35)*ease((length-s.time)/.3);p.bubble=ease(s.time/.2)*ease((length-s.time)/.25);}
  if(s.phase==='push'){p.push=ease(s.time/.25)*ease((length-s.time)/.25);p.stroke=u;s.reveal=u;if(u>.999)s.released=true;}
 }
 if(s.phase==='return-front'||s.phase==='wander-back')walking(1.10,-.94,1.10,.72);
 if(s.phase==='return-side'||s.phase==='wander-home')walking(1.10,.72,-.65,.64);
 if(s.phase==='sit'||s.phase==='break-sit'){p.stand=1-u;p.chair=1-u;p.yaw=Math.PI/2*(1-u);}
 if(s.phase==='work'){s.reveal=1;s.released=true;}
 if(s.phase==='frustrated')p.anger=ease(s.time/.45)*ease((length-s.time)/.4);
 // Turn the hips through the shortest arc; the renderer damps the actual root yaw.
 if(s.phase==='return-front'){s.reveal=1;s.released=true;}
 return p;
}
