import {kitPalette} from './tactic-kits';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Piece} from './domain';

// Batch the anatomy by material: detail without a draw call for every limb.
export function playerFigure(p:Piece,numbers:boolean){
 const group=new THREE.Group(),kit=kitPalette(p);
 const palette={shirt:kit.shirt,trim:kit.trim,skin:'#d3a17d',hair:'#302a25',boot:'#202a30',sole:'#d7dedb',white:'#f7f8ed'};
 const bins=new Map<string,THREE.BufferGeometry[]>();
 const add=(geometry:THREE.BufferGeometry,key:keyof typeof palette,position:THREE.Vector3,scale=new THREE.Vector3(1,1,1),rotation=new THREE.Quaternion())=>{geometry.applyMatrix4(new THREE.Matrix4().compose(position,rotation,scale));const list=bins.get(key)??[];list.push(geometry);bins.set(key,list)};
 const ellipsoid=(key:keyof typeof palette,x:number,y:number,z:number,rx:number,ry:number,rz:number)=>add(new THREE.SphereGeometry(1,12,8),key,new THREE.Vector3(x,y,z),new THREE.Vector3(rx,ry,rz));
 const limb=(key:keyof typeof palette,a:number[],b:number[],r1:number,r2=r1)=>{const start=new THREE.Vector3(a[0],a[1],a[2]),end=new THREE.Vector3(b[0],b[1],b[2]),delta=end.clone().sub(start);add(new THREE.CylinderGeometry(r2,r1,delta.length(),10),key,start.add(end).multiplyScalar(.5),new THREE.Vector3(1,1,1),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()))};
 add(new THREE.CylinderGeometry(.30,.23,.64,16),'shirt',new THREE.Vector3(0,1.38,0),new THREE.Vector3(.64,1,1));
 ellipsoid('shirt',0,1.65,0,.17,.13,.29);
 limb('trim',[0,1.70,0],[0,1.75,0],.12,.105);
 limb('skin',[0,1.73,0],[0,1.86,0],.085);
 ellipsoid('skin',.005,2.0,0,.195,.235,.17);
 add(new THREE.SphereGeometry(1,16,10,0,Math.PI*2,0,1.25),'hair',new THREE.Vector3(.005,2.0,0),new THREE.Vector3(.203,.245,.178));
 ellipsoid('skin',.192,1.99,0,.035,.047,.035);
 for(const sign of [-1,1]){
  ellipsoid('skin',0,1.98,sign*.17,.045,.066,.035);
  ellipsoid('hair',.18,2.04,sign*.065,.012,.015,.022);
  limb('trim',[0,1.08,sign*.135],[.015,.87,sign*.15],.14,.13);
  limb('skin',[0,1.0,sign*.145],[.055,.60,sign*.18],.105,.085);
  ellipsoid('skin',.055,.60,sign*.18,.086,.085,.087);
  limb('shirt',[.055,.55,sign*.18],[-.025,.18,sign*.20],.085,.062);
  limb('trim',[.0485,.52,sign*.1816],[.0399,.48,sign*.1838],.088,.085);
  ellipsoid('boot',.075,.10,sign*.20,.20,.095,.102);
  ellipsoid('sole',.075,.045,sign*.20,.20,.025,.103);
  limb('white',[.10,.175,sign*.20],[.20,.135,sign*.20],.013);
  limb('shirt',[0,1.64,sign*.28],[.025,1.43,sign*.39],.12,.10);
  limb('trim',[.023,1.447,sign*.381],[.025,1.43,sign*.39],.108,.107);
  limb('skin',[.03,1.41,sign*.40],[.075,1.23,sign*.43],.085,.065);
  ellipsoid('skin',.075,1.23,sign*.43,.068,.07,.068);
  limb('skin',[.075,1.23,sign*.43],[.18,1.07,sign*.40],.067,.05);
  ellipsoid('skin',.19,1.04,sign*.40,.06,.085,.055);

 }
 for(const [key,geometries] of bins){const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(merged)group.add(new THREE.Mesh(merged,new THREE.MeshStandardMaterial({color:palette[key as keyof typeof palette],roughness:key==='boot'?.55:.88})));}
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d')!;
 ctx.fillStyle=kit.trim;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 80px sans-serif';if(numbers)ctx.fillText(p.number,64,68,110);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const number=new THREE.Mesh(new THREE.PlaneGeometry(.34,.36),new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:1}));number.rotation.y=-Math.PI/2;number.position.set(-.201,1.43,0);number.name='jersey-number';number.visible=numbers;group.add(number);
 const crest=new THREE.Mesh(new THREE.CircleGeometry(.045,5),new THREE.MeshStandardMaterial({color:palette.trim,roughness:1}));crest.rotation.y=Math.PI/2;crest.position.set(.185,1.53,-.13);group.add(crest);
 group.name='player-figure';return group;
}

export function footballFigure(){
 const group=new THREE.Group();group.name='football-figure';
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.43,32,20),new THREE.MeshStandardMaterial({color:'#f6f5ed',roughness:.7}));group.add(ball);
 const ico=new THREE.IcosahedronGeometry(1,0),positions=ico.getAttribute('position'),vertices:THREE.Vector3[]=[],faces:number[][]=[];
 for(let i=0;i<positions.count;i+=3){const face:number[]=[];for(let j=0;j<3;j++){const v=new THREE.Vector3().fromBufferAttribute(positions,i+j).normalize();let index=vertices.findIndex(a=>a.distanceTo(v)<.001);if(index<0){index=vertices.length;vertices.push(v)}face.push(index)}faces.push(face)}ico.dispose();
 const neighbors=vertices.map(()=>new Set<number>());for(const face of faces)for(const a of face)for(const b of face)if(a!==b)neighbors[a].add(b);
 const cut=(a:number,b:number)=>vertices[a].clone().multiplyScalar(2).add(vertices[b]).normalize();
 const black:number[]=[],seams:number[]=[];
 const edge=(a:THREE.Vector3,b:THREE.Vector3)=>{for(let i=0;i<8;i++)for(const t of [i/8,(i+1)/8])seams.push(...a.clone().lerp(b,t).normalize().multiplyScalar(.435).toArray())};
 for(let i=0;i<vertices.length;i++){
  const axis=vertices[i],tangent=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize(),bitangent=new THREE.Vector3().crossVectors(axis,tangent);
  const ring=[...neighbors[i]].map(j=>cut(i,j)).sort((a,b)=>Math.atan2(a.dot(bitangent),a.dot(tangent))-Math.atan2(b.dot(bitangent),b.dot(tangent)));
  for(let j=0;j<ring.length;j++){const a=ring[j],b=ring[(j+1)%ring.length];edge(a,b);const point=(u:number,v:number)=>axis.clone().multiplyScalar(1-u-v).addScaledVector(a,u).addScaledVector(b,v).normalize().multiplyScalar(.434);for(let u=0;u<4;u++)for(let v=0;v<4-u;v++){for(const [x,y] of [[u,v],[u+1,v],[u,v+1]])black.push(...point(x/4,y/4).toArray());if(u+v<3)for(const [x,y] of [[u+1,v],[u+1,v+1],[u,v+1]])black.push(...point(x/4,y/4).toArray())}}
 }
 for(const [a,b,c] of faces){const hex=[cut(a,b),cut(b,a),cut(b,c),cut(c,b),cut(c,a),cut(a,c)];for(let i=0;i<6;i++)edge(hex[i],hex[(i+1)%6])}
 const panels=new THREE.BufferGeometry();panels.setAttribute('position',new THREE.Float32BufferAttribute(black,3));panels.computeVertexNormals();group.add(new THREE.Mesh(panels,new THREE.MeshStandardMaterial({color:'#172028',roughness:.8,side:THREE.DoubleSide})));
 const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(seams,3));group.add(new THREE.LineSegments(lines,new THREE.LineBasicMaterial({color:'#a0a5a3',transparent:true,opacity:.45})));
 group.position.y=.43;return group;
}
