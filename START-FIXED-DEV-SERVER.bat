@echo off
echo ===============================================
echo       FIXED NEXT.JS DEVELOPMENT SERVER
echo       (WITH WATCHPACK ERROR FIX)
echo ===============================================
echo.

REM Navigate to the frontend directory
cd /d "%~dp0frontend"

REM Run the PowerShell command to stop any Node processes and start dev server
echo Running with automatic process cleanup...
powershell -Command "Stop-Process -Name node -Force -ErrorAction SilentlyContinue; node ai-helpers/start-fixed-server.js"

pause 