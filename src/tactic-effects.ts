import * as THREE from 'three';
import {type Piece,type TacticEffect} from './domain';
import {resolveEffect,tacticEffectHandles} from './tactic-edit';
export function drawTacticEffects(ctx:CanvasRenderingContext2D,effects:TacticEffect[],pieces:Piece[],sx:number,sy:number,selected=''){
 for(const raw of effects){const e=resolveEffect(raw,pieces),x=e.x*sx,y=e.y*sy,ex=e.ex*sx,ey=e.ey*sy;ctx.save();ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineWidth=Math.max(2,Math.min(sx,sy)*.3);ctx.setLineDash(e.dashed?[8,6]:[]);ctx.beginPath();
 if(e.kind==='circle'||e.kind==='spotlight'){const rx=Math.max(1.3,Math.abs(e.ex-e.x))*sx,ry=Math.max(1.3,Math.abs(e.ey-e.y))*sy;ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(e.kind==='spotlight'){ctx.globalAlpha=.22;ctx.fill();ctx.globalAlpha=1}ctx.stroke()}else{ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();if(e.kind==='arrow'){ctx.setLineDash([]);const angle=Math.atan2(ey-y,ex-x),head=Math.max(9,Math.min(sx,sy)*1.7);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-head*Math.cos(angle-.45),ey-head*Math.sin(angle-.45));ctx.moveTo(ex,ey);ctx.lineTo(ex-head*Math.cos(angle+.45),ey-head*Math.sin(angle+.45));ctx.stroke()}}ctx.restore();
 if(e.id===selected){const size=Math.max(Math.min(sx,sy)*.7,6*ctx.canvas.width/(ctx.canvas.clientWidth||ctx.canvas.width));ctx.save();ctx.setLineDash([]);ctx.fillStyle='#fff';ctx.strokeStyle='#1677ff';ctx.lineWidth=2;for(const p of tacticEffectHandles(e)){ctx.fillRect(p.x*sx-size,p.y*sy-size,2*size,2*size);ctx.strokeRect(p.x*sx-size,p.y*sy-size,2*size,2*size)}ctx.restore()}
 }
}
export function tacticEffectsModel(effects:TacticEffect[],pieces:Piece[],selected=''){
 const group=new THREE.Group();group.name='tactic-effects';
 for(const raw of effects){const e=resolveEffect(raw,pieces),start=new THREE.Vector3(e.x-50,.16,e.y-32),end=new THREE.Vector3(e.ex-50,.16,e.ey-32),circle=e.kind==='circle'||e.kind==='spotlight';const rx=Math.max(1.3,Math.abs(e.ex-e.x)),ry=Math.max(1.3,Math.abs(e.ey-e.y));const points=circle?Array.from({length:65},(_,i)=>new THREE.Vector3(start.x+rx*Math.cos(i/64*Math.PI*2),.16,start.z+ry*Math.sin(i/64*Math.PI*2))):[start,end];const material=e.dashed?new THREE.LineDashedMaterial({color:e.color,dashSize:1,gapSize:.7}):new THREE.LineBasicMaterial({color:e.color});const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material);line.computeLineDistances();group.add(line);
 if(e.kind==='arrow'&&start.distanceTo(end)>.1){const direction=end.clone().sub(start).normalize();group.add(new THREE.ArrowHelper(direction,end.clone().addScaledVector(direction,-1.5),1.5,e.color,1.2,.9))}
 if(e.kind==='spotlight'){const fill=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:e.color,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));fill.rotation.x=-Math.PI/2;fill.scale.set(rx,ry,1);fill.position.copy(start).setY(.12);group.add(fill)}
 if(e.id===selected)for(const p of tacticEffectHandles(e)){const knob=new THREE.Mesh(new THREE.SphereGeometry(.85,12,8),new THREE.MeshBasicMaterial({color:'#ffffff',depthTest:false}));knob.position.set(p.x-50,.3,p.y-32);knob.renderOrder=20;knob.name='effect-handle-'+p.handle;group.add(knob)}
 }return group;
}
