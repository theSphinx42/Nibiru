#!/usr/bin/env node

/**
 * Next.js Route Conflict Detector
 * 
 * This script scans the pages/ directory and reports any duplicate route definitions,
 * such as when both 'route.tsx' and 'route/index.tsx' exist, which would both resolve
 * to the same URL path.
 * 
 * Usage:
 *   node detect-route-conflicts.js [pagesDir]
 * 
 * Arguments:
 *   pagesDir - Optional path to the pages directory (default: './pages')
 * 
 * Repository: https://github.com/ai-helpers-nexus
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
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
const pagesDir = process.argv[2] || './pages';
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mdx'];

/**
 * Log a colored message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Convert a file path to a Next.js route
 */
function pathToRoute(filePath, baseDir) {
  // Remove the base directory and file extension
  let route = filePath.replace(baseDir, '');
  
  // Remove file extension
  fileExtensions.forEach(ext => {
    route = route.replace(ext, '');
  });
  
  // Replace backslashes with forward slashes for consistency
  route = route.replace(/\\/g, '/');
  
  // Remove leading slash
  if (route.startsWith('/')) {
    route = route.substring(1);
  }
  
  // Handle index files
  route = route.replace(/\/index$/, '');
  
  // Handle empty route (homepage)
  if (route === 'index') {
    route = '';
  }
  
  return '/' + route;
}

/**
 * Check if a file should be included in route scanning
 */
function shouldIncludeFile(file) {
  // Skip hidden files and directories
  if (file.startsWith('.')) {
    return false;
  }
  
  // Skip API routes directory
  if (file === 'api' || file.startsWith('api/')) {
    return false;
  }
  
  // Skip _app.js, _document.js, etc.
  if (file.startsWith('_')) {
    return false;
  }
  
  return true;
}

/**
 * Recursively scan directory and collect routes
 */
function scanDirectory(dir, routes = {}, baseDir = null) {
  if (!baseDir) {
    baseDir = dir;
  }
  
  if (!fs.existsSync(dir)) {
    log(`Directory not found: ${dir}`, colors.red);
    return routes;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    
    // Skip files/directories we don't want to include
    if (!shouldIncludeFile(item)) {
      continue;
    }
    
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      scanDirectory(itemPath, routes, baseDir);
    } else {
      // Check if this is a valid page file
      const ext = path.extname(item);
      if (fileExtensions.includes(ext)) {
        const route = pathToRoute(itemPath, baseDir);
        
        if (!routes[route]) {
          routes[route] = [];
        }
        
        routes[route].push(itemPath);
      }
    }
  }
  
  return routes;
}

/**
 * Find and report route conflicts
 */
function findRouteConflicts(pagesDir) {
  log(`\n${colors.bold}${colors.magenta}NEXT.JS ROUTE CONFLICT DETECTOR${colors.reset}`, colors.bold);
  log('=====================================\n', colors.magenta);
  
  const resolvedPagesDir = path.resolve(process.cwd(), pagesDir);
  log(`Scanning pages directory: ${resolvedPagesDir}`, colors.blue);
  
  if (!fs.existsSync(resolvedPagesDir)) {
    log(`Error: Pages directory not found: ${resolvedPagesDir}`, colors.red);
    log(`Make sure you're running this script from the project root or specify the correct path.`, colors.yellow);
    return false;
  }
  
  // Collect all routes
  const routes = scanDirectory(resolvedPagesDir);
  
  // Check for conflicts
  let conflicts = 0;
  let totalRoutes = 0;
  
  for (const [route, files] of Object.entries(routes)) {
    totalRoutes++;
    
    if (files.length > 1) {
      conflicts++;
      log(`\n⚠️ ${colors.yellow}Duplicate route detected:${colors.reset} ${colors.bold}${route}${colors.reset}`, colors.yellow);
      log(`The following files resolve to the same route:`, colors.yellow);
      
      files.forEach((file, index) => {
        const relativeFile = path.relative(process.cwd(), file);
        log(`  ${index + 1}. ${relativeFile}`, colors.yellow);
      });
    }
  }
  
  // Output summary
  log(`\n${colors.bold}Summary:${colors.reset}`, colors.cyan);
  log(`Total routes found: ${totalRoutes}`, colors.cyan);
  
  if (conflicts === 0) {
    log(`✅ No route conflicts detected!`, colors.green);
  } else {
    log(`⚠️ ${colors.yellow}${conflicts} route conflict${conflicts > 1 ? 's' : ''} detected!${colors.reset}`, colors.yellow);
    log(`These conflicts may cause unexpected behavior in your Next.js application.`, colors.yellow);
    log(`Consider removing or renaming the conflicting files.`, colors.yellow);
  }
  
  return conflicts === 0;
}

// Run the main function
findRouteConflicts(pagesDir); 