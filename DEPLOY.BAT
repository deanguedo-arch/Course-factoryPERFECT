@echo off
setlocal
cd /d "%~dp0"

REM Prefer repo-local portable Node. Falls back to whatever is on PATH.
set "NODE_DIR=%~dp0node-v24.13.0-win-x64"
if exist "%NODE_DIR%\node.exe" (
  set "PATH=%NODE_DIR%;%PATH%"
)

echo.
echo ========================================
echo VERIFYING DEPLOY TOOLING
echo ========================================
if not exist "node_modules\" (
  call npm.cmd install
  if errorlevel 1 goto :fail_install
)

if not exist "node_modules\gh-pages\" (
  call npm.cmd install
  if errorlevel 1 goto :fail_install
)

echo.
echo ========================================
echo DEPLOYING COMMITTED MAIN HEAD TO GITHUB PAGES
echo ========================================
echo.
call node scripts\deploy_gh_pages.mjs
if errorlevel 1 goto :fail_deploy

echo.
echo ========================================
echo DEPLOYMENT COMPLETE
echo Your site will be live in 1-2 minutes at:
echo https://deanguedo-arch.github.io/Course-factoryPERFECT/
echo ========================================
echo.
pause
exit /b 0

:fail_install
echo.
echo ========================================
echo DEPLOY FAILED (npm install)
echo ========================================
echo.
pause
exit /b 1

:fail_deploy
echo.
echo ========================================
echo DEPLOY FAILED
echo ========================================
echo.
pause
exit /b 1
