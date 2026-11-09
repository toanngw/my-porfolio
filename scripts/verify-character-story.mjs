import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/components/studio/character-story.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const api={};new Function('exports',compiled)(api);
const {createStory,advanceStory,skipStory}=api;
const story=createStory(),seen=new Set(),workLengths=new Set();
let last={...story.pose},reveal=0,workStart=0,previous=story.phase,impacts=0,lastImpact=0;
for(let i=0;i<60*220;i++){
 const pose=advanceStory(story,1/60,false);seen.add(story.phase);
 assert(Number.isFinite(pose.x)&&Number.isFinite(pose.z)&&Number.isFinite(pose.yaw));
 assert(pose.stand>=0&&pose.stand<=1);
 assert(Math.hypot(pose.x-last.x,pose.z-last.z)<.05,'Actor position must stay continuous at state boundaries');
 assert(story.reveal>=reveal,'Welcome reveal must never rewind');
 if(['settle','stand','exit','approach','wave','pull-reach'].includes(story.phase))assert.equal(story.reveal,0,'Profile stays hidden until the hand starts lifting');
 if(story.phase.startsWith('pull-'))assert.equal(pose.stand,1,'Pull up the profile after greeting, before returning to the desk');
 if(story.phase==='pull-lift'){
  assert.equal(story.reveal,pose.pullLift,'Page and wrist must share the same lift progress');
  assert.equal(pose.pullGrip,1,'Keep a firm grip throughout the lift');
 }
 if(['return-front','return-side','sit'].includes(story.phase)){assert.equal(story.reveal,1);assert.equal(pose.pullReach,0,'Lower the hand before walking back');}
 assert(Math.abs(pose.pullReach-last.pullReach)<.09,'Reach must blend across animation states');
 if(story.phase.startsWith('pull-')&&previous.startsWith('pull-'))assert(Math.abs(pose.pullLift-last.pullLift)<.025,'Lift must stay continuous');
 if(pose.impact>0&&lastImpact===0)impacts++;
 if(pose.walk>.05)assert(pose.x>.9||pose.z>.60,'Walking route must clear the desk footprint');
 if(story.phase==='work'&&previous!=='work')workStart=story.elapsed;
 if(previous==='work'&&story.phase!=='work')workLengths.add(Math.round(story.elapsed-workStart));
 last={...pose};reveal=story.reveal;previous=story.phase;lastImpact=pose.impact;
}
for(const phase of ['stand','exit','approach','wave','return-front','return-side','sit','pull-reach','pull-lift','pull-release','work','stare','exclaim','hands-up','bonk','recover','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'])assert(seen.has(phase),`Missing state ${phase}`);
assert(impacts>=3&&impacts<=story.cycle+1,'One desk impact per frustration cycle');
assert(workLengths.size>1,'Work intervals must vary');
assert(story.cycle>=3);assert(story.released);
const reduced=createStory();for(let i=0;i<60*120;i++)advanceStory(reduced,1/60,true);
assert.equal(reduced.phase,'work');assert.equal(reduced.pose.stand,0);assert.equal(reduced.reveal,1);
const skipped=createStory();advanceStory(skipped,.1,false);skipStory(skipped);advanceStory(skipped,.016,false);
assert.equal(skipped.phase,'work');assert.equal(skipped.reveal,1);assert.equal(skipped.pose.x,-.65);assert.equal(skipped.pose.pullReach,0);
const pullSkip=createStory();while(pullSkip.phase!=='pull-lift')advanceStory(pullSkip,1/60,false);skipStory(pullSkip);advanceStory(pullSkip,1/60,false);assert.equal(pullSkip.pose.pullReach,0,'Skipping mid-pull must reset the gesture');
console.log('Character timeline passed: one-handed lift synchronized with reveal, continuous paths and arm blending, desk clearance, one impact per cycle, varied timing, reduced motion, and skip.');
