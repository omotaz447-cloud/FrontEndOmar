import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/components/*.tsx');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Fix console.log statements with template literals in strings
  content = content.replace(/console\.log\('([^']*?)(?:'?\s*\+\s*)?'(\$\{API_BASE_URL\}[^']*?)'/g, "console.log(`$1${API_BASE_URL}$2`");
  content = content.replace(/console\.log\('Fetching[^']*?'\s*,\s*'(\$\{API_BASE_URL\}[^']*?)'/g, "console.log('...', `$1`");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Fixed console.logs in ${file}`);
    count++;
  }
});

console.log(`\nTotal files fixed: ${count}`);
