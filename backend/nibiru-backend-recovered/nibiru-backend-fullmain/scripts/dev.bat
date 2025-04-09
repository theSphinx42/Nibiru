@echo off
echo Checking required tools...

REM Check for Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check for Docker Compose
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create necessary directories
echo Creating necessary directories...
mkdir app\backend\media\avatars 2>nul
mkdir app\backend\media\backgrounds 2>nul

REM Build and start the services
echo Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak

REM Check if services are running
echo Checking service status...
docker-compose ps

REM Print access information
echo.
echo Application is now running:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Documentation: http://localhost:8000/docs
echo.
echo Database:
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo.
echo To stop the services, run: docker-compose down
echo To view logs, run: docker-compose logs -f 