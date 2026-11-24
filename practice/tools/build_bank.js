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
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const pos = args.filter(a => a !== '--dry-run');
const [confusePath, outPath] = pos;
if (!confusePath || (!outPath && !DRY_RUN)) { console.error('用法：node build_bank.js [--dry-run] <bank_data.json> <bank_all.json>'); process.exit(1); }

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
reg.next.em = reg.next.em || 3001;
reg.next.pv = reg.next.pv || 4001;
reg.next.pi = reg.next.pi || 5001;

const LEVELS = ['記憶', '理解', '應用', '分析'];
const META = {
  scales: [{ key: 'req', name: '必修（高一）' }, { key: 'elec', name: '選修物理（高二・高三）' }],
  banks: [
    { key: 'confuse', name: '易混淆概念', scale: 'req' },
    { key: 'gsat', name: '學測必修複習', scale: 'req' },
    { key: 'pi', name: '選修物理Ⅰ（力學一）', scale: 'elec' },
    { key: 'wave', name: '波動與光學', scale: 'elec' },
    { key: 'em', name: '電磁學', scale: 'elec' },
    { key: 'pv', name: '選修物理Ⅴ（電路與近代物理）', scale: 'elec' },
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

require(path.join(ROOT, 'assets/node-sections.js')); const NS = globalThis.GP_NODE_SEC;
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
  // 概念名稱用課本章節（例：「必修 3-3 克卜勒行星運動定律」），依章節排序；N01 只當內部鍵值
  const secName = n => { const t = NS.tag(src.bank, n); return (/^必修/.test(t) ? t : NS.BOOK[src.bank].short + ' ' + t) + ' ' + titles[n]; };
  Object.keys(titles).sort((a, b) => NS.sortKey(src.bank, a) < NS.sortKey(src.bank, b) ? -1 : 1)
    .forEach(n => { cIdx[n] = META.concepts.length; META.concepts.push(secName(n)); META.conceptBank.push(src.bank); });
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
      table: null, fig: null, sec: src.prefix + ' ' + secName(q.node), focus: q.perf || '',
      anchor: false, exp: { text: q.exp || '', why },
    });
    used++;
  });
  stats[src.bank] = { used, skipped };
});

// ---------- 電磁學（選修物理Ⅳ）：逐概念練習＋逐章練習卷的單選／多選（題組與手寫題、需附圖的題目不納入） ----------
function inferEmAb(stem, exp) {
  const txt = (stem || '') + ' ' + (exp || '');
  if (/模型|近似|理想|點電荷|均勻/.test(txt)) return 'tm';
  if (/量測|實驗|數據|圖中|表格/.test(txt)) return 'pa';
  if (/判斷|比較|為何|與.*不符|反轉|推論/.test(txt)) return 'tr';
  return 'tr';
}
(() => {
  const ctx = { window: {} }; const run = f => new Function('window', 'EM', fs.readFileSync(path.join(ROOT, 'electromag/data', f), 'utf8') + '\n;return window.EM || EM;');
  let EM = run('course.js')(ctx.window, undefined); ['concept-practice.js', 'exams.js'].forEach(f => { EM = run(f)(ctx.window, EM) || EM; });
  const L = 'ABCDE';
  ['記憶', '理解', '應用', '分析'].forEach(l => META.papers.push({ key: 'em:' + l, name: l + '題', bank: 'em' }));
  const cIdx = {};
  EM.sections.forEach(s => { cIdx[s.id] = META.concepts.length; META.concepts.push('選修Ⅳ ' + s.id + ' ' + s.name); META.conceptBank.push('em'); });
  let used = 0, skipped = 0; const pno = {};
  const add = (node, sectionId, level, type, stem, choices, keys, exp, perf, abCode) => {
    const key = itemKey('em', node, stem);
    let id = reg.ids[key]; if (!id) { id = reg.next.em++; reg.ids[key] = id; }
    const paper = 'em:' + level; pno[paper] = (pno[paper] || 0) + 1;
    ITEMS.push({ id, key, bank: 'em', scale: 'elec', paper, pno: pno[paper], concept: cIdx[sectionId], node: sectionId, ab: abCode, bloom: level,
      type, gid: null, stem, opts: choices, ans: keys.map(k => L[k]).join(''), table: null, fig: null,
      sec: '選修Ⅳ ' + sectionId, focus: perf, anchor: false, exp: { text: exp || '', why: {} } });
    used++;
  };
  Object.keys(EM.conceptPractice).forEach(sid => EM.conceptPractice[sid].forEach(topic => topic.forEach(q => {
    if (q.figure) { skipped++; return; }
    add(sid, sid, q.level, 'S', q.stem, q.choices, [q.key], q.explanation, '逐概念練習', inferEmAb(q.stem, q.explanation));
  })));
  EM.exams.forEach(e => e.questions.forEach(q => {
    if (!(q.type === 'single' || q.type === 'multi') || q.figure) { skipped++; return; }
    const ab = q.ability ? q.ability.slice(0, 2) : inferEmAb(q.stem, q.reason);
    add(q.id, q.section, q.bloom, q.type === 'multi' ? 'M' : 'S', q.stem, q.options, q.key, q.reason, '第 ' + e.chapter + ' 章練習卷', ab);
  }));
  stats.em = { used, skipped };
})();

// ---------- 選修物理Ⅴ（電路與近代物理）：逐概念練習＋逐章練習卷的單選／多選 ----------
(() => {
  const ctx = { window: {} }; const run = f => new Function('window', 'PV', fs.readFileSync(path.join(ROOT, 'physics-v/data', f), 'utf8') + '\n;return window.PV || PV;');
  let PV = run('course.js')(ctx.window, undefined); ['concept-practice.js', 'exams.js'].forEach(f => { PV = run(f)(ctx.window, PV) || PV; });
  const L = 'ABCDE';
  ['記憶', '理解', '應用', '分析'].forEach(l => META.papers.push({ key: 'pv:' + l, name: l + '題', bank: 'pv' }));
  const cIdx = {};
  PV.sections.forEach(s => { cIdx[s.id] = META.concepts.length; META.concepts.push('選修Ⅴ ' + s.id + ' ' + s.name); META.conceptBank.push('pv'); });
  let used = 0, skipped = 0; const pno = {};
  const add = (node, sectionId, level, type, stem, choices, keys, exp, perf, abCode) => {
    const key = itemKey('pv', node, stem);
    let id = reg.ids[key]; if (!id) { id = reg.next.pv++; reg.ids[key] = id; }
    const paper = 'pv:' + level; pno[paper] = (pno[paper] || 0) + 1;
    ITEMS.push({ id, key, bank: 'pv', scale: 'elec', paper, pno: pno[paper], concept: cIdx[sectionId], node: sectionId, ab: abCode, bloom: level,
      type, gid: null, stem, opts: choices, ans: keys.map(k => L[k]).join(''), table: null, fig: null,
      sec: '選修Ⅴ ' + sectionId, focus: perf, anchor: false, exp: { text: exp || '', why: {} } });
    used++;
  };
  Object.keys(PV.conceptPractice).forEach(sid => PV.conceptPractice[sid].forEach(topic => topic.forEach(q => {
    if (q.figure) { skipped++; return; }
    add(sid, sid, q.level, 'S', q.stem, q.choices, [q.key], q.explanation, '逐概念練習', q.ability || inferEmAb(q.stem, q.explanation));
  })));
  PV.exams.forEach(e => e.questions.forEach(q => {
    if (!(q.type === 'single' || q.type === 'multi') || q.figure) { skipped++; return; }
    const ab = q.ability ? q.ability.slice(0, 2) : inferEmAb(q.stem, q.reason);
    add(q.id, q.section, q.bloom, q.type === 'multi' ? 'M' : 'S', q.stem, q.options, q.key, q.reason, '第 ' + e.chapter + ' 章練習卷', ab);
  }));
  stats.pv = { used, skipped };
})();

// ---------- 選修物理Ⅰ（力學一）：逐概念練習＋逐章練習卷的單選／多選 ----------
(() => {
  const ctx = { window: {} }; const run = f => new Function('window', 'PI', fs.readFileSync(path.join(ROOT, 'physics-i/data', f), 'utf8') + '\n;return window.PI || PI;');
  let PI = run('course.js')(ctx.window, undefined); ['concept-practice.js', 'exams.js'].forEach(f => { PI = run(f)(ctx.window, PI) || PI; });
  const L = 'ABCDE';
  ['記憶', '理解', '應用', '分析'].forEach(l => META.papers.push({ key: 'pi:' + l, name: l + '題', bank: 'pi' }));
  const cIdx = {};
  PI.sections.forEach(s => { cIdx[s.id] = META.concepts.length; META.concepts.push('選修Ⅰ ' + s.id + ' ' + s.name); META.conceptBank.push('pi'); });
  let used = 0, skipped = 0; const pno = {};
  const add = (node, sectionId, level, type, stem, choices, keys, exp, perf, abCode) => {
    const key = itemKey('pi', node, stem);
    let id = reg.ids[key]; if (!id) { id = reg.next.pi++; reg.ids[key] = id; }
    const paper = 'pi:' + level; pno[paper] = (pno[paper] || 0) + 1;
    ITEMS.push({ id, key, bank: 'pi', scale: 'elec', paper, pno: pno[paper], concept: cIdx[sectionId], node: sectionId, ab: abCode, bloom: level,
      type, gid: null, stem, opts: choices, ans: keys.map(k => L[k]).join(''), table: null, fig: null,
      sec: '選修Ⅰ ' + sectionId, focus: perf, anchor: false, exp: { text: exp || '', why: {} } });
    used++;
  };
  Object.keys(PI.conceptPractice).forEach(sid => PI.conceptPractice[sid].forEach(topic => topic.forEach(q => {
    if (q.figure) { skipped++; return; }
    add(sid, sid, q.level, 'S', q.stem, q.choices, [q.key], q.explanation, '逐概念練習', q.ability || inferEmAb(q.stem, q.explanation));
  })));
  PI.exams.forEach(e => e.questions.forEach(q => {
    if (!(q.type === 'single' || q.type === 'multi') || q.figure) { skipped++; return; }
    const ab = q.ability ? q.ability.slice(0, 2) : inferEmAb(q.stem, q.reason);
    add(q.id, q.section, q.bloom, q.type === 'multi' ? 'M' : 'S', q.stem, q.options, q.key, q.reason, '第 ' + e.chapter + ' 章練習卷', ab);
  }));
  stats.pi = { used, skipped };
})();

// 選修與學測各標記最多 8 題代表性核心單選題作為錨題（供 IRT 跨測驗定錨，保留 confuse 原有錨題）
['gsat', 'wave', 'em', 'pv', 'pi'].forEach(bankKey => {
  const pickedChapters = new Set();
  let count = 0;
  for (const it of ITEMS) {
    if (it.bank !== bankKey || it.type !== 'S' || it.gid) continue;
    if (it.bloom !== '理解' && it.bloom !== '應用') continue;
    const ch = String(it.sec || '').replace(/^.*?(\d+)[-\s].*$/, '$1');
    if (pickedChapters.has(ch) && count >= 4) continue;
    pickedChapters.add(ch);
    it.anchor = true;
    count++;
    if (count >= 8) break;
  }
});

// 檢查
const ids = new Set(); ITEMS.forEach(i => { if (ids.has(i.id)) throw new Error('題號重複 ' + i.id); ids.add(i.id);
  if (!i.ans) throw new Error('沒有答案：' + i.key); if (i.concept == null) throw new Error('沒有概念：' + i.key); });

if (!DRY_RUN) {
  fs.writeFileSync(outPath, JSON.stringify({ META, GROUPS, ITEMS }));
  fs.writeFileSync(REGISTRY, JSON.stringify(reg, null, 1) + '\n');
}
console.log((DRY_RUN ? '[DRY-RUN] ' : '') + '題目', ITEMS.length, '題組', GROUPS.length, '概念', META.concepts.length, JSON.stringify(stats));
