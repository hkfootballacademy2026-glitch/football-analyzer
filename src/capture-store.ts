import Dexie, {type Table} from 'dexie';
import {type Tag} from './domain';
export type CaptureSession={id:string;matchId:string;name:string;mime:string;status:'recording'|'ready';duration:number;tags:Tag[];createdAt:number};
type Chunk={sessionId:string;seq:number;blob:Blob};
class CaptureStore extends Dexie{
 sessions!:Table<CaptureSession,string>;chunks!:Table<Chunk,[string,number]>;
 constructor(){super('football-analyzer-captures-v1');this.version(1).stores({sessions:'id,matchId',chunks:'[sessionId+seq],sessionId'});}
}
export const captures=new CaptureStore();
export async function captureForMatch(matchId:string){return captures.sessions.where('matchId').equals(matchId).first()}
export async function appendCaptureChunk(sessionId:string,seq:number,blob:Blob,duration:number){await captures.transaction('rw',captures.chunks,captures.sessions,async()=>{await captures.chunks.put({sessionId,seq,blob});await captures.sessions.update(sessionId,{duration})})}
export async function captureFile(session:CaptureSession,fallback=new Map<number,Blob>()){
 const chunks=await captures.chunks.where('sessionId').equals(session.id).toArray();const parts=new Map(chunks.map(c=>[c.seq,c.blob]));fallback.forEach((blob,seq)=>parts.set(seq,blob));
 const sorted=[...parts].sort(([a],[b])=>a-b);if(!sorted.length||sorted.some(([seq],i)=>seq!==i))throw Error('録画データが不足しています。保存済みデータは保持されています。');
 return new File(sorted.map(([,blob])=>blob),session.name,{type:session.mime});
}
export function finishCaptureTags(tags:Tag[],duration:number):Tag[]{
 if(!Number.isFinite(duration)||duration<=0)return [];
 return tags.filter(t=>t.time<=duration).map(t=>({...t,start:Math.min(t.start,Math.max(0,duration-.01)),end:Math.min(duration,Math.max(t.end,t.time))})).filter(t=>t.end>t.start);
}
// Times are based on the recorder clock, never on chunk counts or timer ticks.
export class CaptureClock{
 private accumulated=0;private started:number|undefined;
 start(now=performance.now()){this.accumulated=0;this.started=now}
 pause(now=performance.now()){if(this.started!==undefined){this.accumulated+=Math.max(0,now-this.started);this.started=undefined}}
 resume(now=performance.now()){if(this.started===undefined)this.started=now}
 seconds(now=performance.now()){return (this.accumulated+(this.started===undefined?0:Math.max(0,now-this.started)))/1000}
}

export let captureLocked=false;
export function lockCapture(value:boolean){captureLocked=value;}

export async function readableCaptureDuration(file:File,estimated:number):Promise<number>{
 const url=URL.createObjectURL(file);
 try{return await new Promise<number>((resolve,reject)=>{
 const video=document.createElement('video');video.muted=true;video.playsInline=true;const timeout=setTimeout(()=>finish(Error('録画の再生を確認できません。保存済みのデータをファイルに退避してください。')),12000);
 function finish(error?:Error){clearTimeout(timeout);const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:estimated;const valid=video.videoWidth>0;video.onloadeddata=null;video.onerror=null;video.removeAttribute('src');video.load();if(error)reject(error);else if(!valid||duration<=0)reject(Error('再生可能な映像がありません。'));else resolve(duration)}
 video.onloadeddata=()=>finish();video.onerror=()=>finish(Error('録画映像を再生できません。保存済みデータは保持されています。'));video.src=url;video.load();
 })}finally{URL.revokeObjectURL(url)}
}
