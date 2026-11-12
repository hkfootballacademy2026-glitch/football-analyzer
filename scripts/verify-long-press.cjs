const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {stripTypeScriptTypes} = require('node:module');
let source = fs.readFileSync('src/point-menu.tsx', 'utf8').split('export function PointMenu(')[0];
source = source.replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
source = stripTypeScriptTypes(source);
let timers = new Map(), id = 0, opened = [];
const sandbox = {useRef: value => ({current:value}), useEffect:()=>{},
 setTimeout: fn => {timers.set(++id,fn);return id}, clearTimeout: n=>timers.delete(n),
 queueMicrotask: fn=>fn()};
vm.createContext(sandbox);
vm.runInContext(source+';this.create=usePointMenu',sandbox);
const handlers=sandbox.create(p=>opened.push(p),true,true);
const event=(x,y)=>({isPrimary:true,button:0,pointerId:1,pointerType:'touch',clientX:x,clientY:y,target:{},preventDefault(){}});
const flush=()=>{const work=[...timers.values()];timers.clear();work.forEach(fn=>fn())};
handlers.onPointerDownCapture(event(100,100));
flush(); assert.equal(opened.length,0,'holding must not open the menu');
handlers.onContextMenu(event(100,100));
assert.equal(opened.length,0,'native long press must not interrupt dragging');
handlers.onPointerMoveCapture(event(150,130));
handlers.onPointerUpCapture(event(150,130));
handlers.onClickCapture();flush();
assert.equal(opened.length,0,'drag release must not open the menu');
handlers.onPointerDownCapture(event(100,100));
handlers.onPointerUpCapture(event(100,100));
handlers.onClickCapture();flush();
assert.equal(opened.length,1,'stationary tap should still open the menu');
console.log('PASS: hold, native context menu, drag release, stationary tap');
