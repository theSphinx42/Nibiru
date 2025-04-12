#!/usr/bin/env node

/**
 * Direct fix for Next.js Watchpack TypeError
 * 
 * This script directly fixes the "to" argument error in path.relative() calls
 * for Next.js 14.0.4 and similar versions. This addresses the common error:
 * TypeError [ERR_INVALID_ARG_TYPE]: The "to" argument must be of type string. Received undefined
 * 
 * Repository: https://github.com/ai-helpers-nexus/next-watchpack-fix
 */

const fs = require('fs');
const path = require('path');

// The file that needs patching
const TARGET_FILE = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js');

// Start the patching process
console.log(`Fixing file: ${TARGET_FILE}`);

// Check if file exists
if (!fs.existsSync(TARGET_FILE)) {
  console.error(`Target file not found! Make sure you're in the correct directory.`);
  process.exit(1);
}

// Create backup if it doesn't exist
const BACKUP_FILE = `${TARGET_FILE}.bak`;
if (fs.existsSync(BACKUP_FILE)) {
  console.log('Backup already exists, using existing backup');
} else {
  try {
    fs.copyFileSync(TARGET_FILE, BACKUP_FILE);
    console.log(`Created backup at: ${BACKUP_FILE}`);
  } catch (error) {
    console.error(`Failed to create backup: ${error.message}`);
    process.exit(1);
  }
}

// Read the file
let content;
try {
  content = fs.readFileSync(TARGET_FILE, 'utf8');
} catch (error) {
  console.error(`Error reading file: ${error.message}`);
  process.exit(1);
}

// Apply the fix with multiple strategies
let patchedContent = content;

// Strategy 1: Simple replacement of path.relative
patchedContent = content.replace(
  /path\.relative\(([^,]+),\s*([^)]+)\)/g,
  'path.relative($1, ($2) || "")'
);

// Strategy 2: Next.js specific pattern with _path.default
if (patchedContent === content) {
  patchedContent = content.replace(
    /_path\.default\.relative\(([^,]+),\s*([^)]+)\)/g,
    '_path.default.relative($1, ($2) || "")'
  );
}

// Strategy 3: Line-by-line approach
if (patchedContent === content) {
  console.log('No changes were made. Trying different pattern matching...');
  
  const lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for any .relative pattern
    if (line.includes('.relative(') && !line.includes('|| "') && !line.includes('|| \'')) {
      // Try to patch this line
      const patched = line.replace(
        /(\.relative\s*\()([^,]*),\s*([^)]*)\)/g,
        '$1$2, ($3) || "")'
      );
      
      if (patched !== line) {
        lines[i] = patched;
        modified = true;
      }
    }
  }
  
  if (modified) {
    patchedContent = lines.join('\n');
  }
}

// Write the fixed content
if (patchedContent !== content) {
  try {
    fs.writeFileSync(TARGET_FILE, patchedContent, 'utf8');
    console.log('File has been fixed successfully!');
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
    process.exit(1);
  }
} else {
  console.error('Could not find pattern to fix automatically.');
  process.exit(1);
} 