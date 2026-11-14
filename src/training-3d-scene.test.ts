import {it,expect} from 'vitest';
import * as THREE from 'three';
import {trainingPosition,trainingObject} from './training-3d-scene';
import {disposeObject} from './tactics-render';
import type {TrainingPiece} from './training-model';
const piece=(kind:TrainingPiece['kind']):TrainingPiece=>({id:'test',kind,x:20,y:12,ex:80,ey:52,label:''});
it('maps the entire editable pitch to the same 3D coordinates',()=>{expect(trainingPosition(0,0).toArray()).toEqual([-50,0,-32]);expect(trainingPosition(100,64).toArray()).toEqual([50,0,32]);expect(trainingPosition(50,32,1.65).toArray()).toEqual([0,1.65,0]);});
it('keeps a portable goal at its placed position with the same footprint',()=>{const g=trainingObject(piece('goal'));const bounds=new THREE.Box3().setFromObject(g);expect(g.position.toArray()).toEqual([-30,0,-20]);expect(bounds.min.toArray()).toEqual([-34,0,-22]);expect(bounds.max.x).toBe(-26);expect(bounds.max.z).toBe(-18);disposeObject(g);});
it('keeps arrow endpoints and handles a zero-length arrow safely',()=>{const p=piece('arrow'),a=trainingObject(p) as THREE.ArrowHelper;a.updateMatrixWorld(true);const tip=a.cone.localToWorld(new THREE.Vector3());expect(tip.x).toBeCloseTo(30);expect(tip.z).toBeCloseTo(20);expect(a.position.y).toBe(.15);disposeObject(a);const zero=trainingObject({...p,ex:p.x,ey:p.y});expect(zero.children).toHaveLength(0);disposeObject(zero);});
