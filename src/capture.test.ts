import {it,expect} from 'vitest';
import {CaptureClock,finishCaptureTags} from './capture-store';
import {type Tag} from './domain';
const tag=(time:number,start:number,end:number):Tag=>({id:'tag',teamId:'team',matchId:'match',revisionId:'',phaseId:'phase',principleId:'event',criterionId:'',playerIds:[],time,start,end,rating:'not_applicable',comment:'',drawings:[]});
it('excludes halftime and repeated pause calls from recording time',()=>{const clock=new CaptureClock();clock.start(100);expect(clock.seconds(2100)).toBe(2);clock.pause(3100);clock.pause(9000);expect(clock.seconds(20000)).toBe(3);clock.resume(30000);expect(clock.seconds(32000)).toBe(5);clock.pause(33000);expect(clock.seconds(90000)).toBe(6)});
it('clamps tags to the saved recording and omits tags beyond recovered footage',()=>{const finished=finishCaptureTags([tag(0,0,5),tag(9,4,14),tag(12,7,17)],10);expect(finished).toHaveLength(2);expect(finished[0]).toMatchObject({time:0,start:0,end:5});expect(finished[1]).toMatchObject({time:9,start:4,end:10});expect(finishCaptureTags([tag(1,0,4)],0)).toEqual([])});
