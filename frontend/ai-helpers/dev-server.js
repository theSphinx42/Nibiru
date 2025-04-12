#!/usr/bin/env node

/**
 * AI Helper - Next.js Development Server Wrapper
 * 
 * This script:
 * 1. Applies patches to fix known Next.js issues
 * 2. Starts the development server with optimized settings
 * 3. Handles common errors and provides clear feedback
 * 
 * Usage: node ai-helpers/dev-server.js [port]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.argv[2] || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const PATCH_SCRIPT = path.join(__dirname, 'next-dev-fix.js');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Print a styled message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Apply the watchpack error patch and start the server
 */
function applyPatchAndStartServer() {
  log('📦 Applying Next.js Watchpack Error patch...', colors.cyan);
  
  try {
    // Run the patch script with the --start flag to apply the patch and start the server
    execSync(`node "${PATCH_SCRIPT}" --start`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: PORT,
        NODE_OPTIONS: '--max-old-space-size=4096', // Increase memory limit to prevent crashes
        NEXT_TELEMETRY_DISABLED: '1', // Disable telemetry for faster startup
      }
    });
    return true;
  } catch (error) {
    log(`❌ Failed to apply patch or start server: ${error.message}`, colors.red);
    log('💡 Try running the server manually with: npm run dev -- --no-watch', colors.yellow);
    return false;
  }
}

/**
 * Create a gitignore file to prevent committing patched modules
 */
function setupGitignore() {
  const gitignorePath = path.join(ROOT_DIR, 'node_modules', '.gitignore');
  
  // Ensure node_modules aren't accidentally committed after patching
  try {
    fs.writeFileSync(gitignorePath, '*\n!.gitignore\n', 'utf8');
  } catch (error) {
    log(`⚠️ Could not update .gitignore: ${error.message}`, colors.yellow);
  }
}

/**
 * Main function
 */
function main() {
  log('\n📱 AI HELPER - NEXT.JS DEVELOPMENT SERVER', colors.bright + colors.magenta);
  log('===========================================\n', colors.dim);
  
  // Setup gitignore
  setupGitignore();
  
  // Apply patch and start server in one step
  applyPatchAndStartServer();
}

// Run the main function
main(); 