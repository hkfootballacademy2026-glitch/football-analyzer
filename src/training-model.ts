import {z} from 'zod';

const text=z.string().max(10000);
export const trainingPieceSchema=z.object({id:z.string().min(1),kind:z.enum(['home','away','ball','cone','goal','arrow']),x:z.number().min(0).max(100),y:z.number().min(0).max(64),ex:z.number().min(0).max(100),ey:z.number().min(0).max(64),label:z.string().max(30)});
export const drillSchema=z.object({id:z.string().min(1),teamId:z.string(),name:z.string().trim().min(1).max(200),theme:text,age:z.string().max(100),minutes:z.number().int().min(1).max(240),players:z.number().int().min(1).max(100),equipment:text,organization:text,rules:text,coaching:text,progression:text,favorite:z.boolean(),matchId:z.string(),tacticId:z.string(),pieces:z.array(trainingPieceSchema).max(200)});
export const sessionSchema=z.object({id:z.string().min(1),teamId:z.string(),name:z.string().trim().min(1).max(200),date:z.string(),objective:text,targetMinutes:z.number().int().min(1).max(480),items:z.array(z.object({id:z.string().min(1),drill:drillSchema,minutes:z.number().int().min(1).max(240)})).max(50),good:text,improve:text,next:text});
export type Drill=z.infer<typeof drillSchema>;
export type TrainingSession=z.infer<typeof sessionSchema>;
export type TrainingPiece=z.infer<typeof trainingPieceSchema>;
export function newDrill(teamId:string):Drill{return {id:crypto.randomUUID(),teamId,name:'新しいメニュー',theme:'',age:'U-12',minutes:15,players:8,equipment:'ボール、ビブス、コーン',organization:'',rules:'',coaching:'',progression:'',favorite:false,matchId:'',tacticId:'',pieces:[]};}
export function newSession(teamId:string):TrainingSession{return {id:crypto.randomUUID(),teamId,name:'今日のトレーニング',date:new Date().toLocaleDateString('sv-SE'),objective:'',targetMinutes:90,items:[],good:'',improve:'',next:''};}
export function sessionTimeline(session:TrainingSession){let elapsed=0;return session.items.map(item=>{const start=elapsed;elapsed+=item.minutes;return {...item,start,end:elapsed};});}
export function addSessionDrill(session:TrainingSession,drill:Drill){if(session.items.length>=50)throw Error('1日のメニューは50件までです');session.items.push({id:crypto.randomUUID(),drill:structuredClone(drill),minutes:drill.minutes});}
export function importDrill(input:unknown,teamId:string):Drill{const pack=z.object({format:z.literal('football-analyzer-training'),version:z.literal(1),drill:drillSchema}).parse(input);return {...pack.drill,id:crypto.randomUUID(),teamId,matchId:'',tacticId:'',pieces:pack.drill.pieces.map(p=>({...p,id:crypto.randomUUID()}))};}
export function trainingTemplate(teamId:string,index:number):Drill{
 const d=newDrill(teamId);
 const templates=[{name:'パスの角度をつくる 4対2',theme:'パス・サポート',players:6,organization:'12m四方に攻撃4人と守備2人。ボールを2個準備。',rules:'5本つながったら1点。奪われた選手が守備と交代。',coaching:'受ける前に周囲を見る。味方と一直線にならず、パスコースを2つつくる。',progression:'広さやタッチ数を変え、成功率に合わせて調整する。'},
 {name:'相手を見て突破する 1対1',theme:'ドリブル・守備',players:4,organization:'幅12m・長さ18m。両端にコーンゲートを2つずつ設置。',rules:'攻撃はどちらかのゲートをドリブル通過。1回30秒で交代。',coaching:'相手の向きと空いている場所を見る。守備は間合いを調整する。',progression:'味方を1人加え、パスとドリブルを選べる2対1にする。'},
 {name:'前進につなげる 4対4',theme:'ゲーム・切り替え',players:8,organization:'24m×32m。両端にゴールを設置。',rules:'得点後は相手ボールで再開。3分ごとに短い振り返り。',coaching:'奪った直後に前を見る。失ったら近くの選手がボールに寄せる。',progression:'フリーマンを1人追加して前進の選択肢を増やす。'}];
 Object.assign(d,templates[index]??templates[0]);
 const positions=index===0?[[20,12],[80,12],[20,52],[80,52],[42,28],[58,36]]:index===1?[[25,32],[65,32]]:[[20,16],[20,48],[40,16],[40,48],[60,16],[60,48],[80,16],[80,48]];
 d.pieces=positions.map(([x,y],i)=>({id:crypto.randomUUID(),kind:i<(index===0?4:positions.length/2)?'home':'away',x,y,ex:x,ey:y,label:String(i+1)}));
 d.pieces.push({id:crypto.randomUUID(),kind:'ball',x:32,y:32,ex:32,ey:32,label:''});
 for(const [x,y] of [[10,8],[90,8],[10,56],[90,56]])d.pieces.push({id:crypto.randomUUID(),kind:'cone',x,y,ex:x,ey:y,label:''});
 return d;
}
