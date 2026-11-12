// Keep existing URLs alive when a different source is added or restored.
export class PreviewSources {
 private entries=new Map<string,{file:File;url:string}>();
 update(files:Map<string,File>){
  for(const [id,item] of this.entries)if(files.get(id)!==item.file){URL.revokeObjectURL(item.url);this.entries.delete(id)}
  for(const [id,file] of files)if(!this.entries.has(id))this.entries.set(id,{file,url:URL.createObjectURL(file)});
  return new Map([...this.entries].map(([id,item])=>[id,item.url]));
 }
 dispose(){for(const item of this.entries.values())URL.revokeObjectURL(item.url);this.entries.clear()}
}
