import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/components/studio/character-story.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const api={};new Function('exports',compiled)(api);
const {createStory,advanceStory,skipStory,answerDoor}=api;
const story=createStory(),seen=new Set(),workLengths=new Set();
let last={...story.pose},reveal=0,workStart=0,previous=story.phase,impacts=0,lastImpact=0;
for(let i=0;i<60*220;i++){
 const pose=advanceStory(story,1/60,false);seen.add(story.phase);
 assert(Number.isFinite(pose.x)&&Number.isFinite(pose.z)&&Number.isFinite(pose.yaw));
 assert(pose.stand>=0&&pose.stand<=1);
 assert(Math.hypot(pose.x-last.x,pose.z-last.z)<.05,'Actor position must stay continuous at state boundaries');
 assert(story.reveal>=reveal,'Welcome reveal must never rewind');
 if(story.phase.startsWith('coffee-')&&story.phase!=='coffee-sit')assert.equal(story.reveal,0,'Keep the profile hidden until coffee is on the desk');
 assert(Math.abs(pose.coffeeGrip-last.coffeeGrip)<.14,'The glass must attach and release smoothly');
 if(pose.impact>0&&lastImpact===0)impacts++;
 if(pose.walk>.05)assert(pose.x>.9||pose.z>.60,'Walking route must clear the desk footprint');
 if(story.phase==='work'&&previous!=='work')workStart=story.elapsed;
 if(previous==='work'&&story.phase!=='work')workLengths.add(Math.round(story.elapsed-workStart));
 last={...pose};reveal=story.reveal;previous=story.phase;lastImpact=pose.impact;
}
for(const phase of ['coffee-enter','coffee-pickup','coffee-toast','coffee-return-front','coffee-return-side','coffee-place','coffee-sit','work','stare','exclaim','hands-up','bonk','recover','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'])assert(seen.has(phase),`Missing state ${phase}`);
assert(impacts>=3&&impacts<=story.cycle+1,'One desk impact per frustration cycle');
assert(workLengths.size>1,'Work intervals must vary');
assert(story.cycle>=3);assert(story.released);
const reduced=createStory();for(let i=0;i<60*120;i++)advanceStory(reduced,1/60,true);
assert.equal(reduced.phase,'work');assert.equal(reduced.pose.stand,0);assert.equal(reduced.reveal,1);
const skipped=createStory();advanceStory(skipped,.1,false);skipStory(skipped);advanceStory(skipped,.016,false);
assert.equal(skipped.phase,'work');assert.equal(skipped.reveal,1);assert.equal(skipped.pose.x,-.65);assert.equal(skipped.pose.pullReach,0);
for(const phase of ['coffee-pickup','coffee-toast','coffee-return-front','coffee-place']){
 const interrupted=createStory();let steps=0;
 while(interrupted.phase!==phase&&steps++<60*20)advanceStory(interrupted,1/60,false);
 assert.equal(interrupted.phase,phase,'The pickup must remain reachable');
 skipStory(interrupted);advanceStory(interrupted,1/60,false);
 assert.equal(interrupted.pose.coffeeGrip,0,'Skipping must release the glass');
 assert.equal(interrupted.coffee.atDesk,true,'Skipping must leave the IVL on the desk');
 assert.equal(interrupted.reveal,1);
}
const pickup=createStory();let greetings=0,lastPhase=pickup.phase;
while(!pickup.released){
 advanceStory(pickup,1/60,false);
 if(pickup.phase==='coffee-toast'&&lastPhase!==pickup.phase)greetings++;
 if(pickup.phase.startsWith('coffee-return-'))assert.equal(pickup.pose.coffeeGrip,1,'Keep the IVL held on the walk back');
 if(!pickup.coffee.atDesk)assert.equal(pickup.reveal,0,'Keep the portfolio hidden until the IVL is set down');
 lastPhase=pickup.phase;
}
assert.equal(greetings,1,'Greet once after collecting the IVL');
assert(pickup.coffee.atDesk,'Set the coffee down before releasing the portfolio');
console.log('Character timeline passed: continuous pickup and walking, held IVL during return, set-down before reveal, one greeting, idle cycle, reduced motion, and interruption recovery.');

const door=createStory('door');
assert.equal(door.entry,'door');assert.equal(door.started,false);assert.equal(door.reveal,0);
assert.equal(door.coffee.atDesk,false,'Coffee starts at the machine');
assert.equal(door.phase,'door-idle');
let unopenedReveal=0,knocks=0,lastKnock=0,hopSeen=false,tuckSeen=false;
for(let i=0;i<60*5;i++){
 advanceStory(door,1/60,false);
 assert(!door.phase.startsWith('coffee-'),'Door entry must not run the preserved coffee pickup');
 assert(door.reveal>=unopenedReveal,'The door welcome must reveal content without rewinding');unopenedReveal=door.reveal;
 assert.equal(door.reveal,0,'Keep the portfolio hidden while the door is unanswered');
 assert.equal(door.pose.coffeeGrip,0,'Door entry must not grab a glass');
 if(door.pose.knockImpact>lastKnock+.5)knocks++;
 lastKnock=door.pose.knockImpact;
 if(door.pose.hop>.2)hopSeen=true;
 if(door.pose.tuck>.2)tuckSeen=true;
}
assert(hopSeen,'He must hop off the chair');assert(tuckSeen,'The hop must tuck his legs');
assert(knocks>=2,'He must knock at least twice');assert(door.door.knocks>=2);
assert(['door-knock','door-wait'].includes(door.phase),'He waits at the door until answered');
assert.equal(door.door.answered,false);
answerDoor({current:door});
let doorGreeting=false,doorReveal=0,answeredAt=door.elapsed;
const doorPhases=[];
for(let i=0;i<60*30&&door.phase!=='work';i++){
 advanceStory(door,1/60,false);
 assert(door.reveal>=doorReveal,'The door welcome must reveal content without rewinding');doorReveal=door.reveal;
 if(door.pose.bubble>.15)doorGreeting=true;
 if(doorPhases.at(-1)!==door.phase)doorPhases.push(door.phase);
 if(door.phase==='wave')assert(door.coffee.atDesk,'Finish coffee before greeting');
 if(!door.phase.startsWith('pull-')&&!door.released)assert.equal(door.reveal,0);
}
assert(doorGreeting,'Welcome visitors after opening the door');
const expected=['door-open','door-exit','coffee-enter','coffee-brew','coffee-pickup','coffee-return-front','coffee-return-side','coffee-place','exit','approach','wave','pull-reach','pull-lift','pull-release'];
assert.deepEqual(doorPhases.filter(p=>expected.includes(p)),expected);
assert(door.door.opening,'Answering the door must start the opening');assert(door.door.progress>=0);
assert(door.elapsed-answeredAt<30,'The intro must finish in reasonable time');
assert.equal(door.phase,'work');assert(door.released);assert.equal(door.reveal,1);
const doorSkip=createStory('door');skipStory(doorSkip);advanceStory(doorSkip,.016,true);
assert.equal(doorSkip.phase,'work');assert.equal(doorSkip.reveal,1);assert.equal(doorSkip.door.done,true);
const doorReduced=createStory('door');
for(let i=0;i<60*35&&doorReduced.phase!=='work';i++){advanceStory(doorReduced,1/60,true);if(doorReduced.phase==='door-knock')answerDoor({current:doorReduced});}
assert.equal(doorReduced.phase,'work');assert.equal(doorReduced.reveal,1);
console.log('Door timeline passed: chair hop, walk to the door, two knocks, wait for the visitor, opening, greeting, pull-up reveal, skip and reduced-motion recovery.');
