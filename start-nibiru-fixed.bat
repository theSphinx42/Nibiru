@echo off
echo ===============================================
echo       NIBIRU DEVELOPMENT SERVER LAUNCHER
echo             (WITH ERROR FIXES)
echo ===============================================
echo.

REM Stop any running Node.js processes
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe /T 2>NUL
timeout /t 1 /nobreak >NUL

REM Navigate to the correct directory
cd %~dp0frontend

REM Clear Next.js cache to prevent issues
echo Clearing Next.js cache...
if exist .next (
  rmdir /s /q .next 2>NUL
)

REM Apply patch and start the server
echo Starting patched server...
echo.
node ai-helpers\next-fix-direct.js
echo.
echo Starting development server...
npm run dev

pause 