// Shared 100 × 64 board coordinates: retain existing player locations.
export type PitchPoint=[number,number];
const arc=(x:number,y:number,r:number,a:number,b:number):PitchPoint[]=>Array.from({length:49},(_,i)=>[x+r*Math.cos(a+(b-a)*i/48),y+r*Math.sin(a+(b-a)*i/48)]);
export function pitchMarkings(){
 const lines:PitchPoint[][]=[[[0,0],[100,0],[100,64],[0,64],[0,0]],[[50,0],[50,64]],arc(50,32,9.15,0,Math.PI*2)];
 const angle=Math.acos(5.5/9.15);
 for(const right of [false,true]){const x=right?100:0,sign=right?-1:1;lines.push([[x,12],[x+sign*16.5,12],[x+sign*16.5,52],[x,52]],[[x,23],[x+sign*5.5,23],[x+sign*5.5,41],[x,41]],arc(x+sign*11,32,9.15,right?Math.PI-angle:-angle,right?Math.PI+angle:angle));}
 lines.push(arc(0,0,1,0,Math.PI/2),arc(100,0,1,Math.PI/2,Math.PI),arc(100,64,1,Math.PI,Math.PI*1.5),arc(0,64,1,Math.PI*1.5,Math.PI*2));
 return {lines,marks:[[50,32],[11,32],[89,32]] as PitchPoint[],corners:[[0,0],[100,0],[100,64],[0,64]] as PitchPoint[]};
}
