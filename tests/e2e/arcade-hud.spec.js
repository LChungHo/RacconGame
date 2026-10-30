import { test,expect } from '@playwright/test';
test('hud_shows_only_reached_stages_and_shrinking_bar',async({page})=>{
 await page.clock.install({time:new Date('2026-10-30T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T00:00:01Z'));
 await page.goto('/');await expect(page.getByText('1UP',{exact:true})).toBeVisible();await expect(page.getByText('TOP SCORE',{exact:true})).toBeVisible();
 await expect(page.locator('#food-strip li:visible canvas')).toHaveCount(1);await expect(page.locator('#food-strip li').first()).toHaveAttribute('title','1. 당근');
 await expect(page.locator('#food-strip li').last()).toHaveAttribute('title','20. 맥주');
 await expect(page.locator('#time')).toHaveText('');
 const before=Number(await page.locator('#time').getAttribute('aria-valuenow'));await page.locator('#start').click();await page.clock.runFor(1200);
 expect(Number(await page.locator('#time').getAttribute('aria-valuenow'))).toBeLessThan(before);
 await expect(page.locator('#stage')).toHaveText('1');
 await page.setViewportSize({width:480,height:800});const fits=await page.locator('#food-strip').evaluate(el=>el.scrollWidth<=el.clientWidth+1);expect(fits).toBe(true);
 await page.screenshot({path:'artifacts/arcade-hud-mobile.png',fullPage:true});
});

test('top_score_is_restored_after_reload',async({page})=>{
 await page.clock.install({time:new Date('2026-10-30T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T00:00:01Z'));
 await page.goto('/');await page.locator('#start').click();await page.locator('#game-canvas').focus();await page.keyboard.down('ArrowRight');await page.clock.runFor(350);await page.keyboard.up('ArrowRight');
 await expect(page.locator('#score')).toHaveText('10');await expect(page.locator('#top-score')).toHaveText('10');
 await page.reload();await expect(page.locator('#score')).toHaveText('0');await expect(page.locator('#top-score')).toHaveText('10');
});
test('raccoon_life_icons_count_three_chances_and_reset_after_game_over',async({page})=>{
 await page.clock.install({time:new Date('2026-10-30T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T00:00:01Z'));
 await page.goto('/');await expect(page.locator('#life-strip canvas:visible')).toHaveCount(3);await page.locator('#start').click();
 for(let remaining=2;remaining>=0;remaining--){
  await page.locator('#game-canvas').focus();await page.keyboard.down('ArrowRight');await page.clock.runFor(2000);await page.keyboard.up('ArrowRight');await page.clock.runFor(1100);
  await expect(page.locator('#life-strip canvas:visible')).toHaveCount(remaining);await expect(page.locator('#lives')).toHaveText(String(remaining));
 }
 await expect(page.locator('#game-status')).toHaveAttribute('data-phase','gameOver');
 await page.locator('#restart').click();await expect(page.locator('#life-strip canvas:visible')).toHaveCount(3);
});
test('earned_raccoons_expand_the_life_hud_beyond_three',async({page})=>{
 await page.goto('/');
 const counts=await page.evaluate(async()=>{
  window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false}));
  const [{GameModel},{renderHud}]=await Promise.all([import('/js/game/model.js'),import('/js/game/hud.js')]);
  const root=document.querySelector('#game-root');
  for(const id of ['life-strip','food-strip','clear-dancers'])root.querySelector('#'+id).replaceChildren();
  const level={id:'hud-check',number:1,width:288,height:224,timeLimitSeconds:120,spawn:{x:16,y:16},platforms:[{x:0,y:8,w:288,h:8}],ladders:[],foods:[{id:'near',x:16,y:16,w:8,h:8},{id:'far',x:260,y:16,w:8,h:8}],pots:[],enemies:[],hazards:[]};
  const model=new GameModel([level]),counts=[],empty={left:false,right:false,up:false,down:false,jumpPressed:false};
  const paint=()=>{renderHud(root,model.snapshot());counts.push(root.querySelectorAll('#life-strip li:not([hidden])').length);};
  paint();model.start();model.state.score=29990;model.step(empty,1/60);paint();
  model.state.score=59990;model.state.collectedFoodIds=[];model.step(empty,1/60);paint();
  model.state.secondsLeft=1;model.step(empty,1/60);paint();model.restart();paint();
  return counts;
 });
 expect(counts).toEqual([3,4,5,4,3]);
});
