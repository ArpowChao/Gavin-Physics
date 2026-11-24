/****************************************************************
 * Gavin Physics 線上練習系統（Google Apps Script・JSON API）
 * 網站 https://arpowchao.github.io/Gavin-Physics/practice/ 以 POST 呼叫本程式
 *   body = {"fn": "函式名稱", "args": [...]}   回應 = {"ok": true, "data": ...} 或 {"ok": false, "error": "..."}
 * 學生端：暱稱＋密碼註冊（不收集個資）；題庫分「易混淆概念／學測必修複習／波動與光學」
 * 教師端：以管理金鑰呼叫 admin* 函式
 * 第一次使用：依序執行 setup → importLegacy → installHourlyTrigger，再部署為網頁應用程式
 ****************************************************************/

// ====== 設定（請用 configureProperties() 將實際 ID 與信箱存進指令碼屬性，勿提交到公開程式碼） ======
const DEFAULTS = {
  FIG_FOLDER_ID: '',
  LEGACY_SHEET_ID: '',
  BANK_FILE_ID: '',
  FEEDBACK_TO: '',
};
const ANCHORS_PER_SESSION = 2;      // 每次練習加入的錨題數（同一量尺）
const TOKEN_HOURS = 6;              // 登入閒置多久後失效（每次呼叫都會延長）

const SH = { users: 'Users', sess: 'Sessions', resp: 'Responses', items: 'Items', irtI: 'IRT_Items', irtP: 'IRT_Persons', mastery: 'IRT_Mastery', fb: 'Feedback' };
const HEAD = {
  Users: ['userId', 'nickname', 'salt', 'hash', 'createdAt', 'lastLogin', 'classCode'],
  Sessions: ['sessionId', 'userId', 'startedAt', 'finishedAt', 'mode', 'itemIds', 'score', 'total'],
  Responses: ['timestamp', 'sessionId', 'userId', 'itemId', 'response', 'correct', 'partial', 'seconds', 'attempt'],
  Items: ['itemId', 'bank', 'scale', 'paper', 'pno', 'concept', 'ability', 'bloom', 'type', 'answer', 'anchor', 'groupId', 'section', 'focus', 'key'],
  Feedback: ['timestamp', 'userId', 'nickname', 'itemId', 'paper', 'pno', 'concept', 'kind', 'text', 'status'],
};

function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || DEFAULTS[k] || ''; }

/** 第一次部署前，於 Apps Script 編輯器填入實際雲端 ID 與通知信箱並手動執行一次 */
function configureProperties() {
  PropertiesService.getScriptProperties().setProperties({
    FIG_FOLDER_ID: '',
    LEGACY_SHEET_ID: '',
    BANK_FILE_ID: '',
    FEEDBACK_TO: '',
  });
  Logger.log('ScriptProperties 已更新');
}

// ====== 網頁入口 ======
// 以函式回傳，避免各 .gs 檔載入順序造成未定義
function api_() { return {
  ping: () => ({ ok: true, time: new Date().toISOString() }),
  register, login, updateClass, getMeta, getProgress, getWrongBook, startSession, submitSession, getMyReport, reportIssue, getFigure, logResponse, getPageHistory,
  adminLogin, adminRunIRT, adminOverview, adminItemDetail, adminStudentDetail, adminResetPassword,
}; }
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.fn === 'ping') return handle_('ping', []);
  if (p.fn) return json_({ ok: false, error: '請改用 POST 呼叫 API' });
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
  if (!props.getProperty('ADMIN_KEY')) props.setProperty('ADMIN_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 16));
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
  const props = PropertiesService.getScriptProperties(); const want = DEFAULTS.BANK_FILE_ID || props.getProperty('BANK_FILE_ID');
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

// ====== 帳號（只有暱稱與密碼，不收集任何個資；班級代碼選填） ======
function rateLimit_(key, max, sec) {
  const c = CacheService.getScriptCache();
  const n = Number(c.get(key) || 0);
  if (n >= max) throw new Error('嘗試次數過多，請稍後再試');
  return {
    fail() { c.put(key, String(n + 1), sec); },
    clear() { c.remove(key); },
  };
}
function cleanClass_(c) {
  const s = String(c == null ? '' : c).trim();
  if (!/^[\w\u4e00-\u9fff\-]{0,12}$/.test(s)) throw new Error('班級代碼限 12 字以內，只能用中英文、數字、底線或連字號');
  return s;
}
function ensureUsersClassCol_(sh) {
  if (sh.getLastColumn() < 7 || String(sh.getRange(1, 7).getValue() || '').trim() !== 'classCode') {
    sh.getRange(1, 7).setValue('classCode').setFontWeight('bold');
  }
}
function register(nick, pw, classCode) {
  nick = String(nick || '').trim(); pw = String(pw || '');
  if (!/^[\w一-鿿]{2,16}$/.test(nick)) throw new Error('暱稱需 2～16 字，只能用中英文、數字或底線');
  if (pw.length < 4) throw new Error('密碼至少 4 個字元');
  const cc = cleanClass_(classCode);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    dirty_(SH.users);
    if (rows_(SH.users).some(r => String(r[1]).toLowerCase() === nick.toLowerCase())) throw new Error('這個暱稱已有人使用，請換一個');
    const uid = 'u' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    const salt = Utilities.getUuid();
    const sh = sheet_(SH.users);
    ensureUsersClassCol_(sh);
    sh.appendRow([uid, nick, salt, hash_(salt, pw), new Date(), new Date(), cc]);
    dirty_(SH.users);
    return { token: newToken_(uid, nick), nickname: nick, classCode: cc };
  } finally { lock.releaseLock(); }
}
function login(nick, pw) {
  nick = String(nick || '').trim();
  const rl = rateLimit_('rl_login_' + nick.toLowerCase(), 10, 900);
  const sh = sheet_(SH.users); const v = sh.getDataRange().getValues();
  for (let r = 1; r < v.length; r++) {
    if (String(v[r][1]).toLowerCase() === nick.toLowerCase()) {
      if (hash_(v[r][2], String(pw || '')) !== v[r][3]) break;
      rl.clear();
      sh.getRange(r + 1, 6).setValue(new Date());
      return { token: newToken_(v[r][0], v[r][1]), nickname: v[r][1], classCode: String(v[r][6] || '') };
    }
  }
  rl.fail();
  throw new Error('暱稱或密碼錯誤');
}
function updateClass(token, classCode) {
  const me = who_(token);
  const cc = cleanClass_(classCode);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(SH.users);
    ensureUsersClassCol_(sh);
    const v = sh.getDataRange().getValues();
    for (let r = 1; r < v.length; r++) {
      if (v[r][0] === me.uid) {
        sh.getRange(r + 1, 7).setValue(cc);
        dirty_(SH.users);
        return { classCode: cc };
      }
    }
    throw new Error('找不到帳號');
  } finally { lock.releaseLock(); }
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
  const to = prop_('FEEDBACK_TO');
  if (to) {
    try { MailApp.sendEmail({ to, subject: '【題目回報】' + kind + '｜題庫編號 ' + itemId + '（' + concept + '）', body }); }
    catch (e) { Logger.log('寄信失敗：' + e); }
  }
  return { ok: true };
}
function testFeedbackMail() {
  const to = prop_('FEEDBACK_TO');
  if (!to) throw new Error('尚未設定 FEEDBACK_TO（請先執行 configureProperties）');
  MailApp.sendEmail(to, '【題目回報】寄信功能測試', 'Gavin Physics 練習系統的題目回報功能已可寄信。');
  Logger.log('已寄出測試信到 ' + to + '，今日剩餘寄信額度：' + MailApp.getRemainingDailyQuota());
}

/** 標準常態累積機率 Φ(z)（Abramowitz–Stegun 近似，誤差 < 1e-7） */
function phi_(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989422804 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
