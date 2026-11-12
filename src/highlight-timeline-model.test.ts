import {describe,it,expect} from 'vitest';
import {adjustTrack} from './highlight-timeline-model';
import {effectSegments,viewAt,cutClip,clipDuration} from './highlight-model';
import type {StudioClip} from './domain';
describe('描画と演出の時間帯',()=>{
 const track={start:2,end:6,keys:[{time:2,x:.1},{time:4,x:.5},{time:6,x:.8}]};
 it('両端をドラッグしても記録点の時刻は維持する',()=>{const a=adjustTrack(track,'start',1,12);expect(a.start).toBe(3);expect(a.keys).toEqual(track.keys);expect(adjustTrack(track,'end',20,12).end).toBe(12);expect(adjustTrack(track,'start',20,12).start).toBeLessThan(6)});
 it('帯を動かすと記録点も同じ秒数だけ移動する',()=>{const a=adjustTrack(track,'body',2,12);expect(a.start).toBe(4);expect(a.end).toBe(8);expect(a.keys.map(k=>k.time)).toEqual([4,6,8]);expect(adjustTrack(track,'body',-20,12).start).toBe(0)});
 it('記録点を隣の点と重ねず形状データを保つ',()=>{const a=adjustTrack(track,1,20,12);expect(a.keys[1].time).toBeLessThan(6);expect(a.keys[1].x).toBe(.5);expect(a.keys[0]).toEqual(track.keys[0])});
 const clip=():StudioClip=>({id:'c',sourceId:'m',tagId:'',start:0,end:12,speed:1,freeze:0,subtitle:'',zoom:1,cx:.5,cy:.5,overlays:[],effects:[{id:'e',start:2,end:8,zoom:2,cx:.3,cy:.4,keys:[{time:5,zoom:3,cx:.7,cy:.6}]}]});
 it('独立したズームと記録点をプレビューと出力区間に反映する',()=>{const c=clip();expect(viewAt(c,1).zoom).toBe(1);expect(viewAt(c,3).zoom).toBe(2);expect(viewAt(c,6).cx).toBe(.7);expect(viewAt(c,9).zoom).toBe(1);const parts=effectSegments(c);expect(parts.map(p=>p.zoom)).toEqual([1,2,3,1]);expect(parts.map(p=>p.start)).toEqual([0,2,5,8]);expect(parts.reduce((n,p)=>n+clipDuration(p),0)).toBe(12)});
 it('演出の途中で分割しても位置と時間を維持する',()=>{const c=clip(),right=cutClip(c,6,12);expect(right.effects?.[0].start).toBe(0);expect(right.effects?.[0].end).toBe(2);expect(viewAt(right,1).zoom).toBe(3);expect(viewAt(right,1).cx).toBe(.7)});
});
