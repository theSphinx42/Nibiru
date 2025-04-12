#!/usr/bin/env node

/**
 * Direct patch for Next.js 14.0.4 Watchpack Error 
 * This fixes the specific error in your installation by directly editing the problematic file.
 */

const fs = require('fs');
const path = require('path');

// The exact file where the error occurs
const TARGET_FILE = path.resolve(__dirname, '..', 'node_modules', 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js');

// Direct patch function
function applyDirectPatch() {
  console.log('🔧 Applying direct patch to fix TyperError on "to" argument');
  console.log(`Target file: ${TARGET_FILE}`);

  if (!fs.existsSync(TARGET_FILE)) {
    console.error('❌ Target file not found! Make sure you are in the correct directory.');
    process.exit(1);
  }

  // Read the file content
  let content = fs.readFileSync(TARGET_FILE, 'utf8');
  
  // Make a backup of the original file
  const backupPath = `${TARGET_FILE}.bak`;
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`✅ Created backup at ${backupPath}`);
  }

  // Check if already patched
  if (content.includes('// PATCHED BY AI-HELPER')) {
    console.log('🔍 File is already patched. No changes needed.');
    return true;
  }

  // Count occurrences of path.relative to figure out how many instances to fix
  const relativeOccurrences = (content.match(/path\.relative\(/g) || []).length;
  console.log(`📊 Found ${relativeOccurrences} potential instances of path.relative() to patch`);

  // Apply the patch - Replace ALL instances of path.relative to be safe
  const patchedContent = content.replace(
    /path\.relative\(([^,]+),\s*([^)]+)\)/g,
    `path.relative($1, ($2) || '') /* PATCHED BY AI-HELPER */`
  );

  // Check if any changes were made
  if (patchedContent === content) {
    console.log('⚠️ No changes were made. Pattern might not match.');
    return false;
  }

  // Write the patched content back
  try {
    fs.writeFileSync(TARGET_FILE, patchedContent, 'utf8');
    console.log('✅ Successfully patched the file!');
    return true;
  } catch (error) {
    console.error(`❌ Error writing patched file: ${error.message}`);
    return false;
  }
}

// Run the patch
const success = applyDirectPatch();
if (success) {
  console.log('✨ Patch applied! You can now start Next.js without errors.');
  process.exit(0);
} else {
  console.error('❌ Failed to apply patch. The error may still occur.');
  process.exit(1);
} 