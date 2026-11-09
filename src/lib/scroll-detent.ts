/** Pixel-based mechanical resistance shared by wheels, trackpads, and touch. */
export const DETENT={threshold:76,approach:44,maxDeflection:9,rest:180,decay:650};
export type DetentState={pressure:number;direction:number;velocity:number;lastInput:number;threshold:number};
export function createDetent():DetentState{return {pressure:0,direction:0,velocity:0,lastInput:0,threshold:DETENT.threshold};}
export function detentProgress(state:DetentState,now:number){
 const decay=Math.exp(-Math.max(0,now-state.lastInput-DETENT.rest)/DETENT.decay);
 return Math.min(1,state.pressure*decay/state.threshold);
}
export function feedDetent(state:DetentState,delta:number,now:number,base=DETENT.threshold){
 const direction=Math.sign(delta),gap=Math.max(8,now-state.lastInput);
 if(!direction)return false;
 state.pressure=direction===state.direction?detentProgress(state,now)*state.threshold:0;
 state.velocity=direction===state.direction&&gap<180?state.velocity*.65+Math.abs(delta)/gap*.35:Math.abs(delta)/Math.max(16,gap);
 state.threshold=base*(1+Math.min(.22,state.velocity*.06));
 state.direction=direction;state.lastInput=now;state.pressure+=Math.abs(delta);
 if(state.pressure>=state.threshold){state.pressure=0;state.velocity=0;return true;}
 return false;
}
/** Resistance builds over the last few pixels; leftover input loads the notch. */
export function consumeScroll(top:number,max:number,delta:number,approach=DETENT.approach){
 const direction=Math.sign(delta);let remaining=Math.abs(delta),position=Math.max(0,Math.min(max,top));
 if(!direction)return {position,overflow:0};
 const room=()=>direction>0?max-position:position;
 const free=Math.min(remaining,Math.max(0,room()-approach));
 position+=direction*free;remaining-=free;
 while(remaining>.001&&room()>.001){
  const gain=approach? .48+.52*Math.min(1,room()/approach):1;
  const input=Math.min(remaining,4,room()/gain);
  position+=direction*input*gain;remaining-=input;
 }
 return {position:Math.max(0,Math.min(max,position)),overflow:direction*remaining};
}
