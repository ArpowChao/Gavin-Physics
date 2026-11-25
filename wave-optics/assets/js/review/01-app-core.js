// 核心：檢視生命週期、路由與側欄、首頁、模組導讀、節點頁、動畫講解、工具頁（公式、題型、對照表、題庫與錯題本）
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* =====================================================================
         * 核心：檢視生命週期、路由與側欄
         * ===================================================================*/
        let activeDisposers = WaveRuntime.createDisposerRegistry('initial');
        let lastRenderedRoute = null;
        let mathJaxTimer = null;

        const activeQuizLabDisposers = new Map();

        function cleanupCurrentView() {
            /* 上一個檢視若是寬版實驗，離開時要把正文欄寬還原 */
            const mc = document.getElementById('main-content');
            if (mc) mc.classList.remove('lab-wide');
            activeQuizLabDisposers.forEach((d) => { try { d.dispose(); } catch (e) {} });
            activeQuizLabDisposers.clear();
            activeDisposers.dispose();
            activeDisposers = WaveRuntime.createDisposerRegistry('view');
        }

        function scheduleMathJax(target) {
            if (mathJaxTimer) clearTimeout(mathJaxTimer);
            mathJaxTimer = setTimeout(() => {
                mathJaxTimer = null;
                const el = target || document.getElementById('main-content');
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([el]).catch((err) => console.warn('MathJax', err));
                }
            }, 40);
        }

        const ALL_NODES = Object.keys(nodeMeta).sort();

        function nodesOfModule(moduleNum) {
            return ALL_NODES.filter((code) => nodeMeta[code].module === Number(moduleNum));
        }

        function itemsForNode(list, code) {
            return list.filter((item) => [].concat(item.node).includes(code));
        }

        /* 一個節點可以對應一個或多個互動實驗 */
        function labsOfNode(code) {
            const meta = nodeMeta[code];
            if (!meta || !meta.lab) return [];
            return [].concat(meta.lab);
        }
        function nodesOfLab(labId) {
            return ALL_NODES.filter((c) => labsOfNode(c).includes(labId));
        }

        /* buildNodeSidebar is in assets/js/learner-ui.js. */

        function routeFromLocation() {
            try {
                const raw = decodeURIComponent((location.hash || '').replace(/^#/, '')).trim();
                if (!raw || raw === 'home') return 'home';
                if (/^module-[1-4]$/.test(raw)) return raw;
                if (raw.startsWith('node-') && Object.hasOwn(nodeMeta,raw.slice(5))) return raw;
                if (raw.startsWith('lab-') && Object.hasOwn(LABS,raw.slice(4).split(':')[0])) return raw;
                if (['tool-formula','tool-lab','tool-anim','tool-quiz','tool-compare','tool-exam','tool-wrong'].includes(raw)) return raw;
            } catch (_) { /* 損壞的分享連結仍回到可使用的首頁。 */ }
            return 'home';
        }

        function routeLabel(route) {
            if (route === 'home') return '學習首頁';
            if (route.startsWith('module-')) return modulesData[route.slice(7)] ? modulesData[route.slice(7)].title : '模組導讀';
            if (route.startsWith('node-')) {
                const code = route.slice(5);
                return nodeMeta[code] ? `${code}　${nodeMeta[code].title}` : '知識節點';
            }
            if (route.startsWith('lab-')) {
                const id = route.slice(4).split(':')[0];
                return labMeta[id] ? `互動實驗：${labMeta[id].name}` : '互動實驗';
            }
            const toolNames = {
                'tool-formula': '公式速查表',
                'tool-lab': '互動實驗室',
                'tool-anim': '動畫講解',
                'tool-quiz': '知識節點分級題庫',
                'tool-compare': '易混淆對照表',
                'tool-exam': '大考題型索引',
                'tool-wrong': '錯題本'
            };
            return toolNames[route] || '學習首頁';
        }

        /* activateNavForRoute is in assets/js/learner-ui.js. */

        function renderRoute(route) {
            try {
                cleanupCurrentView();
                const main = document.getElementById('main-content');
                if (main) main.scrollTop = 0;
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                if (route === 'home') renderHomeView();
                else if (route.startsWith('module-')) renderModuleView(route.slice(7));
                else if (route.startsWith('node-')) renderNodeView(route.slice(5));
                else if (route.startsWith('lab-')) renderSingleLabView(route.slice(4));
                else if (route === 'tool-formula') renderFormulaSheet();
                else if (route === 'tool-lab') renderLabIndex();
                else if (route === 'tool-anim') renderAnimIndex();
                else if (route === 'tool-quiz') renderQuizView();
                else if (route === 'tool-compare') renderCompareView();
                else if (route === 'tool-exam') renderExamIndexView();
                else if (route === 'tool-wrong') renderWrongBookView();
                else renderHomeView();

                activateNavForRoute(route);
                document.getElementById('view-breadcrumb').textContent = routeLabel(route);
                lastRenderedRoute = route;
                updateWrongBadge();
                scheduleMathJax();
                window.WavePageStatus.ready();
            } catch (error) {
                lastRenderedRoute = null;
                console.error('學習頁面顯示失敗', route, error);
                try { cleanupCurrentView(); }
                catch (cleanupError) { console.warn('頁面資源清理失敗', cleanupError); }
                window.WavePageStatus.fail();
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }
        }

        function navigateTo(route) {
            if (route === lastRenderedRoute) return;
            history.pushState({ waveRoute: route }, '', `#${encodeURIComponent(route)}`);
            renderRoute(route);
        }

        function switchMainView(navEl, route) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            const toggle = document.querySelector('.mobile-nav-toggle');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', '開啟導覽選單');
            navigateTo(route);
        }

        function goBackInApp() {
            if (history.length > 1) history.back();
            else navigateTo('home');
        }

        function toggleMobileNav(button) {
            const bar = document.getElementById('sidebar');
            const open = bar.classList.toggle('mobile-open');
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
        }

        /* =====================================================================
         * 首頁
         * ===================================================================*/
        /* renderHomeView is in assets/js/learner-ui.js. */

        /* =====================================================================
         * 模組導讀
         * ===================================================================*/
        /* renderModuleView is in assets/js/learner-ui.js. */

        /* =====================================================================
         * 節點頁
         * ===================================================================*/
        /* renderNodeView is in assets/js/learner-ui.js. */


        /* =====================================================================
         * 動畫講解（Manim）
         * ===================================================================*/
        const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;

        /* 章節時間戳：跳到指定秒數並開始播放 */
        function seekAnim(vid, sec) {
            const v = document.getElementById(vid);
            if (!v) return;
            /* readyState < HAVE_METADATA 時 currentTime 是設不進去的（duration 仍為 NaN），
             * 必須等 loadedmetadata 之後再跳，否則第一次點時間戳會沒有反應。 */
            const go = () => {
                v.currentTime = sec;
                v.play().catch(() => {});
            };
            if (v.readyState >= 1) go();
            else {
                v.addEventListener('loadedmetadata', go, { once: true });
                v.load();
            }
            const box = document.getElementById(`${vid}-chapters`);
            if (box) {
                box.querySelectorAll('.anim-chip').forEach((el) => {
                    el.classList.toggle('playing', Number(el.dataset.t) === sec);
                });
            }
        }

        /* 播放中自動高亮目前所在的章節 */
        function bindAnimChapters(vid, chapters) {
            const v = document.getElementById(vid);
            const box = document.getElementById(`${vid}-chapters`);
            if (!v || !box || !chapters.length) return;
            let lastIdx = -1;
            activeDisposers.addEventListener(v, 'timeupdate', () => {
                let idx = 0;
                for (let i = 0; i < chapters.length; i++) {
                    if (v.currentTime >= chapters[i].t - 0.25) idx = i;
                }
                if (idx === lastIdx) return;
                lastIdx = idx;
                box.querySelectorAll('.anim-chip').forEach((el, i) => el.classList.toggle('playing', i === idx));
            });
        }

        function animSpeedControlHtml(vid) {
            return `
                <div class="anim-speed-control">
                    <label for="${vid}-speed">播放速度</label>
                    <span class="speed-limit">0.1×</span>
                    <input type="range" id="${vid}-speed" min="0.1" max="1.5" step="0.1" value="1" data-video-speed="${vid}" aria-label="播放速度，0.1 倍到 1.5 倍">
                    <span class="speed-limit">1.5×</span>
                    <span class="speed-current">目前 <b id="${vid}-speed-out">1.0×</b></span>
                </div>`;
        }

        function bindAnimSpeed(vid) {
            const video = document.getElementById(vid);
            const input = document.querySelector(`[data-video-speed="${vid}"]`);
            const out = document.getElementById(`${vid}-speed-out`);
            if (!video || !input) return;
            activeDisposers.addEventListener(input, 'input', () => {
                const rate = Math.max(0.1, Math.min(1.5, Number(input.value) || 1));
                video.playbackRate = rate;
                if (out) out.textContent = `${rate.toFixed(1)}×`;
            });
        }

        /* 一支動畫的完整區塊。compact = 索引頁用，不展開圖與重點 */
        function animBlockHtml(key, compact) {
            const a = animData[key];
            if (!a) return '';
            const vid = `anim-${key}`;

            /* YouTube 是 iframe，沒有可以 seek 的 <video>；章節改成直接開到該時間點。 */
            const chapters = (a.chapters || []).length ? `
                <div class="anim-chapters" id="${vid}-chapters">
                    ${a.chapters.map((c) => a.youtubeId
                        ? `<a class="anim-chip" href="https://www.youtube.com/watch?v=${a.youtubeId}&t=${c.t}s" target="_blank" rel="noopener"><time>${mmss(c.t)}</time>${c.label} ↗</a>`
                        : `<button type="button" class="anim-chip" data-t="${c.t}" onclick="seekAnim('${vid}', ${c.t})"><time>${mmss(c.t)}</time>${c.label}</button>`
                    ).join('')}
                </div>` : '';

            const figs = (!compact && (a.figures || []).length) ? `
                <div class="anim-figs">
                    ${a.figures.map((f) => `<figure class="anim-fig"><img src="${f.src}" alt="${a.title}" loading="lazy"><figcaption>${f.cap}</figcaption></figure>`).join('')}
                </div>` : '';

            const points = (!compact && (a.points || []).length) ? `
                <ul class="anim-points">${a.points.map((t) => `<li>${t}</li>`).join('')}</ul>` : '';

            const extra = (!compact && (a.extraVideos || []).length) ? `
                <div class="anim-extra">
                    ${a.extraVideos.map((e, i) => `
                        <div>
                            <div class="anim-extra-title">${e.title}</div>
                            <div class="anim-stage"><video id="${vid}-x${i}" controls preload="none" playsinline poster="${e.poster}"><source src="${e.src}" type="video/mp4"></video></div>
                            ${animSpeedControlHtml(`${vid}-x${i}`)}
                        </div>`).join('')}
                </div>` : '';

            const nodeTags = (a.nodes || []).filter((n) => nodeMeta[n])
                .map((n) => `<span class="module-badge">${n}</span>`).join('');

            const tagLabel = a.youtubeId ? '實證影片' : '動畫';
            const stage = a.youtubeId ? `
                <div class="anim-stage ${a.isVertical ? 'anim-stage-vertical' : ''}" style="${a.isVertical ? '' : 'position:relative; padding-bottom:56.25%; height:0; overflow:hidden;'}">
                    <iframe src="https://www.youtube.com/embed/${a.youtubeId}"
                        style="${a.isVertical ? 'width:100%; height:100%; border:0;' : 'position:absolute; top:0; left:0; width:100%; height:100%; border:0;'}"
                        title="${a.title}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen loading="lazy"></iframe>
                </div>` : `
                <div class="anim-stage">
                    <video id="${vid}" controls preload="${(a.chapters || []).length ? 'metadata' : 'none'}" playsinline poster="${a.poster}">
                        <source src="${a.video}" type="video/mp4">
                        你的瀏覽器不支援內嵌影片，請直接下載 <a href="${a.video}">${a.title}</a>。
                    </video>
                </div>
                ${animSpeedControlHtml(vid)}`;

            const metaDesc = a.youtubeId ? `
                <span class="anim-dur" style="color:var(--accent-cyan); background:rgba(6,148,162,0.1); border-color:rgba(6,148,162,0.25);">${a.isVertical ? 'YouTube 實證短片' : 'YouTube 實證影片'}</span>
                <span><a href="${a.youtubeUrl || `https://youtube.com/watch?v=${a.youtubeId}`}" target="_blank" rel="noopener" style="color:var(--accent-cyan); text-decoration:underline; font-weight:600;">在 YouTube 開啟原始影片 ↗</a></span>
                ${a.credit ? `<span style="color:var(--text-muted);">來源：${a.credit}</span>` : ''}
                ${nodeTags}
            ` : `
                <span class="anim-dur">${mmss(a.seconds)}</span>
                <span>無旁白，全片以字幕講解</span>
                ${nodeTags}
            `;

            return `
                <div class="card anim-block">
                    <h4><span class="formula-node-tag">${tagLabel}</span>${a.title}</h4>
                    ${a.misconception ? `<div class="anim-myth"><b>常見誤解</b>${a.misconception}</div>` : ''}
                    <p class="anim-lead">${a.lead}</p>
                    ${stage}
                    <div class="anim-meta">
                        ${metaDesc}
                    </div>
                    ${chapters}
                    ${points}
                    ${figs}
                    ${extra}
                </div>`;
        }

        /* 節點頁的動畫區塊；沒有對應動畫時回傳空字串 */
        function animSectionForNode(code, excludedKeys = []) {
            const keys = (animByNode[code] || []).filter(key => !excludedKeys.includes(key));
            if (!keys.length) return '';
            return `<div class="section-title">動畫講解<span class="title-hint">點時間戳可直接跳到該段</span></div>
                ${keys.map((k) => `<details class="lesson-disclosure"><summary>${animData[k].title}</summary><div class="disclosure-content">${animBlockHtml(k, false)}</div></details>`).join('')}`;
        }

        function bindAnimsIn(keys) {
            keys.forEach((k) => {
                const a = animData[k];
                if (!a) return;
                const vid = `anim-${k}`;
                if ((a.chapters || []).length) bindAnimChapters(vid, a.chapters);
                if (!a.youtubeId) bindAnimSpeed(vid);
                (a.extraVideos || []).forEach((_, i) => bindAnimSpeed(`${vid}-x${i}`));
            });
        }

        function renderAnimIndex() {
            const keys = Object.keys(animData).filter(k => mediaChapter === 'all' || animData[k].nodes.some(c => nodeMeta[c]?.module === Number(mediaChapter)));
            document.getElementById('main-content').innerHTML = `
                <div class="view-header">
                    <span class="view-eyebrow">觀察與說明</span>
                    <h2>動畫與實拍影片</h2>
                    <p>選一個主題再展開觀看。本機動畫以字幕講解，實拍影片可對照真實現象；標示延伸的主題可稍後選讀。</p>
                </div>
                ${chapterFilterHtml(mediaChapter,'setMediaChapter')}
                ${keys.map((k) => `<details class="lesson-disclosure"><summary>${animData[k].title}</summary><div class="disclosure-content">${animBlockHtml(k, false)}</div></details>`).join('')}`;
            bindAnimsIn(keys);
        }



        /* openBankForNode is in assets/js/learner-ui.js. */

        /* =====================================================================
         * 工具：公式速查表
         * ===================================================================*/
        /* renderFormulaSheet is in assets/js/learner-ui.js. */

        /* =====================================================================
         * 工具：大考題型索引
         * ===================================================================*/
        function renderExamIndexView() {
            let html = '';
            Object.keys(modulesData).map(Number).sort((a, b) => a - b).forEach((m) => {
                if (examChapter !== 'all' && m !== Number(examChapter)) return;
                const mod = modulesData[m];
                const cards = mod.examQuestions.map((e) => {
                    const chips = [].concat(e.node).map((c) => `<span class="module-node-chip" onclick="navigateTo('node-${c}')">${c} ${nodeMeta[c].title}</span>`).join(' ');
                    const fig = e.image ? `
                        <div class="quiz-fig-box" style="margin: 0.6rem 0;">
                            <img src="${e.image}" alt="${e.imageCaption || '試題分析圖'}" class="quiz-fig-img" loading="lazy" />
                            ${e.imageCaption ? `<div class="quiz-fig-cap">📌 ${e.imageCaption}</div>` : ''}
                        </div>` : '';
                    return `<div class="card exam-card">
                        <span class="exam-year">${e.year}</span>
                        <h4>${e.title}</h4>
                        ${fig}
                        <p>${e.desc}</p>
                        <div class="module-nodes">${chips}</div>
                    </div>`;
                }).join('');
                html += `<div class="section-title">${mod.title}<span class="title-hint">${mod.examQuestions.length} 則</span></div>${cards}`;
            });

            document.getElementById('main-content').innerHTML = `
                <div class="view-header">
                    <span class="view-eyebrow">複習工具箱</span>
                    <h2>大考題型索引</h2>
                    <p>先選章節，再找想練的題型。題型整理可連回觀念；歷屆原題與選項解析在題庫中練習。</p>
                </div>
                ${chapterFilterHtml(examChapter,'setExamChapter')}
                ${html}`;
        }

        /* =====================================================================
         * 工具：易混淆對照表
         * ===================================================================*/
        function renderCompareView() {
            const tables = [
                {
                    title: '駐波系統：三種端點條件',
                    hint: '弦樂器、開管、閉管其實只有兩張圖',
                    head: ['系統', '端點條件', '駐波條件', '頻率公式', '可存在的諧音'],
                    rows: [
                        ['兩端固定的弦', '兩端皆為波節', '$L = n\\lambda/2$', '$f_n = nv/2L$', '奇偶皆有'],
                        ['開管樂器', '兩端皆為位移腹點', '$L = n\\lambda/2$', '$f_n = nv/2L$', '奇偶皆有'],
                        ['閉管樂器', '閉口端節點、開口端腹點', '$L = m\\lambda/4$', '$f_m = mv/4L$', '<b>僅奇數</b>'],
                        ['一端固定一端自由的弦', '固定端節點、自由端腹點', '$L = m\\lambda/4$', '$f_m = mv/4L$', '<b>僅奇數</b>']
                    ]
                },
                {
                    title: '穿越界面時哪些量會變',
                    hint: '靜止界面、均勻介質：反射波留在原介質、透射波換介質；繩的張力固定。',
                    head: ['情形', '頻率 $f$', '波速 $v$', '波長 $\\lambda$', '波形是否上下顛倒'],
                    rows: [
                        ['固定端反射', '不變', '不變', '不變', '<b>顛倒</b>'],
                        ['自由端反射', '不變', '不變', '不變', '不顛倒'],
                        ['輕繩 → 重繩（透射）', '不變', '變慢', '變短', '不顛倒'],
                        ['重繩 → 輕繩（透射）', '不變', '變快', '變長', '不顛倒'],
                        ['聲波：空氣 → 玻璃', '不變', '<b>變快</b>', '變長', '—'],
                        ['光波：空氣 → 玻璃', '不變', '<b>變慢</b>', '變短', '—']
                    ]
                },
                {
                    title: '雙狹縫干涉 vs. 單狹縫繞射',
                    hint: '遠屏、中央小角近似；雙波源同相，完全相消還需抵達振幅相同。位置公式的 ± 表示中央左右兩側。',
                    head: ['項目', '雙狹縫干涉', '單狹縫繞射'],
                    rows: [
                        ['幾何參數', '狹縫間距 $d$', '狹縫寬度 $a$'],
                        ['亮紋位置', '$y_n \\approx n\\dfrac{L\\lambda}{d}$（中央附近）', '中央 $y=0$；側亮紋峰值不使用暗紋公式'],
                        ['暗紋位置', '$y_m \\approx \\pm(m-\\frac{1}{2})\\dfrac{L\\lambda}{d}$（$m=1,2,3,\\dots$）', '$y_m \\approx \\pm m\\dfrac{L\\lambda}{a}$（$m = 1,2,3,\\dots$）'],
                        ['中央亮紋寬度', '$\\dfrac{L\\lambda}{d}$，與其他亮紋相同', '$\\dfrac{2L\\lambda}{a}$，是其他亮紋的<b>兩倍</b>'],
                        ['亮度分布', '忽略單縫包絡時近似等亮；真實亮度受包絡影響', '由中央向兩側<b>迅速遞減</b>'],
                        ['浸入折射率 $n$ 的液體', '間距 $\\times \\dfrac{1}{n}$', '間距與中央寬度 $\\times \\dfrac{1}{n}$']
                    ]
                },
                {
                    title: '水波干涉 vs. 光的干涉：同一套判準',
                    hint: '兩波源同相、同頻；完全相消需抵達振幅相同。光屏位置等距還需遠屏與中央小角近似。',
                    head: ['概念', '第一章：水波', '第四章：光'],
                    rows: [
                        ['完全建設性干涉', '腹線：$\\Delta\\ell = n\\lambda$', '亮紋：$\\Delta\\ell = n\\lambda$'],
                        ['完全破壞性干涉', '節線：$\\Delta\\ell = (m-\\frac{1}{2})\\lambda$', '暗紋：$\\Delta\\ell = (m-\\frac{1}{2})\\lambda$'],
                        ['幾何形狀', '以兩波源為焦點的雙曲線', '屏幕上近似等間距的直條紋'],
                        ['觀察到的樣貌', '腹線亮暗交替、節線靜止灰色', '亮紋與暗紋相間'],
                        ['位置近似條件', '直接算距離差', '$L \\gg d$、$|y|\\ll L$，才可用 $\\sin\\theta \\approx \\tan\\theta = y/L$']
                    ]
                },
                {
                    title: '透鏡成像的符號法則',
                    hint: '算出來的正負號本身就是答案',
                    head: ['符號', '取正', '取負'],
                    rows: [
                        ['焦距 $f$', '凸透鏡（會聚）', '凹透鏡（發散）'],
                        ['物距 $p$', '鏡前實物（本單元範圍）', '—'],
                        ['像距 $q$', '實像（在鏡後）', '虛像（在鏡前）'],
                        ['放大率 $m = -q/p$', '$m>0$ 正立', '$m<0$ 倒立'],
                        ['$|m|$ 的意義', '$|m|>1$ 放大', '$|m|<1$ 縮小']
                    ]
                },
                {
                    title: '各章「頻率不變」的統一結論',
                    hint: '界面靜止，頻率由波源決定；以下使用本單元的介質模型。',
                    head: ['現象', '頻率', '波速', '波長'],
                    rows: [
                        ['繩波透射到另一段繩', '不變', '改變', '改變'],
                        ['水波由深水進入淺水', '不變', '變慢', '變短'],
                        ['聲波由空氣進入水或鋼（本例）', '不變', '變快', '變長'],
                        ['光由空氣進入玻璃', '不變', '變慢', '變短'],
                        ['靜止界面的反射（原介質均勻）', '不變', '不變', '不變']
                    ]
                }
            ];

            const html = tables.map((t) => `
                <details class="lesson-disclosure"><summary>${t.title}</summary><div class="disclosure-content"><p class="progress-note">${t.hint}</p>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead><tr>${t.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
                        <tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
                    </table>
                </div></div></details>`).join('');

            document.getElementById('main-content').innerHTML = `
                <div class="view-header">
                    <span class="view-eyebrow">複習工具箱</span>
                    <h2>易混淆對照表</h2>
                    <p>選一組觀念，並排比較使用條件、公式與現象。</p>
                </div>
                ${html}`;
        }

        /* =====================================================================
         * 工具：分級題庫與錯題本
         * ===================================================================*/
        const quizFilter = { node: 'N01', level: '記憶', source: 'concept' };
        const QUIZ_LEVELS = ['記憶', '理解', '應用', '分析'];
        const WRONG_KEY = 'waveOptics.wrongBook.v1';

        function loadWrongBook() {
            try { const ids = JSON.parse(localStorage.getItem(WRONG_KEY) || '[]'); return Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string'))] : []; }
            catch (err) { return []; }
        }
        function saveWrongBook(list) {
            try { localStorage.setItem(WRONG_KEY, JSON.stringify(list)); return true; }
            catch (err) { return false; }
        }
        function markWrong(qid) {
            const list = loadWrongBook();
            const saved = list.includes(qid) || saveWrongBook([...list,qid]);
            updateWrongBadge();
            return saved;
        }
        function unmarkWrong(qid) {
            const saved = saveWrongBook(loadWrongBook().filter((x) => x !== qid));
            updateWrongBadge();
            return saved;
        }
        function updateWrongBadge() {
            const badge = document.getElementById('wrong-nav-badge');
            const n = loadWrongBook().length;
            badge.style.display = n ? 'inline-block' : 'none';
            badge.textContent = n;
        }

        /* 題目 ID：真題用官方題號，分級題庫用「節點-層級」。
         * 同一節點同一層級將來擴充成多題時會撞號，故在載入時統一去重並快取，
         * 避免 findQuestion 只回傳第一筆、DOM id 重複而讓錯題本記錯題。 */
        (function assignQuestionIds() {
            const seen = new Set();
            questionBank.forEach((q) => {
                const base = q.id || `${q.node}-${q.level}`;
                let id = base;
                let n = 2;
                while (seen.has(id)) id = `${base}-${n++}`;
                seen.add(id);
                q._qid = id;
            });
        })();

        function questionId(q) {
            return q._qid;
        }

        function getQuizLabConfig(q) {
            if (!q) return null;
            const qid = questionId(q);
            const specificOverrides = {
                'AST-113-02': { lab: 'snell', mode: null, guide: '<b>跨介質折射</b>：觀察折射方向，再用 $v=c/n$ 與頻率不變，推得 $\\lambda=v/f$ 的變化。' },
                'AST-113-14': { lab: 'young', mode: 'setup', guide: '<b>一次改一個量</b>：調整 $\\lambda$、$d$ 或 $L$，比較中央附近的條紋間距 $\\Delta y\\approx L\\lambda/d$。' },
                'AST-112-11': { lab: 'superpose', mode: 'destructive', guide: '<b>先看相消疊加</b>：兩個等振幅波在重疊區抵消。回到題目的聲路，另算波程差 $\\Delta L=(n+\\frac{1}{2})\\lambda$，判斷到達相位。' },
                'AST-112-18': { lab: 'snell', mode: null, guide: '<b>先看一次折射</b>：調整入射角與折射率，觀察偏折方向。再把此規則用到題目水瓶的每一個界面。' },
                'AST-111-16': { lab: 'snell', mode: null, guide: '<b>先判斷一次折射</b>：依序把光由空氣入壓克力、再由壓克力出空氣的方向畫出來；兩外側介質相同且界面平行時，出射光與入射光平行。' },
                'AST-111-25': { lab: 'diffraction', mode: 'huygens', guide: '<b>看縫寬與波長的比例</b>：把 $a/\\lambda$ 調到小於 1。此時第一暗紋條件 $a\\sin\\theta=\\lambda$ 無解；波向兩側擴散，但各方向強度不一定相等。' },
                'DRTE-110-17': { lab: 'ripple', mode: 'refract', guide: '💡 <b>水波深淺水折射輔助思考</b>：切換至「水波折射」模式，觀察直線波由深水進入淺水時波速變慢、波長縮短（波前變密）並偏向法線！' },
                'DRTE-110-23': { lab: 'young', mode: 'setup', guide: '<b>先看雙狹縫間距</b>：中央附近 $\\Delta y\\approx L\\lambda/d$。再對照單狹縫中央寬度 $2L\\lambda/a$，留意兩式中的長度代表不同幾何量。' },
                'DRTE-109-06': { lab: 'pipes', mode: 'closed', guide: "💡 <b>開管 vs 閉管諧音輔助思考</b>：切換「開管」與「閉管」，比較開管基音 $f = \\frac{v}{2L}$ 與閉管第一泛音/第三諧音 $f = \\frac{3v}{4L'}$ 的管長比！" },
                'N14-LAKE-1': { lab: 'apparent_depth', mode: 'practice', guide: '<b>湖邊玩水</b>：在「評估練習」模式先換算實際深度，再看水面落在身體哪個位置；按「換一題」換身高與深度。' },
                'N14-LAKE-2': { lab: 'apparent_depth', mode: 'practice', guide: '<b>同一個湖、不同身高</b>：在「評估練習」模式作答後，比較實際水位與「以為的水位」。' },
                'N14-LAKE-4': { lab: 'apparent_depth', mode: 'practice', guide: '<b>看起來一張課桌深？</b>在「評估練習」模式用生活物品出題，揭曉後同一個物品會放到實際湖底，看出還差多少。' },
                'N14-LAKE-3': { lab: 'apparent_depth', mode: 'practice', guide: '<b>看起來只到膝蓋？</b>在「評估練習」模式揭曉後，對照膝、胯、肚臍的高度。' },
                'N15-FIBER-1': { lab: 'fiber', mode: 'step', guide: '<b>接受角</b>：「射入的光」選「一條光線」，慢慢加大入射角：入射角越大，打到界面的入射角越小；超過紫色虛線（接受角）就小於臨界角而漏光。' },
                'N15-FIBER-2': { lab: 'fiber', mode: 'bend', guide: '<b>讓光纖轉彎</b>：拖曳畫布或調小彎曲半徑，看光從彎曲外側漏出；再把包層折射率調小，比較是否比較不怕彎。' },
                'N15-FIBER-3': { lab: 'fiber', mode: 'step', guide: '<b>脈衝被拉寬</b>：觀察白點同時出發、到達出口的先後，再看右上方的輸出脈衝。' },
                'N15-HALFCYL-1': { lab: 'halfcyl', mode: 'five', guide: '<b>五條平行光</b>：看哪幾條光高於紫色的臨界高度 R/n；再拖曳丙、丁的高度，找出剛好開始全反射的位置。' },
                'N15-MIRAGE-1': { lab: 'mirage', mode: 'road', guide: '<b>炎熱路面</b>：把「路面比上方空氣熱」調大，看光如何轉彎往上，右上角就出現「積水」和倒立的車。' },
                'N08-NIGHT-1': { lab: 'mirage', mode: 'nightSound', guide: '<b>晚上與白天</b>：切換「時間」，比較聲音往下彎回地面（晚上）和往上彎、出現聲影區（白天）。' },
                'DRTE-109-14': { lab: 'snell', mode: null, guide: '<b>逐一畫界面</b>：觀察高、低折射率之間的偏折方向。題目夾層的兩界面平行，且兩外側介質相同，因此出射方向與入射方向平行。' }
            };

            if (specificOverrides[qid]) {
                return {
                    labId: specificOverrides[qid].lab,
                    mode: specificOverrides[qid].mode,
                    guide: specificOverrides[qid].guide
                };
            }

            const nodeMetaLab = nodeMeta[q.node] ? nodeMeta[q.node].lab : null;
            if (!nodeMetaLab) return null;
            const labId = Array.isArray(nodeMetaLab) ? nodeMetaLab[0] : nodeMetaLab;
            if (!LABS[labId]) return null;

            return {
                labId,
                mode: null,
                guide: `💡 <b>觀念實作驗證</b>：動手調整下方實驗參數，即時觀察物理現象與波形變化，輔助思考本題解法！`
            };
        }

        function toggleQuizLab(qid, targetLabId, suggestedMode) {
            const box = document.getElementById(`quiz-lab-box-${qid}`);
            const btn = document.getElementById(`quiz-lab-btn-${qid}`);
            if (!box || !btn) return;

            if (box.style.display !== 'none') {
                if (activeQuizLabDisposers.has(qid)) {
                    activeQuizLabDisposers.get(qid).dispose();
                    activeQuizLabDisposers.delete(qid);
                }
                box.style.display = 'none';
                box.innerHTML = '';
                btn.classList.remove('is-open');
                btn.innerHTML = `🔬 動手做實驗：${labMeta[targetLabId] ? labMeta[targetLabId].name : '互動模擬'}`;
                return;
            }

            if (activeQuizLabDisposers.has(qid)) {
                activeQuizLabDisposers.get(qid).dispose();
                activeQuizLabDisposers.delete(qid);
            }

            const q = findQuestion(qid);
            const labConf = q ? getQuizLabConfig(q) : { labId: targetLabId, mode: suggestedMode, guide: '' };
            const labId = labConf ? labConf.labId : targetLabId;
            const mode = (labConf && labConf.mode) || suggestedMode || null;
            const guideHtml = (labConf && labConf.guide) ? `<div class="quiz-lab-guide">${labConf.guide}</div>` : '';

            const prefix = `q-${qid}-`;
            box.innerHTML = `
                ${guideHtml}
                ${labShellHtml(labId, prefix)}
            `;
            box.style.display = 'block';
            btn.classList.add('is-open');
            btn.innerHTML = `🔼 收合實驗（${labMeta[labId] ? labMeta[labId].name : '互動模擬'}）`;

            const disposers = WaveRuntime.createDisposerRegistry(`quiz-${qid}`);
            activeQuizLabDisposers.set(qid, disposers);
            mountLab(labId, mode, prefix, disposers);
            scheduleMathJax(box);
        }

        function quizCardHtml(q, index) {
            const qid = questionId(q);
            const opts = q.opts.map((o, i) =>
                `<button type="button" class="quiz-opt" aria-pressed="false" data-i="${i}" onclick="pickQuizOption('${qid}', ${i})">${o.t}<span class="quiz-why" style="display:none;">${o.why}</span></button>`
            ).join('');
            const examBadge = q.examYear ? `<span class="quiz-tag exam-badge">🎯 ${q.examYear}</span>` : '';
            const sourceBadge = q.source ? `<span class="quiz-tag source-badge">${q.source}</span>` : '';
            const figHtml = q.image ? `
                <div class="quiz-fig-box">
                    <div class="quiz-fig-header">
                        <span class="quiz-fig-seal">🏛️ 大考中心官方試題卷原始截圖</span>
                        <span class="quiz-fig-src">${q.source || q.examYear}</span>
                    </div>
                    <img src="${q.image}" alt="${q.imageCaption || '試題配圖'}" class="quiz-fig-img" loading="lazy" />
                    ${q.imageCaption ? `<div class="quiz-fig-cap">📌 ${q.imageCaption}</div>` : ''}
                </div>` : '';

            const labConf = getQuizLabConfig(q);
            const labBtn = labConf ? `<button type="button" class="chip-btn quiz-lab-btn" id="quiz-lab-btn-${qid}" onclick="toggleQuizLab('${qid}', '${labConf.labId}', '${labConf.mode || ''}')">🔬 動手做實驗：${labMeta[labConf.labId] ? labMeta[labConf.labId].name : '互動模擬'}</button>` : '';

            return `
                <div class="card quiz-card" id="quiz-${qid}" data-qid="${qid}">
                    <div class="quiz-meta">
                        ${examBadge}
                        ${sourceBadge}
                        <span class="quiz-tag" style="cursor:pointer;" onclick="navigateTo('node-${q.node}')">${q.node}　${nodeMeta[q.node].title}</span>
                        <span class="quiz-tag level-${q.level}">${q.level}</span>
                        <span class="quiz-tag">${q.type === 'multi' ? '多選' : '單選'}</span>
                        <span class="quiz-tag">${nodeMeta[q.node].section}</span>
                    </div>
                    <div class="quiz-q">${index + 1}. ${q.q}</div>
                    ${figHtml}
                    <div class="quiz-opts">${opts}</div>
                    <div class="quiz-actions">
                        <button class="chip-btn" onclick="submitQuiz('${qid}')">送出作答</button>
                        <button class="chip-btn" onclick="revealQuiz('${qid}')">直接看答案</button>
                        <button class="chip-btn" onclick="resetQuiz('${qid}')">重做</button>
                        ${labBtn}
                    </div>
                    <div class="quiz-result" role="status" aria-live="polite"></div><div class="quiz-exp" style="display:none;"><b>觀念總結：</b>${q.exp}</div>
                    <div class="quiz-lab-box" id="quiz-lab-box-${qid}" style="display:none;"></div>
                </div>`;
        }

        function findQuestion(qid) {
            return questionBank.find((q) => questionId(q) === qid);
        }

        function pickQuizOption(qid, idx) {
            const q = findQuestion(qid);
            const host = document.getElementById(`quiz-${qid}`);
            if (!q || !host || host.dataset.done === '1') return;
            const btns = host.querySelectorAll('.quiz-opt');
            if (q.type === 'multi') btns[idx].classList.toggle('picked');
            else { btns.forEach((b) => b.classList.remove('picked')); btns[idx].classList.add('picked'); }
            btns.forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('picked'))));
        }

        function gradeQuiz(qid, forceReveal) {
            const q = findQuestion(qid);
            const host = document.getElementById(`quiz-${qid}`);
            if (!q || !host || host.dataset.done === '1') return;
            const btns = host.querySelectorAll('.quiz-opt');
            const picked = [];
            btns.forEach((b, i) => { if (b.classList.contains('picked')) picked.push(i); });
            if (!forceReveal && picked.length === 0) { host.querySelector('.quiz-result').textContent = '先選擇一個答案，再送出。'; return; }

            let allRight = true;
            btns.forEach((b, i) => {
                const correct = Boolean(q.opts[i].c);
                b.classList.remove('picked');
                if (correct) b.classList.add('right');
                else if (picked.includes(i)) { b.classList.add('wrong'); allRight = false; }
                if (correct && !picked.includes(i)) allRight = false;
                b.querySelector('.quiz-why').style.display = 'block';
            });
            const saved = forceReveal ? true : allRight ? unmarkWrong(qid) : markWrong(qid);
            // 登入線上練習時，同步記錄到 Gavin Physics 練習系統（IRT 只採第一次作答；只看答案不記錄）
            if (!forceReveal && window.GPRecord) window.GPRecord('wave', q.node, q.q, picked.slice().sort().map(i => 'ABCDE'[i]).join(''), 'wave ' + q.node);
            host.querySelector('.quiz-result').textContent = forceReveal ? '答案已展開，這次不計入錯題紀錄。' : allRight ? '答對了。看看解析，確認你的理由。' : saved ? '再看一次解析；這題已收進錯題本，可按「重做」再試。' : '再看一次解析，可按「重做」再試。目前瀏覽器無法儲存錯題。';
            host.querySelector('.quiz-exp').style.display = 'block';
            host.dataset.done = '1';
            scheduleMathJax(host);
        }

        function submitQuiz(qid) { gradeQuiz(qid, false); }
        function revealQuiz(qid) { gradeQuiz(qid, true); }

        function resetQuiz(qid) {
            const host = document.getElementById(`quiz-${qid}`);
            if (!host) return;
            host.dataset.done = '';
            host.querySelector('.quiz-result').textContent = '';
            host.querySelectorAll('.quiz-opt').forEach((b) => {
                b.classList.remove('picked', 'right', 'wrong');
                b.setAttribute('aria-pressed', 'false');
                b.querySelector('.quiz-why').style.display = 'none';
            });
            host.querySelector('.quiz-exp').style.display = 'none';
        }

        /* setQuizFilter is in assets/js/learner-ui.js. */

        /* renderQuizView is in assets/js/learner-ui.js. */

        function renderWrongBookView() {
            const ids = loadWrongBook();
            const list = ids.map(findQuestion).filter(Boolean);
            const body = list.length
                ? list.map((q, i) => quizCardHtml(q, i)).join('')
                : '<div class="card quiz-empty">錯題本目前是空的。到「分級題庫」作答後，答錯的題目會自動收進這裡。</div>';

            document.getElementById('main-content').innerHTML = `
                <div class="view-header">
                    <span class="view-eyebrow">複習工具箱</span>
                    <h2>錯題本</h2>
                    <p>紀錄保存在這台裝置的瀏覽器中，不會上傳。重做並全部答對後，該題會自動從錯題本移除。</p>
                </div>
                <div class="quiz-toolbar">
                    <button class="chip-btn" onclick="clearWrongBook()">清空錯題本</button>
                    <button class="chip-btn" onclick="navigateTo('tool-quiz')">回到分級題庫</button>
                </div>
                <div class="callout info">目前錯題本共有 <b>${list.length}</b> 題。</div>
                ${body}`;
        }

        function clearWrongBook() {
            saveWrongBook([]);
            renderWrongBookView();
            updateWrongBadge();
        }

