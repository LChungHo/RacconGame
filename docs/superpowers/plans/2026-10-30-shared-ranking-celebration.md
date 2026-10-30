# 공유 순위와 클리어 축하 화면 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. 이 채팅에서 선택한 직접 구현 방식을 유지한다.

**Goal:** 게임 종료 시 이름·최종 점수·공유 순위를 보여주고 클리어 축하 연출과 오른쪽부터 쌓이는 과일 표시를 제공한다.
**Architecture:** ASP.NET Core API와 SQLite로 공유 점수를 저장한다. 클리어 요약은 시뮬레이션이 만들고 HUD와 Web Audio가 표현한다.
**Tech Stack:** 기존 .NET 10 MVC, Babylon.js, JavaScript + Microsoft.Data.Sqlite 10.0.14.
**Spec:** docs/superpowers/specs/2026-10-30-shared-ranking-celebration-design.md · 사용자의 최신 변경 요청과 서버 공유 저장 답변. 기존 20스테이지·점수·목숨 규칙을 보존한다.

## 결정과 대안
사용자는 브라우저 저장 대신 IIS 서버 공유를 선택했다. 구현 결정은 별도 DB 서버가 필요 없는 SQLite이다. JSON 파일보다 동시 저장과 중복 제출 처리가 명확하고, SQL Server보다 운영 구성이 작다. 동점은 공동 순위(1,1,3), 이름은 1~12자, 상위 10명과 본인 순위를 표시한다. 한 판의 재시도 제출은 동일 ID로 중복 기록하지 않는다. 클리어는 5초이며 획득 점수·시간 보너스·총점과 5마리의 춤을 표시한다. 음악은 직접 만든 복고풍 선율이며 원작 음원의 복제가 아니다.

## Global Constraints
- 기존 기술과 20스테이지를 유지한다. IIS 실서버 배포는 수행하지 않는다.
- DB는 wwwroot 밖에 두고 배포 교체 시 유지할 별도 경로를 설정할 수 있게 한다.
- 입력은 검증하고 SQL 매개변수·CSRF 토큰·textContent를 사용한다.
- 재시작·중복 클릭·저장 실패·화면 포커스 및 오디오 정리 경로를 보존한다.

## Review Focus
- 동시/반복 저장은 점수가 유실되거나 중복되지 않아야 한다.
- 저장 응답이 늦게 도착해도 새 게임에 이전 결과가 나타나지 않아야 한다.
- IIS 하위 경로와 재시작 후에도 같은 기록이 조회되어야 한다.
- DB 쓰기 실패 시 게임 페이지가 깨지지 않고 저장 재시도가 가능해야 한다.
- 클리어 일시정지 시 점수·타이머·춤 진행이 보존되어야 한다.

### Task 1: 서버 순위 저장과 결과 UI
Files: Program.cs, Services/LeaderboardService.cs, Controllers/LeaderboardController.cs, Views/Game/Index.cshtml, wwwroot/js/game/results.js, main.js, tests/e2e/leaderboard.spec.js.
Interfaces: GET api/leaderboard → {leaders}; POST {runId,name,score} → {entry,leaders}. entry={id,name,score,rank}.
- [x] API 검증·동점·중복과 실제 게임 오버 이름 제출 테스트를 먼저 작성하고 실패 확인.
- [x] SQLite 트랜잭션 저장, 안전한 API, 취소 가능한 결과 UI 구현.
- [x] 관련 브라우저 테스트 통과 확인, IIS 저장 권한 문서 추가.

### Task 2: 클리어 축하와 과일 방향
Files: rules.js, config.js, hud.js, audio.js, game.css, unit rules/music tests, gameplay.spec.js.
Interfaces: state.clearSummary={stageNumber,stageScore,timeBonus,totalScore}; stageClear=5초.
- [x] 점수 요약·5초 유지·음악 길이·너구리 춤·과일 위치 테스트 실패 확인.
- [x] 점수 요약, 5마리 춤과 긴 선율, row-reverse 구현.
- [x] 기존 20스테이지 경로 검증 대기를 5초에 맞추고 전체 검증.

### Task 3: 검증과 검토
- [x] npm test, dotnet build/publish, 게시 하위 경로와 DB 재시작 지속성 확인.
- [x] 독립 최종 코드 검토, 중요 사항 수정 후 필요한 전체 검증.
- [x] 로컬 미리보기 갱신 및 결과 보고.
