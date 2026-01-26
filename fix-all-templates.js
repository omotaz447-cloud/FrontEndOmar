import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentDir = path.join(__dirname, 'src/components');
const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.tsx'));

const patterns = [
  // Pattern 1: : ${API_BASE_URL}... (inside ternary operator)
  { regex: /:\s*\$\{API_BASE_URL\}/g, replacement: ': `${API_BASE_URL}' },
  
  // Pattern 2: console.log or any function with ${API_BASE_URL} without backtick
  { regex: /,\s*\$\{API_BASE_URL\}/g, replacement: ', `${API_BASE_URL}' },
  
  // Pattern 3: Fix closing quotes - `${API_BASE_URL}...`' should be `${API_BASE_URL}...`
  { regex: /`\$\{API_BASE_URL\}([^`]*?)`'/g, replacement: '`${API_BASE_URL}$1`' },
  { regex: /`\$\{API_BASE_URL\}([^`]*?)'/g, replacement: '`${API_BASE_URL}$1`' },
  
  // Pattern 4: Fix cases where backtick is before but quote is after the endpoint
  { regex: /`\$\{API_BASE_URL\}([^`]*?)(');/g, replacement: '`${API_BASE_URL}$1`;' },
  { regex: /`\$\{API_BASE_URL\}([^`]*?)('),/g, replacement: '`${API_BASE_URL}$1`,' },
  { regex: /`\$\{API_BASE_URL\}([^`]*?)('),\{/g, replacement: '`${API_BASE_URL}$1`, {' },
  
  // Pattern 5: Fix missing opening backticks on fetch/await patterns 
  { regex: /\$\{API_BASE_URL\}([^`]*?);/g, replacement: '`${API_BASE_URL}$1`;' }
];

files.forEach(file => {
  const filePath = path.join(componentDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Apply all patterns
  patterns.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${file}`);
  }
});

console.log('All files processed!');
