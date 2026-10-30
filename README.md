# 너구리 · Ponpoko Arcade

ASP.NET Core MVC와 Babylon.js로 만든 1인용 브라우저 게임입니다. 1982년 폰포코에서 착안했으며, 맵·도트 그래픽·효과음과 게임 수치는 이 프로젝트에서 직접 구성했습니다. 원작 전체를 그대로 복원한 버전은 아닙니다.

## 실행

개발 환경: .NET SDK 10.0.403, Node.js 24.22.0 이상 25 미만.

```powershell
npm ci
npm run build
dotnet run --project RaccoonGame.csproj --no-launch-profile --urls http://localhost:5080
```

브라우저에서 http://localhost:5080 에 접속합니다. 게임은 로컬 번들로 실행하며 운영 서버에 Node.js나 외부 CDN이 필요하지 않습니다.

## 조작과 규칙

- 방향키 좌우: 이동. 상하: 사다리. Space: 점프.
- Enter 또는 시작 버튼: 시작. P: 일시정지/계속하기.
- 먹거리 100점, 보너스 항아리 500점. 필수 먹거리를 모두 모으면 다음 스테이지입니다.
- 목숨 3개, 각 스테이지 120초, 총 3개 스테이지입니다.
- 적·가시·뱀 항아리·화면 아래 추락·64px를 초과하는 낙하·시간 초과는 목숨을 잃습니다.
- 재도전하면 현재 스테이지의 배치와 시간이 초기화되고 해당 스테이지 시작 점수로 되돌아갑니다.
- 다른 창으로 이동하면 자동으로 멈춥니다. 돌아온 뒤 P 또는 계속하기를 눌러주세요.
- 음소거 상태에서도 플레이할 수 있습니다. 첫 시작 동작 전에는 소리가 재생되지 않습니다.

## 검증

```powershell
npm run test:unit
npx playwright install chromium
npm run test:e2e
dotnet build RaccoonGame.csproj -c Release
```

단위 테스트는 실제 입력 시퀀스로 세 맵의 클리어 가능성을 확인합니다. 브라우저 테스트는 MVC 페이지, 키 입력, 일시정지, 재시작, WebGL 실패를 검증합니다.

## 배포

IIS 게시와 검증 절차는 [IIS 안내](docs/deployment/iis.md)를 따릅니다. 서버 암호나 인증서는 저장소에 넣지 않습니다.

## 구현 경계

MVC는 페이지와 설정을 제공하고, JavaScript가 60Hz 게임 규칙을 계산하며 Babylon.js는 직교 화면을 그립니다. 계정·DB·온라인 순위표·멀티플레이·터치 조작은 포함하지 않습니다.
