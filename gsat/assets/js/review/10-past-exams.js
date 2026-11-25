// 歷屆試題練習、官方答案詳解、分類校對器
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 歷屆試題練習（連結至試卷 PDF 對應頁面）=====
        // 每題經逐題比對試卷 PDF 判定為「物理題（含以物理為主的跨科題組）」，page 為該題在 PDF 的頁碼。
        // pk（試卷代碼）→ 顯示名稱、課綱、PDF 路徑、裁切圖檔名前綴
        const examPapers = {
            '111參': { label: '111 參考卷', cur: '108', crop: '111ref', paper: '108課綱全/01-111自然考科參考試卷.pdf', answer: '108課綱全/03-111自然考科參考試卷參考答案.pdf', rubric: '108課綱全/03-111自然考科參考試卷參考答案.pdf' },
            '115': { label: '115 學測', cur: '108', crop: '115', paper: '108課綱全/06-115學測自然試卷.pdf',     answer: '108課綱全/06-115學測自然答案.pdf', rubric: '108課綱全/07-115學測自然考科非選擇題參考答案與評分原則.pdf' },
            '114': { label: '114 學測', cur: '108', crop: '114', paper: '108課綱全/06-114學測自然試題定稿.pdf', answer: '108課綱全/06-114學測自然答案.pdf', rubric: '108課綱全/07-114學測自然考科非選擇題參考答案與評分原則.pdf' },
            '113': { label: '113 學測', cur: '108', crop: '113', paper: '108課綱全/06-113學測自然試題定稿.pdf', answer: '108課綱全/06-113學測自然答案.pdf', rubric: '108課綱全/07-113學測自然考科非選擇題參考答案與評分原則.pdf' },
            '112': { label: '112 學測', cur: '108', crop: '112', paper: '108課綱全/06-112學測自然試卷.pdf',     answer: '108課綱全/06-112學測自然選擇題答案.pdf', rubric: '108課綱全/07-112學測自然非選擇題參考答案與評分原則.pdf' },
            '111': { label: '111 學測', cur: '108', crop: '111', paper: '108課綱全/06-111學測自然試卷.pdf',     answer: '108課綱全/06-111學測自然選擇題答案.pdf', rubric: '108課綱全/07-111學測自然非選擇題評分原則.pdf' },
            '110': { label: '110 學測', cur: '99',  crop: '110', paper: '99課綱/110學測自然試卷.pdf',            answer: '99課綱/110學測自然答案.pdf' },
            '109': { label: '109 學測', cur: '99',  crop: '109', paper: '99課綱/05-109學測自然試卷定稿.pdf',      answer: '99課綱/05-109學測自然答案.pdf' },
            '108': { label: '108 學測', cur: '99',  crop: '108', paper: '99課綱/01-108學測自然試卷定稿.pdf',      answer: '99課綱/05-108學測自然選擇題答案.pdf' },
            '107': { label: '107 學測', cur: '99',  crop: '107', paper: '99課綱/05-107學測自然試卷定稿.pdf',      answer: '99課綱/05-107學測自然答案.pdf' },
            '106': { label: '106 學測', cur: '99',  crop: '106', paper: '99課綱/05-106學測自然試卷定稿.pdf',      answer: '99課綱/05-106學測自然選擇題答案.pdf' }
        };
        // 試卷顯示順序：108 課綱（參考卷＋111-115）在前，99 課綱（106-110）在後
        const examPaperOrder = ['111參', '115', '114', '113', '112', '111', '110', '109', '108', '107', '106'];


        // ===== 歷屆試題：官方答案 + 詳解（非選以 CER 結構、附手寫作答區）=====
        // 答案取自大考中心官方選擇題答案與非選擇題評分原則；hand:true 表示含手寫非選作答。

        let examYearFilter = 'all';
        let examNodeFilter = 'all';
        const loadedExamYears = new Set(['115']);
        let show99 = false;   // 是否納入 99 課綱（106–110 學測）
        let invertCrops = false; // 是否題目黑白反色
        let currentView = 'module';   // 'exams' | 'stats' | 其他

        let statsSortKey = 'exam5y'; // 預設依 108課綱題數 排序
        let statsSortDesc = true;

        function toggleStatsSort(key) {
            if (statsSortKey === key) {
                statsSortDesc = !statsSortDesc;
            } else {
                statsSortKey = key;
                statsSortDesc = true;
            }
            renderStatsView();
        }

        function getSortArrow(key) {
            if (statsSortKey !== key) return '<span style="opacity:0.25; font-size:0.75rem; margin-left:0.25rem;">⇅</span>';
            return statsSortDesc ? '<span style="color:var(--primary-blue); font-size:0.75rem; margin-left:0.25rem;">▼</span>' : '<span style="color:var(--primary-blue); font-size:0.75rem; margin-left:0.25rem;">▲</span>';
        }

        function nodeLabel(id) {
            const n = knowledgeNodes.find(x => x.id === id);
            return n ? n.code + '｜' + n.name : id;
        }

        // 少數跨頁題組有第二張裁切圖；其餘每題一張，檔名為 {crop}_{q}.png
        // 題目內容跨頁者，補上第二張裁切圖；否則選項會整組看不到。
        const examCropExtra = {
            '108_35': ['108_35.png', '108_35__p2.png'],
            '111_58-60': ['111_58-60.png', '111_58-60__p2.png'],
            '112_51-52': ['112_51-52.png', '112_51-52__p2.png']
        };
        function cropsFor(e) {
            const ck = examPapers[e.year].crop + '_' + e.q;
            return examCropExtra[ck] || [ck + '.png'];
        }
        // nodes 中的節點皆為完成作答需要的相關考點，不區分主次。
        // 近五年只計 111–115 正式學測；111 參考卷另列，避免混入五年統計。
        function nodeExamCounts(nodeId) {
            let c108 = 0, reference108 = 0, c99 = 0;
            examPractice.forEach(e => {
                if (!e.nodes.includes(nodeId)) return;
                if (examPapers[e.year].cur === '99') {
                    c99++;
                } else if (e.year === '111參') {
                    reference108++;
                } else if (['111', '112', '113', '114', '115'].includes(e.year)) {
                    c108++;
                }
            });
            return { c108, reference108, c99 };
        }

        // ===== 歷屆題分類校對器：人工確認所有相關考點，結果存於本機 =====
        const TAXONOMY_REVIEW_KEY = 'physics-taxonomy-review-v1';
        let taxonomyReviewState = loadTaxonomyReviewState();
        let taxonomyActiveKey = null;
        let taxonomyFilter = { year: 'all', status: 'all', query: '' };
        reconcileTaxonomyReviewState();

        function taxonomyExamKey(exam) {
            return `${exam.year}:${exam.q}`;
        }

        function taxonomyEscapeHtml(value) {
            return String(value ?? '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        }

        function loadTaxonomyReviewState() {
            try {
                const parsed = JSON.parse(localStorage.getItem(TAXONOMY_REVIEW_KEY));
                if (parsed && parsed.version === 1 && parsed.items && typeof parsed.items === 'object') return parsed;
            } catch (error) {
                // 無痕模式或舊資料格式無法讀取時，從空白校對狀態開始。
            }
            return { version: 1, updatedAt: null, items: {} };
        }

        function saveTaxonomyReviewState() {
            taxonomyReviewState.updatedAt = new Date().toISOString();
            try {
                localStorage.setItem(TAXONOMY_REVIEW_KEY, JSON.stringify(taxonomyReviewState));
            } catch (error) {
                showTaxonomyToast('瀏覽器無法保存資料，請先下載校對檔。');
            }
        }

        function taxonomyNodesEqual(a, b) {
            return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(id => b.includes(id));
        }

        function reconcileTaxonomyReviewState() {
            let changed = false;
            examPractice.forEach(exam => {
                const item = taxonomyReviewState.items[taxonomyExamKey(exam)];
                if (
                    item?.status === 'correction'
                    && !taxonomyNodesEqual(item.sourceNodes, exam.nodes)
                    && taxonomyNodesEqual(item.proposedNodes, exam.nodes)
                ) {
                    item.status = 'confirmed';
                    item.sourceNodes = [...exam.nodes];
                    item.updatedAt = new Date().toISOString();
                    changed = true;
                }
            });
            if (changed) saveTaxonomyReviewState();
        }

        function taxonomyStoredReview(exam) {
            return taxonomyReviewState.items[taxonomyExamKey(exam)] || null;
        }

        function taxonomyProposal(exam) {
            const stored = taxonomyStoredReview(exam);
            const validIds = new Set(knowledgeNodes.map(n => n.id));
            const source = stored && Array.isArray(stored.proposedNodes) ? stored.proposedNodes : exam.nodes;
            const unique = [...new Set(source.filter(id => validIds.has(id)))];
            if (unique.length === 0) unique.push(exam.nodes[0]);
            return unique;
        }

        function taxonomyStatus(exam) {
            return taxonomyStoredReview(exam)?.status || 'unreviewed';
        }

        function taxonomyStatusLabel(status) {
            return {
                confirmed: '分類正確',
                correction: '需要修正',
                draft: '尚未送出',
                unreviewed: '待校對'
            }[status] || '待校對';
        }

        function taxonomySaveItem(exam, status, proposedNodes, note) {
            taxonomyReviewState.items[taxonomyExamKey(exam)] = {
                status,
                sourceNodes: [...exam.nodes],
                proposedNodes: [...proposedNodes],
                note: String(note || ''),
                updatedAt: new Date().toISOString()
            };
            saveTaxonomyReviewState();
        }

        function taxonomyFilteredExams() {
            const query = taxonomyFilter.query.trim().toLowerCase();
            return examPractice.filter(exam => {
                if (taxonomyFilter.year !== 'all' && exam.year !== taxonomyFilter.year) return false;
                const status = taxonomyStatus(exam);
                if (taxonomyFilter.status === 'unreviewed' && (status === 'confirmed' || status === 'correction')) return false;
                if (taxonomyFilter.status !== 'all' && taxonomyFilter.status !== 'unreviewed' && status !== taxonomyFilter.status) return false;
                if (query) {
                    const labels = exam.nodes.map(nodeLabel).join(' ');
                    const haystack = `${exam.year} ${exam.q} ${exam.topic} ${labels}`.toLowerCase();
                    if (!haystack.includes(query)) return false;
                }
                return true;
            });
        }

        function taxonomyNodePickerHtml(proposedNodes) {
            const selectedNodes = new Set(proposedNodes);
            return Object.keys(modulesData).map(Number).sort((a, b) => a - b).map(moduleNum => {
                const buttons = knowledgeNodes.filter(n => n.module === moduleNum).map(node => {
                    const selected = selectedNodes.has(node.id);
                    return `
                        <button class="taxonomy-node-pick ${selected ? 'selected' : ''}" type="button"
                            title="${taxonomyEscapeHtml(node.name)}"
                            onclick="taxonomyToggleNode('${node.id}')">
                            ${node.id} ${taxonomyEscapeHtml(node.name)}
                        </button>
                    `;
                }).join('');
                return `
                    <div class="taxonomy-module-pick">
                        <strong>${taxonomyEscapeHtml(modulesData[moduleNum].title)}</strong>
                        <div class="taxonomy-node-picks">${buttons}</div>
                    </div>
                `;
            }).join('');
        }

        function taxonomyCurrentChips(exam) {
            return exam.nodes.map(id =>
                `<span class="bank-chip">${id} ${taxonomyEscapeHtml(knowledgeNodes.find(n => n.id === id)?.name || id)}</span>`
            ).join('');
        }

        function taxonomyQueueItemHtml(exam) {
            const key = taxonomyExamKey(exam);
            const status = taxonomyStatus(exam);
            return `
                <button class="taxonomy-queue-item ${key === taxonomyActiveKey ? 'active' : ''}" type="button"
                    data-taxonomy-key="${taxonomyEscapeHtml(key)}" onclick="taxonomySelectExam('${taxonomyEscapeHtml(key)}')">
                    <span class="taxonomy-status-dot ${status}"></span>
                    <span>
                        <strong>${taxonomyEscapeHtml(examPapers[exam.year].label)}｜第 ${taxonomyEscapeHtml(exam.q)} 題</strong>
                        <span>${taxonomyEscapeHtml(exam.topic)}</span>
                    </span>
                </button>
            `;
        }

        function taxonomySummaryCounts() {
            const statuses = examPractice.map(taxonomyStatus);
            const confirmed = statuses.filter(status => status === 'confirmed').length;
            const correction = statuses.filter(status => status === 'correction').length;
            const draft = statuses.filter(status => status === 'draft').length;
            return {
                total: examPractice.length,
                confirmed,
                correction,
                draft,
                reviewed: confirmed + correction,
                remaining: examPractice.length - confirmed - correction
            };
        }

        function renderTaxonomyReviewView() {
            const main = document.getElementById('main-content');
            const list = taxonomyFilteredExams();
            if (!taxonomyActiveKey || !list.some(exam => taxonomyExamKey(exam) === taxonomyActiveKey)) {
                taxonomyActiveKey = list.length ? taxonomyExamKey(list[0]) : null;
            }
            const current = list.find(exam => taxonomyExamKey(exam) === taxonomyActiveKey) || null;
            const counts = taxonomySummaryCounts();
            const years = examPaperOrder.map(year =>
                `<option value="${year}" ${taxonomyFilter.year === year ? 'selected' : ''}>${taxonomyEscapeHtml(examPapers[year].label)}</option>`
            ).join('');

            let workbenchHtml = '<div class="taxonomy-empty"><strong>目前篩選沒有題目。</strong><br>請改變年份、狀態或搜尋條件。</div>';
            if (current) {
                const stored = taxonomyStoredReview(current);
                const proposed = taxonomyProposal(current);
                const status = stored?.status || 'unreviewed';
                const note = stored?.note || '';
                const info = examPapers[current.year];
                const crops = cropsFor(current).map(filename =>
                    `<img src="assets/exam_crops/${filename}" alt="${taxonomyEscapeHtml(info.label)}第 ${taxonomyEscapeHtml(current.q)} 題" loading="eager">`
                ).join('');
                workbenchHtml = `
                    <section class="taxonomy-evidence">
                        <div class="taxonomy-question-head">
                            <div>
                                <h3>${taxonomyEscapeHtml(info.label)}｜第 ${taxonomyEscapeHtml(current.q)} 題</h3>
                                <p>${taxonomyEscapeHtml(current.topic)}</p>
                            </div>
                            <span class="taxonomy-review-state ${status}" id="taxonomy-review-state">${taxonomyStatusLabel(status)}</span>
                        </div>
                        <div class="taxonomy-crops">${crops}</div>
                        <div class="taxonomy-current">
                            <strong>目前網站分類：</strong>
                            <span class="bank-chips">${taxonomyCurrentChips(current)}</span>
                            <a class="exam-pdflink" style="margin-left:0.45rem;" href="${encodeURI(info.paper)}#page=${current.page}" target="_blank" rel="noopener">開啟完整試卷第 ${current.page} 頁</a>
                        </div>
                    </section>

                    <section class="taxonomy-editor">
                        <h3>你的分類判定</h3>
                        <div class="classification-note" style="margin-top:0.55rem;">
                            所有節點都視為<strong>相關考點</strong>，不分主次。只有真正參與公式、判斷或排除選項的概念才勾選，且每題至少保留一個節點。
                        </div>
                        <div class="taxonomy-field">
                            <span class="taxonomy-field-label">相關考點（可複選）</span>
                            <div class="taxonomy-module-picks">${taxonomyNodePickerHtml(proposed)}</div>
                        </div>
                        <div class="taxonomy-field">
                            <label for="taxonomy-note">備註（可選，例如：第 22 題用 N23、第 23 題只讀圖）</label>
                            <textarea class="taxonomy-note" id="taxonomy-note" placeholder="補充你判斷錯誤的理由…" oninput="taxonomyUpdateNote(this.value)">${taxonomyEscapeHtml(note)}</textarea>
                        </div>
                        <div class="taxonomy-actions">
                            <button class="taxonomy-action secondary" type="button" onclick="taxonomyMove(-1)">← 上一題</button>
                            <button class="taxonomy-action confirm" type="button" onclick="taxonomyMarkConfirmed()">✓ 分類正確</button>
                            <button class="taxonomy-action correction" type="button" onclick="taxonomyMarkCorrection()">! 需要修正</button>
                            <button class="taxonomy-action next" type="button" onclick="taxonomyMove(1)">下一題 →</button>
                        </div>
                    </section>
                `;
            }

            main.innerHTML = `
                <div class="content-header">
                    <span class="content-badge" style="color:#4e3d70; background:#f2eef8; border-color:#d8cdea;">人工分類校對</span>
                    <h2 class="content-title">歷屆題分類校對器</h2>
                    <p class="content-subtitle">看原題、勾選所有相關知識節點，再標記正確或需要修正。進度會保存在這台裝置；完成後按「複製給 Codex」，直接把文字貼回對話即可。</p>
                </div>

                <div class="taxonomy-summary">
                    <div class="taxonomy-stat" style="--stat-color:#60747c;"><strong>${counts.total}</strong><span>全部題目／題組</span></div>
                    <div class="taxonomy-stat" style="--stat-color:#18845c;"><strong>${counts.confirmed}</strong><span>確認正確</span></div>
                    <div class="taxonomy-stat" style="--stat-color:#c44052;"><strong>${counts.correction}</strong><span>需要修正</span></div>
                    <div class="taxonomy-stat" style="--stat-color:#7557a6;"><strong>${counts.remaining}</strong><span>尚未完成</span></div>
                </div>

                <div class="taxonomy-toolbar">
                    <select aria-label="篩選年份" onchange="taxonomySetFilter('year', this.value)">
                        <option value="all">全部年份</option>
                        ${years}
                    </select>
                    <select aria-label="篩選校對狀態" onchange="taxonomySetFilter('status', this.value)">
                        <option value="all" ${taxonomyFilter.status === 'all' ? 'selected' : ''}>全部狀態</option>
                        <option value="unreviewed" ${taxonomyFilter.status === 'unreviewed' ? 'selected' : ''}>待校對／草稿</option>
                        <option value="confirmed" ${taxonomyFilter.status === 'confirmed' ? 'selected' : ''}>分類正確</option>
                        <option value="correction" ${taxonomyFilter.status === 'correction' ? 'selected' : ''}>需要修正</option>
                    </select>
                    <input type="search" value="${taxonomyEscapeHtml(taxonomyFilter.query)}" placeholder="搜尋題號、主題或節點…" aria-label="搜尋分類題目" onchange="taxonomySetFilter('query', this.value)">
                    <button class="taxonomy-action secondary" type="button" onclick="downloadTaxonomyReview()">下載校對檔</button>
                    <button class="taxonomy-action taxonomy-export" type="button" onclick="copyTaxonomyCorrections()">複製給 Codex</button>
                </div>

                <div class="taxonomy-shell">
                    <aside class="taxonomy-queue">
                        <div class="taxonomy-queue-head">目前清單 ${list.length} 題｜綠色正確、紅色待修、橘色草稿</div>
                        <div class="taxonomy-queue-list">${list.map(taxonomyQueueItemHtml).join('')}</div>
                    </aside>
                    <div class="taxonomy-workbench">${workbenchHtml}</div>
                </div>
            `;

            requestAnimationFrame(() => {
                const active = document.querySelector('.taxonomy-queue-item.active');
                if (active) active.scrollIntoView({ block: 'nearest' });
            });
        }

        function taxonomyCurrentExam() {
            return examPractice.find(exam => taxonomyExamKey(exam) === taxonomyActiveKey) || null;
        }

        function taxonomySelectExam(key) {
            taxonomyActiveKey = key;
            renderTaxonomyReviewView();
        }

        function taxonomySetFilter(key, value) {
            taxonomyFilter[key] = value;
            taxonomyActiveKey = null;
            renderTaxonomyReviewView();
        }

        function taxonomyToggleNode(nodeId) {
            const exam = taxonomyCurrentExam();
            if (!exam || !knowledgeNodes.some(node => node.id === nodeId)) return;
            const selected = new Set(taxonomyProposal(exam));
            if (selected.has(nodeId) && selected.size === 1) {
                showTaxonomyToast('每題至少需要保留一個相關節點。');
                return;
            }
            if (selected.has(nodeId)) selected.delete(nodeId);
            else selected.add(nodeId);
            const orderedNodes = knowledgeNodes.map(node => node.id).filter(id => selected.has(id));
            const note = taxonomyStoredReview(exam)?.note || document.getElementById('taxonomy-note')?.value || '';
            taxonomySaveItem(exam, 'draft', orderedNodes, note);
            renderTaxonomyReviewView();
        }

        function taxonomyUpdateNote(value) {
            const exam = taxonomyCurrentExam();
            if (!exam) return;
            taxonomySaveItem(exam, 'draft', taxonomyProposal(exam), value);
            const state = document.getElementById('taxonomy-review-state');
            if (state) {
                state.className = 'taxonomy-review-state draft';
                state.textContent = taxonomyStatusLabel('draft');
            }
        }

        function taxonomyNextKeyAfter(currentKey) {
            const currentIndex = examPractice.findIndex(exam => taxonomyExamKey(exam) === currentKey);
            const candidates = taxonomyFilteredExams();
            const next = candidates.find(exam => examPractice.indexOf(exam) > currentIndex) || candidates[0] || null;
            return next ? taxonomyExamKey(next) : null;
        }

        function taxonomyMarkConfirmed() {
            const exam = taxonomyCurrentExam();
            if (!exam) return;
            const note = document.getElementById('taxonomy-note')?.value || '';
            const oldKey = taxonomyExamKey(exam);
            taxonomySaveItem(exam, 'confirmed', [...exam.nodes], note);
            taxonomyActiveKey = taxonomyNextKeyAfter(oldKey);
            showTaxonomyToast(`${exam.year} 第 ${exam.q} 題：已確認分類正確`);
            renderTaxonomyReviewView();
        }

        function taxonomyMarkCorrection() {
            const exam = taxonomyCurrentExam();
            if (!exam) return;
            const proposed = taxonomyProposal(exam);
            const note = document.getElementById('taxonomy-note')?.value.trim() || '';
            const unchanged = taxonomyNodesEqual(proposed, exam.nodes);
            if (unchanged && !note) {
                showTaxonomyToast('請先修改相關節點，或寫下錯誤原因。');
                return;
            }
            const oldKey = taxonomyExamKey(exam);
            taxonomySaveItem(exam, 'correction', proposed, note);
            taxonomyActiveKey = taxonomyNextKeyAfter(oldKey);
            showTaxonomyToast(`${exam.year} 第 ${exam.q} 題：已加入修正清單`);
            renderTaxonomyReviewView();
        }

        function taxonomyMove(delta) {
            const list = taxonomyFilteredExams();
            if (!list.length) return;
            const index = Math.max(0, list.findIndex(exam => taxonomyExamKey(exam) === taxonomyActiveKey));
            taxonomyActiveKey = taxonomyExamKey(list[(index + delta + list.length) % list.length]);
            renderTaxonomyReviewView();
        }

        function taxonomyExportRecords() {
            return examPractice.map(exam => {
                const stored = taxonomyStoredReview(exam);
                if (!stored) return null;
                return {
                    year: exam.year,
                    question: exam.q,
                    topic: exam.topic,
                    status: stored.status,
                    currentNodes: [...exam.nodes],
                    proposedNodes: [...stored.proposedNodes],
                    note: stored.note || '',
                    updatedAt: stored.updatedAt
                };
            }).filter(Boolean);
        }

        function taxonomyCodexText() {
            const corrections = taxonomyExportRecords().filter(record => record.status === 'correction');
            if (!corrections.length) return '歷屆題分類校對結果：目前沒有標記「需要修正」的題目。';
            const lines = [
                '請依照以下人工校對結果修正 data/examPractice.js 的 nodes 分類。',
                '規則：proposedNodes 內全部都是相關考點，不分主次。',
                ''
            ];
            corrections.forEach((record, index) => {
                lines.push(`${index + 1}. ${record.year} 學測第 ${record.question} 題｜${record.topic}`);
                lines.push(`   - 目前：${record.currentNodes.join(', ')}`);
                lines.push(`   - 建議：${record.proposedNodes.join(', ')}`);
                if (record.note) lines.push(`   - 備註：${record.note}`);
            });
            return lines.join('\n');
        }

        async function copyTaxonomyCorrections() {
            const text = taxonomyCodexText();
            try {
                await navigator.clipboard.writeText(text);
            } catch (error) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
            }
            showTaxonomyToast('已複製修正清單，直接貼到 Codex 對話即可。');
        }

        function downloadTaxonomyReview() {
            const payload = {
                schema: 'phy-senior-taxonomy-review-v1',
                exportedAt: new Date().toISOString(),
                summary: taxonomySummaryCounts(),
                records: taxonomyExportRecords()
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
            const link = document.createElement('a');
            const downloadUrl = URL.createObjectURL(blob);
            link.href = downloadUrl;
            link.download = `phy-senior-taxonomy-review-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            showTaxonomyToast('已下載校對檔，可直接上傳給 Codex。');
        }

        function showTaxonomyToast(message) {
            document.querySelector('.taxonomy-toast')?.remove();
            const toast = document.createElement('div');
            toast.className = 'taxonomy-toast';
            toast.setAttribute('role', 'status');
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2600);
        }

        // 單一歷屆題（組）的手風琴列——歷屆試題頁與錯題本共用
        function examItemHtml(e) {
            const info = examPapers[e.year];
            const paper = encodeURI(info.paper);
            const answer = encodeURI(info.answer);
            const chips = e.nodes.map(id =>
                `<span class="bank-chip">${nodeLabel(id)}</span>`
            ).join('');
            const conceptLabel = `相關考點（${e.nodes.length}）`;
            const imgs = cropsFor(e).map(f =>
                `<img class="exam-crop ${invertCrops ? 'inverted' : ''}" loading="lazy" decoding="async" src="assets/exam_crops/${f}" alt="${info.label}第 ${e.q} 題" onload="resizeExamBody(this)">`
            ).join('') + '<span class="crop-zoom-hint">🔍 點圖可放大看清楚（手機必用）</span>';
            return `
                <div class="exam-item">
                    <button class="exam-head" onclick="toggleExamItem(this)">
                        <span class="exam-qno">第 ${e.q} 題</span>
                        <span class="exam-headmain">
                            <span class="exam-topic">${e.topic}</span>
                            <span class="bank-chips" style="margin-top:0.3rem;"><span style="font-size:0.72rem; color:var(--text-muted);">${conceptLabel}：</span>${chips}</span>
                        </span>
                        <span class="exam-chev">▶</span>
                    </button>
                    <div class="exam-body">
                        <div class="exam-body-inner">
                            ${imgs}
                            ${examSolBlock(e)}
                            <div style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; margin-top:0.5rem;">
                                <a class="exam-pdflink" href="${paper}#page=${e.page}" target="_blank" rel="noopener">📄 在完整試卷第 ${e.page} 頁開啟</a>
                                <a class="exam-pdflink" href="${answer}" target="_blank" rel="noopener" style="background:var(--accent-green-light); border-color:rgba(16,185,129,0.2); color:#047857;">✅ 查看本卷參考答案</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderExamsView() {
            currentView = 'exams';
            const main = document.getElementById('main-content');
            // 篩選年份或節點會整批重建題目 DOM；先釋放舊畫布與 resize 監聽器。
            disposeAllCanvasStates();
            registerViewDisposer(disposeAllCanvasStates);
            const list = examPractice.filter(e =>
                (show99 || examPapers[e.year].cur !== '99') &&
                (examYearFilter === 'all' || e.year === examYearFilter) &&
                (examNodeFilter === 'all' || e.nodes.includes(examNodeFilter))
            );

            const visiblePapers = examPaperOrder.filter(pk => show99 || examPapers[pk].cur !== '99');
            const yearChips = ['all', ...visiblePapers].map(pk =>
                `<button class="bank-chip-btn ${examYearFilter === pk ? 'active' : ''}" onclick="setExamYear('${pk}')">${pk === 'all' ? '全部' : examPapers[pk].label}</button>`
            ).join('');

            let groupsHtml = '';
            examPaperOrder.forEach(pk => {
                const items = list.filter(e => e.year === pk);
                if (items.length === 0) return;
                const info = examPapers[pk];
                const paper = encodeURI(info.paper);
                const answer = encodeURI(info.answer);
                const curTag = info.cur === '99'
                    ? '<span class="cur-tag cur-tag-99">99 課綱</span>'
                    : '<span class="cur-tag cur-tag-108">108 課綱</span>';
                const shouldMaterialize = examYearFilter !== 'all' || examNodeFilter !== 'all' || loadedExamYears.has(pk);
                let rows = '';
                if (shouldMaterialize) {
                    items.forEach(e => { rows += examItemHtml(e); });
                } else {
                    rows = `
                        <div class="exam-year-placeholder">
                            <span>這個年度的 ${items.length} 題尚未建立完整題目 DOM，可先保持頁面輕量。</span>
                            <button class="exam-year-load" type="button" onclick="loadExamYear('${pk}')">載入 ${info.label}題目</button>
                        </div>`;
                }
                groupsHtml += `
                    <div class="edu-card" data-exam-year="${pk}">
                        <div class="exam-year-head">
                            <div class="edu-card-title" style="margin-bottom:0; border:none; padding:0;">🗓️ ${info.label}自然（物理）${curTag}<span style="font-weight:500; font-size:0.85rem; color:var(--text-muted);">　${items.length} 題（組）</span></div>
                            <div class="exam-year-links">
                                <a class="exam-toplink" href="${paper}" target="_blank" rel="noopener">📄 整份試卷</a>
                                <a class="exam-toplink" href="${answer}" target="_blank" rel="noopener">✅ 參考答案</a>
                            </div>
                        </div>
                        ${rows}
                    </div>
                `;
            });

            const nodeCounts = examNodeFilter === 'all' ? null : nodeExamCounts(examNodeFilter);
            const nodeBanner = examNodeFilter === 'all' ? '' : `
                <div class="exam-node-banner">
                    <div>
                        <div>🔎 目前篩選：<strong>${nodeLabel(examNodeFilter)}</strong>　<span style="color:var(--text-muted); font-weight:500;">（畫面 ${list.length} 組）</span></div>
                        <div style="font-size:0.76rem; color:var(--text-muted); margin-top:0.25rem;">近五年正式學測含相關：${nodeCounts.c108} 組${nodeCounts.reference108 ? `；111 參考卷另有 ${nodeCounts.reference108} 組` : ''}</div>
                    </div>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                        <button class="exam-node-clear" onclick="clearExamNode()">✕ 顯示全部題目</button>
                    </div>
                </div>
            `;

            const emptyMsg = list.length === 0
                ? `<div class="edu-card" style="text-align:center; color:var(--text-muted);">此條件下沒有可展示的歷屆裁切題目。若已勾選僅 108 課綱，可試著開啟「納入 99 課綱」；或至「知識節點分級題庫」練習觀念題。</div>`
                : groupsHtml;

            const totalShown = examPractice.filter(e => show99 || examPapers[e.year].cur !== '99').length;

            main.innerHTML = `
                <div class="content-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="content-badge">歷屆試題練習</span>
                        <h2 class="content-title">學測物理歷屆試題（點題展開）</h2>
                        <p class="content-subtitle">108 課綱（111 參考卷＋111–115 學測）共 ${examPractice.filter(e => examPapers[e.year].cur === '108').length} 題（組）；另可勾選納入 99 課綱（106–110 學測）${examPractice.filter(e => examPapers[e.year].cur === '99').length} 題（組）。點任一題即原地展開裁切題目（含圖表）。</p>
                    </div>
                </div>

                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>歸類與使用說明：</strong>每題只列出完成公式、判斷或排除選項所需的相關考點，所有節點一律計入且不區分主次；只在題幹出現名詞而未參與作答者不列入。111 參考卷另列，不混入 111–115 正式學測的五年統計。
                    </div>
                </div>

                ${nodeBanner}

                <div class="bank-filter-bar">
                    <div class="bank-filter-row" style="gap: 1.5rem;">
                        <label class="cur-toggle">
                            <input type="checkbox" ${show99 ? 'checked' : ''} onchange="setShow99(this.checked)">
                            <span>納入 99 課綱（106–110 學測，舊制延伸練習）</span>
                        </label>
                        <label class="cur-toggle">
                            <input type="checkbox" ${invertCrops ? 'checked' : ''} onchange="toggleInvertCrops(this.checked)">
                            <span>題目圖表黑白反色（降低夜間刺眼感）</span>
                        </label>
                    </div>
                    <div class="bank-filter-row">
                        <span class="bank-filter-label">試卷</span>
                        ${yearChips}
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">目前顯示範圍共 <strong style="color: var(--primary-blue);">${totalShown}</strong> 題（組），符合篩選 <strong style="color: var(--primary-blue);">${list.length}</strong> 題。</div>
                </div>

                ${emptyMsg}
            `;

            scheduleMathJax([main]);
        }

