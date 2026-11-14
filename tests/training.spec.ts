import {test,expect} from '@playwright/test';

for(const width of [390,1440])test('training library, diagram, session and persistence at '+width,async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('fa-guide','off'));await page.setViewportSize({width,height:1000});await page.goto('/training');
 await page.getByText('サンプルから始める',{exact:true}).click();await page.getByRole('button',{name:'4対2 パス・サポート',exact:true}).click();
 await expect(page.getByLabel('メニュー名',{exact:true})).toHaveValue('パスの角度をつくる 4対2');
 await page.getByLabel('メニュー名',{exact:true}).fill('週末のパス練習');
 await page.getByRole('button',{name:'コーン',exact:true}).click();const pitch=page.locator('.training-editor .training-pitch');await pitch.click({position:{x:80,y:80}});
 await expect(pitch.locator('[data-piece]')).toHaveCount(12);
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
