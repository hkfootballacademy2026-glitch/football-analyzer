import {describe,it,expect} from 'vitest';
import {homography,project,groundDistance,makeTemplate,locate} from './tracking-math';
describe('映像追跡と平面距離',()=>{
 const points=[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}];
 it('実寸への射影と距離を計算する',()=>{expect(groundDistance(points,100,60,{x:.2,y:.2},{x:.6,y:.2})).toBeCloseTo(50);const q=[{x:.2,y:.2},{x:.8,y:.3},{x:.9,y:.9},{x:.1,y:.8}];const h=homography(q,105,68);expect(project(h,q[2]).x).toBeCloseTo(105);expect(project(h,q[2]).y).toBeCloseTo(68)});
 it('交差・縮退・範囲外の計測を拒否する',()=>{expect(()=>homography([points[0],points[2],points[1],points[3]],100,60)).toThrow();expect(()=>homography(Array(4).fill(points[0]),100,60)).toThrow();expect(()=>groundDistance(points,100,60,{x:0,y:0},{x:.2,y:.2})).toThrow();});
 it('模様の移動を検出し見失いを低スコアで示す',()=>{const a=new Float32Array(80*60),b=new Float32Array(80*60);for(let y=0;y<12;y++)for(let x=0;x<10;x++){const v=(x*57+y*31)%255;a[(20+y)*80+20+x]=v;b[(24+y)*80+26+x]=v}const box={x:20/80,y:20/60,w:10/80,h:12/60};const t=makeTemplate(a,80,60,box);const result=locate(b,80,60,t,box);expect(result.x).toBeCloseTo(26/80);expect(result.y).toBeCloseTo(24/60);expect(result.score).toBeGreaterThan(.99);expect(locate(new Float32Array(80*60),80,60,t,box).score).toBe(0)});
});
