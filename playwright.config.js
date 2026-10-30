import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const published=process.env.PUBLISH_SMOKE==='1';
export default defineConfig({
 testDir:'./tests/e2e',...(published?{testMatch:'**/publish-smoke.spec.js'}:{testIgnore:'**/publish-smoke.spec.js'}),
 fullyParallel:false,workers:1,timeout:20000,expect:{timeout:5000},reporter:'list',
 use:{baseURL:published?'http://127.0.0.1:5081/ponpoko/':'http://127.0.0.1:5080',headless:true,viewport:{width:1100,height:900}},
 projects:[{name:'chromium',use:{browserName:'chromium'}}],
 webServer:{
  cwd:published?fileURLToPath(new URL('./artifacts/publish',import.meta.url)):undefined,
  command:published?'dotnet RaccoonGame.dll --urls http://127.0.0.1:5081 --Game:PathBase=/ponpoko':'dotnet run --project RaccoonGame.csproj --no-launch-profile --urls http://127.0.0.1:5080',
  url:published?'http://127.0.0.1:5081/ponpoko/':'http://127.0.0.1:5080',reuseExistingServer:false,timeout:60000,
  env:{ASPNETCORE_ENVIRONMENT:published?'Production':'Development',DOTNET_NOLOGO:'1'}
 }
});
