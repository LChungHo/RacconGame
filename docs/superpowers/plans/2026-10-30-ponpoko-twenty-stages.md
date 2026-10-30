# Ponpoko 20-stage Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for inline implementation. Steps use checkbox syntax for tracking.

**Goal:** 사용자가 지정한 20개 먹거리 스테이지, 누적 섭취 순서 점수, 고정 주머니와 느린 뱀, 너구리 도트, 이미지 기준 점수판과 시간 막대를 구현한다.
**Architecture:** 기존 MVC와 Babylon 렌더링을 유지한다. catalog.js에서 먹거리 순서·연속 점수를 정의하고 layouts.js에서 20개 고정 배치를 만든다. 게임 모델은 뱀 생성과 시간 1의 낙하 사망을 처리하며 HUD는 순수 상태를 표시한다.
**Tech Stack:** 기존 ASP.NET Core MVC/net10.0, JavaScript, Babylon.js 9.33.1, IIS.
**Spec:** 사용자의 2026-10-30 수정사항, 첨부 점수판 이미지, 후속 점수 설명. 이번 명세는 기존 3스테이지/고정 100점/뱀 즉사 제안을 대체한다.

## Global Constraints
- 먹거리 순서: 당근, 앵두, 버섯, 감, 옥수수, 파인애플, 수박, 가지, 멜론, 밤, 바나나, 딸기, 오렌지, 무, 사과, 포도, 땅콩, 복숭아, 완두콩, 맥주.
- 한 판의 수집 순서에 따라 10,20,30,50,100,200,300,500,1000,2000,3000점. 12번째 이후는 마지막 값 3000 유지. 주머니는 수집 순서에서 제외.
- 주머니는 스테이지당 4개, 보상 결과와 위치 고정. 3/9는 점수 1개, 4/12/13은 점수 3개, 그 외는 점수 2개.
- 뱀 주머니는 즉사 대신 느린 뱀을 생성. 같은 층의 적은 점프로 넘지 못하며 사다리로 회피한다.
- 적 속도는 단계적으로 상승. 맵 틈·장애물 간격을 다르게 구성한다.
- 시간이 1에 도달하면 자동 낙하 사망. 남은 시간 기반 클리어 보너스는 유지.
- 시각 시간은 줄어드는 막대, 1UP/TOP SCORE/단계번호/먹거리 아이콘은 첨부 이미지에 맞춘다.
- 사용자가 설명한 규칙은 재현하되 제공되지 않은 원작 맵 좌표와 주머니 원본 위치를 확인했다고 주장하지 않는다.

## Review Focus
- 수집 중복과 주머니가 먹거리 연속 점수를 잘못 올리지 않는지.
- 뱀은 재접촉 시 중복 생성되지 않고 다음 틱에도 살아 움직이며 사다리 회피가 가능한지.
- 시간 1에서 한 번만 사망하고 마지막 목숨에도 낙하가 표시되는지.
- 20개 맵 모두 실제 이동으로 클리어 가능하고 모든 먹거리 아이콘이 구분되는지.
- 새 HUD와 최고 점수가 재시작·저장소 차단·좁은 화면에서 깨지지 않는지.

## Task 1: 게임 규칙
Files: rules.js, model.js, config.js, contracts.js, tests/unit/rules.test.js.
Interfaces: FOOD_SCORE_VALUES / scoreForFood(index); EnemyState.kind 및 ageSeconds/graceSeconds; deathReason.
- [ ] 섭취 순서 점수, 주머니 제외, 뱀 지속/중복 방지, 점프로 적 회피 불가, 사다리 안전, 시간1 낙하 테스트를 먼저 작성해 실패 확인.
- [ ] 규칙 구현. 뱀 속도6px/s와 생성 직후0.4초 유예는 구현 선택. 기존 테스트를 새 명세에 맞게 수정.
- [ ] npm run test:unit으로 검증 후 커밋.

## Task 2: 20개 고정 맵과 도달성
Files: levels/catalog.js, layouts.js, index.js; tests/unit/levels.test.js, model.test.js; tests/fixtures/solutions.js.
Interfaces: STAGE_FOODS, buildLevels(), levels:LevelData[]; 각 맵 number/foodType/foodName.
- [ ] 20개 순서·고유 배치·4주머니 예외 개수·속도 상승 테스트 실패 확인.
- [ ] 양쪽 사다리와 중앙 순찰 구역으로 층 우회 전략이 가능한 맵을 만들고 상단 틈을 다양하게 배치.
- [ ] 실제 입력 시퀀스로 20개 맵과 전체 진행 검증. 마지막 20단계 클리어 시 victory 유지. 커밋.

## Task 3: 도트와 이미지 기준 HUD
Files: sprites.js, food-sprites.js, renderer.js, hud.js, score-store.js, main.js, Views/Game/Index.cshtml, game.css; sprites/score-store unit tests; browser tests.
Interfaces: 24px atlas에 20개 먹거리, raccoon animation, caterpillar/snake/bag; HUD는 전체 stageCount와 timeLimitSeconds 표시; 로컬 최고점 저장.
- [ ] 최고 점수 저장 실패와 20개 스프라이트 계약, 시간 막대/1UP/TOP SCORE/아이콘 브라우저 테스트 실패 확인.
- [ ] 둥근 귀·검은 눈 마스크·회색 몸통·줄무늬 큰 꼬리의 너구리로 교체. 먹거리·애벌레·뱀·물음표 주머니를 구분.
- [ ] 검은 점수판, 청록 점수, 파란 시간 막대, 20개 진행 아이콘 구현. 숫자 시간 제거, 접근성 진행률 제공.
- [ ] 기존 일시정지/BFCache/단일 RAF 회귀 및 대표 화면 캡처 확인. 커밋.

## Task 4: 배포 검증과 기록
Files: README.md, docs/implementation/2026-10-30-twenty-stages.md, updated tests/e2e.
- [ ] 전체 단위 테스트, 대표 브라우저 실제 키 조작, 20개 전체 모델 완주, Release 빌드.
- [ ] 새 번들 게시 및 /ponpoko/ 격리 smoke. 로컬 미리보기만 갱신, IIS 실서버 조작 없음.
- [ ] 한 번의 독립 전체 리뷰 후 중요 발견만 회귀 테스트로 수정.
- [ ] 실행 기록·확인하지 못한 원작 좌표·점수 상한 선택을 기록하고 현재 워크트리에 보존.

## 실행 방법
사용자가 이전에 선택한 직접 실행 방식을 유지한다. 이번 변경 요청은 구현을 명시적으로 요청했으므로 같은 범위의 승인을 다시 요청하지 않는다. 기존 기술·설치 의존성을 유지하고 제품 코드 변경 전에 관련 실패 테스트를 확인한다.