#!/usr/bin/env node

/**
 * Next.js Fixed Development Server Launcher
 * 
 * This script:
 * 1. Kills any running Node.js processes
 * 2. Clears Next.js cache
 * 3. Runs pre-dev checks like route conflict detection
 * 4. Applies the watchpack TypeError fix
 * 5. Launches the Next.js development server on port 3000
 * 
 * Repository: https://github.com/ai-helpers-nexus/next-watchpack-fix
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors for fancy output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Configuration
const PORT = process.argv[2] || 3000;
const DIRECT_FIX_SCRIPT = path.join(__dirname, 'direct-fix.js');
const ROUTE_CONFLICT_SCRIPT = path.join(__dirname, 'detect-route-conflicts.js');
const NEXT_CACHE_DIR = path.resolve(process.cwd(), '.next');
const CONFIG_FILE = path.join(__dirname, '..', '.ai-helpers.json');

/**
 * Prints a fancy message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Kill all running Node.js processes to free up ports
 */
function killNodeProcesses() {
  log('Stopping any running Node.js processes...', colors.yellow);
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM node.exe /T 2>NUL', { stdio: 'ignore' });
    } else {
      execSync('pkill -f node || true', { stdio: 'ignore' });
    }
    // Small delay to ensure processes are terminated
    execSync('sleep 1 2>NUL || ping -n 2 127.0.0.1 > NUL', { stdio: 'ignore' });
    return true;
  } catch (error) {
    // Ignore errors here, as there might be no processes to kill
    return true;
  }
}

/**
 * Clear Next.js cache to avoid any stale data
 */
function clearNextCache() {
  log('Clearing Next.js cache...', colors.yellow);
  if (fs.existsSync(NEXT_CACHE_DIR)) {
    try {
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${NEXT_CACHE_DIR}" 2>NUL`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${NEXT_CACHE_DIR}"`, { stdio: 'ignore' });
      }
      return true;
    } catch (error) {
      log(`Warning: Could not clear Next.js cache: ${error.message}`, colors.yellow);
      return false;
    }
  }
  return true;
}

/**
 * Run the route conflict detector
 */
function detectRouteConflicts() {
  log('Running route conflict detection...', colors.blue);
  try {
    execSync(`node "${ROUTE_CONFLICT_SCRIPT}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error in route conflict detection: ${error.message}`, colors.yellow);
    // Don't fail the process for route conflicts
    return true;
  }
}

/**
 * Apply the watchpack TypeError fix
 */
function applyWatchpackFix() {
  log('Applying Watchpack TypeError fix...', colors.cyan);
  try {
    execSync(`node "${DIRECT_FIX_SCRIPT}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error applying fix: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Get pre-dev checks from config file
 */
function getPreDevChecks() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config.preDev || [];
    }
  } catch (error) {
    log(`Error reading config file: ${error.message}`, colors.yellow);
  }
  return [];
}

/**
 * Run all pre-dev checks from config
 */
function runPreDevChecks() {
  const checks = getPreDevChecks();
  if (checks.length === 0) {
    return true;
  }
  
  log(`Running ${checks.length} pre-dev check${checks.length > 1 ? 's' : ''}...`, colors.blue);
  
  for (const check of checks) {
    const scriptPath = path.resolve(__dirname, '..', check.script);
    
    try {
      log(`Running check: ${check.description || check.id}`, colors.blue);
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      log(`Error in check ${check.id}: ${error.message}`, colors.yellow);
      if (check.stopOnError) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Start the Next.js development server
 */
function startDevServer() {
  log(`\n${colors.green}Starting Next.js development server on port ${PORT}...${colors.reset}`, colors.bold);
  
  // Set environment variables for enhanced performance
  const env = {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096',
    NEXT_TELEMETRY_DISABLED: '1'
  };
  
  const nextDev = spawn('npx', ['next', 'dev', '--port', PORT], {
    stdio: 'inherit',
    env,
    shell: true
  });
  
  nextDev.on('error', (error) => {
    log(`Failed to start Next.js: ${error.message}`, colors.red);
    process.exit(1);
  });
  
  // Handle Ctrl+C and other termination events
  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
    process.exit(0);
  });
  
  nextDev.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`Next.js exited with code ${code}`, colors.red);
      process.exit(code);
    }
  });
}

/**
 * Main function
 */
function main() {
  log(`\n${colors.bold}${colors.magenta}NEXT.JS FIXED DEVELOPMENT SERVER${colors.reset}`, colors.bold);
  log('===================================\n', colors.magenta);
  
  // Step 1: Kill any running Node.js processes
  killNodeProcesses();
  
  // Step 2: Clear Next.js cache
  clearNextCache();
  
  // Step 3: Run pre-dev checks from config
  runPreDevChecks();
  
  // Step 4: Apply the Watchpack TypeError fix
  const fixApplied = applyWatchpackFix();
  
  if (!fixApplied) {
    log('Warning: Fix may not have been applied correctly. Continuing anyway...', colors.yellow);
  }
  
  // Step 5: Start the development server
  startDevServer();
}

// Run the main function
main(); 