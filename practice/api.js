/*
 * Gavin Physics 線上練習 API（全站共用）
 *   PhyAPI.call('函式', 參數...) → Promise
 *   PhyAPI.user() → { token, nick } 或 null
 * 後端為 Google Apps Script 網頁應用程式，網址設定在 practice/config.js
 */
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const K_TOKEN = 'gp_token', K_NICK = 'gp_nick';
  const listeners = [];
  const PhyAPI = {
    url() { return (store.get('gp_api') || window.PHY_API_URL || '').trim(); },
    ready() { return !!PhyAPI.url(); },
    user() { const t = store.get(K_TOKEN); return t ? { token: t, nick: store.get(K_NICK) || '' } : null; },
    setUser(token, nick) { store.set(K_TOKEN, token); store.set(K_NICK, nick); listeners.forEach(f => f(PhyAPI.user())); },
    logout() { store.del(K_TOKEN); store.del(K_NICK); listeners.forEach(f => f(null)); },
    onChange(f) { listeners.push(f); },
    async call(fn, ...args) {
      const url = PhyAPI.url();
      if (!url) throw new Error('線上練習尚未設定後端網址');
      let res;
      try { res = await fetch(url, { method: 'POST', body: JSON.stringify({ fn, args }), redirect: 'follow' }); }
      catch (e) { throw new Error('連線失敗，請確認網路後再試一次'); }
      let j; try { j = await res.json(); } catch (e) { throw new Error('伺服器回應格式錯誤'); }
      if (!j.ok) {
        if (String(j.error).indexOf('逾時') >= 0) PhyAPI.logout();
        throw new Error(j.error);
      }
      return j.data;
    },
    // 需要登入的呼叫：自動帶入 token
    async callAuth(fn, ...args) { const u = PhyAPI.user(); if (!u) throw new Error('請先登入'); return PhyAPI.call(fn, u.token, ...args); },
  };
  window.addEventListener('storage', e => { if (e.key === K_TOKEN) listeners.forEach(f => f(PhyAPI.user())); });
  window.PhyAPI = PhyAPI;
})();
