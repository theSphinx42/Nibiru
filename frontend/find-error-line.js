// Find the exact line causing the TypeScript error
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'node_modules', 'next', 'dist', 'server', 'lib', 'router-utils', 'setup-dev-bundler.js');

try {
  const content = fs.readFileSync(targetFile, 'utf8');
  const lines = content.split('\n');
  console.log(`Total lines in file: ${lines.length}`);
  
  // Search for lines around 1423 (from the error message)
  const start = Math.max(1410, 0);
  const end = Math.min(1435, lines.length);
  
  console.log(`\nLines ${start}-${end}:\n`);
  for (let i = start; i < end; i++) {
    console.log(`${i}:`, lines[i]);
  }
  
  // Also look specifically for all relative path usages
  console.log('\nSearching for "relative" in the file:');
  let lineNumber = 0;
  lines.forEach((line, index) => {
    if (line.includes('relative')) {
      console.log(`${index}:`, line);
      lineNumber = index;
    }
  });
  
  // Extract a larger portion around the found line for context
  if (lineNumber) {
    const contextStart = Math.max(lineNumber - 5, 0);
    const contextEnd = Math.min(lineNumber + 5, lines.length);
    
    console.log(`\nContext around line ${lineNumber}:\n`);
    for (let i = contextStart; i < contextEnd; i++) {
      console.log(`${i}:`, lines[i]);
    }
  }
  
} catch (error) {
  console.error(`Error: ${error.message}`);
} 