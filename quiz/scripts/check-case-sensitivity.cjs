// scripts/check-case-sensitivity.js
const fs = require('fs');
const path = require('path');

function checkCaseSensitivity(baseDir) {
  const files = fs.readdirSync(baseDir);

  files.forEach((file) => {
    const fullPath = path.join(baseDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      checkCaseSensitivity(fullPath);
    } else {
      const actual = fs.readdirSync(path.dirname(fullPath)).find(
        (f) => f.toLowerCase() === file.toLowerCase()
      );
      if (actual && actual !== file) {
        console.error(
          `⚠️ Case mismatch detected: "${file}" vs "${actual}" in ${baseDir}`
        );
        process.exit(1);
      }
    }
  });
}

// Run on src folder
checkCaseSensitivity(path.join(__dirname, '..', 'src'));
