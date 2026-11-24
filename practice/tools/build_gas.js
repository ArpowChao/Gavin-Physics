#!/usr/bin/env node
/*
 * 組合 Google Apps Script 貼上用單檔（Data.gs + IRT.gs + Code.gs）
 *   node practice/tools/build_gas.js
 */
const fs = require('fs');
const path = require('path');

const GAS_DIR = path.resolve(__dirname, '..', 'gas');
const PARTS = ['Data.gs', 'IRT.gs', 'Code.gs'];
const OUT = path.join(GAS_DIR, '_combined_for_paste.gs');

const out = PARTS.map(name => {
  const body = fs.readFileSync(path.join(GAS_DIR, name), 'utf8').trim();
  return `// ====================================================================\n// ${name}（由 practice/tools/build_gas.js 自動組合，請勿直接編輯此檔）\n// ====================================================================\n\n${body}`;
}).join('\n\n\n') + '\n';

fs.writeFileSync(OUT, out, 'utf8');
console.log(`Built ${path.relative(path.resolve(__dirname, '..', '..'), OUT)} (${out.length} bytes)`);
