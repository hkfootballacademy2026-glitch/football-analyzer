import {tr} from './workspace-tools';
export const commonDrawingTools=[['arrow','矢印'],['line','線'],['circle','円'],['rect','四角'],['triangle','三角'],['trapezoid','台形'],['text','文字']] as const;
export function DrawingToolbar({value,onSelect,disabled=false,extras=[],select='select'}:{value:string;onSelect:(tool:string)=>void;disabled?:boolean;extras?:readonly (readonly [string,string])[];select?:string}){
 return <div className="actions shared-drawing-toolbar" role="toolbar" aria-label="描画の道具">{[[select,'選択・移動'],...commonDrawingTools,...extras].map(([id,label])=><button type="button" className={value===id?'button primary':'button'} aria-pressed={value===id} disabled={disabled} key={id} onClick={()=>onSelect(id)}>{tr(label)}</button>)}</div>;
}
