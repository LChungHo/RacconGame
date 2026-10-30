import {test,expect} from '@playwright/test';
test('starts_pauses_and_restarts',async({page})=>{
 await page.clock.install();await page.goto('/');await page.locator('#start').click();await page.clock.runFor(100);
 await expect(page.locator('#game-status')).toHaveAttribute('data-phase','running');
 await page.locator('#game-canvas').focus();await page.keyboard.press('KeyP');await page.clock.runFor(32);
 await expect(page.locator('#game-status')).toHaveAttribute('data-phase','paused');
 await page.keyboard.press('KeyP');await page.clock.runFor(32);await page.keyboard.down('ArrowRight');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.clock.runFor(32);
 await expect(page.locator('#game-status')).toHaveAttribute('data-phase','paused');await page.keyboard.up('ArrowRight');
 await page.locator('#restart').click();await page.clock.runFor(32);
 await expect(page.locator('#score')).toHaveText('0');await expect(page.locator('#lives')).toHaveText('3');await expect(page.locator('#game-status')).toHaveAttribute('data-phase','ready');
 const nonBlank=await page.locator('#game-canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');if(!gl)return false;const data=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,data);for(let i=4;i<data.length;i+=4)if(data[i]!==data[0]||data[i+1]!==data[1]||data[i+2]!==data[2])return true;return false;});
 expect(nonBlank).toBe(true);
});

test('real_keys_collect_first_food',async({page})=>{await page.clock.install();await page.goto('/');await page.locator('#start').click();await page.locator('#game-canvas').focus();await page.keyboard.down('ArrowRight');await page.clock.runFor(600);await page.keyboard.up('ArrowRight');await expect(page.locator('#score')).toHaveText('100');});

import { solutions } from '../fixtures/solutions.js';
test('keyboard_route_completes_all_three_stages',async({page})=>{
 test.setTimeout(90000);await page.clock.install({time:new Date('2026-10-30T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T00:00:01Z'));await page.goto('/');await page.locator('#start').click();await page.locator('#game-canvas').focus();
 const codes={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jumpPressed:'Space'};const held=new Set();
 for(const id of ['orchard','moonlight','harvest']){
  await page.clock.runFor(32);await page.screenshot({path:'artifacts/preview-'+id+'.png',fullPage:true});
  for(const part of solutions[id]){
   for(const [flag,code] of Object.entries(codes)){
    if(part.input[flag]&&!held.has(code)){await page.keyboard.down(code);held.add(code);}
    else if(!part.input[flag]&&held.has(code)){await page.keyboard.up(code);held.delete(code);}
   }
   const duration=part.input.up?1000:Math.ceil(part.ticks*1000/60)+(part===solutions[id].at(-1)?50:0);
   await page.clock.runFor(duration);
  }
  for(const code of held)await page.keyboard.up(code);held.clear();
  await page.clock.runFor(1100);
 }
 await expect(page.locator('#game-status')).toHaveAttribute('data-phase','victory');
 await expect(page.locator('#lives')).toHaveText('3');
});