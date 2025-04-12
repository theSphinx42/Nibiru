# Fix Log - Version 1.0.0

## next-watchpack-fix

**Issue:** Next.js Watchpack TypeError with the "to" argument on Windows

**Fixed Date:** April 9, 2025

**Affected Versions:** Next.js 14.0.0 - 14.2.0

**Error:**
```
TypeError [ERR_INVALID_ARG_TYPE]: The "to" argument must be of type string. Received undefined
    at Object.relative (node:path:547:5)
    at Watchpack.<anonymous> (C:\path\to\node_modules\next\dist\server\lib\router-utils\setup-dev-bundler.js:1420:55)
```

**Fix Applied:**
- Added null check to path.relative() calls in setup-dev-bundler.js
- Pattern: `path.relative(from, to)` → `path.relative(from, to || "")`
- Created scripts to automatically apply the fix and start the server

**Scripts:**
- `scripts/next-watchpack-fix.js` - Comprehensive fix with multiple patching strategies
- `scripts/direct-fix.js` - Simple script that directly patches the problematic file
- `scripts/start-fixed-server.js` - All-in-one script that fixes the issue and starts the server
- `scripts/start-dev.ps1` - PowerShell script with automatic Node process cleanup

**PowerShell One-liner:**
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue; npm run dev
```

**Status:** Active

**Notes:**
- This issue is specific to Windows due to path handling differences
- The fix ensures the second argument to path.relative() is never undefined
- The issue appears in multiple versions of Next.js with similar pattern
- Verified working on Windows 10/11 with Node.js 18+ 