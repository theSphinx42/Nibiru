@echo off
echo === Nibiru Sandbox Boot ===
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
  echo [!!!] Docker not found or not running. Please start Docker Desktop and try again.
  exit /b 1
)

echo [OK] Docker is running.
echo Launching development sandbox...
echo -------------------------------

:: Set docker-compose file and env file (relative path to .env)
set COMPOSE_FILE=docker-compose.yml
set ENV_FILE=../.env

:: Start containers
docker compose --env-file %ENV_FILE% up --build

:: Done
