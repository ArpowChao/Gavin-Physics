/*
 * Gavin Physics 全站共用
 *   ・導覽列（有 #sidebar 的大型教材頁放進側欄；data-mode="pill" 的全螢幕型實驗用浮動小工具列）
 *   ・線上練習登入狀態、網頁檢核題作答紀錄（GPRecord）
 *   ・平板全螢幕：整頁全螢幕按鈕＋每個動畫畫布的「⛶ 全螢幕」舞台模式
 * 用法：<link rel="stylesheet" href="…/assets/warm.css"><script src="…/assets/site.js" defer></script>
 */
(function () {
  if (window.__GP_SITE__) return; window.__GP_SITE__ = true;
  const me = document.currentScript || [...document.scripts].find(s => /assets\/site\.js(\?|$)/.test(s.src));
  const ROOT = me ? me.src.replace(/assets\/site\.js(\?.*)?$/, '') : '/';
  const MODE = (me && me.dataset.mode) || '';
  const Q = me && me.src.indexOf('?') > 0 ? me.src.slice(me.src.indexOf('?')) : '';
  const here = location.href;
  const NAV = [['', '首頁'], ['gsat/', '必修・學測'], ['wave-optics/', '選修・波動光學'], ['electromag/', '選修・電磁學'], ['practice/', '線上練習']];
  window.__GP_ROOT__ = ROOT;
  const active = p => p ? here.indexOf(ROOT + p) === 0 : here.replace(/(index\.html)?([?#].*)?$/, '') === ROOT;

  if (![...document.styleSheets].some(s => /assets\/warm\.css/.test(s.href || '')) && !document.querySelector('link[href*="assets/warm.css"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ROOT + 'assets/warm.css'; document.head.appendChild(l);
  }

  // ---------- 全螢幕工具 ----------
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const canFS = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  function reqFS() {
    const d = document.documentElement;
    try { const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  }
  function exitFS() { try { const f = document.exitFullscreen || document.webkitExitFullscreen; if (fsEl() && f) { const p = f.call(document); if (p && p.catch) p.catch(() => {}); } } catch (e) {} }
  const kick = () => { window.dispatchEvent(new Event('resize')); };
  const kickLater = () => { requestAnimationFrame(kick); setTimeout(kick, 120); setTimeout(kick, 400); };

  function togglePage() {
    if (fsEl()) { exitFS(); return; }
    if (canFS()) { reqFS(); return; }
    toast('這台裝置的瀏覽器不支援網頁全螢幕。可以在 Safari 按「分享 → 加入主畫面」，從主畫面開啟就是全螢幕。', 5200);
  }
  function syncFS() {
    const on = !!fsEl() && !stageEl;
    document.documentElement.classList.toggle('gp-fullpage', on);
    document.querySelectorAll('.gp-fsbtn').forEach(b => { b.textContent = on ? '✕ 離開全螢幕' : '⛶ 全螢幕'; });
    if (!fsEl() && stageEl) exitStage(true);
    kickLater();
  }
  document.addEventListener('fullscreenchange', syncFS); document.addEventListener('webkitfullscreenchange', syncFS);

  // ---------- 舞台模式：單一動畫放大到全螢幕 ----------
  let stageEl = null, stageExit = null, stageSaved = null;
  function isDarkBg(el) {
    let n = el;
    while (n && n.nodeType === 1) {
      const c = getComputedStyle(n).backgroundColor; const m = c.match(/\d+(\.\d+)?/g);
      if (m && (m.length < 4 || Number(m[3]) > 0.5)) { const [r, g, b] = m.map(Number); return (0.299 * r + 0.587 * g + 0.114 * b) < 110; }
      n = n.parentElement;
    }
    return false;
  }
  // 祖先若有 transform／filter／z-index 等會「困住」position:fixed 的屬性，放大期間暫時解除
  function freeAncestors(el) {
    const saved = []; const set = (n, prop, val) => { saved.push([n, prop, n.style.getPropertyValue(prop), n.style.getPropertyPriority(prop)]); n.style.setProperty(prop, val, 'important'); };
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.animationName && cs.animationName !== 'none') set(n, 'animation', 'none');   // 仍在作用中的 transform 動畫也會困住 fixed
      if (cs.transform !== 'none') set(n, 'transform', 'none');
      if (cs.filter !== 'none') set(n, 'filter', 'none');
      if ((cs.backdropFilter || cs.webkitBackdropFilter || 'none') !== 'none') { set(n, 'backdrop-filter', 'none'); set(n, '-webkit-backdrop-filter', 'none'); }
      if (cs.perspective !== 'none') set(n, 'perspective', 'none');
      if (cs.contain && cs.contain !== 'none') set(n, 'contain', 'none');
      if (cs.willChange && cs.willChange !== 'auto') set(n, 'will-change', 'auto');
      if (cs.position !== 'static' && cs.zIndex !== 'auto') set(n, 'z-index', '2147483000');
      if (Number(cs.opacity) < 1) set(n, 'opacity', '1');
      if (cs.contentVisibility && cs.contentVisibility !== 'visible') set(n, 'content-visibility', 'visible');
    }
    return saved;
  }
  function enterStage(el) {
    if (stageEl) exitStage();
    stageEl = el; stageSaved = { style: el.getAttribute('style'), anc: freeAncestors(el) };
    el.classList.add('gp-stage'); if (isDarkBg(el.parentElement || el)) el.classList.add('gp-stage-dark');
    document.documentElement.classList.add('gp-staging');
    stageExit = document.createElement('button'); stageExit.className = 'gp-stage-exit'; stageExit.type = 'button'; stageExit.textContent = '✕ 離開全螢幕';
    stageExit.onclick = () => exitStage(); document.body.appendChild(stageExit);
    if (!/^(canvas|svg|img|video)$/i.test(el.tagName)) el.classList.add('gp-stage-box');
    if (canFS() && !fsEl()) reqFS();
    kickLater(); setTimeout(() => fitMedia(el), 480); setTimeout(() => fitMedia(el), 1100);
  }
  // 放大後若動畫本身沒有跟著變大（固定尺寸的畫布、svg），用 CSS 等比放大填滿畫面
  function fitMedia(box) {
    if (stageEl !== box || box.tagName.match(/^(canvas|svg|img|video)$/i)) return;
    const B = box.getBoundingClientRect(), W = B.width - 24, H = B.height - 24;
    box.querySelectorAll(':scope > canvas, :scope > svg, :scope > * > canvas, :scope > * > svg').forEach(m => {
      if (m.closest('.gp-stage-btn')) return;
      const r = m.getBoundingClientRect(); if (r.width < 60 || r.height < 40) return;
      const tooBig = r.width > W + 2 || r.height > H + 2, tooSmall = r.width < W * 0.8 && r.height < H * 0.8;
      if (!tooBig && !tooSmall) return;
      const ar = m.tagName.toLowerCase() === 'canvas' && m.width ? m.width / m.height : r.width / r.height;
      let w = W, h = W / ar; if (h > H) { h = H; w = H * ar; }
      m.__gpFit = m.getAttribute('style'); m.style.setProperty('width', w + 'px', 'important'); m.style.setProperty('height', h + 'px', 'important');
      m.style.setProperty('max-width', 'none', 'important'); m.style.setProperty('max-height', 'none', 'important');
    });
    kick();
  }
  function unfitMedia(box) {
    box.querySelectorAll('canvas, svg').forEach(m => { if ('__gpFit' in m) { if (m.__gpFit == null) m.removeAttribute('style'); else m.setAttribute('style', m.__gpFit); delete m.__gpFit; } });
  }
  function exitStage(fromFS) {
    if (!stageEl) return;
    unfitMedia(stageEl); stageEl.classList.remove('gp-stage', 'gp-stage-dark', 'gp-stage-box');
    if (stageSaved && stageSaved.style != null) stageEl.setAttribute('style', stageSaved.style); else if (stageSaved) stageEl.removeAttribute('style');
    if (stageSaved && stageSaved.anc) stageSaved.anc.reverse().forEach(([n, prop, v, pr]) => { if (v) n.style.setProperty(prop, v, pr); else n.style.removeProperty(prop); });
    stageEl = null; if (stageExit) stageExit.remove(); stageExit = null;
    document.documentElement.classList.remove('gp-staging');
    if (!fromFS) exitFS();
    kickLater();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && stageEl) exitStage(); });

  // 找出值得放大的動畫：夠大的 canvas／有 viewBox 的 svg；父層只包著它（其餘都浮在上面）時，放大整個父層
  const MIN_W = 300, MIN_H = 170;
  function stageTarget(media) {
    const p = media.parentElement; if (!p || p === document.body) return media;
    const inFlow = [...p.children].filter(c => {
      if (c === media || c.classList.contains('gp-stage-btn')) return false;
      const cs = getComputedStyle(c); return cs.position !== 'absolute' && cs.position !== 'fixed' && cs.display !== 'none';
    });
    const pr = p.getBoundingClientRect(), mr = media.getBoundingClientRect();
    if (!inFlow.length && pr.width * pr.height <= mr.width * mr.height * 1.8) return p;
    return media;
  }
  function decorate() {
    document.querySelectorAll('canvas, svg[viewBox], iframe').forEach(m => {
      if (m.__gpStage || m.closest('.gp-bar, .gp-pill, button, a, .gp-stage-btn, [data-gp-nostage], .gp-lab-frame')) return;
      if (m.tagName.toLowerCase() === 'svg' && m.parentElement && m.parentElement.closest('svg')) return;
      const r = m.getBoundingClientRect(); if (r.width < MIN_W || r.height < MIN_H) return;
      m.__gpStage = true;
      const target = stageTarget(m); const host = target === m ? m.parentElement : target;
      if (!host) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'gp-stage-btn'; b.innerHTML = '⛶<span>全螢幕</span>'; b.title = '動畫全螢幕'; b.setAttribute('aria-label', '把這個動畫放大到全螢幕');
      b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); enterStage(target); });
      b.addEventListener('pointerdown', e => e.stopPropagation());
      if (getComputedStyle(host).position === 'static') {
        const absKids = [...host.children].some(c => getComputedStyle(c).position === 'absolute');
        if (absKids) { b.classList.add('inline'); host.insertBefore(b, target === m ? m : host.firstChild); return; }
        host.style.position = 'relative';
      }
      host.appendChild(b);
    });
  }
  let decoT = null; const scheduleDecorate = () => { clearTimeout(decoT); decoT = setTimeout(decorate, 300); };

  // ---------- 導覽 ----------
  function bar(side, withFS) {
    const el = document.createElement(side ? 'div' : 'nav');
    el.className = side ? 'gp-bar gp-side' : 'gp-bar'; el.setAttribute('aria-label', '全站導覽');
    el.innerHTML = '<div class="gp-in"><a class="gp-brand" href="' + ROOT + '"><i aria-hidden="true"></i>Gavin Physics</a><div class="gp-links">' +
      NAV.map(([p, t]) => '<a href="' + ROOT + p + '"' + (active(p) ? ' class="on" aria-current="page"' : '') + '>' + t + '</a>').join('') +
      '</div><div class="gp-tools">' + (withFS ? '<button type="button" class="gp-fsbtn">⛶ 全螢幕</button>' : '') +
      '<a class="gp-user" id="gp-user" href="' + ROOT + 'practice/">登入練習帳號</a></div></div>';
    return el;
  }
  // body 有最大寬度或內距的頁面：把導覽列拉滿整個視窗寬、貼齊頂端
  function stretch(b) {
    b.style.marginLeft = b.style.marginTop = b.style.width = '';
    const r = b.getBoundingClientRect(), W = document.documentElement.clientWidth;
    if (r.left > 0.5 || r.width < W - 1) { b.style.marginLeft = (-r.left) + 'px'; b.style.width = W + 'px'; }
    const top = r.top + window.scrollY; if (top > 0.5) b.style.marginTop = (-top) + 'px';
  }
  function mount() {
    const path = location.pathname;
    const isApp = /\/apps\/.+/.test(path) && !/\/apps\/(index\.html)?$/.test(path);
    const withFS = isApp || /water_interference/.test(path);
    let embedded = false; try { embedded = window.self !== window.top && !!window.top.__GP_SITE__; } catch (e) {}
    if (embedded) {   // 嵌在本站節點頁的 iframe 裡：導覽交給外層頁面，藏起實驗自己的「回實驗室／回首頁」連結
      document.documentElement.classList.add('gp-embedded');
      document.querySelectorAll('a[href]').forEach(a => {
        let u; try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
        const homeish = u.origin === location.origin && (/\/apps\/(index\.html)?$/.test(u.pathname) || u.pathname === new URL(ROOT).pathname || u.pathname === new URL(ROOT).pathname + 'index.html');
        if (homeish || /^(←\s*)?(Physics Lab|回首頁|返回首頁|互動實驗室)$/.test(a.textContent.trim().replace(/^[←◂<]\s*/, ''))) a.style.display = 'none';
      });
    }
    else if (MODE === 'pill') {
      const p = document.createElement('div'); p.className = 'gp-pill';
      p.innerHTML = '<a href="' + ROOT + '" class="gp-back">◂ 返回</a><button type="button" class="gp-fsbtn">⛶ 全螢幕</button>';
      document.body.appendChild(p);
      p.querySelector('.gp-back').addEventListener('click', e => { try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); } } catch (err) {} });
    } else {
      const sideBrand = document.querySelector('#sidebar .sidebar-brand');
      if (sideBrand) sideBrand.parentNode.insertBefore(bar(true, false), sideBrand);
      else { const b = bar(false, withFS); document.body.insertBefore(b, document.body.firstChild); stretch(b); window.addEventListener('resize', () => stretch(b)); }
    }
    document.querySelectorAll('.gp-fsbtn').forEach(b => b.addEventListener('click', togglePage));
    loadApi().then(refreshUser);
    if (/\/(gsat|electromag)\/|wave_optics_review/.test(path)) load(ROOT + 'assets/topic-labs.js' + Q);
    decorate(); setTimeout(decorate, 1200);
    new MutationObserver(scheduleDecorate).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', () => { if (!stageEl) scheduleDecorate(); });
  }

  // ---------- 線上練習 API ----------
  function load(src) { return new Promise(ok => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ok; document.head.appendChild(s); }); }
  let apiP = null;
  function loadApi() {
    if (!apiP) apiP = (async () => {
      if (!('PHY_API_URL' in window)) await load(ROOT + 'practice/config.js' + Q);
      if (!window.PhyAPI) await load(ROOT + 'practice/api.js' + Q);
      if (!window.PhyItemKey) await load(ROOT + 'practice/item-key.js' + Q);
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

  /** 網頁檢核題作答紀錄（學測、波動光學頁面呼叫）：bank 'gsat' | 'wave'；resp 選項字母如 'BD' */
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
  window.GPStage = { enter: enterStage, exit: exitStage, togglePage };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
