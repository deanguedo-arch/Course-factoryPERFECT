@echo off
cd /d "%~dp0"
set PATH=C:\Users\dean.guedo\Downloads\node-v24.13.0-win-x64;%PATH%

echo.
echo ========================================
echo 📦 INSTALLING GH-PAGES (if needed)
echo ========================================
call npm.cmd install --save-dev gh-pages

echo.
echo ========================================
echo 🚀 DEPLOYING TO GITHUB PAGES
echo ========================================
echo.

call npm.cmd run deploy

echo.
echo ========================================
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo Your site will be live in 1-2 minutes at:
echo https://deanguedo-arch.github.io/Course-factoryPERFECT/
echo ========================================
echo.
pause