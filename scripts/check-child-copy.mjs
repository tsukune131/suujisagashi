import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const targetPath = fileURLToPath(new URL('../src/copy/childCopy.ts', import.meta.url));
const text = readFileSync(targetPath, 'utf8');

const kanjiPattern = /[一-鿿]/g;
const matches = text.match(kanjiPattern);

if (matches) {
  console.error(`childCopy.ts に漢字が含まれています: ${[...new Set(matches)].join(', ')}`);
  process.exit(1);
}

console.log('childCopy.ts: 漢字混入なし');
