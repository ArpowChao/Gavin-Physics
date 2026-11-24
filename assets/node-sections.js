/*
 * 知識節點 ↔ 課本章節對照（依 108 課綱與現行課本：必修物理 CH1–CH6、選修物理Ⅲ CH1–CH4）
 *   內部仍用 N01… 當作題目與紀錄的鍵（不可改，否則作答紀錄與題目編號會對不上）；
 *   畫面上一律改顯示課本章節，例如「3-3」「選修Ⅲ 2-3」。
 *   同一份資料也供 practice/tools/build_bank.js 產生題庫概念名稱。
 */
(function (root) {
  const BOOK = {
    gsat: { name: '必修物理', short: '必修' },
    wave: { name: '選修物理Ⅲ', short: '選修Ⅲ' },
  };
  const TITLE = {
    gsat: {
      '1-2': '科學的方法', '2-1': '物質的組成', '2-2': '原子的尺度與結構', '2-3': '物質間的基本交互作用',
      '3-1': '對物體運動的描述', '3-2': '牛頓運動定律', '3-3': '天體運動',
      '4-1': '電流的磁效應', '4-2': '電磁感應', '4-3': '電與磁的整合', '4-4': '光波', '4-5': '都卜勒效應',
      '5-1': '功與能量的形式', '5-2': '微觀尺度下的能量', '5-3': '能量間的轉換與能量守恆', '5-4': '質能互換與核能',
      '6-1': '光電效應與光的粒子性', '6-2': '物質波與電子的波動性', '6-3': '波粒二象性', '6-4': '原子光譜',
    },
    wave: {
      '1-1': '波的傳播', '1-2': '振動與週期波', '1-3': '繩波的反射與透射', '1-4': '波的疊加原理', '1-5': '駐波',
      '1-6': '惠更斯原理', '1-7': '水波', '2-1': '聲波的傳播', '2-2': '空氣柱的駐波', '2-3': '共振與共鳴',
      '3-1': '光的折射與司乃耳定律', '3-2': '光的全反射', '3-3': '光的色散與彩虹成因', '3-4': '薄透鏡成像與應用',
      '4-1': '光的干涉', '4-2': '光的繞射', '必修4-5': '都卜勒效應（必修）',
    },
  };
  // 節點 → 課本節次（第一個為主要節次）
  const SEC = {
    gsat: {
      N01: ['1-2'], N02: ['1-2'], N03: ['3-1'], N04: ['3-2'], N05: ['3-2'], N06: ['2-1'], N07: ['3-3'], N08: ['3-3'],
      N09: ['5-1', '5-3'], N10: ['5-2'], N11: ['5-2'], N12: ['5-3'], N13: ['5-4'], N14: ['4-4'], N15: ['4-5'], N16: ['4-4'],
      N17: ['4-4'], N18: ['4-3'], N19: ['2-3'], N20: ['4-1'], N21: ['4-2'], N22: ['4-2'], N23: ['6-1'], N24: ['6-4'],
      N25: ['6-2', '6-3'], N26: ['2-3', '5-4'], N27: ['2-3'], N28: ['6-1'],
    },
    wave: {
      N01: ['1-1'], N02: ['1-2'], N03: ['1-3'], N04: ['1-4', '1-5'], N05: ['1-6'], N06: ['1-7'], N07: ['1-7'],
      N08: ['2-1'], N09: ['2-1'], N10: ['2-2'], N11: ['2-2'], N12: ['2-3'], N13: ['3-1'], N14: ['3-1', '3-3'],
      N15: ['3-2'], N16: ['3-4'], N17: ['3-4'], N18: ['4-1'], N19: ['4-1'], N20: ['4-2'], N21: ['必修4-5'],
    },
  };
  const api = {
    BOOK, TITLE, SEC,
    tag(course, id) { const s = (SEC[course] || {})[id]; return s ? s.join('・').replace('必修4-5', '必修 4-5') : id; },
    title(course, id) { const s = (SEC[course] || {})[id]; return s ? (TITLE[course][s[0]] || '') : ''; },
    // 例：「必修 3-3 天體運動」「選修Ⅲ 2-3 共振與共鳴」
    full(course, id) { const s = (SEC[course] || {})[id]; if (!s) return id; const b = BOOK[course].short; return (/^必修/.test(s[0]) ? '' : b + ' ') + api.tag(course, id) + ' ' + api.title(course, id); },
    sortKey(course, id) { const s = ((SEC[course] || {})[id] || ['9-9'])[0].replace('必修', '8'); return s.split('-').map(x => ('0' + x).slice(-2)).join('') + id; },
  };
  root.GP_NODE_SEC = api;
  if (typeof document === 'undefined') return;

  // ---------- 畫面上把殘留的 N01… 換成課本節次（只改文字，不動網址與資料） ----------
  const course = /\/gsat\//.test(location.pathname) ? 'gsat' : /\/wave-optics\//.test(location.pathname) ? 'wave' : null;
  if (!course) return;
  const map = SEC[course];
  const RE = /(^|[^A-Za-z0-9_\-])N(\d\d)(?![0-9A-Za-z_\-])/g;
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1 };
  function fixText(t) {
    if (!t.nodeValue || t.nodeValue.indexOf('N') < 0) return;
    const p = t.parentNode; if (!p || SKIP[p.nodeName] || (p.closest && p.closest('[contenteditable="true"], .gp-keep-code'))) return;
    const v = t.nodeValue.replace(RE, (m, pre, d) => map['N' + d] ? pre + api.tag(course, 'N' + d) : m);
    if (v !== t.nodeValue) t.nodeValue = v;
  }
  function walk(node) {
    if (node.nodeType === 3) return fixText(node);
    if (node.nodeType !== 1 || SKIP[node.nodeName]) return;
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let t; while ((t = w.nextNode())) fixText(t);
  }
  let queue = new Set(), raf = 0;
  function flush() { raf = 0; const q = queue; queue = new Set(); q.forEach(n => { if (n.isConnected) walk(n); }); }
  function start() {
    walk(document.body);
    new MutationObserver(ms => {
      ms.forEach(m => { if (m.type === 'characterData') queue.add(m.target); else m.addedNodes.forEach(n => queue.add(n)); });
      if (!raf) raf = requestAnimationFrame(flush);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(typeof window !== 'undefined' ? window : globalThis);
