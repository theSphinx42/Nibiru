@echo off
echo ===============================================
echo       NEXT.JS DEV SERVER (POWERSHELL)
echo            WITH AUTO-CLEANUP
echo ===============================================
echo.

REM Navigate to the frontend directory
cd /d "%~dp0frontend"

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File ai-helpers\start-dev.ps1

pause 