// 核心：路由、檢視生命週期、MathJax 排程、導覽、首頁與節點頁
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        let lastRenderedRoute = null;
        let viewLifecycleRevision = 0;
        let activeViewDisposers = PhysicsRuntime.createDisposerRegistry('initial-view');
        let mathJaxRequestRevision = 0;
        let mathJaxTimer = null;
        let mathJaxChain = Promise.resolve();
        const mathJaxPendingTargets = new Set();
        let mathJaxAfterCallbacks = [];

        function registerViewDisposer(disposer) {
            return activeViewDisposers.add(disposer);
        }

        function addViewEventListener(target, type, listener, options) {
            return activeViewDisposers.listen(target, type, listener, options);
        }

        function cancelScheduledMathJax() {
            mathJaxRequestRevision += 1;
            if (mathJaxTimer !== null) {
                clearTimeout(mathJaxTimer);
                mathJaxTimer = null;
            }
            mathJaxPendingTargets.clear();
            mathJaxAfterCallbacks = [];
        }

        function scheduleMathJax(targets, { delay = 40, after } = {}) {
            const revision = mathJaxRequestRevision;
            if (mathJaxTimer !== null) clearTimeout(mathJaxTimer);
            const requestedTargets = (targets && targets.length ? targets : [document.getElementById('main-content')]).filter(Boolean);
            requestedTargets.forEach(target => mathJaxPendingTargets.add(target));
            if (typeof after === 'function') mathJaxAfterCallbacks.push(after);

            mathJaxTimer = setTimeout(() => {
                mathJaxTimer = null;
                const batchTargets = Array.from(mathJaxPendingTargets);
                const callbacks = mathJaxAfterCallbacks;
                mathJaxPendingTargets.clear();
                mathJaxAfterCallbacks = [];
                mathJaxChain = mathJaxChain.catch(() => undefined).then(async () => {
                    if (revision !== mathJaxRequestRevision) return false;
                    const engine = window.MathJax;
                    if (!engine || typeof engine.typesetPromise !== 'function') return false;
                    const liveTargets = batchTargets.filter(target => target === document || document.contains(target));
                    if (!liveTargets.length) return false;
                    // 同一批次若同時含祖先與後代（例如 restoreBankStates 排入各個回饋區、
                    // 隨後 render 又排入整個 main），MathJax 會先改寫後代的文字節點，
                    // 再處理祖先時偏移量已失效而丟出 splitText IndexSizeError，
                    // 導致排版中途中斷、後面的 $...$ 原封不動顯示成原始碼。
                    // 只保留最外層節點即可涵蓋全部內容。
                    const roots = liveTargets.filter(t => !liveTargets.some(
                        other => other !== t && other !== document && other.contains && other.contains(t)
                    ));
                    await engine.typesetPromise(roots);
                    if (revision !== mathJaxRequestRevision) return false;
                    callbacks.forEach(callback => callback());
                    return true;
                }).catch(error => {
                    if (revision === mathJaxRequestRevision) {
                        console.warn('[MathJax] Typesetting failed.', error);
                    }
                    return false;
                });
            }, delay);
            return revision;
        }

        function resetViewLifecycle(route = 'view') {
            cancelScheduledMathJax();
            activeViewDisposers.dispose();
            viewLifecycleRevision += 1;
            activeViewDisposers = PhysicsRuntime.createDisposerRegistry(`${route}-${viewLifecycleRevision}`);
        }

        function getViewLifecycleDiagnostics() {
            return {
                route: lastRenderedRoute,
                revision: viewLifecycleRevision,
                disposerCount: activeViewDisposers.size,
                mathJaxRevision: mathJaxRequestRevision,
                mathJaxScheduled: mathJaxTimer !== null,
                generatorRenderer: Boolean(typeof gen3DState !== 'undefined' && gen3DState.renderer),
                inductionRenderer: Boolean(typeof induction3D !== 'undefined' && induction3D.renderer)
            };
        }

        function cleanupCurrentView() {
            resetViewLifecycle(lastRenderedRoute || 'view');
            if (typeof disposeAllCanvasStates === 'function') {
                disposeAllCanvasStates();
            }
            if (typeof dispose3DGenerator === 'function') dispose3DGenerator();
            if (typeof dispose3DInduction === 'function') dispose3DInduction();
            if (window.labAnimationFrame) {
                cancelAnimationFrame(window.labAnimationFrame);
                window.labAnimationFrame = null;
            }
            if (rutherfordSimInterval) {
                cancelAnimationFrame(rutherfordSimInterval);
                rutherfordSimInterval = null;
            }
            rutherfordActiveParticles = [];
            if (typeof generatorState !== 'undefined' && generatorState.raf) {
                cancelAnimationFrame(generatorState.raf);
                generatorState.raf = null;
                generatorState.playing = false;
                generatorState.clock = null;
                generatorState._instanceId++;
            }
            if (typeof generatorState !== 'undefined' && generatorState._resizeObserver) {
                generatorState._resizeObserver.disconnect();
                generatorState._resizeObserver = null;
            }
            if (typeof waveSimState !== 'undefined' && waveSimState.raf) {
                cancelAnimationFrame(waveSimState.raf);
                waveSimState.raf = null;
            }
            if (typeof peSimState !== 'undefined' && peSimState.raf) {
                cancelAnimationFrame(peSimState.raf);
                peSimState.raf = null;
                peSimState.clock = null;
            }
            if (hertzExperimentState) {
                hertzExperimentState.destroy();
                hertzExperimentState = null;
            }
            if (window.matchMedia('(max-width: 1024px)').matches) {
                const sidebar = document.getElementById('sidebar');
                const toggle = sidebar.querySelector('.mobile-nav-toggle');
                sidebar.classList.remove('mobile-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', '開啟導覽選單');
                toggle.querySelector('span').textContent = '☰';
            }
            document.querySelectorAll('video').forEach(vid => vid.pause());
        }

        function routeFromLocation() {
            return decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
        }

        function routeNavKey(route) {
            if (route.startsWith('bank-')) return 'tool-quiz';
            if (route.startsWith('exams-')) return 'tool-exams';
            if (route.startsWith('lab-')) return 'tool-lab';
            if (route.startsWith('topic-')) return `node-${route.slice(6)}`;
            return route;
        }

        function activateNavForRoute(route) {
            const key = routeNavKey(route);
            document.querySelectorAll('.nav-item, .nav-module-header').forEach(el => {
                el.classList.toggle('active', el.dataset.route === key);
            });
        }

        function routeLabel(route) {
            if (route === 'home') return '<strong>學習首頁</strong>';
            if (route.startsWith('node-')) {
                const node = knowledgeNodes.find(n => n.id === route.slice(5));
                return node ? `學習首頁　›　${modulesData[node.module].title}　›　<strong>${node.id} ${node.name}</strong>` : '學習首頁';
            }
            if (route.startsWith('module-')) {
                const data = modulesData[parseInt(route.slice(7))];
                return data ? `學習首頁　›　<strong>${data.title}</strong>` : '學習首頁';
            }
            if (route.startsWith('bank-')) return `學習首頁　›　題庫　›　<strong>${nodeLabel(route.slice(5))}</strong>`;
            if (route.startsWith('exams-')) return `學習首頁　›　歷屆試題　›　<strong>${nodeLabel(route.slice(6))}</strong>`;
            if (route.startsWith('lab-')) return `學習首頁　›　互動實驗　›　<strong>${nodeLabel(route.slice(4))}</strong>`;
            if (route.startsWith('topic-')) return `學習首頁　›　節點專題　›　<strong>${route.slice(6)} ${nodeLabel(route.slice(6))}</strong>`;
            const labels = {
                'tool-summary': '物理核心總整理',
                'tool-contexts': '常考情境專欄',
                'tool-lab': '互動物理實驗室',
                'tool-quiz': '知識節點分級題庫',
                'tool-exams': '歷屆試題練習',
                'tool-taxonomy': '歷屆題分類校對',
                'tool-diagnose': '15 分鐘診斷卷',
                'tool-wrong': '錯題本',
                'tool-stats': '五年命題矩陣',
                'tool-buster': '素養包裝破解器'
            };
            return `學習首頁　›　<strong>${labels[route] || '物理複習'}</strong>`;
        }

        function renderRoute(route) {
            cleanupCurrentView();
            activateNavForRoute(route);
            const main = document.getElementById('main-content');
            main.classList.remove('animate-in');
            void main.offsetWidth;
            main.classList.add('animate-in');
            const breadcrumb = document.getElementById('view-breadcrumb');
            breadcrumb.innerHTML = routeLabel(route);
            const currentLabel = breadcrumb.textContent.split('›').pop().trim() || '學習首頁';
            document.title = `${currentLabel}｜學測物理複習系統`;
            lastRenderedRoute = route;

            if (route === 'home') {
                renderHomeView();
            } else if (route.startsWith('node-')) {
                renderNodeView(route.slice('node-'.length));
            } else if (route.startsWith('module-')) {
                const moduleNum = parseInt(route.split('-')[1]);
                renderModuleOverviewView(moduleNum);
            } else if (route.startsWith('bank-')) {
                const nodeId = route.slice('bank-'.length);
                const node = knowledgeNodes.find(n => n.id === nodeId);
                bankFilter = { module: node ? String(node.module) : 'all', node: nodeId, level: 'all', type: 'all' };
                renderBankView();
            } else if (route.startsWith('exams-')) {
                examNodeFilter = route.slice('exams-'.length);
                examYearFilter = 'all';
                renderExamsView();
            } else if (route.startsWith('lab-')) {
                renderInteractiveLabForNode(route.slice('lab-'.length));
            } else if (route.startsWith('topic-')) {
                renderNodeTopicView(route.slice('topic-'.length));
            } else if (route === 'tool-lab') {
                renderInteractiveLab();
            } else if (route === 'tool-summary') {
                renderSummaryView();
            } else if (route === 'tool-contexts') {
                renderContextsView();
            } else if (route === 'tool-stats') {
                renderStatsView();
            } else if (route === 'tool-buster') {
                renderBusterView();
            } else if (route === 'tool-quiz') {
                bankFilter = { module: 'all', node: 'all', level: 'all', type: 'all' };
                renderBankView();
            } else if (route === 'tool-exams') {
                examNodeFilter = 'all';
                renderExamsView();
            } else if (route === 'tool-taxonomy') {
                renderTaxonomyReviewView();
            } else if (route === 'tool-wrong') {
                renderWrongView();
            } else if (route === 'tool-diagnose') {
                renderDiagnoseView();
            } else {
                navigateTo('home', { replace: true });
                return;
            }
            window.scrollTo(0, 0);
        }

        function navigateTo(targetId, options = {}) {
            const nextHash = `#${encodeURIComponent(targetId)}`;
            const currentRoute = routeFromLocation();
            if (currentRoute === targetId && !options.replace) {
                renderRoute(targetId);
                return;
            }
            const currentDepth = Number(history.state && history.state.physicsDepth) || 0;
            const state = {
                physicsApp: true,
                physicsRoute: targetId,
                physicsDepth: options.replace ? currentDepth : currentDepth + 1
            };
            if (options.replace) history.replaceState(state, '', nextHash);
            else history.pushState(state, '', nextHash);
            renderRoute(targetId);
        }

        function goBackInApp() {
            const depth = Number(history.state && history.state.physicsDepth) || 0;
            if (depth > 0) history.back();
            else navigateTo('home', { replace: true });
        }

        function switchMainView(navEl, targetId) {
            navigateTo(targetId);
        }

        function toggleMobileNav(button) {
            const sidebar = document.getElementById('sidebar');
            const isOpen = sidebar.classList.toggle('mobile-open');
            button.setAttribute('aria-expanded', String(isOpen));
            button.setAttribute('aria-label', isOpen ? '關閉導覽選單' : '開啟導覽選單');
            button.querySelector('span').textContent = isOpen ? '×' : '☰';
        }

        function renderHomeView() {
            const main = document.getElementById('main-content');
            const recentExamGroups = examPractice.filter(e => ['111', '112', '113', '114', '115'].includes(e.year)).length;
            const moduleCards = Object.keys(modulesData).map(Number).sort((a, b) => a - b).map(moduleNum => {
                const data = modulesData[moduleNum];
                const count = knowledgeNodes.filter(n => n.module === moduleNum).length;
                return `
                    <button class="module-route-card" type="button" onclick="navigateTo('module-${moduleNum}')">
                        <small>模組 ${moduleNum} · ${count} 個節點</small>
                        <strong>${data.title.replace(/^模組\s*\d+：/, '')}</strong>
                        <span>${data.subtitle}</span>
                    </button>
                `;
            }).join('');

            main.innerHTML = `
                <section class="home-hero">
                    <div>
                        <span class="home-kicker">PHYSICS STUDY COMPASS · 學習羅盤</span>
                        <h2>先選今天要完成的任務，不必在一張長頁裡迷路。</h2>
                        <p>複習觀念、練習題目與操作實驗已分成三條路徑；每個頁面都有上一頁、首頁與可分享網址。</p>
                    </div>
                    <div class="home-start">
                        <div class="home-start-card">
                            <strong>建議起點：先找弱點</strong>
                            <span>不知道從哪讀起？先花 15 分鐘做診斷卷，直接得到「該補哪些節點」的排序清單。</span>
                            <button class="home-primary-btn" type="button" onclick="navigateTo('tool-diagnose')">做 15 分鐘診斷卷 →</button>
                            <button class="route-link-btn" type="button" style="margin-top:0.5rem;" onclick="navigateTo('tool-stats')">或直接看命題矩陣</button>
                        </div>
                    </div>
                </section>

                <div class="study-lanes" aria-label="三種學習路徑">
                    <section class="study-lane" style="--lane-accent:#5f8a5c;">
                        <h3>01｜複習觀念</h3>
                        <p>依 7 大模組或 28 個節點閱讀公式、圖解與常見陷阱。</p>
                        <div class="study-lane-actions">
                            <button class="route-link-btn" type="button" onclick="navigateTo('module-1')">從模組開始</button>
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-summary')">核心總整理</button>
                        </div>
                    </section>
                    <section class="study-lane" style="--lane-accent:#c0603a;">
                        <h3>02｜練習與訂正</h3>
                        <p>${questionBank.length} 題分級題庫、${recentExamGroups} 組近五年歷屆與錯題追蹤。</p>
                        <div class="study-lane-actions">
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-quiz')">分級題庫</button>
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-exams')">歷屆試題</button>
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-taxonomy')">分類校對</button>
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-wrong')">錯題本</button>
                        </div>
                    </section>
                    <section class="study-lane" style="--lane-accent:#ba7216;">
                        <h3>03｜操作與觀察</h3>
                        <p>把波動、光電效應、黑體輻射、電磁感應與天體運行獨立到實驗室。</p>
                        <div class="study-lane-actions">
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-lab')">互動實驗室</button>
                            <button class="route-link-btn" type="button" onclick="navigateTo('tool-contexts')">常考情境</button>
                        </div>
                    </section>
                </div>

                <div class="handout-section-title">7 大模組</div>
                <div class="module-route-grid">${moduleCards}</div>
                <div class="classification-note">
                    <strong>分類方式：</strong>歷屆題目只標示完成作答需要的相關知識節點，不區分主次。近五年統計只計 111–115 正式學測；111 官方參考卷另列，不混入五年命題數。
                </div>
            `;
        }

        // 從節點頁點回模組總覽（renderModuleView）：清掉側欄 active、改標對應的模組標題
        function goToModuleOverview(moduleNum) {
            navigateTo(`module-${moduleNum}`);
        }

        const nodeInteractiveLabs = {
            N07: { lab: 'astronomy', title: '天體運行與行星逆行（地心說 vs. 日心說）' },
            N14: { lab: 'wave', mode: 'huygens', title: '波動傳播與惠更斯原理' },
            N15: { lab: 'wave', mode: 'doppler', title: '聲波與都卜勒效應' },
            N16: { lab: 'wave', mode: 'refraction', title: '光的反射與折射' },
            N17: { lab: 'wave', mode: 'interference', title: '干涉、繞射與波動性' },
            N18: { custom: 'hertz', title: '電荷運動、方向判斷與赫茲火花實驗' },
            N21: { lab: 'induction', title: '電磁感應與磁場變化' },
            N23: { lab: 'photo', title: '光電效應實驗' },
            N28: { lab: 'blackbody', title: '普朗克量子論與黑體輻射' }
        };

        const nodeTopicSections = {
            N01: { title: 'SI 單位與因次分析專題', html: () => siSectionHtml() },
            N02: { title: '尺度、數量級與費米估算專題', html: () => scaleSectionHtml() },
            N03: { title: '運動圖形判讀專題', html: () => kinematicsGraphsHtml() },
            N05: { title: '空氣阻力與終端速度專題', html: () => airResistanceSectionHtml() },
            N06: { title: '粒子實驗與原子結構專題', html: () => matterSectionHtml() },
            N07: { title: '克卜勒定律與行星軌道專題', html: () => keplerSectionHtml() },
            N15: { title: '都卜勒效應與波長變化機制專題（含動態圖解與音障分析）', html: () => dopplerSectionHtml() },
            N18: { title: '電磁波譜專題', html: () => emSpectrumSectionHtml() },
            N19: { title: '靜電與庫侖力專題', html: () => electrostaticsSectionHtml() },
            N20: { title: '電流磁效應專題', html: () => magnetismSectionHtml() },
            N21: { title: '發電機與電磁感應專題', html: () => generatorSimHtml() + electromagneticInductionSectionHtml() },
            N23: { title: '光電效應證據鏈專題', html: () => photoelectricSectionHtml() },
            N27: { title: '四大基本交互作用專題', html: () => fourForcesSectionHtml() },
            N28: { title: '黑體輻射與量子論專題', html: () => blackbodyQuantumSectionHtml() }
        };

        function openBankForNode(nodeId) {
            navigateTo(`bank-${nodeId}`);
        }

        function openLabForNode(nodeId) {
            if (nodeInteractiveLabs[nodeId]) navigateTo(`lab-${nodeId}`);
            else navigateTo('tool-lab');
        }

        function openTopicForNode(nodeId) {
            if (nodeTopicSections[nodeId]) navigateTo(`topic-${nodeId}`);
        }

        // ===== 先判斷再解鎖：probe（概念卡）與 featureCheck（解題特徵）=====
        // 目的是製造「已承諾一個答案」的狀態，之後的說明才會產生修正效果；
        // 不計分、不阻擋，答錯一樣看得到完整內容。
        const probeIndex = {};
        const fcheckIndex = {};

        function probePick(uid, idx) {
            const entry = probeIndex[uid];
            if (!entry) return;
            const box = document.getElementById('probe-' + uid);
            if (!box || box.dataset.done) return;
            box.dataset.done = '1';
            const opts = entry.probe.opts;
            box.querySelectorAll('.probe-opt').forEach((b, i) => {
                b.disabled = true;
                if (opts[i] && opts[i].c) b.classList.add('correct');
                else if (i === idx) b.classList.add('wrong');
            });
            const picked = opts[idx] || {};
            const hasKey = opts.some(o => o.c);
            const hint = box.querySelector('.probe-hint');
            if (hint) {
                hint.innerHTML = hasKey
                    ? (picked.c ? '✅ 答對了——往下對照完整說明，確認你的理由也對。'
                                : '❌ 這正是最多人卡住的地方，往下看說明時特別注意。')
                    : '已記錄你的判斷，往下對照說明。';
            }
            const reveal = document.getElementById('reveal-' + uid);
            if (reveal) {
                reveal.style.display = '';
                if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([reveal]);
            }
            if (hasKey) recordResult('bank', 'probe_' + uid, !!picked.c, entry.nodeId);
        }

        function featureCheck(fuid, idx) {
            const entry = fcheckIndex[fuid];
            if (!entry) return;
            const box = document.getElementById('fcheck-' + fuid);
            if (!box || box.dataset.done) return;
            box.dataset.done = '1';
            const opts = entry.check.opts;
            box.querySelectorAll('.probe-opt').forEach((b, i) => {
                b.disabled = true;
                if (opts[i] && opts[i].c) b.classList.add('correct');
                else if (i === idx) b.classList.add('wrong');
            });
            const ok = !!(opts[idx] && opts[idx].c);
            const bridge = document.getElementById('fb-' + fuid);
            const trap = document.getElementById('ft-' + fuid);
            // 答錯的人先看陷阱（他剛剛就是這樣想的），答對的人先看解法
            [bridge, trap].forEach(el => { if (el) el.style.display = ''; });
            if (!ok && bridge && trap && trap.parentNode) trap.parentNode.insertBefore(trap, bridge);
            const target = ok ? bridge : trap;
            if (target && window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([bridge, trap].filter(Boolean));
            recordResult('bank', 'fcheck_' + fuid, ok, entry.nodeId);
        }

        function selfCheckDone(nodeId, ok) {
            recordResult('bank', 'selfcheck_' + nodeId, ok, nodeId);
            const box = document.getElementById('self-check-' + nodeId);
            if (box) {
                box.innerHTML = ok
                    ? '<div class="self-check-title">✅ 已記錄：這一節你說得出來</div><div style="font-size:0.86rem; color:var(--text-muted);">建議 3-5 天後回來再測一次，間隔複習記得最牢。</div>'
                    : '<div class="self-check-title">🔁 已標記為待複習</div><div style="font-size:0.86rem; color:var(--text-muted);">卡住的地方已計入你的掌握度，命題矩陣與錯題本都看得到。</div>';
            }
        }

        // ===== 題目裁切圖放大檢視 =====
        // 手機上 1100px 寬的裁切圖被縮到約 270px（0.25 倍），11pt 的題目字剩約 3px。
        // 點圖後以原始尺寸開全螢幕、可自由捲動與縮放倍率。
        let zoomState = { scale: 1, img: null };

        function openCropZoom(imgEl) {
            if (!imgEl || !imgEl.src) return;
            closeCropZoom();
            const natural = imgEl.naturalWidth || 1100;
            // 預設放到「看得清楚」的倍率：至少原始大小，最多不超過視窗寬的 2.5 倍
            const fitScale = Math.min(2.5, Math.max(1, window.innerWidth / natural * 2.2));
            zoomState.scale = fitScale;
            const ov = document.createElement('div');
            ov.className = 'zoom-overlay';
            ov.id = 'crop-zoom-overlay';
            ov.innerHTML = `
                <div class="zoom-overlay-bar">
                    <span>雙指或按鈕縮放，可自由捲動</span>
                    <span style="display:flex; gap:0.4rem;">
                        <button type="button" onclick="zoomCropBy(-0.4)">− 縮小</button>
                        <button type="button" onclick="zoomCropBy(0.4)">＋ 放大</button>
                        <button type="button" onclick="closeCropZoom()">✕ 關閉</button>
                    </span>
                </div>
                <div class="zoom-overlay-body" id="crop-zoom-body">
                    <img src="${imgEl.src}" alt="${imgEl.alt || '題目放大檢視'}" class="${imgEl.classList.contains('inverted') ? 'inverted' : ''}">
                </div>`;
            document.body.appendChild(ov);
            document.body.style.overflow = 'hidden';
            zoomState.img = ov.querySelector('img');
            applyCropZoom();
            ov.addEventListener('click', e => { if (e.target === ov) closeCropZoom(); });
        }

        function applyCropZoom() {
            const img = zoomState.img;
            if (!img) return;
            const w = (img.naturalWidth || 1100) * zoomState.scale;
            img.style.width = w + 'px';
            img.style.maxWidth = 'none';
        }

        function zoomCropBy(d) {
            zoomState.scale = Math.min(6, Math.max(0.4, zoomState.scale + d));
            applyCropZoom();
        }

        function closeCropZoom() {
            const ov = document.getElementById('crop-zoom-overlay');
            if (ov) ov.remove();
            document.body.style.overflow = '';
            zoomState.img = null;
        }

        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCropZoom(); });
        // 事件委派：裁切圖是動態插入的，逐一綁定會漏掉之後渲染的
        document.addEventListener('click', e => {
            const img = e.target.closest && e.target.closest('img.exam-crop');
            if (img) openCropZoom(img);
        });

        // 總整理頁的章節跳轉：不能用 href="#id"，因為整站是 hash router，
        // 會被當成不存在的路由而把使用者踢回首頁。
        function scrollToSummary(id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function nodeInteractiveLabSectionHtml(nodeId) {
            const config = nodeInteractiveLabs[nodeId];
            if (!config) return '';
            return `
                <div class="handout-section-title">🔬 節點互動實驗｜${config.title}</div>
                <div id="node-interactive-lab" data-node="${nodeId}"></div>
            `;
        }

        function mountNodeInteractiveLab(nodeId) {
            const config = nodeInteractiveLabs[nodeId];
            const mount = document.getElementById('node-interactive-lab');
            if (!config || !mount) return false;
            mount.innerHTML = interactiveLabHtml();
            const header = mount.querySelector('.content-header');
            const switcher = mount.querySelector('.lab-switcher');
            if (header) header.remove();
            if (switcher && Array.isArray(config.labs)) {
                switcher.querySelectorAll('.lab-switch-btn').forEach(btn => {
                    if (!config.labs.includes(btn.dataset.lab)) btn.remove();
                });
                config.labs.forEach(labName => {
                    const btn = switcher.querySelector(`[data-lab="${labName}"]`);
                    if (btn) switcher.appendChild(btn);
                });
            } else if (switcher) {
                switcher.remove();
            }
            initializeInteractiveLab(config.lab, config.mode || 'reflection');
            if (config.lab === 'induction') {
                const auto = document.getElementById('ind-auto');
                if (auto) auto.checked = true;
                window.physicsLab.inductionStep = 3;
                document.querySelectorAll('.induction-step-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.step === '3'));
                updateInductionReadouts();
            }
            return true;
        }

        // 由 knowledgeNodes + modulesData 動態產生側欄的節點清單（依模組分組、模組標題可點回模組總覽）
        function buildNodeSidebar() {
            const list = document.getElementById('node-nav-list');
            let html = '';
            Object.keys(modulesData).map(Number).sort((a, b) => a - b).forEach(moduleNum => {
                html += `<li><a class="nav-module-header" data-route="module-${moduleNum}" onclick="switchMainView(this, 'module-${moduleNum}')">${modulesData[moduleNum].title}</a></li>`;
                knowledgeNodes.filter(n => n.module === moduleNum).forEach(n => {
                    // 高頻徽章：28 個節點原本長得一模一樣，看不出哪個該優先讀。
                    // 直接把近五年題組數標出來，時間有限時可先攻高頻。
                    const c = nodeExamCounts(n.id).c108;
                    const freq = c >= 4 ? 'hot' : c >= 2 ? 'mid' : '';
                    const freqTag = c > 0
                        ? `<span class="nav-freq ${freq}" title="近五年學測出現 ${c} 組">${c}</span>`
                        : '';
                    html += `<li><a class="nav-item nav-item-node" data-route="node-${n.id}" onclick="switchMainView(this, 'node-${n.id}')"><span class="node-code-badge">${n.id}</span> <span class="nav-node-name">${n.name}</span>${freqTag}</a></li>`;
                });
            });
            list.innerHTML = html;
        }

        // 節點專屬複習頁：彙整該節點在 modulesData 中被標記 node 的公式卡／關鍵特徵／歷屆真題卡，
        // 加上該節點的分級題庫與（如有）專題深化內容，取代整個模組長頁作為主要複習單位。
        function renderNodeView(nodeId) {
            const node = knowledgeNodes.find(n => n.id === nodeId);
            const main = document.getElementById('main-content');
            const hasNode = (item) => (Array.isArray(item.node) ? item.node : [item.node]).includes(nodeId);

            let formulas = [], keyFeatures = [], examInsights = [];
            Object.values(modulesData).forEach(m => {
                formulas.push(...m.formulas.filter(hasNode));
                keyFeatures.push(...m.keyFeatures.filter(hasNode));
                // 這 25 組手寫的真題拆解原本只在 renderModuleView 裡渲染，
                // 而該函式從未被路由呼叫（死程式碼），等於全站品質最高的內容沒有入口。
                examInsights.push(...(m.examQuestions || []).filter(hasNode));
            });

            let formulasHtml = '';
            if (formulas.length) {
                formulasHtml = '<div class="handout-section-title" style="margin-top:0;">📖 這一節在講什麼</div><div class="formulas-grid">';
                formulas.forEach((f, fi) => {
                    const isMath = f.formula.includes('\\') || f.formula.includes('^') || f.formula.includes('_') || f.formula.includes('{') || f.formula.includes('}');
                    const displayHtml = isMath
                        ? `$$ ${f.formula} $$`
                        : `<div style="font-family: inherit; font-size: 1.05rem; font-weight: 600; text-align: center; color: var(--text-main); line-height: 1.6; white-space: normal; word-break: break-all;">${f.formula}</div>`;
                    // 有 probe 的卡：先讓學生押一個答案，才解鎖錨點與說明（避免先看到結論產生「我懂了」的錯覺）
                    const uid = 'pb' + nodeId + '-' + fi;
                    const anchorHtml = f.anchor ? `<div class="anchor-line">🧠 大腦錨點：${f.anchor}</div>` : '';
                    const bodyHtml = anchorHtml + `<div class="formula-desc">${f.desc}</div>`;
                    let cardInner;
                    if (f.probe) {
                        probeIndex[uid] = { nodeId, probe: f.probe };
                        const opts = f.probe.opts.map((o, i) =>
                            `<button class="probe-opt" data-i="${i}" onclick="probePick('${uid}', ${i})">${o.t}</button>`).join('');
                        cardInner = `
                            <div class="formula-display">${displayHtml}</div>
                            <div class="probe-box" id="probe-${uid}">
                                <div class="probe-q">🤔 先想 10 秒再往下看：${f.probe.q}</div>
                                <div class="probe-opts">${opts}</div>
                                <div class="probe-hint">答錯完全沒關係——先押一個答案，等一下的說明才會真的黏住。</div>
                            </div>
                            <div id="reveal-${uid}" style="display:none;">${bodyHtml}</div>`;
                    } else {
                        cardInner = `<div class="formula-display">${displayHtml}</div>${bodyHtml}`;
                    }
                    formulasHtml += `
                        <div class="formula-card">
                            <div class="formula-card-title">📌 ${f.name}${f.ext ? '<span class="ext-badge">選修延伸</span>' : ''}</div>
                            ${cardInner}
                            ${f.ext ? `<div class="ext-note">★ ${f.ext}</div>` : ''}
                        </div>
                    `;
                });
                formulasHtml += '</div>';
            }

            let featuresHtml = '';
            if (keyFeatures.length) {
                featuresHtml = `
                    <div class="handout-section-title">⚡ 看到題目怎麼想、哪裡最容易錯</div>
                    <div class="features-grid">
                `;
                keyFeatures.forEach((kf, ki) => {
                    // 有 check 的：先讓學生判斷，再解鎖解法與陷阱——這樣「你可能會這樣錯」才有對照的對象
                    const fuid = 'fc' + nodeId + '-' + ki;
                    const hidden = kf.check ? ' style="display:none;"' : '';
                    let checkHtml = '';
                    if (kf.check) {
                        fcheckIndex[fuid] = { nodeId, check: kf.check };
                        const opts = kf.check.opts.map((o, i) =>
                            `<button class="probe-opt" data-i="${i}" onclick="featureCheck('${fuid}', ${i})">${o.t}</button>`).join('');
                        checkHtml = `
                            <div class="fcheck-box" id="fcheck-${fuid}">
                                <div class="fcheck-q">✋ 先自己判斷，再看解法：${kf.check.q}</div>
                                <div class="probe-opts">${opts}</div>
                            </div>`;
                    }
                    featuresHtml += `
                        <div class="feature-guide-box">
                            <div class="feature-trigger">
                                <span class="feature-trigger-tag">關鍵特徵</span>
                                <div class="feature-trigger-title">${kf.feature}</div>
                            </div>
                            ${checkHtml}
                            <div class="feature-bridge" id="fb-${fuid}"${hidden}>
                                <div class="feature-bridge-title">➔ 物理思維與模型解構</div>
                                <div class="feature-bridge-desc">${kf.bridge}</div>
                            </div>
                            <div class="feature-trap" id="ft-${fuid}"${hidden}>
                                <div class="feature-trap-title">⚡ 易錯盲點避坑指南</div>
                                <div class="feature-trap-desc">${kf.trap}</div>
                            </div>
                        </div>
                    `;
                });
                featuresHtml += '</div>';
            }

            // 該節點的歷屆真題拆解（可展開，預設收合以免版面過長）
            let insightHtml = '';
            if (examInsights.length) {
                insightHtml = `
                    <div class="handout-section-title">🔥 這個概念在考卷上長什麼樣</div>
                    <div style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.5rem;">`;
                examInsights.forEach(q => {
                    insightHtml += `
                        <div class="q-card" onclick="toggleQCard(this)">
                            <div class="q-card-header">
                                <span class="q-card-title">🔥 ${q.year}｜${q.title}</span>
                                <span style="color: var(--primary-blue); font-weight:700;">展開拆解 ➔</span>
                            </div>
                            <div class="q-card-body"><p>${q.desc}</p></div>
                        </div>`;
                });
                insightHtml += '</div>';
            }

            // 3. Build Concept Internet HTML
            let internetHtml = '';
            const links = conceptInternetData[nodeId];
            if (links && links.length) {
                internetHtml = `
                    <div class="handout-section-title" style="margin-top: 2rem;">💡 這個概念還跟哪些單元有關</div>
                    <div class="edu-card" style="background: linear-gradient(135deg, rgba(11, 146, 152, 0.02) 0%, rgba(255, 255, 255, 0.7) 100%); border-left: 5px solid var(--accent-cyan); margin-bottom: 1.5rem;">
                        <p style="font-size:0.92rem; color:var(--text-main); margin-top:0; line-height:1.6;">
                            大腦神經科學指出，孤立知識極易遺忘。點擊下方關聯節點，建立跨單元的知識基模（Schema）：
                        </p>
                        <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:1rem;">
                `;
                links.forEach(link => {
                    const targetNode = knowledgeNodes.find(n => n.id === link.target);
                    if (targetNode) {
                        internetHtml += `
                            <div style="font-size:0.88rem; line-height:1.5; color:var(--text-main); display:flex; align-items:flex-start; gap:0.5rem;">
                                <button class="print-hide" onclick="navigateTo('node-${link.target}')" style="background:var(--accent-green-light); border:1px solid rgba(24,132,92,0.15); color:var(--accent-green); padding:0.15rem 0.4rem; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer; white-space:nowrap; margin-top:1px;">
                                    ${link.target} ${targetNode.name} ➔
                                </button>
                                <span style="font-size:0.85rem; color:var(--text-muted); font-weight:700;" class="print-show-inline">${link.target} ${targetNode.name}:</span>
                                <span style="font-size:0.88rem; color:var(--text-main);">${link.reason}</span>
                            </div>
                        `;
                    }
                });
                internetHtml += `
                        </div>
                    </div>
                `;
            }

            const cnt = nodeExamCounts(nodeId);
            const qCount = questionBank.filter(q => q.node === nodeId).length;
            const hasLab = Boolean(nodeInteractiveLabs[nodeId]);
            const topicConfig = nodeTopicSections[nodeId];
            const examSummary = cnt.c108 > 0
                ? `近五年含相關 ${cnt.c108} 組`
                : '近五年沒有標記到此節點的正式題組';

            // 掌握度徽章：把「我會了嗎」放在學生眼前，而不是只藏在命題矩陣裡
            const mNode = nodeMasteryMap()[nodeId] || { a: 0, c: 0 };
            const mHint = mNode.a === 0
                ? '<em>還沒作答過——先做下面的判斷題暖身</em>'
                : (mNode.c / mNode.a < 0.6 ? '<em>答對率偏低，讀完後回題庫再測一次</em>' : '');
            const masteryBanner = `
                <div class="node-mastery-banner print-hide">
                    <span>你在這一節的狀態：</span>${masteryCellHtml(mNode)}${mHint}
                </div>`;

            const nodeActionsHtml = `
                <div class="node-route-actions print-hide">
                    <button class="node-route-action" style="--action-accent:#2368d5;" type="button" onclick="openBankForNode('${nodeId}')">
                        <strong>✏️ 練習此節點題庫</strong>
                        <span>${qCount} 題 · 記憶、理解、應用、分析</span>
                    </button>
                    <button class="node-route-action" style="--action-accent:#0b9298;" type="button" onclick="showExamsForNode('${nodeId}')">
                        <strong>📚 查看相關歷屆</strong>
                        <span>${examSummary}${cnt.reference108 ? ` · 另有參考卷 ${cnt.reference108} 組` : ''}</span>
                    </button>
                    <button class="node-route-action" style="--action-accent:#ba7216;" type="button" ${hasLab ? `onclick="openLabForNode('${nodeId}')"` : 'disabled'}>
                        <strong>🔬 ${hasLab ? '操作節點實驗' : '此節點暫無專屬實驗'}</strong>
                        <span>${hasLab ? nodeInteractiveLabs[nodeId].title : '可前往完整實驗室查看其他主題'}</span>
                    </button>
                    ${topicConfig ? `
                        <button class="node-route-action" style="--action-accent:#7c5cad;" type="button" onclick="openTopicForNode('${nodeId}')">
                            <strong>🧩 開啟圖解專題</strong>
                            <span>${topicConfig.title}</span>
                        </button>
                    ` : ''}
                </div>
            `;

            main.innerHTML = `
                <div class="content-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="content-badge">${node.code}｜${modulesData[node.module].title}</span>
                        <h2 class="content-title">${node.id} ${node.name}</h2>
                        <p class="content-subtitle">${node.detail}</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()">
                        <span>🖨️</span> 列印本節點
                    </button>
                </div>

                ${masteryBanner}
                ${nodeActionsHtml}
                ${formulasHtml}
                ${nodeDiagramsHtml(nodeId)}
                ${nodeId === 'N15' ? dopplerNodeWidgetHtml() : ''}
                ${featuresHtml}
                ${insightHtml}
                ${internetHtml}

                <div class="self-check-exit" id="self-check-${nodeId}">
                    <div class="self-check-title">📤 離開前，蓋住螢幕問自己三個問題</div>
                    <ol>
                        <li>這一節的核心是什麼？它<strong>什麼時候不能用</strong>？（說出成立條件，不是背式子）</li>
                        <li>「哪裡最容易錯」那一段講的錯法，我<strong>以前是不是也這樣想</strong>？我原本怎麼想的？</li>
                        <li>如果考題把它<strong>包裝成生活情境</strong>（颱風、地震、家電、太空），我要從題幹哪個字認出它？</li>
                    </ol>
                    <button type="button" onclick="selfCheckDone('${nodeId}', true)">✅ 三題都答得出來</button>
                    <button type="button" onclick="selfCheckDone('${nodeId}', false)">🔁 有卡住，標記待複習</button>
                </div>

                <div style="margin-top:2rem; padding-top:1rem; border-top:1px dashed var(--border-color);">
                    <a onclick="goToModuleOverview(${node.module})" style="cursor:pointer; color:var(--text-muted); font-size:0.85rem;">↩ 查看「${modulesData[node.module].title}」完整觀念地圖與生活延伸 ➔</a>
                </div>
            `;

            if (nodeId === 'N15') initDopplerVideoEvents();
            scheduleMathJax([main]);
        }

        function renderNodeTopicView(nodeId) {
            const node = knowledgeNodes.find(n => n.id === nodeId);
            const config = nodeTopicSections[nodeId];
            const main = document.getElementById('main-content');
            if (!node || !config) {
                navigateTo(`node-${nodeId}`, { replace: true });
                return;
            }
            main.innerHTML = `
                <div class="content-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                    <div>
                        <span class="content-badge">${node.id} 節點專題｜${node.code}</span>
                        <h2 class="content-title">${config.title}</h2>
                        <p class="content-subtitle">此頁集中放置較長的圖解、實驗方法與裝置模擬；基本公式與常見陷阱留在節點講義，練習題另在題庫。</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()"><span>🖨️</span> 列印專題</button>
                </div>
                <div class="node-route-actions print-hide">
                    <button class="node-route-action" style="--action-accent:#0b9298;" type="button" onclick="navigateTo('node-${nodeId}')">
                        <strong>← 回到節點講義</strong>
                        <span>${nodeId} ${node.name}</span>
                    </button>
                    <button class="node-route-action" style="--action-accent:#2368d5;" type="button" onclick="openBankForNode('${nodeId}')">
                        <strong>✏️ 前往節點題庫</strong>
                        <span>讀完專題後立即練習</span>
                    </button>
                    ${nodeInteractiveLabs[nodeId] ? `
                        <button class="node-route-action" style="--action-accent:#ba7216;" type="button" onclick="openLabForNode('${nodeId}')">
                            <strong>🔬 前往互動實驗</strong>
                            <span>${nodeInteractiveLabs[nodeId].title}</span>
                        </button>
                    ` : ''}
                </div>
                ${config.html()}
                <div style="margin-top:2rem; padding-top:1rem; border-top:1px dashed var(--border-color);">
                    <button class="route-link-btn print-hide" type="button" onclick="navigateTo('node-${nodeId}')">← 回到 ${nodeId} 節點講義</button>
                </div>
            `;
            if (nodeId === 'N06') {
                initRutherfordSim();
                initCrtSim();
            }
            if (nodeId === 'N15') initDopplerVideoEvents();
            if (nodeId === 'N21') initGeneratorSim();
            scheduleMathJax([main]);
        }

        const conceptInternetData = {
            'N01': [
                { target: 'N19', reason: '因次分析應用：推導與電場 $E$、電壓 $V$ 或電荷 $q$ 的單位關係（如 115 學測 Q15 考查的電場 SI 單位）。' },
                { target: 'N23', reason: '普朗克常數因次：近代物理中普朗克常數 $h$ 的單位為 $\\text{kg}\\cdot\\text{m}^2\\cdot\\text{s}^{-1}$，常用於光子能量與光電效應計算。' }
            ],
            'N02': [
                { target: 'N06', reason: '尺度對照：微觀物質結構中原子（$10^{-10}$ m）與原子核（$10^{-15}$ m）的尺度對比。' },
                { target: 'N18', reason: '波長與數量級：可見光與電磁波譜（紅外線、紫外線）的波長數量級排序對照。' }
            ],
            'N06': [
                { target: 'N27', reason: '基本粒子受力：夸克與電子作為基本粒子，分別受強交互作用與電磁交互作用的約束。' },
                { target: 'N25', reason: '原子模型演進：拉塞福散射實驗確立了原子核的存在，開啟了微觀世界粒子結構的研究。' }
            ],
            'N03': [
                { target: 'N14', reason: '運動波形結合：地震波（P波與S波）傳播時間差的物理計算與 $S = vt$ 圖形判讀結合（如 113 學測 Q31）。' },
                { target: 'N04', reason: '因果關係：運動學圖形（速度與加速度變化）是受力情況（牛頓第二定律 $F=ma$）的宏觀表現。' }
            ],
            'N04': [
                { target: 'N09', reason: '同一個力的兩種效果：作用一段時間改變運動狀態（N04），沿位移方向累積則是做功、改變動能（N09）。' }
            ],
            'N05': [
                { target: 'N19', reason: '力學平衡：靜電力與摩擦力/重力之受力平衡與力學作圖對照（如 112 學測 Q36）。' }
            ],
            'N07': [
                { target: 'N08', reason: '力學原因：克卜勒第三定律中的常數 $K$ 可由牛頓萬有引力提供向心力來推導：$G\\frac{Mm}{R^2} = m\\frac{4\\pi^2}{T^2}R$。' }
            ],
            'N08': [
                { target: 'N19', reason: '物理場對照：牛頓萬有引力定律（平方反比）與庫侖靜電力定律（平方反比）數學形式完全對稱，是場論的起點。' }
            ],
            'N09': [
                { target: 'N23', reason: '能量守恆：光電效應中光子的能量轉化為電子的最大初動能與功函數（逸出功）：$E_k = hf - W$。' }
            ],
            'N14': [
                { target: 'N18', reason: '波的分類：光與電磁波本質上是橫波，而聲音則是縱波（疏密波），皆具有波速公式 $v = f\\lambda$。' }
            ],
            'N18': [
                { target: 'N17', reason: '波長與尺度：微波爐網孔、行動通訊繞過建築物、可見光近似直線傳播與 X 射線晶體繞射，都要比較波長與障礙物／狹縫尺度。' },
                { target: 'N23', reason: '光量子能量：電磁波譜中高頻率波段（紫外線、X光）之光子能量較高，能激發光電效應。' },
                { target: 'N28', reason: '黑體輻射：黑體發射的連續光譜對應特定的電磁波波段，其能量密度峰值波長與溫度成反比。' }
            ],
            'N20': [
                { target: 'N21', reason: '電生磁 ➔ 磁生電：電流產生的變化磁場（電流磁效應）是產生電磁感應應電流（電磁感應）的物理前提。' }
            ],
            'N21': [
                { target: 'N20', reason: '反向抗衡：電磁感應產生的應電流，其本身的磁場方向（安培右手定則）必定抵抗原磁場的變化（冷次定律）。' }
            ],
            'N23': [
                { target: 'N28', reason: '量子論起源：普朗克的能量子假設為愛因斯坦提出光子說（解決光電效應）奠定了量子物理的理論基石。' },
                { target: 'N24', reason: '同一本能量帳：光電效應的 $hf = W + E_k$ 與能階躍遷的 $\\Delta E = hf$ 都是「單一光子與單一電子」的能量交換。' }
            ],
            'N10': [
                { target: 'N11', reason: '微觀本質：熱平衡的宏觀條件是「溫度相同」，微觀本質是兩者分子的平均動能相等。' },
                { target: 'N12', reason: '方向性：熱自發地由高溫流向低溫、不會反向，正是熱力學第二定律的核心內涵。' }
            ],
            'N11': [
                { target: 'N10', reason: '宏觀對應：絕對溫度是分子平均動能的宏觀指標，解釋了熱平衡與溫度計原理。' },
                { target: 'N01', reason: '因次連結：$k_BT$ 具有能量的因次（114 學測 Q47 細胞膜題組即考此判斷）；比例計算務必使用絕對溫標（114 Q48）。' }
            ],
            'N12': [
                { target: 'N09', reason: '能量流失的單行道：摩擦把力學能轉為熱之後，無法自發全數轉回——能量守恆但品質退化。' },
                { target: 'N13', reason: '發電能量鏈：核電廠由核能→熱能→動能→電能的多級轉換（113 學測 Q19），每級都有效率損耗。' }
            ],
            'N13': [
                { target: 'N26', reason: '核反應守恆：核分裂/衰變前後質量數與原子序守恆，釋能來自反應前後的質量虧損。' },
                { target: 'N27', reason: '力的根源：核能的本質是強交互作用的能量；聚變須先克服質子間的庫侖排斥。' }
            ],
            'N15': [
                { target: 'N14', reason: '判讀基礎：都卜勒效應中「波速由介質決定、不因波源運動改變」，改變的是視波長與接收頻率。' },
                { target: 'N18', reason: '光的都卜勒：星系光譜紅移（遠離）與藍移（接近）是宇宙膨脹的關鍵證據。' }
            ],
            'N16': [
                { target: 'N14', reason: '跨介質通則：折射時頻率不變、波速與波長改變——與繩波跨介質是同一套規則。' },
                { target: 'N17', reason: '同題整合：115 學測 Q49 同時考折射作圖與薄膜干涉加強，是反射折射＋干涉的整合題。' }
            ],
            'N17': [
                { target: 'N25', reason: '波動性的鐵證：電子通過雙狹縫也產生干涉條紋（112 學測 Q31），證明物質波真實存在。' },
                { target: 'N18', reason: '繞射與尺度：X 光波長與晶體原子間距相當，因而產生晶體繞射（112 學測 Q30）。' }
            ],
            'N19': [
                { target: 'N08', reason: '平方反比雙生子：庫侖定律與萬有引力數學形式相同，但重力恆吸引、電力可吸可斥且強度懸殊。' },
                { target: 'N01', reason: '單位判讀：電場＝單位電荷所受的力，SI 單位 N/C（115 學測 Q15 直接考此因次）。' }
            ],
            'N22': [
                { target: 'N21', reason: '電從哪裡來：插座的交流電源自發電廠的電磁感應——磁場變化感應出電流。' },
                { target: 'N12', reason: '用電計價：一度電＝1 kW × 1 hr，即「功率 × 時間 ＝ 能量」的生活應用。' }
            ],
            'N24': [
                { target: 'N23', reason: '能量帳同源：能階差以光子形式收支（$\\Delta E = hf$），與光電效應同屬「光子—電子」一對一交易。' },
                { target: 'N28', reason: '思想源頭：普朗克「能量不連續」的量子化假設，是波耳能階分立觀念的前身。' }
            ],
            'N25': [
                { target: 'N17', reason: '判定標準：干涉與繞射是波動獨有的特徵——電子干涉條紋因此成為物質波的決定性證據。' },
                { target: 'N02', reason: '尺度應用：電子的物質波波長遠短於可見光，電子顯微鏡因而能看見更小的結構。' }
            ],
            'N26': [
                { target: 'N27', reason: '分工明確：原子核的穩定靠強力，β 衰變（中子轉質子）由弱力主導。' },
                { target: 'N13', reason: '釋能機制：衰變與核分裂的能量都來自質量虧損，經 $E = \\Delta mc^2$ 轉換。' }
            ],
            'N27': [
                { target: 'N19', reason: '強度對比：微觀下電磁力遠強於重力；宏觀世界重力勝出是因質量只有正值、可無限累積。' },
                { target: 'N06', reason: '質量之謎：夸克由強力束縛成質子與中子，核子質量約 99% 來自強作用的結合能而非夸克本身。' }
            ],
            'N28': [
                { target: 'N23', reason: '理論繼承：愛因斯坦的光子說直接繼承普朗克的能量子假設，並以光電效應給出實驗檢驗。' },
                { target: 'N18', reason: '溫度與波段：黑體輻射連結溫度與電磁波段——恆星顏色判溫、地球能量收支（111 學測 Q7-8）皆本於此。' }
            ]
        };

