@echo off
echo Running Nibiru...
echo.

cd /d "%~dp0frontend"
npm run build
echo.
echo Starting server...
npm run start

pause 