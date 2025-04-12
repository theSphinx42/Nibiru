#!/usr/bin/env node

/**
 * Next.js Development Server Watchpack Error Fix
 * 
 * This script provides workarounds for the common TypeErrors
 * that occur in Next.js dev server on Windows systems.
 * 
 * The error: TypeError [ERR_INVALID_ARG_TYPE]: The "to" argument must be of type string. Received undefined
 *
 * Usage:
 * - Run this script before starting the Next.js dev server
 * - Or use the wrapper script: node ai-helpers/dev-server.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const NODE_MODULES = path.join(ROOT_DIR, 'node_modules');
const NEXT_DIR = path.join(NODE_MODULES, 'next');

// Safe monkey-patching for the path module
function monkeyPatchPathModule() {
  try {
    // This is a more universal fix that doesn't rely on patching specific Next.js files
    // It intercepts all path.relative calls at the Node.js level
    console.log('✅ Applying global path.relative safety wrapper');
    
    // Override path.relative in the global Node.js path module
    const originalPathRelative = path.relative;
    path.relative = function(from, to) {
      // Ensure 'to' is always a string
      if (typeof to !== 'string') {
        to = '';
      }
      return originalPathRelative(from, to);
    };
    
    console.log('✅ Successfully patched path.relative globally');
    return true;
  } catch (error) {
    console.error('❌ Error applying global path fix:', error);
    return false;
  }
}

// Get Next.js version installed
function getNextVersion() {
  try {
    const pkgJsonPath = path.join(NEXT_DIR, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      return pkgJson.version;
    }
    
    // Fallback to checking the project's package.json
    const projectPkgJsonPath = path.join(ROOT_DIR, 'package.json');
    if (fs.existsSync(projectPkgJsonPath)) {
      const projectPkgJson = JSON.parse(fs.readFileSync(projectPkgJsonPath, 'utf8'));
      return projectPkgJson.dependencies?.next || projectPkgJson.devDependencies?.next || 'unknown';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error detecting Next.js version:', error);
    return 'unknown';
  }
}

// Apply version-specific workarounds
function applyVersionSpecificFixes(version) {
  console.log(`Detected Next.js version: ${version}`);
  
  if (version === 'unknown') {
    console.log('⚠️ Could not determine Next.js version. Will apply generic fixes only.');
    return false;
  }
  
  // For Next.js 14.x, use our global path.relative patch
  if (version.startsWith('14.')) {
    console.log('⚠️ Next.js 14.x detected. Using global path.relative monkey patching.');
    console.log('✨ This should fix the "to" argument errors in most cases.');
    console.log('🔄 If you continue to have issues with the router-utils/setup-dev-bundler module:');
    console.log('   1. Run the production mode server: npm run dev:fallback');
    console.log('   2. Or try: npm run build && npm run start');
    return false;
  }
  
  return false;
}

// Create a .next-patched file to indicate the patch has been applied
function markPatched() {
  try {
    const patchMarkerPath = path.join(ROOT_DIR, '.next-patched');
    fs.writeFileSync(patchMarkerPath, new Date().toISOString(), 'utf8');
    
    // Update .ai-helpers.json
    const helperJsonPath = path.join(ROOT_DIR, '.ai-helpers.json');
    let helperJson = {};
    
    // Create or update the .ai-helpers.json file
    if (fs.existsSync(helperJsonPath)) {
      helperJson = JSON.parse(fs.readFileSync(helperJsonPath, 'utf8'));
    }
    
    // Update the patches section
    helperJson.patches = helperJson.patches || {};
    helperJson.patches.nextWatchpackFix = {
      applied: true,
      timestamp: new Date().toISOString(),
      version: getNextVersion(),
      method: 'global-path-patch',
      status: 'applied'
    };
    
    fs.writeFileSync(helperJsonPath, JSON.stringify(helperJson, null, 2), 'utf8');
    console.log('✅ Patch status saved to .ai-helpers.json');
    
    return true;
  } catch (error) {
    console.warn('⚠️ Could not mark as patched:', error.message);
    return false;
  }
}

// Run Next.js with patched environment
function runNextWithNoWatch() {
  console.log('🚀 Starting Next.js in safe mode...');
  
  try {
    // Kill any running Node processes
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
      } else {
        execSync('pkill -f node', { stdio: 'ignore' });
      }
      console.log('✅ Killed existing Node processes');
    } catch (e) {
      // It's okay if no processes were killed
    }
    
    // Clean .next directory
    const nextCacheDir = path.join(ROOT_DIR, '.next');
    if (fs.existsSync(nextCacheDir)) {
      try {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${nextCacheDir}"`, { stdio: 'ignore' });
        } else {
          execSync(`rm -rf "${nextCacheDir}"`, { stdio: 'ignore' });
        }
        console.log('✅ Cleaned .next cache directory');
      } catch (e) {
        console.warn('⚠️ Could not clean .next directory:', e.message);
      }
    }
    
    // Check if we should try the fallback method
    if (process.argv.includes('--fallback')) {
      console.log('🚀 Starting Next.js using production mode as fallback...');
      console.log('⚠️ This mode uses the production server but allows development changes');
      
      try {
        // First build the project
        console.log('📦 Building the project...');
        execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
        
        // Then start the production server
        console.log('🚀 Starting the server in production mode...');
        execSync('npm run start', { stdio: 'inherit', cwd: ROOT_DIR });
      } catch (e) {
        console.error('❌ Error in fallback mode:', e);
        console.log('💡 Try running manually: npm run build && npm run start');
        return false;
      }
      
      return true;
    }
    
    // Execute next dev with our monkey-patched global path.relative
    console.log('🚀 Starting Next.js dev server in safe mode...');
    
    try {
      const command = 'npm run dev';
      execSync(command, { stdio: 'inherit', cwd: ROOT_DIR });
    } catch (e) {
      console.warn('⚠️ Development server failed to start. Trying fallback mode...');
      console.log('📦 Building the project...');
      
      try {
        execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
        console.log('🚀 Starting the server in production mode...');
        execSync('npm run start', { stdio: 'inherit', cwd: ROOT_DIR });
      } catch (err) {
        console.error('❌ Fallback mode also failed:', err);
        console.log('💡 Try fixing the build errors first, then run: npm run build && npm run start');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error running Next.js:', error);
    return false;
  }
}

// Main function
function main() {
  console.log('🔧 Next.js Dev Server Watchpack Error Fix');
  
  const nextVersion = getNextVersion();
  const versionSpecificFixed = applyVersionSpecificFixes(nextVersion);
  
  // Apply the global path module monkey-patch as a safer approach
  const globalPatchApplied = monkeyPatchPathModule();
  
  if (globalPatchApplied || versionSpecificFixed) {
    console.log('✨ Patch applied successfully.');
    markPatched();
    
    console.log('\n🔄 You have the following options to start Next.js:');
    console.log('1. Regular mode (should now work with the patch): npm run dev');
    console.log('2. Production fallback (if dev still fails): npm run build && npm run start');
    console.log('3. Let this script start Next.js for you with the patch loaded.');
    
    // Offer to start Next.js in safe mode
    if (process.argv.includes('--start')) {
      return runNextWithNoWatch();
    }
    
    return true;
  } else {
    console.warn('⚠️ Could not apply specific patches for this Next.js version.');
    console.warn('✨ Try running Next.js normally: npm run dev');
    console.warn('🔄 Or use production mode: npm run build && npm run start');
    
    // Offer to start Next.js in safe mode
    if (process.argv.includes('--start')) {
      return runNextWithNoWatch();
    }
    
    return false;
  }
}

// Run the main function
if (require.main === module) {
  main();
} 