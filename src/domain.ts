import { z } from 'zod';
export const uid = () => crypto.randomUUID();
const id = z.string().min(1).max(100);
const name = z.string().trim().min(1).max(200);
const text = z.string().max(10000);
const criterionSchema = z.object({id,behavior:name,goodExample:text.default(''),improveExample:text.default(''),archived:z.boolean().default(false)});
const principleSchema = z.object({id,name,description:text.default(''),conditions:text.default(''),color:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#28664e'),archived:z.boolean().default(false),criteria:z.array(criterionSchema).max(200)});
const phaseSchema = z.object({id,name,archived:z.boolean().default(false),principles:z.array(principleSchema).max(200)});
const revisionSchema = z.object({id,modelId:id,version:z.number().int().positive(),status:z.enum(['draft','active','archived']),createdAt:z.string(),basedOn:z.string().optional(),phases:z.array(phaseSchema).max(100)});
const playerSchema=z.object({id,name,number:z.string().max(5),position:z.string().max(30)});
const teamSchema=z.object({id,name,category:z.string().max(100),season:z.string().max(20),color:z.string(),archived:z.boolean(),players:z.array(playerSchema)});
const modelSchema=z.object({id,teamId:id,name});
const imagePoint=z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)});
const trackBox=z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1),w:z.number().positive().max(1),h:z.number().positive().max(1)});
const trackingSchema=z.object({sourceName:z.string(),sourceSize:z.number().nonnegative().optional(),box:trackBox.optional(),samples:z.array(trackBox.extend({time:z.number().nonnegative(),score:z.number().min(0).max(1)})).max(500),calibration:z.object({points:z.array(imagePoint).length(4),width:z.number().positive().max(200),height:z.number().positive().max(200),time:z.number().nonnegative()}).optional(),measurement:z.array(imagePoint).max(2)});
const drawingSchema=z.object({id,kind:z.enum(['arrow','circle','rect','line','player','ring','spotlight','link','freehand','area','text']),nodes:z.array(z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)})).min(2).max(22).optional(),width:z.number().min(1).max(20).optional(),opacity:z.number().min(.05).max(1).optional(),fontSize:z.number().min(16).max(72).optional(),fill:z.boolean().optional(),dashed:z.boolean().optional(),text:z.string().max(10000).optional(),points:z.array(z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)})).max(2000).optional(),x:z.number(),y:z.number(),ex:z.number(),ey:z.number(),color:z.string()});
const studioOverlaySchema=z.object({role:z.literal('telop').optional(),drawing:drawingSchema,start:z.number().nonnegative(),end:z.number().positive(),keys:z.array(z.object({time:z.number().nonnegative(),x:z.number().min(0).max(1),y:z.number().min(0).max(1),drawing:drawingSchema.optional()})).max(200).default([])});
const studioEffectSchema=z.object({id,start:z.number().nonnegative(),end:z.number().positive(),zoom:z.number().min(1).max(4),cx:z.number().min(0).max(1),cy:z.number().min(0).max(1),keys:z.array(z.object({time:z.number().nonnegative(),zoom:z.number().min(1).max(4),cx:z.number().min(0).max(1),cy:z.number().min(0).max(1)})).max(200).default([])}).refine(e=>e.end>e.start);
const studioClipSchema=z.object({id,name:z.string().max(200).optional(),telopEnabled:z.boolean().optional(),sourceId:id,tagId:z.string(),start:z.number().nonnegative(),end:z.number().positive(),speed:z.number().min(.25).max(2),freeze:z.number().min(0).max(30).default(0),subtitle:text,zoom:z.number().min(1).max(4).default(1),cx:z.number().min(0).max(1).default(.5),cy:z.number().min(0).max(1).default(.5),effects:z.array(studioEffectSchema).max(100).optional(),overlays:z.array(studioOverlaySchema).max(100).default([])}).refine(c=>c.end>c.start);
const studioProjectSchema=z.object({id,name,sources:z.array(z.object({id,name:z.string().min(1).max(500),size:z.number().nonnegative()})).max(500).optional(),clips:z.array(studioClipSchema).max(500),updatedAt:z.string()});
export type StudioClip=z.infer<typeof studioClipSchema>;
export type StudioProject=z.infer<typeof studioProjectSchema>;
const matchSchema=z.object({id,teamId:z.union([id,z.literal('')]),sceneCalibration:z.object({sourceKey:z.string(),width:z.number().positive(),height:z.number().positive(),reference:z.enum(['full','leftHalf','rightHalf','leftPenalty','rightPenalty']),points:z.array(imagePoint).length(4),targets:z.array(z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(64)})).length(4).optional()}).optional(),captureId:z.string().optional(),studio:z.array(studioProjectSchema).max(100).optional(),tracking:trackingSchema.optional(),revisionId:z.string(),eventPhases:z.array(phaseSchema).optional(),edit:z.object({name,clips:z.array(z.object({id,tagId:z.string(),start:z.number().finite().nonnegative(),end:z.number().finite().positive(),subtitle:text,speed:z.number().min(.25).max(2)}).refine(c=>c.end>c.start,'クリップ終了は開始より後にしてください')).max(500)}).optional(),opponent:name,date:z.string(),score:z.string(),format:z.number().int().min(5).max(11),videoName:z.string().default('')});
export const ratings={good:'GOOD',improve:'BAD',undecided:'判断保留',not_applicable:'未評価'} as const;
export const pitchAreas={defensive:'守備エリア',middle:'中盤エリア',attacking:'攻撃エリア'} as const;
export const pitchLanes={left_wide:'左ワイド',left_half:'左ハーフスペース',central:'中央',right_half:'右ハーフスペース',right_wide:'右ワイド'} as const;
const pitchPositionSchema=z.object({area:z.enum(['defensive','middle','attacking']),lane:z.enum(['left_wide','left_half','central','right_half','right_wide'])});
export type PitchPosition=z.infer<typeof pitchPositionSchema>;
export function pitchPositionLabel(position?:PitchPosition){return position?pitchAreas[position.area]+' / '+pitchLanes[position.lane]:'位置未指定'}
const tagSchema=z.object({pitchPosition:pitchPositionSchema.optional(),id,teamId:z.union([id,z.literal('')]),matchId:id,revisionId:z.string(),eventTeam:z.enum(['home','away']).optional(),period:z.enum(['first','second','extra']).optional(),phaseId:id,principleId:id,criterionId:z.string(),playerIds:z.array(id),playerDetails:z.array(z.object({number:z.string().max(5),name:z.string().max(80)})).max(50).optional(),time:z.number().finite().nonnegative(),start:z.number().finite().nonnegative(),end:z.number().finite().nonnegative(),rating:z.enum(['good','improve','undecided','not_applicable']),comment:text,drawings:z.array(drawingSchema).default([])});
const pieceSchema=z.object({id,number:z.string(),name:z.string().max(80).optional(),dribblerId:z.string().optional(),side:z.enum(['home','away','ball','cone']),coneType:z.enum(['standard','disc','pole']).optional(),color:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),flight:z.enum(['none','ground','lofted','dribble','shot']).optional(),ballScale:z.number().min(.5).max(3).optional(),arcHeight:z.number().min(.5).max(20).optional(),height:z.number().optional(),x:z.number().min(0).max(100),y:z.number().min(0).max(64),angle:z.number().default(0)});
const tacticEffectSchema=z.object({id,kind:z.enum(['arrow','circle','link','spotlight']),x:z.number().min(0).max(100),y:z.number().min(0).max(64),ex:z.number().min(0).max(100),ey:z.number().min(0).max(64),fromId:z.string().optional(),toId:z.string().optional(),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),dashed:z.boolean()});
export type TacticEffect=z.infer<typeof tacticEffectSchema>;
const tacticSchema=z.object({court:z.enum(['football','futsal']).optional(),id,teamId:z.union([id,z.literal('')]),name,display:z.object({names:z.boolean(),numbers:z.boolean(),lanes:z.boolean().optional(),thirds:z.boolean().optional()}).optional(),revisionId:z.string(),principleId:z.string(),criterionId:z.string().default(''),tagId:z.string(),frames:z.array(z.object({time:z.number().finite().nonnegative(),pieces:z.array(pieceSchema),effects:z.array(tacticEffectSchema).max(100).optional()})).min(1),notes:text});
const reportSchema=z.object({id,teamId:z.union([id,z.literal('')]),matchId:id,issue:text,hypothesis:text,practice:text,observe:text});
const schema=z.object({schemaVersion:z.literal(1),teams:z.array(teamSchema),models:z.array(modelSchema),revisions:z.array(revisionSchema),matches:z.array(matchSchema),tags:z.array(tagSchema),tactics:z.array(tacticSchema),reports:z.array(reportSchema)});
export type State=z.infer<typeof schema>;
export type Team=State['teams'][number];
export type Revision=State['revisions'][number];
export type Phase=Revision['phases'][number];
export type Principle=Phase['principles'][number];
export type Criterion=Principle['criteria'][number];
export type Match=State['matches'][number];
export type Tag=State['tags'][number];
export type Drawing=Tag['drawings'][number];
export type Tactic=State['tactics'][number];
export type Piece=Tactic['frames'][number]['pieces'][number];
export type Rating=keyof typeof ratings;
export const emptyState=():State=>({schemaVersion:1,teams:[],models:[],revisions:[],matches:[],tags:[],tactics:[],reports:[]});
export const newCriterion=(behavior='新しい行動基準'):Criterion=>({id:uid(),behavior,goodExample:'',improveExample:'',archived:false});
export const newPrinciple=(name='新しい原則'):Principle=>({id:uid(),name,description:'',conditions:'',color:'#28664e',archived:false,criteria:[]});
export const newPhase=(name='新しい局面'):Phase=>({id:uid(),name,archived:false,principles:[]});
export function createModel(s:State,teamId:string,name:string,template:boolean){
 const model={id:uid(),teamId,name}; s.models.push(model);
 const rev:Revision={id:uid(),modelId:model.id,version:1,status:'draft',createdAt:new Date().toISOString(),phases:template?['攻撃（保持）','攻撃→守備（喪失）','守備（非保持）','守備→攻撃（奪取）'].map(newPhase):[]};
 s.revisions.push(rev);return rev;
}
export function forkRevision(s:State,revisionId:string){
 const old=s.revisions.find(r=>r.id===revisionId); if(!old)throw Error('版が見つかりません');
 const copy:Revision={...structuredClone(old),id:uid(),basedOn:old.id,version:Math.max(...s.revisions.filter(r=>r.modelId===old.modelId).map(r=>r.version))+1,status:'draft',createdAt:new Date().toISOString()};
 s.revisions.push(copy);return copy;
}
export function copyModel(s:State,revisionId:string,teamId:string){
 const old=s.revisions.find(r=>r.id===revisionId)!;
 const original=s.models.find(m=>m.id===old.modelId)!;
 const rev=createModel(s,teamId,original.name+'（コピー）',false);
 rev.phases=structuredClone(old.phases).map(ph=>({...ph,id:uid(),principles:ph.principles.map(p=>({...p,id:uid(),criteria:p.criteria.map(c=>({...c,id:uid()}))}))}));return rev;
}
export function editable(s:State,r:Revision){return r.status==='draft'&&!s.matches.some(m=>m.revisionId===r.id)&&!s.tactics.some(t=>t.revisionId===r.id);}
export function updateRevision(s:State,id:string,change:(r:Revision)=>void){const r=s.revisions.find(r=>r.id===id);if(!r||!editable(s,r))throw Error('公開済み・参照中の版は編集できません。新しい下書きを作成してください。');change(r);}
export function options(r?:Pick<Revision,'phases'>){return r?.phases.filter(p=>!p.archived).flatMap(ph=>ph.principles.filter(p=>!p.archived).map(p=>({phase:ph,principle:p})))??[];}
export function stats(tags:Tag[]){const count={good:0,improve:0,undecided:0,not_applicable:0};tags.forEach(t=>count[t.rating]++);const denominator=count.good+count.improve;return {...count,total:tags.length,denominator,rate:denominator?Math.round(count.good/denominator*100):null};}
export function validate(input:unknown):State{
 const s=schema.parse(input);
 const unique=(items:{id:string}[])=>{if(new Set(items.map(i=>i.id)).size!==items.length)throw Error('重複IDがあります');};
 unique([...s.teams,...s.models,...s.revisions,...s.matches,...s.tags,...s.tactics,...s.reports,...s.teams.flatMap(t=>t.players)]);
 for(const m of s.models)if(!s.teams.some(t=>t.id===m.teamId))throw Error('モデルのチーム参照が不正です');
 for(const r of s.revisions){if(!s.models.some(m=>m.id===r.modelId))throw Error('版のモデル参照が不正です');unique([...r.phases,...r.phases.flatMap(p=>p.principles),...r.phases.flatMap(p=>p.principles.flatMap(q=>q.criteria))]);if(r.basedOn&&!s.revisions.some(o=>o.id===r.basedOn&&o.modelId===r.modelId))throw Error('元の版が不正です');}
 for(const m of s.models){const versions=s.revisions.filter(r=>r.modelId===m.id).map(r=>r.version);if(new Set(versions).size!==versions.length)throw Error('版番号が重複しています');}
 const revisionFor=(teamId:string,revisionId:string)=>{const r=s.revisions.find(r=>r.id===revisionId);if(!r||!s.models.some(m=>m.id===r.modelId&&m.teamId===teamId))throw Error('チームとモデル版が一致しません');return r;};
 for(const m of s.matches){if(m.teamId&&!s.teams.some(t=>t.id===m.teamId))throw Error('試合のチーム参照が不正です');if(m.revisionId){const r=revisionFor(m.teamId,m.revisionId);if(r.status==='draft')throw Error('試合は公開版を指定してください');}else{if(!m.eventPhases?.length)throw Error('標準分析のイベント定義がありません');unique([...m.eventPhases,...m.eventPhases.flatMap(p=>p.principles),...m.eventPhases.flatMap(p=>p.principles.flatMap(q=>q.criteria))]);}}
 for(const t of s.tags){const m=s.matches.find(m=>m.id===t.matchId);if(!m||m.teamId!==t.teamId||m.revisionId!==t.revisionId)throw Error('タグの試合参照が不正です');const r=analysisDefinition(s,m);const p=r.phases.find(p=>p.id===t.phaseId)?.principles.find(p=>p.id===t.principleId);if(!p||(t.criterionId&&!p.criteria.some(c=>c.id===t.criterionId)))throw Error('タグの原則・基準が不正です');if(t.start>t.time||t.end<t.time||t.end<=t.start)throw Error('クリップ区間が不正です');if(t.playerIds.some(id=>!s.teams.find(team=>team.id===t.teamId)?.players.some(p=>p.id===id)))throw Error('選手参照が不正です');}
 for(const t of s.tactics){if(t.teamId&&!s.teams.some(a=>a.id===t.teamId))throw Error('戦術盤のチーム参照が不正です');if(t.revisionId){const r=revisionFor(t.teamId,t.revisionId);const p=r.phases.flatMap(ph=>ph.principles).find(p=>p.id===t.principleId);if(t.principleId&&!p)throw Error('戦術盤の原則参照が不正です');if(t.criterionId&&!p?.criteria.some(c=>c.id===t.criterionId))throw Error('戦術盤の基準参照が不正です');}else if(t.principleId||t.criterionId)throw Error('戦術盤の版を指定してください');if(t.tagId&&!s.tags.some(tag=>tag.id===t.tagId&&tag.teamId===t.teamId&&tag.revisionId===t.revisionId&&(!t.revisionId||tag.principleId===t.principleId)))throw Error('戦術盤のタグ参照が不正です');for(let i=0;i<t.frames.length;i++){unique(t.frames[i].pieces);unique(t.frames[i].effects??[]);for(const effect of t.frames[i].effects??[]){for(const anchor of [effect.fromId,effect.toId])if(anchor&&!t.frames[i].pieces.some(p=>p.id===anchor))throw Error('演出の選手参照が不正です');if(effect.kind==='link'&&(!effect.fromId||!effect.toId||effect.fromId===effect.toId))throw Error('リンクには異なる2つのコマを指定してください');}if((i===0&&t.frames[i].time!==0)||(i>0&&t.frames[i].time<=t.frames[i-1].time))throw Error('キーフレーム時刻が不正です');if(i&&t.frames[i].pieces.map(p=>p.id).sort().join()!==t.frames[0].pieces.map(p=>p.id).sort().join())throw Error('キーフレームの選手が一致しません');}}
 for(const r of s.reports)if(!s.matches.some(m=>m.id===r.matchId&&m.teamId===r.teamId))throw Error('レポートの試合参照が不正です');
 return s;
}
export function mergeBackup(current:State,incoming:unknown):State{
 const other=validate(incoming);const result=structuredClone(current);
 for(const key of ['teams','models','revisions','matches','tags','tactics','reports'] as const){for(const entity of other[key]){const existing=(result[key] as {id:string}[]).find(e=>e.id===entity.id);if(existing){if(JSON.stringify(existing)!==JSON.stringify(entity))throw Error('同じIDに異なるデータがあります。上書きせず中止しました。空のブラウザーに復元してください。');}else (result[key] as unknown[]).push(entity);}}
 return validate(result);
}
export function interpolate(frames:Tactic['frames'],time:number):Piece[]{
 frames=syncDribbles(frames);
 const a=[...frames].reverse().find(f=>f.time<=time)??frames[0];const b=frames.find(f=>f.time>time)??a;const f=a===b?0:Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time)));
 return a.pieces.map(p=>{const q=b.pieces.find(v=>v.id===p.id)??p;return {...p,height:p.side==='ball'&&p.flight==='lofted'?4*(p.arcHeight??4)*f*(1-f):0,x:p.x+(q.x-p.x)*f,y:p.y+(q.y-p.y)*f,angle:p.angle+((((q.angle-p.angle)%360)+540)%360-180)*f};});
}
export const formations = ['4-4-2','4-3-3','4-2-3-1','3-5-2','3-4-3'] as const;
export type Formation=string;
export function formationsForCount(count:number):string[]{const presets:Record<number,readonly string[]>={1:['GKのみ'],2:['1'],3:['1-1','2'],4:['1-2','2-1'],5:['2-2','1-2-1','3-1'],6:['2-2-1','1-3-1','2-1-2'],7:['2-3-1','3-2-1','2-2-2'],8:['3-3-1','2-3-2','3-2-2'],9:['3-3-2','2-3-3','3-2-3'],10:['3-3-3','4-3-2','3-4-2'],11:formations};if(presets[count])return [...presets[count]];if(count<1||count>22||!Number.isInteger(count))return [];const field=count-1,third=Math.floor(field/3);return [...new Set([[third,field-third*2,third].join('-'),[Math.floor(field/2),Math.ceil(field/2)].join('-')])]}
export function formation(count=11,home:Formation=formationsForCount(count)[0],away:Formation=home):Piece[]{
 count=Math.max(0,Math.min(22,Math.trunc(count)));
 return [...(['home','away'] as const).flatMap(side=>{
 const choice=side==='home'?home:away,valid=formationsForCount(count),shape=valid.includes(choice)?choice:valid[0];
 const rows=count<=1?[]:shape.split('-').map(Number);
 const positions=[{x:5,y:32},...rows.flatMap((n,row)=>Array.from({length:n},(_,i)=>({x:18+row*27/Math.max(1,rows.length-1),y:64*(i+1)/(n+1)})))];
 return Array.from({length:count},(_,i)=>{const pos=positions[i];return {id:uid(),side,number:String(i+1),name:'',x:side==='home'?pos.x:100-pos.x,y:pos.y,angle:side==='home'?0:180}});
 }),{id:uid(),side:'ball',flight:'none',number:'',x:50,y:32,angle:0}];
}
// Keep each dribble's endpoints at the carrier's feet, including the start of a following pass.
export function syncDribbles(frames:Tactic['frames']):Tactic['frames']{
 const result=structuredClone(frames);
 result.forEach((f,i)=>f.pieces.filter(p=>p.side==='ball'&&p.flight==='dribble').forEach(ball=>{
 const carrier=f.pieces.find(p=>p.id===ball.dribblerId&&(p.side==='home'||p.side==='away'));
 if(!carrier){ball.flight='ground';delete ball.dribblerId;return;}
 const place=(target:Piece,player:Piece)=>{target.x=Math.max(0,Math.min(100,player.x+1.2*Math.cos(player.angle*Math.PI/180)));target.y=Math.max(0,Math.min(64,player.y+1.2*Math.sin(player.angle*Math.PI/180)));target.height=0;};
 place(ball,carrier);
 const next=result[i+1];const end=next?.pieces.find(p=>p.id===ball.id);const runner=next?.pieces.find(p=>p.id===carrier.id);
 if(end&&runner&&end.flight!=='dribble')place(end,runner);
 }));return result;
}
export function jointAngle(a:{x:number;y:number},b:{x:number;y:number},c:{x:number;y:number}){const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};const d=Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y);return d?Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/d)))*180/Math.PI:null;}
export function csv(rows:(string|number|null)[][]){return '\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}
export function download(data:Blob|string,name:string,type='application/json'){const url=URL.createObjectURL(typeof data==='string'?new Blob([data],{type}):data);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export const clock=(n:number)=>`${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;

export function standardEvents():Phase[]{return [
 ['攻撃',['シュート','ゴール','パス','ドリブル','クロス','ボールロスト']],
 ['守備',['ボール奪取','インターセプト','タックル','セーブ','ファウル']],
 ['セットプレー',['コーナーキック','フリーキック','スローイン','オフサイド']],
 ['自由タグ',[]]
].map(([label,events])=>({...newPhase(label as string),principles:(events as string[]).map(n=>newPrinciple(n))}));}
export function analysisDefinition(s:State,m?:Match):Pick<Revision,'phases'>{return s.revisions.find(r=>r.id===m?.revisionId)??{phases:m?.eventPhases??[]};}
export function analysisLabel(s:State,m?:Match){return m?.revisionId?'カスタム分析':'イベント分析';}

// Legacy model definitions become match-local events without changing tag IDs.
export function withoutGameModels(input:State):State{
 const s=structuredClone(input);
 for(const m of s.matches)if(m.revisionId){m.eventPhases=structuredClone(analysisDefinition(s,m).phases);m.revisionId='';}
 for(const t of s.tags)t.revisionId='';
 for(const t of s.tactics){t.revisionId='';t.principleId='';t.criterionId='';}
 s.models=[];s.revisions=[];return validate(s);
}
export function removeMatch(s:State,id:string){
 const tagIds=new Set(s.tags.filter(t=>t.matchId===id).map(t=>t.id));
 s.matches=s.matches.filter(m=>m.id!==id);s.tags=s.tags.filter(t=>t.matchId!==id);s.reports=s.reports.filter(r=>r.matchId!==id);
 for(const t of s.tactics)if(tagIds.has(t.tagId))t.tagId='';
}
