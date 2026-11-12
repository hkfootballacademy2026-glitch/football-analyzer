import {describe,it,expect} from 'vitest';
import {sceneProjection,sceneMatrix,sceneSaveReasons,scenePieces,sceneTactic,mergeDetections,classifyColor,type SceneCandidate} from './scene-reconstruction';
import {emptyState,validate} from './domain';
const points=[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}];
const player=(id='a'):SceneCandidate=>({id,point:{x:.5,y:.5},score:.8,kind:'person',side:'home',number:'10',name:'テスト'});
describe('一場面から戦術ボードへの再現',()=>{
 it('全体と部分ピッチの基準点を正しい場所へ変換する',()=>{expect(sceneProjection(points,'full',{x:.5,y:.5}).x).toBeCloseTo(50);expect(sceneProjection(points,'full',{x:.5,y:.5}).y).toBeCloseTo(32);expect(sceneProjection(points,'rightHalf',points[0]).x).toBeCloseTo(50);expect(sceneProjection(points,'leftPenalty',points[2]).x).toBeCloseTo(16.5);expect(sceneProjection(points,'leftPenalty',points[2]).y).toBeCloseTo(52)});
 it('交差・縮退した4点では保存できない',()=>{expect(()=>scenePieces([player()],[points[0],points[2],points[1],points[3]],'full')).toThrow();expect(()=>scenePieces([player()],Array(4).fill(points[0]),'full')).toThrow()});
 it('未分類や範囲外を黙って補完・端へ丸めない',()=>{expect(()=>scenePieces([{...player(),side:'unknown'}],points,'full')).toThrow();expect(()=>scenePieces([{...player(),point:{x:1,y:1}}],points,'full')).toThrow();expect(scenePieces([{...player(),point:{x:1,y:1},board:{x:60,y:40}}],points,'full')[0].x).toBe(60)});
 it('見えていない選手やボールを追加せず除外を反映する',()=>{const items=[player(),{...player('b'),side:'exclude' as const}];const pieces=scenePieces(items,points,'full');expect(pieces).toHaveLength(1);expect(pieces[0].number).toBe('10');expect(pieces.some(p=>p.side==='ball')).toBe(false)});
 it('重複検出をスコア順にまとめて別人物は残す',()=>{const a={...player(),box:{x:.1,y:.2,w:.2,h:.4}},b={...a,id:'b',score:.6},c={...player('c'),box:{x:.7,y:.2,w:.2,h:.4}};expect(mergeDetections([b,a,c]).map(p=>p.id)).toEqual(['a','c'])});
 it('似た色や色なしの選手を無理にチームへ分類しない',()=>{expect(classifyColor([220,20,20],[230,20,20],[20,20,230])).toBe('home');expect(classifyColor([120,20,120],[230,20,20],[20,20,230])).toBe('unknown');expect(classifyColor([100,100,100],[100,100,100],[105,105,105])).toBe('unknown');expect(classifyColor(undefined,[0,0,0],[255,255,255])).toBe('unknown')});
 it('再現プロジェクトと位置合わせを既存形式で保存・復元する',()=>{const s=emptyState();s.teams.push({id:'team',name:'Team',category:'',season:'',color:'#ffffff',archived:false,players:[]});s.tactics.push(sceneTactic('team','試合再現','source:00:10',[player()],points,'full'));expect(validate(JSON.parse(JSON.stringify(s))).tactics[0].frames[0].pieces).toHaveLength(1)});
 it('複数のボールや選手ゼロの配置は保存しない',()=>{const ball={...player(),kind:'ball' as const,side:'ball' as const};expect(()=>scenePieces([ball],points,'full')).toThrow();expect(()=>scenePieces([player(),ball,{...ball,id:'b'}],points,'full')).toThrow()});
});

describe('交点と手動配置',()=>{
 it('任意の対応順の交点を射影変換できる',()=>{const target=[{x:50,y:32},{x:16.5,y:12},{x:16.5,y:52},{x:50,y:0}],source=target.map(p=>({x:.1+.008*p.x,y:.1+.8*p.y/64}));const p=sceneProjection(source,'full',{x:.5,y:.5},target);expect(p.x).toBeCloseTo(50);expect(p.y).toBeCloseTo(32);expect(scenePieces([player()],source,'full',{targets:target})[0].x).toBeCloseTo(50)});
 it('重複・一直線上・未入力の交点を拒否する',()=>{expect(()=>sceneMatrix(points,'full',[{x:0,y:0},{x:50,y:0},{x:100,y:0},{x:0,y:64}])).toThrow();expect(()=>sceneMatrix(points,'full',Array(4).fill({x:0,y:0}))).toThrow();expect(()=>sceneMatrix(points,'full',new Array(4))).toThrow()});
 it('手動配置は4点不要だが未配置と範囲外を拒否する',()=>{expect(scenePieces([{...player(),board:{x:24,y:45}}],[],'full',{manual:true})[0].x).toBe(24);expect(()=>scenePieces([player()],[],'full',{manual:true})).toThrow();expect(()=>scenePieces([{...player(),board:{x:101,y:1}}],[],'full',{manual:true})).toThrow()});
 it('保存できない理由を未分類・未配置・範囲外ごとに列挙する',()=>{const items=[{...player(),side:'unknown' as const},{...player('b'),board:{x:110,y:2}}];const reasons=sceneSaveReasons(items,i=>i.board,'',false,false).join(' ');expect(reasons).toContain('未分類 1人');expect(reasons).toContain('未配置 1件');expect(reasons).toContain('範囲外 1件');expect(reasons).toContain('チェック');expect(sceneSaveReasons([{...player(),board:{x:1,y:1}}],i=>i.board,'',true,false)).toEqual([])});
});
