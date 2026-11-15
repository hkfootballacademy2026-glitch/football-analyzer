import {useState} from 'react';
export function SpeedRangeControls({duration,current,speed,freeze,available,onApply}:{duration:number;current:number;speed:number;freeze:boolean;available:number;onApply:(start:number,end:number,speed:number)=>void}){
 const [start,setStart]=useState('0'),[end,setEnd]=useState(String(duration)),[rate,setRate]=useState(speed);
 const from=Number(start),to=Number(end),valid=start.trim()!==''&&end.trim()!==''&&Number.isFinite(from)&&Number.isFinite(to)&&from>=0&&to<=duration&&to>from;
 const extra=(from>0?1:0)+(to<duration?1:0),position=Math.max(0,Math.min(duration,current));
 return <section className="speed-range-controls" aria-label="区間の速度調整"><p>選択中クリップの開始・終了秒を指定してください。指定区間を自動で分割して速度を変更し、前後は元の速度を保ちます。</p>
 <fieldset disabled={freeze}><div className="form-grid"><label>開始（クリップ内の秒）<input aria-label="速度変更の開始秒" type="number" min="0" max={duration} step="any" value={start} onChange={e=>setStart(e.target.value)}/></label><label>終了（クリップ内の秒）<input aria-label="速度変更の終了秒" type="number" min="0" max={duration} step="any" value={end} onChange={e=>setEnd(e.target.value)}/></label><label>区間の速度<select aria-label="区間の速度" value={rate} onChange={e=>setRate(Number(e.target.value))}>{[.25,.5,1,2].map(v=><option key={v} value={v}>{v}倍</option>)}</select></label></div>
 <div className="actions"><button type="button" onClick={()=>setStart(String(position))}>現在位置を開始に</button><button type="button" onClick={()=>setEnd(String(position))}>現在位置を終了に</button><button type="button" onClick={()=>{setStart('0');setEnd(String(duration));}}>クリップ全体を指定</button></div>
 <p>現在の速度：{speed}倍 / クリップの長さ：{duration.toFixed(2)}秒</p>
 {valid&&<p>指定区間 {from.toFixed(2)}〜{to.toFixed(2)}秒 → 変更後の区間長 {((to-from)*speed/rate).toFixed(2)}秒</p>}
 {!valid&&<p role="status">開始は0秒以上、終了は開始より後でクリップの長さ以内にしてください。</p>}
 {valid&&extra>available&&<p role="status">分割するとクリップ数の上限（500件）を超えます。</p>}
 <button type="button" disabled={!valid||extra>available||rate===speed} onClick={()=>onApply(from,to,rate)}>指定区間に速度を適用</button></fieldset>
 {freeze&&<p>静止クリップは「拡大/縮小」の静止秒数で長さを変更できます。</p>}
 </section>;
}
