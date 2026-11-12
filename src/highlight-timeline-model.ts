export type TimedTrack={start:number;end:number;keys:{time:number}[]};
export type TimelinePart='start'|'end'|'body'|number;
export function adjustTrack<T extends TimedTrack>(track:T,part:TimelinePart,delta:number,duration:number):T{
 const step=Math.min(1/30,duration/10),snap=(n:number)=>Math.round(n/step)*step,clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
 if(part==='start')return {...track,start:clamp(snap(track.start+delta),0,Math.max(0,track.end-step))};
 if(part==='end')return {...track,end:clamp(snap(track.end+delta),track.start+step,duration)};
 if(part==='body'){const shift=clamp(snap(delta),-track.start,duration-track.end);const keys=track.keys.map(k=>({...k,time:clamp(k.time+shift,0,duration)})).filter((k,i,all)=>i===all.length-1||Math.abs(k.time-all[i+1].time)>.0001);return {...track,start:track.start+shift,end:track.end+shift,keys}}
 const key=track.keys[part];if(!key)return track;const before=track.keys[part-1]?.time,after=track.keys[part+1]?.time;return {...track,keys:track.keys.map((k,i)=>i===part?{...k,time:clamp(snap(k.time+delta),before===undefined?0:before+.001,after===undefined?duration:after-.001)}:k)};
}
