import {uid,type StudioClip} from './domain';
export type ImportedVideo={file:File;clip:StudioClip};
export function videoDuration(file:File,signal:AbortSignal):Promise<number>{
 return new Promise((resolve,reject)=>{if(signal.aborted){reject(new DOMException('キャンセルしました','AbortError'));return;}const video=document.createElement('video'),url=URL.createObjectURL(file);let done=false;
 const finish=(error?:Error)=>{if(done)return;done=true;const duration=video.duration;clearTimeout(timer);signal.removeEventListener('abort',abort);video.onloadedmetadata=null;video.onerror=null;video.removeAttribute('src');video.load();URL.revokeObjectURL(url);if(error)reject(error);else resolve(duration);};
 const abort=()=>finish(new DOMException('キャンセルしました','AbortError')),timer=setTimeout(()=>finish(Error('読み込みがタイムアウトしました')),30000);
 signal.addEventListener('abort',abort,{once:true});video.preload='metadata';video.onloadedmetadata=()=>Number.isFinite(video.duration)&&video.duration>0?finish():finish(Error('動画の長さを確認できません'));video.onerror=()=>finish(Error('この動画を再生できません'));video.src=url;
 });
}
export async function importVideos(files:File[],available:number,signal:AbortSignal,progress:(done:number,total:number)=>void,probe=videoDuration){
 if(files.length>available)throw Error('追加後のクリップは500件以内にしてください。');const videos:ImportedVideo[]=[],errors:string[]=[];
 for(let i=0;i<files.length;i++){if(signal.aborted)throw new DOMException('キャンセルしました','AbortError');const file=files[i];progress(i,files.length);try{const duration=await probe(file,signal);if(!Number.isFinite(duration)||duration<=0)throw Error('動画の長さを確認できません');videos.push({file,clip:{id:uid(),sourceId:uid(),tagId:'',name:file.name.slice(0,200),start:0,end:duration,speed:1,freeze:0,subtitle:'',telopEnabled:true,zoom:1,cx:.5,cy:.5,overlays:[]}});}catch(error){if(signal.aborted)throw new DOMException('キャンセルしました','AbortError');errors.push(file.name+'：'+(error instanceof Error?error.message:String(error)));}progress(i+1,files.length);}
 if(signal.aborted)throw new DOMException('キャンセルしました','AbortError');return {videos,errors};
}
