@echo off
echo ===============================================
echo       NEXT.JS ROUTE CONFLICT DETECTOR
echo ===============================================
echo.

REM Navigate to the project root directory
cd /d "%~dp0..\.."

REM Run the route conflict detector
node ai-helpers-nexus\scripts\detect-route-conflicts.js %*

pause 