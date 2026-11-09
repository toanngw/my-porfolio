import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/lib/scroll-detent.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const api={};new Function('exports',js)(api);
const {createDetent,feedDetent,consumeScroll,detentProgress}=api;
assert.deepEqual(consumeScroll(50,1000,80),{position:130,overflow:0});
assert.deepEqual(consumeScroll(500,1000,-80),{position:420,overflow:-0});
const approach=consumeScroll(970,1000,20);
assert(approach.position>970&&approach.position<990,'Approach resistance must be progressive, never a hard stop');
const edge=consumeScroll(970,1000,120);
assert(Math.abs(edge.position-1000)<.01&&edge.overflow>60,'Input left after reading must load the notch');
for(const direction of [-1,1]){
 const detent=createDetent();let crossed=false;
 for(let i=0;i<8;i++){crossed=feedDetent(detent,direction*12,1000+i*16);if(crossed)break;}
 assert(crossed,'A single continuous gesture must cross in both directions');
 assert.equal(detent.pressure,0);
}
const slow=createDetent();let slowCross=false;
for(let i=0;i<5;i++){slowCross=feedDetent(slow,30,1000+i*250);if(slowCross)break;}
assert(slowCross,'Gentle wheel input must not get stuck at the notch');
const reverse=createDetent();assert(!feedDetent(reverse,50,1000));assert(!feedDetent(reverse,-15,1016));assert.equal(reverse.pressure,15);
assert(detentProgress(reverse,3000)<detentProgress(reverse,1016),'Unused pressure must decay');
for(let i=0;i<200;i++){
 const top=(i*137)%800,delta=((i*97)%600)-300,result=consumeScroll(top,800,delta);
 assert(result.position>=0&&result.position<=800);
 assert((result.position-top)*delta>=0,'Scrolling must never reverse itself');
}
console.log('Detent checks passed: proportional reading, approach resistance, both directions, slow/fast input, reversal, and bounded positions.');
