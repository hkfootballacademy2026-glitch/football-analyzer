import {tr} from './workspace-tools';
import {useState} from 'react';
import type {Piece} from './domain';
import './player-perspective.css';

type Props={pieces:Piece[];observer?:Piece;active:boolean;busy:boolean;playing:boolean;onSelect:(id:string)=>void;onMove:(x:number,y:number)=>void;onLook:(direction:'left'|'right'|'front'|'ball')=>void;onOverview:()=>void;onSave:()=>void;onUndo:()=>void};
export function PlayerPerspective({pieces,observer,active,busy,playing,onSelect,onMove,onLook,onOverview,onSave,onUndo}:Props){
 const [moving,setMoving]=useState(false);
 const [compact,setCompact]=useState(false);
 const [mapOpen,setMapOpen]=useState(()=>!window.matchMedia('(max-width:640px), (max-height:500px)').matches);
 const players=pieces.filter(p=>p.side==='home'||p.side==='away');
 return <aside className="player-perspective" aria-label={tr("選手目線の確認")}>
  <div className="perspective-heading"><strong>{active?tr("選手目線で確認"):tr("選手からの見え方")}</strong><button disabled={busy} onClick={()=>active?onOverview():observer&&onSelect(observer.id)}>{active?tr("俯瞰に戻る"):tr("この選手の目線へ")}</button></div>
  <button className="perspective-collapse" aria-expanded={!compact} onClick={()=>setCompact(!compact)}>{compact?tr("目線の操作を表示"):tr("操作を小さくする")}</button>
  <div hidden={compact}>
  <label>{tr("見る選手")}<select aria-label={tr("目線にする選手")} value={observer?.id??''} disabled={busy} onChange={e=>onSelect(e.target.value)}>{players.map(p=><option key={p.id} value={p.id}>{p.side==='home'?tr("味方"):tr("相手")} {p.number} {p.name}</option>)}</select></label>
  {active&&<><div className="perspective-look"><button aria-label={tr("左を見回す")} disabled={busy} onClick={()=>onLook('left')}>{tr("← 左を見る")}</button><button disabled={busy} onClick={()=>onLook('front')}>{tr("正面")}</button><button aria-label={tr("右を見回す")} disabled={busy} onClick={()=>onLook('right')}>{tr("右を見る →")}</button><button disabled={busy||!pieces.some(p=>p.side==='ball')} onClick={()=>onLook('ball')}>{tr("ボールを見る")}</button></div><p>{tr("映像をドラッグして周囲を見回せます。")}</p></>}
  <details className="perspective-map" open={mapOpen} onToggle={e=>setMapOpen(e.currentTarget.open)}><summary>{tr("配置図・立ち位置")}</summary>
   <svg viewBox="-5 -5 110 74" role="group" aria-label={tr("目線を選ぶ配置図")} onClick={e=>{if(!moving||busy||playing||!active||!observer)return;const matrix=e.currentTarget.getScreenCTM();if(!matrix)return;const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());onMove(Math.max(0,Math.min(100,point.x)),Math.max(0,Math.min(64,point.y)))}}>
    <rect x="0" y="0" width="100" height="64" fill="#255d46" stroke="#ffffffb0" strokeWidth=".6"/><path d="M50 0V64M0 24H12V40H0M100 24H88V40H100" fill="none" stroke="#ffffffb0" strokeWidth=".6"/><circle cx="50" cy="32" r="9" fill="none" stroke="#ffffffb0" strokeWidth=".6"/>
    {pieces.filter(p=>p.side!=='cone').map(p=><g key={p.id} role={p.side==='ball'?undefined:'button'} tabIndex={p.side==='ball'?-1:0} aria-label={p.side==='ball'?tr("ボール"):`${p.side==='home'?tr("味方"):tr("相手")} ${p.number}の目線`} onClick={e=>{e.stopPropagation();if(p.side!=='ball'&&!busy)onSelect(p.id)}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&p.side!=='ball'&&!busy){e.preventDefault();onSelect(p.id)}}}>
     <circle cx={p.x} cy={p.y} r="4" fill="transparent"/>{p.id===observer?.id&&<circle cx={p.x} cy={p.y} r="4" fill="none" stroke="#ffe16b" strokeWidth="1"/>}<circle cx={p.x} cy={p.y} r={p.side==='ball'?1.1:2.2} fill={p.side==='home'?'#d8f197':p.side==='away'?'#f5a885':'white'}/>{p.side!=='ball'&&<text x={p.x} y={p.y+.9} textAnchor="middle" fontSize="2.5" fill="#10291e" pointerEvents="none">{p.number}</text>}
    </g>)}
   </svg>
   <p>{tr("選手をタップすると、その選手の目線へ切り替わります。")}</p>
   {active&&<><button aria-pressed={moving} disabled={busy||playing} onClick={()=>setMoving(!moving)}>{moving?tr("配置図で新しい立ち位置を指定"):tr("立ち位置を調整する")}</button>{moving&&observer&&<><div className="perspective-nudge"><button disabled={busy||playing} onClick={()=>onMove(observer.x-1,observer.y)}>← 1m</button><button disabled={busy||playing} onClick={()=>onMove(observer.x,observer.y-1)}>↑ 1m</button><button disabled={busy||playing} onClick={()=>onMove(observer.x,observer.y+1)}>↓ 1m</button><button disabled={busy||playing} onClick={()=>onMove(observer.x+1,observer.y)}>1m →</button></div><p>{tr("現在のフレームの配置が変わります。「元に戻す」で比較できます。再生中は移動できません。")}</p></>}</>}
  </details>
  {active&&<div className="perspective-look"><button disabled={busy||playing} onClick={onUndo}>{tr("位置を元に戻す")}</button><button disabled={busy||playing} onClick={onSave}>{tr("配置を保存")}</button></div>}
  <small>{tr("目の高さ1.75mの模式表示。配置の比較に使ってください。")}</small>
  </div>
 </aside>;
}
