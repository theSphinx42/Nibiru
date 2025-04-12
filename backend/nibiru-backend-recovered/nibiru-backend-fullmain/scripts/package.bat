@echo off
setlocal

REM Set variables
set TEMP_DIR=nibiru-temp
set ZIP_NAME=%USERPROFILE%\Desktop\nibiru.zip

REM Clean up any existing temporary directory or zip
if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"
if exist "%ZIP_NAME%" del "%ZIP_NAME%"

REM Create temporary directory
mkdir "%TEMP_DIR%"

REM Copy project files
echo Copying project files...
xcopy /E /I /Y app "%TEMP_DIR%\app"
xcopy /E /I /Y scripts "%TEMP_DIR%\scripts"
copy /Y README.md "%TEMP_DIR%"
copy /Y docker-compose.yml "%TEMP_DIR%"

REM Create zip file
echo Creating zip file...
powershell Compress-Archive -Path "%TEMP_DIR%\*" -DestinationPath "%ZIP_NAME%" -Force

REM Clean up
rd /s /q "%TEMP_DIR%"

echo Package created successfully!
echo You can find the zip file at: %ZIP_NAME%
echo.
echo To use the package:
echo 1. Extract the zip file
echo 2. Navigate to the extracted directory
echo 3. Run the appropriate development script:
echo    - On Windows: scripts\dev.bat
echo    - On Unix: ./scripts/dev.sh 