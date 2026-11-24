/****************************************************************
 * IRT 分析：Rasch 模型（1PL），以 MAP 聯合估計（JMLE＋常態先驗）
 * ・必修（易混淆概念＋學測必修複習）與選修（波動與光學）分開估計，各自一個 logit 量尺
 * ・允許每位學生作答不同題目（未作答視為未施測，不算答錯）
 * ・每位學生每題只採第一次作答（練習卷與網頁檢核題都算）
 ****************************************************************/
const IRT_MIN_N = 20;          // 題目作答人數低於此值標示「資料不足」
const PRIOR_SD_THETA = 1.0;    // 學生能力先驗標準差
const PRIOR_SD_B = 3.0;        // 題目難度先驗標準差（弱先驗）

/** 核心演算法：data = [[personIndex, itemIndex, x(0/1)], ...] */
function raschFit_(data, nP, nI, maxIter) {
  const th = new Array(nP).fill(0), b = new Array(nI).fill(0);
  const byP = Array.from({ length: nP }, () => []), byI = Array.from({ length: nI }, () => []);
  data.forEach(([p, i, x]) => { byP[p].push([i, x]); byI[i].push([p, x]); });
  const P = (t, d) => 1 / (1 + Math.exp(-(t - d)));
  let iter = 0, change = 1;
  for (; iter < (maxIter || 200) && change > 1e-5; iter++) {
    change = 0;
    for (let p = 0; p < nP; p++) {
      let g = -th[p] / (PRIOR_SD_THETA * PRIOR_SD_THETA), h = 1 / (PRIOR_SD_THETA * PRIOR_SD_THETA);
      byP[p].forEach(([i, x]) => { const pr = P(th[p], b[i]); g += x - pr; h += pr * (1 - pr); });
      const step = Math.max(-1, Math.min(1, g / h)); th[p] += step; change = Math.max(change, Math.abs(step));
    }
    for (let i = 0; i < nI; i++) {
      let g = -b[i] / (PRIOR_SD_B * PRIOR_SD_B), h = 1 / (PRIOR_SD_B * PRIOR_SD_B);
      byI[i].forEach(([p, x]) => { const pr = P(th[p], b[i]); g += pr - x; h += pr * (1 - pr); });
      const step = Math.max(-1, Math.min(1, g / h)); b[i] += step; change = Math.max(change, Math.abs(step));
    }
  }
  const seT = th.map((t, p) => { let h = 1 / (PRIOR_SD_THETA * PRIOR_SD_THETA); byP[p].forEach(([i]) => { const pr = P(t, b[i]); h += pr * (1 - pr); }); return 1 / Math.sqrt(h); });
  const itemStat = b.map((d, i) => {
    let info = 0, sumZ2 = 0, sumW = 0, sumR2 = 0, n = byI[i].length, sx = 0;
    const xs = [], ts = [];
    byI[i].forEach(([p, x]) => {
      const pr = P(th[p], d), w = pr * (1 - pr), r = x - pr;
      info += w; sumZ2 += (r * r) / w; sumR2 += r * r; sumW += w; sx += x; xs.push(x); ts.push(th[p]);
    });
    return { se: info > 0 ? 1 / Math.sqrt(info) : null, n, pValue: n ? sx / n : null,
      outfit: n ? sumZ2 / n : null, infit: sumW > 0 ? sumR2 / sumW : null, disc: corr_(xs, ts) };
  });
  return { theta: th, b, seTheta: seT, item: itemStat, iterations: iter };
}
function corr_(a, c) {
  const n = a.length; if (n < 3) return null;
  const ma = a.reduce((s, v) => s + v, 0) / n, mc = c.reduce((s, v) => s + v, 0) / n;
  let sab = 0, saa = 0, scc = 0;
  for (let k = 0; k < n; k++) { sab += (a[k] - ma) * (c[k] - mc); saa += (a[k] - ma) ** 2; scc += (c[k] - mc) ** 2; }
  return (saa > 0 && scc > 0) ? sab / Math.sqrt(saa * scc) : null;
}

const IRT_HEAD = {
  items: ['itemId', '量尺', '題庫', '卷別', '概念', '學習表現', 'Bloom', '難度b', 'SE_b', '作答人數', '答對率', '鑑別度', 'Infit', 'Outfit', '提醒', '選項分布'],
  persons: ['userId', '量尺', '暱稱', '作答題數', '答對題數', '能力θ', 'SE_θ', 'T分數', '最後作答'],
  mastery: ['量尺', '概念', '維度', '類別', '作答次數', '答對率', '表現指標'],
};

/** 重新計算 IRT（後台按鈕或每小時觸發器） */
function runIRT() {
  syncBankFile_();
  dirty_(SH.resp);
  const resp = rows_(SH.resp); const im = itemMap_();
  const users = {}; rows_(SH.users).forEach(r => users[r[0]] = { nick: r[1] });
  const itemRows = [], personRows = [], mRows = [], summary = {};
  META.scales.forEach(sc => {
    const first = {}, opts = {}, lastAct = {};
    resp.forEach(r => {
      const uid = r[2], id = Number(r[3]); const it = im[id]; if (!it || it.scale !== sc.key) return;
      const key = uid + '|' + id;
      if (!(key in first)) {
        first[key] = Number(r[5]);
        const o = opts[id] = opts[id] || {}; const k = r[4] === '' ? '未答' : String(r[4]); o[k] = (o[k] || 0) + 1;
      }
      lastAct[uid] = r[0];
    });
    const pIdx = {}, pList = [], iIdx = {}, iList = [], data = [];
    Object.keys(first).forEach(key => {
      const [uid, sid] = key.split('|'); const id = Number(sid);
      if (!(uid in pIdx)) { pIdx[uid] = pList.length; pList.push(uid); }
      if (!(id in iIdx)) { iIdx[id] = iList.length; iList.push(id); }
      data.push([pIdx[uid], iIdx[id], first[key]]);
    });
    if (!data.length) { summary[sc.key] = { persons: 0, items: 0, responses: 0 }; return; }
    const fit = raschFit_(data, pList.length, iList.length, 300);
    iList.forEach((id, k) => {
      const it = im[id], s = fit.item[k]; const flags = [];
      if (s.n < IRT_MIN_N) flags.push('資料不足');
      if (s.disc != null && s.disc < 0.15 && s.n >= IRT_MIN_N) flags.push('鑑別度低');
      if (s.infit != null && s.infit > 1.3 && s.n >= IRT_MIN_N) flags.push('適配不佳');
      if (s.infit != null && s.infit < 0.7 && s.n >= IRT_MIN_N) flags.push('過度適配');
      itemRows.push([id, sc.key, bankName_(it.bank), paperName_(it.paper), META.concepts[it.concept], META.abilities[it.ab] || '', it.bloom,
        round_(fit.b[k], 3), round_(s.se, 3), s.n, round_(s.pValue, 3), round_(s.disc, 3), round_(s.infit, 2), round_(s.outfit, 2), flags.join('、'), JSON.stringify(opts[id] || {})]);
    });
    const nAns = {}, nCor = {};
    data.forEach(([p, i, x]) => { nAns[p] = (nAns[p] || 0) + 1; nCor[p] = (nCor[p] || 0) + x; });
    pList.forEach((uid, p) => personRows.push([uid, sc.key, (users[uid] || {}).nick || '', nAns[p], nCor[p], round_(fit.theta[p], 3), round_(fit.seTheta[p], 3), Math.round(50 + 10 * fit.theta[p]), lastAct[uid]]));
    const agg = {};
    data.forEach(([p, i, x]) => {
      const it = im[iList[i]]; const pr = 1 / (1 + Math.exp(-(fit.theta[p] - fit.b[i])));
      [['學習表現', META.abilities[it.ab]], ['Bloom', it.bloom]].forEach(([dim, k]) => {
        if (!k) return; const key = META.concepts[it.concept] + '|' + dim + '|' + k; const o = agg[key] = agg[key] || { n: 0, x: 0, r: 0 };
        o.n++; o.x += x; o.r += x - pr;
      });
    });
    Object.keys(agg).forEach(key => { const [c, dim, k] = key.split('|'); const o = agg[key]; mRows.push([sc.key, c, dim, k, o.n, round_(o.x / o.n, 3), round_(o.r / o.n, 3)]); });
    summary[sc.key] = { persons: pList.length, items: iList.length, responses: data.length, iterations: fit.iterations };
  });
  writeSheet_(SH.irtI, IRT_HEAD.items, itemRows);
  writeSheet_(SH.irtP, IRT_HEAD.persons, personRows);
  writeSheet_(SH.mastery, IRT_HEAD.mastery, mRows);
  PropertiesService.getScriptProperties().setProperty('IRT_LAST_RUN', new Date().toISOString());
  Logger.log('IRT 完成：' + JSON.stringify(summary));
  return { ok: true, summary };
}
function round_(v, d) { return v == null || isNaN(v) ? '' : Math.round(v * Math.pow(10, d)) / Math.pow(10, d); }
function writeSheet_(name, head, rows) {
  const ss = ss_(); let sh = ss.getSheetByName(name); if (!sh) sh = ss.insertSheet(name);
  sh.clearContents(); sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold'); sh.setFrozenRows(1);
  if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows);
  dirty_(name);
}
function readIRT_(name) {   // 只讀新格式（含「量尺」欄）的結果；尚未用新版分析過時回傳空陣列
  const sh = sheet_(name); if (!sh || sh.getLastRow() < 2) return [];
  const col = name === SH.mastery ? 1 : 2;
  return sh.getRange(1, col).getValue() === '量尺' ? rows_(name) : [];
}
function irtLookup_(scale) {
  const items = {}, persons = {};
  readIRT_(SH.irtI).forEach(r => { if (r[1] === scale && r[7] !== '') items[r[0]] = { b: Number(r[7]) }; });
  readIRT_(SH.irtP).forEach(r => { if (r[1] === scale) persons[r[0]] = { theta: Number(r[5]), se: Number(r[6]) }; });
  return { items, persons };
}

// ====== 教師後台 API（需管理金鑰） ======
function checkAdmin_(key) { if (!key || key !== PropertiesService.getScriptProperties().getProperty('ADMIN_KEY')) throw new Error('管理金鑰錯誤'); }
function adminLogin(key) { checkAdmin_(key); return true; }
function adminRunIRT(key) { checkAdmin_(key); return runIRT(); }
function adminOverview(key, scale) {
  checkAdmin_(key); scale = scale || 'req';
  const resp = rows_(SH.resp), sess = rows_(SH.sess), users = rows_(SH.users);
  const im = itemMap_(); const day = 24 * 3600 * 1000, now = Date.now();
  const inScale = r => im[r[3]] && im[r[3]].scale === scale;
  const sresp = resp.filter(inScale);
  const banks = META.banks.filter(b => b.scale === scale);
  const bankKeys = banks.map(b => b.key);
  return JSON.parse(JSON.stringify({
    scale, scales: META.scales,
    counts: { users: users.length, sessions: sess.filter(r => r[3]).length, responses: sresp.length,
      pageResponses: sresp.filter(r => String(r[1]).indexOf('page:') === 0).length,
      active7: new Set(sresp.filter(r => now - new Date(r[0]).getTime() < 7 * day).map(r => r[2])).size },
    lastRun: PropertiesService.getScriptProperties().getProperty('IRT_LAST_RUN'),
    banks: banks.map(b => b.name),
    concepts: META.concepts.filter((_, i) => bankKeys.indexOf(META.conceptBank[i]) >= 0),
    abilities: Object.keys(META.abilities).map(k => META.abilities[k]),
    papers: META.papers.filter(p => bankKeys.indexOf(p.bank) >= 0).map(p => bankName_(p.bank) + '／' + p.name),
    items: readIRT_(SH.irtI).filter(r => r[1] === scale).map(r => ({ id: r[0], bank: r[2], paper: r[2] + '／' + r[3], concept: r[4], ability: r[5], bloom: r[6], b: r[7], se: r[8], n: r[9], p: r[10], disc: r[11], infit: r[12], outfit: r[13], flag: r[14], anchor: im[r[0]] && im[r[0]].anchor })),
    persons: readIRT_(SH.irtP).filter(r => r[1] === scale).map(r => ({ uid: r[0], nick: r[2], n: r[3], correct: r[4], theta: r[5], se: r[6], t: r[7], last: r[8] })),
    mastery: readIRT_(SH.mastery).filter(r => r[0] === scale).map(r => ({ concept: r[1], dim: r[2], cat: r[3], n: r[4], rate: r[5], index: r[6] })),
    daily: dailyCounts_(sresp),
  }));
}
function dailyCounts_(resp) {
  const m = {}; resp.forEach(r => { const d = Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), 'MM/dd'); m[d] = (m[d] || 0) + 1; });
  return Object.keys(m).sort().slice(-30).map(d => ({ d, n: m[d] }));
}
function adminItemDetail(key, id) {
  checkAdmin_(key);
  const it = itemMap_()[Number(id)]; if (!it) throw new Error('查無此題');
  const g = it.gid ? groupMap_()[it.gid] : null;
  const r = readIRT_(SH.irtI).find(r => Number(r[0]) === Number(id));
  const stat = r ? { b: r[7], se: r[8], n: r[9], p: r[10], disc: r[11], infit: r[12], outfit: r[13], flag: r[14], options: JSON.parse(r[15] || '{}') } : null;
  return JSON.parse(JSON.stringify({ id: it.id, bank: bankName_(it.bank), paper: paperName_(it.paper), concept: META.concepts[it.concept], ability: META.abilities[it.ab] || '', bloom: it.bloom, type: it.type,
    stem: it.stem, opts: it.opts, ans: it.ans, table: it.table, fig: it.fig, focus: it.focus, exp: it.exp, group: g ? { stem: g.stem, table: g.table, fig: g.fig, theme: g.theme } : null, stat }));
}
function adminStudentDetail(key, uid, scale) {
  checkAdmin_(key); scale = scale || 'req';
  const im = itemMap_(); const irt = irtLookup_(scale); const person = irt.persons[uid];
  const first = {}; rows_(SH.resp).forEach(r => { const it = im[r[3]]; if (r[2] === uid && it && it.scale === scale && !(r[3] in first)) first[r[3]] = { x: Number(r[5]), resp: r[4], at: r[0], src: String(r[1]).indexOf('page:') === 0 ? '網頁' : '練習' }; });
  const rowsOut = Object.keys(first).map(id => { const it = im[id]; const b = irt.items[id] ? irt.items[id].b : null;
    const p = person && b != null ? 1 / (1 + Math.exp(-(person.theta - b))) : null;
    return { id: Number(id), bank: bankName_(it.bank), concept: META.concepts[it.concept], ability: META.abilities[it.ab] || '', bloom: it.bloom, x: first[id].x, resp: first[id].resp, ans: it.ans, b, p, src: first[id].src }; });
  return JSON.parse(JSON.stringify({ uid, theta: person ? person.theta : null, se: person ? person.se : null, rows: rowsOut }));
}
