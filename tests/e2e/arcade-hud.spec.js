import { test,expect } from '@playwright/test';
test('reference_hud_has_twenty_food_icons_and_shrinking_bar_without_numeric_time',async({page})=>{
 await page.clock.install({time:new Date('2026-10-30T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T00:00:01Z'));
 await page.goto('/');await expect(page.getByText('1UP',{exact:true})).toBeVisible();await expect(page.getByText('TOP SCORE',{exact:true})).toBeVisible();
 await expect(page.locator('#food-strip canvas')).toHaveCount(20);await expect(page.locator('#food-strip li').first()).toHaveAttribute('title','1. 당근');
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