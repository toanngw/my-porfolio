import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/components/studio/character-story.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const api={};new Function('exports',compiled)(api);
const {createStory,advanceStory,skipStory}=api;
const story=createStory(),seen=new Set(),workLengths=new Set();
let last={...story.pose},reveal=0,workStart=0,previous=story.phase;
for(let i=0;i<60*220;i++){
 const pose=advanceStory(story,1/60,false);seen.add(story.phase);
 assert(Number.isFinite(pose.x)&&Number.isFinite(pose.z)&&Number.isFinite(pose.yaw));
 assert(pose.stand>=0&&pose.stand<=1);
 assert(Math.hypot(pose.x-last.x,pose.z-last.z)<.05,'Actor position must stay continuous at state boundaries');
 assert(story.reveal>=reveal,'Welcome reveal must never rewind');
 if(pose.walk>.05)assert(pose.x>.9||pose.z>.60,'Walking route must clear the desk footprint');
 if(story.phase==='work'&&previous!=='work')workStart=story.elapsed;
 if(previous==='work'&&story.phase!=='work')workLengths.add(Math.round(story.elapsed-workStart));
 last={...pose};reveal=story.reveal;previous=story.phase;
}
for(const phase of ['stand','exit','approach','wave','push','return-front','return-side','sit','work','frustrated','break-stand','wander-out','wander-front','calm','wander-back','wander-home','break-sit'])assert(seen.has(phase),`Missing state ${phase}`);
assert(workLengths.size>1,'Work intervals must vary');
assert(story.cycle>=3);assert(story.released);
const reduced=createStory();for(let i=0;i<60*120;i++)advanceStory(reduced,1/60,true);
assert.equal(reduced.phase,'work');assert.equal(reduced.pose.stand,0);assert.equal(reduced.reveal,1);
const skipped=createStory();advanceStory(skipped,.1,false);skipStory(skipped);advanceStory(skipped,.016,false);
assert.equal(skipped.phase,'work');assert.equal(skipped.reveal,1);assert.equal(skipped.pose.x,-.65);
console.log('Character timeline passed: continuous paths, desk clearance, varied cycles, reduced motion, and skip.');
