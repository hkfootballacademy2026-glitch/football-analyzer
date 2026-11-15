import type {Piece,Tactic,TacticEffect} from './domain';
import {pieceModel,pathModel} from './tactics-render';
import {tacticEffectsModel} from './tactic-effects';
import {pitchMarkings,courtDepthScale} from './pitch-markings';
import './training.css';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {disposeObject,pitchCameraDistance} from './tactics-render';
import {trainingObject,trainingPosition} from './training-3d-scene';
import {isTrainingDrawing} from './training-drawing';
import type {TrainingPiece} from './training-model';

export type PitchView='diagonal'|'side'|'goal'|'player'|'ball';
type View=PitchView;
export function Training3D({pieces,onBack,initialView='diagonal',tactic,onCanvas}:{pieces:TrainingPiece[];onBack:()=>void;initialView?:View;tactic?:{pieces:Piece[];effects:TacticEffect[];frames:Tactic['frames'];court?:Tactic['court'];display?:Tactic['display']};onCanvas?:(canvas:HTMLCanvasElement|null)=>void}){
 const host=useRef<HTMLDivElement>(null),actions=useRef<{view:()=>void;zoom:(factor:number)=>void}|undefined>(undefined);
 const [view,setView]=useState<View>(initialView),[player,setPlayer]=useState(''),[error,setError]=useState('');
 const tacticRef=useRef(tactic);tacticRef.current=tactic;const canvasCallback=useRef(onCanvas);canvasCallback.current=onCanvas;
 const latest=useRef(pieces);latest.current=pieces;const update=useRef<(()=>void)|undefined>(undefined);
 const players=pieces.filter(p=>p.kind==='home'||p.kind==='away');
 const selected=players.find(p=>p.id===player)??players[0];
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let renderer:THREE.WebGLRenderer|undefined,controls:OrbitControls|undefined,observer:ResizeObserver|undefined;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#122b23');
  const camera=new THREE.PerspectiveCamera(55,1,.1,1000);
  const lost=(e:Event)=>{e.preventDefault();setError('3D表示を続けられません。2Dに戻り、もう一度3Dを開いてください。');};
  try{
   renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
   renderer.domElement.setAttribute('aria-label','共通3D配置図');renderer.domElement.setAttribute('role','img');
   renderer.domElement.addEventListener('webglcontextlost',lost);element.appendChild(renderer.domElement);canvasCallback.current?.(renderer.domElement);
   scene.add(new THREE.HemisphereLight(0xffffff,0x365741,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(30,70,20);scene.add(light);
   const pitch=new THREE.Mesh(new THREE.PlaneGeometry(108,72),new THREE.MeshStandardMaterial({color:'#245d46',roughness:1}));pitch.rotation.x=-Math.PI/2;scene.add(pitch);
   const lines=pitchMarkings(tacticRef.current?.court).lines;
   for(const points of lines)scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(([x,y])=>trainingPosition(x,y,.03))),new THREE.LineBasicMaterial({color:0xb3cfc1})));
   scene.scale.z=courtDepthScale(tacticRef.current?.court);
   const objects=new Map<string,{object:THREE.Object3D;signature:string}>();
   controls=new OrbitControls(camera,renderer.domElement);controls.maxPolarAngle=Math.PI/2-.03;controls.minDistance=8;controls.maxDistance=350;controls.enableDamping=false;
   const render=()=>renderer?.render(scene,camera);
   const reset=()=>{
    if(!controls)return;
    const selected=latest.current.find(p=>p.id===player)??latest.current.find(p=>p.kind==='home'||p.kind==='away');
    const eye=view==='ball'?latest.current.find(p=>p.kind==='ball'):selected;
    if((view==='player'||view==='ball')&&eye){
     camera.position.copy(trainingPosition(eye.x,eye.y,view==='ball'? .65:1.65));
     const ball=latest.current.find(p=>p.kind==='ball'&&Math.hypot(p.x-eye.x,p.y-eye.y)>1);
     const target=ball?trainingPosition(ball.x,ball.y,.85):trainingPosition(eye.x+10,eye.y,1.65);
     controls.target.copy(target);controls.enabled=false;camera.lookAt(target);
    }else{
     controls.enabled=true;controls.target.set(0,0,0);
     const direction=new THREE.Vector3(...(view==='side'?[0,35,90]:view==='goal'?[-95,28,0]:[65,75,85]) as [number,number,number]).normalize();
     camera.position.copy(direction.multiplyScalar(pitchCameraDistance(camera,controls.target,direction)));controls.update();
    }
    render();
   };
   update.current=()=>{const current=latest.current;const observerId=current.find(p=>p.id===player)?.id??current.find(p=>p.kind==='home'||p.kind==='away')?.id;const visible=current.filter(p=>(view!=='player'&&view!=='ball')||p.id!==(view==='ball'?current.find(p=>p.kind==='ball')?.id:observerId));const ids=new Set(visible.map(p=>p.id));for(const [id,entry] of objects){if(!ids.has(id)){scene.remove(entry.object);disposeObject(entry.object);objects.delete(id);}}for(const p of visible){const original=tacticRef.current?.pieces.find(item=>item.id===p.id);const signature=JSON.stringify(original?{...original,x:0,y:0,angle:0,height:0}:isTrainingDrawing(p)?p:{...p,x:0,y:0,ex:0,ey:0});let entry=objects.get(p.id);if(!entry||entry.signature!==signature){if(entry){scene.remove(entry.object);disposeObject(entry.object);}entry={object:original?pieceModel(original,tacticRef.current?.display):trainingObject(p),signature};objects.set(p.id,entry);scene.add(entry.object);}if(!isTrainingDrawing(p)){entry.object.position.copy(trainingPosition(p.x,p.y,original?.height??0));if(original){entry.object.rotation.y=-original.angle*Math.PI/180;if(original.side==='ball')entry.object.scale.setScalar(original.ballScale??1);}}}
    const tactical=tacticRef.current;for(const name of ['shared-effects','shared-paths']){const old=scene.getObjectByName(name);if(old){scene.remove(old);disposeObject(old);}}if(tactical){const effects=tacticEffectsModel(tactical.effects,tactical.pieces,'');effects.name='shared-effects';scene.add(effects);const paths=pathModel(tactical.frames);paths.name='shared-paths';scene.add(paths);}if(view==='player'||view==='ball')reset();else render();};update.current();
   controls.addEventListener('change',render);
   observer=new ResizeObserver(()=>{const width=element.clientWidth,height=element.clientHeight;if(!width||!height)return;renderer!.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();reset();});observer.observe(element);
   actions.current={view:reset,zoom:factor=>{if(view==='player'||view==='ball'||!controls)return;camera.position.sub(controls.target).multiplyScalar(factor).clampLength(8,350).add(controls.target);controls.update();render();}};
  }catch{setError('この端末では3Dを表示できません。2Dで引き続き編集できます。');}
  return()=>{canvasCallback.current?.(null);update.current=undefined;actions.current=undefined;observer?.disconnect();controls?.dispose();disposeObject(scene);if(renderer){renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
 },[view,player,tactic?.court]);
 useEffect(()=>{update.current?.();},[pieces,tactic]);
 return <div className="training-three"><div className="actions" aria-label="3Dの視点">{([['diagonal','斜め'],['side','サイド'],['goal','ゴール側'],['player','選手目線'],...(tactic?([['ball','ボール視点']] as const):[])] as const).map(([key,label])=><button key={key} className={view===key?'button primary':'button'} aria-pressed={view===key} disabled={!!error||(key==='player'&&!players.length)||(key==='ball'&&!pieces.some(p=>p.kind==='ball'))} onClick={()=>setView(key)}>{label}</button>)}<button className="button" disabled={!!error} onClick={()=>actions.current?.view()}>視点をリセット</button><button className="button" aria-label="3Dを拡大" disabled={!!error||(view==='player'||view==='ball')} onClick={()=>actions.current?.zoom(.8)}>＋</button><button className="button" aria-label="3Dを縮小" disabled={!!error||view==='player'||view==='ball'} onClick={()=>actions.current?.zoom(1.25)}>−</button></div>
 {view==='player'&&<label className="field"><span>目線を確認する選手</span><select aria-label="目線を確認する選手" value={selected?.id??''} onChange={e=>setPlayer(e.target.value)}>{players.map(p=><option key={p.id} value={p.id}>{p.kind==='home'?'味方':'相手'} {p.label}</option>)}</select></label>}
 {error?<div role="alert" className="panel"><p>{error}</p><button className="button" onClick={onBack}>2Dに戻る</button></div>:<div ref={host} className="training-three-host"/>}
 <p className="hint">{(view==='player'||view==='ball')?'対象の位置からボールの方向を見ています（ボールがない場合は横方向）。目線の高さは模式的な1.65mです。':'ドラッグで回転、ホイール・ピンチで拡大縮小。右ドラッグ・2本指で平行移動できます。'} 配置の編集は2Dで行います。</p></div>;
}
