import type {TacticEffect,Piece} from './domain';
import type {TrainingPiece} from './training-model';
import {resolveEffect} from './tactic-edit';
import {drawingPoints,isClosedDrawing} from './training-drawing';
export const tacticEffectNames={arrow:'矢印',circle:'サークル',link:'リンク',spotlight:'強調',line:'線',rect:'四角',triangle:'三角',trapezoid:'台形',text:'文字'};
export function asDrawing(effect:TacticEffect,pieces:Piece[]):TrainingPiece{
 const e=resolveEffect(effect,pieces),ellipse=e.kind==='circle'||e.kind==='spotlight',rx=Math.max(1.3,Math.abs(e.ex-e.x)),ry=Math.max(1.3,Math.abs(e.ey-e.y));
 return {...e,label:'',kind:e.kind==='link'?'line':e.kind==='spotlight'?'circle':e.kind,x:ellipse?e.x-rx:e.x,y:ellipse?e.y-ry:e.y,ex:ellipse?e.x+rx:e.ex,ey:ellipse?e.y+ry:e.ey,style:e.style==='wave'?'wave':e.dashed?'dashed':'solid',fill:e.kind==='spotlight'||e.fill,text:e.text||'注釈'};
}
export const extendedDrawing=(e:TacticEffect)=>['line','rect','triangle','trapezoid','text'].includes(e.kind)||e.style==='wave'||e.strokeWidth!==undefined||e.fill!==undefined;
export function drawExtendedEffect(ctx:CanvasRenderingContext2D,e:TacticEffect,pieces:Piece[],sx:number,sy:number){
 const p=asDrawing(e,pieces);ctx.save();ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineWidth=Math.max(1,(e.strokeWidth??.3)*Math.min(sx,sy));ctx.setLineDash(e.dashed?[2*sx,1.5*sx]:[]);
 if(p.kind==='text'){ctx.font=`bold ${(p.fontSize??3)*Math.min(sx,sy)}px sans-serif`;ctx.textAlign='left';ctx.textBaseline='alphabetic';(p.text??'注釈').split('\n').forEach((line,i)=>ctx.fillText(line,p.x*sx,(p.y+i*(p.fontSize??3)*1.3)*sy));}
 else {ctx.beginPath();drawingPoints(p).forEach(([x,y],i)=>i?ctx.lineTo(x*sx,y*sy):ctx.moveTo(x*sx,y*sy));if(isClosedDrawing(p)&&p.fill){ctx.globalAlpha=.2;ctx.fill();ctx.globalAlpha=1;}ctx.stroke();if(p.kind==='arrow'){const a=Math.atan2((p.ey-p.y)*sy,(p.ex-p.x)*sx),h=3*Math.min(sx,sy);ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(p.ex*sx-h*Math.cos(a-.5),p.ey*sy-h*Math.sin(a-.5));ctx.lineTo(p.ex*sx,p.ey*sy);ctx.lineTo(p.ex*sx-h*Math.cos(a+.5),p.ey*sy-h*Math.sin(a+.5));ctx.stroke();}}
 ctx.restore();
}
export function hitExtendedEffect(e:TacticEffect,pieces:Piece[],point:{x:number;y:number},tolerance:number){
 const p=asDrawing(e,pieces);if(p.kind==='text'){const size=p.fontSize??3,lines=(p.text??'注釈').split('\n');const width=Math.max(...lines.map(l=>[...l].reduce((n,c)=>n+(c.charCodeAt(0)>255?1:.65),0)))*size;return point.x>=p.x-tolerance&&point.x<=p.x+width+tolerance&&point.y>=p.y-size-tolerance&&point.y<=p.y+(lines.length-1)*size*1.3+tolerance;}
 const points=drawingPoints(p);if(p.fill&&isClosedDrawing(p)){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [x,y]=points[i],[px,py]=points[j];if((y>point.y)!==(py>point.y)&&point.x<(px-x)*(point.y-y)/(py-y)+x)inside=!inside;}if(inside)return true;}
 return points.slice(1).some((b,i)=>{const a=points[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(point.x-a[0]-dx*t,point.y-a[1]-dy*t)<=tolerance+(e.strokeWidth??.3)/2;});
}
