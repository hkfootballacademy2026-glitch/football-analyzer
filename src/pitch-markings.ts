// Shared 100 × 64 board coordinates: retain existing player locations.
export type PitchPoint=[number,number];
const arc=(x:number,y:number,r:number,a:number,b:number):PitchPoint[]=>Array.from({length:49},(_,i)=>[x+r*Math.cos(a+(b-a)*i/48),y+r*Math.sin(a+(b-a)*i/48)]);
export type Court='football'|'futsal';
export const courtDepthScale=(court?:Court)=>court==='futsal'?50/64:1;
export function pitchMarkings(court?:Court){
 if(court==='futsal'){
  // Convert metres on a 40 by 20 court to the existing board coordinates.
  const lines:PitchPoint[][]=[[[0,0],[40,0],[40,20],[0,20],[0,0]],[[20,0],[20,20]],arc(20,10,3,0,Math.PI*2)];
  for(const right of [false,true]){const x=right?40:0,sign=right?-1:1;
   const area=[...arc(0,8.5,6,-Math.PI/2,0),[6,11.5] as PitchPoint,...arc(0,11.5,6,0,Math.PI/2)];
   lines.push(area.map(([a,b])=>[x+sign*a,b]));
   lines.push(arc(0,0,.25,0,Math.PI/2).map(([a,b])=>[x+sign*a,b]),arc(0,20,.25,-Math.PI/2,0).map(([a,b])=>[x+sign*a,b]));
  }
  return {lines:lines.map(line=>line.map(([x,y])=>[x*2.5,y*3.2] as PitchPoint)),marks:[[50,32],[15,32],[85,32],[25,32],[75,32]] as PitchPoint[],corners:[] as PitchPoint[]};
 }

 const lines:PitchPoint[][]=[[[0,0],[100,0],[100,64],[0,64],[0,0]],[[50,0],[50,64]],arc(50,32,9.15,0,Math.PI*2)];
 const angle=Math.acos(5.5/9.15);
 for(const right of [false,true]){const x=right?100:0,sign=right?-1:1;lines.push([[x,12],[x+sign*16.5,12],[x+sign*16.5,52],[x,52]],[[x,23],[x+sign*5.5,23],[x+sign*5.5,41],[x,41]],arc(x+sign*11,32,9.15,right?Math.PI-angle:-angle,right?Math.PI+angle:angle));}
 lines.push(arc(0,0,1,0,Math.PI/2),arc(100,0,1,Math.PI/2,Math.PI),arc(100,64,1,Math.PI,Math.PI*1.5),arc(0,64,1,Math.PI*1.5,Math.PI*2));
 return {lines,marks:[[50,32],[11,32],[89,32]] as PitchPoint[],corners:[[0,0],[100,0],[100,64],[0,64]] as PitchPoint[]};
}
