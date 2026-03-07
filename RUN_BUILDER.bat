@echo off
setlocal

set "REPO_ROOT=%~dp0"
set "NODE_DIR=%REPO_ROOT%node-v24.13.0-win-x64"
set "NODE_EXE=%NODE_DIR%\node.exe"
set "VITE_CLI=%REPO_ROOT%node_modules\vite\bin\vite.js"

echo REPO: %REPO_ROOT%
echo.

if not exist "%NODE_EXE%" (
  echo ERROR: Portable Node not found at:
  echo   %NODE_EXE%
  exit /b 1
)

if not exist "%VITE_CLI%" (
  echo ERROR: Vite CLI missing at:
  echo   %VITE_CLI%
  echo.
  echo Install dependencies first. If npm is unavailable on PATH, use:
  echo   powershell -ExecutionPolicy Bypass -File "%REPO_ROOT%RUN_NPM.ps1" run build
  exit /b 1
)

echo Starting Course Factory dev server...
echo ---------------------------------------

pushd "%REPO_ROOT%"
"%NODE_EXE%" ".\node_modules\vite\bin\vite.js" --host
set "EXIT_CODE=%ERRORLEVEL%"
popd

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Dev server exited with code %EXIT_CODE%.
  exit /b %EXIT_CODE%
)

pause
