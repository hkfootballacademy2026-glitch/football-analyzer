import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
fs.mkdirSync('public/mediapipe/wasm',{recursive:true});
fs.cpSync('node_modules/@mediapipe/tasks-vision/wasm','public/mediapipe/wasm',{recursive:true});
fs.mkdirSync('public/licenses',{recursive:true});
for(const pkg of ['react','react-dom','three','dexie','lucide-react','zod','@mediapipe/tasks-vision']){
 const dir=path.join(root,'node_modules',pkg);
 for(const name of fs.readdirSync(dir).filter(n=>/^licen[sc]e|^notice/i.test(n))){if(fs.statSync(path.join(dir,name)).isFile())fs.copyFileSync(path.join(dir,name),path.join(root,'public/licenses',pkg.replaceAll('/','-')+'-'+name));}
}

fs.mkdirSync('public/ffmpeg',{recursive:true});
fs.copyFileSync('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js','public/ffmpeg/ffmpeg-core.js');
const wasm=fs.readFileSync('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');
const split=Math.ceil(wasm.length/2);
for(let i=0;i<2;i++)fs.writeFileSync('public/ffmpeg/core-'+i+'.bin',wasm.subarray(i*split,(i+1)*split));
