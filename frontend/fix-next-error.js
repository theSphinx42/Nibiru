// This script fixes the "to" argument type error in Next.js
const fs = require('fs');
const path = require('path');

// File path
const targetFile = path.join(__dirname, 'node_modules', 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js');

console.log(`Attempting to fix file: ${targetFile}`);

try {
  // Read the file
  if (!fs.existsSync(targetFile)) {
    console.error(`Error: File does not exist: ${targetFile}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(targetFile, 'utf8');
  console.log(`File read successfully, size: ${content.length} bytes`);
  
  // Create backup
  const backupFile = `${targetFile}.bak`;
  fs.writeFileSync(backupFile, content, 'utf8');
  console.log(`Created backup at: ${backupFile}`);
  
  // Find line 1423 (or close) to directly modify
  const lines = content.split('\n');
  console.log(`Total lines in file: ${lines.length}`);
  
  // Search for lines containing path.relative around line 1420-1425
  const startLine = Math.max(1400, 0);
  const endLine = Math.min(1450, lines.length);
  
  console.log(`Searching for path.relative in lines ${startLine}-${endLine}`);
  
  let found = false;
  let fixedContent = content;
  
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i];
    if (line.includes('path.relative(')) {
      console.log(`Found path.relative at line ${i+1}: ${line.trim()}`);
      found = true;
      
      // Perform a more targeted replacement on this specific line
      const newLine = line.replace(
        /path\.relative\((.*?),\s*(.*?)\)/g, 
        'path.relative($1, $2 || "")'
      );
      
      if (line !== newLine) {
        console.log(`Fixed line: ${newLine.trim()}`);
        // Replace the entire content with this fixed line
        fixedContent = fixedContent.replace(line, newLine);
      }
    }
  }
  
  if (!found) {
    console.log("Could not find path.relative call in expected lines. Trying full file search...");
    
    // Try a brute force approach across the entire file
    let allMatches = content.match(/path\.relative\(.*?,.*?\)/g) || [];
    console.log(`Found ${allMatches.length} potential path.relative calls across the file`);
    
    if (allMatches.length > 0) {
      fixedContent = content;
      allMatches.forEach(match => {
        // For each match, apply our type check
        const fixedMatch = match.replace(
          /path\.relative\((.*?),\s*(.*?)\)/g, 
          'path.relative($1, $2 || "")'
        );
        
        if (match !== fixedMatch) {
          console.log(`Original: ${match}`);
          console.log(`Fixed: ${fixedMatch}`);
          fixedContent = fixedContent.replace(match, fixedMatch);
          found = true;
        }
      });
    }
  }
  
  if (content === fixedContent) {
    console.log("No changes made to the file. Using more aggressive approach...");
    
    // Ultra-aggressive approach: just find and replace the raw function call text
    const simpleFixedContent = content.replace(
      /path\.relative\(/g,
      'path.relative(pathIn, to) { if (typeof to !== "string") to = ""; return require("path").relative(pathIn,'
    );
    
    if (content !== simpleFixedContent) {
      console.log("Applied ultra-aggressive fix by monkey-patching path.relative function");
      fixedContent = simpleFixedContent;
      found = true;
    }
  }
  
  if (found) {
    // Write fixed content back to file
    fs.writeFileSync(targetFile, fixedContent, 'utf8');
    console.log("File fixed successfully!");
  } else {
    console.log("Could not find any pattern to fix.");
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
} 