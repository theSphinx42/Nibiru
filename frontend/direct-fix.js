// This script directly fixes the TypeScript error on the exact line in the Next.js file
// Fixes the "to" argument must be of type string error in Next.js
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'node_modules', 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js');

try {
  console.log(`Fixing file: ${targetFile}`);
  const content = fs.readFileSync(targetFile, 'utf8');
  
  // Create backup
  const backupFile = `${targetFile}.bak`;
  if (!fs.existsSync(backupFile)) {
    fs.writeFileSync(backupFile, content, 'utf8');
    console.log(`Created backup at: ${backupFile}`);
  } else {
    console.log('Backup already exists, using existing backup');
  }
  
  // Fix the specific lines
  let fixedContent = content;
  
  // Fix line 1422 - appPath
  fixedContent = fixedContent.replace(
    /const appPath = _path\.default\.relative\(dir, appPageFilePaths\.get\(p\)\);/g,
    'const appPath = _path.default.relative(dir, appPageFilePaths.get(p) || "");'
  );
  
  // Fix line 1423 - pagesPath
  fixedContent = fixedContent.replace(
    /const pagesPath = _path\.default\.relative\(dir, pagesPageFilePaths\.get\(p\)\);/g,
    'const pagesPath = _path.default.relative(dir, pagesPageFilePaths.get(p) || "");'
  );
  
  // Also fix line 1810 (just in case)
  fixedContent = fixedContent.replace(
    /_path\.default\.relative\(opts\.dir, opts\.pagesDir \|\| opts\.appDir \|\|""\)\.startsWith\("src"\)/g,
    '_path.default.relative(opts.dir, (opts.pagesDir || opts.appDir || ""))?.startsWith("src")'
  );
  
  // Check if anything changed
  if (fixedContent === content) {
    console.log('No changes were made. Trying different pattern matching...');
    
    // Try with just line numbers and manual editing
    const lines = content.split('\n');
    
    // Fix line 1422
    if (lines[1421] && lines[1421].includes('appPath')) {
      lines[1421] = lines[1421].replace('appPageFilePaths.get(p)', 'appPageFilePaths.get(p) || ""');
      console.log('Fixed line 1422 (appPath)');
    }
    
    // Fix line 1423
    if (lines[1422] && lines[1422].includes('pagesPath')) {
      lines[1422] = lines[1422].replace('pagesPageFilePaths.get(p)', 'pagesPageFilePaths.get(p) || ""');
      console.log('Fixed line 1423 (pagesPath)');
    }
    
    // Reassemble the file
    fixedContent = lines.join('\n');
  }
  
  // Write the fixed content back
  fs.writeFileSync(targetFile, fixedContent, 'utf8');
  console.log('File has been fixed successfully!');
  console.log('Please restart your Next.js server to apply the changes.');
  
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
} 