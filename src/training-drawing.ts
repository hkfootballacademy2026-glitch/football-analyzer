import type {TrainingPiece} from './training-model';
export const drawingKinds=['arrow','line','circle','rect','triangle','trapezoid','text'] as const;
export const isTrainingDrawing=(p:TrainingPiece)=>drawingKinds.some(k=>k===p.kind);
export const isClosedDrawing=(p:TrainingPiece)=>['circle','rect','triangle','trapezoid'].includes(p.kind);
export const drawingColor=(p:TrainingPiece)=>p.color??(p.kind==='arrow'?'#ffe070':'#ffffff');
export function drawingPoints(p:TrainingPiece):[number,number][]{
 const x=Math.min(p.x,p.ex),y=Math.min(p.y,p.ey),w=Math.abs(p.ex-p.x),h=Math.abs(p.ey-p.y);
 if(p.kind==='circle')return Array.from({length:65},(_,i)=>[x+w/2+w/2*Math.cos((i%64)/64*Math.PI*2),y+h/2+h/2*Math.sin((i%64)/64*Math.PI*2)]);
 if(p.kind==='rect')return [[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]];
 if(p.kind==='triangle')return [[x+w/2,y],[x+w,y+h],[x,y+h],[x+w/2,y]];
 if(p.kind==='trapezoid')return [[x+w*.25,y],[x+w*.75,y],[x+w,y+h],[x,y+h],[x+w*.25,y]];
 if(p.style==='wave'){
  const dx=p.ex-p.x,dy=p.ey-p.y,length=Math.hypot(dx,dy);if(length<.001)return [[p.x,p.y],[p.ex,p.ey]];
  const count=Math.max(8,Math.ceil(length*4)),waves=Math.max(1,Math.round(length/3));
  return Array.from({length:count+1},(_,i)=>{const t=i/count,offset=Math.sin(t*Math.PI*2*waves)*.6;return [p.x+dx*t-dy/length*offset,p.y+dy*t+dx/length*offset];});
 }
 return [[p.x,p.y],[p.ex,p.ey]];
}
export function moveTrainingSelection(pieces:TrainingPiece[],ids:string[],dx:number,dy:number){
 const chosen=pieces.filter(p=>ids.includes(p.id));if(!chosen.length)return pieces;
 const xs=chosen.flatMap(p=>isTrainingDrawing(p)&&p.kind!=='text'?[p.x,p.ex]:[p.x]),ys=chosen.flatMap(p=>isTrainingDrawing(p)&&p.kind!=='text'?[p.y,p.ey]:[p.y]);
 dx=Math.max(-Math.min(...xs),Math.min(100-Math.max(...xs),dx));dy=Math.max(-Math.min(...ys),Math.min(64-Math.max(...ys),dy));
 return pieces.map(p=>ids.includes(p.id)?{...p,x:p.x+dx,y:p.y+dy,ex:Math.max(0,Math.min(100,p.ex+dx)),ey:Math.max(0,Math.min(64,p.ey+dy))}:p);
}
