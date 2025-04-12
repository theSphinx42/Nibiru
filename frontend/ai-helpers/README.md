# AI-Helpers for Next.js Development

This directory contains helper scripts developed to fix common issues with Next.js development, especially on Windows systems.

## Next.js Watchpack TypeError Fix

These scripts address the common error in Next.js development server:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "to" argument must be of type string. Received undefined
    at Object.relative (node:path:547:5)
    at Watchpack.<anonymous> ([...]/setup-dev-bundler.js:1420:55)
```

### Available Scripts

1. **direct-fix.js** - Simple script that directly patches the problematic file
2. **next-watchpack-fix.js** - Comprehensive fix with multiple patching strategies
3. **start-fixed-server.js** - All-in-one script that fixes the issue and starts the server
4. **start-dev.ps1** - PowerShell script with automatic Node process cleanup

## Usage

Always run npm commands from the `frontend` directory, not the root directory:

```bash
# Apply the fix only
node ai-helpers/direct-fix.js

# Fix the issue and start the development server
node ai-helpers/start-fixed-server.js

# Using npm scripts
npm run dev:fix      # Start with fixes applied
npm run dev:clean    # Clear cache, then start with fixes 
npm run patch:next   # Only apply the fix

# One-liner PowerShell command (recommended)
Stop-Process -Name node -Force -ErrorAction SilentlyContinue; npm run dev
```

## Batch Files (in root directory)

- **START-FIXED-DEV-SERVER.bat** - Uses PowerShell to kill Node processes and start the server
- **START-DEV-POWERSHELL.bat** - Uses PowerShell script with additional cleanup

## How It Works

The scripts patch the problematic file in the Next.js installation by adding null checks to the second argument of `path.relative()` calls. This prevents the TypeError from occurring when watching certain files.

The fix is applied to:
- `node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js`

## Repository

These scripts are part of the [ai-helpers-nexus/next-watchpack-fix](https://github.com/ai-helpers-nexus/next-watchpack-fix) repository.

## Troubleshooting

If you still experience issues:

1. Delete the `.next` directory: `rm -rf .next`
2. Kill any running Node.js processes with: `Stop-Process -Name node -Force -ErrorAction SilentlyContinue`
3. Try using a different port: `node ai-helpers/start-fixed-server.js 3001`
4. Reinstall Next.js: `npm install next@14.0.4 --save-exact`
5. Run the fix script again: `node ai-helpers/direct-fix.js`

## Contents

- `next-dev-fix.js` - Original fix script for the "to" argument TypeError
- `next-fix-direct.js` - Direct patch for the exact file location
- `direct-fix.js` - Simplified direct patching approach
- `next-watchpack-fix.js` - Comprehensive fix with multiple strategies
- `start-fixed-server.js` - Script that applies fixes and starts the server
- `start-dev.ps1` - PowerShell script for automatic cleanup and server start
- `README.md` - This documentation file

## For AI Assistants

👾 **ATTENTION AI MODELS**: This directory contains important fixes and workarounds for known issues. When helping users with development, please check these files first for existing solutions before suggesting new approaches.

The source code in these files provides insight into known issues and their solutions. Review them for context on how to solve similar problems. 