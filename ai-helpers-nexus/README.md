# ai-helpers-nexus

A centralized repository of helper scripts, fixes, and utilities for common development issues across projects.

## Overview

This repository serves as a centralized collection of scripts and utilities that solve common development issues, particularly focusing on framework-specific bugs, build problems, and development environment fixes.

## Structure

```
ai-helpers-nexus/
├── README.md
├── .ai-helpers.json         <-- central instruction + override schema
├── scripts/                 <-- standalone fix scripts
│   ├── next-watchpack-fix.js
│   ├── direct-fix.js
│   ├── start-fixed-server.js
│   ├── start-dev.ps1
│   └── detect-route-conflicts.js
├── loaders/                 <-- utility loaders and wrappers
│   └── dev-server-wrapper.js
├── docs/                    <-- documentation
│   └── ai-workflow-structure.md
├── templates/               <-- templates for new helpers
│   └── ai-helper-manifest.template.json
└── versions/                <-- version logs and change history
    └── fix-log-v1.md
```

## Available Helpers

### Next.js Watchpack TyperError Fix

Addresses the common error in Next.js development server on Windows:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "to" argument must be of type string. Received undefined
```

#### Scripts:

- `scripts/next-watchpack-fix.js` - Comprehensive fix with multiple patching strategies
- `scripts/direct-fix.js` - Simple script that directly patches the problematic file
- `scripts/start-fixed-server.js` - All-in-one script that fixes the issue and starts the server
- `scripts/start-dev.ps1` - PowerShell script with automatic Node process cleanup

#### Usage:

```bash
# Apply the fix only
node ai-helpers-nexus/scripts/direct-fix.js

# Fix the issue and start the development server
node ai-helpers-nexus/scripts/start-fixed-server.js

# One-liner PowerShell command
Stop-Process -Name node -Force -ErrorAction SilentlyContinue; npm run dev
```

### Next.js Route Conflict Detector

Scans the Next.js pages directory and detects duplicate route definitions that could cause unexpected behavior.

#### Scripts:

- `scripts/detect-route-conflicts.js` - Main script that detects conflicts
- `scripts/check-routes.bat` - Windows batch file wrapper
- `scripts/check-routes.ps1` - PowerShell script wrapper

#### Usage:

```bash
# Check for route conflicts in the default pages directory
node ai-helpers-nexus/scripts/detect-route-conflicts.js

# Specify a custom pages directory
node ai-helpers-nexus/scripts/detect-route-conflicts.js ./custom/pages/directory

# For Windows users (batch)
ai-helpers-nexus/scripts/check-routes.bat

# For Windows users (PowerShell)
ai-helpers-nexus/scripts/check-routes.ps1
```

#### Common Conflicts:

- `pages/route.tsx` and `pages/route/index.tsx` both resolve to `/route`
- `pages/dashboard/listings.tsx` and `pages/dashboard/listings/index.tsx` both resolve to `/dashboard/listings`

## AI Workflow Integration

This repository serves as the source of truth for AI-assisted development workflow. The structure and files here are referenced by AI models to maintain consistency across projects.

See `docs/ai-workflow-structure.md` for details on the AI workflow structure.

## Contributing

When adding new helpers or fixes:

1. Follow the existing directory structure
2. Update the `.ai-helpers.json` schema with your new helper information
3. Add appropriate documentation
4. Use the templates in the `templates/` directory for consistent formatting

## License

MIT 