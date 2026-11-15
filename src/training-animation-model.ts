import type {Drill,TrainingPiece} from './training-model';
export type TrainingFrame={time:number;pieces:TrainingPiece[]};
export const drillFrames=(drill:Drill):TrainingFrame[]=>drill.frames??[{time:0,pieces:drill.pieces}];
export function animationPieces(frames:TrainingFrame[],time:number):TrainingPiece[]{
 if(time<=0)return frames[0].pieces;
 const next=frames.findIndex(f=>f.time>time);if(next<0)return frames.at(-1)!.pieces;
 const a=frames[next-1],b=frames[next],ratio=(time-a.time)/(b.time-a.time),targets=new Map(b.pieces.map(p=>[p.id,p]));
 return a.pieces.map(p=>{const q=targets.get(p.id);if(!q||q.kind!==p.kind)return p;return {...p,x:p.x+(q.x-p.x)*ratio,y:p.y+(q.y-p.y)*ratio,ex:p.ex+(q.ex-p.ex)*ratio,ey:p.ey+(q.ey-p.ey)*ratio};});
}
export function framesPatch(frames:TrainingFrame[]):Pick<Drill,'frames'|'pieces'>{return {frames,pieces:frames[0].pieces};}
