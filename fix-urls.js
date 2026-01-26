import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const componentsDir = 'src/components';
const files = globSync(componentsDir + '/*.tsx');

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace hardcoded URLs with API_BASE_URL
  content = content.replace(/https:\/\/backend-omar-x\.vercel\.app/g, '${API_BASE_URL}');
  content = content.replace(/https:\/\/backend-omar-puce\.vercel\.app/g, '${API_BASE_URL}');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const count = (original.match(/https:\/\/backend-omar/g) || []).length;
    totalReplacements += count;
    console.log(`✓ Fixed ${count} URLs in ${path.basename(file)}`);
  }
});

console.log(`\nTotal URLs fixed: ${totalReplacements}`);
