import fs from 'node:fs';
import path from 'node:path';
// Keep immutable assets so already-open tabs can load their original lazy chunks.
const mode=process.argv[2];
if(!['save','restore'].includes(mode))throw Error('Specify save or restore');
const source=mode==='save'?'dist/assets':'asset-history';
const dest=mode==='save'?'asset-history':'dist/assets';
if(fs.existsSync(source)){
 fs.mkdirSync(dest,{recursive:true});
 for(const entry of fs.readdirSync(source,{withFileTypes:true})){
  if(entry.isFile()&&/\.(js|css|wasm|map)$/.test(entry.name)){
   const from=path.join(source,entry.name),to=path.join(dest,entry.name);
   if(fs.existsSync(to)&&!fs.readFileSync(from).equals(fs.readFileSync(to)))throw Error('Immutable asset collision: '+entry.name);
   fs.copyFileSync(from,to);
  }
 }
}
