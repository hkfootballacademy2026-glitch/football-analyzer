import {describe,it,expect} from 'vitest';
import {pitchMarkings,courtDepthScale} from './pitch-markings';
describe('court scale',()=>{
 it('keeps legacy football markings unchanged',()=>{expect(pitchMarkings()).toEqual(pitchMarkings('football'));expect(courtDepthScale()).toBe(1)});
 it('draws a 40 by 20 futsal court with correctly scaled circles and penalty marks',()=>{
 const m=pitchMarkings('futsal'),circle=m.lines[2];
 expect(100/(64*courtDepthScale('futsal'))).toBe(2);
 expect((Math.max(...circle.map(p=>p[0]))-50)/2.5).toBeCloseTo(3);
 expect((Math.max(...circle.map(p=>p[1]))-32)/3.2).toBeCloseTo(3);
 expect(m.marks).toEqual([[50,32],[15,32],[85,32],[25,32],[75,32]]);
 expect(m.corners).toEqual([]);
 for(const line of m.lines)for(const [x,y] of line){expect(x).toBeGreaterThanOrEqual(0);expect(x).toBeLessThanOrEqual(100);expect(y).toBeGreaterThanOrEqual(0);expect(y).toBeLessThanOrEqual(64)}
 });
});
