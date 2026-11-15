import {test,expect} from '@playwright/test';
test.use({launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}});

for(const width of [390,1440])test('training library, diagram, session and persistence at '+width,async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('fa-guide','off'));await page.setViewportSize({width,height:1000});await page.goto('/training');
 await page.getByText('サンプルから始める',{exact:true}).click();await page.getByRole('button',{name:'4対2 パス・サポート',exact:true}).click();
 await expect(page.getByLabel('メニュー名',{exact:true})).toHaveValue('パスの角度をつくる 4対2');
 await page.getByLabel('メニュー名',{exact:true}).fill('週末のパス練習');
 await page.getByRole('button',{name:'コーン',exact:true}).click();const pitch=page.locator('.training-editor .training-pitch');await pitch.click({position:{x:80,y:80}});
 await expect(pitch.locator('[data-piece]')).toHaveCount(12);
 await page.getByRole('button',{name:'3D / 立体表示',exact:true}).click();
 const canvas=page.locator('.training-three-host canvas');await expect(canvas).toBeVisible();
 await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.width)).toBeGreaterThan(100);
 await page.getByRole('button',{name:'サイド',exact:true}).click();await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'選手目線',exact:true}).click();await page.getByLabel('目線を確認する選手').selectOption({index:1});await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'斜め',exact:true}).click();await page.getByRole('button',{name:'3Dを拡大',exact:true}).click();
 await page.locator('.training-three').screenshot({path:'test-results/training-3d-'+width+'.png'});
 await page.getByRole('button',{name:'2D / 配置図',exact:true}).click();await expect(pitch.locator('[data-piece]')).toHaveCount(12);
 await expect(page.locator('.training-three-host canvas')).toHaveCount(0);
 await page.screenshot({path:'test-results/training-designer-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'このメニューから練習計画を作成',exact:true}).click();
 await page.getByLabel('予定時間（分）',{exact:true}).fill('10');await expect(page.locator('.training-total')).toContainText('予定時間を超えています');
 await page.getByLabel('できたこと',{exact:true}).fill('顔を上げて受けられた');await expect(page.locator('.save-status')).toContainText('端末に保存済み');
 await page.reload();await page.getByRole('button',{name:/練習計画・振り返り/}).click();await page.getByLabel('練習計画を選択',{exact:true}).selectOption({index:1});
 await expect(page.getByLabel('できたこと',{exact:true})).toHaveValue('顔を上げて受けられた');
 await expect(page.locator('.training-total')).toContainText('合計 15 分');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:'test-results/training-session-'+width+'.png',fullPage:true});
 await page.emulateMedia({media:'print'});await expect(page.locator('.training-print-sheet')).toBeVisible();await expect(page.locator('.training-print-sheet')).toContainText('顔を上げて受けられた');await page.emulateMedia({media:'screen'});
 await page.getByRole('button',{name:/メニューライブラリ/}).click();await page.getByRole('button',{name:/週末のパス練習/}).click();
 await page.getByRole('button',{name:'配置を戦術ボードへコピーして動きを作る',exact:true}).click();await expect(page).toHaveURL(/tactics\?project=/);await expect(page.locator('.tactics-canvas')).toBeVisible();
});

test('3D unavailable keeps the saved 2D diagram usable',async({page})=>{await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind:string,...args:any[]){if(kind.includes('webgl'))return null;return (original as any).call(this,kind,...args)} as any;localStorage.setItem('fa-guide','off');});await page.goto('/training');await page.getByRole('button',{name:'＋ メニュー作成',exact:true}).click();await page.getByRole('button',{name:'3D / 立体表示',exact:true}).click();await expect(page.getByRole('alert')).toContainText('この端末では3Dを表示できません');await page.getByRole('button',{name:'2Dに戻る',exact:true}).click();await expect(page.locator('.training-editor .training-pitch')).toBeVisible();});

for(const width of [390,1440])test('drawing tools, annotations, undo and 3D round trip at '+width,async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('fa-guide','off'));await page.setViewportSize({width,height:1000});await page.goto('/training');await page.getByRole('button',{name:'＋ メニュー作成',exact:true}).click();
 const pitch=page.locator('.training-editor .training-pitch');
 const draw=async(name:string,x:number,y:number,ex:number,ey:number)=>{await page.getByRole('button',{name,exact:true}).click();await pitch.scrollIntoViewIfNeeded();const b=(await pitch.boundingBox())!;const pos=(x:number,y:number)=>({x:b.x+(x+4)/108*b.width,y:b.y+(y+4)/72*b.height});const a=pos(x,y),z=pos(ex,ey);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(z.x,z.y,{steps:5});await page.mouse.up();};
 await draw('波線',15,15,65,15);await expect(page.getByLabel('線の種類',{exact:true})).toHaveValue('wave');await page.getByLabel('図形の色',{exact:true}).fill('#ff0000');
 for(const [name,x,y,ex,ey] of [['円',10,25,30,45],['四角',40,25,60,45],['三角',70,25,90,45],['台形',40,48,60,60]] as const)await draw(name,x,y,ex,ey);
 await page.getByLabel('領域を塗る').check();await draw('文字',15,55,15,55);await page.getByLabel('注釈の文字',{exact:true}).fill('シュートの判断');
 await expect(pitch.locator('[data-piece]')).toHaveCount(6);await page.getByRole('button',{name:'選択を複製',exact:true}).click();await expect(pitch.locator('[data-piece]')).toHaveCount(7);await page.getByRole('button',{name:'元に戻す',exact:true}).click();await expect(pitch.locator('[data-piece]')).toHaveCount(6);await page.getByRole('button',{name:'やり直す',exact:true}).click();await expect(pitch.locator('[data-piece]')).toHaveCount(7);await page.getByRole('button',{name:'選択・移動',exact:true}).click();await pitch.locator('[data-piece]').last().click();await page.getByRole('button',{name:'選択を削除',exact:true}).click();await expect(pitch.locator('[data-piece]')).toHaveCount(6);
 await page.getByRole('button',{name:'3D / 立体表示',exact:true}).click();await expect(page.locator('.training-three-host canvas')).toBeVisible();await page.locator('.training-three').screenshot({path:'test-results/training-drawing-3d-'+width+'.png'});await page.getByRole('button',{name:'2D / 配置図',exact:true}).click();await expect(pitch).toContainText('シュートの判断');await expect(pitch.locator('polyline[stroke="#ff0000"]')).toHaveCount(1);
 await expect(page.locator('.save-status')).toContainText('端末に保存済み');await page.reload();await page.locator('.training-card').first().click();await expect(pitch).toContainText('シュートの判断');await expect(pitch.locator('[data-piece]')).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('button',{name:'配置を戦術ボードへコピーして動きを作る',exact:true}).click();await expect(page).toHaveURL(/tactics\?project=/);await expect(page.locator('.tactics-canvas')).toBeVisible();
});

test('multiple selection moves as a group and undo restores both players',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('fa-guide','off'));await page.setViewportSize({width:390,height:1000});await page.goto('/training');await page.getByRole('button',{name:'＋ メニュー作成',exact:true}).click();const pitch=page.locator('.training-editor .training-pitch');
 const point=async(x:number,y:number)=>{await pitch.scrollIntoViewIfNeeded();const b=(await pitch.boundingBox())!;return {x:b.x+(x+4)/108*b.width,y:b.y+(y+4)/72*b.height};};
 for(const [name,x] of [['味方',20],['相手',45]] as const){await page.getByRole('button',{name,exact:true}).click();const p=await point(x,25);await page.mouse.click(p.x,p.y);}
 await page.getByRole('button',{name:'複数選択',exact:true}).click();await page.getByRole('button',{name:'選択を解除',exact:true}).click();for(const x of [20,45]){const p=await point(x,25);await page.mouse.click(p.x,p.y);}await expect(page.locator('.training-drawing-inspector>b')).toHaveText('2個を選択中');
 const a=await point(20,25),b=await point(30,30);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:5});await page.mouse.up();
 const first=pitch.locator('[data-piece]').nth(0).locator('circle').first(),second=pitch.locator('[data-piece]').nth(1).locator('circle').first();await expect.poll(async()=>Number(await first.getAttribute('cx'))).toBeCloseTo(30,0);await expect.poll(async()=>Number(await second.getAttribute('cx'))).toBeCloseTo(55,0);await page.getByRole('button',{name:'元に戻す',exact:true}).click();await expect.poll(async()=>Number(await first.getAttribute('cx'))).toBeCloseTo(20,0);await expect.poll(async()=>Number(await second.getAttribute('cx'))).toBeCloseTo(45,0);
});
