#!/usr/bin/env node

/**
 * Manual Next.js Watchpack Error Fix
 * 
 * This script applies a direct patch to the watchpack implementation
 * in Next.js to fix the "to" argument must be of type string error.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const NODE_MODULES = path.join(ROOT_DIR, 'node_modules');

// Main function
async function main() {
  console.log('🛠️ Manual Next.js Watchpack Error Fix');
  console.log('====================================');
  
  // Ask the user to paste the error stack trace
  const errorFile = await getErrorFilePath();
  
  if (!errorFile) {
    // Search for the file automatically
    console.log('🔍 Searching for the problematic file automatically...');
    const foundFiles = findPossibleFiles();
    
    if (foundFiles.length === 0) {
      console.error('❌ Could not find any suitable file to patch.');
      process.exit(1);
    }
    
    console.log(`🔎 Found ${foundFiles.length} possible file(s) to patch.`);
    
    // Try to patch all files
    let patchCount = 0;
    for (const file of foundFiles) {
      const success = await patchFile(file);
      if (success) patchCount++;
    }
    
    if (patchCount > 0) {
      console.log(`✅ Successfully patched ${patchCount} file(s).`);
      console.log('🚀 You can now run the development server.');
    } else {
      console.error('❌ Failed to patch any files.');
    }
  } else {
    // Patch the specified file
    const success = await patchFile(errorFile);
    
    if (success) {
      console.log('✅ Successfully patched the file.');
      console.log('🚀 You can now run the development server.');
    } else {
      console.error('❌ Failed to patch the file.');
    }
  }
}

// Function to find error file path based on user input
async function getErrorFilePath() {
  const exactPath = path.join(NODE_MODULES, 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js');
  
  if (fs.existsSync(exactPath)) {
    console.log(`🔍 Using known problematic file: ${exactPath}`);
    return exactPath;
  }
  
  return null;
}

// Function to find possible files to patch
function findPossibleFiles() {
  const possibleFiles = [];
  
  // Common locations for the problematic file
  const searchPaths = [
    ['next', 'dist', 'server', 'lib', 'router-utils'],
    ['next', 'dist', 'server', 'dev'],
    ['next', 'dist', 'compiled', 'watchpack']
  ];
  
  for (const parts of searchPaths) {
    const dirPath = path.join(NODE_MODULES, ...parts);
    
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.js')) {
            const filePath = path.join(dirPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check if file contains path.relative function calls
            if (content.includes('path.relative(')) {
              possibleFiles.push(filePath);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${dirPath}: ${error.message}`);
      }
    }
  }
  
  return possibleFiles;
}

// Function to patch a file
async function patchFile(filePath) {
  console.log(`🔧 Patching file: ${filePath}`);
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('// NIBIRU-PATCHED')) {
      console.log('✅ File is already patched.');
      return true;
    }
    
    // Create backup
    const backupPath = `${filePath}.bak`;
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`💾 Created backup at ${backupPath}`);
    
    // Apply the patch by adding null checks to all path.relative calls
    const patchedContent = content.replace(
      /path\.relative\(([^,]+),\s*([^)]+)\)/g,
      'path.relative($1, typeof $2 === "string" ? $2 : "") // NIBIRU-PATCHED'
    );
    
    // Check if any changes were made
    if (patchedContent === content) {
      console.log('⚠️ Could not find pattern to patch in this file.');
      return false;
    }
    
    // Write the patched content
    fs.writeFileSync(filePath, patchedContent, 'utf8');
    console.log(`✅ Patched ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error patching file: ${error.message}`);
    return false;
  }
}

// Run the main function
main().catch(error => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}); 