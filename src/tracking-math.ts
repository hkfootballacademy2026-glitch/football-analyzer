export type Point={x:number;y:number};
export type Box={x:number;y:number;w:number;h:number};
export type TrackSample=Box&{time:number;score:number};
export function homography(points:Point[],width:number,height:number){
 if(points.length!==4||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('4点と有効な実寸を設定してください');
 const crosses=points.map((p,i)=>{const q=points[(i+1)%4],r=points[(i+2)%4];return (q.x-p.x)*(r.y-q.y)-(q.y-p.y)*(r.x-q.x)});
 if(crosses.some(c=>Math.abs(c)<.0001)||!(crosses.every(c=>c>0)||crosses.every(c=>c<0)))throw Error('基準点は交差しない長方形の周囲順に指定してください');
 const dest=[[0,0],[width,0],[width,height],[0,height]];const a:number[][]=[];
 points.forEach((p,i)=>{const [u,v]=dest[i];a.push([p.x,p.y,1,0,0,0,-u*p.x,-u*p.y,u],[0,0,0,p.x,p.y,1,-v*p.x,-v*p.y,v])});
 for(let c=0;c<8;c++){let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(a[r][c])>Math.abs(a[pivot][c]))pivot=r;if(Math.abs(a[pivot][c])<1e-10)throw Error('基準点が近すぎます');[a[c],a[pivot]]=[a[pivot],a[c]];const value=a[c][c];for(let j=c;j<9;j++)a[c][j]/=value;for(let r=0;r<8;r++)if(r!==c){const k=a[r][c];for(let j=c;j<9;j++)a[r][j]-=k*a[c][j]}}
 return [...a.map(row=>row[8]),1];
}
export function project(h:number[],p:Point){const d=h[6]*p.x+h[7]*p.y+1;if(Math.abs(d)<1e-8)throw Error('計測できない位置です');return {x:(h[0]*p.x+h[1]*p.y+h[2])/d,y:(h[3]*p.x+h[4]*p.y+h[5])/d};}
export function groundDistance(points:Point[],width:number,height:number,a:Point,b:Point){const h=homography(points,width,height);const inside=(p:Point)=>{const signs=points.map((q,i)=>{const r=points[(i+1)%4];return (r.x-q.x)*(p.y-q.y)-(r.y-q.y)*(p.x-q.x)});return signs.every(x=>x>=-1e-8)||signs.every(x=>x<=1e-8)};if(!inside(a)||!inside(b))throw Error('基準の四角形の内側を測定してください');const p=project(h,a),q=project(h,b);return Math.hypot(p.x-q.x,p.y-q.y);}
export function gray(image:ImageData){const a=new Float32Array(image.width*image.height);for(let i=0;i<a.length;i++)a[i]=.299*image.data[i*4]+.587*image.data[i*4+1]+.114*image.data[i*4+2];return a;}
export function makeTemplate(frame:Float32Array,width:number,height:number,box:Box){const x=Math.round(box.x*width),y=Math.round(box.y*height),w=Math.max(4,Math.round(box.w*width)),h=Math.max(4,Math.round(box.h*height));if(x<0||y<0||x+w>width||y+h>height||w>100||h>140)throw Error('選手1人を小さめに囲んでください');const pixels:number[]=[];for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2)pixels.push(frame[(y+j)*width+x+i]);const mean=pixels.reduce((a,b)=>a+b,0)/pixels.length;const centered=pixels.map(p=>p-mean);const norm=Math.sqrt(centered.reduce((a,b)=>a+b*b,0));if(norm/pixels.length<.2)throw Error('模様の少ない領域は追跡できません。選手全体を囲んでください');return {w,h,centered,norm};}
export function locate(frame:Float32Array,width:number,height:number,t:ReturnType<typeof makeTemplate>,box:Box){let best=-1,bx=0,by=0;const px=Math.round(box.x*width),py=Math.round(box.y*height),radius=20;
 for(let y=Math.max(0,py-radius);y<=Math.min(height-t.h,py+radius);y+=2)for(let x=Math.max(0,px-radius);x<=Math.min(width-t.w,px+radius);x+=2){let sum=0,sq=0,dot=0,n=0;for(let j=0;j<t.h;j+=2)for(let i=0;i<t.w;i+=2){const v=frame[(y+j)*width+x+i];sum+=v;sq+=v*v;dot+=v*t.centered[n++]}const norm=Math.sqrt(Math.max(0,sq-sum*sum/n));const score=norm?dot/(norm*t.norm):-1;if(score>best){best=score;bx=x;by=y}}
 return {x:bx/width,y:by/height,w:t.w/width,h:t.h/height,score:Math.max(0,Math.min(1,best))};
}
