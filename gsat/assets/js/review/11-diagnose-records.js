// 15 分鐘診斷卷、錯題本、做題紀錄
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 15 分鐘診斷卷 =====
        // 首頁一直叫學生「先找弱點」，但掌握度要做完整個題庫才有數字，
        // 新使用者打開命題矩陣全是「未作答」，等於沒有起點。
        // 這裡用「近五年考幾組」加權挑題，15 題內問出最該補的節點。
        function pickDiagnosticSet(limit) {
            limit = limit || 15;
            const scored = knowledgeNodes.map(n => ({ n, freq: nodeExamCounts(n.id).c108 }))
                .filter(x => x.freq > 0)
                .sort((a, b) => b.freq - a.freq);
            const picked = [];
            // 高頻節點優先，每個節點取一題；偏好「應用／分析」這種有鑑別度的層次
            scored.forEach(({ n }) => {
                if (picked.length >= limit) return;
                const pool = questionBank.filter(q => q.node === n.id && q.type !== 'short');
                if (!pool.length) return;
                const best = pool.find(q => q.level === '應用') || pool.find(q => q.level === '分析') || pool[0];
                picked.push(best);
            });
            return picked;
        }

        let diagnoseSet = [];

        function renderDiagnoseView() {
            currentView = 'diagnose';
            const main = document.getElementById('main-content');
            diagnoseSet = pickDiagnosticSet(15);
            let cards = '';
            diagnoseSet.forEach((q, i) => {
                const node = bankNodeOf(q);
                cards += `<div class="diag-qno">第 ${i + 1} 題　<span>${node.code}｜${node.name}</span></div>`;
                cards += bankCardHtml(q, 'dg' + i);
            });
            main.innerHTML = `
                <div class="content-header">
                    <span class="content-badge">先測，再決定要讀什麼</span>
                    <h2 class="content-title">🎯 15 分鐘診斷卷</h2>
                    <p class="content-subtitle">依「近五年考幾組」挑出 ${diagnoseSet.length} 題高頻考點，每個節點各一題。做完按下方按鈕，直接告訴你最該補的節點順序——不必先做完整個題庫。</p>
                </div>

                <div class="info-alert">
                    <span class="info-alert-icon">⏱️</span>
                    <div><strong>怎麼用：</strong>限時 15 分鐘、不會的直接猜（猜錯才問得出弱點）。做完點「看診斷結果」，系統會依「答錯 × 考題頻率」排出補強順序，並附上該節點的連結。作答同時計入掌握度與錯題本。</div>
                </div>

                <div class="diag-actions">
                    <button class="home-primary-btn" type="button" onclick="showDiagnoseResult()">📊 看診斷結果</button>
                    <span class="gen-score" id="diag-progress">尚未作答</span>
                </div>

                <div id="diag-result"></div>
                ${cards}
            `;
            restoreBankStates();
            updateDiagProgress();
            scheduleMathJax([main]);
        }

        function updateDiagProgress() {
            const el = document.getElementById('diag-progress');
            if (!el) return;
            const done = diagnoseSet.filter((q, i) => bankDone['dg' + i]).length;
            el.textContent = `已完成 ${done} / ${diagnoseSet.length} 題`;
        }

        function showDiagnoseResult() {
            const box = document.getElementById('diag-result');
            if (!box) return;
            const rows = [];
            diagnoseSet.forEach((q, i) => {
                const uid = 'dg' + i;
                if (!bankDone[uid]) return;
                const sel = bankSel[uid] || new Set();
                const correctSet = new Set(q.opts.map((o, k) => o.c ? k : -1).filter(k => k >= 0));
                const ok = sel.size === correctSet.size && [...sel].every(k => correctSet.has(k));
                const node = bankNodeOf(q);
                rows.push({ node, ok, freq: nodeExamCounts(node.id).c108 });
            });
            if (!rows.length) {
                box.innerHTML = '<div class="edu-card" style="text-align:center; color:var(--text-muted);">還沒有作答紀錄——先做幾題再看結果。</div>';
                return;
            }
            const wrong = rows.filter(r => !r.ok).sort((a, b) => b.freq - a.freq);
            const right = rows.filter(r => r.ok);
            const list = wrong.length
                ? wrong.map((r, i) => `
                    <li>
                        <span class="diag-rank">${i + 1}</span>
                        <a onclick="navigateTo('node-${r.node.id}')" style="cursor:pointer; font-weight:700; color:var(--primary-blue);">${r.node.id} ${r.node.name}</a>
                        <span style="color:var(--text-muted); font-size:0.82rem;">　近五年 ${r.freq} 組</span>
                    </li>`).join('')
                : '<li>這批高頻考點你全部答對——建議直接去做歷屆試題或模擬考驗證速度。</li>';
            box.innerHTML = `
                <div class="edu-card" style="border-left:5px solid var(--primary-blue);">
                    <div class="edu-card-title">📊 你的補強順序（依「答錯 × 考題頻率」排序）</div>
                    <div style="font-size:0.9rem; margin-bottom:0.6rem;">已作答 <b>${rows.length}</b> 題，答對 <b>${right.length}</b> 題。</div>
                    <ol class="diag-list">${list}</ol>
                    <div style="font-size:0.82rem; color:var(--text-muted); margin-top:0.6rem;">點節點名稱直接前往複習；答錯的題目已自動收進錯題本。</div>
                </div>`;
            box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // ===== 錯題本視圖 =====
        function renderWrongView() {
            currentView = 'wrong';
            const main = document.getElementById('main-content');
            const bankKeys = wrongBankKeys()
                .sort((a, b) => studyRecords.bank[b].t - studyRecords.bank[a].t);
            const examT = base => Math.max(...Object.keys(studyRecords.exam)
                .filter(k => k.split('#')[0] === base && studyRecords.exam[k].last === -1)
                .map(k => studyRecords.exam[k].t));
            const examKeys = wrongExamKeys().sort((a, b) => examT(b) - examT(a));

            let atts = 0, corr = 0;
            [studyRecords.bank, studyRecords.exam].forEach(store =>
                Object.values(store).forEach(r => { atts += r.a; corr += r.c; }));

            let bankHtml = '';
            // uid 必須綁定題目本身而非清單位置：用位置索引會在清單變動後，
            // 讓新題目繼承前一題的 bankDone 狀態，變成點不動的死卡。
            bankKeys.forEach(k => { bankHtml += bankCardHtml(bankByKey(k), 'wr' + k.replace(/[^\w]/g, '_')); });
            let examHtml = '';
            examKeys.forEach(base => {
                const e = examPractice.find(x => x.year + '_' + x.q === base);
                if (e) examHtml += examItemHtml(e);
            });

            const empty = bankKeys.length === 0 && examKeys.length === 0;
            main.innerHTML = `
                <div class="content-header">
                    <span class="content-badge">個人化複習</span>
                    <h2 class="content-title">📕 錯題本</h2>
                    <p class="content-subtitle">收錄「最近一次答錯」的題庫題與歷屆題。在此重新作答，答對後即自動移出錯題本；紀錄存在本機瀏覽器（localStorage），清除瀏覽資料前請先匯出備份。</p>
                </div>

                <div class="wrong-summary">
                    <div class="wrong-stat"><b>${atts}</b><span>累計作答次數</span></div>
                    <div class="wrong-stat"><b>${atts > 0 ? Math.round(corr / atts * 100) + '%' : '—'}</b><span>整體答對率</span></div>
                    <div class="wrong-stat"><b>${bankKeys.length}</b><span>題庫錯題</span></div>
                    <div class="wrong-stat"><b>${examKeys.length}</b><span>歷屆錯題（組）</span></div>
                </div>

                <div class="bank-filter-bar" style="margin-bottom:1.25rem;">
                    <div class="bank-filter-row" style="gap:0.75rem;">
                        <button class="quiz-btn" onclick="exportRecords()">💾 匯出紀錄備份</button>
                        <label class="quiz-btn" style="cursor:pointer;">📂 匯入紀錄<input type="file" accept=".json,application/json" style="display:none;" onchange="importRecords(this)"></label>
                        <button class="quiz-btn" onclick="clearRecords()" style="color:var(--accent-rose, #e11d48);">🗑️ 清空全部紀錄</button>
                    </div>
                </div>

                ${empty ? '<div class="edu-card" style="text-align:center; color:var(--text-muted);">目前沒有錯題 🎉　到「知識節點分級題庫」或「歷屆試題練習」作答後，答錯的題目會自動收進來。</div>' : ''}
                ${bankKeys.length > 0 ? `<div class="edu-card"><div class="edu-card-title">✏️ 題庫錯題（${bankKeys.length} 題）——重新作答，答對即移出</div>${bankHtml}</div>` : ''}
                ${examKeys.length > 0 ? `<div class="edu-card"><div class="edu-card-title">📚 歷屆試題錯題（${examKeys.length} 題／組）</div>${examHtml}</div>` : ''}
            `;
            restoreBankStates();
            scheduleMathJax([main]);
        }

        function exportRecords() {
            const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const blob = new Blob([JSON.stringify(studyRecords, null, 1)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `gsat-phy-records-${stamp}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        }

        function importRecords(input) {
            const file = input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    if (!data || typeof data.bank !== 'object' || typeof data.exam !== 'object') throw new Error('格式不符');
                    if (!confirm('匯入將「覆蓋」目前的做題紀錄，確定嗎？（建議先匯出備份）')) return;
                    studyRecords.bank = data.bank;
                    studyRecords.exam = data.exam;
                    saveRecords();
                    updateWrongNavBadge();
                    renderWrongView();
                } catch (e) {
                    alert('匯入失敗：檔案不是有效的紀錄備份（' + e.message + '）');
                } finally {
                    input.value = '';
                }
            };
            reader.readAsText(file);
        }

        function clearRecords() {
            if (!confirm('確定清空全部做題紀錄？此動作無法復原（建議先匯出備份）。')) return;
            studyRecords.bank = {};
            studyRecords.exam = {};
            saveRecords();
            updateWrongNavBadge();
            renderWrongView();
        }

        function toggleExamItem(btn) {
            const item = btn.closest('.exam-item');
            const body = item.querySelector('.exam-body');
            const isOpening = !item.classList.contains('open');

            // Close other open exam items
            document.querySelectorAll('.exam-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.exam-body').style.maxHeight = '0px';
                }
            });

            if (isOpening) {
                item.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';

                // 自動初始化展開題目的 Canvas 繪圖板
                const canvases = body.querySelectorAll('.draw-canvas');
                canvases.forEach(canvas => {
                    const uid = canvas.getAttribute('id').replace('canvas-', '');
                    const sheet = canvas.getAttribute('data-sheet');
                    setTimeout(() => {
                        initCanvas(uid, sheet);
                        body.style.maxHeight = body.scrollHeight + 'px';
                    }, 100); // 延長到 100ms 確保過渡動畫開始並有 clientWidth
                });
            } else {
                item.classList.remove('open');
                body.style.maxHeight = '0px';
            }
        }

        // ===== 做題紀錄（localStorage）：錯題本與掌握度的資料層 =====
        const REC_KEY = 'gsat-phy-records-v1';
        function loadRecords() {
            try {
                const raw = JSON.parse(localStorage.getItem(REC_KEY));
                if (raw && raw.bank && raw.exam) return raw;
            } catch (e) { /* 壞資料視同無紀錄 */ }
            return { bank: {}, exam: {} };
        }
        const studyRecords = loadRecords();
        function saveRecords() {
            try { localStorage.setItem(REC_KEY, JSON.stringify(studyRecords)); } catch (e) { /* 無痕模式等情況下略過 */ }
        }
        // 題庫題的穩定鍵：節點｜層次｜題幹雜湊（不用陣列序號，避免題庫增刪造成紀錄錯位）
        function bankKey(q) {
            let h = 5381;
            const s = q.q || '';
            for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
            return q.node + '|' + q.level + '|' + h.toString(36);
        }
        let _bankKeyMap = null;
        function bankByKey(key) {
            if (!_bankKeyMap) {
                _bankKeyMap = {};
                questionBank.forEach(q => { _bankKeyMap[bankKey(q)] = q; });
            }
            return _bankKeyMap[key];
        }
        // kind: 'bank' | 'exam'；nodes: 字串或陣列（掌握度統計歸屬的知識節點）
        function recordResult(kind, key, ok, nodes) {
            const store = studyRecords[kind];
            const rec = store[key] || (store[key] = { a: 0, c: 0, last: 0, t: 0, nodes: [] });
            rec.a++;
            if (ok) rec.c++;
            rec.last = ok ? 1 : -1;
            rec.t = Date.now();
            if (nodes) rec.nodes = Array.isArray(nodes) ? nodes : [nodes];
            saveRecords();
            updateWrongNavBadge();
        }
        // 錯題清單：last === -1（最近一次答錯）且題目仍存在
        function wrongBankKeys() {
            return Object.keys(studyRecords.bank).filter(k => studyRecords.bank[k].last === -1 && bankByKey(k));
        }
        function wrongExamKeys() {
            const set = new Set();
            Object.keys(studyRecords.exam).forEach(k => {
                if (studyRecords.exam[k].last !== -1) return;
                const base = k.split('#')[0];
                if (examPractice.some(e => e.year + '_' + e.q === base)) set.add(base);
            });
            return [...set];
        }
        function updateWrongNavBadge() {
            const el = document.getElementById('wrong-nav-badge');
            if (!el) return;
            const n = wrongBankKeys().length + wrongExamKeys().length;
            el.style.display = n > 0 ? 'inline-block' : 'none';
            el.textContent = n;
        }
        // 自評按鈕列（簡答／非選共用）：作答後由學生對照參考答案自我評量
        function selfGradeRowHtml(handler) {
            return `
                <div class="self-grade">
                    <span class="self-grade-label">對照後自我評量：</span>
                    <button type="button" onclick="${handler}, true)">✅ 我答對了</button>
                    <button type="button" onclick="${handler}, false)">✍️ 我需加強</button>
                </div>`;
        }
        function selfGradeDone(btn, ok) {
            const row = btn.closest('.self-grade');
            row.innerHTML = `<span class="sg-done" style="color:${ok ? 'var(--accent-green, #059669)' : 'var(--accent-rose, #e11d48)'};">${ok ? '✅ 已記錄：答對' : '✍️ 已記錄：列入錯題本'}</span>`;
        }
        function selfGradeBank(btn, uid, ok) {
            const q = bankIndex[uid];
            if (!q) return;
            recordResult('bank', bankKey(q), ok, q.node);
            selfGradeDone(btn, ok);
        }
        function selfGradeExam(btn, key, ok) {
            const entry = examPractice.find(e => e.year + '_' + e.q === key);
            recordResult('exam', key + '#ns', ok, entry ? entry.nodes : []);
            selfGradeDone(btn, ok);
            resizeExamBody(btn);
        }

