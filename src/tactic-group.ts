import {uid,type Tactic,type TacticEffect} from './domain';
import {resolveEffect,moveTacticEffect} from './tactic-edit';
export type TacticFrame=Tactic['frames'][number];
export const selectedPiece=(ids:string[],id:string)=>ids.includes('p:'+id);
export const selectedEffect=(ids:string[],id:string)=>ids.includes('e:'+id);
export function moveTacticGroup(frame:TacticFrame,ids:string[],dx:number,dy:number):TacticFrame{
 const items=frame.pieces.filter(p=>selectedPiece(ids,p.id)),effects=(frame.effects??[]).filter(e=>selectedEffect(ids,e.id)).map(e=>resolveEffect(e,frame.pieces));
 const xs=[...items.map(p=>p.x),...effects.flatMap(e=>[e.x,e.ex])],ys=[...items.map(p=>p.y),...effects.flatMap(e=>[e.y,e.ey])];if(!xs.length)return frame;
 dx=Math.max(-Math.min(...xs),Math.min(100-Math.max(...xs),dx));dy=Math.max(-Math.min(...ys),Math.min(64-Math.max(...ys),dy));
 return {...frame,pieces:frame.pieces.map(p=>selectedPiece(ids,p.id)?{...p,x:p.x+dx,y:p.y+dy}:p),effects:frame.effects?.map(raw=>{if(!selectedEffect(ids,raw.id))return raw;const e=moveTacticEffect(resolveEffect(raw,frame.pieces),dx,dy);return {...e,fromId:raw.fromId&&selectedPiece(ids,raw.fromId)?raw.fromId:undefined,toId:raw.toId&&selectedPiece(ids,raw.toId)?raw.toId:undefined,kind:raw.kind==='link'&&!(raw.fromId&&raw.toId&&selectedPiece(ids,raw.fromId)&&selectedPiece(ids,raw.toId))?'line':raw.kind};})};
}
export function duplicateTacticGroup(tactic:Tactic,frameIndex:number,ids:string[]){
 const result=structuredClone(tactic),frame=result.frames[frameIndex],pieces=frame.pieces.filter(p=>selectedPiece(ids,p.id)),effects=(frame.effects??[]).filter(e=>selectedEffect(ids,e.id));
 if(frame.pieces.length+pieces.length>200||(frame.effects?.length??0)+effects.length>100)throw Error('複製後の上限は配置物200個・図形100個です。');
 const remap=new Map(pieces.map(p=>[p.id,uid()]));for(const f of result.frames)f.pieces.push(...f.pieces.filter(p=>remap.has(p.id)).map(p=>({...p,id:remap.get(p.id)!,dribblerId:p.dribblerId?(remap.get(p.dribblerId)??p.dribblerId):undefined})));
 const copies:TacticEffect[]=effects.map(e=>({...resolveEffect(e,frame.pieces),id:uid(),fromId:e.fromId?remap.get(e.fromId):undefined,toId:e.toId?remap.get(e.toId):undefined,kind:e.kind==='link'&&!(e.fromId&&e.toId&&remap.has(e.fromId)&&remap.has(e.toId))?'line':e.kind}));
 frame.effects=[...(frame.effects??[]),...copies];const selection=[...remap.values()].map(id=>'p:'+id).concat(copies.map(e=>'e:'+e.id));result.frames[frameIndex]=moveTacticGroup(frame,selection,3,3);return {tactic:result,selection};
}
export function deleteTacticGroup(tactic:Tactic,frameIndex:number,ids:string[]):Tactic{
 return {...tactic,frames:tactic.frames.map((f,i)=>({...f,pieces:f.pieces.filter(p=>!selectedPiece(ids,p.id)).map(p=>p.dribblerId&&selectedPiece(ids,p.dribblerId)?{...p,dribblerId:undefined,flight:'none'}:p),effects:f.effects?.filter(e=>!(i===frameIndex&&selectedEffect(ids,e.id))&&!(e.fromId&&selectedPiece(ids,e.fromId))&&!(e.toId&&selectedPiece(ids,e.toId)))}))};
}
