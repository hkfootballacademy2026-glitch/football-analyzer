import type {Tactic,TacticEffect} from './domain';
import type {Drill} from './training-model';
import {drillFrames} from './training-animation-model';
import {isTrainingDrawing} from './training-drawing';
export function trainingTacticFrames(drill:Drill):Tactic['frames']{
 return drillFrames(drill).map(frame=>({time:frame.time,pieces:frame.pieces.filter(p=>['home','away','ball','cone'].includes(p.kind)).map(p=>({id:p.id,side:p.kind as 'home'|'away'|'ball'|'cone',number:p.label,x:p.x,y:p.y,angle:0,color:p.color})),effects:frame.pieces.filter(isTrainingDrawing).map(p=>{
  const effect:TacticEffect={id:p.id,kind:p.kind as TacticEffect['kind'],x:p.x,y:p.y,ex:p.ex,ey:p.ey,color:p.color??(p.kind==='arrow'?'#ffe070':'#ffffff'),dashed:p.style==='dashed',style:p.style==='wave'?'wave':'solid',strokeWidth:p.strokeWidth??.65,fill:p.fill,text:p.text,fontSize:p.fontSize};
  // Training stores bounding corners; tactical circles store centre and radius endpoint.
  if(p.kind==='circle'){effect.x=(p.x+p.ex)/2;effect.y=(p.y+p.ey)/2;effect.ex=Math.max(p.x,p.ex);effect.ey=Math.max(p.y,p.ey);}
  return effect;
 })}));
}
