# Next.js Route Conflict Detector PowerShell Script
# ----------------------------------------------
# This script helps identify potential route conflicts in your Next.js application
# which can cause watchpack errors or other issues during development

# Configuration
$appDir = "$PSScriptRoot/../../frontend" # Adjust path to your Next.js app directory
$pagesDir = "$appDir/pages"
$appRouterDir = "$appDir/app"
$outputFile = "$appDir/route-conflicts.log"

Write-Host "🔍 Next.js Route Conflict Detector" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if the application uses Pages Router, App Router, or both
$usesAppRouter = Test-Path $appRouterDir
$usesPagesRouter = Test-Path $pagesDir

Write-Host "Scanning for route conflicts in:" -ForegroundColor Yellow
if ($usesPagesRouter) {
    Write-Host "- Pages Router ($pagesDir)" -ForegroundColor Yellow
}
if ($usesAppRouter) {
    Write-Host "- App Router ($appRouterDir)" -ForegroundColor Yellow
}

if (-not $usesPagesRouter -and -not $usesAppRouter) {
    Write-Host "❌ Could not find either 'pages' or 'app' directory. Make sure this script is running from the correct location." -ForegroundColor Red
    exit 1
}

# Initialize containers for routes
$routes = @()
$conflicts = @()

# Function to extract route from file path
function Get-RouteFromPath {
    param (
        [string]$FilePath,
        [string]$BaseDir,
        [string]$RouterType
    )
    
    $relativePath = $FilePath.Substring($BaseDir.Length).TrimStart('\', '/')
    
    # Handle different extensions
    $route = $relativePath -replace "\.(js|jsx|ts|tsx)$", ""
    
    # Handle index files
    $route = $route -replace "\\?index$", "/"
    
    # Handle dynamic routes
    $route = $route -replace "\[([^\]]+)\]", "{`$1}"
    
    # Clean up double slashes and ensure leading slash
    $route = $route -replace "\\", "/"
    if (-not $route.StartsWith("/")) {
        $route = "/$route"
    }
    if ($route -eq "") {
        $route = "/"
    }
    
    return @{
        Route = $route
        FilePath = $FilePath
        RouterType = $RouterType
    }
}

# Function to check if two routes could conflict
function Test-RouteConflict {
    param (
        [string]$Route1,
        [string]$Route2
    )
    
    # Exact match is a conflict
    if ($Route1 -eq $Route2) {
        return $true
    }
    
    # Check if dynamic segments could conflict
    $pattern1 = $Route1 -replace "{[^/]+}", "DYNAMIC"
    $pattern2 = $Route2 -replace "{[^/]+}", "DYNAMIC"
    
    return $pattern1 -eq $pattern2
}

# Collect routes from Pages Router
if ($usesPagesRouter) {
    Get-ChildItem -Path $pagesDir -Recurse -File | Where-Object { $_.Extension -match '\.(js|jsx|ts|tsx)$' } | ForEach-Object {
        # Skip API routes, special files, and non-route files
        if ($_.FullName -match '\\api\\' -or 
            $_.BaseName -match '^_' -or 
            $_.BaseName -match '\.module$' -or
            $_.BaseName -match '\.test$') {
            return
        }
        
        $routeInfo = Get-RouteFromPath -FilePath $_.FullName -BaseDir $pagesDir -RouterType "Pages"
        $routes += $routeInfo
        Write-Verbose "Found Pages route: $($routeInfo.Route) -> $($_.FullName)"
    }
}

# Collect routes from App Router
if ($usesAppRouter) {
    Get-ChildItem -Path $appRouterDir -Recurse -Directory | Where-Object { Test-Path (Join-Path $_.FullName "page.js") -or 
                                                                         Test-Path (Join-Path $_.FullName "page.jsx") -or 
                                                                         Test-Path (Join-Path $_.FullName "page.ts") -or 
                                                                         Test-Path (Join-Path $_.FullName "page.tsx") } | ForEach-Object {
        $pageFile = Get-ChildItem -Path $_.FullName -File | Where-Object { $_.BaseName -eq "page" } | Select-Object -First 1
        
        # Get the route from the directory path (App Router)
        $routeInfo = Get-RouteFromPath -FilePath $_.FullName -BaseDir $appRouterDir -RouterType "App"
        $routes += $routeInfo
        Write-Verbose "Found App route: $($routeInfo.Route) -> $($pageFile.FullName)"
    }
}

# Check for conflicts
$routeCount = $routes.Count
Write-Host "Found $routeCount potential routes" -ForegroundColor Green

for ($i = 0; $i -lt $routeCount; $i++) {
    for ($j = $i + 1; $j -lt $routeCount; $j++) {
        if (Test-RouteConflict -Route1 $routes[$i].Route -Route2 $routes[$j].Route) {
            $conflict = @{
                Route1 = $routes[$i].Route
                File1 = $routes[$i].FilePath
                RouterType1 = $routes[$i].RouterType
                Route2 = $routes[$j].Route
                File2 = $routes[$j].FilePath
                RouterType2 = $routes[$j].RouterType
            }
            $conflicts += $conflict
        }
    }
}

# Output results
$conflictCount = $conflicts.Count
if ($conflictCount -gt 0) {
    Write-Host "⚠️ Found $conflictCount potential route conflicts:" -ForegroundColor Red
    
    # Create output file
    "# Next.js Route Conflicts ($(Get-Date))" | Out-File $outputFile
    "# This may cause 'TypeError [ERR_INVALID_ARG_TYPE]: The 'to' argument' errors with watchpack" | Out-File $outputFile -Append
    "# --------------------------------------------------------------------------------------" | Out-File $outputFile -Append
    
    $conflicts | ForEach-Object {
        $conflictInfo = "CONFLICT: '$($_.Route1)' <-> '$($_.Route2)'"
        Write-Host $conflictInfo -ForegroundColor Red
        $conflictInfo | Out-File $outputFile -Append
        
        $file1Info = "  - [$($_.RouterType1)] $($_.File1)"
        $file2Info = "  - [$($_.RouterType2)] $($_.File2)"
        
        Write-Host $file1Info -ForegroundColor Yellow
        Write-Host $file2Info -ForegroundColor Yellow
        
        $file1Info | Out-File $outputFile -Append
        $file2Info | Out-File $outputFile -Append
        "" | Out-File $outputFile -Append
    }
    
    Write-Host "ℹ️ Full details written to: $outputFile" -ForegroundColor Cyan
    Write-Host "⚠️ These conflicts may be causing your watchpack errors. Resolve them to fix development server issues." -ForegroundColor Red
} else {
    Write-Host "✅ No route conflicts detected!" -ForegroundColor Green
}

# Check for potential issues with Next.js watchpack error
$setupDevBundlerPath = "$appDir/node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js"
if (Test-Path $setupDevBundlerPath) {
    Write-Host "`nChecking for known watchpack error in setup-dev-bundler.js..." -ForegroundColor Yellow
    $content = Get-Content $setupDevBundlerPath -Raw
    
    # Look for line 1420 or 1423 depending on Next.js version
    if ($content -match "relativePath = relative\(watchpack\.context, stats\.path\)") {
        Write-Host "🔍 Found potential Watchpack error code pattern." -ForegroundColor Yellow
        Write-Host "📝 If you're experiencing 'TypeError [ERR_INVALID_ARG_TYPE]: The \"to\" argument must be of type string'," -ForegroundColor Yellow
        Write-Host "   run the next-dev-fix.js script or apply the patch manually to fix the issue." -ForegroundColor Yellow
    }
}

Write-Host "`n🏁 Route conflict analysis complete!" -ForegroundColor Green 