import type {Piece} from './domain';
export const kitIds=['lime','coral','blue','red','white','black','yellow','purple'] as const;
export type KitId=typeof kitIds[number];
export type Kits=Partial<Record<'home'|'away',KitId>>;
export const kitPresets:Record<KitId,{label:string;color:string}>={
 lime:{label:'ライトグリーン',color:'#d8f197'},coral:{label:'オレンジ',color:'#f5a885'},
 blue:{label:'ブルー',color:'#2563eb'},red:{label:'レッド',color:'#dc2626'},
 white:{label:'ホワイト',color:'#f8fafc'},black:{label:'ブラック',color:'#202a30'},
 yellow:{label:'イエロー',color:'#facc15'},purple:{label:'パープル',color:'#9333ea'}
};
export function withKit(piece:Piece,kits?:Kits):Piece{
 if(piece.side!=='home'&&piece.side!=='away')return piece;
 const kit=kits?.[piece.side];return kit?{...piece,color:kitPresets[kit].color}:piece;
}
export function kitPalette(piece:Piece){
 const home=piece.side==='home',color=piece.color;
 if(!color)return {board:home?'#d8f197':'#f5a885',shirt:home?'#c9e894':'#f09a78',trim:home?'#294d38':'#633d48',number:'#173a2e'};
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const text=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>155?'#173a2e':'#ffffff';
 return {board:color,shirt:color,trim:text,number:text};
}
