import {describe,it,expect} from 'vitest';
import {handles,hitDrawing,hitHandle,transformDrawing} from './drawing-edit';
import type {Drawing} from './domain';
const d:Drawing={id:'test',kind:'arrow',x:.2,y:.2,ex:.6,ey:.6,color:'#fff'};
describe('図形の直接操作',()=>{
it('線の端点を変更し反対側を維持する',()=>{expect(handles(d).map(h=>h.id)).toEqual(['start','end']);const n=transformDrawing(d,'end',.1,-.2);expect(n.x).toBe(.2);expect(n.ex).toBeCloseTo(.7);expect(n.ey).toBeCloseTo(.4)});
it('線から離れた点は選択しない',()=>{expect(hitDrawing(d,{x:.3,y:.5},1000,600)).toBe(false);expect(hitDrawing(d,{x:.4,y:.4},1000,600)).toBe(true)});
it('楕円に四方向のハンドルと楕円判定を使う',()=>{const c={...d,kind:'circle' as const};expect(handles(c).map(h=>h.id)).toEqual(['n','s','w','e']);expect(hitDrawing(c,{x:.2,y:.2},1000,600)).toBe(false);expect(hitDrawing(c,{x:.4,y:.4},1000,600)).toBe(true);expect(hitHandle(c,{x:.415,y:.2},1000,600,true)).toBe('n')});
it('自由線の点列全体を移動・拡縮する',()=>{const f={...d,kind:'freehand' as const,points:[{x:.2,y:.2},{x:.4,y:.4},{x:.6,y:.6}]};const m=transformDrawing(f,'move',-.5,.1);expect(m.points?.[0].x).toBe(0);expect(m.points?.[2].x).toBeCloseTo(.4);const r=transformDrawing(f,'se',.2,.1);expect(r.points?.[1].x).toBeCloseTo(.5);expect(r.points?.[2].y).toBeCloseTo(.7)});
it('文字は保存可能なサイズに制限する',()=>{const n=transformDrawing({...d,kind:'text',fontSize:32},'se',1,1);expect(n.fontSize).toBeLessThanOrEqual(72);expect(n.fontSize).toBeGreaterThanOrEqual(16)});
});

it('複数選手リンクの各輪を個別に動かせる',()=>{const link={...d,kind:'link' as const,nodes:[{x:.2,y:.3},{x:.5,y:.4},{x:.8,y:.3}]};expect(handles(link).map(h=>h.id)).toEqual(['node:0','node:1','node:2']);const moved=transformDrawing(link,'node:1',.1,.2);expect(moved.nodes?.[0]).toEqual(link.nodes[0]);expect(moved.nodes?.[1].x).toBeCloseTo(.6);expect(moved.nodes?.[1].y).toBeCloseTo(.6);expect(moved.nodes?.[2]).toEqual(link.nodes[2]);});
