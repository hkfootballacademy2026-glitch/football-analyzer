import {it,expect} from 'vitest';
import {trainingTacticFrames} from './training-tactic';
import {newDrill,type TrainingPiece} from './training-model';
it('copies all frames, drawing properties and reversed ellipse bounds into tactics',()=>{
 const drill=newDrill(''),circle:TrainingPiece={id:'circle',kind:'circle',x:40,y:30,ex:10,ey:10,label:'',fill:true,color:'#ff0000'},wave:TrainingPiece={id:'wave',kind:'line',x:5,y:5,ex:60,ey:5,label:'',style:'wave',strokeWidth:2};
 drill.frames=[{time:0,pieces:[circle,wave]},{time:5,pieces:[{...circle,x:50}]}];const frames=trainingTacticFrames(drill);expect(frames.map(f=>f.time)).toEqual([0,5]);expect(frames[0].effects?.[0]).toMatchObject({x:25,y:20,ex:40,ey:30,color:'#ff0000',fill:true});expect(frames[0].effects?.[1]).toMatchObject({kind:'line',style:'wave',strokeWidth:2});expect(frames[1].effects?.[0].x).toBe(30);expect(drill.frames[0].pieces[0].x).toBe(40);
});
