// 知識節點分級題庫：作答互動與總覽
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 知識節點分級題庫 =====
        // 依 108 課綱「學習表現」設計：
        //  - 認知層次（科學認知）：對應 Bloom's Taxonomy 之 記憶/理解/應用/分析
        //  - 探究能力：想像創造(ti)/推理論證(tr)/批判思辨(tc)/建立模型(tm)/觀察與定題(po)/計劃與執行(pe)/分析與發現(pa)/討論與傳達(pc)
        // 每題標注：知識節點(node)、認知層次(level)、題型(type: single 五選一單選 / multi 多選 / short 簡答)、
        //           學習表現(perf)，且每個選項附正確/誘答理由(why)

        // ===== 題庫作答互動 =====
        const BANK_LV_ORDER = { '記憶': 1, '理解': 2, '應用': 3, '分析': 4 };
        const BANK_LV_CLS = { '記憶': 's', '理解': 'i', '應用': 'o', '分析': 'l' };
        const BANK_TYPE_LABEL = { single: '單選題（五選一）', multi: '多選題', short: '簡答題' };

        const bankIndex = {};  // uid -> question object
        const bankSel = {};    // uid -> Set of selected option indices
        const bankDone = {};   // uid -> answered flag
        const bankScored = {}; // uid -> 是否已計入掌握度（重播畫面時不重複計分）

        function bankNodeOf(q) {
            return knowledgeNodes.find(n => n.id === q.node);
        }

        function bankCardHtml(q, uid) {
            bankIndex[uid] = q;
            const node = bankNodeOf(q);
            const chips = `
                <div class="bank-chips">
                    <span class="bank-level-tag bank-level-tag-${BANK_LV_CLS[q.level]}">${q.level}</span>
                    <span class="bank-chip">${BANK_TYPE_LABEL[q.type]}</span>
                    <span class="bank-chip">${node.code}｜${node.name}</span>
                    <span class="bank-chip bank-chip-perf">學習表現：${q.perf}</span>
                </div>
            `;
            if (q.type === 'short') {
                return `
                    <div class="quiz-card" style="margin-bottom: 1.25rem;" id="bank-card-${uid}">
                        ${chips}
                        <div class="quiz-title">${q.q}</div>
                        ${handwriteBox('手寫作答區（可打字或切換手寫板作答）', uid)}
                        <div class="quiz-btns">
                            <span></span>
                            <button class="quiz-btn quiz-btn-primary" onclick="bankReveal('${uid}')">對照參考答案</button>
                        </div>
                        <div class="quiz-feedback-box" id="bank-fb-${uid}"></div>
                    </div>
                `;
            }
            let optsHtml = '';
            q.opts.forEach((o, i) => {
                optsHtml += `
                    <div class="quiz-opt-item" id="bank-opt-${uid}-${i}" onclick="bankSelect('${uid}', ${i})">
                        <div class="${q.type === 'multi' ? 'bank-checkbox' : 'quiz-radio-dot'}"></div>
                        <div>${o.t}</div>
                    </div>
                `;
            });
            const hint = q.type === 'multi' ? '<div class="bank-hint">（多選題：應選出所有正確的選項）</div>' : '';
            return `
                <div class="quiz-card" style="margin-bottom: 1.25rem;" id="bank-card-${uid}">
                    ${chips}
                    <div class="quiz-title">${q.q}</div>
                    ${hint}
                    <div class="quiz-options-list">${optsHtml}</div>
                    <div class="quiz-btns">
                        <span></span>
                        <button class="quiz-btn quiz-btn-primary" id="bank-submit-${uid}" onclick="bankSubmit('${uid}')">送出回答</button>
                    </div>
                    <div class="quiz-feedback-box" id="bank-fb-${uid}"></div>
                </div>
            `;
        }

        function bankSelect(uid, idx) {
            if (bankDone[uid]) return;
            const q = bankIndex[uid];
            if (!bankSel[uid]) bankSel[uid] = new Set();
            const sel = bankSel[uid];
            if (q.type === 'multi') {
                sel.has(idx) ? sel.delete(idx) : sel.add(idx);
            } else {
                sel.clear();
                sel.add(idx);
            }
            q.opts.forEach((o, i) => {
                const el = document.getElementById(`bank-opt-${uid}-${i}`);
                if (el) el.classList.toggle('selected', sel.has(i));
            });
        }

        function bankSubmit(uid) {
            const sel = bankSel[uid];
            if (!sel || sel.size === 0) {
                alert('請先選擇選項！');
                return;
            }
            bankDone[uid] = true;
            paintBankResult(uid);
            if (typeof updateDiagProgress === 'function') updateDiagProgress();
        }

        // 把「已作答」的視覺結果畫出來。切換篩選或重新渲染後可重播，
        // 避免 DOM 重建後 bankDone 仍為 true、但畫面看起來沒答過又點不動的死卡。
        function paintBankResult(uid) {
            const q = bankIndex[uid];
            const sel = bankSel[uid];
            if (!q || !sel) return;
            const correctSet = new Set(q.opts.map((o, i) => o.c ? i : -1).filter(i => i >= 0));
            const isCorrect = sel.size === correctSet.size && [...sel].every(i => correctSet.has(i));
            if (!bankScored[uid]) {          // 同一題只計分一次，重播不重複記錄
                bankScored[uid] = true;
                recordResult('bank', bankKey(q), isCorrect, q.node);
                // 登入線上練習時，同步記錄到 Gavin Physics 練習系統（IRT 只採第一次作答）
                if (window.GPRecord) window.GPRecord('gsat', q.node, q.q, [...sel].sort().map(i => 'ABCDE'[i]).join(''), 'gsat ' + q.node);
            }

            q.opts.forEach((o, i) => {
                const el = document.getElementById(`bank-opt-${uid}-${i}`);
                if (!el) return;
                el.classList.remove('selected');
                if (o.c) {
                    el.classList.add('correct');
                } else if (sel.has(i)) {
                    el.classList.add('incorrect');
                }
            });
            const submitBtn = document.getElementById(`bank-submit-${uid}`);
            if (submitBtn) submitBtn.style.display = 'none';

            let whyHtml = '<ul class="bank-why-list">';
            q.opts.forEach(o => {
                const label = o.t.split(' ')[0];
                whyHtml += `<li><strong>${o.c ? '✔' : '✘'} ${label}</strong>：${o.why}</li>`;
            });
            whyHtml += '</ul>';

            const fb = document.getElementById(`bank-fb-${uid}`);
            if (!fb) return;
            fb.style.display = 'block';
            fb.className = 'quiz-feedback-box ' + (isCorrect ? 'correct-fb' : 'incorrect-fb');
            fb.innerHTML = `<strong>${isCorrect ? '答對了！🎉' : '再想想！❌'}</strong> ${q.exp || ''}<div style="margin-top:0.4rem; font-weight:700;">逐選項解析：</div>${whyHtml}`;
            scheduleMathJax([fb]);
        }

        // 渲染完題目列表後呼叫：把先前已作答的題目狀態補回畫面
        function restoreBankStates() {
            Object.keys(bankDone).forEach(uid => {
                if (bankDone[uid] && document.getElementById(`bank-card-${uid}`)) paintBankResult(uid);
            });
        }

        function toggleCERGuide() {
            const body = document.getElementById('cer-guide-body');
            const chev = document.getElementById('cer-guide-chev');
            const isOpening = body.style.maxHeight === '0px' || body.style.maxHeight === '';

            if (isOpening) {
                body.style.maxHeight = body.scrollHeight + 'px';
                chev.textContent = '收起指南 ✖';
            } else {
                body.style.maxHeight = '0px';
                chev.textContent = '展開學習 ➔';
            }
        }

        function bankReveal(uid) {
            const q = bankIndex[uid];
            bankDone[uid] = true;
            const fb = document.getElementById(`bank-fb-${uid}`);
            fb.style.display = 'block';
            fb.className = 'quiz-feedback-box correct-fb';

            let cerHtml = '';
            if (q.cer) {
                cerHtml = `
                    <div class="cer-box">
                        <div style="font-weight:700; color:var(--accent-orange); margin-bottom:0.4rem; display:flex; align-items:center; gap:0.3rem;">
                            <span>📝</span> CER 探究科學論證寫作示範：
                        </div>
                        <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.5rem;">依「觀察到的證據 → 所用的理論推理 → 主張結論」順序組織：</div>
                        <div style="font-size:0.86rem; line-height:1.6; display:flex; flex-direction:column; gap:0.4rem;">
                            <div class="cer-item cer-e" style="margin:0;">
                                <strong>證據 (Evidence)—觀察／題目給定的事實：</strong>${q.cer.e}
                            </div>
                            <div class="cer-item cer-r" style="margin:0;">
                                <strong>推理 (Reasoning)—用來判斷證據的理論：</strong>${q.cer.r}
                            </div>
                            <div class="cer-item cer-c" style="margin:0;">
                                <strong>主張 (Claim)—結論判斷：</strong>${q.cer.c}
                            </div>
                        </div>
                    </div>
                `;
            }

            const pts = q.pts && q.pts.length
                ? '<div style="margin-top:0.6rem; font-weight:700; font-size:0.9rem;">🎯 評分與檢核要點：</div><ul class="bank-why-list" style="margin-top:0.25rem;">' + q.pts.map(p => `<li>☑ ${p}</li>`).join('') + '</ul>'
                : '';

            fb.innerHTML = `
                <div style="font-size:0.92rem; line-height:1.6;">
                    <strong style="color:var(--primary-blue);">參考答案：</strong><br>${q.ans}
                </div>
                ${cerHtml}
                ${pts}
                ${selfGradeRowHtml(`selfGradeBank(this, '${uid}'`)}
            `;
            scheduleMathJax([fb]);
        }

        // ===== 題庫總覽（篩選）視圖 =====
        let bankFilter = { module: 'all', node: 'all', level: 'all', type: 'all' };

        function setBankFilter(key, val) {
            bankFilter[key] = val;
            if (key === 'module') bankFilter.node = 'all';
            renderBankView();
        }

        function renderBankView() {
            const main = document.getElementById('main-content');
            const nodesInScope = knowledgeNodes.filter(n => bankFilter.module === 'all' || n.module === parseInt(bankFilter.module));

            let list = questionBank.filter(q => {
                const n = bankNodeOf(q);
                if (bankFilter.module !== 'all' && n.module !== parseInt(bankFilter.module)) return false;
                if (bankFilter.node !== 'all' && q.node !== bankFilter.node) return false;
                if (bankFilter.level !== 'all' && q.level !== bankFilter.level) return false;
                if (bankFilter.type !== 'all' && q.type !== bankFilter.type) return false;
                return true;
            });
            list.sort((a, b) => a.node === b.node ? BANK_LV_ORDER[a.level] - BANK_LV_ORDER[b.level] : a.node.localeCompare(b.node));

            const moduleOpts = '<option value="all">全部模組</option>' + Object.keys(modulesData).map(k =>
                `<option value="${k}" ${bankFilter.module == k ? 'selected' : ''}>${modulesData[k].title}</option>`).join('');
            const nodeOpts = '<option value="all">全部節點</option>' + nodesInScope.map(n =>
                `<option value="${n.id}" ${bankFilter.node === n.id ? 'selected' : ''}>${n.code}｜${n.name}</option>`).join('');
            const levelChips = ['all', '記憶', '理解', '應用', '分析'].map(lv =>
                `<button class="bank-chip-btn ${bankFilter.level === lv ? 'active' : ''}" onclick="setBankFilter('level', '${lv}')">${lv === 'all' ? '全部層次' : lv}</button>`).join('');
            const typeChips = [['all', '全部題型'], ['single', '單選'], ['multi', '多選'], ['short', '簡答']].map(([v, lab]) =>
                `<button class="bank-chip-btn ${bankFilter.type === v ? 'active' : ''}" onclick="setBankFilter('type', '${v}')">${lab}</button>`).join('');

            let cards = '';
            let lastNode = null;
            list.forEach(q => {
                if (q.node !== lastNode) {
                    const n = bankNodeOf(q);
                    cards += `
                        <div class="bank-node-header">
                            <span class="code-badge">${n.code}</span>
                            <strong>${n.name}</strong>
                            <span class="bank-node-count">近五年含相關 ${nodeExamCounts(n.id).c108} 組</span>
                        </div>
                    `;
                    lastNode = q.node;
                }
                cards += bankCardHtml(q, 'bk' + questionBank.indexOf(q));
            });

            main.innerHTML = `
                <div class="content-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="content-badge">知識節點分級題庫</span>
                        <h2 class="content-title">108 課綱知識節點題庫（記憶／理解／應用／分析）</h2>
                        <p class="content-subtitle">共 ${questionBank.length} 題，覆蓋 ${knowledgeNodes.length} 個知識節點 × 4 個 Bloom 認知層次；題型含五選一單選、多選與簡答，每題標注課綱學習表現並逐選項解析。</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()">
                        <span>🖨️</span> 列印題庫
                    </button>
                </div>

                <div class="bank-filter-bar">
                    <div class="bank-filter-row">
                        <span class="bank-filter-label">模組／節點</span>
                        <select class="bank-select" onchange="setBankFilter('module', this.value)">${moduleOpts}</select>
                        <select class="bank-select" onchange="setBankFilter('node', this.value)">${nodeOpts}</select>
                    </div>
                    <div class="bank-filter-row">
                        <span class="bank-filter-label">認知層次</span>
                        ${levelChips}
                    </div>
                    <div class="bank-filter-row">
                        <span class="bank-filter-label">題型</span>
                        ${typeChips}
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">符合條件：<strong style="color: var(--primary-blue);">${list.length}</strong> 題</div>
                </div>

                <!-- CER Guide Card (Collapsible) -->
                <div class="edu-card cer-guide-card" style="border-left: 5px solid var(--accent-orange); background: linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(255, 255, 255, 0.65) 100%); margin-bottom:1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleCERGuide()">
                        <div class="edu-card-title" style="margin-bottom:0; border:none; padding:0; display:flex; align-items:center; gap:0.5rem; color:var(--accent-orange); font-size:1.02rem;">
                            <span>🎓</span> 大考非選擇題突破：CER 科學論證寫作指南
                        </div>
                        <span id="cer-guide-chev" style="color:var(--text-muted); font-size:0.85rem; font-weight:700;">展開學習 ➔</span>
                    </div>
                    <div id="cer-guide-body" style="max-height:0; overflow:hidden; transition:max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1); margin-top:0;">
                        <div style="border-top:1px dashed rgba(245,158,11,0.2); padding-top:1rem; margin-top:0.75rem; font-size:0.9rem; line-height:1.6; color:var(--text-main);">
                            <p>學測自然科非選擇題中，考生常因「只寫結論無推導過程」或「論證邏輯跳躍」而失分。<strong>CER (Claim-Evidence-Reasoning)</strong> 是國際科學界與大考評分極力推崇的論證寫作模型，能幫助你寫出滿分級解答：</p>

                            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin:1rem 0;">
                                <div class="cer-item cer-c" style="margin:0;">
                                    <strong style="color:var(--primary-blue); font-size:0.92rem;">1. 主張 (Claim) ── 直接答題結論</strong>
                                    <p style="margin-top:0.25rem; font-size:0.84rem; color:var(--text-muted);">明確、簡明地寫出你對問題的直接回答與最終結論。</p>
                                </div>
                                <div class="cer-item cer-e" style="margin:0;">
                                    <strong style="color:var(--accent-cyan); font-size:0.92rem;">2. 證據 (Evidence) ── 引用題目條件</strong>
                                    <p style="margin-top:0.25rem; font-size:0.84rem; color:var(--text-muted);">指出題目給出的關鍵數據、圖表特徵、觀測現象或已知物理事實。</p>
                                </div>
                                <div class="cer-item cer-r" style="margin:0;">
                                    <strong style="color:var(--accent-orange); font-size:0.92rem;">3. 推理 (Reasoning) ── 物理定律連結</strong>
                                    <p style="margin-top:0.25rem; font-size:0.84rem; color:var(--text-muted);">引用物理定律（如冷次定律、牛頓定律）或公式，邏輯性地說明「證據」如何推導出「主張」。</p>
                                </div>
                            </div>

                            <div style="background:var(--primary-blue-light); border-left:4px solid var(--primary-blue); border-radius:0 6px 6px 0; padding:0.75rem 1rem; margin-top:0.75rem; font-size:0.85rem;">
                                <strong>💡 滿分寫作示範：當磁鐵 N 極由上方接近水平線圈時，應電流方向為何？</strong><br>
                                <ul style="margin:0.25rem 0 0 1.25rem; padding:0; line-height:1.5;">
                                    <li><strong>【主張 (C)】：</strong>由上往下看，線圈將產生<strong>逆時針方向</strong>的感應電流。</li>
                                    <li><strong>【證據 (E)】：</strong>磁鐵 N 極向下接近水平線圈，使穿過線圈<strong>向下的穿過線圈的磁場隨時間增加</strong>。</li>
                                    <li><strong>【推理 (R)】：</strong>根據<strong>冷次定律</strong>，應電流產生的磁場必須抵抗（阻礙）原穿過線圈的磁場的變化，因此線圈會感應出與原磁場方向相反的<strong>向上磁場</strong>。再依<strong>安培右手定則</strong>（大拇指朝上），四指彎曲方向即為<strong>逆時針方向</strong>。</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                ${cards || '<div class="edu-card">此篩選條件下沒有題目，請放寬條件。</div>'}
            `;

            restoreBankStates();   // 切換篩選後把已作答題目的對錯與解析補回來
            scheduleMathJax([main]);
        }

