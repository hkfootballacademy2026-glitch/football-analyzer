import {test,expect} from '@playwright/test';
import {emptyState,uid,createModel,newPrinciple,formation} from '../src/domain';
test('スマホ幅320・390・768で主要画面とメニューを操作',async({page})=>{
 test.setTimeout(120000);
 const s=emptyState();const team=uid();s.teams.push({id:team,name:'モバイル検証チーム',category:'U10',season:'2026',color:'#123456',archived:false,players:[]});const r=createModel(s,team,'モバイル用モデル',true);r.phases[0].principles.push(newPrinciple('周囲の状況に応じて幅と深さを確保する'));r.status='active';const match=uid();s.matches.push({id:match,teamId:team,revisionId:r.id,opponent:'モバイル対戦相手',date:'2026-11-05',format:8,score:'',videoName:''});s.tactics.push({id:uid(),teamId:team,name:'モバイル戦術',revisionId:r.id,principleId:r.phases[0].principles[0].id,criterionId:'',tagId:'',frames:[{time:0,pieces:formation(8)}],notes:''});
 await page.goto('/');await expect(page.getByRole('heading',{name:'チームの「らしさ」を、プレーに。'})).toBeVisible();await page.evaluate(async data=>{await new Promise<void>((resolve,reject)=>{const req=indexedDB.open('football-analyzer-v1');req.onsuccess=()=>{const db=req.result;const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put({id:'main',data});tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}})},s);
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});await page.goto('/');await page.getByRole('button',{name:'メニュー',exact:true}).click();await expect(page.getByRole('button',{name:'ナビゲーションを閉じる'})).toBeVisible();await page.getByRole('link',{name:'試合分析',exact:true}).click();await expect(page.getByRole('button',{name:'メニュー',exact:true})).toHaveAttribute('aria-expanded','false');
  for(const route of ['/','/teams','/models','/matches','/analysis/'+match,'/editor/'+match,'/tactics','/movement','/dashboard','/reports','/settings']){
   await page.goto(route);await expect(page.locator('main h1')).toBeVisible();
   if(route==='/models')await page.getByRole('button',{name:'v1 公開版'}).click();
   if(route==='/tactics')await page.getByRole('combobox',{name:'保存済みプロジェクト'}).selectOption({index:1});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${route} overflow`).toBeTruthy();
   if(width===390&&['/','/analysis/'+match,'/tactics','/models'].includes(route))await page.screenshot({path:`test-results/mobile-dark-${route==='/'?'home':route.split('/')[1]}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'メニュー',exact:true}).click();await page.getByRole('button',{name:'ナビゲーションを閉じる'}).click();await expect(page.getByRole('button',{name:'メニュー',exact:true})).toBeFocused();
 }
});
