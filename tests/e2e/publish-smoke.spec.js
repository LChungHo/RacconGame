import {test,expect} from '@playwright/test';
test('published_assets_work_under_pathbase',async({page})=>{
 const failedRequests=[],externalRequests=[],pageErrors=[],localPaths=[],bundleResponses=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',r=>{const u=new URL(r.url());if(!u.protocol.startsWith('http'))return;if(u.origin!=='http://127.0.0.1:5081')externalRequests.push(r.url());else localPaths.push(u.pathname);});
 page.on('requestfailed',r=>failedRequests.push(r.url()));
 page.on('response',r=>{if(r.status()>=400)failedRequests.push(r.url());if(new URL(r.url()).pathname.endsWith('/dist/game.js'))bundleResponses.push(r.status());});
 const response=await page.goto('http://127.0.0.1:5081/ponpoko/');
 expect(response.status()).toBe(200);await expect(page.locator('#start')).toBeEnabled();
 await page.locator('#start').click();await expect(page.locator('#game-status')).toHaveAttribute('data-phase','running');
 expect(bundleResponses).toEqual([200]);expect(failedRequests).toEqual([]);expect(externalRequests).toEqual([]);expect(pageErrors).toEqual([]);
 expect(localPaths.length).toBeGreaterThanOrEqual(3);expect(localPaths.every(p=>p.startsWith('/ponpoko/'))).toBe(true);
});
