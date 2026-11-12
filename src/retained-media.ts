import Dexie,{type Table} from 'dexie';
import {captureForMatch,captureFile} from './capture-store';
export type RetainedSource={id:string;storageId:string;name:string;size:number;type:string;lastModified:number;chunks:number;createdAt:number};
class MediaStore extends Dexie{
 sources!:Table<RetainedSource,string>;chunks!:Table<{storageId:string;seq:number;blob:Blob},[string,number]>;transfers!:Table<{id:string;touched:number},string>;
 constructor(){super('football-analyzer-media-v1');this.version(1).stores({sources:'id',chunks:'[storageId+seq],storageId',transfers:'id,touched'})}
}
const db=new MediaStore(),storedFiles=new WeakSet<File>(),active=new Map<string,{file:File;promise:Promise<void>}>();
export const mediaCopyBusy=()=>active.size>0;
export const isRetainedFile=(file:File)=>storedFiles.has(file);
const epoch=()=>localStorage.getItem('fa-media-generation');
const stale=()=>Error('保存中に端末内動画が削除されました。必要なら動画を選び直してください。');
export function retainSource(id:string,file:File,progress:(percent:number)=>void=()=>{}){
 if(storedFiles.has(file))return Promise.resolve();const previous=active.get(id);if(previous?.file===file)return previous.promise;
 const generation=epoch();const promise=(async()=>{
  if(previous)await previous.promise.catch(()=>{});if(epoch()!==generation)throw stale();
  if(!file.size)throw Error('空の動画は保存できません。');
  const estimate=await navigator.storage?.estimate?.().catch(()=>undefined);if(estimate?.quota!==undefined&&estimate.usage!==undefined&&file.size+16*1024*1024>estimate.quota-estimate.usage)throw Error('端末内の保存容量が不足しています。設定で不要な動画のコピーを削除してください。');
  const storageId=crypto.randomUUID(),chunkSize=4*1024*1024,count=Math.ceil(file.size/chunkSize);await db.transfers.put({id:storageId,touched:Date.now()});
  try{
   for(let seq=0;seq<count;seq++){
    if(epoch()!==generation)throw stale();
    // Materialize one small part, so a cloud-backed File reference is not retained.
    const blob=new Blob([await file.slice(seq*chunkSize,Math.min(file.size,(seq+1)*chunkSize)).arrayBuffer()]);
    await db.transaction('rw',db.chunks,db.transfers,async()=>{if(epoch()!==generation)throw stale();await db.chunks.put({storageId,seq,blob});await db.transfers.put({id:storageId,touched:Date.now()})});progress(Math.round((seq+1)/count*100));
   }
   await db.transaction('rw',db.sources,db.chunks,db.transfers,async()=>{
    if(epoch()!==generation)throw stale();const old=await db.sources.get(id);
    await db.sources.put({id,storageId,name:file.name,size:file.size,type:file.type,lastModified:file.lastModified,chunks:count,createdAt:Date.now()});
    if(old)await db.chunks.where('storageId').equals(old.storageId).delete();await db.transfers.delete(storageId);
   });storedFiles.add(file);
  }catch(error){await db.transaction('rw',db.chunks,db.transfers,async()=>{await db.chunks.where('storageId').equals(storageId).delete();await db.transfers.delete(storageId)}).catch(()=>{});throw error}
 })();active.set(id,{file,promise});void promise.finally(()=>{if(active.get(id)?.promise===promise)active.delete(id)}).catch(()=>{});return promise;
}
export async function restoreSource(id:string,name?:string,size?:number){
 const saved=await db.sources.get(id);
 if(saved&&(!name||saved.name===name)&&(size===undefined||saved.size===size)){
  const chunks=(await db.chunks.where('storageId').equals(saved.storageId).toArray()).sort((a,b)=>a.seq-b.seq);
  if(chunks.length!==saved.chunks||chunks.some((c,i)=>c.seq!==i)||chunks.reduce((n,c)=>n+c.blob.size,0)!==saved.size)throw Error('保存した元動画の一部がありません。元の動画を選び直してください。');
  const file=new File(chunks.map(c=>c.blob),saved.name,{type:saved.type,lastModified:saved.lastModified});storedFiles.add(file);return file;
 }
 const capture=await captureForMatch(id);if(capture?.status==='ready'&&(!name||name===capture.name)){const file=await captureFile(capture);storedFiles.add(file);return file}
 return undefined;
}
export async function retainedSources(){
 // Recover storage left by a browser shutdown; never touch a recent transfer.
 const abandoned=await db.transfers.where('touched').below(Date.now()-86400000).toArray();
 for(const item of abandoned)await db.transaction('rw',db.chunks,db.transfers,async()=>{const latest=await db.transfers.get(item.id);if(latest&&latest.touched<Date.now()-86400000){await db.chunks.where('storageId').equals(item.id).delete();await db.transfers.delete(item.id)}});
 return db.sources.toArray();
}
export async function removeRetainedSource(id:string){
 if(mediaCopyBusy())throw Error('動画の保存完了後に削除してください。');
 await db.transaction('rw',db.sources,db.chunks,db.transfers,async()=>{localStorage.setItem('fa-media-generation',crypto.randomUUID());const row=await db.sources.get(id);if(row){await db.chunks.where('storageId').equals(row.storageId).delete();await db.sources.delete(id)}});
}
export async function clearRetainedSources(){
 if(mediaCopyBusy())throw Error('動画の保存完了後に初期化してください。');
 await db.transaction('rw',db.sources,db.chunks,db.transfers,async()=>{localStorage.setItem('fa-media-generation',crypto.randomUUID());await db.sources.clear();await db.chunks.clear();await db.transfers.clear()});
}
export const mediaSize=(bytes:number)=>bytes>=1024**3?(bytes/1024**3).toFixed(2)+' GB':(bytes/1024**2).toFixed(1)+' MB';
