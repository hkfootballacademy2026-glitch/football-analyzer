import * as THREE from 'three';
import type {TrainingPiece} from './training-model';
import {drawingColor,drawingPoints,isClosedDrawing} from './training-drawing';

export function trainingDrawingObject(p:TrainingPiece){
 const group=new THREE.Group(),color=drawingColor(p);
 if(p.kind==='text'){
  const lines=(p.text??'注釈').split('\n'),size=p.fontSize??3;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return group;
  ctx.font='bold 48px sans-serif';const width=Math.min(4096,Math.max(64,...lines.map(line=>ctx.measureText(line).width+12))),height=Math.min(4096,Math.max(64,lines.length*64));
  canvas.width=width;canvas.height=height;ctx.font='bold 48px sans-serif';ctx.fillStyle=color;
  lines.forEach((line,i)=>ctx.fillText(line,6,i*64+48,width-12));
  const texture=new THREE.CanvasTexture(canvas),w=width/48*size,h=height/48*size;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  mesh.rotation.x=-Math.PI/2;mesh.position.set(p.x-50+w/2,.18,p.y-32-size+h/2);group.add(mesh);return group;
 }
 const points=drawingPoints(p),vertices:number[]=[],half=(p.strokeWidth??.65)/2;
 const segment=(a:number[],b:number[])=>{const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.001)return;const nx=-dy/length*half,ny=dx/length*half;const v=[[a[0]+nx,a[1]+ny],[a[0]-nx,a[1]-ny],[b[0]-nx,b[1]-ny],[b[0]+nx,b[1]+ny]];for(const i of [0,1,2,0,2,3])vertices.push(v[i][0]-50,.13,v[i][1]-32);};
 let distance=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  if(p.style!=='dashed')segment(a,b);
  else {let along=0;while(along<length-.00001){const phase=(distance+along)%3.5,step=Math.min(length-along,(phase<2?2:3.5)-phase);if(step<.00001){along+=.00001;continue;}if(phase<2)segment([a[0]+dx*along/length,a[1]+dy*along/length],[a[0]+dx*(along+step)/length,a[1]+dy*(along+step)/length]);along+=step;}}
  distance+=length;
 }
 if(p.kind==='arrow'&&Math.hypot(p.ex-p.x,p.ey-p.y)>.001){const angle=Math.atan2(p.ey-p.y,p.ex-p.x);for(const sign of [-1,1])segment([p.ex-3*Math.cos(angle+sign*.5),p.ey-3*Math.sin(angle+sign*.5)],[p.ex,p.ey]);}
 if(vertices.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));group.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide})));}
 if(isClosedDrawing(p)&&p.fill&&Math.abs(p.ex-p.x)>.001&&Math.abs(p.ey-p.y)>.001){const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));const fill=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide}));fill.rotation.x=Math.PI/2;fill.position.set(-50,.07,-32);group.add(fill);}
 return group;
}
