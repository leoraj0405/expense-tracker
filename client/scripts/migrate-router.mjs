import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['pages', 'components', 'hooks', 'layouts', 'services', 'utils', 'types'];

const NEEDS_CLIENT = new Set([
  ...walkDir(path.join(ROOT, 'pages')),
  ...walkDir(path.join(ROOT, 'components')),
  ...walkDir(path.join(ROOT, 'hooks')),
  ...walkDir(path.join(ROOT, 'layouts')),
]);

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(p));
    else if (/\.tsx?$/.test(entry.name)) out.push(p);
  }
  return out;
}

function toAlias(content) {
  return content
    .replace(/from ['"]\.\.\/\.\.\/\.\.\/(hooks|components|layouts|services|utils|types|pages|theme)['"]/g, "from '@/$1'")
    .replace(/from ['"]\.\.\/\.\.\/(hooks|components|layouts|services|utils|types|pages|theme)['"]/g, "from '@/$1'")
    .replace(/from ['"]\.\.\/(hooks|components|layouts|services|utils|types|pages|theme)['"]/g, "from '@/$1'")
    .replace(
      /import defaultImage from ['"][^'"]*profile\.png['"];?\n?/g,
      "const defaultImage = '/profile.png';\n",
    );
}

function transformRouter(content) {
  let c = content;

  const routerImport = c.match(/import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/);
  if (routerImport) {
    const names = routerImport[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const nextLines = [];
    if (names.includes('Link')) nextLines.push("import Link from 'next/link';");
    const navImports = [];
    if (names.includes('useNavigate')) navImports.push('useRouter');
    if (names.includes('useLocation')) {
      navImports.push('usePathname', 'useSearchParams');
    }
    if (names.includes('useParams')) navImports.push('useParams');
    if (navImports.length) {
      nextLines.push(`import { ${navImports.join(', ')} } from 'next/navigation';`);
    }
    c = c.replace(/import\s+\{[^}]+\}\s+from\s+['"]react-router-dom['"];?\n?/, `${nextLines.join('\n')}\n`);
  }

  c = c.replace(/\bconst navigate = useNavigate\(\);/g, 'const router = useRouter();');
  c = c.replace(/\bnavigate\(/g, 'router.push(');
  c = c.replace(/\bnavigate,/g, 'router,');
  c = c.replace(/\[loginUser, navigate,/g, '[loginUser, router,');

  c = c.replace(
    /const pathname = usePathname\(\);\s*\n\s*const searchParams = useSearchParams\(\);\s*\n\s*const router = useRouter\(\);/g,
    'const pathname = usePathname();\n  const searchParams = useSearchParams();\n  const router = useRouter();',
  );

  if (c.includes('usePathname') || c.includes('useSearchParams')) {
    c = c.replace(/const location = useLocation\(\);/g, 'const pathname = usePathname();\n  const searchParams = useSearchParams();');
  }

  c = c.replace(/location\.pathname/g, 'pathname');
  c = c.replace(/new URLSearchParams\(location\.search\)/g, 'searchParams');
  c = c.replace(/return new URLSearchParams\(useLocation\(\)\.search\);/g, 'return useSearchParams();');

  c = c.replace(
    /router\.push\(\{ pathname: pathname, search: params\.toString\(\) \}, \{ replace: true \}\)/g,
    'router.replace(`${pathname}?${params.toString()}`)',
  );

  c = c.replace(/\bto=\{/g, 'href={');
  c = c.replace(/\bto="/g, 'href="');
  c = c.replace(/\bto='/g, "href='");
  c = c.replace(/href="addcategory"/g, 'href="/category/addcategory"');
  c = c.replace(/href="addgroup"/g, 'href="/group/addgroup"');

  c = c.replace(/process\.env\.REACT_APP_FETCH_URL/g, 'process.env.NEXT_PUBLIC_API_URL');

  return c;
}

function addUseClient(file, content) {
  if (!NEEDS_CLIENT.has(file)) return content;
  if (content.startsWith("'use client'") || content.startsWith('"use client"')) return content;
  return `'use client';\n\n${content}`;
}

for (const dir of DIRS) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const file of walkDir(full)) {
    let content = fs.readFileSync(file, 'utf8');
    content = toAlias(content);
    content = transformRouter(content);
    content = addUseClient(file, content);
    fs.writeFileSync(file, content);
  }
}

console.log('Migration complete');
