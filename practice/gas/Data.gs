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
