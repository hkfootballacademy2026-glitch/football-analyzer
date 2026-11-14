import * as THREE from 'three';
import {pieceModel} from './tactics-render';
import type {TrainingPiece} from './training-model';

// The same 100 × 64 coordinates as the editable training diagram.
export const trainingPosition=(x:number,y:number,height=0)=>new THREE.Vector3(x-50,height,y-32);
export function trainingObject(p:TrainingPiece){
 let object:THREE.Object3D;
 if(p.kind==='arrow'){
  const direction=trainingPosition(p.ex,p.ey).sub(trainingPosition(p.x,p.y)),length=direction.length();
  object=length>.001?new THREE.ArrowHelper(direction.normalize(),new THREE.Vector3(),length,0xffe070,Math.min(3,length*.3),Math.min(1.8,length*.18)):new THREE.Group();
  object.position.copy(trainingPosition(p.x,p.y,.15));
 }else if(p.kind==='goal'){
  const group=new THREE.Group();
  // Preserve the 2D goal's 8 × 4 footprint, including its user-chosen position.
  const line=(points:number[][],color:number)=>group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(([x,y,z])=>new THREE.Vector3(x,y,z))),new THREE.LineBasicMaterial({color})));
  line([[-4,0,-2],[-4,2.44,-2],[4,2.44,-2],[4,0,-2]],0xffffff);
  line([[-4,0,-2],[-4,0,2],[4,0,2],[4,0,-2]],0xffffff);
  for(let x=-4;x<=4;x++)line([[x,0,2],[x,2.44,2],[x,2.44,-2]],0xb9d9c8);
  for(let h=0;h<=2.44;h+=.4)line([[-4,h,-2],[-4,h,2],[4,h,2],[4,h,-2]],0xb9d9c8);
  object=group;object.position.copy(trainingPosition(p.x,p.y));
 }else{
  object=pieceModel({id:p.id,side:p.kind,number:p.label,x:p.x,y:p.y,angle:0});
  object.position.copy(trainingPosition(p.x,p.y));
 }
 object.userData.trainingId=p.id;object.userData.trainingKind=p.kind;
 return object;
}
