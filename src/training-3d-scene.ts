import {isTrainingDrawing} from './training-drawing';
import {trainingDrawingObject} from './training-drawing-3d';
import * as THREE from 'three';
import {pieceModel} from './tactics-render';
import type {TrainingPiece} from './training-model';

// The same 100 × 64 coordinates as the editable training diagram.
export const trainingPosition=(x:number,y:number,height=0)=>new THREE.Vector3(x-50,height,y-32);
export function trainingObject(p:TrainingPiece){
 let object:THREE.Object3D;
 if(isTrainingDrawing(p)){object=trainingDrawingObject(p);
 }else if(p.kind==='goal'){
  const group=new THREE.Group();
  // Preserve the 2D goal's 8 × 4 footprint, including its user-chosen position.
  const line=(points:number[][],color:number)=>group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(([x,y,z])=>new THREE.Vector3(x,y,z))),new THREE.LineBasicMaterial({color:p.color??color})));
  line([[-4,0,-2],[-4,2.44,-2],[4,2.44,-2],[4,0,-2]],0xffffff);
  line([[-4,0,-2],[-4,0,2],[4,0,2],[4,0,-2]],0xffffff);
  for(let x=-4;x<=4;x++)line([[x,0,2],[x,2.44,2],[x,2.44,-2]],0xb9d9c8);
  for(let h=0;h<=2.44;h+=.4)line([[-4,h,-2],[-4,h,2],[4,h,2],[4,h,-2]],0xb9d9c8);
  object=group;object.position.copy(trainingPosition(p.x,p.y));
 }else{
  object=pieceModel({id:p.id,side:p.kind as 'home'|'away'|'ball'|'cone',color:p.color,number:p.label,x:p.x,y:p.y,angle:0});
  object.position.copy(trainingPosition(p.x,p.y));
 }
 object.userData.trainingId=p.id;object.userData.trainingKind=p.kind;
 return object;
}
