import {describe,it,expect} from 'vitest';
import {emptyState,validate,mergeBackup} from './domain';
import {newDrill,newSession,addSessionDrill,sessionTimeline,importDrill,trainingTemplate} from './training-model';

describe('training persistence and planning',()=>{
 it('loads old snapshots and backs up new training data without losing it',()=>{
  const old:any=emptyState();delete old.drills;delete old.trainingSessions;
  expect(validate(old).drills).toEqual([]);
  const s=validate(old),d=trainingTemplate('',0),p=newSession('');addSessionDrill(p,d);s.drills.push(d);s.trainingSessions.push(p);
  expect(mergeBackup(emptyState(),JSON.parse(JSON.stringify(s)))).toEqual(s);
  expect(mergeBackup(s,s)).toEqual(s);
  const conflict=structuredClone(s);conflict.drills[0].name='different';expect(()=>mergeBackup(s,conflict)).toThrow('同じID');
 });
 it('keeps historical session snapshots independent and recomputes reordered timings',()=>{
  const d=newDrill(''),p=newSession('');d.minutes=12;addSessionDrill(p,d);d.minutes=7;addSessionDrill(p,d);d.name='changed';
  expect(p.items[0].drill.name).not.toBe(d.name);expect(sessionTimeline(p).map(i=>[i.start,i.end])).toEqual([[0,12],[12,19]]);
  p.items.reverse();expect(sessionTimeline(p).map(i=>[i.start,i.end])).toEqual([[0,7],[7,19]]);
 });
 it('imports a safe copy scoped to the receiving team and rejects invalid input',()=>{
  const d=trainingTemplate('',1);d.matchId='private-match';d.tacticId='private-board';
  const copy=importDrill({format:'football-analyzer-training',version:1,drill:d},'new-team');
  expect(copy.id).not.toBe(d.id);expect(copy.pieces[0].id).not.toBe(d.pieces[0].id);expect(copy.teamId).toBe('new-team');expect(copy.matchId+copy.tacticId).toBe('');
  expect(()=>importDrill({format:'football-analyzer-training',version:1,drill:{...d,minutes:-1}},'')).toThrow();
  expect(()=>importDrill({drill:d},'')).toThrow();
 });
 it('rejects invalid team references and duplicate diagram IDs',()=>{
  const s=emptyState();s.drills.push(newDrill('missing'));expect(()=>validate(s)).toThrow('チーム参照');
  s.drills=[trainingTemplate('',0)];s.drills[0].pieces.push(s.drills[0].pieces[0]);expect(()=>validate(s)).toThrow('重複ID');
 });
 it('validates all original starter menus',()=>{for(let i=0;i<3;i++){const s=emptyState();s.drills.push(trainingTemplate('',i));expect(validate(s).drills).toHaveLength(1);}});
});
