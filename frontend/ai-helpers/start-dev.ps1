# Next.js Development Server Launcher with Auto-Cleanup
# This script kills any running Node.js processes and starts the Next.js dev server

# Display header
Write-Host "`n===== NEXT.JS DEVELOPMENT SERVER WITH AUTO-CLEANUP =====" -ForegroundColor Magenta
Write-Host "Repository: https://github.com/ai-helpers-nexus/next-watchpack-fix`n" -ForegroundColor Gray

# Kill any running Node processes 
Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Apply the watchpack error fix
Write-Host "Applying Watchpack TypeError fix..." -ForegroundColor Cyan
node $PSScriptRoot/next-watchpack-fix.js

# Clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path -Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

# Start the development server
Write-Host "`nStarting Next.js development server..." -ForegroundColor Green
npm run dev

# Keep console window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nDevelopment server exited with code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 