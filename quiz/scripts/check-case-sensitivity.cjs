// scripts/check-case-sensitivity.cjs
const fs = require('fs');
const path = require('path');

function checkCaseSensitivity(dir) {
  const issues = [];
  
  function scanDirectory(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      const lowerCaseMap = new Map();
      
      items.forEach(item => {
        const lowerCase = item.toLowerCase();
        if (lowerCaseMap.has(lowerCase)) {
          issues.push({
            path: currentPath,
            conflicting: [lowerCaseMap.get(lowerCase), item]
          });
        } else {
          lowerCaseMap.set(lowerCase, item);
        }
        
        const fullPath = path.join(currentPath, item);
        if (fs.statSync(fullPath).isDirectory() && 
            !item.startsWith('.') && 
            item !== 'node_modules') {
          scanDirectory(fullPath);
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${currentPath}: ${error.message}`);
    }
  }
  
  scanDirectory(dir);
  
  if (issues.length > 0) {
    console.error('❌ Case sensitivity issues found:');
    issues.forEach(issue => {
      console.error(`  ${issue.path}: ${issue.conflicting.join(' vs ')}`);
    });
    process.exit(1);
  } else {
    console.log('✅ No case sensitivity issues found');
  }
}

// Check src directory
checkCaseSensitivity('./src');