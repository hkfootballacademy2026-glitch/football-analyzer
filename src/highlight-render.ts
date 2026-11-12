import type {StudioClip} from './domain';
import {drawShapes} from './drawing';
import {crop,overlayAt,viewAt} from './highlight-model';
export function paintOverlay(ctx:CanvasRenderingContext2D,c:StudioClip,t:number,w:number,h:number){drawShapes(ctx,overlayAt(c,t),w,h);if(c.subtitle&&!c.telopEnabled){ctx.font='bold '+Math.round(w/40)+'px sans-serif';ctx.textBaseline='bottom';const wrapped:string[]=[];for(const paragraph of c.subtitle.split('\n')){let line='';for(const char of paragraph){if(ctx.measureText(line+char).width>w-40){wrapped.push(line);line=char}else line+=char}wrapped.push(line)}const lines=wrapped.slice(0,6);if(wrapped.length>6)lines[5]+='…';ctx.fillStyle='#000b';ctx.fillRect(0,h-lines.length*w/30-20,w,lines.length*w/30+20);ctx.fillStyle='white';lines.forEach((l,i)=>ctx.fillText(l,20,h-10-(lines.length-i-1)*w/30,w-40))}}
export function paintFrame(ctx:CanvasRenderingContext2D,v:HTMLVideoElement,c:StudioClip,t:number,w:number,h:number){
 // Android can temporarily lose a decoded frame while seeking or resuming.
 // Do not erase the last good image or let drawImage stop the animation loop.
 if(v.readyState<2||!v.videoWidth||!v.videoHeight)return false;
 const r=crop({...c,...viewAt(c,t)},v.videoWidth,v.videoHeight),scale=Math.min(w/r.w,h/r.h),dw=r.w*scale,dh=r.h*scale,x=(w-dw)/2,y=(h-dh)/2;
 try{ctx.drawImage(v,r.x,r.y,r.w,r.h,x,y,dw,dh)}catch{return false}
 ctx.fillStyle='black';ctx.fillRect(0,0,w,y);ctx.fillRect(0,y+dh,w,h-y-dh);ctx.fillRect(0,y,x,dh);ctx.fillRect(x+dw,y,w-x-dw,dh);
 paintOverlay(ctx,c,t,w,h);return true;
}
