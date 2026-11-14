import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/components/studio/brick-detail.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const api={};new Function('exports',compiled)(api);
const {refineBricks}=api;
const original=[1,2,3,.62,.57,.51,'#dba580'];
const bricks=refineBricks([original]);
for(const brick of bricks){
 assert(brick.slice(0,6).every(Number.isFinite));
 assert(brick.slice(3,6).every(size=>size>0&&size<=.075));
 assert.equal(brick[6],original[6]);
}
for(let axis=0;axis<3;axis++){
 const low=Math.min(...bricks.map(b=>b[axis]-b[axis+3]/2));
 const high=Math.max(...bricks.map(b=>b[axis]+b[axis+3]/2));
 assert(Math.abs(low-(original[axis]-original[axis+3]/2))<1e-10);
 assert(Math.abs(high-(original[axis]+original[axis+3]/2))<1e-10);
}
assert.equal(refineBricks([[0,0,0,.3,.3,.3,'#fff']],.1).length,26,'Omit the invisible center brick');
const eye=[0,0,0,.018,.018,.008,'#fff'];
assert.deepEqual(refineBricks([eye]),[eye],'Preserve existing tiny facial details');
console.log('Fine brick geometry passed: size limit, preserved bounds/colors/details, and hidden-cell removal.');
