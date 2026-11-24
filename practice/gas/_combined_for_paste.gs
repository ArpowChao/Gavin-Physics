/** 題庫資料：雲端硬碟上的 bank_all.json（由 practice/tools/build_bank.js 產生，含答案，不放公開 repo），以快取加速讀取 */
const CACHE_PART = 25000, CACHE_MAX_PARTS = 80;
let __DATA = null;
function data_() {
  if (__DATA) return __DATA;
  const c = CacheService.getScriptCache(); let txt = null;
  const n = Number(c.get('data_n') || 0);
  if (n) {
    const keys = []; for (let i = 0; i < n; i++) keys.push('data_' + i);
    const parts = c.getAll(keys);
    if (Object.keys(parts).length === n) txt = keys.map(k => parts[k]).join('');
  }
  if (!txt) {
    const id = prop_('BANK_FILE_ID'); if (!id) throw new Error('尚未設定題庫檔（執行 setBankFile）');
    txt = DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8');
    const obj = {}; let k = 0;
    for (let i = 0; i < txt.length; i += CACHE_PART) obj['data_' + (k++)] = txt.slice(i, i + CACHE_PART);
    obj.data_n = String(k);
    try { c.putAll(obj, 21600); } catch (e) {}
  }
  __DATA = JSON.parse(txt);
  return __DATA;
}
Object.defineProperty(globalThis, 'META', { get: () => data_().META });
Object.defineProperty(globalThis, 'ITEMS', { get: () => data_().ITEMS });
Object.defineProperty(globalThis, 'GROUPS', { get: () => data_().GROUPS });

/** 清除題庫與附圖的快取（更新 bank_all.json 後執行） */
function clearCaches() {
  const c = CacheService.getScriptCache(); const keys = ['data_n'];
  for (let i = 0; i < CACHE_MAX_PARTS; i++) keys.push('data_' + i);
  const map = JSON.parse(PropertiesService.getScriptProperties().getProperty('FIG_MAP') || '{}');
  Object.keys(map).forEach(k => keys.push('fig_' + k));
  c.removeAll(keys); __DATA = null; Logger.log('已清除快取');
}

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

/****************************************************************
 * Gavin Physics 線上練習系統（Google Apps Script・JSON API）
 * 網站 https://arpowchao.github.io/Gavin-Physics/practice/ 以 POST 呼叫本程式
 *   body = {"fn": "函式名稱", "args": [...]}   回應 = {"ok": true, "data": ...} 或 {"ok": false, "error": "..."}
 * 學生端：暱稱＋密碼註冊（不收集個資）；題庫分「易混淆概念／學測必修複習／波動與光學」
 * 教師端：以管理金鑰呼叫 admin* 函式
 * 第一次使用：依序執行 setup → importLegacy → installHourlyTrigger，再部署為網頁應用程式
 ****************************************************************/

// ====== 設定（setup 會把試算表 ID 存進指令碼屬性；以下為預設值） ======
const DEFAULTS = {
  FIG_FOLDER_ID: '16MNlYaCY1aqb2qrMcGu9uoLd5J79tRZT',     // 易混淆概念題的附圖（沿用原本的雲端資料夾）
  LEGACY_SHEET_ID: '1y1yze94zM5elUqDt31Ys9VHASJJ1LBIq_I0VdMyv2Pc',   // 舊系統「物理練習系統_資料庫」
  BANK_FILE_ID: '18jMm11P4JKg4y4UEBFcBZHxsrT8rsYjy',      // 合併題庫 bank_all.json（雲端硬碟「Gavin Physics 線上練習」資料夾，含電磁學）
};
const ANCHORS_PER_SESSION = 2;      // 每次練習加入的錨題數（同一量尺）
const TOKEN_HOURS = 6;              // 登入閒置多久後失效（每次呼叫都會延長）
const FEEDBACK_TO = 'arpowchaosun@smhs.kh.edu.tw';

const SH = { users: 'Users', sess: 'Sessions', resp: 'Responses', items: 'Items', irtI: 'IRT_Items', irtP: 'IRT_Persons', mastery: 'IRT_Mastery', fb: 'Feedback' };
const HEAD = {
  Users: ['userId', 'nickname', 'salt', 'hash', 'createdAt', 'lastLogin'],
  Sessions: ['sessionId', 'userId', 'startedAt', 'finishedAt', 'mode', 'itemIds', 'score', 'total'],
  Responses: ['timestamp', 'sessionId', 'userId', 'itemId', 'response', 'correct', 'partial', 'seconds', 'attempt'],
  Items: ['itemId', 'bank', 'scale', 'paper', 'pno', 'concept', 'ability', 'bloom', 'type', 'answer', 'anchor', 'groupId', 'section', 'focus', 'key'],
  Feedback: ['timestamp', 'userId', 'nickname', 'itemId', 'paper', 'pno', 'concept', 'kind', 'text', 'status'],
};

function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || DEFAULTS[k] || ''; }

// ====== 網頁入口 ======
// 以函式回傳，避免各 .gs 檔載入順序造成未定義
function api_() { return {
  ping: () => ({ ok: true, time: new Date().toISOString() }),
  register, login, getMeta, getProgress, getWrongBook, startSession, submitSession, getMyReport, reportIssue, getFigure, logResponse, getPageHistory,
  adminLogin, adminRunIRT, adminOverview, adminItemDetail, adminStudentDetail,
}; }
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.fn) return handle_(p.fn, p.args ? JSON.parse(p.args) : []);
  return json_({ ok: true, data: { name: 'Gavin Physics 線上練習 API', time: new Date().toISOString() } });
}
function doPost(e) {
  let body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: '請求格式錯誤' }); }
  return handle_(body.fn, body.args || []);
}
function handle_(fn, args) {
  Object.keys(__ROWS).forEach(k => delete __ROWS[k]);   // 每次請求重新讀取
  const API = api_();
  if (!Object.prototype.hasOwnProperty.call(API, fn)) return json_({ ok: false, error: '未知的功能：' + fn });
  try { return json_({ ok: true, data: API[fn].apply(null, args) }); }
  catch (err) { return json_({ ok: false, error: String(err && err.message || err) }); }
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ====== 初始化（第一次手動執行） ======
function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (!id) { id = SpreadsheetApp.create('Gavin Physics 線上練習_資料庫').getId(); props.setProperty('SHEET_ID', id); }
  const ss = ss_();
  Object.keys(HEAD).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.appendRow(HEAD[name]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold'); }
  });
  const first = ss.getSheetByName('工作表1') || ss.getSheetByName('Sheet1'); if (first && ss.getSheets().length > 1) ss.deleteSheet(first);
  writeItemsSheet_();
  if (!props.getProperty('ADMIN_KEY')) props.setProperty('ADMIN_KEY', Utilities.getUuid().slice(0, 8));
  try { importFigures(); } catch (e) { Logger.log('附圖匯入失敗：' + e.message); }
  Logger.log('初始化完成。資料試算表：https://docs.google.com/spreadsheets/d/' + id);
  Logger.log('後台管理金鑰：' + props.getProperty('ADMIN_KEY'));
}
function writeItemsSheet_() {   // 題庫總覽（唯讀參考，系統以雲端硬碟的 bank_all.json 為準）
  const it = sheet_(SH.items);
  if (it.getLastRow() > 1) it.getRange(2, 1, it.getLastRow() - 1, HEAD.Items.length).clearContent();
  const rows = ITEMS.map(i => [i.id, bankName_(i.bank), i.scale, paperName_(i.paper), i.pno, META.concepts[i.concept], META.abilities[i.ab] || '', i.bloom,
    i.type === 'M' ? '多選' : '單選', i.ans, i.anchor ? '錨題' : '', i.gid || '', i.sec, i.focus, i.key]);
  it.getRange(2, 1, rows.length, HEAD.Items.length).setValues(rows);
}
/** 設定題庫檔：把 bank_all.json 的檔案 ID 填在引號內後執行 */
function setBankFile() {
  const FILE_ID = '';
  if (FILE_ID) PropertiesService.getScriptProperties().setProperty('BANK_FILE_ID', FILE_ID);
  clearCaches(); writeItemsSheet_();
  Logger.log('題庫：' + ITEMS.length + ' 題（檔案 ' + prop_('BANK_FILE_ID') + '）');
}
/** 更改後台管理金鑰：在編輯器中修改引號內文字後執行 */
function setAdminKey() {
  const NEW_KEY = 'changeme';
  PropertiesService.getScriptProperties().setProperty('ADMIN_KEY', NEW_KEY);
  Logger.log('管理金鑰已設為：' + NEW_KEY);
}
/** 匯入附圖（易混淆概念題）：資料夾中 q12.png、g22.png 這類檔名 */
function importFigures() {
  const files = DriveApp.getFolderById(prop_('FIG_FOLDER_ID')).getFiles(); const map = {}, when = {};
  while (files.hasNext()) { const f = files.next(); const m = f.getName().match(/^([qg]\d+)(?:\s*\(\d+\))?\.png$/i); if (!m) continue;
    const k = m[1].toLowerCase(), t = f.getLastUpdated().getTime(); if (!(k in when) || t > when[k]) { map[k] = f.getId(); when[k] = t; } }
  PropertiesService.getScriptProperties().setProperty('FIG_MAP', JSON.stringify(map));
  clearCaches();
  Logger.log('已匯入附圖 ' + Object.keys(map).length + ' 張');
}
/** 建立每小時檢查的觸發器：有新的作答才重算 IRT */
function installHourlyTrigger() {
  ScriptApp.getProjectTriggers().filter(t => ['runIRT', 'runIRTIfNew'].includes(t.getHandlerFunction())).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runIRTIfNew').timeBased().everyHours(1).create();
  Logger.log('已建立每小時檢查的自動分析觸發器');
}
/** 程式碼裡指定的題庫檔若和目前使用的不同（更新題庫後），切換過去並清除快取；runIRT／每小時觸發器都會檢查 */
function syncBankFile_() {
  const props = PropertiesService.getScriptProperties(); const want = DEFAULTS.BANK_FILE_ID;
  if (!want || props.getProperty('BANK_FILE_ID') === want) return false;
  props.setProperty('BANK_FILE_ID', want); clearCaches(); __IM = __KM = __GM = null;
  try { writeItemsSheet_(); } catch (e) { Logger.log('題庫總覽更新失敗：' + e.message); }
  Logger.log('已切換題庫檔：' + want + '，共 ' + ITEMS.length + ' 題'); return true;
}
function runIRTIfNew() {
  syncBankFile_();
  const n = sheet_(SH.resp).getLastRow(); const props = PropertiesService.getScriptProperties();
  if (String(n) === props.getProperty('IRT_LAST_N')) { Logger.log('沒有新的作答，略過'); return; }
  const r = runIRT(); props.setProperty('IRT_LAST_N', String(n)); return r;
}

// ====== 從舊系統匯入帳號與作答（可重複執行，只補新的資料） ======
function importLegacy() {
  const old = SpreadsheetApp.openById(prop_('LEGACY_SHEET_ID'));
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const pull = (name, keyFn) => {
      const src = old.getSheetByName(name); if (!src || src.getLastRow() < 2) return 0;
      const v = src.getDataRange().getValues(); v.shift();
      const dst = sheet_(name); const have = new Set(dst.getLastRow() > 1 ? rows_(name).map(keyFn) : []);
      const add = v.filter(r => r[0] !== '' && !have.has(keyFn(r))).map(r => r.slice(0, HEAD[name].length));
      if (add.length) dst.getRange(dst.getLastRow() + 1, 1, add.length, HEAD[name].length).setValues(add.map(r => { while (r.length < HEAD[name].length) r.push(''); return r; }));
      dirty_(name); return add.length;
    };
    const t = v => v instanceof Date ? v.getTime() : String(v);
    const n = {
      users: pull(SH.users, r => r[0]),
      sessions: pull(SH.sess, r => r[0]),
      responses: pull(SH.resp, r => [t(r[0]), r[1], r[2], r[3]].join('|')),
      feedback: pull(SH.fb, r => [t(r[0]), r[1], r[3]].join('|')),
    };
    Logger.log('已匯入：' + JSON.stringify(n));
    return n;
  } finally { lock.releaseLock(); }
}

// ====== 工具 ======
let __SS = null;
function ss_() { if (!__SS) { const id = prop_('SHEET_ID'); if (!id) throw new Error('尚未執行 setup'); __SS = SpreadsheetApp.openById(id); } return __SS; }
function sheet_(n) { return ss_().getSheetByName(n); }
const __ROWS = {};
function rows_(n) { if (!__ROWS[n]) { const sh = sheet_(n); const v = sh.getDataRange().getValues(); v.shift(); __ROWS[n] = v; } return __ROWS[n]; }
function dirty_(n) { delete __ROWS[n]; }
function paperName_(k) { return (META.papers.find(p => p.key === k) || {}).name || k; }
function bankName_(k) { return (META.banks.find(b => b.key === k) || {}).name || k; }
function bankOf_(k) { const b = META.banks.find(x => x.key === k); if (!b) throw new Error('沒有這個題庫'); return b; }
function hash_(salt, pw) { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + pw, Utilities.Charset.UTF_8)); }
function newToken_(uid, nick) { const t = Utilities.getUuid(); CacheService.getScriptCache().put('tok_' + t, JSON.stringify({ uid, nick }), TOKEN_HOURS * 3600); return t; }
function who_(token) {
  const c = CacheService.getScriptCache(); const v = token && c.get('tok_' + token);
  if (!v) throw new Error('登入已逾時，請重新登入');
  c.put('tok_' + token, v, TOKEN_HOURS * 3600);   // 有在使用就延長
  return JSON.parse(v);
}
let __IM = null, __KM = null, __GM = null;
function itemMap_() { if (!__IM) { __IM = {}; ITEMS.forEach(i => __IM[i.id] = i); } return __IM; }
function keyMap_() { if (!__KM) { __KM = {}; ITEMS.forEach(i => __KM[i.key] = i); } return __KM; }
function groupMap_() { if (!__GM) { __GM = {}; GROUPS.forEach(g => __GM[g.gid] = g); } return __GM; }
function shuffle_(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pub_(i, extra) { return Object.assign({ id: i.id, bank: i.bank, type: i.type, gid: i.gid, stem: i.stem, opts: i.opts, table: i.table, fig: i.fig, concept: META.concepts[i.concept] }, extra || {}); }
function pubGroups_(items) {
  const gm = groupMap_(); const used = {}; items.forEach(i => { if (i.gid) used[i.gid] = gm[i.gid]; });
  return Object.keys(used).map(k => ({ gid: k, theme: used[k].theme, stem: used[k].stem, table: used[k].table, fig: used[k].fig }));
}

// ====== 帳號（只有暱稱與密碼，不收集任何個資） ======
function register(nick, pw) {
  nick = String(nick || '').trim(); pw = String(pw || '');
  if (!/^[\w一-鿿]{2,16}$/.test(nick)) throw new Error('暱稱需 2～16 字，只能用中英文、數字或底線');
  if (pw.length < 4) throw new Error('密碼至少 4 個字元');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    dirty_(SH.users);
    if (rows_(SH.users).some(r => String(r[1]).toLowerCase() === nick.toLowerCase())) throw new Error('這個暱稱已有人使用，請換一個');
    const uid = 'u' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    const salt = Utilities.getUuid();
    sheet_(SH.users).appendRow([uid, nick, salt, hash_(salt, pw), new Date(), new Date()]);
    return { token: newToken_(uid, nick), nickname: nick };
  } finally { lock.releaseLock(); }
}
function login(nick, pw) {
  nick = String(nick || '').trim();
  const sh = sheet_(SH.users); const v = sh.getDataRange().getValues();
  for (let r = 1; r < v.length; r++) {
    if (String(v[r][1]).toLowerCase() === nick.toLowerCase()) {
      if (hash_(v[r][2], String(pw || '')) !== v[r][3]) break;
      sh.getRange(r + 1, 6).setValue(new Date());
      return { token: newToken_(v[r][0], v[r][1]), nickname: v[r][1] };
    }
  }
  throw new Error('暱稱或密碼錯誤');
}

// ====== 學生端：題庫資訊 ======
function getMeta() {
  const cnt = {};
  ITEMS.forEach(i => { const k = i.paper + '|' + i.concept; cnt[k] = (cnt[k] || 0) + 1; });
  return { banks: META.banks, scales: META.scales, concepts: META.concepts, conceptBank: META.conceptBank, papers: META.papers, counts: cnt, total: ITEMS.length, changelog: CHANGELOG };
}
const CHANGELOG = [
  { d: '2026-11-25', t: ['新增「電磁學」題庫 78 題（選修物理Ⅳ），和波動與光學同屬選修的能力估計。'] },
  { d: '2026-11-24', t: ['練習系統搬到 Gavin Physics 網站，原本的帳號與作答紀錄都已移過來。',
    '新增「學測必修複習」106 題與「波動與光學」107 題，練習前先選題庫。',
    '在學測、波動光學網頁裡登入後，節點檢核題的作答也會記錄，並收進錯題本。',
    '必修與選修分開估計能力，學習報告可切換。'] },
  { d: '2026-11-04', t: ['新增「錯題本」：自動收錄你答錯的題目，可以看詳解，也可以只重練錯題，答對後標為「已訂正」。',
    '新增第 14 主題「國際單位制：基本單位與導出單位」60 題。', '學習報告新增能力雷達圖。'] },
  { d: '2026-11-02', t: ['學習報告改用常態分布圖，顯示「100 人中你大約贏過幾人」。', '能力估計改為：有新的作答時，每小時自動更新一次。'] },
  { d: '2026-11-01', t: ['每題加上詳解，交卷後可以看到每個錯誤選項為什麼錯。', '新增「⚑ 回報這題有問題」。'] },
];

// ====== 學生端：作答進度 ======
function myLast_(uid) {   // 每題最後一次作答的對錯與統計（Responses 依時間順序寫入）
  const st = {};
  rows_(SH.resp).forEach(r => {
    if (r[2] !== uid) return; const id = Number(r[3]);
    const o = st[id] = st[id] || { n: 0, wrong: 0 }; o.n++; const ok = Number(r[5]) === 1; if (!ok) o.wrong++;
    o.last = ok ? 1 : 0; o.resp = String(r[4] || ''); o.at = r[0];
  });
  return st;
}
function getProgress(token, bank) {
  const me = who_(token); const im = itemMap_(); const st = myLast_(me.uid);
  const inBank = i => !bank || i.bank === bank;
  const ids = Object.keys(st).map(Number).filter(id => im[id] && inBank(im[id]));
  const byConcept = META.concepts.map(() => ({ total: 0, done: 0 }));
  ITEMS.filter(inBank).forEach(i => byConcept[i.concept].total++); ids.forEach(id => byConcept[im[id].concept].done++);
  return { total: ITEMS.filter(inBank).length, answered: ids.length, wrong: ids.filter(id => st[id].last === 0).length,
    fixed: ids.filter(id => st[id].wrong > 0 && st[id].last === 1).length, byConcept };
}

// ====== 學生端：錯題本 ======
function getWrongBook(token, bank) {
  const me = who_(token); const im = itemMap_(); const st = myLast_(me.uid);
  const list = Object.keys(st).map(Number).filter(id => im[id] && st[id].wrong > 0 && (!bank || im[id].bank === bank)).map(id => {
    const i = im[id], o = st[id];
    return pub_(i, { concept: i.concept, ans: i.ans, exp: i.exp || null, tries: o.n, wrong: o.wrong, fixed: o.last === 1, resp: o.resp, at: o.at });
  });
  list.sort((a, b) => (a.fixed - b.fixed) || (new Date(b.at) - new Date(a.at)));
  return JSON.parse(JSON.stringify({ items: list, groups: pubGroups_(list.map(x => im[x.id])) }));
}
function startWrong_(me, opt) {   // 只抽「最後一次仍答錯」的題目重練，不加錨題
  const st = myLast_(me.uid);
  const concepts = (opt.concepts && opt.concepts.length) ? opt.concepts.map(Number) : null;
  const n = Math.min(Math.max(Number(opt.n) || 10, 1), 30);
  const pool = shuffle_(ITEMS.filter(i => st[i.id] && st[i.id].last === 0 && (!opt.bank || i.bank === opt.bank) && (!concepts || concepts.indexOf(i.concept) >= 0))).slice(0, n);
  const units = {}, order = []; pool.forEach(i => { const k = i.gid || ('I' + i.id); if (!units[k]) { units[k] = []; order.push(k); } units[k].push(i); });
  const chosen = []; order.forEach(k => chosen.push(...units[k].sort((a, b) => a.id - b.id)));
  const sid = 's' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  if (chosen.length) sheet_(SH.sess).appendRow([sid, me.uid, new Date(), '', JSON.stringify({ mode: 'wrong', bank: opt.bank || '', concepts: concepts || [], n }), JSON.stringify(chosen.map(i => i.id)), '', '']);
  return { sessionId: sid, mode: 'wrong', items: chosen.map(i => pub_(i, { anchor: false })), groups: pubGroups_(chosen) };
}

// ====== 學生端：開始練習（隨機抽題） ======
function startSession(token, opt) {
  const me = who_(token); opt = opt || {};
  if (opt.mode === 'wrong') return startWrong_(me, opt);
  const bank = bankOf_(opt.bank || 'confuse');
  const bankPapers = META.papers.filter(p => p.bank === bank.key).map(p => p.key);
  const papers = (opt.papers && opt.papers.length) ? opt.papers.filter(p => bankPapers.indexOf(p) >= 0) : bankPapers;
  const bankConcepts = META.concepts.map((_, i) => i).filter(i => META.conceptBank[i] === bank.key);
  const concepts = (opt.concepts && opt.concepts.length) ? opt.concepts.map(Number).filter(i => bankConcepts.indexOf(i) >= 0) : bankConcepts;
  const n = Math.min(Math.max(Number(opt.n) || 10, 5), 30);
  const done = {}; rows_(SH.resp).forEach(r => { if (r[2] === me.uid) done[r[3]] = true; });

  // 以「單元」抽題：獨立題為 1 題、題組為整組；優先抽未作答過的
  const pool = ITEMS.filter(i => i.bank === bank.key && papers.indexOf(i.paper) >= 0 && concepts.indexOf(i.concept) >= 0);
  const units = {}; pool.forEach(i => { const k = i.gid || ('I' + i.id); (units[k] = units[k] || []).push(i); });
  const list = Object.keys(units).map(k => ({ k, items: units[k], fresh: units[k].some(i => !done[i.id]) }));
  shuffle_(list); list.sort((a, b) => (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0));
  const chosen = []; let count = 0;
  for (const u of list) { if (count >= n) break; if (count + u.items.length > n + 2 && count > 0) continue; chosen.push(...u.items); count += u.items.length; }

  // 錨題：同一量尺的共同題，連結不同學生的作答；優先選同概念
  const ids = new Set(chosen.map(i => i.id)); const added = new Set();
  const anchorsAll = ITEMS.filter(i => i.anchor && !i.gid && i.scale === bank.scale && !ids.has(i.id));
  let anchors = anchorsAll.filter(i => concepts.indexOf(i.concept) >= 0); if (!anchors.length) anchors = anchorsAll;
  shuffle_(anchors).slice(0, ANCHORS_PER_SESSION).forEach(i => { chosen.push(i); ids.add(i.id); added.add(i.id); });

  const sid = 's' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  sheet_(SH.sess).appendRow([sid, me.uid, new Date(), '', JSON.stringify({ bank: bank.key, papers, concepts, n }), JSON.stringify(chosen.map(i => i.id)), '', '']);
  return { sessionId: sid, items: chosen.map(i => pub_(i, { anchor: added.has(i.id) })), groups: pubGroups_(chosen) };
}

/** 附圖：回傳 data URI（免公開分享雲端硬碟） */
function getFigure(name) {
  const map = JSON.parse(PropertiesService.getScriptProperties().getProperty('FIG_MAP') || '{}');
  if (!map[name]) return null;
  const c = CacheService.getScriptCache(); const hit = c.get('fig_' + name); if (hit) return hit;
  const uri = 'data:image/png;base64,' + Utilities.base64Encode(DriveApp.getFileById(map[name]).getBlob().getBytes());
  if (uri.length < 95000) c.put('fig_' + name, uri, 21600);
  return uri;
}

// ====== 計分 ======
function scoreItem_(item, resp) {
  resp = String(resp || '').toUpperCase().split('').filter(c => 'ABCDE'.indexOf(c) >= 0).sort().join('');
  const ans = item.ans.split('').sort().join('');
  if (item.type === 'S') { const ok = resp === ans ? 1 : 0; return { resp, correct: ok, partial: ok }; }
  // 多選：全對 1；以「錯幾個選項」給部分分（錯 1 個 0.6、錯 2 個 0.2），未作答 0
  if (!resp) return { resp, correct: 0, partial: 0 };
  let wrong = 0; 'ABCDE'.split('').forEach(c => { if ((resp.indexOf(c) >= 0) !== (ans.indexOf(c) >= 0)) wrong++; });
  return { resp, correct: wrong === 0 ? 1 : 0, partial: wrong === 0 ? 1 : wrong === 1 ? 0.6 : wrong === 2 ? 0.2 : 0 };
}
function submitSession(token, sessionId, answers, seconds) {
  const me = who_(token);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ss = sheet_(SH.sess); const cell = ss.getRange('A:A').createTextFinder(sessionId).matchEntireCell(true).findNext();
    if (!cell) throw new Error('找不到這次練習');
    const row = ss.getRange(cell.getRow(), 1, 1, HEAD.Sessions.length).getValues()[0];
    if (row[1] !== me.uid) throw new Error('無權限');
    if (row[3]) throw new Error('這次練習已經交卷');
    const ids = JSON.parse(row[5]); const im = itemMap_();
    const prior = {}; rows_(SH.resp).forEach(r => { if (r[2] === me.uid) prior[r[3]] = (prior[r[3]] || 0) + 1; });
    const now = new Date(); const out = []; const recs = []; let score = 0;
    ids.forEach(id => {
      const it = im[id]; if (!it) return; const s = scoreItem_(it, answers && answers[id]);
      recs.push([now, sessionId, me.uid, id, s.resp, s.correct, s.partial, Number(seconds && seconds[id]) || '', (prior[id] || 0) + 1]);
      score += s.partial;
      out.push({ id, response: s.resp, answer: it.ans, correct: s.correct, partial: s.partial, exp: it.exp || null });
    });
    const rs = sheet_(SH.resp); if (recs.length) rs.getRange(rs.getLastRow() + 1, 1, recs.length, recs[0].length).setValues(recs); dirty_(SH.resp);
    ss.getRange(cell.getRow(), 4).setValue(now); ss.getRange(cell.getRow(), 7, 1, 2).setValues([[Math.round(score * 10) / 10, out.length]]);
    return { score: Math.round(score * 10) / 10, total: out.length, results: out };
  } finally { lock.releaseLock(); }
}

// ====== 網站頁面內的檢核題：登入後逐題記錄 ======
function logResponse(token, key, resp, seconds, source) {
  const me = who_(token);
  const it = keyMap_()[String(key || '')]; if (!it) return { recorded: false, reason: '題目不在線上題庫' };
  const s = scoreItem_(it, resp);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const prior = rows_(SH.resp).filter(r => r[2] === me.uid && Number(r[3]) === it.id).length;
    const sid = 'page:' + String(source || it.bank).slice(0, 40);
    sheet_(SH.resp).appendRow([new Date(), sid, me.uid, it.id, s.resp, s.correct, s.partial, Number(seconds) || '', prior + 1]);
    dirty_(SH.resp);
    return { recorded: true, itemId: it.id, correct: s.correct, attempt: prior + 1, first: prior === 0 };
  } finally { lock.releaseLock(); }
}
/** 頁面載入時取得自己在該題庫的作答狀態（用來標示已作答／錯題） */
function getPageHistory(token, bank) {
  const me = who_(token); const im = itemMap_(); const st = myLast_(me.uid); const out = {};
  Object.keys(st).forEach(id => { const it = im[id]; if (it && (!bank || it.bank === bank)) out[it.key] = { n: st[id].n, last: st[id].last, wrong: st[id].wrong }; });
  return out;
}

// ====== 學生端：個人學習報告（依量尺） ======
function getMyReport(token, scale) {
  const me = who_(token); scale = scale || 'req';
  const im = itemMap_(); const irt = irtLookup_(scale);
  const first = {};   // 每題只採第一次作答，避免重複練習的記憶效果
  rows_(SH.resp).forEach(r => { const it = im[r[3]]; if (r[2] === me.uid && it && it.scale === scale && !(r[3] in first)) first[r[3]] = Number(r[5]); });
  const ids = Object.keys(first).map(Number);
  const person = irt.persons[me.uid]; const theta = person ? person.theta : null;
  const inScale = META.banks.filter(b => b.scale === scale).map(b => b.key);
  const conceptNames = META.concepts.filter((_, i) => inScale.indexOf(META.conceptBank[i]) >= 0);
  const blooms = ['記憶', '理解', '應用', '分析'];
  const dims = { concept: {}, ability: {}, bloom: {} };
  ids.forEach(id => {
    const it = im[id]; const x = first[id];
    const b = irt.items[id] ? irt.items[id].b : null;
    const p = (theta != null && b != null) ? 1 / (1 + Math.exp(-(theta - b))) : null;
    [['concept', META.concepts[it.concept]], ['ability', META.abilities[it.ab]], ['bloom', it.bloom]].forEach(([d, k]) => {
      if (!k) return; const o = dims[d][k] = dims[d][k] || { n: 0, correct: 0, resid: 0, nr: 0 };
      o.n++; o.correct += x; if (p != null) { o.resid += x - p; o.nr++; }
    });
  });
  const fmtAll = (obj, names) => names.map(k => obj[k] ? { name: k, n: obj[k].n, rate: obj[k].correct / obj[k].n, index: obj[k].nr ? obj[k].resid / obj[k].nr : null } : { name: k, n: 0, rate: null, index: null });
  const sessions = rows_(SH.sess).filter(r => r[1] === me.uid && r[3]).map(r => ({ at: r[3], score: r[6], total: r[7] }));
  let rank = null;
  if (theta != null) {
    const ts = Object.values(irt.persons).map(o => o.theta).filter(v => isFinite(v)); const n = ts.length;
    const mean = ts.reduce((a, v) => a + v, 0) / n, sd = n > 2 ? Math.sqrt(ts.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 0;
    const S = sd > 0.05 ? sd : 1, se = person.se || 0;
    const pct = t => Math.round(100 * phi_((t - mean) / S));
    rank = { n, z: (theta - mean) / S, zLo: (theta - se - mean) / S, zHi: (theta + se - mean) / S, pct: pct(theta), lo: pct(theta - se), hi: pct(theta + se) };
  }
  const radar = radar_(ids.map(id => ({ it: im[id], x: first[id], b: irt.items[id] ? irt.items[id].b : 0 })), irt, blooms);
  return JSON.parse(JSON.stringify({ scale, radar,
    nickname: me.nick, answered: ids.length, correct: ids.reduce((s, id) => s + first[id], 0), rank,
    theta, se: person ? person.se : null, tscore: theta != null ? Math.round(50 + 10 * theta) : null,
    lastRun: PropertiesService.getScriptProperties().getProperty('IRT_LAST_RUN'),
    concept: fmtAll(dims.concept, conceptNames),
    ability: fmtAll(dims.ability, Object.keys(META.abilities).map(k => META.abilities[k])), bloom: fmtAll(dims.bloom, blooms), sessions: sessions.slice(-20),
  }));
}
// 能力雷達圖：各向度以 Rasch（MAP，先驗 N(0,1)）考慮題目難度估計能力，再與全體比較換算 G1（5 分）～G5（1 分）
const RADAR_MIN = 3;
const THINK = ['ti', 'tr', 'tc', 'tm'], SOLVE = ['po', 'pe', 'pa', 'pc'];
function domainTheta_(xs) {
  let t = 0;
  for (let k = 0; k < 30; k++) {
    let g = -t, h = -1;
    xs.forEach(o => { const p = 1 / (1 + Math.exp(-(t - o.b))); g += o.x - p; h -= p * (1 - p); });
    const step = g / h; t -= step; if (Math.abs(step) < 1e-4) break;
  }
  return Math.max(-4, Math.min(4, t));
}
function radar_(rows, irt, blooms) {
  const ts = Object.values(irt.persons).map(o => o.theta).filter(v => isFinite(v)); const n = ts.length;
  const mean = n ? ts.reduce((a, v) => a + v, 0) / n : 0;
  const sd = n > 2 ? Math.sqrt(ts.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 1; const S = sd > 0.05 ? sd : 1;
  const axis = (name, f) => {
    const xs = rows.filter(r => f(r.it)).map(r => ({ x: r.x, b: Number(r.b) || 0 }));
    if (xs.length < RADAR_MIN) return { name, n: xs.length, g: null, score: null };
    const z = (domainTheta_(xs) - mean) / S;
    const g = z >= 1 ? 1 : z >= 0.3 ? 2 : z >= -0.3 ? 3 : z >= -1 ? 4 : 5;
    return { name, n: xs.length, g, score: 6 - g, rate: xs.reduce((a, o) => a + o.x, 0) / xs.length };
  };
  return {
    min: RADAR_MIN,
    main: blooms.map(b => axis(b, it => it.bloom === b)).concat([axis('思考智能', it => THINK.indexOf(it.ab) >= 0), axis('問題解決', it => SOLVE.indexOf(it.ab) >= 0)]),
    sub: THINK.concat(SOLVE).map(k => axis(META.abilities[k], it => it.ab === k)),
  };
}

// ====== 題目錯誤回報：寫入 Feedback 工作表並寄信通知老師 ======
function reportIssue(token, itemId, kind, text) {
  const me = who_(token);
  itemId = Number(itemId); const it = itemMap_()[itemId]; if (!it) throw new Error('找不到這一題');
  kind = String(kind || '').slice(0, 20); text = String(text || '').trim().slice(0, 500);
  if (!kind) throw new Error('請選擇問題類型');
  const c = CacheService.getScriptCache(); const k = 'fb_' + me.uid; const n = Number(c.get(k) || 0);
  if (n >= 10) throw new Error('一小時內回報次數太多，請稍後再試'); c.put(k, String(n + 1), 3600);
  const safe = v => /^[=+\-@]/.test(String(v)) ? "'" + v : v;   // 避免被試算表當成公式
  const concept = META.concepts[it.concept];
  sheet_(SH.fb).appendRow([new Date(), me.uid, safe(me.nick), itemId, bankName_(it.bank) + '／' + paperName_(it.paper), it.pno, concept, kind, safe(text), '未處理']);
  const g = it.gid ? groupMap_()[it.gid] : null; const L = 'ABCDE';
  const body = ['學生回報了一則題目問題。', '', '問題類型：' + kind, '說明：' + (text || '（未填寫）'), '回報者暱稱：' + me.nick, '',
    '題庫編號：' + itemId + '　' + bankName_(it.bank) + '／' + paperName_(it.paper) + ' 第 ' + it.pno + ' 題　概念：' + concept,
    g ? '題組情境：' + g.stem : '', '題目：' + it.stem, ...it.opts.map((o, j) => '(' + L[j] + ') ' + o), '答案：' + it.ans, '',
    '所有回報都記錄在資料試算表的「Feedback」工作表：https://docs.google.com/spreadsheets/d/' + prop_('SHEET_ID')].join('\n');
  try { MailApp.sendEmail({ to: FEEDBACK_TO, subject: '【題目回報】' + kind + '｜題庫編號 ' + itemId + '（' + concept + '）', body }); }
  catch (e) { Logger.log('寄信失敗：' + e); }
  return { ok: true };
}
function testFeedbackMail() {
  MailApp.sendEmail(FEEDBACK_TO, '【題目回報】寄信功能測試', 'Gavin Physics 練習系統的題目回報功能已可寄信。');
  Logger.log('已寄出測試信到 ' + FEEDBACK_TO + '，今日剩餘寄信額度：' + MailApp.getRemainingDailyQuota());
}

/** 標準常態累積機率 Φ(z)（Abramowitz–Stegun 近似，誤差 < 1e-7） */
function phi_(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989422804 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
