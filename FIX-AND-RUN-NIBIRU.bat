@echo off
color 0A
title Nibiru Development Server Auto-Fixer and Launcher

REM ===================================================================
REM NIBIRU SERVER AUTO-FIXER AND LAUNCHER
REM This script:
REM 1. Navigates to the correct directory
REM 2. Kills existing Node processes
REM 3. Cleans caches
REM 4. Applies the improved path.relative fix
REM 5. Launches the server
REM ===================================================================

echo ===================================================================
echo              NIBIRU SERVER AUTO-FIXER AND LAUNCHER
echo ===================================================================
echo.

REM Set working directory to script location
cd /d "%~dp0"

REM Kill any existing Node processes
echo [1/5] Stopping any running Node processes...
taskkill /F /IM node.exe /T >NUL 2>&1
timeout /t 1 /nobreak >NUL

REM Navigate to frontend folder
echo [2/5] Navigating to frontend folder...
cd frontend
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Frontend directory not found!
  echo Make sure this script is in the Saphira-Q root directory.
  pause
  exit /b 1
)

REM Clean Next.js cache
echo [3/5] Cleaning Next.js cache...
if exist .next (
  rmdir /s /q .next >NUL 2>&1
)

REM Apply the new improved fix
echo [4/5] Applying the universal Next.js path.relative fix...
echo.
node ai-helpers\next-dev-fix.js
echo.

REM Launch the dev server
echo.
echo [5/5] Starting the development server...
echo.
echo NOTE: If you encounter errors with the dev server, try these alternatives:
echo.
echo Option 1: Use the AI helper to apply the fix and run automatically:
echo   node ai-helpers\dev-server.js
echo.
echo Option 2: Use production mode (more stable but slower refresh):
echo   npm run build ^&^& npm run start
echo.
echo ===================================================================
echo PRESS CTRL+C TO STOP THE SERVER
echo ===================================================================
echo.

call npm run dev

pause 