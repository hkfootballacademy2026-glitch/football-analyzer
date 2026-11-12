import { FFmpeg, FFFSType } from '@ffmpeg/ffmpeg';
import type { Drawing } from './domain';
import {drawShapes} from './drawing';
type Clip={start:number;end:number;speed:number;subtitle:string;drawings:Drawing[]};
export async function softwareExport(file:File,clips:Clip[],signal:AbortSignal,progress:(n:number)=>void):Promise<Blob>{
 const ff=new FFmpeg();let wasmURL='';const stop=()=>ff.terminate();signal.addEventListener('abort',stop);
 const check=()=>{if(signal.aborted)throw Error('キャンセルしました')};
 try{
 check();const parts:Blob[]=[];
 for(let i=0;i<2;i++){const r=await fetch('/ffmpeg/core-'+i+'.bin',{signal});if(!r.ok)throw Error('動画変換エンジンを読み込めません。通信状態を確認してください');parts.push(await r.blob());}
 check();wasmURL=URL.createObjectURL(new Blob(parts,{type:'application/wasm'}));await ff.load({coreURL:new URL('/ffmpeg/ffmpeg-core.js',location.href).href,wasmURL});check();
 await ff.createDir('/input');await ff.mount(FFFSType.WORKERFS,{blobs:[{name:'source',data:file}]},'/input');
 let lastLog='';ff.on('log',({message})=>{lastLog=message});
 for(let i=0;i<clips.length;i++){
 check();const clip=clips[i];const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d')!;drawShapes(ctx,clip.drawings,1280,720);
 if(clip.subtitle.trim()){await document.fonts.ready;ctx.font='32px sans-serif';const lines:string[]=[];for(const paragraph of clip.subtitle.split('\n')){let line='';for(const char of paragraph){if(ctx.measureText(line+char).width>1184){lines.push(line);line=char}else line+=char}lines.push(line)}const visible=lines.slice(0,6);if(lines.length>6)visible[5]+='…';const top=640-visible.length*42-32;ctx.fillStyle='#000c';ctx.fillRect(0,top,1280,640-top);ctx.fillStyle='#fff';ctx.textBaseline='top';visible.forEach((line,j)=>ctx.fillText(line,48,top+16+j*42))}
 const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('字幕画像を生成できません')),'image/png'));await ff.writeFile('overlay.png',new Uint8Array(await png.arrayBuffer()));
 const filter=`[0:v]setpts=(PTS-STARTPTS)/${clip.speed},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[base];[base][1:v]overlay=0:0:shortest=1,format=yuv420p[out]`;
 const tempo=clip.speed<.5?'atempo=0.5,atempo='+String(clip.speed/.5):'atempo='+String(clip.speed);
 const code=await ff.exec(['-ss',String(clip.start),'-t',String(clip.end-clip.start),'-threads','1','-i','/input/source','-loop','1','-framerate','24','-i','overlay.png','-filter_complex_threads','1','-filter_complex',filter,'-map','[out]','-map','0:a?','-af','asetpts=PTS-STARTPTS,'+tempo+',apad','-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-r','24','-c:v','libx264','-threads','1','-preset','ultrafast','-crf','25','-t',String((clip.end-clip.start)/clip.speed),'-y',`clip${i}.mp4`],600000);
 check();if(code!==0)throw Error('動画変換に失敗しました。対応外の動画形式または処理時間超過です。 '+lastLog.slice(-160));progress(Math.round((i+1)/(clips.length+1)*100));
 }
 await ff.writeFile('list.txt',clips.map((_,i)=>`file 'clip${i}.mp4'`).join('\n'));
 if(await ff.exec(['-f','concat','-safe','0','-i','list.txt','-c','copy','-movflags','+faststart','-y','highlight.mp4'],60000)!==0)throw Error('動画の結合に失敗しました');
 check();const data=await ff.readFile('highlight.mp4');if(typeof data==='string')throw Error('動画データが不正です');return new Blob([new Uint8Array(data)],{type:'video/mp4'});
 }finally{signal.removeEventListener('abort',stop);ff.terminate();if(wasmURL)URL.revokeObjectURL(wasmURL)}
}
