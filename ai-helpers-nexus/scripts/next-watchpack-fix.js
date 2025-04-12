#!/usr/bin/env node

/**
 * NextJS Watchpack TypeError Fix
 * ==============================
 * 
 * This script fixes the common TypeError related to the "to" argument
 * in path.relative() calls within Next.js on Windows systems.
 * 
 * Error: TypeError [ERR_INVALID_ARG_TYPE]: The "to" argument must be of type string. Received undefined
 *
 * This is a known issue with Next.js and occurs when watching files with undefined paths.
 * This fix patches the problematic file directly to ensure all path.relative() calls
 * have proper null checks.
 * 
 * Usage:
 *   node next-watchpack-fix.js
 * 
 * Repository: https://github.com/ai-helpers-nexus/next-watchpack-fix
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
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
const TARGET_FILES = [
  path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js'),
  // Add fallback paths for different Next.js versions
  path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'server', 'dev', 'hot-reloader.js'),
  path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'compiled', 'watchpack', 'watchpack.js')
];

/**
 * Logs a colorful message to console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Create a backup of the file before modifying
 */
function createBackup(filePath) {
  const backupPath = `${filePath}.bak`;
  
  // Check if backup already exists
  if (fs.existsSync(backupPath)) {
    log('Backup already exists, using existing backup', colors.yellow);
    return backupPath;
  }
  
  try {
    fs.copyFileSync(filePath, backupPath);
    log(`Created backup at: ${backupPath}`, colors.green);
    return backupPath;
  } catch (error) {
    log(`Failed to create backup: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Attempt multiple patching strategies to fix the file
 */
function patchFile(filePath) {
  log(`Fixing file: ${filePath}`, colors.cyan);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, colors.red);
    return false;
  }
  
  // Create backup first
  const backupPath = createBackup(filePath);
  if (!backupPath) {
    return false;
  }
  
  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`Error reading file: ${error.message}`, colors.red);
    return false;
  }

  // Multiple patching strategies

  // Strategy 1: Standard path.relative replacement
  let patchedContent = content.replace(
    /path\.relative\(([^,]+),\s*([^)]+)\)/g,
    'path.relative($1, ($2) || "")'
  );

  // Strategy 2: Target specific Next.js 14+ pattern
  if (patchedContent === content) {
    patchedContent = content.replace(
      /_path\.default\.relative\(([^,]+),\s*([^)]+)\)/g,
      '_path.default.relative($1, ($2) || "")'
    );
  }

  // Strategy 3: More aggressive approach for harder to match patterns
  if (patchedContent === content) {
    const lines = content.split('\n');
    let modified = false;
    
    // Look for lines containing 'path.relative' or '_path.default.relative'
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('path.relative') || lines[i].includes('_path.default.relative')) {
        // Add null check if line doesn't already have it
        if (!lines[i].includes('|| ""') && !lines[i].includes('|| \'\'')) {
          lines[i] = lines[i].replace(
            /(_path\.default|path)\.relative\(([^,]+),\s*([^)]+)\)/g, 
            '$1.relative($2, $3 || "")'
          );
          modified = true;
        }
      }
    }
    
    if (modified) {
      patchedContent = lines.join('\n');
    }
  }

  // If no changes made, the pattern might not match
  if (patchedContent === content) {
    log('No changes were made. Trying different pattern matching...', colors.yellow);
    
    // Find all lines containing relative and modify them
    let lines = content.split('\n');
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for any path.relative or similar pattern
      if ((line.includes('.relative(') || line.includes('relative (')) && 
          !line.includes('|| ""') && !line.includes('|| \'\'')) {
        
        // Use a broader regex to catch more patterns
        lines[i] = line.replace(
          /(\.relative\s*\()([^,]*),\s*([^)]*)\)/g,
          (match, p1, p2, p3) => `${p1}${p2}, (${p3}) || "")`
        );
        
        if (lines[i] !== line) {
          modified = true;
        }
      }
    }
    
    if (modified) {
      patchedContent = lines.join('\n');
    } else {
      log('Could not find pattern to fix automatically.', colors.red);
      return false;
    }
  }

  // Write the patched content
  try {
    fs.writeFileSync(filePath, patchedContent, 'utf8');
    log('File has been fixed successfully!', colors.green);
    return true;
  } catch (error) {
    log(`Error writing file: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Kill any running Node.js processes to ensure files can be modified
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
    // Ignore errors here, as there might be no processes to kill
    return true;
  }
}

/**
 * Main function
 */
function main() {
  log(`\n${colors.bold}${colors.magenta}NEXTJS WATCHPACK ERROR FIX${colors.reset}`, colors.bold);
  log('===============================\n', colors.cyan);
  
  // Kill node processes first
  killNodeProcesses();
  
  // Try to find and fix the problematic file
  let fixed = false;
  for (const targetFile of TARGET_FILES) {
    if (fs.existsSync(targetFile)) {
      fixed = patchFile(targetFile) || fixed;
    }
  }
  
  if (fixed) {
    log('\n✅ Fix completed successfully! You can now start your Next.js development server.', colors.green);
    log('   Run: npm run dev\n', colors.cyan);
  } else {
    log('\n❌ No fixes were applied. Please check your Next.js installation.', colors.red);
    log('   You might need to reinstall Next.js or apply the fix manually.\n', colors.yellow);
  }
}

// Run the main function
main(); 