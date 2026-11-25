// 108 課綱知識節點架構（統計與題庫的單一資料來源）
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 108 課綱知識節點架構（統計與題庫的單一資料來源）=====
        // exam5y 為舊版人工子題權重，保留供資料追溯；介面統計一律由 examPractice 動態計算。
        const knowledgeNodes = [
            { id: "N01", module: 1, code: "Ea", name: "SI 單位制與因次分析", exam5y: 3, detail: "基本量與導出量辨識（111 Q58 電磁天平題組）、能量單位因次判斷（114 Q47 細胞膜題組）、電場 SI 單位（115 Q15）" },
            { id: "N02", module: 1, code: "Ea", name: "自然界的尺度與數量級", exam5y: 2, detail: "原子 $10^{-10}$ m 與原子核 $10^{-15}$ m 數量級、奈米/飛米換算、微觀到宇宙的尺度排序" },
            { id: "N06", module: 1, code: "Ja/Ke", name: "物質的組成與基本粒子", exam5y: 2, detail: "原子、原子核與核子的層次；質子與中子由夸克組成，電子屬輕子；以尺度與交互作用理解物質結構" },
            { id: "N03", module: 2, code: "Eb", name: "直線運動與運動圖形", exam5y: 9, detail: "$v-t$ 圖斜率與面積判讀、等速度/等加速度運動（111颱風、115汽車）、波速與光速等速傳遞計算（113/115地震波、114太空船、115光速）" },
            { id: "N04", module: 2, code: "Eb", name: "牛頓三大運動定律", exam5y: 3, detail: "慣性、$F=ma$ 受力分析（115 起重機）、作用力與反作用力成對性、緩衝與安全氣囊（延長時間降低加速度）" },
            { id: "N05", module: 2, code: "Eb", name: "摩擦力、彈力與力的平衡", exam5y: 1, detail: "靜摩擦與動摩擦轉換、虎克定律 $F=kx$、共點力平衡" },
            { id: "N07", module: 3, code: "Kb", name: "克卜勒行星運動定律", exam5y: 1, detail: "橢圓軌道、等面積律（近日點快）、$T^2 \\propto r^3$ 週期比值" },
            { id: "N08", module: 3, code: "Kb", name: "萬有引力與重力場", exam5y: 1, detail: "$g = GM/R^2$ 星球表面重力比較（111 火星）、衛星軌道速率、太空站微重力" },
            { id: "N09", module: 4, code: "Ba", name: "功、動能與位能（機械能守恆）", exam5y: 3, detail: "功的定義 $W=F\\cdot\\Delta x$、動能位能互換、非保守力作功與力學能損耗" },
            { id: "N10", module: 4, code: "Bb", name: "溫度、熱量與熱平衡", exam5y: 3, detail: "比熱 $Q=ms\\Delta T$、熱平衡溫度計算、熱容量概念" },
            { id: "N11", module: 4, code: "Bb", name: "氣體分子平均動能與絕對溫度", exam5y: 4, detail: "$\\bar{E}_k \\propto T$（克氏溫標）、114 Q48 細胞膜電壓溫標轉換、絕熱壓縮升溫" },
            { id: "N12", module: 4, code: "Nc", name: "熱功轉換方向、能量退化與效率", exam5y: 5, detail: "熱功轉換方向性、廢熱與能量退化、113 Q24-25 電冰箱性能係數、111 Q7-8 地球能量收支、112 Q34 能源效率敘述" },
            { id: "N13", module: 4, code: "Ba/Nc", name: "質能互換與核能發電", exam5y: 4, detail: "質量虧損與 $E=\\Delta mc^2$（112 Q34、113 Q19、115 Q18）、核分裂／核融合、核能發電的能量轉換" },
            { id: "N14", module: 5, code: "Ka", name: "波的性質與波速", exam5y: 5, detail: "$v=f\\lambda$、波傳能量不傳介質、結合等速運動計算（113/115地震波、114太空船、115光速時間與距離）" },
            { id: "N15", module: 5, code: "Ka", name: "聲波與都卜勒效應", exam5y: 3, detail: "接近頻率升高/遠離降低（定性）、112 Q32 血流都卜勒測速、星系紅移" },
            { id: "N16", module: 5, code: "Ka", name: "光的反射與折射", exam5y: 3, detail: "司乃耳定律與折射作圖（115 Q49）、慢介質到快介質偏離法線、頻率不變波長改變、全反射與光纖" },
            { id: "N17", module: 5, code: "Ka", name: "干涉、繞射與光的波動性", exam5y: 2, detail: "楊氏雙狹縫亮暗紋條件、波程差整數波長、繞射與孔徑關係" },
            { id: "N18", module: 5, code: "Ka", name: "電磁波與電磁波譜", exam5y: 2, detail: "頻率排序（無線電波→γ射線）、大氣窗吸收、真空中皆以 $c$ 前進" },
            { id: "N19", module: 6, code: "Kc", name: "靜電與庫侖定律", exam5y: 2, detail: "$F = kq_1q_2/r^2$ 平方反比、同性斥異性吸、感應起電" },
            { id: "N20", module: 6, code: "Kc", name: "電流磁效應", exam5y: 1, detail: "厄斯特發現、載流導線周圍磁場、安培右手定則、電磁鐵" },
            { id: "N21", module: 6, code: "Kc", name: "電磁感應與冷次定律", exam5y: 4, detail: "穿過線圈的磁場變化生應電流、113 Q44-46 磁鐵等速穿過線圈、111 Q6 晶片卡感應、111 Q58-60 電磁天平" },
            { id: "N22", module: 6, code: "Mc", name: "家庭用電與用電安全", exam5y: 2, detail: "並聯電路總電流累加、無熔絲開關過載跳脫、單相三線式 110V/220V" },
            { id: "N23", module: 7, code: "Kd", name: "光電效應與光子模型", exam5y: 3, detail: "$hf = W + E_{k,max}$、底限頻率、光強度只影響光電子數量" },
            { id: "N24", module: 7, code: "Kd", name: "原子模型與能階躍遷", exam5y: 4, detail: "波耳能階、$\\Delta E = hc/\\lambda$ 躍遷配對（115 汞 365 nm）、原子光譜不連續" },
            { id: "N25", module: 7, code: "Kd", name: "物質波與波粒二象性", exam5y: 3, detail: "$\\lambda = h/p$、電子雙狹縫干涉（112 Q31）、加速電壓與條紋間距" },
            { id: "N26", module: 7, code: "Kd/Nc", name: "放射性衰變與核反應", exam5y: 2, detail: "α/β/γ 射線性質、半衰期減半律、核反應質量數與原子序守恆" },
            { id: "N27", module: 7, code: "Ke", name: "四大基本交互作用", exam5y: 4, detail: "強力/電磁力/弱力/重力的強度排序與作用範圍（115 Q14 氦核內四力比較）、媒介粒子、β 衰變屬弱力" },
            { id: "N28", module: 7, code: "Kd", name: "普朗克量子論與黑體輻射", exam5y: 2, detail: "黑體輻射光譜、紫外災難、$E_n=nhf$、維恩位移與史蒂芬—波茲曼定律（111 Q7-8）" }
        ];
        // 畫面上以課本章節取代課綱代碼（N01、Ea…一般人看不懂）；內部鍵值仍用 N01
        if (window.GP_NODE_SEC) knowledgeNodes.forEach(n => { n.code = '課本 ' + GP_NODE_SEC.tag('gsat', n.id) + ' ' + GP_NODE_SEC.title('gsat', n.id); });

        // Render Physics Modules (Tabs S O I L)

        // Render Physics Modules in Scheme A
        function renderModuleView(moduleNum) {
            const data = modulesData[moduleNum];
            const main = document.getElementById('main-content');

            // 1. Build Formulas HTML
            let formulasHtml = '<div class="formulas-grid">';
            data.formulas.forEach(f => {
                // If the formula contains no TeX macros or exponents/subscripts, render as plain styled text
                const isMath = f.formula.includes('\\') || f.formula.includes('^') || f.formula.includes('_') || f.formula.includes('{') || f.formula.includes('}') || f.formula.includes('\\pm');
                const displayHtml = isMath
                    ? `$$ ${f.formula} $$`
                        : `<div style="font-family:inherit; font-size:1.05rem; font-weight:600; text-align:center; color:var(--text-main); line-height:1.6; white-space:normal; word-break:normal; overflow-wrap:anywhere;">${f.formula}</div>`;
                formulasHtml += `
                    <div class="formula-card">
                        <div class="formula-card-title">📌 ${f.name}${f.ext ? '<span class="ext-badge">選修延伸</span>' : ''}</div>
                        ${f.anchor ? `<div style="font-size:0.88rem; color:var(--accent-cyan); font-weight:700; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.25rem;">🧠 大腦錨點：${f.anchor}</div>` : ''}
                        <div class="formula-display">${displayHtml}</div>
                        <div class="formula-desc">${f.desc}</div>
                        ${f.ext ? `<div class="ext-note">★ ${f.ext}</div>` : ''}
                    </div>
                `;
            });
            formulasHtml += '</div>';

            // 2. Build Key Features HTML
            let featuresHtml = '<div class="features-grid">';
            data.keyFeatures.forEach(kf => {
                featuresHtml += `
                    <div class="feature-guide-box">
                        <div class="feature-trigger">
                            <span class="feature-trigger-tag">關鍵特徵</span>
                            <div class="feature-trigger-title">${kf.feature}</div>
                        </div>
                        <div class="feature-bridge">
                            <div class="feature-bridge-title">➔ 物理思維與模型解構</div>
                            <div class="feature-bridge-desc">${kf.bridge}</div>
                        </div>
                        <div class="feature-trap">
                            <div class="feature-trap-title">⚡ 易錯盲點避坑指南</div>
                            <div class="feature-trap-desc">${kf.trap}</div>
                        </div>
                    </div>
                `;
            });
            featuresHtml += '</div>';

            // 3. Build Exam Questions HTML
            let examHtml = '';
            data.examQuestions.forEach((q, idx) => {
                examHtml += `
                    <div class="q-card" onclick="toggleQCard(this)">
                        <div class="q-card-header">
                            <span class="q-card-title">🔥 真題實戰：${q.year} - ${q.title}</span>
                            <span style="color: var(--primary-blue); font-weight:700;">展開詳解 ➔</span>
                        </div>
                        <div class="q-card-body">
                            <p>${q.desc}</p>
                        </div>
                    </div>
                `;
            });

            // 4. Build Knowledge-Node Question Bank HTML (grouped by node, sorted 記憶→理解→應用→分析)
            let quizHtml = '';
            const moduleNodes = knowledgeNodes.filter(n => n.module === moduleNum);
            if (moduleNodes.length > 0) {
                quizHtml += `
                    <div class="handout-section-title" style="margin-top: 2rem;">✏️ 知識節點分級題組（記憶 → 理解 → 應用 → 分析）</div>
                    <div class="info-alert" style="background-color: var(--primary-blue-light); border-color: rgba(29, 78, 216, 0.1); color: var(--primary-blue);">
                        <span class="info-alert-icon">💡</span>
                        <div>
                            <strong>作答提示：</strong>每個知識節點依 Bloom 認知層次設計四題，並標注 108 課綱學習表現（科學認知／探究能力）。多選題應選出<strong>所有</strong>正確選項；簡答題請先手寫作答再對照參考答案。
                        </div>
                    </div>
                `;
                const lvOrder = { '記憶': 1, '理解': 2, '應用': 3, '分析': 4 };
                moduleNodes.forEach(node => {
                    const qs = questionBank.filter(q => q.node === node.id).sort((a, b) => lvOrder[a.level] - lvOrder[b.level]);
                    if (qs.length === 0) return;
                    quizHtml += `
                        <div class="bank-node-header">
                            <span class="code-badge">${node.code}</span>
                            <strong>${node.name}</strong>
                            <span class="bank-node-count">近五年相關 ${nodeExamCounts(node.id).c108} 組</span>
                        </div>
                    `;
                    qs.forEach(q => {
                        quizHtml += bankCardHtml(q, 'bk' + questionBank.indexOf(q));
                    });
                });
            }

            main.innerHTML = `
                <div class="content-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="content-badge">${data.badge}</span>
                        <h2 class="content-title">${data.title}</h2>
                        <p class="content-subtitle">${data.subtitle}</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()">
                        <span>🖨️</span> 列印講義
                    </button>
                </div>

                <div class="handout-section-title" style="margin-top: 0;">📖 重點整理與核心公式</div>
                ${formulasHtml}

                <div class="handout-section-title">🗺️ 觀念地圖與脈絡</div>
                ${data.conceptMap}

                <div class="handout-section-title">⚡ 關鍵特徵與思維引導</div>
                <div class="info-alert" style="background-color: var(--primary-blue-light); border-color: rgba(29, 78, 216, 0.1); color: var(--primary-blue);">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>特徵解密：</strong>此區塊為講義靈魂。解題的關鍵不在於死背公式，而在於<strong>「看見題目特徵，立即聯想物理本質，並避開常見陷阱」</strong>。
                    </div>
                </div>
                ${featuresHtml}

                <div class="handout-section-title">💡 生活延伸與跨科整合</div>
                ${data.extensions}

                ${moduleNum === 1 ? siSectionHtml() : ''}
                ${moduleNum === 2 ? kinematicsGraphsHtml() + airResistanceSectionHtml() : ''}
                ${moduleNum === 5 ? waveSimHtml() + emSpectrumSectionHtml() : ''}
                ${moduleNum === 6 ? generatorSimHtml() : ''}
                ${moduleNum === 7 ? photoelectricSectionHtml() + peSimHtml() : ''}

                <div class="handout-section-title">🎯 歷屆真題實戰</div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
                    ${examHtml}
                </div>

                ${quizHtml}
            `;

            // Trigger MathJax typeset
            scheduleMathJax([main]);

            // 啟動互動模擬（canvas 動畫需在 DOM 就緒後初始化）
            if (moduleNum === 5) initWaveSim();
            if (moduleNum === 6) initGeneratorSim();
            if (moduleNum === 7) initPESim();
        }

        // 模組頁只負責導覽與建立脈絡；完整公式、模擬與題目移至各自的節點／工具頁。
        function renderModuleOverviewView(moduleNum) {
            const data = modulesData[moduleNum];
            const main = document.getElementById('main-content');
            if (!data) {
                navigateTo('home', { replace: true });
                return;
            }
            const moduleNodes = knowledgeNodes.filter(n => n.module === moduleNum);
            const nodeCards = moduleNodes.map(node => {
                const qCount = questionBank.filter(q => q.node === node.id).length;
                const counts = nodeExamCounts(node.id);
                return `
                    <button class="module-node-card" type="button" onclick="navigateTo('node-${node.id}')">
                        <small>${node.id} · ${node.code}</small>
                        <strong>${node.name}</strong>
                        <span>題庫 ${qCount} 題 · 近五年含相關 ${counts.c108} 組</span>
                    </button>
                `;
            }).join('');

            main.innerHTML = `
                <div class="content-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                    <div>
                        <span class="content-badge">${data.badge}</span>
                        <h2 class="content-title">${data.title}</h2>
                        <p class="content-subtitle">${data.subtitle}</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()"><span>🖨️</span> 列印總覽</button>
                </div>

                <div class="info-alert">
                    <span class="info-alert-icon">🧭</span>
                    <div><strong>這裡是模組總覽。</strong>先從下方選一個節點閱讀講義；題庫、歷屆題與互動實驗不再重複塞在同一張長頁中。</div>
                </div>

                <div class="handout-section-title">本模組的 ${moduleNodes.length} 個知識節點</div>
                <div class="module-node-grid">${nodeCards}</div>

                <div class="handout-section-title">🗺️ 觀念地圖與脈絡</div>
                ${data.conceptMap}

                <div class="handout-section-title">💡 生活延伸與跨科整合</div>
                ${data.extensions}

                <div class="node-route-actions" style="margin-top:2rem;">
                    <button class="node-route-action" style="--action-accent:#2368d5;" type="button" onclick="navigateTo('tool-quiz')">
                        <strong>練習本模組題庫</strong>
                        <span>進入題庫後可用模組與節點篩選</span>
                    </button>
                    <button class="node-route-action" style="--action-accent:#0b9298;" type="button" onclick="navigateTo('tool-exams')">
                        <strong>查看歷屆試題</strong>
                        <span>依所有相關知識節點篩選</span>
                    </button>
                    <button class="node-route-action" style="--action-accent:#ba7216;" type="button" onclick="navigateTo('tool-lab')">
                        <strong>開啟互動實驗室</strong>
                        <span>在獨立工作區操作模擬</span>
                    </button>
                </div>
            `;
            scheduleMathJax([main]);
        }

        // SI 單位與因次分析專題（已併入模組一：尺度、單位與測量）
        function siSectionHtml() {
            return `
                <div class="handout-section-title">📏 SI 國際單位制與因次分析專題</div>
                <p class="content-subtitle" style="margin: -0.5rem 0 1rem 0;">此專題屬「尺度、單位與測量（Ea）」核心，配合學測命題方向（111 Q58、114 Q47、115 Q15）梳理單位制要點。</p>

                <div class="handout-section-title" style="margin-top: 0;">📏 7 個 SI 基本量（核心資訊）</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>記憶防線：</strong>學測最愛考的是庫侖（C）不是基本單位！電荷庫侖是由電流安培（A）與時間秒（s）相乘導出的：$\\text{C} = \\text{A} \\cdot \\text{s}$。
                    </div>
                </div>

                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 20%">基本物理量</th>
                                <th style="width: 15%">SI 符號</th>
                                <th style="width: 20%">基本單位名稱</th>
                                <th>大考命題特徵與細節</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>長度 (Length)</strong></td>
                                <td><span class="code-badge">m</span></td>
                                <td>公尺 (meter)</td>
                                <td>微觀數量級考點：原子尺度約為 $10^{-10}\\text{ m}$ ($0.1\\text{ nm}$)，原子核尺度約為 $10^{-15}\\text{ m}$ ($1\\text{ fm}$)。</td>
                            </tr>
                            <tr>
                                <td><strong>質量 (Mass)</strong></td>
                                <td><span class="code-badge">kg</span></td>
                                <td>公斤 (kilogram)</td>
                                <td>目前已改用量子力學中的<strong>普朗克常數 ($h$)</strong> 重新定義，Kibble天平（111 Q58）即為此定義的實體化儀器。</td>
                            </tr>
                            <tr>
                                <td><strong>時間 (Time)</strong></td>
                                <td><span class="code-badge">s</span></td>
                                <td>秒 (second)</td>
                                <td>大考常以銫-133原子能階躍遷週期來進行科學史選擇題包裝。</td>
                            </tr>
                            <tr>
                                <td><strong>電流 (Electric Current)</strong></td>
                                <td><span class="code-badge">A</span></td>
                                <td>安培 (ampere)</td>
                                <td><strong>最易混淆點：</strong>電荷庫侖 (C) <strong>不是</strong>基本單位！$\\text{C} = \\text{A} \\cdot \\text{s}$。大考常設陷阱，將「庫侖」放入基本單位選項。</td>
                            </tr>
                            <tr>
                                <td><strong>熱力學溫度 (Temperature)</strong></td>
                                <td><span class="code-badge">K</span></td>
                                <td>克耳文 (kelvin)</td>
                                <td><strong>極重要防線：</strong>任何氣體分子平均動能、電位公式中的 $T$，都必須換算為絕對溫標 (K) 才能進行比例計算。</td>
                            </tr>
                            <tr>
                                <td><strong>物質的量 (Amount of Substance)</strong></td>
                                <td><span class="code-badge">mol</span></td>
                                <td>莫耳 (mole)</td>
                                <td>連結微觀個數與宏觀質量的橋樑，結合亞佛加厥常數進行跨科計算。</td>
                            </tr>
                            <tr>
                                <td><strong>光強度 (Luminous Intensity)</strong></td>
                                <td><span class="code-badge">cd</span></td>
                                <td>燭光 (candela)</td>
                                <td>在物理學測中甚少直接考計算，但需知道其屬於 7 大基本單位之一。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="handout-section-title">🔗 常見導出單位的因次鏈（輔助資訊）</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 20%">物理量</th>
                                <th style="width: 25%">公式基礎</th>
                                <th style="width: 25%">導出單位</th>
                                <th>分解為 SI 基本單位組合</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>速度 (v)</strong></td>
                                <td>$v = \\Delta S / \\Delta t$</td>
                                <td>$\\text{m/s}$</td>
                                <td><span class="code-badge">m · s⁻¹</span></td>
                            </tr>
                            <tr>
                                <td><strong>加速度 (a)</strong></td>
                                <td>$a = \\Delta v / \\Delta t$</td>
                                <td>$\\text{m/s²}$</td>
                                <td><span class="code-badge">m · s⁻²</span></td>
                            </tr>
                            <tr>
                                <td><strong>力 (F)</strong></td>
                                <td>$F = ma$</td>
                                <td>牛頓 ($\\text{N}$)</td>
                                <td><span class="code-badge">kg · m · s⁻²</span></td>
                            </tr>
                            <tr>
                                <td><strong>功 / 能量 (W / E)</strong></td>
                                <td>$W = F \\cdot d$</td>
                                <td>焦耳 ($\\text{J}$)</td>
                                <td><span class="code-badge">kg · m² · s⁻²</span></td>
                            </tr>
                            <tr>
                                <td><strong>電量 (q)</strong></td>
                                <td>$q = I \\cdot t$</td>
                                <td>庫侖 ($\\text{C}$)</td>
                                <td><span class="code-badge">A · s</span></td>
                            </tr>
                            <tr>
                                <td><strong>普朗克常數 (h)</strong></td>
                                <td>$E = hf$</td>
                                <td>焦耳 · 秒 ($\\text{J}\\cdot\\text{s}$)</td>
                                <td>$\\text{J} \\cdot \\text{s} = (\\text{kg}\\cdot\\text{m}^2\\cdot\\text{s}^{-2}) \\cdot \\text{s} = $ <span class="code-badge">kg · m² · s⁻¹</span></td>
                            </tr>
                            <tr>
                                <td><strong>萬有引力常數 (G)</strong></td>
                                <td>$F = G\\frac{Mm}{r^2}$</td>
                                <td>牛頓 · 平方公尺 / 平方公斤 ($\\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)</td>
                                <td>$(\\text{kg}\\cdot\\text{m}\\cdot\\text{s}^{-2}) \\cdot \\text{m}^2 \\cdot \\text{kg}^{-2} = $ <span class="code-badge">m³ · kg⁻¹ · s⁻²</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="handout-section-title">⚡ 大考因次推導實戰（細節資訊）</div>
                <div class="edu-card">
                    <div style="font-weight: 700; color: var(--accent-rose); margin-bottom: 0.5rem;">🔥 大考真題 1：111 學測自然科第 58 題（電磁天平題組）</div>
                    <p style="font-size: 0.92rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-main);">
                        實際考題：題組以「普朗克常數 $h$ 訂為新的質量基準」為背景，Q58 問「文中提到的物理量（電壓、電阻、電磁波能量、普朗克常數、電流……），哪個為基本量？」——考的是基本量與導出量的辨識。以下延伸練習 $h$ 的因次分解，為同一題組的核心素養：
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; font-size: 0.88rem; line-height: 1.5;">
                        <strong>解題思維步驟（特徵引導）：</strong><br>
                        1. <strong>選取公式</strong>：選擇包含普朗克常數 $h$ 且我們學過的必修物理公式，最直觀的即為光量子能量假說：$E = hf$。<br>
                        2. <strong>分解因次步驟</strong>：<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 移項整理得到 $h = E / f$。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 能量 $E$（焦耳，J）的基本單位組合為 $\\text{kg} \\cdot \\text{m}^2 \\cdot \\text{s}^{-2}$ (由功 $W=F \\cdot d$ 導出)。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 頻率 $f$（赫茲，Hz）的單位為秒分之一 $\\text{s}^{-1}$ (由 $f=1/T$ 導出)。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 普朗克常數 $h = E / f \\implies \\text{J}\\cdot\\text{s} = (\\text{kg} \\cdot \\text{m}^2 \\cdot \\text{s}^{-2}) \\cdot \\text{s} = \\text{kg} \\cdot \\text{m}^2 \\cdot \\text{s}^{-1}$。<br><br>
                        3. <strong>結論</strong>：普朗克常數的 SI 基本單位表示法即為 <strong>$\\text{kg} \\cdot \\text{m}^2 \\cdot \\text{s}^{-1}$</strong>。
                    </div>
                </div>

                <div class="edu-card">
                    <div style="font-weight: 700; color: var(--accent-rose); margin-bottom: 0.5rem;">🔥 大考真題 2：114 學測自然科第 47 題（細胞膜平衡電壓題組）</div>
                    <p style="font-size: 0.92rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-main);">
                        實際考題：題組給出神經細胞膜的平衡電壓公式 $E = -\\frac{\\kappa T}{e}\\log\\left(\\frac{n_{內}}{n_{外}}\\right)$（$T$ 為絕對溫度、$e$ 為基本電量、$\\kappa$ 為轉換常數），問「下列選項的單位，哪些與能量相同？（應選 2 項）」
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; font-size: 0.88rem; line-height: 1.5;">
                        <strong>解題思維步驟（特徵引導）：</strong><br>
                        1. <strong>先定位每個符號的物理量</strong>：$E$ 是「電壓」（伏特）、$e$ 是「電荷」（庫侖）、$T$ 是溫度（K）。<br>
                        2. <strong>用因次組合檢驗</strong>：<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• $eE$ = 電荷 × 電壓 = $\\text{C} \\cdot \\text{V} = \\text{J}$ ➔ <strong>是能量</strong>（同 $U = qV$ 電位能）。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 公式中 $\\frac{\\kappa T}{e}$ 必須與等號左側的 $E$ 同單位（電壓），故 $\\kappa T$ = 電壓 × 電荷 = $\\text{J}$ ➔ <strong>是能量</strong>。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 其餘組合（如 $\\kappa/e$、$\\kappa T/e$、$T$ 本身）分別為電壓/溫度等，皆非能量。<br><br>
                        3. <strong>結論</strong>：不需理解任何生物機制——「等號兩側單位必相同」的因次分析就是鑰匙。這正是素養題包裝下的單位制基本功。
                    </div>
                </div>

                <div class="handout-section-title">💡 單位制跨學科整合（補充資訊）</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">跨科主題</th>
                                <th style="width: 35%">學科結合點</th>
                                <th>底層物理模型與單位</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>111學測 Q58 Kibble 天平</strong></td>
                                <td>計量科學。現改用量子物理的普朗克常數 $h$ 定義公斤質量。</td>
                                <td>普朗克常數 $h$ 單位為 $\\text{J} \\cdot \\text{s}$，分解為基本單位即為 $\\text{kg} \\cdot \\text{m}^2 \\cdot \\text{s}^{-1}$。天平藉由電磁力與重力平衡測量此值。</td>
                            </tr>
                            <tr>
                                <td><strong>生物膜電位與跨膜傳輸</strong></td>
                                <td>生物化學。帶電離子通過細胞膜建立電位差，產生電場。</td>
                                <td>電場 $E = V / d$（單位 $\\text{V/m}$）代表膜電位差除以膜厚度。離子運動受靜電力做功 $W = qV$。</td>
                            </tr>
                            <tr>
                                <td><strong>亞佛加厥與氣體常數</strong></td>
                                <td>化學與氣體動力學。氣體方程式 $pV = nRT$ 的單位對齊。</td>
                                <td>壓強 $p$（$\\text{N/m}^2$）乘體積 $V$（$\\text{m}^3$）等於功 $\\text{J}$。等式右側為 $\\text{mol} \\cdot R \\cdot \\text{K}$，因此氣體常數 $R$ 因次為 $\\text{J} \\cdot \\text{mol}^{-1} \\cdot \\text{K}^{-1}$。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        // 自然界的尺度與數量級專題（併入模組一：N02）
        function scaleSectionHtml() {
            return `
                <div class="handout-section-title">💡 核心觀念解析</div>
                <div class="info-alert" style="margin-top:0;">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>數量級的對數原理：</strong>數量級是衡量物理規模的對數尺度，本質上是取對數（以 10 為底）進行四捨五入。在對數尺度下，因 $\\log_{10}(3.16) \\approx 0.5$ 恰在 0 與 1 之間，故進位中點為 $\\sqrt{10} \\approx 3.16$，而非算術平分的 5。
                        <br>• 若 $a \\ge 3.16$，數量級為 $10^{n+1}$。
                        <br>• 若 $a < 3.16$，數量級為 $10^n$。
                    </div>
                </div>

                <div class="handout-section-title">🔍 數值與尺度對照</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 30%">數值 / 科學記號</th>
                                <th style="width: 30%">與臨界值 3.16 比較</th>
                                <th>數量級判定結果</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>$4.2 \\times 10^5$</td>
                                <td>$4.2 \\ge 3.16$（進位）</td>
                                <td><span class="code-badge" style="color: var(--primary-blue); font-weight: bold;">10⁶</span></td>
                            </tr>
                            <tr>
                                <td>$2.8 \\times 10^5$</td>
                                <td>$2.8 < 3.16$（不進位）</td>
                                <td><span class="code-badge">10⁵</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="info-alert" style="margin-top:1rem;">
                    <span class="info-alert-icon">📏</span>
                    <div>
                        <strong>自然界典型尺度鏈對照：</strong>
                        <br>• <strong>原子核</strong>：$\\approx 10^{-15}\\text{ m}$（飛米，fm）
                        <br>• <strong>原子</strong>：$\\approx 10^{-10}\\text{ m}$（埃，Å）
                        <br>• <strong>流感病毒</strong>：$\\approx 10^{-7}\\text{ m}$（奈米級，約 100 nm）
                        <br>• <strong>人體細胞</strong>：$\\approx 10^{-5}\\text{ m}$（微米級，如紅血球約 8 μm）
                    </div>
                </div>

                <div class="handout-section-title">📝 生活應用與估算實戰</div>
                <div class="info-alert" style="margin-top:0;">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>經典生活尺度估算（費米估算）：</strong>
                        <br>• <strong>頭髮生長速度</strong>：每月長約 $1\\text{ cm} = 10^{-2}\\text{ m}$，一個月時間 $T \\approx 2.6 \\times 10^6\\text{ s}$。生長速度 $v = 10^{-2} / 2.6 \\times 10^6 \\approx 3.8 \\times 10^{-9}\\text{ m/s}$。因係數 $3.8 \\ge 3.16$，數量級進位為 <strong>$10^{-8}\\text{ m/s}$</strong>（相當於每秒生長數十個原子大小）。
                        <br>• <strong>人體細胞總數</strong>：體重 $60\\text{ kg}$ 的成人體積 $V \\approx 0.06\\text{ m}^3 = 6 \\times 10^{-2}\\text{ m}^3$；細胞平均直徑 $10\\ \\mu\\text{m} = 10^{-5}\\text{ m}$，體積 $v \\approx 10^{-15}\\text{ m}^3$。細胞總數 $N = V/v \\approx 6 \\times 10^{12}$ 個。因 $6 \\ge 3.16$，數量級進位為 <strong>$10^{13}$ 個</strong>。
                    </div>
                </div>
            `;
        }

                                        // 物質的組成與基本粒子專題（併入模組一：N06）
        function matterSectionHtml() {
            return `
                <div class="handout-section-title">💡 核心觀念解析</div>
                <div class="info-alert" style="margin-top:0;">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>物質結構的層次與基本粒子：</strong>
                        <br>根據高中物理課程標準，構成物質的最基本單元為<strong>基本粒子</strong>（目前在結構上視為不可再分割的最小單位）：
                        <br>• <strong>基本粒子</strong>：僅包含<strong>夸克</strong>（Quarks，如上夸克、下夸克）與<strong>電子</strong>（Electrons）。
                        <br>• <strong>複合粒子組成</strong>：
                        <br>&nbsp;&nbsp;- <strong>質子</strong>：由 2 個上夸克 ($+2/3e$) 與 1 個下夸克 ($-1/3e$) 組成，帶 $+1e$ 電量。
                        <br>&nbsp;&nbsp;- <strong>中子</strong>：由 1 個上夸克 ($+2/3e$) 與 2 個下夸克 ($-1/3e$) 組成，帶 $0$ 電量。
                        <br>&nbsp;&nbsp;- <strong>質子與中子</strong>合稱<strong>核子</strong>，共同組成原子核，與核外的電子結合成原子。
                    </div>
                </div>

                <div class="handout-section-title">🔍 數值與尺度對照</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 20%">粒子 / 結構</th>
                                <th style="width: 25%">尺度數量級</th>
                                <th style="width: 20%">電量 (e)</th>
                                <th style="width: 20%">結構組成</th>
                                <th>基本粒子？</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>原子</strong></td>
                                <td>$10^{-10}\\text{ m}$ (0.1 nm)</td>
                                <td>$0$</td>
                                <td>原子核 + 核外電子</td>
                                <td><span class="code-badge">否</span></td>
                            </tr>
                            <tr>
                                <td><strong>原子核</strong></td>
                                <td>$10^{-15}\\text{ m}$ (1 fm)</td>
                                <td>$+Z$</td>
                                <td>質子 + 中子</td>
                                <td><span class="code-badge">否</span></td>
                            </tr>
                            <tr>
                                <td><strong>質子</strong></td>
                                <td>$10^{-15}\\text{ m}$ (1 fm)</td>
                                <td>$+1$</td>
                                <td>$uud$ (2上1下)</td>
                                <td><span class="code-badge">否</span></td>
                            </tr>
                            <tr>
                                <td><strong>中子</strong></td>
                                <td>$10^{-15}\\text{ m}$ (1 fm)</td>
                                <td>$0$</td>
                                <td>$udd$ (1上2下)</td>
                                <td><span class="code-badge">否</span></td>
                            </tr>
                            <tr>
                                <td><strong>電子</strong></td>
                                <td>$< 10^{-18}\\text{ m}$</td>
                                <td>$-1$</td>
                                <td>無內部結構 (輕子)</td>
                                <td><span class="code-badge" style="color: var(--primary-blue); font-weight: bold;">是</span></td>
                            </tr>
                            <tr>
                                <td><strong>夸克</strong></td>
                                <td>$< 10^{-18}\\text{ m}$</td>
                                <td>上夸克 $+2/3$ / 下夸克 $-1/3$</td>
                                <td>無內部結構</td>
                                <td><span class="code-badge" style="color: var(--primary-blue); font-weight: bold;">是</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="info-alert" style="margin-top:0.8rem; border-left-color: var(--success-green, #10b981);">
                    <span class="info-alert-icon">🔍</span>
                    <div>
                        <strong>拉塞福金箔實驗的物理邏輯與衝突對照：</strong>
                        <br>• <strong>原本預測（基於葡萄乾布丁模型）</strong>：原子內部的正電荷與質量均勻稀疏分布在整個原子體積內，<strong>不存在局部的強電場</strong>。預測高速帶正電的 $\\alpha$ 粒子撞擊金箔時受力極微弱，<strong>應該幾乎 100% 直接穿過去（偏折角度小於數度）</strong>。
                        <br>• <strong>實際結果（偏折角極大，震驚物理界）</strong>：絕大多數粒子確實幾乎無偏折地穿過，但極少數（約 1/8000）發生了<strong>大角度偏折（偏折角 > 90°）</strong>，甚至有粒子<strong>近乎 180° 原路被反彈回來</strong>。
                        <br>• <strong>理論推論（行星軌道模型的誕生）</strong>：能將高速且重的 $\\alpha$ 粒子（帶雙正電荷的氦核）以 $180^\\circ$ 反彈，原子內部正電荷與絕大部分質量，決定性地集中在一個<strong>體積與原子相比極小、但密度極高的核心</strong>，即<strong>原子核</strong>。原子的其餘空間極為空曠，僅有電子在核外繞行（行星軌道模型）。
                    </div>
                </div>

                <div class="handout-section-title">📐 實驗方法圖解一（拉塞福金箔散射模擬）</div>
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <svg id="rutherford-svg" viewBox="0 0 520 280" style="background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; width: 100%; max-width: 520px; display: block; margin: 0 auto;"></svg>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.8rem; max-width: 520px; margin: 1rem auto 0 auto; padding: 1rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); text-align: left;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                            <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">撞擊參數 b (與金核垂直偏差)</span>
                            <span style="font-family: monospace; font-weight: bold; color: var(--primary-blue);" id="rutherford-b-val">b/bₘₐₓ = 0.33</span>
                        </div>
                        <input type="range" id="rutherford-b-slider" min="-90" max="90" value="30" step="5" style="width: 100%; cursor: pointer;">
                        
                        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 0.3rem;">
                            <button id="rutherford-btn-fire" style="padding: 0.4rem 1rem; background: var(--primary-blue); color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">發射單個 α 粒子</button>
                            <button id="rutherford-btn-beam" style="padding: 0.4rem 1rem; background: var(--success-green, #10b981); color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">發射 α 粒子束流</button>
                            <button id="rutherford-btn-clear" style="padding: 0.4rem 1rem; background: var(--border-color); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 4px; font-weight: 600; cursor: pointer;">清除軌跡</button>
                        </div>
                    </div>
                </div>

                <div class="handout-section-title">📐 實驗方法圖解二（陰極射線實驗與電子的普適性驗證）</div>
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <svg id="crt-svg" viewBox="0 0 520 200" style="background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; width: 100%; max-width: 520px; display: block; margin: 0 auto;"></svg>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.8rem; max-width: 520px; margin: 1rem auto 0 auto; padding: 1rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); text-align: left;">
                        <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">1. 更換陰極金屬與管內氣體：</span>
                            <select id="crt-material-select" style="padding: 0.3rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); font-weight: bold; cursor: pointer;">
                                <option value="Cu">銅 (Cu) 陰極 ＋ 空氣</option>
                                <option value="Au">金 (Au) 陰極 ＋ 氫氣 (H₂)</option>
                                <option value="Al">鋁 (Al) 陰極 ＋ 氦氣 (He)</option>
                            </select>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; margin-top: 0.3rem;">
                            <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">2. 施加橫向場進行實驗操作：</span>
                            <div style="display: flex; gap: 0.3rem;">
                                <button id="crt-btn-none" style="padding: 0.35rem 0.8rem; background: var(--primary-blue); color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">不加場 (直進)</button>
                                <button id="crt-btn-e" style="padding: 0.35rem 0.8rem; background: var(--border-color); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 4px; font-weight: 600; cursor: pointer;">加電場 (向上偏折)</button>
                                <button id="crt-btn-b" style="padding: 0.35rem 0.8rem; background: var(--border-color); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 4px; font-weight: 600; cursor: pointer;">加磁場 (向下偏折)</button>
                            </div>
                        </div>
                        
                        <!-- Educational Tip Card -->
                        <div id="crt-tip-card" class="info-alert" style="margin-top:0.5rem; border-left-color: var(--primary-blue); background: rgba(59, 130, 246, 0.05); margin-bottom: 0;">
                            <span class="info-alert-icon">💡</span>
                            <div>
                                💡 陰極射線直進打在螢幕中央。請點選上方按鈕施加場，或更換材料進行探究！
                            </div>
                        </div>
                    </div>
                </div>

                <div class="handout-section-title">📝 跨科整合延伸</div>
                <div class="info-alert" style="margin-top:0;">
                    <span class="info-alert-icon">⚡</span>
                    <div>
                        <strong>湯姆森陰極射線實驗與電子的普適性發現：</strong>
                        <br>• <strong>證明為帶電粒子（實驗操作）</strong>：湯姆森在陰極射線管中加上橫向電場或磁場，發現射線會向正極偏折，在磁場中亦會發生偏折，證實陰極射線是由<strong>帶負電的粒子（電子）</strong>所組成的流動。
                        <br>• <strong>證實電子存在於所有物質中（普適性）</strong>：
                        <br>&nbsp;&nbsp;- 湯姆森在實驗中嘗試了<strong>不同的陰極金屬材料</strong>（如鋁、銅、金等），並在管中填充了<strong>不同的殘留氣體</strong>（如空氣、氫氣、氦氣等）。
                        <br>&nbsp;&nbsp;- 實驗發現：無論如何更換材料或氣體，射線在電磁場中的偏折行為與軌跡<strong>完全一致，沒有任何改變</strong>。
                        <br>&nbsp;&nbsp;- <strong>結論</strong>：這證明了電子並非特定金屬 or 氣體所獨有，而是<strong>普遍存在於所有物質中的共同基本粒子</strong>。
                    </div>
                </div>
                <div class="info-alert" style="margin-top:0.8rem; border-left-color: var(--primary-blue);">
                    <span class="info-alert-icon">⏳</span>
                    <div>
                        <strong>基本粒子與原子結構發現史里程碑：</strong>
                        <br>• <strong>1897 年｜湯姆森陰極射線實驗（發現電子）</strong> ➔ 利用電磁偏折證實陰極射線為帶負電粒子，更換材料證實其為所有物質共有的基本粒子，提出葡萄乾布丁模型。
                        <br>• <strong>1911 年｜拉塞福 $\\alpha$ 粒子散射實驗（發現原子核）</strong> ➔ 發現大角度偏折與反彈，打破布丁模型，提出「行星軌道模型」。
                        <br>• <strong>1919 年｜拉塞福撞擊氮核實驗（發現質子）</strong> ➔ 以 $\\alpha$ 粒子轟擊氮核釋放出氫核（質子），證實質子為核內成分。
                        <br>• <strong>1932 年｜查兌克鈹射線實驗（發現中子）</strong> ➔ 以 $\\alpha$ 粒子撞擊鈹核釋放電中性射線，撞擊石蠟產生質子，由被撞出質子的速度，利用碰撞前後的守恆定律推算出中子質量。
                        <br>• <strong>1964 年｜蓋爾曼夸克模型（提出基本粒子）</strong> ➔ 提出強子是由帶分數電荷的夸克組成（質子 $uud$，中子 $udd$），後經高能散射實驗證實。
                    </div>
                </div>
            `;
        }

        let rutherfordActiveParticles = [];
        let rutherfordSimInterval = null;
        let rutherfordClock = null;

        function initRutherfordSim() {
            const svg = document.getElementById('rutherford-svg');
            const slider = document.getElementById('rutherford-b-slider');
            const bVal = document.getElementById('rutherford-b-val');
            const btnFire = document.getElementById('rutherford-btn-fire');
            const btnBeam = document.getElementById('rutherford-btn-beam');
            const btnClear = document.getElementById('rutherford-btn-clear');
            
            if (!svg || !slider || !bVal) return;

            rutherfordActiveParticles = [];
            registerViewDisposer(() => {
                if (rutherfordSimInterval) cancelAnimationFrame(rutherfordSimInterval);
                rutherfordSimInterval = null;
                rutherfordClock = null;
                rutherfordActiveParticles = [];
            });
            
            svg.innerHTML = `
                <defs>
                    <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <!-- Gold Foil Thin Layer representation -->
                <line x1="320" y1="10" x2="320" y2="270" stroke="rgba(251, 191, 36, 0.2)" stroke-width="24" stroke-linecap="round" />
                <text x="320" y="25" fill="rgba(251, 191, 36, 0.7)" font-size="9" font-weight="bold" text-anchor="middle">金箔靶區 Thin Gold Foil</text>
                
                <!-- Trails group -->
                <g id="rutherford-trails-group"></g>
                
                <!-- Beam source -->
                <rect x="10" y="110" width="30" height="60" fill="#475569" rx="4" />
                <rect x="40" y="130" width="10" height="20" fill="#334155" />
                <text x="25" y="100" fill="#94a3b8" font-size="10" text-anchor="middle">α 粒子源</text>
                
                <!-- Gold Nucleus -->
                <circle cx="320" cy="140" r="14" fill="#fbbf24" filter="url(#gold-glow)" />
                <circle cx="320" cy="140" r="4" fill="#d97706" />
                <text x="320" y="172" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">金原子核 (Au)</text>
                
                <!-- Flying particles group -->
                <g id="rutherford-particles-group"></g>
            `;

            slider.addEventListener('input', () => {
                bVal.textContent = `b/bₘₐₓ = ${(Number(slider.value) / 90).toFixed(2)}`;
            });

            btnFire.onclick = () => {
                fireAlpha(parseInt(slider.value));
            };

            btnBeam.onclick = () => {
                for (let b = -90; b <= 90; b += 15) {
                    setTimeout(() => fireAlpha(b), Math.abs(b) * 2.5);
                }
            };

            btnClear.onclick = () => {
                const trailsGroup = document.getElementById('rutherford-trails-group');
                const particlesGroup = document.getElementById('rutherford-particles-group');
                if (trailsGroup) trailsGroup.innerHTML = '';
                if (particlesGroup) particlesGroup.innerHTML = '';
                rutherfordActiveParticles = [];
            };

            if (!rutherfordSimInterval) {
                rutherfordClock = PhysicsRuntime.createFixedClock({ stepHz: 60 });
                function animate(timestamp) {
                    const trailsGroup = document.getElementById('rutherford-trails-group');
                    const particlesGroup = document.getElementById('rutherford-particles-group');

                    if (!trailsGroup || !particlesGroup) {
                        rutherfordSimInterval = null;
                        return;
                    }
                    rutherfordClock.advance(timestamp, () => {
                        for (let i = rutherfordActiveParticles.length - 1; i >= 0; i--) {
                            const p = rutherfordActiveParticles[i];
                            if (p.index < p.pts.length) {
                                const pt = p.pts[p.index];
                                p.circleEl.setAttribute('cx', pt.x);
                                p.circleEl.setAttribute('cy', pt.y);
                                
                                if (p.index === 0) {
                                    p.pathD = `M ${pt.x} ${pt.y}`;
                                } else {
                                    p.pathD += ` L ${pt.x} ${pt.y}`;
                                }
                                p.pathEl.setAttribute('d', p.pathD);
                                
                                p.index += 3;
                            } else {
                                p.circleEl.remove();
                                p.pathEl.setAttribute('opacity', '0.2');
                                rutherfordActiveParticles.splice(i, 1);
                            }
                        }
                    });
                    rutherfordSimInterval = requestAnimationFrame(animate);
                }
                rutherfordSimInterval = requestAnimationFrame(animate);
            }
        }

        function fireAlpha(b) {
            const trailsGroup = document.getElementById('rutherford-trails-group');
            const particlesGroup = document.getElementById('rutherford-particles-group');
            if (!trailsGroup || !particlesGroup) return;

            const pts = calculateRutherfordPath(b);
            if (pts.length === 0) return;
            
            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('fill', 'none');
            const isBackScattered = pts.length > 0 && pts[pts.length-1].x < 280;
            pathEl.setAttribute('stroke', isBackScattered ? '#ef4444' : '#fbbf24');
            pathEl.setAttribute('stroke-width', '1.5');
            pathEl.setAttribute('opacity', '0.6');
            trailsGroup.appendChild(pathEl);

            const circleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circleEl.setAttribute('r', '3');
            circleEl.setAttribute('fill', '#ffffff');
            circleEl.setAttribute('stroke', '#fbbf24');
            circleEl.setAttribute('stroke-width', '1');
            particlesGroup.appendChild(circleEl);

            rutherfordActiveParticles.push({
                pts: pts,
                index: 0,
                pathEl: pathEl,
                circleEl: circleEl,
                pathD: ''
            });
        }

        function calculateRutherfordPath(b) {
            let pts = [];
            let px = 50 - 320;
            let py = b;
            let vx = 9.0;
            let vy = 0.0;
            const dt = 0.5;
            const kZZ = 1900;
            
            for (let step = 0; step < 300; step++) {
                let r2 = px*px + py*py;
                let r = Math.sqrt(r2);
                if (r < 8) break;
                
                let force = kZZ / (r2 * r);
                let ax = force * px;
                let ay = force * py;
                
                vx += ax * dt;
                vy += ay * dt;
                px += vx * dt;
                py += vy * dt;
                
                let absX = px + 320;
                let absY = py + 140;
                
                pts.push({x: absX, y: absY});
                if (absX < 0 || absX > 520 || absY < 0 || absY > 280) {
                    break;
                }
            }
            return pts;
        }

        function initCrtSim() {
            const svg = document.getElementById('crt-svg');
            const selectMat = document.getElementById('crt-material-select');
            const btnNone = document.getElementById('crt-btn-none');
            const btnE = document.getElementById('crt-btn-e');
            const btnB = document.getElementById('crt-btn-b');
            const tipCard = document.getElementById('crt-tip-card');
            
            if (!svg || !selectMat || !btnNone || !btnE || !btnB || !tipCard) return;

            let crtMode = 'none'; // 'none', 'e', 'b'

            // Names mapping
            const names = {
                Cu: { metal: '銅 (Cu) 陰極', gas: '空氣 Residual Air' },
                Au: { metal: '金 (Au) 陰極', gas: '氫氣 (H₂)' },
                Al: { metal: '鋁 (Al) 陰極', gas: '氦氣 (He)' }
            };

            function drawCrtBase() {
                const mat = selectMat.value;
                const info = names[mat];

                svg.innerHTML = `
                    <defs>
                        <filter id="green-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="rgba(30, 41, 59, 0.7)" />
                            <stop offset="100%" stop-color="rgba(15, 23, 42, 0.4)" />
                        </linearGradient>
                    </defs>
                    
                    <!-- Glass Tube Outline -->
                    <path d="M 45 80 L 180 80 L 320 30 L 440 30 L 440 170 L 320 170 L 180 120 L 45 120 Z" fill="rgba(14, 165, 233, 0.04)" stroke="#334155" stroke-width="2.5" />
                    
                    <!-- Cathode (-) on the left -->
                    <rect x="55" y="90" width="10" height="20" fill="#f43f5e" rx="1" />
                    <line x1="30" y1="100" x2="55" y2="100" stroke="#f43f5e" stroke-width="2" />
                    <text x="55" y="75" fill="#f43f5e" font-size="9" font-weight="bold">${info.metal}</text>
                    
                    <!-- Anode (+) collimator -->
                    <rect x="140" y="85" width="8" height="30" fill="#38bdf8" />
                    <line x1="144" y1="100" x2="144" y2="140" stroke="#38bdf8" stroke-width="1.5" />
                    <text x="144" y="72" fill="#38bdf8" font-size="9" font-weight="bold">陽極 A (+)</text>
                    
                    <!-- Residual Gas Label -->
                    <text x="110" y="112" fill="#64748b" font-size="8" text-anchor="middle">管內氣體: ${info.gas}</text>
                    
                    <!-- Phosphor Screen Glow -->
                    <path d="M 440 30 A 10 140 0 0 1 440 170" stroke="#10b981" stroke-width="8" fill="none" opacity="0.1" />
                    <path d="M 440 35 A 10 130 0 0 1 440 165" stroke="#10b981" stroke-width="3" fill="none" opacity="0.5" />
                    <text x="455" y="104" fill="#10b981" font-size="10" font-weight="bold" writing-mode="vertical-rl">螢光幕</text>
                    
                    <!-- Electric Plates -->
                    <rect id="crt-plate-top" x="200" y="55" width="80" height="8" fill="#475569" rx="2" />
                    <rect id="crt-plate-bottom" x="200" y="137" width="80" height="8" fill="#475569" rx="2" />
                    <text id="crt-plate-top-txt" x="240" y="50" fill="#94a3b8" font-size="10" font-weight="bold" text-anchor="middle"></text>
                    <text id="crt-plate-bottom-txt" x="240" y="155" fill="#94a3b8" font-size="10" font-weight="bold" text-anchor="middle"></text>
                    
                    <!-- Magnetic Field Region Indicator Box -->
                    <rect x="200" y="70" width="80" height="60" fill="none" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="3 3" />
                    <text x="240" y="125" fill="#475569" font-size="8" text-anchor="middle">橫向偏折場區域</text>
                    
                    <!-- Magnetic Field Symbols Group -->
                    <g id="crt-mag-symbols"></g>
                    
                    <!-- Electron Beam Paths -->
                    <path id="crt-beam" d="" stroke="#10b981" stroke-width="4.5" fill="none" filter="url(#green-glow)" opacity="0.85" />
                    <path id="crt-beam-core" d="" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.95" />
                    
                    <!-- Glowing point on screen -->
                    <circle id="crt-spot" cx="440" cy="100" r="5" fill="#ffffff" filter="url(#green-glow)" />
                `;
            }

            function updateSimulation() {
                drawCrtBase();
                
                const plateTop = document.getElementById('crt-plate-top');
                const plateBottom = document.getElementById('crt-plate-bottom');
                const plateTopTxt = document.getElementById('crt-plate-top-txt');
                const plateBottomTxt = document.getElementById('crt-plate-bottom-txt');
                const magGroup = document.getElementById('crt-mag-symbols');
                
                let E = 0, B = 0;
                
                btnNone.style.background = crtMode === 'none' ? 'var(--primary-blue)' : 'var(--border-color)';
                btnNone.style.color = crtMode === 'none' ? 'white' : 'var(--text-main)';
                btnE.style.background = crtMode === 'e' ? 'var(--primary-blue)' : 'var(--border-color)';
                btnE.style.color = crtMode === 'e' ? 'white' : 'var(--text-main)';
                btnB.style.background = crtMode === 'b' ? 'var(--primary-blue)' : 'var(--border-color)';
                btnB.style.color = crtMode === 'b' ? 'white' : 'var(--text-main)';

                if (crtMode === 'e') {
                    E = 35;
                    plateTop.setAttribute('fill', '#f43f5e'); // Red (+)
                    plateBottom.setAttribute('fill', '#3b82f6'); // Blue (-)
                    plateTopTxt.textContent = '+';
                    plateTopTxt.setAttribute('fill', '#f43f5e');
                    plateBottomTxt.textContent = '-';
                    plateBottomTxt.setAttribute('fill', '#3b82f6');
                } else if (crtMode === 'b') {
                    B = 35;
                    const positions = [
                        {x: 220, y: 88}, {x: 260, y: 88},
                        {x: 220, y: 118}, {x: 260, y: 118}
                    ];
                    positions.forEach(pos => {
                        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        txt.setAttribute('x', pos.x);
                        txt.setAttribute('y', pos.y);
                        txt.setAttribute('fill', 'rgba(56, 189, 248, 0.5)');
                        txt.setAttribute('font-size', '14');
                        txt.setAttribute('font-weight', 'bold');
                        txt.setAttribute('text-anchor', 'middle');
                        txt.textContent = '⊗';
                        magGroup.appendChild(txt);
                    });
                }
                
                const ay = -0.00006 * E + 0.00006 * B;
                const x1 = 180, x2 = 300, x3 = 438;
                const y1 = 100;
                const u = x2 - x1;
                const y2 = y1 + 0.5 * ay * u * u;
                const slope = ay * u;
                const y3 = y2 + slope * (x3 - x2);
                
                const d = `M 65 100 L ${x1} 100 Q 240 100 ${x2} ${y2} L ${x3} ${y3}`;
                
                document.getElementById('crt-beam').setAttribute('d', d);
                document.getElementById('crt-beam-core').setAttribute('d', d);
                
                const spot = document.getElementById('crt-spot');
                if (y3 >= 28 && y3 <= 172) {
                    spot.setAttribute('cx', x3);
                    spot.setAttribute('cy', y3);
                    spot.setAttribute('display', 'block');
                } else {
                    spot.setAttribute('display', 'none');
                }

                const matText = selectMat.options[selectMat.selectedIndex].text;
                let modeText = '直進打在螢幕中央';
                if (crtMode === 'e') modeText = '受到電場力吸引，朝正極板向上偏折';
                if (crtMode === 'b') modeText = '受到磁場力作用，向下偏折';

                tipCard.innerHTML = `
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>實驗觀察：</strong> 當前為 <strong>【${matText}】</strong>。
                        <br>• 在此配置下，施加橫向場時，陰極射線 <strong>${modeText}</strong>。
                        <br>• <span style="color: var(--success-green, #10b981); font-weight: bold;">核心發現：</span>更換其他陰極材料與氣體後，<strong>偏折的軌跡與行為完全一致</strong>！這證實了電子是不隨材料與氣體改變、普遍存在於所有物質中的共同基本粒子。
                    </div>
                `;
            }

            selectMat.onchange = updateSimulation;
            btnNone.onclick = () => { crtMode = 'none'; updateSimulation(); };
            btnE.onclick = () => { crtMode = 'e'; updateSimulation(); };
            btnB.onclick = () => { crtMode = 'b'; updateSimulation(); };

            updateSimulation();
        }


        // 運動圖形對照（x-t、v-t、a-t）——併入模組二
        function kinematicsGraphsHtml() {
            const mini = (curve) => `<svg viewBox="0 0 104 66" width="118" style="max-width:100%"><line x1="16" y1="6" x2="16" y2="56" stroke="#94a3b8" stroke-width="1.4"/><line x1="16" y1="56" x2="98" y2="56" stroke="#94a3b8" stroke-width="1.4"/>${curve}</svg>`;
            const C = 'var(--primary-blue)';
            const flat = (y) => `<line x1="16" y1="${y}" x2="94" y2="${y}" stroke="${C}" stroke-width="2.4"/>`;
            const up = (y1, y2) => `<line x1="16" y1="${y1}" x2="94" y2="${y2}" stroke="${C}" stroke-width="2.4"/>`;
            const para = `<path d="M16,54 Q68,52 94,10" fill="none" stroke="${C}" stroke-width="2.4"/>`;
            const rows = [
                ['靜止', flat(30), flat(54), flat(54)],
                ['等速度運動', up(54, 12), flat(28), flat(54)],
                ['等加速度運動<br>（由靜止）', para, up(54, 12), flat(28)]
            ];
            let body = '';
            rows.forEach(r => {
                body += `<tr><td style="font-weight:600; color:var(--text-main);">${r[0]}</td><td>${mini(r[1])}</td><td>${mini(r[2])}</td><td>${mini(r[3])}</td></tr>`;
            });
            return `
                <div class="handout-section-title">📈 運動圖形對照（x-t、v-t、a-t）</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>學測運動學以「讀圖」為主：<b>x-t 圖的斜率＝速度</b>；<b>v-t 圖的斜率＝加速度、面積＝位移</b>；<b>a-t 圖的高度＝加速度大小</b>。不需背等加速度公式。</div>
                </div>
                <div class="edu-table-container">
                    <table class="edu-table" style="text-align:center;">
                        <thead>
                            <tr>
                                <th style="width:22%">運動類型</th>
                                <th>位置－時間（x-t）</th>
                                <th>速度－時間（v-t）</th>
                                <th>加速度－時間（a-t）</th>
                            </tr>
                        </thead>
                        <tbody>${body}</tbody>
                    </table>
                </div>

                <div class="handout-section-title" style="margin-top: 1.75rem;">📐 「斜率」與「面積」的物理意義</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div><b>通則</b>：圖線的<b>「斜率」＝縱軸物理量對時間的變化率</b>（線越陡代表變化越快）；圖線與時間軸所夾的<b>「面積」＝縱軸物理量對時間的累積量</b>（在時間軸下方的面積計為負）。把這條通則套到每種圖，就不必死背個別公式。</div>
                </div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width:28%">圖形（縱軸－橫軸）</th>
                                <th>斜率的意義</th>
                                <th>與時間軸所夾面積的意義</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>x-t（位置－時間）</b></td>
                                <td>速度（位置的變化率）；斜率為正代表朝正方向、為負代表朝反方向</td>
                                <td>—（無對應的物理量）</td>
                            </tr>
                            <tr>
                                <td><b>v-t（速度－時間）</b></td>
                                <td>加速度（速度的變化率）；水平線代表等速、斜直線代表等加速</td>
                                <td><b>位移</b>（速度對時間的累積；軸下方面積為反向位移）</td>
                            </tr>
                            <tr>
                                <td><b>a-t（加速度－時間）</b></td>
                                <td>—（一般不討論）</td>
                                <td><b>速度變化量</b> $\\Delta v$（加速度對時間的累積）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="formula-desc" style="margin-top: 0.6rem;">
                    ⚡ 常見陷阱：① $x-t$ 圖是「彎的」不代表加速度，只要斜率（速度）在變就有加速度；② $v-t$ 圖與時間軸下方的面積代表「反向位移」，計算總位移時要相減；③ 只有 $v-t$ 圖同時具備「斜率＝加速度」與「面積＝位移」兩個好用性質，是解題主力。
                </div>

                <div class="handout-section-title" style="margin-top: 1.75rem;">🔑 通用心法：相乘看「面積」、相除看「斜率」</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>這個看圖技巧<b>不只用在運動學</b>。判斷某物理量在圖上是「面積」還是「斜率」，只要看它的定義式：<br>• 由兩量<b>「相乘」</b>得到 → 它就是對應圖形的<b>「面積」</b>（縱軸×橫軸的累積）。<br>• 由兩量<b>「相除（變化率）」</b>得到 → 它就是圖形的<b>「斜率」</b>。</div>
                </div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width:38%">物理量的定義式</th>
                                <th style="width:26%">看哪種圖</th>
                                <th>對應</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>速度 ＝ 位移 ÷ 時間 <span style="color:var(--text-muted);">（相除）</span></td><td>位置－時間（x-t）</td><td><b>斜率</b></td></tr>
                            <tr><td>加速度 ＝ 速度 ÷ 時間 <span style="color:var(--text-muted);">（相除）</span></td><td>速度－時間（v-t）</td><td><b>斜率</b></td></tr>
                            <tr><td>功率 ＝ 功 ÷ 時間 <span style="color:var(--text-muted);">（相除）</span></td><td>功－時間（W-t）</td><td><b>斜率</b></td></tr>
                            <tr><td>位移 ＝ 速度 × 時間 <span style="color:var(--text-muted);">（相乘）</span></td><td>速度－時間（v-t）</td><td><b>面積</b></td></tr>
                            <tr><td>功 ＝ 力 × 位移 <span style="color:var(--text-muted);">（相乘）</span></td><td>力－位移（F-x）</td><td><b>面積</b></td></tr>
                            <tr><td>功（能量）＝ 功率 × 時間 <span style="color:var(--text-muted);">（相乘）</span></td><td>功率－時間（P-t）</td><td><b>面積</b></td></tr>
                            <tr><td>電量 ＝ 電流 × 時間 <span style="color:var(--text-muted);">（相乘）</span></td><td>電流－時間（I-t）</td><td><b>面積</b></td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="formula-desc" style="margin-top: 0.6rem;">
                    例：電費的「一度電＝1 kW × 1 hr」就是「功率×時間＝能量」（$P$-$t$ 圖的面積）；電量 $Q = I\\times t$（$I$-$t$ 圖的面積）也對應到「庫侖 ＝ 安培 × 秒」。
                </div>
            `;
        }

        // 補充專題：空氣阻力 × 牛頓三大運動定律——併入模組二
        function airResistanceSectionHtml() {
            // 終端速度 v-t 曲線（漸近水平線）
            const vtSvg = `
                <svg viewBox="0 0 300 170" width="300" style="max-width:100%; display:block; margin:0 auto;">
                    <line x1="38" y1="12" x2="38" y2="140" stroke="#94a3b8" stroke-width="1.5"/>
                    <line x1="38" y1="140" x2="285" y2="140" stroke="#94a3b8" stroke-width="1.5"/>
                    <text x="14" y="24" fill="#64748b" font-size="12">v</text>
                    <text x="278" y="158" fill="#64748b" font-size="12">t</text>
                    <line x1="38" y1="46" x2="285" y2="46" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="5,4"/>
                    <text x="200" y="38" fill="#b45309" font-size="12" font-weight="bold">終端速度 v_t（阻力＝重力）</text>
                    <path d="M38,140 C90,60 140,48 275,46" fill="none" stroke="var(--primary-blue)" stroke-width="2.6"/>
                    <text x="52" y="120" fill="#334155" font-size="11">a≈g（阻力小）</text>
                    <text x="120" y="78" fill="#334155" font-size="11">a 漸減</text>
                    <text x="212" y="62" fill="#334155" font-size="11">a＝0，等速</text>
                </svg>`;

            // Micro SVGs for Newton's Laws Table
            const n2Svg = `
                <svg viewBox="0 0 120 75" width="100" style="display:block; margin:0.4rem auto 0;">
                    <!-- 落體 -->
                    <circle cx="60" cy="35" r="10" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
                    <!-- 重力 mg (長紅箭頭) -->
                    <path d="M60,45 L60,70" fill="none" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-red)"/>
                    <text x="66" y="65" fill="#ef4444" font-size="9" font-weight="bold">mg</text>
                    <!-- 阻力 f (短藍箭頭) -->
                    <path d="M60,25 L60,10" fill="none" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow-blue)"/>
                    <text x="66" y="18" fill="#3b82f6" font-size="9" font-weight="bold">f (小)</text>
                    <!-- 合力 & 加速度 -->
                    <path d="M25,25 L25,45" fill="none" stroke="#22c55e" stroke-width="2" marker-end="url(#arrow-green)"/>
                    <text x="5" y="38" fill="#22c55e" font-size="9" font-weight="bold">a &lt; g</text>
                    <!-- Define markers -->
                    <defs>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
                        </marker>
                        <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6"/>
                        </marker>
                        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#22c55e"/>
                        </marker>
                    </defs>
                </svg>`;

            const n1Svg = `
                <svg viewBox="0 0 120 75" width="100" style="display:block; margin:0.4rem auto 0;">
                    <!-- 落體 -->
                    <circle cx="60" cy="35" r="10" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
                    <!-- 重力 mg (紅箭頭) -->
                    <path d="M60,45 L60,68" fill="none" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-red-n1)"/>
                    <text x="66" y="60" fill="#ef4444" font-size="9" font-weight="bold">mg</text>
                    <!-- 阻力 f (等長藍箭頭) -->
                    <path d="M60,25 L60,2" fill="none" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow-blue-n1)"/>
                    <text x="66" y="14" fill="#3b82f6" font-size="9" font-weight="bold">f = mg</text>
                    <!-- 平衡狀態 -->
                    <text x="10" y="38" fill="#475569" font-size="9" font-weight="bold">a = 0 (等速)</text>
                    <defs>
                        <marker id="arrow-red-n1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
                        </marker>
                        <marker id="arrow-blue-n1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6"/>
                        </marker>
                    </defs>
                </svg>`;

            const n3Svg = `
                <svg viewBox="0 0 120 75" width="100" style="display:block; margin:0.4rem auto 0;">
                    <!-- 落體底面與空氣分子 -->
                    <path d="M30,30 L90,30" stroke="#475569" stroke-width="2"/>
                    <circle cx="60" cy="20" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
                    <circle cx="50" cy="42" r="3" fill="#93c5fd" opacity="0.8"/>
                    <circle cx="62" cy="46" r="3" fill="#93c5fd" opacity="0.8"/>
                    <circle cx="72" cy="40" r="3" fill="#93c5fd" opacity="0.8"/>
                    <!-- 落體推空氣向下 F1 (紅箭頭) -->
                    <path d="M55,30 L55,55" fill="none" stroke="#ef4444" stroke-width="1.8" marker-end="url(#arrow-red-n3)"/>
                    <text x="12" y="52" fill="#ef4444" font-size="8" font-weight="bold">F_落對空</text>
                    <!-- 空氣推落體向上 F2 (藍箭頭) -->
                    <path d="M65,30 L65,5" fill="none" stroke="#3b82f6" stroke-width="1.8" marker-end="url(#arrow-blue-n3)"/>
                    <text x="70" y="14" fill="#3b82f6" font-size="8" font-weight="bold">F_空對落(阻力)</text>
                    <defs>
                        <marker id="arrow-red-n3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
                        </marker>
                        <marker id="arrow-blue-n3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6"/>
                        </marker>
                    </defs>
                </svg>`;

            return `
                <div class="handout-section-title">🪂 補充專題：空氣阻力——牛頓三大運動定律的總演練</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div><b>為什麼值得專題討論：</b>「受空氣阻力的落體／跳傘」是學測愛考的情境（107 Q16、110 Q58-59、112 Q33），而它恰好把牛頓三大定律一次用完。關鍵性質只有兩條：<b>阻力方向與運動方向相反</b>、<b>速率越快阻力越大</b>（定性，不需公式）。</div>
                </div>

                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width:18%">定律</th>
                                <th style="width:44%">在空氣阻力情境中的角色</th>
                                <th>對應的落體階段</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>第二定律</b><br>$F_{net}=ma$</td>
                                <td>剛落下時速度小 → 阻力小 → 合力≈重力（向下）→ 加速度≈$g$。<br>隨速率增大 → 阻力增大 → <b>合力變小 → 加速度變小</b>（仍在加速，但越加越慢）。</td>
                                <td>下落初期與中期：$v$-$t$ 圖斜率由 $g$ 逐漸變緩${n2Svg}</td>
                            </tr>
                            <tr>
                                <td><b>第一定律</b><br>慣性</td>
                                <td>當速率大到<b>阻力＝重力</b>，合力為零 → 依慣性定律「動者恆做等速度運動」→ 以<b>終端速度</b>等速下落。</td>
                                <td>末期：$v$-$t$ 圖趨於水平線（107 學測 Q16 正解圖形）${n1Svg}</td>
                            </tr>
                            <tr>
                                <td><b>第三定律</b><br>作用與反作用</td>
                                <td>阻力的來源：落體向下推開空氣（作用力），空氣同時反推落體（反作用力）——空氣阻力正是牛頓第三定律的體現。</td>
                                <td>全程${n3Svg}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="edu-card" style="margin-top:1rem;">
                    <div class="formula-card-title">📉 受空氣阻力落體的 v-t 圖</div>
                    ${vtSvg}
                    <div class="formula-desc" style="margin-top:0.6rem;">
                        三段解讀：①起點斜率＝$g$（阻力還很小）；②斜率漸減（阻力隨速率增大、合力變小）；③趨近水平＝終端速度（阻力＝重力、合力為零）。<br>
                        <b>質量的影響（110 Q59、112 Q33 考點）</b>：重的物體重力較大，需要「更大的阻力」才能平衡 → 要達到更高速率 → <b>終端速度較大</b>；相同高度落下時，重者先落地。這不違背伽利略——真空中（無阻力）所有物體加速度同為 $g$。
                    </div>
                </div>

                <div class="feature-guide-box" style="margin-top:1rem;">
                    <div class="feature-trigger">
                        <span class="feature-trigger-tag">歷屆考點</span>
                        <div class="feature-trigger-title">107 學測 Q16：小球受空氣阻力落下的 $v$-$t$ 圖（選漸近水平的曲線）｜110 學測 Q58-59：跳傘者兩段終端速度（開傘前後）、攜重物終端速度變大｜112 學測 Q33：1g/4g/9g 三球落下，質量越大終端速度越大。</div>
                    </div>
                    <div class="feature-bridge">
                        <div class="feature-bridge-title">➔ 解題口訣</div>
                        <div class="feature-bridge-desc">看到「空氣阻力＋落下」就問三件事：①現在阻力和重力誰大？（決定合力方向）②合力還剩多少？（決定加速度大小）③阻力＝重力了嗎？（到了就是終端速度、等速下落）。開傘＝阻力突然暴增 → 阻力＞重力 → 合力向上 → <b>向下減速</b>，降到新的（較小的）終端速度。</div>
                    </div>
                </div>
            `;
        }

        function maxwellWaveSupplementHtml() {
            return `
                <section class="edu-card" id="maxwell-wave-supplement" style="margin-top:1.5rem; border-left:4px solid var(--accent-orange);">
                    <div class="formula-card-title">📝 課綱補充｜馬克士威如何預測光是電磁波</div>
                    <div class="info-alert" style="margin-top:0.8rem;">
                        <span class="info-alert-icon">1</span>
                        <div><b>理論預測：</b>馬克士威把電磁定律統整後，預測電磁場的擾動可以像波一樣在空間中傳播。</div>
                    </div>
                    <div class="info-alert">
                        <span class="info-alert-icon">2</span>
                        <div><b>比較速度：</b>他由理論計算出的電磁波速度，與當時實驗測得的光速相同。</div>
                    </div>
                    <div class="info-alert">
                        <span class="info-alert-icon">3</span>
                        <div><b>作出推論：</b>既然兩者速度相同，馬克士威便推論「光是一種電磁波」，後來再由實驗支持。</div>
                    </div>
                    <p class="formula-desc" style="margin-top:1rem;"><b>關於波動方程式：</b>在更進階的數學課程中，可以把馬克士威方程式整理成「波動方程式」，並由其中讀出傳播速度；高中必修不需要知道方程式長相，也不需要推導。</p>
                    <div class="feature-guide-box" style="margin-top:1rem;">
                        <div class="feature-trigger">
                            <span class="feature-trigger-tag">歷史證據鏈</span>
                            <div class="feature-trigger-title">先量出光速，再由電磁理論算出相同數值，最後以實驗產生與接收電磁波。</div>
                        </div>
                        <div class="feature-bridge">
                            <div class="feature-bridge-title">➔ 傅科 → 馬克士威 → 赫茲</div>
                            <div class="feature-bridge-desc">傅科在 1862 年以旋轉鏡法測量光速；馬克士威接著由電磁理論得到相同的速度，據此推論光是電磁波；赫茲日後以火花實驗支持電磁波確實能在空間中傳播。只需掌握這條證據鏈，不考數學推導。</div>
                        </div>
                    </div>
                </section>
            `;
        }

