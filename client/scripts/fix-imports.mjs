import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.next', 'src', 'app', 'scripts']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(entry.name)) out.push(p);
  }
  return out;
}

for (const file of walk(ROOT)) {
  let content = fs.readFileSync(file, 'utf8');
  const next = content
    .replace(/from ['"]\.\.\/\.\.\/\.\.\/([^'"]+)['"]/g, "from '@/$1'")
    .replace(/from ['"]\.\.\/\.\.\/([^'"]+)['"]/g, "from '@/$1'")
    .replace(/from ['"]\.\.\/([^'"]+)['"]/g, "from '@/$1'");
  if (next !== content) fs.writeFileSync(file, next);
}

console.log('Import aliases updated');
