import {it,expect,vi} from 'vitest';
import {PreviewSources} from './media-preview';
import {paintFrame} from './highlight-render';
import type {StudioClip} from './domain';
it('adding another clip never revokes or replaces the currently playing URL',()=>{
 let i=0;const make=vi.spyOn(URL,'createObjectURL').mockImplementation(()=>`blob:${++i}`),revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
 try{const pool=new PreviewSources(),a=new File(['a'],'a.mp4'),b=new File(['b'],'b.mp4');const first=pool.update(new Map([['a',a]]));const both=pool.update(new Map([['a',a],['b',b]]));expect(both.get('a')).toBe(first.get('a'));expect(revoke).not.toHaveBeenCalled();pool.update(new Map([['a',new File(['new'],'a.mp4')],['b',b]]));expect(revoke).toHaveBeenCalledWith(first.get('a'));pool.dispose();expect(revoke).toHaveBeenCalledTimes(3);expect(make).toHaveBeenCalledTimes(3)}finally{make.mockRestore();revoke.mockRestore()}
});
it('transient missing/invalid decoded frame retains the previous image and the next frame recovers',()=>{
 const ctx={drawImage:vi.fn(),fillRect:vi.fn(),fillStyle:''} as unknown as CanvasRenderingContext2D;
 const c={id:'a',sourceId:'m',tagId:'',start:0,end:4,speed:1,freeze:0,zoom:1,cx:.5,cy:.5,subtitle:'',overlays:[]} as StudioClip;
 const v={readyState:1,videoWidth:1920,videoHeight:1080} as HTMLVideoElement;
 expect(paintFrame(ctx,v,c,0,1280,720)).toBe(false);expect(ctx.fillRect).not.toHaveBeenCalled();
 Object.assign(v,{readyState:2});vi.mocked(ctx.drawImage).mockImplementationOnce(()=>{throw new DOMException('decoder reset','InvalidStateError')});expect(paintFrame(ctx,v,c,0,1280,720)).toBe(false);expect(ctx.fillRect).not.toHaveBeenCalled();
 expect(paintFrame(ctx,v,c,0,1280,720)).toBe(true);expect(ctx.fillRect).toHaveBeenCalled();
});
