@echo off
echo ==============================================
echo   CivicPulse AI — Frontend Startup
echo ==============================================

cd /d "%~dp0frontend"

set "NODE_DIR=%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

echo [1/2] Verifying npm packages...
call npm.cmd install

echo [2/2] Starting React dev server on http://localhost:5173
echo.
call npm.cmd run dev
