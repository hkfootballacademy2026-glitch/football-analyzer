// Snapshot external picker files before WORKERFS uses FileReaderSync in its worker.
// Small inputs become owned Blobs; large inputs stream to a temporary OPFS file.
const MEMORY_BUDGET = 128 * 1024 * 1024;
const CHUNK = 4 * 1024 * 1024;
export class ExportSourceReadError extends Error {
 constructor(public sourceId:string, name:string){super('元動画「'+name+'」を読み取れません。「クリップ」→「このクリップの元動画を選択」から同じ動画を選び直してください。写真・クラウド上の動画は端末にダウンロードしてから選択してください。');this.name='ExportSourceReadError'}
}
export async function prepareExportSources(ids:string[],files:Map<string,File>,signal:AbortSignal){
 const blobs:Blob[]=[];let remaining=MEMORY_BUDGET;let storage:FileSystemDirectoryHandle|undefined,folder:FileSystemDirectoryHandle|undefined,folderName='';
 const check=()=>{if(signal.aborted)throw new DOMException('キャンセルしました','AbortError')};
 const dispose=async()=>{if(storage&&folderName)await storage.removeEntry(folderName,{recursive:true}).catch(()=>{})};
 try{
  for(const id of ids){check();const source=files.get(id);if(!source)throw Error('元動画を選択してください: '+id);if(!source.size)throw new ExportSourceReadError(id,source.name);
   let writer:FileSystemWritableFileStream|undefined;const chunks:ArrayBuffer[]=[];let handle:FileSystemFileHandle|undefined;
   try{
    if(source.size>remaining){
     if(!navigator.storage?.getDirectory)throw Error('この端末では大きな元動画の作業領域を用意できません。動画を短く分けるか、PCで書き出してください。');
     storage??=await navigator.storage.getDirectory();if(!folder){folderName='highlight-export-'+crypto.randomUUID();folder=await storage.getDirectoryHandle(folderName,{create:true})}
     handle=await folder.getFileHandle('source-'+blobs.length,{create:true});writer=await handle.createWritable();
    }
    for(let offset=0;offset<source.size;offset+=CHUNK){check();let bytes:ArrayBuffer;try{bytes=await source.slice(offset,Math.min(source.size,offset+CHUNK)).arrayBuffer()}catch{check();throw new ExportSourceReadError(id,source.name)}check();if(writer)await writer.write(bytes);else chunks.push(bytes)}
    if(writer){await writer.close();writer=undefined;check();blobs.push(await handle!.getFile())}else{blobs.push(new Blob(chunks,{type:source.type}));remaining-=source.size}
   }catch(error){await writer?.abort().catch(()=>{});check();if(error instanceof DOMException&&error.name==='QuotaExceededError')throw Error('動画書き出し用の空き容量が不足しています。端末の空き容量を増やすか、短い動画で書き出してください。');throw error}
  }
  check();return {blobs,dispose};
 }catch(error){await dispose();throw error}
}
