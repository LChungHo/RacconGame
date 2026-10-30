# IIS 배포 안내

이 저장소는 IIS 배포용 파일을 준비합니다. 실제 서버에 연결하거나 IIS 설정을 변경하는 자동화는 포함하지 않습니다.

## 서버 확인표

실제 값을 확인한 뒤 배포를 진행합니다. 아직 대상 서버 정보는 제공되지 않았습니다.

| 항목 | 확인 사항 |
|---|---|
| 운영 체제 | 지원되는 Windows Server 버전과 패치 상태 |
| CPU/앱 풀 | x64 또는 x86과 실행 환경 일치 |
| IIS | 설치 상태, 바인딩, 독립 애플리케이션 풀 |
| 호스팅 | .NET 10 Hosting Bundle, ASP.NET Core Module V2 설치 |
| 런타임 | framework-dependent 게시에 맞는 Microsoft.NETCore.App / Microsoft.AspNetCore.App 10.0의 지원 패치 |
| 위치 | 사이트 루트 또는 IIS 하위 애플리케이션 경로 |
| 인증서 | 실제 도메인의 HTTPS 인증서와 갱신 방식 |
| 권한 | 배포 주체의 쓰기 권한, 앱 풀 주체의 읽기/실행 권한 |
| 복구 | 기존 버전·설정의 백업 위치와 전환 절차 |

개발 장비에서 SDK 10.0.403 / ASP.NET Core 10.0.14로 검증했습니다. 서버의 설치 여부를 추정하지 않습니다. Hosting Bundle 설치나 서비스 재시작은 서버 관리자가 영향을 검토한 뒤 수행합니다.

## 로컬 게시

저장소 루트에서 실행합니다.

```powershell
powershell -NoProfile -File scripts/publish.ps1
```

npm ci → 클라이언트 빌드 → dotnet restore → Release publish 순으로 실행합니다. 하나라도 실패하면 중단합니다.
결과는 artifacts/publish/입니다. 폴더의 **내용 전체**를 배포 대상으로 사용합니다.

- RaccoonGame.dll 및 런타임 구성 파일
- SDK가 생성한 web.config
- wwwroot/dist/game.js와 정적 CSS
- 운영 서버는 Node.js와 npm, 외부 CDN 연결이 필요하지 않습니다.

순위 기록은 아래의 영구 데이터 경로에 별도 보관합니다. 또한 이전 배포의 설정과 로그를 덮어쓰지 않도록 먼저 백업합니다. 기존 게시 폴더의 잔여 파일이 남는 문제를 피하려면 검증된 새 버전 폴더를 준비하고 사이트 물리 경로를 전환합니다. 배포 스크립트는 파일 삭제·서버 복사·사이트 전환을 수행하지 않습니다.

## IIS 구성

1. 대상 서버에 IIS와 .NET 10 Hosting Bundle 및 ASP.NET Core Module을 확인합니다.
2. 별도 앱 풀을 만들고 .NET CLR 버전은 **No Managed Code**로 둡니다. 게시된 web.config의 in-process 설정과 실행 비트 수를 확인합니다.
3. 사이트의 물리 경로를 게시 폴더로 설정합니다. 하위 경로이면 단순 가상 디렉터리가 아닌 IIS 애플리케이션으로 등록하고 별도 앱 풀을 사용합니다.
4. 앱 풀 계정에는 게시 폴더 읽기/실행 권한만 부여합니다. 순위 DB 전용 폴더와 필요한 로그 폴더에는 앱 풀 계정의 수정 권한을 추가합니다. DB 폴더에는 SQLite 저널 파일을 만들 수 있어야 합니다.
5. 운영 환경은 Production으로 설정하고 HTTPS 바인딩과 인증서를 구성합니다. 비밀값은 서버 환경변수 등 외부 설정으로 관리합니다.
6. web.config를 삭제하거나 배포 스크립트에서 임의로 덮어쓰지 않습니다.

IIS가 하위 애플리케이션의 PathBase를 제공하면 기본 설정을 사용합니다. 직접 Kestrel을 경로 prefix로 실행할 때는 Game:PathBase를 지정합니다. URL은 Razor의 Url.Content를 사용하므로 prefix가 CSS와 번들에도 유지됩니다.

## 게시 결과의 로컬 검증

```powershell
$previousMode = $env:PUBLISH_SMOKE
try {
    $env:PUBLISH_SMOKE = '1'
    npx playwright test tests/e2e/publish-smoke.spec.js --project=chromium
} finally {
    $env:PUBLISH_SMOKE = $previousMode
}
```

이 검증은 게시된 DLL을 Production 환경의 Kestrel로 실행해 /ponpoko/ 아래에서 페이지·번들·시작 동작을 확인합니다. IIS 모듈, 앱 풀, 실제 인증서까지 확인하는 테스트는 아닙니다.

## 실제 서버 검증과 복구

배포 대상과 작업 허가를 확인한 뒤 아래를 점검합니다.

- HTTPS 페이지 정상 응답, 캔버스 표시, 시작·이동·점프·사다리·음소거 동작.
- 개발자 도구에서 JS/CSS 요청 200, 콘텐츠 형식, 경로 prefix, 콘솔 오류 여부.
- 외부 CDN 요청 없이 시작되는지 확인.
- IIS 하위 애플리케이션에서도 리소스 경로가 사이트 루트로 빠지지 않는지 확인.
- 실패 시 Windows 이벤트 뷰어의 Application / IIS / ASP.NET Core Module 로그 확인.
- stdout 로그는 진단할 때만 제한적으로 활성화하고 원인 확인 후 끕니다. 공개 폴더에 민감 로그를 남기지 않습니다.
- 실패한 신규 버전 대신 백업한 이전 물리 경로로 되돌리고 이전 버전의 응답·설정을 재확인합니다.
- 서버 전체나 IIS 전체 재시작은 이 프로젝트의 스크립트에서 실행하지 않습니다.

현재 검증 범위는 로컬 개발 서버와 게시 결과의 Kestrel 실행까지입니다. **IIS 실서버 배포와 검증은 미실시**입니다.

## 공식 참고 자료

- [ASP.NET Core 앱을 IIS로 게시](https://learn.microsoft.com/en-us/aspnet/core/tutorials/publish-to-iis?view=aspnetcore-10.0)
- [Windows IIS 호스팅](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-10.0)
- [.NET 지원 정책](https://dotnet.microsoft.com/en-us/platform/support/policy)

## 공유 순위 DB

이름·최종 점수·순위는 Microsoft.Data.Sqlite 10.0.14로 서버에 저장합니다. 기본 경로는 앱 콘텐츠 루트의 App_Data/leaderboard.db입니다. 파일과 저널은 wwwroot 밖에 두며 Git에 포함하지 않습니다. 별도 DB 서버는 필요하지 않습니다.

운영에서는 버전별 배포 폴더 밖의 고정 경로를 권장합니다. 서버 환경변수 Leaderboard__DatabasePath(구성 키 Leaderboard:DatabasePath)를 예를 들어 D:\\GameData\\Ponpoko\\leaderboard.db로 설정합니다. 앱 풀 계정에는 **이 데이터 폴더의 수정 권한**을 부여합니다. 공개 wwwroot 전체에 쓰기 권한을 주지 않습니다. 해당 디스크의 DB를 모든 요청 프로세스가 같이 사용하며, 여러 서버를 각각 별도 DB로 운영하는 구성은 이 버전의 범위가 아닙니다.

DB는 첫 조회/저장 때 생성합니다. 경로/권한 오류가 나도 게임 페이지와 플레이는 열리며 순위 조회·저장은 503과 재시도 안내를 반환합니다. 배포 교체·앱 풀 재시작·백업 복구 시 같은 영구 경로를 유지하세요. 백업은 앱을 정지한 뒤 DB와 SQLite 저널 관련 파일을 함께 보존하거나 SQLite의 일관된 백업 기능을 사용합니다.

게임 종료 또는 20스테이지 완주 뒤 이름(1~12자)을 입력하면 상위 10명과 본인 점수·전체 순위를 표시합니다. 동점은 공동 순위(1,1,3)이고 같은 판의 재시도는 한 번만 기록합니다. 서버는 입력 검증과 CSRF 검증을 수행합니다. 점수는 브라우저가 계산해 전송하며, 서버에서 플레이 과정을 재검증하는 부정행위 방지 기능은 포함하지 않습니다.

검증 시에는 테스트 전용 DB 경로를 사용해 실제 미리보기 기록과 분리합니다. 실제 IIS 배포 후에는 다른 브라우저의 순위 공유, 앱 풀 재시작 후 기록 유지, 쓰기 권한과 하위 애플리케이션 경로를 확인해야 합니다.

참고: [Microsoft.Data.Sqlite 패키지](https://www.nuget.org/packages/Microsoft.Data.Sqlite/10.0.14), [SQLite 트랜잭션](https://learn.microsoft.com/en-us/dotnet/standard/data/sqlite/transactions).
