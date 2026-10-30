$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
function Invoke-Checked {
    param([string]$FileName, [string[]]$CommandArgs)
    & $FileName @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        throw "$FileName failed with exit code $LASTEXITCODE"
    }
}
Push-Location $projectRoot
try {
    Invoke-Checked 'npm.cmd' @('ci')
    Invoke-Checked 'npm.cmd' @('run', 'build')
    Invoke-Checked 'dotnet' @('restore', 'RaccoonGame.csproj')
    Invoke-Checked 'dotnet' @('publish', 'RaccoonGame.csproj', '-c', 'Release', '--no-restore', '--self-contained', 'false', '-o', 'artifacts/publish')
    $publishRoot = Join-Path $projectRoot 'artifacts/publish'
    foreach ($relativePath in @('RaccoonGame.dll', 'web.config', 'wwwroot/dist/game.js')) {
        if (-not (Test-Path -LiteralPath (Join-Path $publishRoot $relativePath) -PathType Leaf)) {
            throw "Missing publish output: $relativePath"
        }
    }
    Write-Host "Publish package ready: $publishRoot"
}
finally { Pop-Location }
