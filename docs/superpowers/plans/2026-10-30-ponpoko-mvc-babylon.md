# Ponpoko Raccoon Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ASP.NET Core MVC, Babylon.js, JavaScript로 1인용 너구리 게임을 만들고 IIS 배포용 결과물과 검증 절차를 준비한다.

**Architecture:** MVC는 게임 페이지와 초기 설정을 제공하고, 브라우저의 JavaScript가 고정 시간 간격으로 게임을 시뮬레이션한다. Babylon.js는 고정 직교 카메라와 평면 도트 텍스처로 상태를 렌더링하며 게임 판정에 관여하지 않는다. npm으로 고정한 의존성을 로컬 번들로 만들어 IIS에서 제공하고, 운영 서버에는 Node.js를 요구하지 않는다.

**Tech Stack:** ASP.NET Core MVC / C# / net10.0, JavaScript ES modules, @babylonjs/core 9.33.1, esbuild 0.28.2, Node.js 내장 테스트 러너, @playwright/test 1.64.1, Windows IIS.

**Spec:** [AGENTS.md](../../../AGENTS.md)의 확정 기술 구성과 요구사항 후보. 별도로 승인된 설계 문서는 아직 없다. 이 계획은 사용자가 요청한 검토용 초안이며, 아래 제안 범위를 승인된 요구사항으로 취급하지 않는다.

## Global Constraints

AGENTS.md에서 그대로 가져온 공통 제약:

- 서버: ASP.NET Core MVC와 C#.
- 뷰: Razor View로 게임 페이지와 필요한 초기 설정을 제공한다.
- 게임 렌더링: Babylon.js.
- 클라이언트 게임 로직: JavaScript.
- 운영 배포: Windows의 IIS 서버.
- 이 기술 구성을 임의로 다른 프레임워크나 게임 엔진으로 변경하지 않는다.
- 의존성을 추가할 때는 목적을 명확히 하고 버전을 고정한다. 기존 프로젝트 설정이 생기면 그 구성을 우선한다.
- 게임 시뮬레이션과 렌더링을 분리한다. 렌더링 프레임 수가 이동 속도, 중력, 제한 시간을 바꾸지 않도록 한다.
- 단일 플레이의 매 프레임 상태를 서버로 전송하지 않는다. 서버 통신은 실제 서버 기능이 필요할 때 설계한다.
- 데이터베이스, 로그인, 서버에 저장하는 점수는 요구가 생기기 전까지 추가하지 않는다.
- 서버에 대한 배포나 설정 변경은 사용자가 요청한 범위에서만 수행한다.

## Review Focus

1. 프레임 정지·다른 창 전환 후 시간 폭주와 눌린 키 잔류가 없어야 한다. Task 2의 clock.test.js와 Task 6의 input/app 테스트.
2. 발판 끝·사다리 상하단·빠른 하강에서 캐릭터가 관통하거나 갇히지 않아야 한다. Task 3의 movement.test.js.
3. 한 프레임의 중복 접촉과 마지막 먹거리·피격 동시 발생에서 목숨과 점수가 중복 처리되지 않아야 한다. Task 4의 rules.test.js.
4. 반복 재시작·창 크기 변경·WebGL 실패·음소거에서 루프와 리소스가 누적되거나 게임 전체가 멈추지 않아야 한다. Task 5와 Task 6의 단위/E2E 테스트.
5. IIS 하위 애플리케이션 경로와 CDN 차단 환경에서도 번들·리소스가 로드되어야 한다. Task 8의 publish-smoke.spec.js 및 IIS 수동 검증.

---

## 현재 상태와 실행 전 조건

- 2026-10-30 확인: 현재 저장소에는 AGENTS.md만 있으며 앱, 의존성, 테스트는 없다.
- 작업 경로: C:/Users/Administrator/.codex/worktrees/ponpoko-game/RacconGame.
- 앱이 관리하는 기존 워크트리이며 HEAD는 415fdc6의 detached 상태다. 다른 워크트리를 새로 만들지 않는다.
- AGENTS.md는 미추적 파일이다. 삭제하거나 사용자의 요청 없이 내용을 바꾸지 않는다.
- 개발 환경: .NET SDK 10.0.403, ASP.NET Core 런타임 10.0.14, Node.js 24.22.0, npm 11.19.1.
- SDK 10.0.403과 net10.0을 제안한다. .NET 10은 LTS이며 실제 IIS 서버의 런타임과 Hosting Bundle 호환성은 배포 전에 확인한다.
- 패키지 버전은 계획 작성 시 npm 레지스트리에서 확인했다. 설치·프로젝트 생성은 아직 하지 않았다.
- npm 기본 캐시에 샌드박스 쓰기 제한이 관찰됐다. 같은 오류가 재현되면 npm 명령의 --cache를 쓰기 가능한 임시 경로로 지정한다. 권한 실패를 패키지 결함으로 오인하지 않는다.
- 작업 폴더가 기본 쓰기 허용 범위 밖이면 지원되는 승인 절차를 사용한다. 다른 체크아웃으로 몰래 바꾸어 작업하지 않는다.
- 실제 구현 전 제안 범위를 검토하고 brainstorming 절차의 설계 문서 승인을 완료한다. 이 문서 작성 자체는 구현 시작 승인이 아니다.

## 제안 범위와 게임 규칙

아래 수치는 **원작에서 검증한 값이 아니라 이번 첫 버전을 위한 제안**이다. 승인 시 설계 문서로 옮기고 이 계획의 Spec 링크를 추가한다.

| 항목 | 제안 |
|---|---|
| 실행·표현 | PC 브라우저 키보드 1인용, 288 × 224 논리 좌표의 고정 화면, 직접 만든 도트 표현 |
| 조작 | 방향키 좌우 이동·상하 사다리, Space 점프, Enter 시작, P 일시정지/재개; 화면 버튼도 제공 |
| 기본 수치 | 목숨 3, 스테이지 120초, 이동 72px/s, 점프 초기 속도 192px/s, 중력 480px/s², 사다리 56px/s |
| 판정 | 플레이어 12 × 16px; 좌표는 좌하단, x 오른쪽·y 위쪽; AABB의 양의 면적 겹침을 충돌로 판단 |
| 점수 | 필수 먹거리 100점, 보너스 항아리 500점, 클리어 시 남은 시간 내림값 × 10점; 추가 목숨 없음 |
| 위험 | 적·가시 접촉, 화면 하단 이탈, 지지 발판 높이보다 64px 초과 낮은 곳에 착지, 시간 0 이하 |
| 항아리 | 맵에 bonus 또는 snake를 지정; bonus는 1회 득점, snake는 접촉 즉시 사망; 클리어 필수 조건 아님 |
| 사망 | 목숨 1 차감; 남으면 dying 1초 후 현재 스테이지 처음부터 재도전; 없으면 gameOver |
| 재도전 | 시간·먹거리·항아리·적 배치를 초기화하고 점수는 해당 스테이지 시작 점수로 되돌림 |
| 클리어 | 필수 먹거리 전부 수집 후 stageClear 1초; 다음 스테이지로 진행, 3번째 완료 후 victory |
| 우선순위 | 같은 틱에서 위험/시간 초과를 먼저 판정; 생존한 경우 수집→클리어 순서; 한 틱의 사망은 최대 1회 |
| 일시정지 | blur/문서 hidden이면 paused와 입력 초기화; 복귀 후 자동 재개하지 않고 버튼 또는 P로 재개 |
| 첫 범위 밖 | 터치 조작, 멀티플레이, 계정, 온라인 순위표, 원작 전체 스테이지·수치의 완전 복원 |

키 입력은 게임 캔버스 또는 게임 컨트롤이 활성화된 동안만 기본 동작을 차단한다. 폼 입력이나 다른 페이지 영역에서 방향키·Space를 가로채지 않는다.

## 파일 구조와 책임

경로는 저장소 루트 기준이다. 실제 생성은 해당 Task에서만 한다.

| 파일 | 책임 |
|---|---|
| global.json, RaccoonGame.csproj, Program.cs | SDK 고정, MVC 및 정적 파일 제공, 필요한 경우 환경별 PathBase 처리 |
| Controllers/GameController.cs, ViewModels/GamePageViewModel.cs | GET / 및 초기 게임 설정 |
| Views/_ViewImports.cshtml, Views/_ViewStart.cshtml, Views/Shared/_Layout.cshtml, Views/Game/Index.cshtml | Razor 레이아웃, 캔버스·HUD·컨트롤·안내 |
| wwwroot/css/game.css | 논리 화면 비율 유지와 페이지 스타일 |
| package.json, package-lock.json, scripts/build-client.mjs | 고정 패키지와 로컬 번들 생성 |
| wwwroot/js/game/contracts.js, config.js | JSDoc 계약·상태 이름·상수; DOM/Babylon 의존성 없음 |
| wwwroot/js/game/levels/index.js, level-01.js, level-02.js, level-03.js | 검증 및 스테이지 데이터 |
| wwwroot/js/game/model.js, clock.js | 세션 상태와 고정 스텝 시계 |
| wwwroot/js/game/movement.js, rules.js | 이동·발판·사다리 판정 및 위험·점수·진행 규칙 |
| wwwroot/js/game/renderer.js, sprites.js | Babylon 씬·카메라·평면 텍스처 및 직접 작성한 픽셀 패턴 |
| wwwroot/js/game/input.js, audio.js, hud.js, app.js, main.js | 입력·효과음·DOM·루프 수명 관리·부트스트랩 |
| tests/helpers/fixtures.js, tests/fixtures/solutions.js | 작은 게임 규칙용 맵과 실제 이동으로 클리어하는 입력 시퀀스 |
| tests/unit/clock.test.js, model.test.js, levels.test.js, movement.test.js, rules.test.js, renderer.test.js, input.test.js, audio.test.js, app.test.js | Node 내장 테스트 |
| playwright.config.js, tests/e2e/shell.spec.js, rendering.spec.js, gameplay.spec.js, publish-smoke.spec.js | 실제 MVC·브라우저·배포 결과 검증 |
| scripts/publish.ps1, README.md, docs/deployment/iis.md, wwwroot/assets/README.md | 게시 절차·실행 방법·리소스 출처 |
| .gitignore | bin/, obj/, node_modules/, wwwroot/dist/, artifacts/, test-results/, playwright-report/ 제외 |

## 공통 인터페이스

JavaScript 타입은 contracts.js의 JSDoc으로 정의한다. TypeScript 전환은 범위에 없다.

- Rect = { x:number, y:number, w:number, h:number }; 좌하단 기준.
- InputFrame = { left:boolean, right:boolean, up:boolean, down:boolean, jumpPressed:boolean }.
- LevelData = { id:string, width:number, height:number, timeLimitSeconds:number, spawn:{x:number,y:number}, platforms:Rect[], ladders:Rect[], foods:Array<Rect & {id:string,points:number}>, enemies:Array<Rect & {id:string,minX:number,maxX:number,speed:number,direction:1|-1}>, hazards:Array<Rect & {id:string}>, pots:Array<Rect & {id:string,outcome:'bonus'|'snake'}> }.
- PlayerState = Rect & { vx:number, vy:number, facing:1|-1, mode:'grounded'|'airborne'|'climbing'|'dead', supportY:number|null, fallStartY:number|null }.
- EnemyState = Rect & { id:string, minX:number, maxX:number, speed:number, direction:1|-1 }.
- GamePhase = 'ready'|'running'|'paused'|'dying'|'stageClear'|'gameOver'|'victory'.
- GameState = { phase:GamePhase, levelIndex:number, score:number, lives:number, secondsLeft:number, phaseSeconds:number, stageStartScore:number, player:PlayerState, enemies:EnemyState[], collectedFoodIds:string[], openedPotIds:string[] }.
- GameEvent = { type:'food'|'bonus'|'death'|'stageClear'|'victory' }.
- Renderer = { render(state:GameState):void, resize():void, dispose():void }.
- Audio = { unlock():Promise<void>, play(event:GameEvent):void, setMuted(value:boolean):void, dispose():void }.
- Input = { read():InputFrame, clear():void, dispose():void }; read()에서 jumpPressed만 1회 소비한다.
- Scheduler = { request(callback:(nowMs:number)=>void):number, cancel(id:number):void, now():number }.

## Task 1: MVC 게임 페이지와 재현 가능한 클라이언트 빌드

**Files:** Create: global.json, RaccoonGame.csproj, Program.cs, Controllers/GameController.cs, ViewModels/GamePageViewModel.cs, Views/_ViewImports.cshtml, Views/_ViewStart.cshtml, Views/Shared/_Layout.cshtml, Views/Game/Index.cshtml, wwwroot/css/game.css, wwwroot/js/game/main.js, package.json, package-lock.json, scripts/build-client.mjs, playwright.config.js, tests/e2e/shell.spec.js, .gitignore.
**Interfaces:** Produces: GameController.Index():IActionResult at GET /; GamePageViewModel(string AssetBaseUrl, int LogicalWidth, int LogicalHeight); main.js entry; npm scripts build, test:unit, test:e2e. DOM: #game-canvas, #game-status, #score, #lives, #time, #start, #pause, #restart, #mute, #game-error.

- [ ] **Step 1:** 실행 전 승인 조건을 확인하고 최소 MVC 템플릿과 테스트 실행 도구를 준비한다. global.json은 SDK 10.0.403/rollForward latestPatch; 프로젝트는 net10.0. npm은 type:module, engines.node >=24.22.0 <25; 패키지는 위 Tech Stack의 정확한 버전을 --save-exact로 설치한다. build는 esbuild로 main.js를 wwwroot/dist/game.js에 ESM 번들링한다. test:unit은 node --test "tests/unit/*.test.js", test:e2e는 npm run build 후 playwright test. playwright webServer는 dotnet run --project RaccoonGame.csproj --no-launch-profile --urls http://127.0.0.1:5080, Development, reuseExistingServer:false로 둔다. 필요한 브라우저 설치는 npx playwright install chromium.
- [ ] **Step 2:** shell.spec.js에 game_page_has_accessible_controls 테스트를 작성한다. GET / 응답 200, 캔버스 1개, 이름이 있는 시작 버튼, 한국어 조작 설명, 초기 점수 0을 검증한다.
```javascript
const response = await page.goto('/');
expect(response.status()).toBe(200);
await expect(page.locator('#game-canvas')).toHaveCount(1);
await expect(page.getByRole('button', { name: '시작', exact: true })).toBeVisible();
await expect(page.locator('#score')).toHaveText('0');
```

- [ ] **Step 3:** npm run test:e2e -- tests/e2e/shell.spec.js 실행. 템플릿에 없는 캔버스/컨트롤을 찾지 못해 FAIL해야 한다. 브라우저 미설치나 복원 실패는 기능의 red 결과로 인정하지 않는다.
- [ ] **Step 4:** MVC 페이지를 구현한다. 불필요한 MVC 템플릿의 Bootstrap/jQuery/Privacy 예제는 제거한다. 초기 설정은 System.Text.Json의 안전한 기본 인코딩과 camelCase 속성명으로 직렬화하여 application/json 요소에 넣고 main.js에서 파싱한다. 클라이언트 초기 설정 이름은 assetBaseUrl/logicalWidth/logicalHeight이다. 리소스 경로는 Url.Content 기반으로 전달한다. 빌드 생성물은 추적하지 않고 원본 JavaScript는 Node 테스트에서 직접 import한다. .csproj에는 게시 시 dist 누락을 막는 검사를 추가하되 게시 서버에서 npm을 실행하지 않는다.
- [ ] **Step 5:** dotnet build RaccoonGame.csproj와 Step 3 명령을 실행해 빌드 성공 및 shell 테스트 PASS를 확인한다.
- [ ] **Step 6:** git add global.json RaccoonGame.csproj Program.cs Controllers ViewModels Views wwwroot/css wwwroot/js/game/main.js package.json package-lock.json scripts/build-client.mjs playwright.config.js tests/e2e/shell.spec.js .gitignore; git commit -m "feat: serve MVC game shell with local client build". 셸 구분자로 묶지 말고 각 명령을 별도로 실행한다.

## Task 2: 스테이지 계약·세션 초기화·고정 스텝 시계

**Files:** Create: wwwroot/js/game/contracts.js, config.js, clock.js, model.js, levels/index.js, levels/level-01.js; tests/helpers/fixtures.js, tests/unit/clock.test.js, model.test.js, levels.test.js.
**Interfaces:** Produces: levels:LevelData[] (초기에는 제1 스테이지 하나), validateLevel(level:LevelData):string[]; createClock(step:(dt:number)=>void):{advance(elapsed:number):number,reset():void}; GameModel constructor(levels:LevelData[]), start():void, pause():void, resume():void, restart():void, snapshot():GameState, step(input:InputFrame,dt:number):GameEvent[]. step()은 이 단계에서 이동/상호작용 없이 상태 제어만 한다. fixtures.js는 createFlatLevel(overrides:Partial<LevelData>):LevelData, emptyInput():InputFrame을 제공한다.

- [ ] **Step 1:** 다음 assertion을 가진 테스트를 작성한다.
  - clock_equivalent_frame_rates: 1초를 30회 또는 120회 advance하면 각각 step 호출 60회.
  - clock_clamps_long_gap: advance(10)은 step 호출 5회 이하이고 이후 advance(0)에 미처리 10초가 남지 않는다.
  - model_starts_and_restarts: start 후 phase running/lives 3/score 0/secondsLeft 120; pause→resume, restart 후 levelIndex 0 확인.
  - level_rejects_invalid_data: width 0, 중복 food id, NaN 좌표, 경계 밖 시작 위치, minX > maxX 적, timeLimitSeconds <=0에 오류가 나온다.
```javascript
// clock_equivalent_frame_rates
for (const rate of [30, 120]) {
  let ticks = 0;
  const clock = createClock(() => ticks++);
  for (let i = 0; i < rate; i++) clock.advance(1 / rate);
  assert.equal(ticks, 60);
}
```

- [ ] **Step 2:** node --test tests/unit/clock.test.js tests/unit/model.test.js tests/unit/levels.test.js 실행. 미구현 모듈 또는 API로 FAIL 확인.
- [ ] **Step 3:** 위 인터페이스를 구현한다. 시계는 1/60초 고정 스텝, 호출당 최대 5회; 초과 backlog는 버리고 잔여 소수 시간만 유지한다. 0 미만·NaN·Infinity 시간 입력은 무시한다. reset은 누적시간 0. pause/resume/restart는 중복 호출에 안전하게 한다. pause는 running/dying/stageClear의 이전 phase를 모델 내부에 보관하고 resume는 그 phase로 돌아간다; ready/gameOver/victory에서 pause는 무시한다. 상태 snapshot은 외부 변경이 원본에 영향을 주지 않는 복사본이다. level-01.js에는 바닥과 음식 하나를 가진 유효한 초기 맵을 만들어 levels로 export한다; Task 7에서 최종 첫 맵으로 확장한다.
- [ ] **Step 4:** Step 2 명령 실행, 모두 PASS. 음수/NaN 시간과 snapshot 변조 후 원본 불변도 테스트에 포함한다.
- [ ] **Step 5:** 이 Task의 Files만 git add한 뒤 git commit -m "feat: add deterministic game model and fixed step clock".

## Task 3: 이동·점프·사다리·발판 충돌

**Files:** Create: wwwroot/js/game/movement.js, tests/unit/movement.test.js. Modify: wwwroot/js/game/model.js.
**Interfaces:** Consumes: PlayerState, InputFrame, LevelData, GameModel.step. Produces: stepPlayer(player:PlayerState,input:InputFrame,level:LevelData,dt:number):void; GameModel.step에서 running일 때 호출한다.

- [ ] **Step 1:** movement.test.js에 다음 테스트를 작성한다.
  - grounded_moves_72_pixels_in_one_second: 안전한 긴 발판에서 오른쪽 60틱 후 x가 시작값+72에 1e-6 오차 이내.
  - jump_requires_new_press: 바닥에서 jumpPressed=true면 상승; 공중 재입력은 vy를 192로 재설정하지 않음.
  - swept_landing_does_not_tunnel: 하강 경로가 발판 상면을 가로지르면 발이 발판 상면에 맞춰지고 vy=0/mode grounded.
  - ladder_requires_overlap_and_exits_at_ends: 플레이어 중심이 사다리 중앙 ±4px와 수직 범위에 있어야 상하 입력으로 진입; 상단은 위 발판, 하단은 아래 발판에 정확히 놓임.
  - edges_and_opposite_keys: 발판을 벗어나면 airborne; 좌우 동시 입력은 vx=0; x는 0..width-player.w 안에 유지.
```javascript
// grounded_moves_72_pixels_in_one_second: createFlatLevel의 안전한 바닥 위 플레이어
const startX = player.x;
for (let i = 0; i < 60; i++) stepPlayer(player, { ...emptyInput(), right: true }, level, 1 / 60);
assert.ok(Math.abs(player.x - startX - 72) < 1e-6);
```

- [ ] **Step 2:** node --test tests/unit/movement.test.js 실행, FAIL 확인.
- [ ] **Step 3:** 수평 이동 후 수직 swept 충돌을 수행한다. 발판은 위에서 내려올 때만 착지하는 단방향 발판이다. 사다리 이용 중 중력·점프·좌우 입력은 적용하지 않고 상하단에서 grounded로 전환한다. 상하 동시 입력은 정지. 마지막 지지 발판 높이를 fallStartY에 보존하며 점프 정점은 낙하 높이 기준에 더하지 않는다.
- [ ] **Step 4:** npm run test:unit 실행, Task 2와 이동 테스트 모두 PASS. 실제 원작 수치 재현이라고 설명하지 않는다.
- [ ] **Step 5:** 위 3개 파일을 git add한 뒤 git commit -m "feat: implement platform movement and ladder transitions".

## Task 4: 적·먹거리·항아리·시간·목숨·스테이지 진행

**Files:** Create: wwwroot/js/game/rules.js, tests/unit/rules.test.js. Modify: wwwroot/js/game/model.js.
**Interfaces:** Consumes: Task 2/3 계약. Produces: stepEnemies(enemies:EnemyState[],dt:number):void; resolveInteractions(state:GameState,level:LevelData):GameEvent[]; tickSession(state:GameState,levels:LevelData[],dt:number):GameEvent[]. GameModel.step은 running에서 시간 감소→플레이어 이동→적 이동→상호작용을 수행하고, dying/stageClear에서는 tickSession만 실행한다. 모든 경로에서 GameEvent[]를 반환한다.

- [ ] **Step 1:** rules.test.js에 다음 테스트를 작성한다. assertion 예시는 아래와 같으며 각 테스트의 배치는 fixtures.js의 createFlatLevel을 사용한다.
  - food_and_bonus_score_once: 마지막 음식이 아닌 음식/항아리와 2틱 겹쳐도 각각 100/500점만 증가.
  - enemy_patrol_reflects_at_bounds: 적 좌하단 x가 minX/maxX 안에 유지되고 끝에서 direction 반전.
  - simultaneous_hazards_cost_one_life: 적+가시+시간 초과 동시 발생 시 lives 3→2, death 이벤트 1개.
  - lethal_tick_precedes_last_food: 마지막 음식과 적 동시 접촉 시 dying이며 음식 점수·클리어 보너스 없음.
  - fall_64_survives_65_dies: 마지막 지지 발판 대비 착지 높이 차 64는 생존, 65는 사망; 화면 아래로 완전히 이탈해도 사망.
  - snake_pot_is_lethal_and_optional: snake 항아리는 사망; 항아리를 열지 않아도 필수 음식 수집 완료 시 클리어.
  - retry_restores_checkpoint: dying 1초 뒤 score=stageStartScore, secondsLeft=120, 수집 목록 비움, 적 초기 위치.
  - clear_three_then_victory_and_game_over: 남은 시간 12.9초에 클리어하면 보너스 120점 1회; 다음 레벨의 stageStartScore 갱신; 마지막 레벨 완료는 victory; 마지막 목숨 사망은 gameOver.

```javascript
// simultaneous_hazards_cost_one_life: 같은 틱의 결과
assert.equal(model.snapshot().lives, 2);
assert.equal(model.snapshot().phase, 'dying');
assert.equal(events.filter(e => e.type === 'death').length, 1);
```

- [ ] **Step 2:** node --test tests/unit/rules.test.js 실행, FAIL 확인.
- [ ] **Step 3:** 위 인터페이스와 제안 규칙을 구현한다. dying/stageClear에서는 접촉 판정을 반복하지 않는다. 적은 같은 높이에서 좌우 순찰하며 틈을 지나간다. snake 항아리는 즉시 사망 함정으로 구현하고 추적 AI는 추가하지 않는다. 재도전용 상태 초기화는 rules.js의 내부 공통 함수로 묶어 tickSession과 GameModel 초기화에서 같은 규칙을 사용한다; 공개 함수가 필요하면 resetAttempt(state:GameState,level:LevelData):void로 정의한다.
- [ ] **Step 4:** npm run test:unit 실행, 모든 게임 규칙 테스트 PASS.
- [ ] **Step 5:** 이 Task의 Files를 git add한 뒤 git commit -m "feat: add scoring hazards and stage lifecycle".

## Task 5: Babylon.js 직교 렌더링과 도트 리소스

**Files:** Create: wwwroot/js/game/renderer.js, sprites.js, tests/unit/renderer.test.js, tests/e2e/rendering.spec.js, wwwroot/assets/README.md. Modify: wwwroot/js/game/main.js, wwwroot/css/game.css.
**Interfaces:** Produces: createRenderer({canvas:HTMLCanvasElement,levels:LevelData[],engine?:Engine}):Renderer; createSpriteAtlas():{width:number,height:number,pixels:Uint8Array,frames:Record<string,Rect>} in sprites.js. Engine은 Babylon 타입이며 Node 테스트에서는 NullEngine을 주입한다. renderer는 입력·시뮬레이션·프레임 루프를 소유하지 않는다.

- [ ] **Step 1:** renderer.test.js에 render_reuses_meshes(동일 상태 100회 render 전후 mesh 수 동일), dispose_is_idempotent(dispose 2회에도 예외 없음)를 작성한다. rendering.spec.js에 resize_keeps_board_visible(960×720→480×800에서 논리 화면 비율 유지), webgl_failure_shows_message(WebGL 초기화 차단 시 한국어 오류 안내·시작 불가·처리되지 않은 pageerror 없음)를 작성한다.

```javascript
// render_reuses_meshes: 초기 렌더 후 meshCount를 저장한 상태
for (let i = 0; i < 100; i++) renderer.render(state);
assert.equal(engine.scenes[0].meshes.length, meshCount);
renderer.dispose();
assert.doesNotThrow(() => renderer.dispose());
```

- [ ] **Step 2:** node --test tests/unit/renderer.test.js 및 npm run test:e2e -- tests/e2e/rendering.spec.js 실행, FAIL 확인.
- [ ] **Step 3:** 직교 카메라로 논리 화면 전체를 표시하고 카메라 조작은 연결하지 않는다. GameState를 읽기만 한다. 너구리 정지/걷기/점프/사다리/사망, 음식·적·항아리는 직접 작성한 픽셀 배열을 nearest sampling RGBA atlas로 만든다. 초기화 때 텍스처를 만들고 매 프레임 재생성하지 않는다. 검은 여백으로 화면 비율을 유지하고 devicePixelRatio는 최대 2로 제한한다.
- [ ] **Step 4:** main.js에서 Task 2의 levels와 GameModel.snapshot으로 정지 상태를 렌더링해 브라우저 검증을 가능하게 한다. WebGL 실패 시 #game-error(role=alert)에 "그래픽을 시작할 수 없습니다. WebGL을 지원하는 브라우저에서 다시 시도해 주세요."를 표시한다. assets/README.md에 자체 리소스와 외부 리소스의 출처 기록 방식을 적는다. 게임 루프는 아직 추가하지 않는다.
- [ ] **Step 5:** Step 2 명령을 실행해 PASS 확인. 실제 브라우저에서 캐릭터·발판·사다리·적의 구분과 창 크기 변경 후 잘림 여부도 확인한다. DOM 크기 검사만으로 시각 검증을 대신하지 않는다.
- [ ] **Step 6:** 이 Task의 Files를 git add한 뒤 git commit -m "feat: render pixel game with Babylon orthographic camera".

## Task 6: 입력·효과음·HUD·단일 게임 루프 연결

**Files:** Create: wwwroot/js/game/input.js, audio.js, hud.js, app.js, tests/unit/input.test.js, audio.test.js, app.test.js. Modify: wwwroot/js/game/main.js, Views/Game/Index.cshtml. Create: tests/e2e/gameplay.spec.js.
**Interfaces:** Consumes: GameModel, createClock, Renderer, Input, Audio, Scheduler. Produces: createInput({target:Window,canvas:HTMLCanvasElement,onPause:()=>void}):Input; createAudio(window:Window):Audio; renderHud(root:HTMLElement,state:GameState):void; createGameApp({model:GameModel,input:Input,renderer:Renderer,audio:Audio,scheduler:Scheduler,hud:(state:GameState)=>void}):{start():void,pause():void,resume():void,restart():void,dispose():void,snapshot():GameState}. app.pause는 입력과 clock을 초기화한다. main.js는 객체 생성·이벤트 연결·해제를 담당한다.

- [ ] **Step 1:** 아래 단위 테스트를 작성한다. 이벤트는 EventTarget, 브라우저 기능은 테스트 내부 가짜 객체로 대체한다. 가짜 Scheduler에는 pendingCount를 두어 예약된 RAF 수를 확인한다.
  - input_jump_is_consumed_once: keydown repeat로 추가 점프를 만들지 않고 read 1회만 jumpPressed=true; blur 후 모든 입력 false; 입력란에서는 preventDefault하지 않음.
  - paused_app_does_not_advance: 가짜 시계로 10초를 진행해도 paused의 secondsLeft 유지; resume 시 지난 10초를 따라잡지 않음. dying/stageClear 중에도 pause/resume하면 전환 타이머가 보존됨.
  - repeated_restart_has_one_loop: restart 20회 후 RAF 예약 1개, dispose 후 0개이며 추가 상태 갱신 없음.
  - muted_or_blocked_audio_does_not_break_game: unlock 거부를 처리해 무음 진행; muted이면 음원 생성 0회.
  - app_renders_terminal_states: 실제 GameModel과 짧은 timeLimitSeconds의 테스트 맵으로 gameOver까지 진행하면 hud에 phase=gameOver/lives=0 전달.

```javascript
// repeated_restart_has_one_loop: 테스트용 model/input/renderer/audio/scheduler로 app 생성
for (let i = 0; i < 20; i++) app.restart();
assert.equal(scheduler.pendingCount, 1);
app.dispose();
assert.equal(scheduler.pendingCount, 0);
```

- [ ] **Step 2:** node --test tests/unit/input.test.js tests/unit/audio.test.js tests/unit/app.test.js 실행, FAIL 확인.
- [ ] **Step 3:** 인터페이스를 구현한다. 기본 Scheduler는 requestAnimationFrame/cancelAnimationFrame/performance.now이다. app 생성 시 RAF 하나를 예약하고 이후 한 루프만 유지한다. dispose는 input/renderer/audio를 한 번씩 정리하고 clock과 RAF를 중지한다. 각 고정 스텝에서 Input.read()→GameModel.step 순서로 호출하고 반환 이벤트를 Audio에 전달한다. 매 렌더 프레임에는 snapshot을 한 번 얻어 renderer와 hud에 전달한다. start는 ready에서만 시작하고, restart는 model을 ready로 초기화한다. paused 이외의 resume는 무시한다.
- [ ] **Step 4:** main.js에 Enter/시작 버튼, P/일시정지 버튼, 재시작, 음소거, blur/visibilitychange, resize, pagehide 등록과 해제를 연결한다. createInput의 onPause는 P의 일시정지/재개 토글을 호출하며 main.js에서 같은 P 입력을 중복 처리하지 않는다. blur/hidden은 app.pause를 호출한다. 오디오는 사용자 시작 동작에서 처음 unlock하고 거부되면 무음으로 계속한다. Web Audio 합성 효과음을 사용하고 BGM은 추가하지 않는다. HUD는 textContent로 갱신한다. 렌더링 오류 시 루프를 종료하고 안내한다.
- [ ] **Step 5:** gameplay.spec.js에 starts_pauses_and_restarts를 작성한다. 페이지 로드 전에 Playwright clock을 설치하고, 시작 후 running, P 후 paused, blur 후 키 잔류 없음, restart 후 ready/점수0/목숨3/첫 스테이지를 확인한다. 캔버스가 배경색 한 가지로만 채워지지 않았는지도 실제 픽셀 결과로 검사한다.
- [ ] **Step 6:** npm run test:unit 및 npm run test:e2e -- tests/e2e/gameplay.spec.js 실행, PASS 확인.
- [ ] **Step 7:** 이 Task의 Files를 git add한 뒤 git commit -m "feat: connect controls audio and game loop".

## Task 7: 3개 스테이지와 통합 플레이

**Files:** Create: wwwroot/js/game/levels/level-02.js, level-03.js, tests/fixtures/solutions.js, README.md. Modify: wwwroot/js/game/levels/level-01.js, levels/index.js, tests/unit/levels.test.js, model.test.js, wwwroot/js/game/main.js, tests/e2e/gameplay.spec.js.
**Interfaces:** levels/index.js는 기존 validateLevel과 levels:LevelData[]를 유지한다. solutions.js는 solutions:Record<string,Array<{input:InputFrame,ticks:number}>>를 export한다. 해법은 실제 GameModel.step만 사용하고 좌표·점수·수집 목록을 직접 변경하지 않는다.

- [ ] **Step 1:** levels.test.js에 all_levels_valid_and_solvable을 작성한다. 각 해법을 해당 레벨 하나로 생성한 모델에서 실행해 victory가 되는지 확인한다. model.test.js에는 all_three_levels_complete_then_restart를 추가해 전체 레벨을 순서대로 클리어한 뒤 restart 결과를 검증한다. 전체 해법에서는 각 stageClear 후 빈 입력으로 1초 전환을 진행한 다음 다음 해법을 적용한다.

```javascript
assert.equal(levels.length, 3);
assert.equal(new Set(levels.map(level => level.id)).size, 3);
for (const level of levels) assert.deepEqual(validateLevel(level), []);
// 전체 해법 실행 후
assert.equal(model.snapshot().phase, 'victory');
model.restart();
assert.equal(model.snapshot().phase, 'ready');
assert.equal(model.snapshot().score, 0);
assert.equal(model.snapshot().lives, 3);
```

- [ ] **Step 2:** node --test tests/unit/levels.test.js tests/unit/model.test.js 실행. 아직 첫 맵 하나뿐이므로 FAIL 확인.
- [ ] **Step 3:** 세 LevelData를 작성한다. 공통 288×224, 발판 상면의 기준 높이16/64/112/160px, 120초. 제1은 음식8·적1(24px/s), 제2는 음식10·적2(30px/s)·폭16px 틈·bonus 항아리1, 제3은 음식12·적3(36px/s)·틈과 가시·bonus/snake 항아리 각1. 각 사다리 상하단을 발판 상면에 맞춘다. 구체 배치는 구현자가 이 조건 안에서 정하고 모든 필수 음식까지 실제로 이동하는 해법을 함께 기록한다.
- [ ] **Step 4:** 제1 시작은 x16/y16, 첫 음식은 x48/y16/w8/h8, 다음 음식은 x80보다 오른쪽에 둔다. 첫 600ms의 오른쪽 이동 경로에는 적·함정이 없고 사다리 이용이 필요 없게 한다. gameplay.spec.js에 real_keys_collect_first_food를 추가해 시작 후 ArrowRight를 누른 채 clock.runFor(600) 뒤 키를 놓으면 점수100인지 확인한다. 제품 페이지에 테스트용 상태 변조 API를 추가하지 않는다.
- [ ] **Step 5:** npm run test:unit 및 npm run test:e2e 실행, PASS 확인. README.md에 .NET/Node 전제, npm ci→npm run build→dotnet run --project RaccoonGame.csproj, 조작법, 재도전 규칙, 원작과 달리 정한 값을 기록한다.
- [ ] **Step 6:** 직접 플레이로 세 맵의 도달성, 사다리, 낙하 사망, 시간 초과, 항아리, 마지막 클리어, 재시작을 확인한다. 자동 검증과 수동 검증을 구분해 기록한다.
- [ ] **Step 7:** 이 Task의 Files를 git add한 뒤 git commit -m "feat: add three playable stages and completion flow".

## Task 8: IIS 게시 결과물과 배포 절차 검증

**Files:** Create: scripts/publish.ps1, docs/deployment/iis.md, tests/e2e/publish-smoke.spec.js. Modify: Program.cs, RaccoonGame.csproj, playwright.config.js, README.md.
**Interfaces:** scripts/publish.ps1은 매개변수 없이 artifacts/publish/에 Release 결과를 생성한다. Game:PathBase 설정의 기본값은 빈 문자열, 검증값은 /ponpoko이다. GamePageViewModel.AssetBaseUrl과 Razor의 Url.Content가 prefix를 반영한다. PUBLISH_SMOKE=1일 때 Playwright는 게시된 DLL을 별도 포트5081에서 실행한다.

- [ ] **Step 1:** publish-smoke.spec.js에 published_assets_work_under_pathbase를 작성한다. 경로 prefix 아래 페이지200, 시작 가능, dist/game.js 성공, 모든 로컬 요청에 prefix 유지, 외부 CDN 요청0, pageerror0을 검사한다. 최초 결과물이 없는 상태에서는 게시 앱 기동이 실패함을 기록하고, 게시 이후 실제 요청 검증까지 수행한다.

```javascript
const response = await page.goto('http://127.0.0.1:5081/ponpoko/');
expect(response.status()).toBe(200);
await expect(page.locator('#start')).toBeEnabled();
expect(failedRequests).toEqual([]);
expect(externalRequests).toEqual([]);
expect(pageErrors).toEqual([]);
```

- [ ] **Step 2:** publish.ps1을 구현한다. $ErrorActionPreference='Stop'와 각 외부 명령의 $LASTEXITCODE 확인을 사용한다. 순서는 npm ci, npm run build, dotnet restore RaccoonGame.csproj, dotnet publish RaccoonGame.csproj -c Release --no-restore --self-contained false -o artifacts/publish. 실패 시 즉시 중단한다. 재귀 삭제나 실제 서버 복사는 넣지 않는다.
- [ ] **Step 3:** Program.cs에서 명시한 PathBase를 정적 파일·라우팅보다 먼저 적용한다. 게시 결과에 dist/game.js와 SDK가 생성한 web.config가 있는지 스크립트에서 검사한다. 별도의 수동 web.config를 소스에 추가하지 않는다.
- [ ] **Step 4:** powershell -NoProfile -File scripts/publish.ps1을 실행한다. 이어 $env:PUBLISH_SMOKE='1'을 설정하고 npx playwright test tests/e2e/publish-smoke.spec.js --project=chromium을 실행해 PASS를 확인한다. 마지막에 기존 환경변수 값을 복원한다. 이 모드의 webServer는 dotnet artifacts/publish/RaccoonGame.dll --urls http://127.0.0.1:5081 --Game:PathBase=/ponpoko이며 Production/reuseExistingServer:false이다. 일반 E2E와 게시 검증은 testMatch/testIgnore로 분리한다.
- [ ] **Step 5:** iis.md에 서버 확인표(OS/CPU/IIS/.NET Hosting Bundle), 앱 풀 설정, 공개 폴더 권한, HTTPS 바인딩, 배포 전 백업, 복구 절차, 운영 설정과 로그 확인 방법을 작성한다. Hosting Bundle 및 in-process 설정은 아래 공식 문서로 검증한다. 서버나 IIS 전체 재시작을 자동 실행하지 않는다.
- [ ] **Step 6:** 실제 IIS 검증은 서버 정보와 사용자의 배포 대상 지정·작업 허가가 있을 때 진행한다. 루트 및 하위 애플리케이션에서 페이지·JS·이미지·오디오 로딩과 시작 동작을 확인한다. 미실시하면 "게시된 Kestrel 검증까지 완료, IIS 실서버 검증 미실시"로 구분해 보고한다.
- [ ] **Step 7:** 이 Task의 Files를 git add한 뒤 git commit -m "build: prepare and verify IIS publish package".

## 최종 검증과 인계

- [ ] npm run test:unit, dotnet build RaccoonGame.csproj -c Release, npm run test:e2e, Task 8 게시 검증을 최종 변경 상태에서 실행한다.
- [ ] 변경 파일, 테스트 결과, 수동 플레이 결과, IIS 실기 검증 여부, 원작 미검증 차이를 보고한다.
- [ ] git diff --check와 git status --short로 의도하지 않은 변경을 확인한다. 사용자의 미추적 AGENTS.md를 보존한다.
- [ ] detached HEAD의 저장·통합은 앱의 관리 방식에 따른다. 승인 없는 push나 운영 배포를 하지 않는다.

## 자기 검토 결과

- 요구사항 연결: MVC/빌드→Task 1, 시간 안정성→Task 2, 이동/점프/사다리→Task 3, 적/음식/항아리/낙하/시간/목숨/득점/진행→Task 4, Babylon/도트→Task 5, 입력/음향/재시작/해제→Task 6, 세 맵/도달성→Task 7, IIS→Task 8.
- 각 Task에 파일과 입출력 계약, 실패 확인, 구현, 성공 확인, 커밋 단계를 두었다.
- 모델 시간은 초, Scheduler 시각은 ms로 구분했다. 렌더링과 입력은 공통 계약을 참조한다.
- Review Focus 다섯 항목에 담당 테스트를 배정했다.
- 사용자 제안 범위와 설계 승인, 원작과의 엄밀한 일치, 실제 IIS 정보는 남은 확인 사항이다. 구현자의 선택으로 조용히 대체하지 않는다.
- 계획 작성 중 앱 생성·의존성 설치·제품 코드 작성·게임 테스트는 수행하지 않았다.

## 기술 판단의 참조 자료

2026-10-30 확인. 아래 자료는 기술 선택의 근거이며 게임 수치의 출처가 아니다.

- [.NET 공식 지원 정책](https://dotnet.microsoft.com/en-us/platform/support/policy): .NET 10 LTS 제안 근거.
- [ASP.NET Core의 IIS 게시](https://learn.microsoft.com/en-us/aspnet/core/tutorials/publish-to-iis?view=aspnetcore-10.0): Hosting Bundle, publish, web.config.
- [ASP.NET Core IIS 호스팅](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-10.0): 실제 서버 설정 확인.
- [Babylon.js npm 지원](https://doc.babylonjs.com/setup/frameworkPackages/npmSupport/): 로컬 npm 번들 구성.
- [Babylon.js 카메라](https://doc.babylonjs.com/features/featuresDeepDive/cameras/camera_introduction/): 카메라 설정 확인.
