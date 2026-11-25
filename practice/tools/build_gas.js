#!/usr/bin/env node
/*
 * 組合 Google Apps Script 貼上用單檔（Data.gs + IRT.gs + Code.gs）
 *   node practice/tools/build_gas.js          重新產生 _combined_for_paste.gs
 *   node practice/tools/build_gas.js --check  只檢查是否與來源一致（不一致時 exit 1，CI 使用）
 *
 * 只改 Data.gs／IRT.gs／Code.gs，不要直接編輯 _combined_for_paste.gs。
 */
const fs = require('fs');
const path = require('path');

const GAS_DIR = path.resolve(__dirname, '..', 'gas');
const PARTS = ['Data.gs', 'IRT.gs', 'Code.gs'];
const OUT = path.join(GAS_DIR, '_combined_for_paste.gs');
const REL = path.relative(path.resolve(__dirname, '..', '..'), OUT);
const norm = s => s.replace(/\r\n/g, '\n');

const out = PARTS.map(name => {
  const body = norm(fs.readFileSync(path.join(GAS_DIR, name), 'utf8')).trim();
  return `// ====================================================================\n// ${name}（由 practice/tools/build_gas.js 自動組合，請勿直接編輯此檔）\n// ====================================================================\n\n${body}`;
}).join('\n\n\n') + '\n';

if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? norm(fs.readFileSync(OUT, 'utf8')) : '';
  if (current !== out) {
    console.error(`${REL} 與 ${PARTS.join('、')} 不一致：請執行 node practice/tools/build_gas.js 後一併提交。`);
    process.exit(1);
  }
  console.log(`${REL} 與來源一致`);
} else {
  fs.writeFileSync(OUT, out, 'utf8');
  console.log(`Built ${REL} (${out.length} bytes)`);
}
