import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'content', 'posts');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx') && !f.startsWith('.'));

files.forEach(f => {
  let c = fs.readFileSync(path.join(dir, f), 'utf8');
  const fence = '```';
  if (c.startsWith(fence)) {
    c = c.replace(/^```(?:mdx)?\n/, '').replace(/\n```\s*$/, '').trim();
    fs.writeFileSync(path.join(dir, f), c);
    console.log('Fixed:', f);
  }
});

console.log('Done.');
