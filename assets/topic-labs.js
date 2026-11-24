/*
 * 把 apps/ 的互動實驗放進學測、波動光學、電磁學各節點頁
 *   在節點頁插入「互動實驗」區塊：每個實驗可在頁內展開（可全螢幕）或另開分頁
 *   由 assets/site.js 載入；依頁面判斷課程，依網址 #node-Nxx／#course/x-y 判斷節點
 */
(function () {
  const ROOT = (window.__GP_ROOT__ || '');
  const LABS = {
    uncertainty: ['apps/Uncertainty.html', '測量不確定度完整指南', 'A 類、B 類不確定度與有效數字'],
    sampler: ['apps/random_sampler.html', '隨機抽樣產生器', '模擬 B 類不確定度：均勻分布抽樣與標準差'],
    dataLab: ['apps/data_analysis_lab.html', '數據分析實驗室', '從量測、分布到建立物理模型'],
    inquiry: ['apps/inquiry_and_practice.html', '探究與實作', '從靈感、提問到實驗設計'],
    lidToss: ['apps/lid-toss/', 'TOSS 彈蓋垃圾桶挑戰', '拋體運動：仰角與速率'],
    barrel: ['apps/barrel-angle/', 'BARREL 全壘打仰角實驗室', '空氣阻力下的最佳仰角'],
    pulley: ['apps/movable_pulley.html', '滑輪組與阿特伍德機', '定滑輪、動滑輪與系統加速度'],
    com: ['apps/center-of-mass.html', '質心運動模擬', '拋體爆炸後的質心軌跡'],
    pitch: ['apps/pitch-spin/', 'SPIN 投球旋轉實驗室', '球速、轉速、轉軸與球路'],
    cfd: ['apps/baseball-cfd/', '棒球氣流實驗室', '3D 縫線、邊界層與馬格努斯力'],
    friction: ['apps/friction-simulation/', '摩擦力模擬', '靜摩擦與動摩擦'],
    rod: ['apps/phy-olympic-wall-bar-move.html', '滑動桿物理模擬器', '細桿沿牆滑落：能量與受力'],
    orbit: ['apps/orbit/', 'ORBIT 軌道實驗室', '拖曳發射：圓、橢圓、拋物線軌道'],
    transfer: ['apps/orbit_transfer/', '軌道轉移與重力逃逸', '霍曼轉移與逃逸速度遊戲'],
    cannon: ['apps/newton-cannon/', 'CANNON 牛頓大砲', '從拋體到繞地球運行'],
    decay: ['apps/orbital_decay/', '軌道衰減模擬器', '近地衛星的阻力與能量守恆'],
    spring: ['apps/simulation/', '彈簧碰撞模擬器', '動量、動能與彈性位能'],
    water: ['apps/water-states.html', '水的三態實驗台', '加熱冷卻、潛熱與分子排列'],
    doppler: ['apps/doppler/', '都卜勒・水波實驗', '移動波源的波前與頻率變化'],
    audio: ['apps/audio-digital-science.html', '聲音的數位轉生', '聲波取樣、類比與數位'],
    slit: ['apps/single-slit-diffraction/', '單狹縫繞射四大核心主題', '成德高中 陳家騏老師 設計'],
    charged: ['apps/charged-spheres/', '帶電球的近距離電力', '均勻帶電球與點電荷庫侖力比較'],
    alpha: ['apps/alpha.html', '拉塞福散射公式推導', 'α 粒子散射與原子核模型'],
  };
  // 只放「課本這一節有教」的實驗（依 108 課綱與現行課本核對）。
  //   超出必修的（拋體、質心、動量、人造衛星軌道…）放首頁「選修物理Ⅰ・Ⅱ 力學」；
  //   超出課綱的（空氣阻力、馬格努斯力、數位取樣、散射公式推導…）放首頁「延伸專題」。
  const MAP = {
    gsat: {
      N01: ['inquiry'],        // 必修 1-2 科學的方法
      N05: ['friction'],       // 必修 3-2 摩擦力
      N07: ['orbit'],          // 必修 3-3 克卜勒定律：橢圓軌道
      N10: ['water'],          // 必修 5-2（國中熱學複習：溫度、熱量、三態）
      N15: ['doppler'],        // 必修 4-5 都卜勒效應
    },
    wave: {
      N12: ['uncertainty', 'sampler', 'dataLab'],   // 選修Ⅲ 2-3 共鳴管實驗：波長最佳估計值與不確定度
      N20: ['slit'],           // 選修Ⅲ 4-2 光的繞射
      N21: ['doppler'],        // 必修 4-5 都卜勒效應
    },
    em: {},
  };
  const course = /\/gsat\//.test(location.pathname) ? 'gsat' : /\/wave-optics\/wave_optics_review/.test(location.pathname) ? 'wave' : /\/electromag\//.test(location.pathname) ? 'em' : null;
  if (!course) return;

  function nodeFromHash() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    let m = h.match(/^node-(N\d+)/); if (m) return m[1];
    m = h.match(/^course\/(\d-\d)/); if (m) return m[1];
    return null;
  }
  function anchorFor(main) {   // 插在各網站節點頁「開頭導讀」之後
    return main.querySelector('.node-route-actions') || main.querySelector('.observe-card') || main.querySelector('.lesson-header, .view-header, .content-header');
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function render(node) {
    const main = document.getElementById('main-content') || document.getElementById('main') || document.querySelector('main');
    if (!main) return;
    const keys = (MAP[course] || {})[node];
    const old = main.querySelector('.gp-labs');
    if (!keys || !keys.length) { if (old) old.remove(); return; }
    if (old && old.dataset.node === node) return;
    if (old) old.remove();
    const at = anchorFor(main); if (!at) return;
    const sec = document.createElement('section'); sec.className = 'gp-labs'; sec.dataset.node = node;
    sec.innerHTML = '<div class="gp-labs-head"><h2>🔬 動手做：互動實驗</h2><p>在這裡展開操作，或按 ⛶ 放大到全螢幕上課使用。</p></div><div class="gp-labs-list">' +
      keys.map(k => { const [u, t, d] = LABS[k]; return '<article class="gp-lab" data-src="' + esc(ROOT + u) + '"><div class="gp-lab-txt"><strong>' + esc(t) + '</strong><span>' + esc(d) + '</span></div>' +
        '<div class="gp-lab-btns"><button type="button" class="gp-lab-open">在這裡開啟</button><a href="' + esc(ROOT + u) + '" target="_blank" rel="noopener">新分頁 ↗</a></div></article>'; }).join('') + '</div>';
    at.insertAdjacentElement('afterend', sec);
    sec.addEventListener('click', e => {
      const b = e.target.closest('.gp-lab-open'); if (!b) return;
      const card = b.closest('.gp-lab'); let frame = card.querySelector('.gp-lab-frame');
      if (frame) { frame.remove(); b.textContent = '在這裡開啟'; return; }
      frame = document.createElement('div'); frame.className = 'gp-lab-frame';
      frame.innerHTML = '<iframe src="' + card.dataset.src + '" title="' + esc(card.querySelector('strong').textContent) + '" loading="lazy" allow="fullscreen" allowfullscreen></iframe>' +
        '<button type="button" class="gp-lab-fs" aria-label="全螢幕">⛶ 全螢幕</button>';
      card.appendChild(frame); b.textContent = '收起';
      frame.querySelector('.gp-lab-fs').onclick = () => { if (window.GPStage) GPStage.enter(frame.querySelector('iframe')); };
    });
  }
  let last = null, t = null;
  function check() { const n = nodeFromHash(); const main = document.getElementById('main-content') || document.getElementById('main') || document.querySelector('main');
    const have = main && main.querySelector('.gp-labs'); if (n === last && (have || !n || !(MAP[course] || {})[n])) return; last = n; render(n); }
  const schedule = () => { clearTimeout(t); t = setTimeout(() => { last = null; check(); }, 250); };
  window.addEventListener('hashchange', schedule); window.addEventListener('popstate', schedule);
  const start = () => { check(); const main = document.getElementById('main-content') || document.getElementById('main') || document.querySelector('main');
    if (main) new MutationObserver(() => { if (!main.querySelector('.gp-labs') || main.querySelector('.gp-labs').dataset.node !== nodeFromHash()) schedule(); }).observe(main, { childList: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();
