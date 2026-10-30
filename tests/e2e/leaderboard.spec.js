import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
async function token(page){await page.goto('/');return page.locator('input[name="__RequestVerificationToken"]').inputValue();}
test('shared_scores_rank_ties_and_retries_without_duplicate_records',async({page,context})=>{
 const csrf=await token(page);
 const send=(name,score,runId=randomUUID())=>context.request.post('/api/leaderboard',{headers:{'X-CSRF-TOKEN':csrf},data:{name,score,runId}});
 const runId=randomUUID();
 const first=await send('순위테스트',100,runId);expect(first.status()).toBe(200);
 expect((await first.json()).entry).toMatchObject({name:'순위테스트',score:100,rank:1});
 await send('공동일등',300);await send('또일등',300);
 const retry=await send('바뀐이름',999,runId);expect(retry.status()).toBe(200);
 const result=await retry.json();expect(result.entry).toMatchObject({name:'순위테스트',score:100,rank:3});
 expect(result.leaders.map(e=>e.rank)).toEqual([1,1,3]);
 const other=await context.browser().newContext();
 try{const data=await (await other.request.get(new URL('/api/leaderboard',page.url()).href)).json();expect(data.leaders).toHaveLength(3);}finally{await other.close();}
 expect((await send('',100)).status()).toBe(400);expect((await send('가나다라마바사아자차카타파',100)).status()).toBe(400);
 expect((await send('잘못된점수',-1)).status()).toBe(400);
 expect((await context.request.post('/api/leaderboard',{data:{runId:randomUUID(),name:'토큰없음',score:0}})).status()).toBe(400);
 const concurrent=await Promise.all(Array.from({length:8},(_,i)=>send('동시저장'+i,500+i)));expect(concurrent.every(response=>response.status()===200)).toBe(true);
 const outside=await (await send("구리'--",1)).json();expect(outside.entry.rank).toBe(12);expect(outside.leaders).toHaveLength(10);
});
test('game_over_saves_once_after_retry_and_late_read_failure_preserves_success',async({page})=>{
 await page.clock.install({time:new Date('2026-10-30T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T00:00:01Z'));
 const submissions=[];let releaseLoad;
 const loadBlocked=new Promise(resolve=>releaseLoad=resolve);
 await page.route('**/api/leaderboard',async route=>{
  if(route.request().method()==='GET'){await loadBlocked;await route.fulfill({status:503,json:{message:'늦은 조회 실패'}});return;}
  submissions.push(route.request().postDataJSON());
  if(submissions.length===1){const response=await route.fetch();expect(response.status()).toBe(200);await route.fulfill({status:503,json:{message:'응답을 받지 못했습니다. 다시 저장해 주세요.'}});}else await route.continue();
 });
 await page.goto('/');await page.locator('#start').click();
 for(let i=0;i<3;i++){await page.locator('#game-canvas').focus();await page.keyboard.down('ArrowRight');await page.clock.runFor(2000);await page.keyboard.up('ArrowRight');await page.clock.runFor(1100);}
 await expect(page.locator('#result-panel')).toBeVisible();
 const score=await page.locator('#score').textContent();
 await page.locator('#player-name').fill('너구리왕');await page.locator('#save-score').click();
 await expect(page.locator('#result-message')).toContainText('다시 저장');await expect(page.locator('#player-name')).toHaveValue('너구리왕');
 await page.locator('#save-score').click();
 await expect(page.locator('#result-receipt')).toContainText('너구리왕');await expect(page.locator('#result-receipt')).toContainText(score+'점');await expect(page.locator('#result-receipt')).toContainText('위');
 const readFinished=page.waitForEvent('requestfinished',{predicate:request=>request.method()==='GET'&&request.url().endsWith('/api/leaderboard')});
 releaseLoad();await readFinished;await page.clock.runFor(100);
 await expect(page.locator('#result-message')).toContainText('서버에 저장했습니다.');
 expect(await page.locator('#leaderboard-body tr').count()).toBeGreaterThan(0);expect(await page.locator('#leaderboard-body tr').count()).toBeLessThanOrEqual(10);
 await expect(page.locator('#save-score')).toBeDisabled();expect(submissions).toHaveLength(2);expect(submissions[0].runId).toBe(submissions[1].runId);
 await page.screenshot({path:'artifacts/shared-ranking.png',fullPage:true});
 await page.locator('#restart').click();await expect(page.locator('#result-panel')).toBeHidden();
});
test('game_can_start_when_random_uuid_is_unavailable',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window.crypto,'randomUUID',{value:undefined});});
 await page.goto('/');await expect(page.locator('#game-error')).toBeHidden();
 await page.locator('#start').click();await expect(page.locator('#game-status')).toHaveAttribute('data-phase','running');
});
