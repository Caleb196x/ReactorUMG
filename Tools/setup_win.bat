@echo off
setlocal EnableDelayedExpansion

rem Resolve key project paths based on this script's location.
set "TOOLS_DIR=%~dp0"
for %%i in ("%TOOLS_DIR%..") do set "PLUGIN_DIR=%%~fi"
for %%i in ("%PLUGIN_DIR%\..") do set "PROJECT_ROOT=%%~fi"

set "THIRD_PARTY_DIR=%PLUGIN_DIR%\Source\Puerts\ThirdParty"
set "TS_TEMPLATE_DIR=%PLUGIN_DIR%\Scripts\Project"
set "TYPE_SCRIPT_DIR=%PROJECT_ROOT%\TypeScript"
set "VENDOR_DIR=%TOOLS_DIR%vendor"

if not exist "%VENDOR_DIR%" (
    mkdir "%VENDOR_DIR%" >nul 2>&1
)

set "NODE_VERSION=18.20.4"
if defined REACTORUMG_NODE_VERSION set "NODE_VERSION=%REACTORUMG_NODE_VERSION%"
set "NODE_DIST_BASENAME=node-v%NODE_VERSION%-win-x64"
if defined REACTORUMG_NODE_DIST set "NODE_DIST_BASENAME=%REACTORUMG_NODE_DIST%"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_DIST_BASENAME%.zip"
if defined REACTORUMG_NODE_URL set "NODE_URL=%REACTORUMG_NODE_URL%"
set "NODE_ARCHIVE=%TEMP%\%NODE_DIST_BASENAME%.zip"
if defined REACTORUMG_NODE_ARCHIVE set "NODE_ARCHIVE=%REACTORUMG_NODE_ARCHIVE%"
set "NODE_INSTALL_DIR=%VENDOR_DIR%\%NODE_DIST_BASENAME%"
if defined REACTORUMG_NODE_INSTALL_DIR set "NODE_INSTALL_DIR=%REACTORUMG_NODE_INSTALL_DIR%"

rem Allow callers to override the desired V8 package via environment variables.
if not defined REACTORUMG_V8_VERSION (
    set "REACTORUMG_V8_VERSION=v8_bin_9.4.146.24"
)
if not defined REACTORUMG_V8_URL (
    set "REACTORUMG_V8_URL=https://github.com/puerts/backend-v8/releases/download/V8_9.4.146.24__241009/%REACTORUMG_V8_VERSION%.tgz"
)

set "V8_ARCHIVE=%TEMP%\%REACTORUMG_V8_VERSION%.zip"
set "V8_TARGET_DIR=%THIRD_PARTY_DIR%\%REACTORUMG_V8_VERSION%"

echo.
echo === ReactorUMG Windows Setup ===
echo.
echo Checking local Node.js/npm/yarn environment...
call :EnsureNode || exit /b 1
call :EnsureNpm || exit /b 1
call :EnsureYarn || exit /b 1

if not exist "%THIRD_PARTY_DIR%" (
    echo Creating third-party directory at "%THIRD_PARTY_DIR%"
    mkdir "%THIRD_PARTY_DIR%" || (
        echo Failed to create third-party directory.
        exit /b 1
    )
)

if not exist "%V8_TARGET_DIR%" (
    echo Downloading V8 engine package from:
    echo   %REACTORUMG_V8_URL%
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "try { Invoke-WebRequest -Uri '%REACTORUMG_V8_URL%' -OutFile '%V8_ARCHIVE%' -UseBasicParsing } catch { exit 1 }"
    if errorlevel 1 (
        echo Failed to download V8 archive. You can override the URL via REACTORUMG_V8_URL.
        exit /b 1
    )

    echo Extracting V8 archive to "%THIRD_PARTY_DIR%"
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "try { Expand-Archive -Path '%V8_ARCHIVE%' -DestinationPath '%THIRD_PARTY_DIR%' -Force } catch { exit 1 }"
    if errorlevel 1 (
        echo Failed to extract V8 archive.
        exit /b 1
    )
    del "%V8_ARCHIVE%" >nul 2>&1
else (
    echo V8 directory already present at "%V8_TARGET_DIR%"; skipping download.
)

if not exist "%TYPE_SCRIPT_DIR%" (
    if not exist "%TS_TEMPLATE_DIR%" (
        echo TypeScript template missing at "%TS_TEMPLATE_DIR%".
        exit /b 1
    )
    echo Creating TypeScript workspace in "%TYPE_SCRIPT_DIR%"
    robocopy "%TS_TEMPLATE_DIR%" "%TYPE_SCRIPT_DIR%" /E /NFL /NDL /NJH /NJS >nul
    set "ROBOEXIT=%ERRORLEVEL%"
    if %ROBOEXIT% GEQ 8 (
        echo Failed to copy TypeScript template (robocopy exit code %ROBOEXIT%).
        exit /b %ROBOEXIT%
    )
) else (
    echo TypeScript workspace already exists at "%TYPE_SCRIPT_DIR%".
)

pushd "%TYPE_SCRIPT_DIR%" >nul 2>&1 || (
    echo Failed to enter TypeScript directory.
    exit /b 1
)

echo.
echo Installing TypeScript dependencies (this may take a while)...
call yarn build
set "YARN_EXIT=%ERRORLEVEL%"
popd >nul

if %YARN_EXIT% NEQ 0 (
    echo Yarn build failed with exit code %YARN_EXIT%.
    exit /b %YARN_EXIT%
)

echo.
echo Setup completed successfully.
exit /b 0

:EnsureNode
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :EOF

if exist "%NODE_INSTALL_DIR%" (
    set "PATH=%NODE_INSTALL_DIR%;%NODE_INSTALL_DIR%\node_modules\npm\bin;%PATH%"
    set "NODE_HOME=%NODE_INSTALL_DIR%"
    where node >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Using bundled Node.js located at "%NODE_INSTALL_DIR%".
        goto :EOF
    )
)

call :InstallNode
if errorlevel 1 exit /b 1
set "PATH=%NODE_INSTALL_DIR%;%NODE_INSTALL_DIR%\node_modules\npm\bin;%PATH%"
set "NODE_HOME=%NODE_INSTALL_DIR%"
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Failed to make Node.js available after installation.
    exit /b 1
)
echo Installed local Node.js into "%NODE_INSTALL_DIR%".
goto :EOF

:InstallNode
echo Node.js not found. Downloading Node.js %NODE_VERSION%...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_ARCHIVE%' -UseBasicParsing } catch { exit 1 }"
if errorlevel 1 (
    echo Failed to download Node.js archive. You can override NODE_URL/NODE_VERSION via environment variables.
    exit /b 1
)

echo Extracting Node.js to "%VENDOR_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { Expand-Archive -Path '%NODE_ARCHIVE%' -DestinationPath '%VENDOR_DIR%' -Force } catch { exit 1 }"
if errorlevel 1 (
    echo Failed to extract Node.js archive.
    exit /b 1
)
if exist "%NODE_ARCHIVE%" del "%NODE_ARCHIVE%" >nul 2>&1
goto :EOF

:EnsureNpm
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :EOF

set "PATH=%NODE_INSTALL_DIR%;%NODE_INSTALL_DIR%\node_modules\npm\bin;%PATH%"
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :EOF

echo npm not found even after installing Node.js.
exit /b 1

:EnsureYarn
where yarn >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :EOF

if not defined YARN_PREFIX set "YARN_PREFIX=%VENDOR_DIR%\yarn"
set "YARN_BIN_DIR=%YARN_PREFIX%\node_modules\.bin"

if not exist "%YARN_PREFIX%" (
    mkdir "%YARN_PREFIX%" >nul 2>&1
)

echo Yarn not found. Installing Yarn via npm into "%YARN_PREFIX%".
call npm install yarn --prefix "%YARN_PREFIX%" --no-fund --no-audit || exit /b 1

set "PATH=%YARN_BIN_DIR%;%PATH%"
where yarn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Yarn still not available after installation.
    exit /b 1
)
echo Installed Yarn locally; PATH updated for this session.
goto :EOF
