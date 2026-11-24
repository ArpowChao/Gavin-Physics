#!/usr/bin/env node
/*
 * 合併題庫產生器
 *   node practice/tools/build_bank.js <易混淆 bank_data.json> <輸出 bank_all.json>
 *
 * ・易混淆概念題庫（私有，放在雲端硬碟）保留原本的題號 1–372，舊的作答紀錄不受影響
 * ・學測 gsat/data/questionBank.js 與波動光學 wave-optics/data/questionBank.js 轉成同一格式
 * ・題號由 id-registry.json 管理（只存雜湊鍵 → 題號，不含題目與答案），只增不減：
 *   題目重新排序不會改變題號；題幹改寫會變成新題號（IRT 視為新題）
 * ・輸出檔含答案，不可放進公開 repo，請上傳到雲端硬碟
 */
const fs = require('fs');
const path = require('path');
const { itemKey } = require('../item-key.js');

const ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY = path.join(__dirname, 'id-registry.json');
const [, , confusePath, outPath] = process.argv;
if (!confusePath || !outPath) { console.error('用法：node build_bank.js <bank_data.json> <bank_all.json>'); process.exit(1); }

function loadJs(file, name) {
  const m = { exports: {} };
  new Function('module', 'exports', fs.readFileSync(file, 'utf8') + `;module.exports=${name};`)(m, m.exports);
  return m.exports;
}
function nodeTitles(file) {   // 由題庫檔的分節註解取節點名稱：// ===== N01 名稱 =====
  const out = {};
  fs.readFileSync(file, 'utf8').replace(/\/\/\s*=+\s*(N\d+)\s+(.+?)\s*=+/g, (_, n, t) => { out[n] = t; });
  return out;
}
const AB_RULES = [   // 學習表現代碼：先看括號代碼，再看關鍵字
  [/\(tr\)|推理論證/, 'tr'], [/\(tm\)|建立模型|科學建模|模型建立/, 'tm'], [/\(tc\)|批判思辨/, 'tc'], [/\(ti\)|想像創造/, 'ti'],
  [/\(pa\)|分析與發現|數據分析/, 'pa'], [/\(pe\)|計劃與執行|探究規劃|探究與問題解決/, 'pe'], [/\(po\)|觀察與定題/, 'po'], [/\(pc\)|討論與傳達/, 'pc'],
];
const abOf = perf => { for (const [re, k] of AB_RULES) if (re.test(perf || '')) return k; return null; };

const confuse = JSON.parse(fs.readFileSync(confusePath, 'utf8'));
const reg = fs.existsSync(REGISTRY) ? JSON.parse(fs.readFileSync(REGISTRY, 'utf8')) : { next: { gsat: 1001, wave: 2001 }, ids: {} };

const LEVELS = ['記憶', '理解', '應用', '分析'];
const META = {
  scales: [{ key: 'req', name: '必修（高一）' }, { key: 'elec', name: '選修物理（高三）' }],
  banks: [
    { key: 'confuse', name: '易混淆概念', scale: 'req' },
    { key: 'gsat', name: '學測必修複習', scale: 'req' },
    { key: 'wave', name: '波動與光學', scale: 'elec' },
  ],
  abilities: confuse.META.abilities,
  concepts: [], conceptBank: [],
  papers: [],
};
// 易混淆：概念與卷別沿用原本的索引與代碼
confuse.META.concepts.forEach(c => { META.concepts.push(c); META.conceptBank.push('confuse'); });
confuse.META.papers.forEach(p => META.papers.push({ key: p.key, name: p.name, bank: 'confuse' }));
const ITEMS = confuse.ITEMS.map(i => Object.assign({}, i, { bank: 'confuse', scale: 'req', key: 'confuse:' + i.id }));
const GROUPS = confuse.GROUPS.map(g => Object.assign({}, g, { bank: 'confuse' }));

const SOURCES = [
  { bank: 'gsat', scale: 'req', file: 'gsat/data/questionBank.js', prefix: '學測' },
  { bank: 'wave', scale: 'elec', file: 'wave-optics/data/questionBank.js', prefix: '波光' },
];
const stats = {};
SOURCES.forEach(src => {
  const file = path.join(ROOT, src.file);
  const bank = loadJs(file, 'questionBank'); const titles = nodeTitles(file);
  LEVELS.forEach(l => META.papers.push({ key: src.bank + ':' + l, name: l + '題', bank: src.bank }));
  const cIdx = {};
  Object.keys(titles).sort().forEach(n => { cIdx[n] = META.concepts.length; META.concepts.push(n + ' ' + titles[n]); META.conceptBank.push(src.bank); });
  let used = 0, skipped = 0; const pno = {};
  bank.forEach(q => {
    if (!Array.isArray(q.opts) || !q.opts.length) { skipped++; return; }   // 非選擇題（簡答）不納入
    const key = itemKey(src.bank, q.node, q.q);
    let id = reg.ids[key];
    if (!id) { id = reg.next[src.bank]++; reg.ids[key] = id; }
    const L = 'ABCDE';
    const why = {}; q.opts.forEach((o, k) => { if (o.why) why[L[k]] = o.why; });
    const paper = src.bank + ':' + q.level;
    pno[paper] = (pno[paper] || 0) + 1;
    ITEMS.push({
      id, key, bank: src.bank, scale: src.scale, paper, pno: pno[paper],
      concept: cIdx[q.node], node: q.node, ab: abOf(q.perf), bloom: q.level,
      type: q.type === 'multi' ? 'M' : 'S', gid: null,
      stem: q.q, opts: q.opts.map(o => o.t.replace(/^\([A-E]\)\s*/, '')),
      ans: q.opts.map((o, k) => o.c ? L[k] : '').join(''),
      table: null, fig: null, sec: src.prefix + ' ' + q.node + ' ' + (titles[q.node] || ''), focus: q.perf || '',
      anchor: false, exp: { text: q.exp || '', why },
    });
    used++;
  });
  stats[src.bank] = { used, skipped };
});

// 檢查
const ids = new Set(); ITEMS.forEach(i => { if (ids.has(i.id)) throw new Error('題號重複 ' + i.id); ids.add(i.id);
  if (!i.ans) throw new Error('沒有答案：' + i.key); if (i.concept == null) throw new Error('沒有概念：' + i.key); });

fs.writeFileSync(outPath, JSON.stringify({ META, GROUPS, ITEMS }));
fs.writeFileSync(REGISTRY, JSON.stringify(reg, null, 1) + '\n');
console.log('題目', ITEMS.length, '題組', GROUPS.length, '概念', META.concepts.length, JSON.stringify(stats));
