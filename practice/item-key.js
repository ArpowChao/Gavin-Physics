/*
 * 題目雜湊鍵：網站頁面與題庫產生器共用，用來把頁內題目對應到線上題庫的題號。
 * 鍵 = 題庫代碼 + ':' + FNV-1a(節點 + '|' + 正規化後的題幹)
 */
(function (root) {
  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function itemKey(bank, node, stem) {
    const s = String(stem || '').replace(/\s+/g, ' ').trim();
    return bank + ':' + fnv1a(String(node || '') + '|' + s);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { itemKey };
  else root.PhyItemKey = { itemKey };
})(this);
