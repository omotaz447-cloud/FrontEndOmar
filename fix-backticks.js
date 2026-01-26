import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/components/*.tsx');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Fix: '${API_BASE_URL}... -> `${API_BASE_URL}...`
  content = content.replace(/fetch\('(\$\{API_BASE_URL\}[^']*?)'/g, "fetch(`$1`");
  
  // Fix baseUrl/url assignments
  content = content.replace(/= '(\$\{API_BASE_URL\}[^']*?)'/g, "= `$1`");
  
  // Fix ternary operators
  content = content.replace(/\? '(\$\{API_BASE_URL\}[^']*?)'/g, "? `$1`");
  content = content.replace(/: '(\$\{API_BASE_URL\}[^']*?)'/g, ": `$1`");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
    count++;
  }
});

console.log(`\nTotal files fixed: ${count}`);
