import {tr} from './workspace-tools';
import {useEffect,useRef,useState} from 'react';
import {isRetainedFile,retainSource,retainedSources,removeRetainedSource,mediaSize,type RetainedSource} from './retained-media';
export function RetainedMediaStatus({files,ids,collapsible=false}:{files:Map<string,File>;ids:string[];collapsible?:boolean}){
 const [enabled,setEnabled]=useState(()=>localStorage.getItem('fa-retain-videos')!=='off'),[states,setStates]=useState<Record<string,{text:string;saving:boolean;error?:boolean}>>({}),[retry,setRetry]=useState(0);const started=useRef(new Map<string,File>()),alive=useRef(true),key=JSON.stringify(ids);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
 useEffect(()=>{
  if(!enabled)return;
  for(const id of ids){const file=files.get(id);if(!file||started.current.get(id)===file)continue;started.current.set(id,file);
   const update=(text:string,saving=false,error=false)=>{if(alive.current&&started.current.get(id)===file)setStates(s=>({...s,[id]:{text,saving,error}}))};
   if(isRetainedFile(file)){update('端末に保存済み');continue}update('端末に保存中…',true);
   void retainSource(id,file,n=>update('端末に保存中 '+n+'%',true)).then(()=>update('端末に保存済み')).catch(e=>update('保存できません：'+(e instanceof Error?e.message:String(e)),false,true));
  }
 },[files,key,enabled,retry]);
 const saving=ids.some(id=>states[id]?.saving);
 useEffect(()=>{if(!saving)return;const leave=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave)},[saving]);
 const content=<><label><input type="checkbox" checked={enabled} disabled={saving} onChange={e=>{setEnabled(e.target.checked);localStorage.setItem('fa-retain-videos',e.target.checked?'on':'off')}}/>{tr("次回のため元動画を端末に保存")}</label><p className="hint">{tr("端末内のアプリ専用領域にコピーします。保存完了まで画面を開いてください。元の動画はそのまま残り、サーバーには送信しません。")}</p>{ids.map(id=>{const file=files.get(id),state=states[id];return file&&<p key={id} role={state?.error?'alert':'status'}>{file.name}（{mediaSize(file.size)}） · {state?.text??(enabled?tr("保存を準備中"):tr("今回だけ使用"))}</p>})}{ids.some(id=>states[id]?.error)&&<button className="button" onClick={()=>{started.current.clear();setRetry(n=>n+1)}}>{tr("動画の保存を再試行")}</button>}<p className="hint">{tr("保存済みのコピーは「設定」で削除できます。チェックを外しても保存済みの動画は残ります。")}</p></>;
 const present=ids.filter(id=>files.has(id)),error=present.some(id=>states[id]?.error);
 const summary=saving?tr("端末に保存中…"):error?tr("保存できません（詳細を確認）"):present.length&&present.every(id=>states[id]?.text==='端末に保存済み')?tr("端末に保存済み"):enabled?(present.length?tr("保存を準備中"):tr("動画を選ぶと自動保存")):tr("自動保存 OFF");
 return collapsible?<details className="retained-media-status retained-media-disclosure"><summary>{tr("動画の端末保存")}<span role={error?'alert':'status'}>{summary}</span></summary>{content}</details>:<div className="retained-media-status">{content}</div>;
}
export function RetainedMediaManager({onRemove}:{onRemove:(id:string)=>void}){
 const [rows,setRows]=useState<RetainedSource[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);const refresh=()=>retainedSources().then(setRows).catch(e=>setError(String(e)));useEffect(()=>{void refresh()},[]);
 return <section className="panel"><h2>{tr("編集用の保存動画")}</h2><p>{tr("このブラウザーに保存した元動画のコピー：")}{rows.length}{tr("件 ·")}{mediaSize(rows.reduce((n,r)=>n+r.size,0))}</p><p>{tr("コピーを削除しても、写真・ファイルアプリの元動画や編集内容は残ります。次回は元動画の再選択が必要になります。JSONバックアップに動画本体は含まれません。")}</p>{rows.map(row=><div className="device-recording" key={row.id}><span><b>{row.name}</b><small>{mediaSize(row.size)} · {new Date(row.createdAt).toLocaleString()}</small></span><button className="button" disabled={busy} onClick={async()=>{if(!confirm('「'+row.name+'」のアプリ内コピーを削除しますか？元動画・編集内容は削除しません。'))return;setBusy(true);setError('');try{await removeRetainedSource(row.id);onRemove(row.id);await refresh()}catch(e){setError(String(e))}finally{setBusy(false)}}}>{tr("動画のコピーを削除")}</button></div>)}{error&&<p role="alert">{error}</p>}<p className="hint">{tr("同じ端末・同じブラウザーで復元できます。ブラウザーのデータ削除や空き容量の不足により消える場合があるため、元動画は保管してください。")}</p></section>;
}
