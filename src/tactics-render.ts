import {playerFigure,footballFigure} from './tactic-figures';
import * as THREE from 'three';
import {type Piece,type Tactic,syncDribbles} from './domain';
export function pieceModel(p:Piece,display={names:true,numbers:true}){
 const g=new THREE.Group();g.userData.pieceId=p.id;if(p.side==='ball')g.scale.setScalar(p.ballScale??1);
 const mesh=(geo:THREE.BufferGeometry,color:string,x:number,y:number,z:number)=>{const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);g.add(m);return m};
 if(p.side==='ball'){const figure=footballFigure();figure.scale.setScalar(2);figure.position.y=.86;g.add(figure)}
 else if(p.side==='cone'){const color=p.color??'#ff7c24';if(p.coneType==='disc'){mesh(new THREE.CylinderGeometry(.25,.9,.22,24),color,0,.11,0)}else if(p.coneType==='pole'){mesh(new THREE.CylinderGeometry(.7,.7,.15,20),color,0,.075,0);mesh(new THREE.CylinderGeometry(.1,.1,2.6,12),color,0,1.3,0)}else{mesh(new THREE.BoxGeometry(1.3,.12,1.3),color,0,.06,0);mesh(new THREE.ConeGeometry(.5,1.5,20),color,0,.85,0);mesh(new THREE.CylinderGeometry(.22,.29,.2,20),'#ffffff',0,.9,0)}}
 else{
 g.add(playerFigure(p,display.numbers));
 const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d')!;ctx.fillStyle='#153a2ecc';if((display.numbers&&p.number)||(display.names&&p.name))ctx.fillRect(0,0,512,160);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 72px sans-serif';if(display.numbers)ctx.fillText(p.number,256,73,490);ctx.font='bold 40px sans-serif';if(display.names)ctx.fillText(p.name??'',256,135,490);const texture=new THREE.CanvasTexture(c);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));label.name='player-label';label.visible=display.names||display.numbers;label.position.y=3.2;label.scale.set(5,1.56,1);g.add(label);
 }
 const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1.06,32),new THREE.MeshBasicMaterial({color:'#ffe16b',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;ring.name='selection';ring.visible=false;g.add(ring);if(p.side==='home'||p.side==='away'){const facing=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(0,.2,0),4,0xffe16b,1,.7);facing.name='facing';facing.visible=false;g.add(facing)}return g;
}
export function ballPaths(frames:Tactic['frames']){frames=syncDribbles(frames);return frames.slice(0,-1).flatMap((f,i)=>f.pieces.filter(p=>p.side==='ball'&&!!p.flight&&p.flight!=='none').flatMap(p=>{const q=frames[i+1].pieces.find(q=>q.id===p.id);return q&&Math.hypot(q.x-p.x,q.y-p.y)>.01?[{p,q,air:p.flight==='lofted',dribble:p.flight==='dribble',shot:p.flight==='shot',height:p.arcHeight??4}]:[]}))}
export function pathModel(frames:Tactic['frames']){const g=new THREE.Group();for(const {p,q,air,dribble,shot,height} of ballPaths(frames)){const points=Array.from({length:41},(_,i)=>{const t=i/40;return new THREE.Vector3(p.x+(q.x-p.x)*t-50,.12+(air?4*height*t*(1-t):0),p.y+(q.y-p.y)*t-32)});const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),dribble?new THREE.LineDashedMaterial({color:'#ffad66',dashSize:.3,gapSize:.4}):air?new THREE.LineDashedMaterial({color:'#ffd76c',dashSize:1,gapSize:.6}):new THREE.LineBasicMaterial({color:shot?'#ff6262':'#85eaff'}));line.computeLineDistances();g.add(line);const end=points.at(-1)!,direction=end.clone().sub(points.at(-2)!).normalize();g.add(new THREE.ArrowHelper(direction,end.clone().addScaledVector(direction,-1.2),1.2,shot?0xff6262:dribble?0xffad66:air?0xffd76c:0x85eaff,shot?1.2:.8,shot?.8:.5))}return g}
export function disposeObject(g:THREE.Object3D){g.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose();if(m.material)for(const mat of Array.isArray(m.material)?m.material:[m.material]){(mat as THREE.MeshStandardMaterial).map?.dispose();mat.dispose()}})}

export function goalModel(){
 const goals=new THREE.Group();goals.name='goals';
 for(const side of [-1,1]){
 const x=side*50,back=x+side*2,half=3.66,height=2.44;
 const post=(a:THREE.Vector3,b:THREE.Vector3)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,a.distanceTo(b),12),new THREE.MeshStandardMaterial({color:'#ffffff'}));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());goals.add(mesh)};
 post(new THREE.Vector3(x,0,-half),new THREE.Vector3(x,height,-half));post(new THREE.Vector3(x,0,half),new THREE.Vector3(x,height,half));post(new THREE.Vector3(x,height,-half),new THREE.Vector3(x,height,half));
 const points:THREE.Vector3[]=[];const net=(a:number[],b:number[])=>points.push(new THREE.Vector3(a[0],a[1],a[2]),new THREE.Vector3(b[0],b[1],b[2]));
 for(let z=-half;z<=half+.001;z+=7.32/24){net([back,0,z],[back,height,z]);net([x,height,z],[back,height,z])}
 for(let y=0;y<=height+.001;y+=height/8){net([back,y,-half],[back,y,half]);for(const z of [-half,half])net([x,y,z],[back,y,z])}
 for(let depth=0;depth<=2.001;depth+=.25){const nx=x+side*depth;net([nx,height,-half],[nx,height,half]);for(const z of [-half,half])net([nx,0,z],[nx,height,z])}
 goals.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:.55})));
 }return goals;
}

export function pitchCameraDistance(camera:THREE.PerspectiveCamera,target:THREE.Vector3,direction:THREE.Vector3){
 const inverse=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(direction,new THREE.Vector3(),camera.up)).invert();const tanY=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanX=tanY*camera.aspect;let distance=1;
 for(const x of [-55,55])for(const y of [0,4])for(const z of [-37,37]){const p=new THREE.Vector3(x,y,z).sub(target).applyQuaternion(inverse);distance=Math.max(distance,p.z+Math.abs(p.x)*1.08/tanX,p.z+Math.abs(p.y)*1.08/tanY)}return distance+2;
}
