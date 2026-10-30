import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testIgnore: '**/publish-smoke.spec.js', fullyParallel: false, workers: 1,
  timeout: 20000, expect: { timeout: 5000 }, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5080', headless: true, viewport: { width: 1100, height: 900 } },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: { command: 'dotnet run --project RaccoonGame.csproj --no-launch-profile --urls http://127.0.0.1:5080',
    url: 'http://127.0.0.1:5080', reuseExistingServer: false, timeout: 60000,
    env: { ASPNETCORE_ENVIRONMENT: 'Development', DOTNET_NOLOGO: '1' } }
});
