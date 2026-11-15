import {uid,type StudioClip} from './domain';
import {clipDuration,cutClip} from './highlight-model';

// The range is expressed in the clip's current playback seconds, not source seconds.
export function speedRangeSegments(clip:StudioClip,start:number,end:number,speed:number){
 const duration=clipDuration(clip);
 if(clip.freeze||![start,end,speed].every(Number.isFinite)||start<0||end>duration||end<=start||speed<.25||speed>2)throw Error('クリップ内の有効な開始・終了秒と速度を指定してください。');
 if(speed===clip.speed)return {clips:[structuredClone(clip)],selected:0};
 const selected=start>0?1:0,clips:StudioClip[]=[];
 if(start>0)clips.push(cutClip(clip,0,start));
 const middle=cutClip(clip,start,end),factor=clip.speed/speed;
 clips.push({...middle,speed,overlays:middle.overlays.map(o=>({...o,start:o.start*factor,end:o.end*factor,keys:o.keys.map(k=>({...k,time:k.time*factor}))})),effects:middle.effects?.map(e=>({...e,start:e.start*factor,end:e.end*factor,keys:e.keys.map(k=>({...k,time:k.time*factor}))}))});
 if(end<duration)clips.push(cutClip(clip,end,duration));
 // The first section retains the original identity; subsequent sections are independent clips.
 return {clips:clips.map((c,i)=>({...c,id:i?uid():clip.id})),selected};
}
