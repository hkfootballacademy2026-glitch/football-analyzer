import {describe,it,expect} from 'vitest';
import {withKit,kitPalette,kitPresets} from './tactic-kits';
import {emptyState,uid,validate,type Piece,type Tactic} from './domain';
const player=(side:Piece['side']):Piece=>({id:uid(),side,number:'10',x:25,y:32,angle:0});
describe('tactic uniforms',()=>{
 it('preserves legacy colours without a selection',()=>{const p=player('home');expect(withKit(p)).toBe(p);expect(kitPalette(p).board).toBe('#d8f197');expect(kitPalette(player('away')).board).toBe('#f5a885')});
 it('applies independent team presets without mutating pieces or equipment',()=>{const kits={home:'blue',away:'red'} as const;const home=player('home'),away=player('away');expect(withKit(home,kits).color).toBe(kitPresets.blue.color);expect(withKit(away,kits).color).toBe(kitPresets.red.color);expect(home.color).toBeUndefined();for(const side of ['ball','cone'] as const){const p=player(side);expect(withKit(p,kits)).toBe(p)}expect(withKit(player('home'),kits).color).toBe(kitPresets.blue.color)});
 it('uses readable numbers on light and dark kits',()=>{expect(kitPalette(withKit(player('home'),{home:'black'})).number).toBe('#ffffff');expect(kitPalette(withKit(player('home'),{home:'white'})).number).toBe('#173a2e')});
 it('retains kit choices through backup validation',()=>{const s=emptyState();const tactic:Tactic={id:uid(),teamId:'',name:'Uniforms',revisionId:'',principleId:'',criterionId:'',tagId:'',notes:'',kits:{home:'purple',away:'yellow'},frames:[{time:0,pieces:[player('home'),player('away')]}]};s.tactics.push(tactic);const restored=validate(JSON.parse(JSON.stringify(s)));expect(restored.tactics[0].kits).toEqual(tactic.kits);expect(()=>validate({...s,tactics:[{...tactic,kits:{home:'invalid'}}]})).toThrow()});
});
