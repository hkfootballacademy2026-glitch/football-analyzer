import {syncDribbles,type Tactic,type TacticEffect,type Piece} from './domain';
export function cleanTactic(t:Tactic):Tactic{return {...t,frames:syncDribbles(t.frames).map(f=>({...f,...(f.effects?{effects:f.effects.filter(e=>(!e.fromId||f.pieces.some(p=>p.id===e.fromId))&&(!e.toId||f.pieces.some(p=>p.id===e.toId)))}:{})}))}}
export class TacticHistory{
 past:Tactic[]=[];future:Tactic[]=[];private before:Tactic|undefined;
 reset(){this.past=[];this.future=[];this.before=undefined}
 begin(current:Tactic){if(!this.before)this.before=structuredClone(current)}
 private push(value:Tactic){this.past.push(structuredClone(value));if(this.past.length>60)this.past.shift();this.future=[]}
 record(previous:Tactic,next:Tactic){if(!this.before&&JSON.stringify(previous)!==JSON.stringify(next))this.push(previous)}
 commit(current:Tactic){const before=this.before;this.before=undefined;if(before&&JSON.stringify(before)!==JSON.stringify(current))this.push(before)}
 cancel(){const before=this.before;this.before=undefined;return before}
 undo(current:Tactic){const previous=this.past.pop();if(!previous)return;this.future.push(structuredClone(current));this.before=undefined;return structuredClone(previous)}
 redo(current:Tactic){const next=this.future.pop();if(!next)return;this.past.push(structuredClone(current));this.before=undefined;return structuredClone(next)}
}
export function effectsAt(frames:Tactic['frames'],time:number){return ([...frames].reverse().find(f=>f.time<=time)??frames[0])?.effects??[]}
export function resolveEffect(effect:TacticEffect,pieces:Piece[]){const from=pieces.find(p=>p.id===effect.fromId),to=pieces.find(p=>p.id===effect.toId);const dx=from?from.x-effect.x:0,dy=from?from.y-effect.y:0;return {...effect,x:from?.x??effect.x,y:from?.y??effect.y,ex:to?.x??(effect.kind==='circle'||effect.kind==='spotlight'?effect.ex+dx:effect.ex),ey:to?.y??(effect.kind==='circle'||effect.kind==='spotlight'?effect.ey+dy:effect.ey)}}
export function facingAngle(piece:Pick<Piece,'x'|'y'>,target:{x:number;y:number}){return (Math.atan2(target.y-piece.y,target.x-piece.x)*180/Math.PI+360)%360}

export function moveTacticEffect(effect:TacticEffect,dx:number,dy:number):TacticEffect{if(!dx&&!dy)return effect;dx=Math.max(-Math.min(effect.x,effect.ex),Math.min(100-Math.max(effect.x,effect.ex),dx));dy=Math.max(-Math.min(effect.y,effect.ey),Math.min(64-Math.max(effect.y,effect.ey),dy));return {...effect,x:effect.x+dx,y:effect.y+dy,ex:effect.ex+dx,ey:effect.ey+dy,fromId:undefined,toId:undefined}}

export type EffectHandle='start'|'end';
export function tacticEffectHandles(e:TacticEffect){const ellipse=e.kind==='circle'||e.kind==='spotlight';const rx=Math.max(1.3,Math.abs(e.ex-e.x)),ry=Math.max(1.3,Math.abs(e.ey-e.y));return ellipse?[{handle:'start' as const,x:e.x-rx,y:e.y-ry},{handle:'end' as const,x:e.x+rx,y:e.y+ry}]:[{handle:'start' as const,x:e.x,y:e.y},{handle:'end' as const,x:e.ex,y:e.ey}]}
export function ellipseFromDrag(e:TacticEffect,a:{x:number;y:number},b:{x:number;y:number}):TacticEffect{a={x:Math.max(0,Math.min(100,a.x)),y:Math.max(0,Math.min(64,a.y))};b={x:Math.max(0,Math.min(100,b.x)),y:Math.max(0,Math.min(64,b.y))};const x=(a.x+b.x)/2,y=(a.y+b.y)/2;return {...e,x,y,ex:x+Math.abs(b.x-a.x)/2,ey:y+Math.abs(b.y-a.y)/2,fromId:undefined,toId:undefined}}
export function resizeTacticEffect(e:TacticEffect,handle:EffectHandle,point:{x:number;y:number},anchorId?:string):TacticEffect{const p={x:Math.max(0,Math.min(100,point.x)),y:Math.max(0,Math.min(64,point.y))};if(e.kind==='circle'||e.kind==='spotlight'){const handles=tacticEffectHandles(e),opposite=handles.find(h=>h.handle!==handle)!;return ellipseFromDrag(e,opposite,p)}return handle==='start'?{...e,x:p.x,y:p.y,fromId:anchorId}:{...e,ex:p.x,ey:p.y,toId:anchorId}}
export function constrainEffectPoint(origin:{x:number;y:number},point:{x:number;y:number},square=false){const dx=point.x-origin.x,dy=point.y-origin.y;if(square){const size=Math.max(Math.abs(dx),Math.abs(dy));return {x:origin.x+Math.sign(dx||1)*size,y:origin.y+Math.sign(dy||1)*size}}const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4,length=Math.hypot(dx,dy);return {x:origin.x+Math.cos(angle)*length,y:origin.y+Math.sin(angle)*length}}
