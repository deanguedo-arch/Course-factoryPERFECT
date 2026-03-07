@echo off
setlocal

set "REPO_ROOT=%~dp0"
set "NODE_DIR=%REPO_ROOT%node-v24.13.0-win-x64"
set "NODE_EXE=%NODE_DIR%\node.exe"

echo.
echo ========================================
echo  BUILDING COURSE FACTORY
echo ========================================
echo.

if not exist "%NODE_EXE%" (
  echo ERROR: Portable Node not found at:
  echo   %NODE_EXE%
  exit /b 1
)

if not exist "%REPO_ROOT%node_modules\vite\bin\vite.js" (
  echo ERROR: vite CLI not found in node_modules.
  echo Run: powershell -ExecutionPolicy Bypass -File "%REPO_ROOT%RUN_NPM.ps1" run build
  exit /b 1
)

pushd "%REPO_ROOT%"
"%NODE_EXE%" ".\node_modules\vite\bin\vite.js" build
set "EXIT_CODE=%ERRORLEVEL%"
popd

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Build failed with exit code %EXIT_CODE%.
  exit /b %EXIT_CODE%
)

echo.
echo ========================================
echo  BUILD COMPLETE
echo ========================================
echo.
pause
