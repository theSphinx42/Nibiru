#!/usr/bin/env node

/**
 * Next.js Development Server Wrapper
 * 
 * This wrapper:
 * 1. Monitors for common errors in Next.js
 * 2. Applies appropriate fixes from the ai-helpers-nexus repository
 * 3. Provides better error messages and recovery options
 * 
 * Usage:
 *   node ai-helpers-nexus/loaders/dev-server-wrapper.js
 * 
 * Repository: https://github.com/ai-helpers-nexus/next-watchpack-fix
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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
const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');
const WATCHPACK_FIX = path.join(SCRIPTS_DIR, 'next-watchpack-fix.js');
const CONFIG_FILE = path.join(__dirname, '..', '.ai-helpers.json');

// Known error patterns and their fixes
const ERROR_PATTERNS = [
  {
    pattern: /TypeError.*"to".*must be of type string.*Received undefined/,
    fix: WATCHPACK_FIX,
    message: 'Detected Next.js Watchpack TypeError with the "to" argument'
  }
];

/**
 * Log a colored message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Kill any running Node.js processes
 */
function killNodeProcesses() {
  log('Stopping any running Node.js processes...', colors.yellow);
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM node.exe /T 2>NUL', { stdio: 'ignore' });
    } else {
      execSync('pkill -f node || true', { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return true;
  }
}

/**
 * Launch the Next.js development server
 */
function startDevServer() {
  log(`\n${colors.bold}${colors.magenta}AI-HELPERS NEXT.JS DEVELOPMENT SERVER${colors.reset}`, colors.bold);
  log('===========================================\n', colors.magenta);
  
  // Kill any running Node processes first
  killNodeProcesses();
  
  // Run the npm script
  const nextDev = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });
  
  let stdoutBuffer = '';
  let stderrBuffer = '';
  let errorDetected = false;
  let fixApplied = false;
  
  // Listen for stdout data
  nextDev.stdout.on('data', (data) => {
    const chunk = data.toString();
    stdoutBuffer += chunk;
    process.stdout.write(chunk);
  });
  
  // Listen for stderr data
  nextDev.stderr.on('data', (data) => {
    const chunk = data.toString();
    stderrBuffer += chunk;
    process.stderr.write(chunk);
    
    // Check for known errors
    for (const errorPattern of ERROR_PATTERNS) {
      if (errorPattern.pattern.test(chunk) && !errorDetected) {
        errorDetected = true;
        log(`\n${colors.yellow}${errorPattern.message}${colors.reset}`);
        log(`Applying fix with ${path.basename(errorPattern.fix)}\n`, colors.cyan);
        
        // Kill the current process
        nextDev.kill('SIGINT');
        
        // Apply the fix and restart
        setTimeout(() => {
          try {
            execSync(`node "${errorPattern.fix}"`, { stdio: 'inherit' });
            fixApplied = true;
            // Restart the server
            startDevServer();
          } catch (error) {
            log(`Failed to apply fix: ${error.message}`, colors.red);
            process.exit(1);
          }
        }, 500);
        
        break;
      }
    }
  });
  
  // Handle process exit
  nextDev.on('close', (code) => {
    if (code !== 0 && !errorDetected) {
      log(`\nNext.js exited with code ${code}`, colors.red);
      
      // Analyze error and suggest fixes
      analyzeErrorAndSuggestFixes(stdoutBuffer + stderrBuffer);
      
      process.exit(code);
    }
  });
  
  // Handle interruptions
  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
    process.exit(0);
  });
}

/**
 * Analyze error output and suggest fixes
 */
function analyzeErrorAndSuggestFixes(errorOutput) {
  log('\nAnalyzing error...', colors.yellow);
  
  // Check for common error patterns
  for (const errorPattern of ERROR_PATTERNS) {
    if (errorPattern.pattern.test(errorOutput)) {
      log(`Error matches known pattern: ${errorPattern.message}`, colors.cyan);
      log(`Suggested fix: node "${errorPattern.fix}"`, colors.green);
      return;
    }
  }
  
  // No known error pattern detected
  log('No known fix for this error. Please check the error message above.', colors.yellow);
}

/**
 * Main function
 */
function main() {
  // Start the development server
  startDevServer();
}

// Run the main function
main(); 