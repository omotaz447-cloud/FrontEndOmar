import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentDir = path.join(__dirname, 'src/components');
const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(componentDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix: `${API_BASE_URL}...` followed by single quote
  content = content.replace(/`\$\{API_BASE_URL\}([^`]*?)'/g, '`${API_BASE_URL}$1`');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${file}`);
  } else {
    console.log(`- Skipped: ${file}`);
  }
});

console.log('\nAll files processed!');
