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
