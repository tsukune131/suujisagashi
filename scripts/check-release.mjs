import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relative) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const adConfig = read('../src/lib/adConfig.ts');
const infoPlist = read('../ios/App/App/Info.plist');
const GOOGLE_TEST_PUBLISHER = 'ca-app-pub-3940256099942544';

const problems = [];

if (/USE_TEST_ADS\s*=\s*true/.test(adConfig)) {
  problems.push('src/lib/adConfig.ts: USE_TEST_ADS が true のまま');
}
if (/PRODUCTION_AD_UNIT_IDS\s*=\s*\{[^}]*:\s*''/s.test(adConfig)) {
  problems.push('src/lib/adConfig.ts: PRODUCTION_AD_UNIT_IDS に未設定のIDがある');
}
if (infoPlist.includes(GOOGLE_TEST_PUBLISHER)) {
  problems.push('ios/App/App/Info.plist: GADApplicationIdentifier がGoogleのテストApp IDのまま');
}

if (problems.length > 0) {
  console.error('提出前チェックNG:\n' + problems.map((p) => `- ${p}`).join('\n'));
  console.error('手順: docs/admob-setup.md の Part C');
  process.exit(1);
}

console.log('提出前チェックOK');
