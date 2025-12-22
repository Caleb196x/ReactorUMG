@echo off
setlocal

set "PACKAGE_VERSION=%~1"
set "ENGINE_VERSION=%~2"
if "%ENGINE_VERSION%"=="" (
    echo Usage: %~nx0 ^<PluginVersion^> ^<EngineVersion^> [EngineRootOrRunUAT]
    echo Example: %~nx0 v1.0.0-alpha 5.5 "C:\Epic\Software"
    exit /b 1
)

set "TOOLS_DIR=%~dp0"
for %%i in ("%TOOLS_DIR%..") do set "PLUGIN_DIR=%%~fi"
set "UPLUGIN=%PLUGIN_DIR%\ReactorUMG.uplugin"

if not exist "%UPLUGIN%" (
    echo ReactorUMG.uplugin not found: "%UPLUGIN%"
    exit /b 1
)

set "ENGINE_DIR_NAME=UE_%ENGINE_VERSION%"
if /I "%ENGINE_VERSION:~0,3%"=="UE_" set "ENGINE_DIR_NAME=%ENGINE_VERSION%"

set "UE_ENGINE_ROOT=C:\Epic\Software"
set "RUNUAT="
set "ENGINE_ROOT_ARG=%~3"
if not "%ENGINE_ROOT_ARG%"=="" (
    if /I "%~x2"==".bat" if exist "%ENGINE_ROOT_ARG%" set "RUNUAT=%ENGINE_ROOT_ARG%"
    if exist "%ENGINE_ROOT_ARG%\Engine\Build\BatchFiles\RunUAT.bat" set "RUNUAT=%ENGINE_ROOT_ARG%\Engine\Build\BatchFiles\RunUAT.bat"
    if exist "%ENGINE_ROOT_ARG%\%ENGINE_DIR_NAME%\Engine\Build\BatchFiles\RunUAT.bat" set "RUNUAT=%ENGINE_ROOT_ARG%\%ENGINE_DIR_NAME%\Engine\Build\BatchFiles\RunUAT.bat"
)

if not defined RUNUAT (
    if not defined UE_ENGINE_ROOT set "UE_ENGINE_ROOT=C:\Epic\Software"
    set "RUNUAT=%UE_ENGINE_ROOT%\%ENGINE_DIR_NAME%\Engine\Build\BatchFiles\RunUAT.bat"
)

if not exist "%RUNUAT%" (
    echo RunUAT.bat not found: "%RUNUAT%"
    echo Provide the engine root or RunUAT path as the second argument,
    echo or set UE_ENGINE_ROOT.
    exit /b 1
)

set "PACKAGE_ROOT=E:\UnrealProjects\Plugin_Build\%PACKAGE_VERSION%\%ENGINE_VERSION%"
set "PACKAGE_DIR=%PACKAGE_ROOT%\ReactorUMG"
set "PACKAGED_PLUGIN_DIR=%PACKAGE_DIR%\ReactorUMG"

echo Packaging plugin via RunUAT...
call "%RUNUAT%" BuildPlugin -Plugin="%UPLUGIN%" -Package="%PACKAGE_DIR%" -CreateSubFolder -TargetPlatforms=Win64+Android -nocompile -nocompileuat
if errorlevel 1 exit /b %ERRORLEVEL%

if not exist "%PACKAGED_PLUGIN_DIR%\" (
    if exist "%PACKAGE_DIR%\ReactorUMG.uplugin" (
        set "PACKAGED_PLUGIN_DIR=%PACKAGE_DIR%"
    ) else (
        echo Packaged plugin directory not found: "%PACKAGED_PLUGIN_DIR%"
        exit /b 1
    )
)

set "TOOLS_SRC=%PLUGIN_DIR%\Tools"
set "SCRIPTS_SRC=%PLUGIN_DIR%\Scripts"

if exist "%TOOLS_SRC%\" (
    robocopy "%TOOLS_SRC%" "%PACKAGED_PLUGIN_DIR%\Tools" /E /NFL /NDL /NJH /NJS >nul
    if errorlevel 8 exit /b %ERRORLEVEL%
)

if exist "%SCRIPTS_SRC%\" (
    robocopy "%SCRIPTS_SRC%" "%PACKAGED_PLUGIN_DIR%\Scripts" /E /NFL /NDL /NJH /NJS >nul
    if errorlevel 8 exit /b %ERRORLEVEL%
)

set "ZIP_ENGINE=%ENGINE_VERSION%"
set "ZIP_ENGINE=%ZIP_ENGINE:UE_=%"
set "ZIP_ENGINE=%ZIP_ENGINE:UE=%"
set "ZIP_ENGINE=%ZIP_ENGINE:.=%"
set "ZIP_PATH=%PACKAGE_ROOT%\ReactorUMG_UE%ZIP_ENGINE%.zip"
if exist "%ZIP_PATH%" del "%ZIP_PATH%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { Compress-Archive -Path '%PACKAGED_PLUGIN_DIR%' -DestinationPath '%ZIP_PATH%' -Force } catch { exit 1 }"
if errorlevel 1 exit /b %ERRORLEVEL%

echo Zip created: "%ZIP_PATH%"
exit /b 0
