@echo off
setlocal

set "PACKAGE_VERSION=%~1"
if "%PACKAGE_VERSION%"=="" (
    echo Usage: %~nx0 ^<PluginVersion^> [EngineRootOrRunUAT]
    echo Example: %~nx0 v1.0.0-alpha "C:\Epic\Software"
    exit /b 1
)

set "ENGINE_ROOT_ARG=%~2"
set "TOOLS_DIR=%~dp0"
set "RELEASE_SCRIPT=%TOOLS_DIR%ci_package_release.bat"

if not exist "%RELEASE_SCRIPT%" (
    echo ci_package_release.bat not found: "%RELEASE_SCRIPT%"
    exit /b 1
)

echo Packaging UE5.1~UE5.7 in parallel...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop';" ^
    "$release = '%RELEASE_SCRIPT%';" ^
    "$version = '%PACKAGE_VERSION%';" ^
    "$engineRoot = '%ENGINE_ROOT_ARG%';" ^
    "$engines = @('5.1','5.2','5.3','5.4','5.5','5.6','5.7');" ^
    "$jobs = foreach ($e in $engines) {" ^
    "  $args = @($version, $e);" ^
    "  if ($engineRoot) { $args += $engineRoot }" ^
    "  $argList = @('/c', $release) + $args;" ^
    "  [pscustomobject]@{ Engine = $e; Proc = Start-Process -FilePath 'cmd.exe' -ArgumentList $argList -NoNewWindow -PassThru }" ^
    "};" ^
    "$failed = @();" ^
    "foreach ($j in $jobs) { $j.Proc.WaitForExit(); if ($j.Proc.ExitCode -ne 0) { $failed += $j.Engine } }" ^
    "if ($failed.Count -gt 0) { Write-Host ('Packaging failed for: ' + ($failed -join ', ')); exit 1 }"

if errorlevel 1 exit /b %ERRORLEVEL%

echo All packages completed.
exit /b 0
