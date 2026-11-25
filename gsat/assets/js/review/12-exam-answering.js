// 歷屆試題選擇題作答邏輯與狀態
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 歷屆試題選擇題作答邏輯與狀態 =====
        const examMCSel = {};
        const examMCGraded = {}; // 防止同一次作答因重複開合詳解而重複記錄

        function parseExamAnswers(ansStr) {
            const results = [];
            let str = (ansStr || '').trim();

            // 匹配子題 (如 Q1：(B)、Q22：(CE)、Q51：非選)
            const subMatches = [...str.matchAll(/(Q\d+|第\s*\d+[-~、]\s*\d+\s*題|第\s*\d+\s*題|Q\d+參)\s*[：:]\s*(非選|\([A-E]+\))/g)];
            if (subMatches.length > 0) {
                subMatches.forEach(m => {
                    const label = m[1];
                    const ansVal = m[2];
                    if (ansVal.startsWith('(')) {
                        const letters = ansVal.replace(/[\(\)]/g, '').split('');
                        results.push({ label, isMC: true, ans: letters });
                    } else {
                        results.push({ label, isMC: false, ans: [] });
                    }
                });
            } else {
                // 單一題目，匹配 (B) 或 (DE)
                const mcMatch = str.match(/^\s*\(([A-E]+)\)/);
                if (mcMatch) {
                    const letters = mcMatch[1].split('');
                    results.push({ label: '', isMC: true, ans: letters });
                } else {
                    results.push({ label: '', isMC: false, ans: [] });
                }
            }
            return results;
        }

        function toggleExamMC(btn, key, qIdx, opt) {
            const item = btn.closest('.exam-item');
            const solBox = item.querySelector('.exam-sol');
            if (solBox && !solBox.hasAttribute('hidden')) return; // 已公布答案時禁止更改

            if (!examMCSel[key]) examMCSel[key] = {};
            if (!examMCSel[key][qIdx]) examMCSel[key][qIdx] = new Set();

            const sel = examMCSel[key][qIdx];
            if (sel.has(opt)) {
                sel.delete(opt);
                btn.classList.remove('selected');
            } else {
                sel.add(opt);
                btn.classList.add('selected');
            }
        }

        function checkExamMC(key, itemEl) {
            const s = examSolutions[key];
            if (!s) return;
            const mcQuestions = parseExamAnswers(s.ans);
            const selections = examMCSel[key] || {};

            mcQuestions.forEach((q, qIdx) => {
                if (!q.isMC) return;

                const sel = selections[qIdx] || new Set();
                const correctSet = new Set(q.ans);
                const isCorrect = sel.size === correctSet.size && [...sel].every(opt => correctSet.has(opt));

                // 記錄「已計分的那組答案」而非單純的布林旗標：
                // 用布林會讓學生在錯題本重做、即使改對了也不再計分，錯題永遠移不掉。
                // 改存答案簽章後：答案有變 → 重新計分；只是反覆開合詳解 → 不重複計。
                const gKey = key + '#' + qIdx;
                const sig = [...sel].sort().join('');
                if (sel.size > 0 && examMCGraded[gKey] !== sig) {
                    examMCGraded[gKey] = sig;
                    const entry = examPractice.find(x => x.year + '_' + x.q === key);
                    recordResult('exam', gKey, isCorrect, entry ? entry.nodes : []);
                }

                const row = itemEl.querySelector(`#exam-mc-row-${key}-${qIdx}`);
                if (row) {
                    ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
                        const optBtn = row.querySelector(`[data-opt="${opt}"]`);
                        if (optBtn) {
                            optBtn.classList.remove('selected');
                            if (correctSet.has(opt)) {
                                optBtn.classList.add('correct');
                            } else if (sel.has(opt)) {
                                optBtn.classList.add('incorrect');
                            }
                        }
                    });

                    const resultText = row.querySelector(`#exam-mc-result-${key}-${qIdx}`);
                    if (resultText) {
                        resultText.style.display = 'inline-block';
                        if (isCorrect) {
                            resultText.style.color = 'var(--accent-green)';
                            resultText.innerHTML = '🎉 答對了！';
                        } else {
                            resultText.style.color = 'var(--accent-rose)';
                            resultText.innerHTML = `❌ 答錯（正確答案：${q.ans.join('')}）`;
                        }
                    }
                }
            });
        }

        function resetExamMC(key, itemEl) {
            const s = examSolutions[key];
            if (!s) return;
            const mcQuestions = parseExamAnswers(s.ans);

            if (examMCSel[key]) {
                mcQuestions.forEach((q, qIdx) => {
                    if (examMCSel[key][qIdx]) examMCSel[key][qIdx].clear();
                });
            }
            mcQuestions.forEach((q, qIdx) => { delete examMCGraded[key + '#' + qIdx]; });

            mcQuestions.forEach((q, qIdx) => {
                if (!q.isMC) return;
                const row = itemEl.querySelector(`#exam-mc-row-${key}-${qIdx}`);
                if (row) {
                    ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
                        const optBtn = row.querySelector(`[data-opt="${opt}"]`);
                        if (optBtn) optBtn.classList.remove('correct', 'incorrect', 'selected');
                    });
                    const resultText = row.querySelector(`#exam-mc-result-${key}-${qIdx}`);
                    if (resultText) {
                        resultText.style.display = 'none';
                        resultText.textContent = '';
                    }
                }
            });
        }

        // 升級版手寫與繪圖作答區（支援 canvas 手繪與答題紙底圖）
        function handwriteBox(label, uid, sheetFile = '') {
            const style = sheetFile ? `style="background-image: url('assets/exam_crops/${sheetFile}');"` : '';
            return `
            <div class="handwrite">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <div class="handwrite-label" style="margin-bottom:0;">✍️ ${label}</div>
                    ${!sheetFile ? `<button class="canvas-tool-btn" id="toggle-mode-btn-${uid}" onclick="toggleWritingMode('${uid}')" style="padding:0.2rem 0.5rem; font-size:0.75rem;">✍️ 切換手寫板</button>` : ''}
                </div>

                <!-- 預設打字輸入框（適用於一般文字非選題） -->
                <textarea class="bank-short-input" id="handwrite-text-${uid}" rows="4" placeholder="請先在此寫下你的作答，或點擊右上角切換至「手寫板」用觸控筆／滑鼠作答..." style="width:100%; border:1px solid var(--border-color); border-radius:6px; padding:0.5rem; font-family:inherit; font-size:0.88rem; outline:none; resize:vertical; display:${sheetFile ? 'none' : 'block'};"></textarea>

                <!-- 繪圖畫布板（有答題紙底圖時預設顯示，無底圖時手寫板顯示） -->
                <div class="canvas-board-wrap" id="board-wrap-${uid}" style="display:${sheetFile ? 'block' : 'none'};">
                    <div class="canvas-toolbar">
                        <button class="canvas-tool-btn active" data-tool="pen" onclick="setCanvasTool('${uid}', 'pen')">✏️ 畫筆</button>
                        <button class="canvas-tool-btn" data-tool="text" onclick="addCanvasText('${uid}')">🔤 插入文字</button>
                        <button class="canvas-tool-btn" data-tool="eraser" onclick="setCanvasTool('${uid}', 'eraser')">🧽 橡皮擦</button>
                        <button class="canvas-tool-btn clear-btn" onclick="clearCanvas('${uid}')" style="margin-left:auto;">🗑️ 重畫</button>
                    </div>
                <div class="canvas-container" style="position:relative; width:100%;">
                    <canvas id="canvas-${uid}" class="draw-canvas" data-sheet="${sheetFile}" aria-label="${label}" ${style}>此區為${label}；若瀏覽器無法使用畫布，請改用文字輸入或紙筆作答。</canvas>
                </div>
                </div>
            </div>`;
        }

        const EXAM_SHEET_ANSWERS = Object.freeze({
            '111_51_sheet.png': '111_51_ans.png',
            '113_46_sheet.png': '113_46_ans.png',
            '115_49_sheet.png': '115_49_ans.png',
            '115_53_sheet.png': '115_53_ans.png'
        });

        // 歷屆題的「答案與詳解」區塊（非選附手寫作答區與 CER 結構，選擇題附作答按鈕）
        function examSolBlock(e) {
            const key = e.year + '_' + e.q;
            const s = examSolutions[key];
            if (!s) return '';
            const isHand = Boolean(s.hand);
            const sheetFile = s.sheet || '';
            const hand = isHand ? handwriteBox(sheetFile ? '答題卷作答區（請直接在底圖格線上作答／手繪）' : '非選作答區（可打字或手寫）', key, sheetFile) : '';

            // 一般選擇題才顯示選項作答；手寫題組直接進入非選參考答案與評分規準。
            const mcQuestions = parseExamAnswers(s.ans);
            let mcHtml = '';
            let hasMC = false;

            mcQuestions.forEach((q, qIdx) => {
                if (q.isMC && !isHand) {
                    hasMC = true;
                    let optionsButtons = '';
                    ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
                        optionsButtons += `
                            <button class="exam-opt-btn" data-opt="${opt}" onclick="toggleExamMC(this, '${key}', ${qIdx}, '${opt}')">${opt}</button>
                        `;
                    });

                    const qTitle = q.label ? `${q.label}作答：` : '選擇題作答：';
                    mcHtml += `
                        <div class="exam-mc-row" id="exam-mc-row-${key}-${qIdx}">
                            <span class="exam-mc-qtitle">${qTitle}</span>
                            <div class="exam-mc-options">${optionsButtons}</div>
                            <span class="exam-mc-result" id="exam-mc-result-${key}-${qIdx}" style="display:none; font-weight:700; margin-left:0.5rem; font-size:0.88rem;"></span>
                        </div>
                    `;
                }
            });

            let mcSection = '';
            if (hasMC) {
                mcSection = `
                    <div class="exam-mc-section">
                        <div class="handwrite-label" style="margin-bottom:0.4rem; color:var(--primary-blue); font-size:0.88rem;">✏️ 選擇題作答區（點選作答，點「顯示答案與詳解」時自動核對）</div>
                        ${mcHtml}
                    </div>
                `;
            }

            // 如果是手繪題，動態在答案區最上方渲染官方手繪滿分答案圖
            const answerSheetFile = EXAM_SHEET_ANSWERS[sheetFile] || '';
            const ansImg = answerSheetFile ? `
                <div style="margin: 0.5rem 0.9rem 0.75rem 0.9rem; padding-bottom: 0.75rem; border-bottom: 1px dashed var(--border-color);">
                    <div style="font-weight:700; color:#047857; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.25rem;">
                        <span>🎯</span> 官方答題卷手繪滿分答案示範：
                    </div>
                    <img class="exam-crop ${invertCrops ? 'inverted' : ''}" loading="lazy" src="assets/exam_crops/${answerSheetFile}" style="max-width:100%; border:1px solid var(--border-color); border-radius:6px;" alt="手繪題官方答案圖">
                </div>
            ` : '';

            const rubricTitle = s.rubricTitle || '官方評分規準';
            const rubricItems = Array.isArray(s.rubric) ? s.rubric.map(item => `
                <div class="exam-rubric-item">
                    <span class="exam-rubric-score">${item.score}</span>
                    <span>${item.text}</span>
                </div>
            `).join('') : '';
            const rubricUrl = encodeURI(examPapers[e.year]?.rubric || '');
            const rubricSourceLabel = e.year === '111參'
                ? '📄 開啟官方參考答案 PDF'
                : '📄 開啟官方非選擇題參考答案與評分原則 PDF';
            const handAssessment = isHand ? `
                <div class="exam-hand-answer">
                    <div class="exam-hand-answer-head">
                        <span>📝 滿分參考答案</span>
                    </div>
                    <div class="exam-hand-answer-body">${s.handAns || s.ans}</div>
                </div>
                ${ansImg}
                <div class="exam-rubric">
                    <div class="exam-rubric-head">
                        <span>🎯 ${rubricTitle}</span>
                        ${Number.isFinite(s.score) ? `<span class="exam-rubric-total">滿分 ${s.score} 分</span>` : ''}
                    </div>
                    <div class="exam-rubric-list">${rubricItems}</div>
                    ${rubricUrl ? `<a class="exam-rubric-source" href="${rubricUrl}" target="_blank" rel="noopener">${rubricSourceLabel} →</a>` : ''}
                </div>
            ` : '';
            const revealLabel = isHand ? '📋 顯示參考答案與評分規準' : '📖 顯示答案與詳解';

            return `
                ${hand}
                ${mcSection}
                <div class="exam-sol-wrap">
                    <button class="exam-sol-btn" onclick="toggleExamSol(this, '${key}')">${revealLabel}</button>
                    <div class="exam-sol" hidden>
                        ${isHand ? handAssessment : `
                            <div class="exam-ans">✅ 答案：${s.ans}</div>
                            <div class="exam-detail">${s.sol}</div>
                        `}
                        ${isHand ? selfGradeRowHtml(`selfGradeExam(this, '${key}'`) : ''}
                    </div>
                </div>`;
        }

        function resizeExamBody(el) {
            const body = el.closest('.exam-body');
            const item = el.closest('.exam-item');
            if (body && item && item.classList.contains('open')) {
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        }

