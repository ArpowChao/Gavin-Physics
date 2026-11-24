/*
 * Gavin Physics 全站共用：導覽列＋線上練習登入狀態＋網頁檢核題作答紀錄
 * 用法：<script src="（相對路徑）/assets/site.js" defer></script>
 * 有 #sidebar 的大型教材頁（學測、波動光學）會把導覽放進側欄頂端，其他頁面放在最上方。
 */
(function () {
  if (window.__GP_SITE__) return; window.__GP_SITE__ = true;
  const me = document.currentScript || [...document.scripts].find(s => /assets\/site\.js(\?|$)/.test(s.src));
  const ROOT = me ? me.src.replace(/assets\/site\.js(\?.*)?$/, '') : '/';
  const here = location.href;
  const NAV = [
    ['', '首頁'], ['gsat/', '必修・學測'], ['wave-optics/', '選修・波動光學'], ['apps/', '實驗室'], ['practice/', '線上練習'],
  ];
  const active = p => p && here.indexOf(ROOT + p) === 0 || (!p && here.replace(/index\.html$/, '') === ROOT);

  const css = `
  .gp-bar{font:14px/1.4 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;background:#13263a;color:#e8eef6;z-index:50;position:relative}
  .gp-bar a{color:inherit;text-decoration:none}
  .gp-bar .gp-in{max-width:1180px;margin:0 auto;padding:8px 16px;display:flex;align-items:center;gap:6px 14px;flex-wrap:wrap}
  .gp-bar .gp-brand{font-weight:700;letter-spacing:.02em;margin-right:6px;white-space:nowrap}
  .gp-bar .gp-links{display:flex;gap:2px 4px;flex-wrap:wrap;flex:1}
  .gp-bar .gp-links a{padding:4px 9px;border-radius:7px;opacity:.82;white-space:nowrap}
  .gp-bar .gp-links a:hover,.gp-bar .gp-links a:focus-visible{opacity:1;background:rgba(255,255,255,.1);outline:none}
  .gp-bar .gp-links a.on{opacity:1;background:rgba(255,255,255,.16);font-weight:600}
  .gp-bar .gp-user{white-space:nowrap;font-size:13px;padding:4px 10px;border:1px solid rgba(255,255,255,.28);border-radius:999px}
  .gp-bar .gp-user:hover{background:rgba(255,255,255,.1)}
  .gp-side{margin:0 0 10px;padding:10px 12px 12px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.14)}
  .gp-side .gp-in{padding:0;display:block}
  .gp-side .gp-brand{display:block;font-size:12px;opacity:.75;margin-bottom:6px}
  .gp-side .gp-links{gap:4px}
  .gp-side .gp-links a{font-size:12.5px;padding:3px 8px;background:rgba(255,255,255,.06)}
  .gp-side .gp-user{display:inline-block;margin-top:8px}
  .gp-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#13263a;color:#fff;padding:9px 16px;border-radius:10px;font:14px/1.4 "Noto Sans TC",system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);z-index:10000;opacity:0;transition:opacity .25s;pointer-events:none;max-width:90vw}
  .gp-toast.show{opacity:1;pointer-events:auto}.gp-toast a{color:#9cc3ff}
  .gp-pill{position:fixed;left:10px;bottom:10px;z-index:9000;font:12.5px/1.3 "Noto Sans TC",system-ui,sans-serif;background:rgba(19,38,58,.82);color:#fff;border-radius:999px;padding:6px 12px;text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.2);opacity:.8;backdrop-filter:blur(4px)}
  .gp-pill:hover,.gp-pill:focus-visible{opacity:1}
  @media print{.gp-bar,.gp-toast,.gp-pill{display:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function bar(side) {
    const el = document.createElement(side ? 'div' : 'nav');
    el.className = side ? 'gp-bar gp-side' : 'gp-bar';
    el.setAttribute('aria-label', '全站導覽');
    el.innerHTML = '<div class="gp-in"><a class="gp-brand" href="' + ROOT + '">Gavin Physics</a><div class="gp-links">' +
      NAV.map(([p, t]) => '<a href="' + ROOT + p + '"' + (active(p) ? ' class="on" aria-current="page"' : '') + '>' + t + '</a>').join('') +
      '</div><a class="gp-user" id="gp-user" href="' + ROOT + 'practice/">登入練習帳號</a></div>';
    return el;
  }
  function mount() {
    if (me && me.dataset.mode === 'pill') {   // 全螢幕互動實驗：只放一顆小按鈕，不擠壓版面
      const a = document.createElement('a'); a.className = 'gp-pill'; a.href = ROOT + 'apps/'; a.textContent = '◂ Gavin Physics 實驗室';
      document.body.appendChild(a); return;
    }
    const sideBrand = document.querySelector('#sidebar .sidebar-brand');
    if (sideBrand) sideBrand.parentNode.insertBefore(bar(true), sideBrand);
    else document.body.insertBefore(bar(false), document.body.firstChild);
    loadApi().then(refreshUser);
  }

  // ---------- 線上練習 API ----------
  function load(src) { return new Promise(ok => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ok; document.head.appendChild(s); }); }
  let apiP = null;
  function loadApi() {
    if (!apiP) apiP = (async () => {
      if (!('PHY_API_URL' in window)) await load(ROOT + 'practice/config.js');
      if (!window.PhyAPI) await load(ROOT + 'practice/api.js');
      if (!window.PhyItemKey) await load(ROOT + 'practice/item-key.js');
      if (window.PhyAPI) PhyAPI.onChange(refreshUser);
    })();
    return apiP;
  }
  function refreshUser() {
    const a = document.getElementById('gp-user'); if (!a || !window.PhyAPI) return;
    const u = PhyAPI.user();
    if (!PhyAPI.ready()) { a.style.display = 'none'; return; }
    a.style.display = '';
    if (u) { a.textContent = '👤 ' + u.nick; a.href = ROOT + 'practice/'; a.title = '已登入，網頁裡的檢核題作答會記錄到線上練習'; }
    else { a.textContent = '登入練習帳號'; a.href = ROOT + 'practice/?back=' + encodeURIComponent(location.pathname + location.search + location.hash); a.title = '登入後，網頁裡的檢核題作答也會記錄'; }
  }
  let toastT = null;
  function toast(html, ms) {
    let t = document.querySelector('.gp-toast'); if (!t) { t = document.createElement('div'); t.className = 'gp-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 2600);
  }

  /**
   * 網頁檢核題作答紀錄（學測、波動光學頁面呼叫）
   * bank: 'gsat' | 'wave'；resp: 選項字母，如 'BD'
   */
  let warned = false;
  window.GPRecord = async function (bank, node, stem, resp, source) {
    try {
      await loadApi();
      if (!window.PhyAPI || !PhyAPI.ready() || !window.PhyItemKey) return;
      const u = PhyAPI.user();
      if (!u) {
        if (!warned) { warned = true; toast('想讓作答算進學習報告？<a href="' + ROOT + 'practice/?back=' + encodeURIComponent(location.pathname + location.hash) + '">登入練習帳號</a>', 4200); }
        return;
      }
      const key = PhyItemKey.itemKey(bank, node, stem);
      const r = await PhyAPI.call('logResponse', u.token, key, resp, '', source || bank);
      if (r && r.recorded) toast(r.first ? '✔ 已記錄到線上練習（第一次作答會算進能力估計）' : '✔ 已記錄（重做不影響能力估計）', 2200);
    } catch (e) {
      if (String(e.message).indexOf('逾時') >= 0) { toast('登入已逾時，<a href="' + ROOT + 'practice/?back=' + encodeURIComponent(location.pathname + location.hash) + '">重新登入</a>後作答才會記錄', 4500); refreshUser(); }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
