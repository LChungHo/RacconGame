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

import { writeFile,unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
test('published_app_does_not_serve_source_checkout_files',async({request})=>{
 const name='source-only-'+randomUUID()+'.txt';
 const file=new URL('../../wwwroot/'+name,import.meta.url);
 await writeFile(file,'source checkout sentinel');
 try{const response=await request.get('http://127.0.0.1:5081/ponpoko/'+name);expect(response.status()).toBe(404);}
 finally{await unlink(file);}
});
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
test('published_rankings_survive_restart_and_storage_failure_is_recoverable',async({playwright})=>{
 test.setTimeout(60000);
 const cwd=fileURLToPath(new URL('../../artifacts/publish',import.meta.url));
 const dataDir=fileURLToPath(new URL('../../artifacts/test-data',import.meta.url));await mkdir(dataDir,{recursive:true});
 const database=dataDir+'/restart-'+randomUUID()+'.db',base='http://127.0.0.1:5082/ponpoko/';
 let process;
 const request=await playwright.request.newContext({baseURL:base});
 async function start(databasePath){
  process=spawn('dotnet',['RaccoonGame.dll','--urls','http://127.0.0.1:5082','--Game:PathBase=/ponpoko'],{cwd,env:{...globalThis.process.env,ASPNETCORE_ENVIRONMENT:'Production',Leaderboard__DatabasePath:databasePath},stdio:'ignore',windowsHide:true});
  await expect.poll(async()=>{try{return(await request.get(base)).status();}catch{return 0;}},{timeout:20000}).toBe(200);
 }
 async function stop(){if(!process||process.exitCode!==null)return;const stopped=new Promise(resolve=>process.once('exit',resolve));process.kill();await stopped;}
 async function submit(name){
  const page=await request.get(base),html=await page.text();
  const token=html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/)?.[1];expect(token).toBeTruthy();
  return request.post(base+'api/leaderboard',{headers:{'X-CSRF-TOKEN':token},data:{runId:randomUUID(),name,score:12340}});
 }
 try{
  await start(database);expect((await submit('영구보관')).status()).toBe(200);await stop();
  await start(database);
  const response=await request.get(base+'api/leaderboard');expect(response.status()).toBe(200);
  expect((await response.json()).leaders).toEqual([expect.objectContaining({name:'영구보관',score:12340,rank:1})]);
  expect((await request.get(base+'App_Data/leaderboard.db')).status()).toBe(404);await stop();
  await start(dataDir);
  expect((await request.get(base)).status()).toBe(200);
  expect((await request.get(base+'api/leaderboard')).status()).toBe(503);
  expect((await submit('권한실패')).status()).toBe(503);
 }finally{await stop();await request.dispose();}
});
