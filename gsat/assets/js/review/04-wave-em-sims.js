// 互動模擬：波動現象、交流發電機、3D 電磁感應
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 互動模擬一：波動現象（行進波 / 兩波疊加）——併入模組五 =====
        let waveSimState = { mode: 'travel', A: 34, f: 1.0, v: 120, delta: 0.5, raf: null, simTime: 0, clock: null };

        function waveSimHtml() {
            const s = waveSimState;
            return `
                <div class="handout-section-title">🎛️ 互動模擬：波動現象（調整參數，觀察波形）</div>
                <div class="sim-box" id="wave-sim-box">
                    <div class="sim-row" style="margin-bottom:0.75rem;">
                        <button class="bank-chip-btn ${s.mode==='travel'?'active':''}" onclick="setWaveSimMode('travel')">① 行進波（v = fλ）</button>
                        <button class="bank-chip-btn ${s.mode==='sup'?'active':''}" onclick="setWaveSimMode('sup')">② 兩波疊加（干涉）</button>
                    </div>
                    <div class="sim-canvas-wrap"><canvas id="wave-sim-canvas" width="900" height="230"></canvas></div>
                    <div class="sim-controls" id="wave-sim-controls"></div>
                    <div class="sim-readout" id="wave-sim-readout"></div>
                    <div class="sim-note" id="wave-sim-note"></div>
                </div>
            `;
        }

        function setWaveSimMode(m) {
            waveSimState.mode = m;
            const box = document.getElementById('wave-sim-box');
            if (box) {
                box.querySelectorAll('.bank-chip-btn').forEach(b => b.classList.toggle('active', b.textContent.includes(m === 'travel' ? '行進波' : '疊加')));
            }
            buildWaveSimControls();
        }

        function buildWaveSimControls() {
            const s = waveSimState;
            const c = document.getElementById('wave-sim-controls');
            if (!c) return;
            if (s.mode === 'travel') {
                c.innerHTML = `
                    <div class="sim-row"><span class="sim-label">振幅 A（由波源決定）</span><input type="range" min="10" max="60" step="1" value="${s.A}" oninput="waveSimState.A=+this.value; updateWaveSimReadout();"><span class="sim-val" id="wave-val-A"></span></div>
                    <div class="sim-row"><span class="sim-label">頻率 f（由波源決定）</span><input type="range" min="0.4" max="2.5" step="0.1" value="${s.f}" oninput="waveSimState.f=+this.value; updateWaveSimReadout();"><span class="sim-val" id="wave-val-f"></span></div>
                    <div class="sim-row"><span class="sim-label">波速 v（由介質決定）</span><input type="range" min="50" max="240" step="5" value="${s.v}" oninput="waveSimState.v=+this.value; updateWaveSimReadout();"><span class="sim-val" id="wave-val-v"></span></div>
                `;
            } else {
                c.innerHTML = `
                    <div class="sim-row"><span class="sim-label">波程差 Δ（單位：λ）</span><input type="range" min="0" max="2" step="0.05" value="${s.delta}" oninput="waveSimState.delta=+this.value; updateWaveSimReadout();"><span class="sim-val" id="wave-val-d"></span></div>
                `;
            }
            updateWaveSimReadout();
        }

        function updateWaveSimReadout() {
            const s = waveSimState;
            const ro = document.getElementById('wave-sim-readout');
            const note = document.getElementById('wave-sim-note');
            if (!ro) return;
            if (s.mode === 'travel') {
                const lam = s.v / s.f;
                const eA = document.getElementById('wave-val-A'); if (eA) eA.textContent = s.A + ' cm';
                const eF = document.getElementById('wave-val-f'); if (eF) eF.textContent = s.f.toFixed(1) + ' Hz';
                const eV = document.getElementById('wave-val-v'); if (eV) eV.textContent = s.v + ' m/s';
                ro.innerHTML = `<span class="sim-chip">波長 λ = v ÷ f = <b>${lam.toFixed(1)} m</b></span><span class="sim-chip">檢核：v/(fλ) = <b>1.000</b></span><span class="sim-chip">波速 → 介質決定</span>`;
                note.innerHTML = '🔴 紅點是「介質質點」：波向右前進，質點只在原地上下振動（波傳能量、不傳介質）。調高頻率 → 波長變短；調快波速（換介質）→ 波長變長；振幅只改變高度，不影響波速與波長。';
            } else {
                const d = s.delta;
                const eD = document.getElementById('wave-val-d'); if (eD) eD.textContent = d.toFixed(2) + ' λ';
                const frac = Math.abs(d - Math.round(d));
                let verdict;
                if (frac < 0.08) verdict = '<span class="sim-chip" style="background:var(--accent-green-light); color:var(--accent-green); font-weight:700;">波程差 ≈ 整數 λ → 同相，建設性干涉（合成振幅最大）</span>';
                else if (Math.abs(frac - 0.5) < 0.08) verdict = '<span class="sim-chip" style="background:var(--accent-rose-light); color:var(--accent-rose); font-weight:700;">波程差 ≈ 半整數 λ → 反相，破壞性干涉（幾乎相消）</span>';
                else verdict = '<span class="sim-chip">介於同相與反相之間，部分加強</span>';
                ro.innerHTML = `<span class="sim-chip">波程差 Δ = <b>${d.toFixed(2)} λ</b></span>` + verdict;
                note.innerHTML = '灰色細線是兩列相同的波（第二列沿傳播方向多走了 Δ）；藍色粗線是兩波「疊加」的合成波。拖動滑桿觀察：Δ = 0、1λ、2λ 時波峰對波峰（加強）；Δ = 0.5λ、1.5λ 時波峰對波谷（相消）。';
            }
        }

        function initWaveSim() {
            const canvas = document.getElementById('wave-sim-canvas');
            if (!canvas) return;
            if (waveSimState.raf) cancelAnimationFrame(waveSimState.raf);
            registerViewDisposer(() => {
                if (waveSimState.raf) cancelAnimationFrame(waveSimState.raf);
                waveSimState.raf = null;
                waveSimState.clock = null;
            });
            buildWaveSimControls();
            const ctx = canvas.getContext('2d');
            const W = canvas.width, H = canvas.height, mid = H / 2;
            waveSimState.simTime = 0;
            waveSimState.clock = PhysicsRuntime.createFixedClock({ stepHz: 120 });
            const reduceMotion = PhysicsRuntime.prefersReducedMotion();

            function frame(now) {
                if (!document.getElementById('wave-sim-canvas')) { waveSimState.raf = null; return; }
                const s = waveSimState;
                if (!reduceMotion) s.clock.advance(now, dt => { s.simTime += dt; });
                const t = s.simTime;
                ctx.clearRect(0, 0, W, H);
                // 中線
                ctx.strokeStyle = 'rgba(148,163,184,0.35)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

                if (s.mode === 'travel') {
                    const lam = (s.v / s.f) * 3;   // 顯示比例：1 格 = 3px
                    const A = s.A * 1.6;
                    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    for (let x = 0; x <= W; x += 2) {
                        const y = mid - A * Math.sin(2 * Math.PI * (x / lam - s.f * t));
                        (x === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                    // 一個波長的標示（找 t 時刻的波峰位置起算）
                    const xPeak = ((0.25 + s.f * t) % 1) * lam;
                    ctx.strokeStyle = 'rgba(251,191,36,0.9)'; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(xPeak, mid - A - 14); ctx.lineTo(xPeak + lam, mid - A - 14); ctx.stroke();
                    ctx.fillStyle = 'rgba(251,191,36,0.95)'; ctx.font = '13px sans-serif';
                    ctx.fillText('λ', xPeak + lam / 2 - 4, mid - A - 20);
                    [xPeak, xPeak + lam].forEach(px => { ctx.beginPath(); ctx.moveTo(px, mid - A - 20); ctx.lineTo(px, mid - A - 8); ctx.stroke(); });
                    // 介質質點（紅點，原地振動）
                    const xDot = W * 0.32;
                    const yDot = mid - A * Math.sin(2 * Math.PI * (xDot / lam - s.f * t));
                    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(244,63,94,0.5)';
                    ctx.beginPath(); ctx.moveTo(xDot, mid - A - 4); ctx.lineTo(xDot, mid + A + 4); ctx.stroke(); ctx.setLineDash([]);
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath(); ctx.arc(xDot, yDot, 7, 0, Math.PI * 2); ctx.fill();
                    // 傳播方向箭頭
                    ctx.fillStyle = 'rgba(226,232,240,0.9)'; ctx.font = '13px sans-serif';
                    ctx.fillText('波的傳播方向 →', W - 150, 22);
                } else {
                    const lam = 240, A = 38, d = s.delta;
                    const y1 = x => A * Math.sin(2 * Math.PI * (x / lam - 0.8 * t));
                    const y2 = x => A * Math.sin(2 * Math.PI * (x / lam - 0.8 * t + d));
                    // 兩列分量波（細灰）
                    ctx.lineWidth = 1.2;
                    [['rgba(148,163,184,0.55)', y1], ['rgba(148,163,184,0.55)', y2]].forEach(([col, fn]) => {
                        ctx.strokeStyle = col; ctx.beginPath();
                        for (let x = 0; x <= W; x += 2) { const y = mid - fn(x); (x === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
                        ctx.stroke();
                    });
                    // 合成波（粗藍）
                    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
                    ctx.beginPath();
                    for (let x = 0; x <= W; x += 2) { const y = mid - (y1(x) + y2(x)); (x === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(226,232,240,0.9)'; ctx.font = '13px sans-serif';
                    ctx.fillText('細灰線＝兩列分量波；粗藍線＝疊加後的合成波', 12, 20);
                }
                waveSimState.raf = requestAnimationFrame(frame);
            }
            waveSimState.raf = requestAnimationFrame(frame);
        }

        // ===== 互動模擬三：交流發電機與感應電流判斷——併入模組六（N21 電磁感應） =====
        // physics-mode: analytical（相位直接決定磁力線穿越量與感應電流大小；內部計算沿用 sin/cos，
        // 但對學生一律只呈現「磁力線數目變化＋冷次定律」的必修語言，不出現磁通量/Φ/電動勢/ε 等選修符號）
        // 物理約定：φ=0 時線圈面平行磁場，穿過線圈的磁力線數目為 0、感應電流最大；
        // φ=90° 時線圈面正對磁極，穿過線圈的磁力線數目最多、感應電流瞬間為 0（換向點）。
        const generatorState = {
            phi: 0.9, omega: 1.6, dir: 1, playing: true, raf: null, lastTs: 0, clock: null,
            poleDir: 1, slipRings: true,
            showField: true, showCurrent: true, showMeter: true,
            quiz: null, streak: 0, ansCount: 0, corrCount: 0,
            _resizeObserver: null, _instanceId: 0
        };

        // 感應電流帶號值（相對，−1~1）：>0 規定導體 a 電流「流出紙面(⊙)」
        function genCurrent(phi, dir, poleDir = 1) { return -Math.cos(phi) * dir * poleDir; }
        function genElectricalState(state) {
            const flux = state.poleDir * Math.sin(state.phi);
            const emf = -state.poleDir * state.dir * Math.cos(state.phi) * state.omega;
            // 外電路視為純電阻負載：I=ε/R；以 Imax 正規化時，波形與 ε 相同。
            // 分裂換向器每半圈交換線圈端點，因此固定電刷側得到 |ε| 的單向脈動電流。
            const externalCurrent = state.slipRings ? emf : Math.abs(emf);
            const normalizedEmf = state.omega > 0 ? emf / state.omega : 0;
            const normalizedCurrent = state.omega > 0 ? externalCurrent / state.omega : 0;
            const currentLevel = Math.min(1, Math.abs(externalCurrent) / 2.6);
            return {
                flux,
                emf,
                externalCurrent,
                output: externalCurrent,
                normalizedEmf,
                normalizedCurrent,
                normalizedOutput: normalizedCurrent,
                brightness: currentLevel * currentLevel
            };
        }
        // 分類此刻感應電流大小/趨勢：'max' | 'zero' | 'rising' | 'falling'
        function genMagClass(phi, dir) {
            const mag = Math.abs(Math.cos(phi));
            if (mag >= 0.94) return 'max';
            if (mag <= 0.08) return 'zero';
            // |cos| 的變化趨勢：d|cosφ|/dt 符號
            const trend = -Math.sign(Math.cos(phi)) * Math.sin(phi) * generatorState.omega * dir;
            return trend > 0 ? 'rising' : 'falling';
        }
        // 穿過線圈的磁力線數目正在增加或減少：sign(dΦ/dt), Φ∝sinφ
        function genFluxTrend(phi, dir, poleDir = 1) {
            return Math.sign(Math.cos(phi) * generatorState.omega * dir * poleDir);
        }

        function generatorSimHtml() {
            return `
                <section class="generator-lab" aria-labelledby="generator-lab-title">
                    <div class="generator-lab-head">
                        <div>
                            <div class="generator-kicker">Interactive electromagnetic laboratory</div>
                            <h3 class="generator-lab-title" id="generator-lab-title">交流發電機與感應電流判斷</h3>
                            <p class="generator-lab-subtitle">三種模型看懂同一件事：磁力線數目變化 → 冷次定律 → 感應電流。切換模式，或直接出題考自己。</p>
                        </div>
                    </div>
                    <div class="sim-row" role="tablist" aria-label="發電機模型切換" style="margin-bottom:0.9rem;">
                        <button class="bank-chip-btn active" id="genmode-2d" role="tab" aria-selected="true" onclick="setGenMode('2d')">🌀 2D 剖面＋隨堂測驗</button>
                        <button class="bank-chip-btn" id="genmode-3dgen" role="tab" aria-selected="false" onclick="setGenMode('3dgen')">⚙️ 3D 發電機結構</button>
                        <button class="bank-chip-btn" id="genmode-3dind" role="tab" aria-selected="false" onclick="setGenMode('3dind')">🧊 3D 三方向（B×v×I）</button>
                    </div>
                    <div id="gen-2d-wrap">${generator2DHtml()}</div>
                    <div id="gen-3dgen-wrap" style="display:none;">${generator3DHtml()}</div>
                    <div id="gen-3dind-wrap" style="display:none;">${induction3DHtml()}</div>
                </section>
            `;
        }

        function setGenMode(mode) {
            const w3g = document.getElementById('gen-3dgen-wrap'), w2 = document.getElementById('gen-2d-wrap'), w3i = document.getElementById('gen-3dind-wrap');
            const b3g = document.getElementById('genmode-3dgen'), b2 = document.getElementById('genmode-2d'), b3i = document.getElementById('genmode-3dind');
            if (!w3g || !w2 || !w3i) return;

            // 銷毀所有前一場景的 RAF 與資源，避免記憶體洩漏與分頁卡死
            if (generatorState.raf) { cancelAnimationFrame(generatorState.raf); generatorState.raf = null; }
            generatorState._instanceId += 1;
            if (generatorState._resizeObserver) {
                generatorState._resizeObserver.disconnect();
                generatorState._resizeObserver = null;
            }
            const renewGeneratorCanvas = Boolean(gen3DState.renderer || gen3DState.scene);
            const renewInductionCanvas = Boolean(induction3D.renderer || induction3D.scene);
            dispose3DInduction();
            dispose3DGenerator();
            // forceContextLoss() 後的 canvas 不能可靠地重新取得 WebGL context。
            // 模式切換仍保留同一張介面卡，但改用全新的 canvas 節點承接下一次初始化。
            if (renewGeneratorCanvas) replaceSimulationCanvas('gen3d-canvas');
            if (renewInductionCanvas) replaceSimulationCanvas('ind3d-canvas');

            [w3g, w2, w3i].forEach(w => w.style.display = 'none');
            [b3g, b2, b3i].forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });

            if (mode === '3dgen') {
                generatorState.phi = gen3DState.phi;
                generatorState.omega = gen3DState.omega;
                generatorState.dir = gen3DState.dir;
                generatorState.poleDir = gen3DState.poleDir;
                generatorState.slipRings = gen3DState.slipRings;
                w3g.style.display = 'block'; b3g.classList.add('active'); b3g.setAttribute('aria-selected', 'true');
                init3DGenerator();
            } else if (mode === '3dind') {
                w3i.style.display = 'block'; b3i.classList.add('active'); b3i.setAttribute('aria-selected', 'true');
                init3DInduction();
            } else {
                generatorState.phi = gen3DState.phi;
                generatorState.omega = gen3DState.omega;
                generatorState.dir = gen3DState.dir;
                generatorState.poleDir = gen3DState.poleDir;
                generatorState.slipRings = gen3DState.slipRings;
                w2.style.display = 'block'; b2.classList.add('active'); b2.setAttribute('aria-selected', 'true');
                initGeneratorSim();
            }
        }

        function replaceSimulationCanvas(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas || !canvas.parentNode) return null;
            const freshCanvas = canvas.cloneNode(false);
            canvas.replaceWith(freshCanvas);
            return freshCanvas;
        }

        function toggle3DPlay() {
            induction3D.playing = !induction3D.playing;
            if (induction3D.clock) induction3D.clock.reset();
            const b = document.getElementById('ind3d-play');
            if (b) b.textContent = induction3D.playing ? '⏸ 暫停' : '▶ 播放';
        }

        function induction3DHtml() {
            return `
                <div class="generator-card" id="ind3d-box">
                    <div class="generator-stage-column" style="border-right:0;">
                        <div class="generator-stage-head">
                            <div class="generator-stage-title"><span class="generator-icon">xyz</span><span>磁場、運動與感應電流</span></div>
                            <span class="generator-status-badge"><span class="generator-status-dot"></span>三向正交</span>
                        </div>
                        <div class="generator-viewport" id="ind3d-viewport">
                            <canvas id="ind3d-canvas" width="880" height="420" aria-label="磁場、導體運動與感應電流三方向模型"></canvas>
                        </div>
                        <div id="ind3d-fallback" class="generator-fallback" style="display:none; margin-top:0.6rem;">
                            ⚠️ <b>無法載入 3D 繪圖庫</b>：請確認瀏覽器支援 WebGL 且已載入資源。
                        </div>
                    </div>
                    <div class="sim-row" style="padding:0 1rem; margin-top:0.2rem; gap:0.5rem;">
                        <span class="sim-chip" style="border-left:4px solid #3b82f6;">🔵 <b>B</b> 磁場（N→S）</span>
                        <span class="sim-chip" style="border-left:4px solid #22c55e;">🟢 <b>v</b> 導體運動</span>
                        <span class="sim-chip" style="border-left:4px solid #f97316;">🟠 <b>I</b> 感應電流</span>
                        <span class="sim-chip">三者互相垂直：<b>B ⊥ v ⊥ I</b></span>
                    </div>
                    <div class="sim-controls" style="padding:0 1rem;">
                        <div class="sim-row">
                            <button class="bank-chip-btn" id="ind3d-play" onclick="toggle3DPlay()">⏸ 暫停</button>
                            <button class="bank-chip-btn" onclick="induction3D.dir *= -1">🔄 反轉運動方向</button>
                            <span class="sim-note" style="margin:0;">🖱️ 在畫面上拖曳可自由旋轉視角</span>
                        </div>
                        <div class="sim-row"><span class="sim-label">運動速率</span><input type="range" min="0.3" max="2.5" step="0.1" value="1" oninput="induction3D.speed=+this.value"></div>
                    </div>
                    <div class="sim-readout" id="ind3d-readout" style="padding:0 1rem;"></div>
                    <div class="gen-quiz" id="ind3d-quiz" style="margin:0.9rem 1rem;">
                        <div class="sim-row" style="justify-content:space-between;">
                            <button class="bank-chip-btn" onclick="start3DQuiz()">🎯 出一題隨堂測驗（暫停現況考你）</button>
                            <span class="gen-score" id="ind3d-score"></span>
                        </div>
                        <div id="ind3d-quiz-body"></div>
                    </div>
                    <div class="sim-note" style="padding:0 1rem 1rem;">🔎 導體棒沿 <b>z</b> 方向來回運動，切割沿 <b>x</b> 方向的磁力線 → 穿過迴路的磁力線數目改變 → 產生沿 <b>y</b> 的感應電流。三方向恰好互相垂直，這就是「電磁感應是三個方向」的立體關係。當導體運動與磁場<b>垂直</b>時切割最有效、感應電流最大；運動<b>平行</b>磁場時不切割、感應電流為零。方向一律用<b>冷次定律</b>判讀（感應電流反抗穿過迴路磁力線的變化）。</div>
                </div>
            `;
        }

        function generator3DHtml() {
            return `
                <div class="generator-card" id="gen3d-sim-box">
                    <div class="generator-workspace">
                        <div class="generator-stage-column">
                            <div class="generator-stage-head">
                                <div class="generator-stage-title"><span class="generator-icon">⚙</span><span>發電機結構</span></div>
                                <span class="generator-status-badge"><span class="generator-status-dot"></span><span id="gen3d-status">運轉中</span></span>
                            </div>
                            <div class="generator-viewport" id="gen3d-viewport">
                                <canvas id="gen3d-canvas" width="900" height="500" aria-label="可拖曳旋轉的交流發電機三維模型"></canvas>
                                <div id="gen3d-fallback" class="generator-fallback" style="display:none;">
                                    <b>無法載入 3D 模型。</b>請確認瀏覽器已啟用 WebGL，並重新整理頁面。
                                </div>
                                <div class="generator-stage-legend" aria-hidden="true">
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#df5b62;"></span>N 極</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#4087cf;"></span>S 極</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#e2e8f0; border:1px solid #94a3b8;"></span>單匝代表線圈（銀白）</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#e11d48;"></span>線圈電流 I（環繞方向）</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#8a4fd2;"></span>A 引線</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#00a18a;"></span>B 引線</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#1a9b84;"></span>磁場 B</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#314e62;"></span>外部導線</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#ffd65c;"></span>負載燈泡</span>
                                    <span class="generator-legend-chip"><span class="generator-legend-swatch" style="background:#df5b62;"></span>感應電流（箭頭大小）</span>
                                    <span class="generator-legend-chip">拖曳旋轉視角</span>
                                </div>
                            </div>
                        </div>
                        <aside class="generator-side-panel" aria-label="發電機控制與讀數">
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">運轉控制</span>
                                <div class="generator-button-grid">
                                    <button class="generator-action primary" id="gen3d-play-btn" onclick="toggleGen3DPlay()">暫停</button>
                                    <button class="generator-action" onclick="stepGen3D(1)">前進 10°</button>
                                    <button class="generator-action" onclick="flipGen3DDir()">反轉線圈</button>
                                    <button class="generator-action" onclick="swapGen3DPoles()">交換 N／S</button>
                                    <button class="generator-action" style="grid-column:1 / -1;" onclick="resetGen3D()">回到初始狀態</button>
                                </div>
                            </div>
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">外電路輸出</span>
                                <div class="generator-segmented" aria-label="選擇集電裝置">
                                    <button id="gen3d-collector-ac" class="active" aria-pressed="true" onclick="setGen3DCollector(true)">雙滑環・AC</button>
                                    <button id="gen3d-collector-dc" aria-pressed="false" onclick="setGen3DCollector(false)">換向器・DC</button>
                                </div>
                                <div class="generator-control">
                                    <div class="generator-control-head"><label for="gen3d-speed-slider">線圈轉速</label><output id="gen3d-speed-value">1.6×</output></div>
                                    <input id="gen3d-speed-slider" type="range" min="0.4" max="3.2" step="0.1" value="1.6" oninput="setGen3DOmega(this.value)">
                                </div>
                                <div class="generator-control">
                                    <div class="generator-control-head"><label for="gen3d-zoom-slider">觀察距離</label><output id="gen3d-zoom-val">中</output></div>
                                    <input id="gen3d-zoom-slider" type="range" min="120" max="240" step="5" value="205" oninput="gen3DState.camDist=+this.value; updateGen3DCamera();">
                                </div>
                            </div>
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">圖層</span>
                                <div class="generator-toggle-list">
                                    <label class="generator-toggle"><input type="checkbox" checked onchange="gen3DState.showField=this.checked; syncGen3DVisuals();">磁場箭頭</label>
                                    <label class="generator-toggle"><input type="checkbox" checked onchange="gen3DState.showCurrent=this.checked; syncGen3DVisuals();">外電流</label>
                                    <label class="generator-toggle"><input type="checkbox" checked onchange="gen3DState.showFlux=this.checked; syncGen3DVisuals();">線圈面</label>
                                    <label class="generator-toggle"><input type="checkbox" onchange="gen3DState.transparentMagnets=this.checked; syncGen3DMagnetOpacity();">磁極透明</label>
                                    <label class="generator-toggle"><input type="checkbox" onchange="gen3DState.trackCamera=this.checked; updateGen3DCamera();">跟隨線圈</label>
                                </div>
                            </div>
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">即時物理量</span>
                                <div class="generator-meter-grid">
                                    <div class="generator-meter"><span class="generator-meter-label">穿過線圈的磁力線</span><span class="generator-meter-value" id="gen3d-flux-value">—</span></div>
                                    <div class="generator-meter"><span class="generator-meter-label">感應電流大小</span><span class="generator-meter-value" id="gen3d-emf-value">—</span></div>
                                    <div class="generator-meter"><span class="generator-meter-label">感應電流 I（外電路）</span><span class="generator-meter-value" id="gen3d-output-value">0.00 Imax</span></div>
                                    <div class="generator-meter"><span class="generator-meter-label">負載亮度</span><span class="generator-meter-value" id="gen3d-load-value">0%</span></div>
                                </div>
                                <svg class="generator-wave" viewBox="0 0 220 62" role="img" aria-label="一週期輸出波形">
                                    <line x1="4" y1="31" x2="216" y2="31" stroke="#cbd9e3" stroke-width="1"/>
                                    <path id="gen3d-wave-path" d="" fill="none" stroke="#2878d0" stroke-width="2.5" stroke-linecap="round"/>
                                    <circle id="gen3d-wave-marker" cx="4" cy="31" r="4" fill="#df5b62" stroke="#fff" stroke-width="2"/>
                                </svg>
                            </div>
                        </aside>
                    </div>
                    <div class="sim-readout" id="gen3d-sim-readout" style="padding:0 1rem 0.85rem; margin-top:0;"></div>
                    <div class="generator-explanation">
                        <div class="generator-explanation-item"><span class="generator-step-number">1</span><div><strong>用電流環繞方向判斷磁場</strong><br>銀白色導線以單匝代表實機的多匝線圈，讓完整走線可直接追蹤；紅色箭頭表示線圈中「此刻」的感應電流。右手四指順著電流環繞，大拇指所指即為線圈磁場方向。</div></div>
                        <div class="generator-explanation-item"><span class="generator-step-number">2</span><div><strong>產生感應電流</strong><br>穿過線圈的磁力線數目變化越快，感應電流越大；數目達極值（線圈正對磁極）時變化率為零，感應電流瞬間為零、並在此換向。</div></div>
                        <div class="generator-explanation-item"><span class="generator-step-number">3</span><div><strong>送入外電路</strong><br>兩條絕緣引線沿轉軸兩側連到集電環，與線圈共同旋轉；固定碳刷再把電流送往負載燈泡。</div></div>
                    </div>
                </div>
            `;
        }

        const gen3DState = {
            scene: null, camera: null, renderer: null, raf: null,
            phi: 0, omega: 1.6, dir: 1, poleDir: 1, playing: true, lastTs: 0, clock: null,
            trackCamera: false, slipRings: true, showField: true, showCurrent: true,
            showFlux: true, transparentMagnets: false,
            camDist: 205, theta: 0.22, elev: 0.58, dragging: false, lastX: 0, lastY: 0,
            magN: null, magS: null, rotorGroup: null, coilFace: null,
            ringACGroup: null, ringDCGroup: null, circuitACGroup: null, circuitDCGroup: null,
            fieldGroup: null, currentGroup: null, iArrows: [], coilCurrentMarkers: [], matN: null, matS: null,
            bulbLight: null, bulbGlassMat: null, filamentMat: null,
            _onDown: null, _onMove: null, _onUp: null, _resizeObserver: null, instanceId: 0
        };

        function dispose3DGenerator() {
            const s = gen3DState;
            s.instanceId += 1;
            if (s.raf) cancelAnimationFrame(s.raf);
            s.raf = null;
            s.lastTs = 0;
            s.clock = null;
            if (s._resizeObserver) s._resizeObserver.disconnect();
            s._resizeObserver = null;
            const canvas = s.renderer && s.renderer.domElement;
            if (canvas && s._onDown) canvas.removeEventListener('pointerdown', s._onDown);
            if (canvas && s._onMove) canvas.removeEventListener('pointermove', s._onMove);
            if (canvas && s._onUp) {
                canvas.removeEventListener('pointerup', s._onUp);
                canvas.removeEventListener('pointercancel', s._onUp);
            }
            s._onDown = s._onMove = s._onUp = null;
            PhysicsRuntime.disposeThreeScene(s.scene, s.renderer);
            s.renderer = null;
            s.scene = null;
            s.camera = null;
            s.magN = s.magS = s.rotorGroup = s.coilFace = null;
            s.ringACGroup = s.ringDCGroup = s.circuitACGroup = s.circuitDCGroup = null;
            s.fieldGroup = s.currentGroup = null;
            s.iArrows = [];
            s.coilCurrentMarkers = [];
        }

        function init3DGenerator() {
            const canvas = document.getElementById('gen3d-canvas');
            const viewport = document.getElementById('gen3d-viewport');
            const fallback = document.getElementById('gen3d-fallback');
            if (!canvas || !viewport) return;
            if (!window.THREE) {
                canvas.style.display = 'none';
                if (fallback) {
                    fallback.style.display = 'block';
                    fallback.textContent = '正在載入 3D 引擎…';
                }
                PhysicsRuntime.loadThree().then(() => {
                    if (document.getElementById('gen3d-canvas') === canvas) init3DGenerator();
                }).catch(error => {
                    if (fallback) fallback.textContent = `3D 引擎載入失敗：${error.message}`;
                });
                return;
            }
            canvas.style.display = 'block';
            if (fallback) fallback.style.display = 'none';
            dispose3DGenerator();
            registerViewDisposer(dispose3DGenerator);

            const THREE = window.THREE;
            const s = gen3DState;
            if (PhysicsRuntime.prefersReducedMotion()) s.playing = false;
            const copperMat = new THREE.MeshStandardMaterial({ color: 0xbd6b24, metalness: 0.72, roughness: 0.24 });
            const darkCopperMat = new THREE.MeshStandardMaterial({ color: 0x8f5428, metalness: 0.55, roughness: 0.34 });
            const rotorLeadMatA = new THREE.MeshBasicMaterial({ color: 0x8a4fd2 });
            const rotorLeadMatB = new THREE.MeshBasicMaterial({ color: 0x00a18a });
            const leadGuideMat = new THREE.MeshStandardMaterial({
                color: 0xe7f1f6,
                metalness: 0.02,
                roughness: 0.68,
                transparent: true,
                opacity: 0.42,
                depthWrite: false
            });
            const steelMat = new THREE.MeshStandardMaterial({ color: 0x8597a6, metalness: 0.62, roughness: 0.3 });
            const carbonMat = new THREE.MeshStandardMaterial({ color: 0x394c5c, metalness: 0.08, roughness: 0.72 });

            const makeCylinderBetween = (from, to, radius, material, radial = 12) => {
                const delta = new THREE.Vector3().subVectors(to, from);
                const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), radial), material);
                mesh.position.copy(from).add(to).multiplyScalar(0.5);
                mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
                return mesh;
            };
            const makeWirePath = (points, material, radius = 0.035) => {
                const group = new THREE.Group();
                for (let index = 0; index < points.length - 1; index += 1) {
                    group.add(makeCylinderBetween(points[index], points[index + 1], radius, material, 10));
                }
                return group;
            };
            const makeLabel = (text, color) => {
                const labelCanvas = document.createElement('canvas');
                labelCanvas.width = 128;
                labelCanvas.height = 128;
                const ctx = labelCanvas.getContext('2d');
                ctx.fillStyle = 'rgba(255,255,255,0.94)';
                ctx.beginPath();
                ctx.arc(64, 64, 46, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 8;
                ctx.stroke();
                ctx.fillStyle = color;
                ctx.font = '900 58px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 64, 69);
                const texture = new THREE.CanvasTexture(labelCanvas);
                if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
                sprite.scale.set(0.72, 0.72, 0.72);
                return sprite;
            };

            s.scene = new THREE.Scene();
            s.scene.background = new THREE.Color(0xf3f8fb);
            s.scene.fog = new THREE.Fog(0xf3f8fb, 12, 24);
            s.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
            s.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
            s.renderer.setClearColor(0xf3f8fb, 1);
            s.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            if ('outputColorSpace' in s.renderer && THREE.SRGBColorSpace) s.renderer.outputColorSpace = THREE.SRGBColorSpace;
            s.renderer.shadowMap.enabled = true;
            s.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            s.scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c8d3, 1.25));
            const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
            keyLight.position.set(5, 9, 7);
            keyLight.castShadow = true;
            s.scene.add(keyLight);
            const fillLight = new THREE.DirectionalLight(0xb7dcff, 0.55);
            fillLight.position.set(-7, 3, -5);
            s.scene.add(fillLight);

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(10.8, 0.22, 7.2),
                new THREE.MeshStandardMaterial({ color: 0xdfeaf0, roughness: 0.78, metalness: 0.02 })
            );
            base.position.y = -1.72;
            base.receiveShadow = true;
            s.scene.add(base);
            const baseEdge = new THREE.LineSegments(
                new THREE.EdgesGeometry(base.geometry),
                new THREE.LineBasicMaterial({ color: 0xa7bdcc })
            );
            baseEdge.position.copy(base.position);
            s.scene.add(baseEdge);
            const grid = new THREE.GridHelper(10, 10, 0xb8ccd9, 0xd4e1e8);
            grid.position.y = -1.595;
            s.scene.add(grid);

            const magGeo = new THREE.BoxGeometry(1.35, 3.05, 3.8);
            const shoeGeo = new THREE.BoxGeometry(0.52, 2.25, 3.0);
            s.matN = new THREE.MeshStandardMaterial({ color: 0xcd4e58, roughness: 0.48, metalness: 0.04 });
            s.matS = new THREE.MeshStandardMaterial({ color: 0x2f75b9, roughness: 0.48, metalness: 0.04 });
            const makePole = (material, label, labelColor) => {
                const group = new THREE.Group();
                const block = new THREE.Mesh(magGeo, material);
                const shoe = new THREE.Mesh(shoeGeo, material);
                block.castShadow = shoe.castShadow = true;
                group.add(block, shoe);
                const tag = makeLabel(label, labelColor);
                tag.position.set(0, 0.9, 2.0);
                group.add(tag);
                group.userData.shoe = shoe;
                return group;
            };
            s.magN = makePole(s.matN, 'N', '#c9464f');
            s.magS = makePole(s.matS, 'S', '#2c70b5');
            s.magN.userData.shoe.position.x = 0.86;
            s.magS.userData.shoe.position.x = -0.86;
            s.scene.add(s.magN, s.magS);

            s.fieldGroup = new THREE.Group();
            for (const y of [-0.72, 0, 0.72]) {
                for (const z of [-1.05, 0, 1.05]) {
                    const arrow = new THREE.ArrowHelper(
                        new THREE.Vector3(1, 0, 0),
                        new THREE.Vector3(-2.5, y, z),
                        5,
                        0x008f75,
                        0.42,
                        0.24
                    );
                    arrow.line.material.transparent = false;
                    arrow.line.material.opacity = 1;
                    arrow.cone.material.transparent = false;
                    arrow.cone.material.opacity = 1;
                    s.fieldGroup.add(arrow);
                }
            }
            s.scene.add(s.fieldGroup);

            // 旋轉軸只保留軸承附近的上下短軸，避免長桿遮住線圈與電流箭頭。
            const shaftBack = makeCylinderBetween(
                new THREE.Vector3(0, 0, -2.5),
                new THREE.Vector3(0, 0, -1.72),
                0.065,
                steelMat,
                18
            );
            const shaftFront = makeCylinderBetween(
                new THREE.Vector3(0, 0, 1.72),
                new THREE.Vector3(0, 0, 3.0),
                0.065,
                steelMat,
                18
            );
            shaftBack.castShadow = shaftFront.castShadow = true;
            s.scene.add(shaftBack, shaftFront);
            for (const z of [-2.0, 2.75]) {
                const stand = makeCylinderBetween(
                    new THREE.Vector3(0, -1.58, z),
                    new THREE.Vector3(0, -0.42, z),
                    0.075,
                    steelMat,
                    16
                );
                const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.075, 10, 24), carbonMat);
                bearing.position.set(0, 0, z);
                s.scene.add(stand, bearing);
            }

            s.rotorGroup = new THREE.Group();
            const halfX = 1.36;
            const halfZ = 1.5;
            const terminalGap = 0.24;
            // 單匝代表線圈：A、B 在近側中央留出缺口，導線路徑可由肉眼從頭追到尾。
            const windingPoints = [
                new THREE.Vector3(terminalGap, 0, halfZ),
                new THREE.Vector3(halfX, 0, halfZ),
                new THREE.Vector3(halfX, 0, -halfZ),
                new THREE.Vector3(-halfX, 0, -halfZ),
                new THREE.Vector3(-halfX, 0, halfZ),
                new THREE.Vector3(-terminalGap, 0, halfZ)
            ];
            const visibleCoilMat = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                roughness: 0.24,
                metalness: 0.72,
                emissive: 0x334155,
                emissiveIntensity: 0.08
            });
            const continuousWinding = makeWirePath(windingPoints, visibleCoilMat, 0.065);
            s.rotorGroup.add(continuousWinding);

            s.coilCurrentMarkers = [];
            const windingMarkerMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, depthTest: false, transparent: true, opacity: 1 });
            const addWindingMarker = (from, to, positionRatio = 0.55) => {
                const direction = new THREE.Vector3().subVectors(to, from).normalize();
                const marker = new THREE.Group();
                const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 14), windingMarkerMat);
                shaft.position.y = -0.06;
                const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.32, 18), windingMarkerMat);
                head.position.y = 0.24;
                shaft.renderOrder = head.renderOrder = 8;
                marker.add(shaft, head);
                marker.position.copy(from).lerp(to, positionRatio);
                marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
                marker.userData.positiveDirection = direction.clone();
                marker.userData.materials = [shaft.material, head.material];
                s.coilCurrentMarkers.push(marker);
                s.rotorGroup.add(marker);
            };
            // 箭頭貼在單匝導線的每一段；近側因 A、B 缺口分為左右兩段。
            for (let markerIndex = 0; markerIndex < windingPoints.length - 1; markerIndex += 1) {
                const from = windingPoints[markerIndex];
                const to = windingPoints[markerIndex + 1];
                addWindingMarker(from, to, 0.5);
            }

            const terminalA = windingPoints[0].clone();
            const terminalB = windingPoints[windingPoints.length - 1].clone();
            const terminalAVisual = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), rotorLeadMatA);
            terminalAVisual.position.copy(terminalA);
            const terminalBVisual = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), rotorLeadMatB);
            terminalBVisual.position.copy(terminalB);
            const terminalATag = makeLabel('A', '#8a4fd2');
            terminalATag.scale.set(0.3, 0.3, 0.3);
            terminalATag.position.copy(terminalA).add(new THREE.Vector3(0.16, 0.12, 0.08));
            const terminalBTag = makeLabel('B', '#008b78');
            terminalBTag.scale.set(0.3, 0.3, 0.3);
            terminalBTag.position.copy(terminalB).add(new THREE.Vector3(0.14, 0.12, 0.08));
            s.rotorGroup.add(terminalAVisual, terminalBVisual, terminalATag, terminalBTag);

            s.coilFace = new THREE.Mesh(
                new THREE.PlaneGeometry(halfX * 2, halfZ * 2),
                new THREE.MeshBasicMaterial({ color: 0x54b9df, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
            );
            s.coilFace.rotation.x = Math.PI / 2;
            s.rotorGroup.add(s.coilFace);
            const normArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.35, 0x2878d0, 0.25, 0.13);
            s.rotorGroup.add(normArrow);

            s.ringACGroup = new THREE.Group();
            const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 12, 36), copperMat);
            const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 12, 36), copperMat);
            ring1.position.z = 1.9;
            ring2.position.z = 2.32;
            const acLead1 = makeWirePath([
                terminalA,
                new THREE.Vector3(0.28, 0.1, 1.7),
                new THREE.Vector3(0.25, 0.02, 1.9)
            ], rotorLeadMatA, 0.038);
            const acLead2 = makeWirePath([
                terminalB,
                new THREE.Vector3(-0.28, -0.1, 1.82),
                new THREE.Vector3(-0.25, -0.02, 2.32)
            ], rotorLeadMatB, 0.038);
            const acGuide1 = makeCylinderBetween(
                new THREE.Vector3(0.25, 0.04, 1.66),
                new THREE.Vector3(0.25, 0.04, 1.84),
                0.052,
                leadGuideMat,
                12
            );
            const acGuide2 = makeCylinderBetween(
                new THREE.Vector3(-0.25, -0.04, 1.66),
                new THREE.Vector3(-0.25, -0.04, 2.24),
                0.052,
                leadGuideMat,
                12
            );
            s.ringACGroup.add(ring1, ring2, acLead1, acLead2, acGuide1, acGuide2);
            s.rotorGroup.add(s.ringACGroup);

            s.ringDCGroup = new THREE.Group();
            const dc1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.34, 28, 1, true, 0.08, Math.PI - 0.16), copperMat);
            const dc2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.34, 28, 1, true, Math.PI + 0.08, Math.PI - 0.16), copperMat);
            dc1.rotation.x = dc2.rotation.x = Math.PI / 2;
            dc1.position.z = dc2.position.z = 2.12;
            const dcLead1 = makeWirePath([
                terminalA,
                new THREE.Vector3(0.28, 0.1, 1.78),
                new THREE.Vector3(0.25, 0.02, 2.12)
            ], rotorLeadMatA, 0.038);
            const dcLead2 = makeWirePath([
                terminalB,
                new THREE.Vector3(-0.28, -0.1, 1.82),
                new THREE.Vector3(-0.25, -0.02, 2.12)
            ], rotorLeadMatB, 0.038);
            const dcGuide1 = makeCylinderBetween(
                new THREE.Vector3(0.25, 0.04, 1.66),
                new THREE.Vector3(0.25, 0.04, 2.03),
                0.052,
                leadGuideMat,
                12
            );
            const dcGuide2 = makeCylinderBetween(
                new THREE.Vector3(-0.25, -0.04, 1.66),
                new THREE.Vector3(-0.25, -0.04, 2.03),
                0.052,
                leadGuideMat,
                12
            );
            s.ringDCGroup.add(dc1, dc2, dcLead1, dcLead2, dcGuide1, dcGuide2);
            s.rotorGroup.add(s.ringDCGroup);
            s.scene.add(s.rotorGroup);

            const makeBrush = (position, size = [0.18, 0.2, 0.24]) => {
                const brush = new THREE.Mesh(new THREE.BoxGeometry(...size), carbonMat);
                brush.position.copy(position);
                return brush;
            };
            const circuitWireMat = new THREE.MeshBasicMaterial({ color: 0x314e62 });
            const loadZ = 3.25;
            const circuitY = -1.12;
            const loadLeft = new THREE.Vector3(-0.44, circuitY, loadZ);
            const loadRight = new THREE.Vector3(0.44, circuitY, loadZ);
            const leftFrontCorner = new THREE.Vector3(-1.85, circuitY, loadZ);
            const rightFrontCorner = new THREE.Vector3(1.85, circuitY, loadZ);
            s.circuitACGroup = new THREE.Group();
            const acBrush1Pos = new THREE.Vector3(0.34, 0, 1.9);
            const acBrush2Pos = new THREE.Vector3(-0.34, 0, 2.32);
            s.circuitACGroup.add(
                makeBrush(acBrush1Pos),
                makeBrush(acBrush2Pos),
                makeWirePath([
                    acBrush1Pos,
                    new THREE.Vector3(0.62, 0, 1.9),
                    new THREE.Vector3(0.62, circuitY, 1.9),
                    new THREE.Vector3(1.85, circuitY, 1.9),
                    rightFrontCorner,
                    loadRight
                ], circuitWireMat, 0.05),
                makeWirePath([
                    acBrush2Pos,
                    new THREE.Vector3(-0.62, 0, 2.32),
                    new THREE.Vector3(-0.62, circuitY, 2.32),
                    new THREE.Vector3(-1.85, circuitY, 2.32),
                    leftFrontCorner,
                    loadLeft
                ], circuitWireMat, 0.05)
            );
            s.circuitDCGroup = new THREE.Group();
            const dcBrush1Pos = new THREE.Vector3(0.34, 0, 2.12);
            const dcBrush2Pos = new THREE.Vector3(-0.34, 0, 2.12);
            s.circuitDCGroup.add(
                makeBrush(dcBrush1Pos),
                makeBrush(dcBrush2Pos),
                makeWirePath([
                    dcBrush1Pos,
                    new THREE.Vector3(0.62, 0, 2.12),
                    new THREE.Vector3(0.62, circuitY, 2.12),
                    new THREE.Vector3(1.85, circuitY, 2.12),
                    rightFrontCorner,
                    loadRight
                ], circuitWireMat, 0.05),
                makeWirePath([
                    dcBrush2Pos,
                    new THREE.Vector3(-0.62, 0, 2.12),
                    new THREE.Vector3(-0.62, circuitY, 2.12),
                    new THREE.Vector3(-1.85, circuitY, 2.12),
                    leftFrontCorner,
                    loadLeft
                ], circuitWireMat, 0.05)
            );
            s.scene.add(s.circuitACGroup, s.circuitDCGroup);

            const loadGroup = new THREE.Group();
            const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xf7fafc, roughness: 0.72, metalness: 0.02 });
            const brassMat = new THREE.MeshStandardMaterial({ color: 0xc99431, roughness: 0.35, metalness: 0.58 });
            const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.24, 28), porcelainMat);
            socket.position.y = 0.03;
            const screwBase = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.28, 24), brassMat);
            screwBase.position.y = 0.27;
            s.bulbGlassMat = new THREE.MeshStandardMaterial({
                color: 0xffe58a,
                emissive: 0xf5b942,
                emissiveIntensity: 0,
                transparent: true,
                opacity: 0.86,
                roughness: 0.12,
                side: THREE.DoubleSide
            });
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.22, 24), s.bulbGlassMat);
            neck.position.y = 0.48;
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 30, 22), s.bulbGlassMat);
            bulb.scale.y = 1.12;
            bulb.position.y = 0.78;
            s.filamentMat = new THREE.MeshBasicMaterial({ color: 0x8f6f35 });
            const filament = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 8, 20, Math.PI), s.filamentMat);
            filament.position.y = 0.76;
            filament.rotation.z = Math.PI;
            const leadMat = new THREE.MeshBasicMaterial({ color: 0x6e7f8c });
            const filamentLead1 = makeCylinderBetween(
                new THREE.Vector3(-0.105, 0.39, 0),
                new THREE.Vector3(-0.105, 0.76, 0),
                0.012,
                leadMat,
                8
            );
            const filamentLead2 = makeCylinderBetween(
                new THREE.Vector3(0.105, 0.39, 0),
                new THREE.Vector3(0.105, 0.76, 0),
                0.012,
                leadMat,
                8
            );
            const leftTerminal = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 0.16), brassMat);
            leftTerminal.position.set(-0.44, 0, 0);
            const rightTerminal = leftTerminal.clone();
            rightTerminal.position.x = 0.44;
            for (const y of [0.17, 0.24, 0.31, 0.38]) {
                const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.014, 8, 28), brassMat);
                ridge.rotation.x = Math.PI / 2;
                ridge.position.y = y;
                loadGroup.add(ridge);
            }
            s.bulbLight = new THREE.PointLight(0xffc84d, 0, 3.5);
            s.bulbLight.position.y = 0.78;
            loadGroup.add(
                socket,
                screwBase,
                neck,
                bulb,
                filament,
                filamentLead1,
                filamentLead2,
                leftTerminal,
                rightTerminal,
                s.bulbLight
            );
            loadGroup.position.set(0, circuitY, loadZ);
            s.scene.add(loadGroup);

            s.currentGroup = new THREE.Group();
            const makeCurrentArrow = (from, to) => {
                const direction = new THREE.Vector3().subVectors(to, from).normalize();
                const center = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
                center.y += 0.13;
                const origin = center.clone().addScaledVector(direction, -0.35);
                const arrow = new THREE.ArrowHelper(direction, origin, 0.7, 0xe11d48, 0.27, 0.16);
                const shaft = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.045, 0.045, 0.7, 12),
                    new THREE.MeshBasicMaterial({ color: 0xe11d48, depthTest: false })
                );
                shaft.position.y = 0.35;
                shaft.renderOrder = 9;
                arrow.add(shaft);
                arrow.line.visible = false;
                arrow.cone.material.depthTest = false;
                arrow.cone.renderOrder = 10;
                arrow.userData.positiveDirection = direction.clone();
                arrow.userData.segmentCenter = center;
                arrow.cone.material.transparent = true;
                arrow.userData.shaft = shaft;
                return arrow;
            };
            s.iArrows = [
                makeCurrentArrow(rightFrontCorner, loadRight),
                makeCurrentArrow(loadLeft, leftFrontCorner)
            ];
            s.currentGroup.add(...s.iArrows);
            s.scene.add(s.currentGroup);

            s._onDown = event => {
                s.dragging = true;
                s.lastX = event.clientX;
                s.lastY = event.clientY;
                canvas.setPointerCapture(event.pointerId);
            };
            s._onMove = event => {
                if (!s.dragging) return;
                const dx = event.clientX - s.lastX;
                const dy = event.clientY - s.lastY;
                s.lastX = event.clientX;
                s.lastY = event.clientY;
                s.theta -= dx * 0.008;
                s.elev = Math.max(-0.3, Math.min(1.05, s.elev - dy * 0.008));
                updateGen3DCamera();
                syncGen3DVisuals();
            };
            s._onUp = event => {
                s.dragging = false;
                if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
            };
            canvas.addEventListener('pointerdown', s._onDown);
            canvas.addEventListener('pointermove', s._onMove);
            canvas.addEventListener('pointerup', s._onUp);
            canvas.addEventListener('pointercancel', s._onUp);

            const resize = () => {
                if (!s.renderer || !s.camera) return;
                const rect = viewport.getBoundingClientRect();
                const width = Math.max(320, Math.round(rect.width));
                const height = Math.max(340, Math.round(rect.height));
                s.renderer.setSize(width, height, false);
                s.camera.aspect = width / height;
                s.camera.updateProjectionMatrix();
                syncGen3DVisuals();
            };
            s._resizeObserver = new ResizeObserver(resize);
            s._resizeObserver.observe(viewport);

            syncGen3DRings();
            syncGen3DMagnetOpacity();
            updateGen3DCamera();
            resize();
            updateGen3DReadout();
            s.lastTs = 0;
            s.clock = PhysicsRuntime.createFixedClock({ stepHz: 120 });
            const instanceId = s.instanceId;

            function loop(ts) {
                if (s.instanceId !== instanceId || !document.getElementById('gen3d-canvas') || !s.renderer) {
                    gen3DState.raf = null;
                    return;
                }
                s.clock.advance(ts, dt => {
                    if (s.playing) s.phi = (s.phi + s.omega * s.dir * dt + Math.PI * 2) % (Math.PI * 2);
                });
                syncGen3DVisuals();
                updateGen3DReadout();
                s.raf = requestAnimationFrame(loop);
            }
            s.raf = requestAnimationFrame(loop);
        }

        function syncGen3DRings() {
            const s = gen3DState;
            if (!s.ringACGroup || !s.ringDCGroup) return;
            s.ringACGroup.visible = s.slipRings;
            s.ringDCGroup.visible = !s.slipRings;
            if (s.circuitACGroup) s.circuitACGroup.visible = s.slipRings;
            if (s.circuitDCGroup) s.circuitDCGroup.visible = !s.slipRings;
            const acButton = document.getElementById('gen3d-collector-ac');
            const dcButton = document.getElementById('gen3d-collector-dc');
            if (acButton) {
                acButton.classList.toggle('active', s.slipRings);
                acButton.setAttribute('aria-pressed', String(s.slipRings));
            }
            if (dcButton) {
                dcButton.classList.toggle('active', !s.slipRings);
                dcButton.setAttribute('aria-pressed', String(!s.slipRings));
            }
        }

        function syncGen3DMagnetOpacity() {
            const s = gen3DState;
            if (!s.matN || !s.matS) return;
            [s.matN, s.matS].forEach(material => {
                material.transparent = s.transparentMagnets;
                material.opacity = s.transparentMagnets ? 0.42 : 1;
                material.depthWrite = !s.transparentMagnets;
            });
            syncGen3DVisuals();
        }

        function updateGen3DCamera() {
            const s = gen3DState;
            if (!s.camera) return;
            const radius = s.camDist / 20;
            const theta = s.trackCamera ? -s.phi - 0.78 : s.theta;
            s.camera.position.set(
                radius * Math.cos(s.elev) * Math.sin(theta),
                radius * Math.sin(s.elev) + 0.65,
                radius * Math.cos(s.elev) * Math.cos(theta)
            );
            s.camera.lookAt(0, -0.1, 0.45);
            const value = document.getElementById('gen3d-zoom-val');
            if (value) value.textContent = s.camDist < 150 ? '近' : s.camDist > 200 ? '遠' : '中';
        }

        function syncGen3DVisuals() {
            const s = gen3DState;
            if (!s.scene || !s.renderer || !s.camera || !s.rotorGroup) return;
            const THREE = window.THREE;
            const poleX = 3.35;
            s.magN.position.x = -poleX * s.poleDir;
            s.magS.position.x = poleX * s.poleDir;
            s.magN.userData.shoe.position.x = 0.86 * s.poleDir;
            s.magS.userData.shoe.position.x = -0.86 * s.poleDir;
            if (s.fieldGroup) {
                s.fieldGroup.visible = s.showField;
                const direction = new THREE.Vector3(s.poleDir, 0, 0);
                s.fieldGroup.children.forEach(arrow => {
                    arrow.setDirection(direction);
                    arrow.position.x = -2.5 * s.poleDir;
                });
            }
            s.rotorGroup.rotation.z = s.phi;
            const electrical = genElectricalState(s);
            if (s.coilFace) {
                s.coilFace.visible = s.showFlux;
                s.coilFace.material.opacity = 0.08 + Math.abs(electrical.flux) * 0.24;
                s.coilFace.material.color.set(electrical.flux >= 0 ? 0x54b9df : 0xdf78a8);
            }
            const arrowVisible = s.showCurrent && Math.abs(electrical.output) > 0.08;
            if (s.currentGroup) s.currentGroup.visible = arrowVisible;
            if (s.coilCurrentMarkers.length) {
                // 正輸出時電流由 A 端流出至外電路，因此線圈內部沿 B → A 流動；
                // 這樣線圈箭頭、引線、燈泡旁箭頭可連成同一個閉合迴路。
                const coilSign = electrical.output >= 0 ? -1 : 1;
                const coilMagnitude = Math.abs(electrical.normalizedCurrent);
                s.coilCurrentMarkers.forEach(marker => {
                    marker.visible = arrowVisible;
                    const direction = marker.userData.positiveDirection.clone().multiplyScalar(coilSign);
                    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
                    marker.userData.materials.forEach(material => {
                        material.opacity = 0.72 + coilMagnitude * 0.28;
                    });
                });
            }
            if (s.iArrows.length === 2) {
                const sign = electrical.output >= 0 ? 1 : -1;
                const magnitude = Math.abs(electrical.normalizedCurrent);
                s.iArrows.forEach(arrow => {
                    const direction = arrow.userData.positiveDirection.clone().multiplyScalar(sign);
                    const length = 0.38 + magnitude * 0.48;
                    arrow.userData.currentDirection = direction.clone();
                    arrow.userData.currentLength = length;
                    arrow.setDirection(direction);
                    arrow.position.copy(arrow.userData.segmentCenter).addScaledVector(direction, -length * 0.5);
                    arrow.setLength(length, 0.23 + magnitude * 0.09, 0.13 + magnitude * 0.05);
                    if (arrow.userData.shaft) {
                        arrow.userData.shaft.position.y = length * 0.5;
                        arrow.userData.shaft.scale.y = length / 0.7;
                        arrow.userData.shaft.material.opacity = 0.72 + magnitude * 0.28;
                        arrow.userData.shaft.material.transparent = magnitude < 0.99;
                    }
                    arrow.cone.material.opacity = 0.72 + magnitude * 0.28;
                });
            }
            if (s.bulbLight && s.bulbGlassMat && s.filamentMat) {
                s.bulbLight.intensity = electrical.brightness * 3.2;
                s.bulbGlassMat.emissiveIntensity = electrical.brightness * 2.1;
                s.filamentMat.color.set(electrical.brightness > 0.12 ? 0xffb51f : 0x8f6f35);
            }
            if (s.trackCamera) updateGen3DCamera();
            s.renderer.render(s.scene, s.camera);
        }

        function updateGen3DWaveform(electrical) {
            const s = gen3DState;
            const path = document.getElementById('gen3d-wave-path');
            const marker = document.getElementById('gen3d-wave-marker');
            if (!path || !marker) return;
            const points = [];
            for (let index = 0; index <= 100; index += 1) {
                const phase = index / 100 * Math.PI * 2;
                const ac = -Math.cos(phase) * s.dir * s.poleDir;
                const value = s.slipRings ? ac : Math.abs(ac);
                points.push(`${index === 0 ? 'M' : 'L'} ${(4 + index * 2.12).toFixed(1)} ${(31 - value * 22).toFixed(1)}`);
            }
            path.setAttribute('d', points.join(' '));
            const phase = ((s.phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            marker.setAttribute('cx', (4 + phase / (Math.PI * 2) * 212).toFixed(1));
            marker.setAttribute('cy', (31 - electrical.normalizedOutput * 22).toFixed(1));
        }

        function updateGen3DReadout() {
            const s = gen3DState;
            const electrical = genElectricalState(s);
            const setText = (id, text) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            };
            const fluxMag = Math.abs(electrical.flux);
            setText('gen3d-flux-value', fluxMag > 0.92 ? '最多' : fluxMag < 0.08 ? '最少' : '中等');
            const emfMag = Math.abs(electrical.normalizedEmf);
            setText('gen3d-emf-value', emfMag > 0.92 ? '最大' : emfMag < 0.08 ? '接近零' : '中等');
            setText(
                'gen3d-output-value',
                `${electrical.normalizedCurrent >= 0 ? '+' : ''}${electrical.normalizedCurrent.toFixed(2)} Imax`
            );
            setText('gen3d-load-value', `${Math.round(electrical.brightness * 100)}%`);
            setText('gen3d-speed-value', `${s.omega.toFixed(1)}×`);
            setText('gen3d-status', s.playing ? '運轉中' : '已暫停');
            const playButton = document.getElementById('gen3d-play-btn');
            if (playButton) playButton.textContent = s.playing ? '暫停' : '播放';
            const derivative = s.poleDir * Math.cos(s.phi) * s.omega * s.dir;
            const fluxText = Math.abs(derivative) < 0.06 ? '位於極值，瞬間不變' : derivative > 0 ? '正在增加' : '正在減少';
            const emfText = Math.abs(electrical.normalizedEmf) > 0.92 ? '接近最大' : Math.abs(electrical.normalizedEmf) < 0.08 ? '接近零' : '中等';
            const ro = document.getElementById('gen3d-sim-readout');
            if (ro) {
                ro.innerHTML = `
                    <span class="sim-chip">穿過線圈的磁力線：<b>${fluxText}</b></span>
                    <span class="sim-chip">感應電流大小：<b>${emfText}</b></span>
                    <span class="sim-chip" style="border-left:4px solid #2878d0;">外電流：<b>${Math.abs(electrical.normalizedCurrent).toFixed(2)} Imax・${s.slipRings ? (electrical.normalizedCurrent >= 0 ? '正向' : '反向') : '單向脈動'}</b></span>`;
            }
            updateGen3DWaveform(electrical);
        }

        function setGen3DCollector(useSlipRings) {
            gen3DState.slipRings = Boolean(useSlipRings);
            generatorState.slipRings = gen3DState.slipRings;
            syncGen3DRings();
            syncGen3DVisuals();
            updateGen3DReadout();
        }

        function setGen3DOmega(value) {
            gen3DState.omega = Math.max(0.4, Math.min(3.2, Number(value)));
            generatorState.omega = gen3DState.omega;
            updateGen3DReadout();
        }

        function stepGen3D(sgn) {
            gen3DState.playing = false;
            gen3DState.phi = (gen3DState.phi + sgn * gen3DState.dir * Math.PI / 18 + Math.PI * 2) % (Math.PI * 2);
            syncGen3DVisuals();
            updateGen3DReadout();
        }

        function toggleGen3DPlay() {
            gen3DState.playing = !gen3DState.playing;
            gen3DState.lastTs = 0;
            if (gen3DState.clock) gen3DState.clock.reset();
            updateGen3DReadout();
        }

        function resetGen3D() {
            gen3DState.phi = 0;
            gen3DState.dir = 1;
            gen3DState.poleDir = 1;
            gen3DState.playing = false;
            gen3DState.lastTs = 0;
            if (gen3DState.clock) gen3DState.clock.reset();
            gen3DState.theta = 0.22;
            gen3DState.elev = 0.58;
            gen3DState.camDist = 205;
            gen3DState.trackCamera = false;
            const zoomSlider = document.getElementById('gen3d-zoom');
            if (zoomSlider) zoomSlider.value = String(gen3DState.camDist);
            const trackToggle = document.querySelector('.generator-toggle input[onchange*="trackCamera"]');
            if (trackToggle) trackToggle.checked = false;
            updateGen3DCamera();
            syncGen3DVisuals();
            updateGen3DReadout();
        }

        function swapGen3DPoles() {
            gen3DState.poleDir *= -1;
            generatorState.poleDir = gen3DState.poleDir;
            syncGen3DVisuals();
            updateGen3DReadout();
        }

        function flipGen3DDir() {
            gen3DState.dir *= -1;
            generatorState.dir = gen3DState.dir;
            syncGen3DVisuals();
            updateGen3DReadout();
        }

        function generator2DHtml() {
            const s = generatorState;
            return `
                <div class="generator-card" id="gen-sim-box">
                    <div class="generator-workspace">
                        <div class="generator-stage-column">
                            <div class="generator-stage-head">
                                <div class="generator-stage-title"><span class="generator-icon">↻</span><span>旋轉剖面與閉合電路</span></div>
                                <span class="generator-status-badge"><span class="generator-status-dot"></span><span id="gen2d-status">${s.playing ? '運轉中' : '已暫停'}</span></span>
                            </div>
                            <div class="generator-viewport">
                                <canvas class="generator-light-canvas" id="gen-sim-canvas" width="900" height="440" aria-label="發電機剖面、集電裝置與負載電路圖"></canvas>
                            </div>
                        </div>
                        <aside class="generator-side-panel" aria-label="剖面圖控制">
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">運轉控制</span>
                                <div class="generator-button-grid">
                                    <button class="generator-action primary" id="gen-play-btn" onclick="toggleGenPlay()">${s.playing ? '暫停' : '播放'}</button>
                                    <button class="generator-action" onclick="stepGen(1)">前進 10°</button>
                                    <button class="generator-action" onclick="flipGenDir()">反轉線圈</button>
                                    <button class="generator-action" onclick="swapGen2DPoles()">交換 N／S</button>
                                    <button class="generator-action" style="grid-column:1 / -1;" onclick="resetGen2D()">回到初始狀態</button>
                                </div>
                            </div>
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">集電裝置</span>
                                <div class="generator-segmented">
                                    <button id="gen2d-collector-ac" class="${s.slipRings ? 'active' : ''}" aria-pressed="${s.slipRings}" onclick="setGen2DCollector(true)">雙滑環・AC</button>
                                    <button id="gen2d-collector-dc" class="${s.slipRings ? '' : 'active'}" aria-pressed="${!s.slipRings}" onclick="setGen2DCollector(false)">換向器・DC</button>
                                </div>
                                <div class="generator-control">
                                    <div class="generator-control-head"><label for="gen2d-speed-slider">線圈轉速</label><output id="gen-val-omega">${s.omega.toFixed(1)}×</output></div>
                                    <input id="gen2d-speed-slider" type="range" min="0.4" max="3.2" step="0.1" value="${s.omega}" oninput="generatorState.omega=+this.value; updateGenReadout();">
                                </div>
                            </div>
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">圖層</span>
                                <div class="generator-toggle-list">
                                    <label class="generator-toggle"><input type="checkbox" ${s.showField ? 'checked' : ''} onchange="generatorState.showField=this.checked; drawGenerator();">磁場箭頭</label>
                                    <label class="generator-toggle"><input type="checkbox" ${s.showCurrent ? 'checked' : ''} onchange="generatorState.showCurrent=this.checked; drawGenerator();">電流方向</label>
                                    <label class="generator-toggle"><input type="checkbox" ${s.showMeter ? 'checked' : ''} onchange="generatorState.showMeter=this.checked; drawGenerator();">輸出波形</label>
                                </div>
                            </div>
                            <div class="generator-panel-section">
                                <span class="generator-panel-label">即時判讀</span>
                                <div class="generator-meter-grid">
                                    <div class="generator-meter"><span class="generator-meter-label">穿過線圈的磁力線</span><span class="generator-meter-value" id="gen2d-flux-value">—</span></div>
                                    <div class="generator-meter"><span class="generator-meter-label">感應電流大小</span><span class="generator-meter-value" id="gen2d-emf-value">—</span></div>
                                    <div class="generator-meter"><span class="generator-meter-label">輸出</span><span class="generator-meter-value" id="gen2d-output-value">${s.slipRings ? 'AC' : 'DC'}</span></div>
                                    <div class="generator-meter"><span class="generator-meter-label">負載亮度</span><span class="generator-meter-value" id="gen2d-load-value">0%</span></div>
                                </div>
                            </div>
                        </aside>
                    </div>
                    <div class="sim-readout" id="gen-sim-readout" style="padding:0 1rem 0.8rem; margin-top:0;"></div>
                    <div class="gen-quiz" id="gen-quiz" style="margin:0 1rem 1rem;">
                        <div class="sim-row" style="justify-content:space-between;">
                            <button class="generator-action" onclick="startGenQuiz()">出一題隨堂測驗</button>
                            <span class="gen-score" id="gen-score"></span>
                        </div>
                        <div id="gen-quiz-body"></div>
                    </div>
                    <div class="generator-explanation">
                        <div class="generator-explanation-item"><span class="generator-step-number">1</span><div><strong>辨認磁場</strong><br>磁場方向永遠由 N 極指向 S 極；交換磁極後，感應電流方向也跟著反轉。</div></div>
                        <div class="generator-explanation-item"><span class="generator-step-number">2</span><div><strong>辨認電流</strong><br>⊙ 表示電流流出紙面，⊗ 表示流入紙面；兩側導體方向相反。</div></div>
                        <div class="generator-explanation-item"><span class="generator-step-number">3</span><div><strong>辨認輸出</strong><br>雙滑環保留正負交替；換向器每半圈交換接點，使外電路維持單一方向。</div></div>
                    </div>
                </div>
            `;
        }

        // ===== 3D 電磁感應：磁場 B、運動 v、感應電流 I 三方向正交（需 Three.js，透過本地伺服器載入） =====
        // 幾何：兩條沿 z 的導軌（相距 d，沿 y 方向；上軌青、下軌粉）＋ 可沿 z 滑動的導體棒（沿 y 方向）
        // ＋ z=zFix 的固定端，磁場 B 沿 x（N→S）。棒沿 z 振盪 z(t)=zMid+zAmp·sin(phi)，
        // 這使「棒到固定端的距離」（回路涵蓋的面積）隨時間改變 ⇒ 穿過回路的磁力線數目改變
        // ⇒ 用冷次定律定出感應電流方向（沿棒的 y 方向）。物理判準沿用 genCurrent/genMagClass/genFluxTrend
        // 這組函式（同一套 cos/sin 相位數學，只是把「線圈轉動相位」換成「棒振盪相位」）——
        // 對學生呈現的解說全程只用「磁力線數目變化＋冷次定律」的必修語言，不寫 v×B 或 ε=BLv 公式。
        const IND3D = { d: 2.2, zAmp: 1.6, zFix: -2.6, railColorUp: 0x67e8f9, railColorDn: 0xf9a8d4 };
        IND3D.zMid = IND3D.zFix + IND3D.zAmp + 0.9;
        const induction3D = {
            scene: null, camera: null, renderer: null,
            rod: null, currentArrow: null, velocityArrow: null,
            raf: null, playing: true, phi: 0.6, dir: 1, speed: 1, clock: null,
            theta: -0.8, elev: 0.3, dragging: false, lastX: 0, lastY: 0,
            quiz: null, ansCount: 0, corrCount: 0, streak: 0,
            _onDown: null, _onMove: null, _onUp: null,
            _resizeObserver: null, instanceId: 0
        };

        function dispose3DInduction() {
            const s = induction3D;
            s.instanceId += 1;
            if (s.raf) cancelAnimationFrame(s.raf);
            s.raf = null;
            s.clock = null;
            if (s._resizeObserver) s._resizeObserver.disconnect();
            s._resizeObserver = null;
            const canvas = s.renderer && s.renderer.domElement;
            if (canvas && s._onDown) canvas.removeEventListener('pointerdown', s._onDown);
            if (s._onMove) window.removeEventListener('pointermove', s._onMove);
            if (s._onUp) window.removeEventListener('pointerup', s._onUp);
            PhysicsRuntime.disposeThreeScene(s.scene, s.renderer);
            s.renderer = null;
            s.scene = null;
            s.camera = null;
            s._onDown = s._onMove = s._onUp = null;
        }

        function init3DInduction() {
            const canvas = document.getElementById('ind3d-canvas');
            const fallback = document.getElementById('ind3d-fallback');
            if (!canvas) return;
            if (!window.THREE) {
                canvas.style.display = 'none';
                if (fallback) {
                    fallback.style.display = 'block';
                    fallback.textContent = '正在載入 3D 引擎…';
                }
                PhysicsRuntime.loadThree().then(() => {
                    if (document.getElementById('ind3d-canvas') === canvas) init3DInduction();
                }).catch(error => {
                    if (fallback) fallback.textContent = `3D 引擎載入失敗：${error.message}`;
                });
                return;
            }
            canvas.style.display = 'block';
            if (fallback) fallback.style.display = 'none';
            dispose3DInduction();
            registerViewDisposer(dispose3DInduction);

            const THREE = window.THREE;
            const s = induction3D;
            if (PhysicsRuntime.prefersReducedMotion()) s.playing = false;
            const viewport = document.getElementById('ind3d-viewport');
            if (!viewport) return;
            s.scene = new THREE.Scene();
            s.scene.background = new THREE.Color(0xf3f8fb);
            s.scene.fog = new THREE.Fog(0xf3f8fb, 12, 22);
            s.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            s.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            s.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

            s.scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c8d4, 1.15));
            const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(4, 6, 5); s.scene.add(dl);
            s.scene.add(new THREE.GridHelper(8, 8, 0xaec4d2, 0xd5e1e8));

            const group = new THREE.Group(); s.scene.add(group);

            const makePoleLabel = (text, color) => {
                const labelCanvas = document.createElement('canvas');
                labelCanvas.width = 128;
                labelCanvas.height = 128;
                const context = labelCanvas.getContext('2d');
                context.fillStyle = '#ffffff';
                context.beginPath();
                context.arc(64, 64, 50, 0, Math.PI * 2);
                context.fill();
                context.strokeStyle = color;
                context.lineWidth = 8;
                context.stroke();
                context.fillStyle = color;
                context.font = '800 58px sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(text, 64, 67);
                const texture = new THREE.CanvasTexture(labelCanvas);
                const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
                sprite.scale.set(0.95, 0.95, 0.95);
                sprite.renderOrder = 10;
                return sprite;
            };

            // 磁鐵：左側 N（紅）、右側 S（藍）
            const magGeo = new THREE.BoxGeometry(0.8, 1.7, 4.6);
            const magN = new THREE.Mesh(magGeo, new THREE.MeshStandardMaterial({ color: 0xdf5b62, roughness: 0.45 }));
            magN.position.set(-2.85, 0, -0.7);
            const magS = new THREE.Mesh(magGeo, new THREE.MeshStandardMaterial({ color: 0x4087cf, roughness: 0.45 }));
            magS.position.set(2.85, 0, -0.7);
            const labelN = makePoleLabel('N', '#bf4149');
            labelN.position.set(-3.3, 0, 0.35);
            const labelS = makePoleLabel('S', '#2869a7');
            labelS.position.set(3.3, 0, 0.35);
            group.add(magN, magS);
            s.scene.add(labelN, labelS);

            // 磁場箭頭（沿 +x，數列排開，穿過導軌所在區域）
            for (let zz = -2.2; zz <= 1.2; zz += 1.15) {
                for (let yy = -0.65; yy <= 0.65; yy += 1.3) {
                    group.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-2.05, yy, zz), 4.1, 0x60a5fa, 0.26, 0.13));
                }
            }

            // 導軌（上青、下粉，沿 z）
            const railLen = IND3D.zMid + IND3D.zAmp - IND3D.zFix + 0.6;
            const railMidZ = IND3D.zFix + railLen / 2 - 0.3;
            [[IND3D.d / 2, IND3D.railColorUp], [-IND3D.d / 2, IND3D.railColorDn]].forEach(([yy, col]) => {
                const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, railLen, 12), new THREE.MeshStandardMaterial({ color: col }));
                rail.rotation.x = Math.PI / 2;
                rail.position.set(0, yy, railMidZ);
                group.add(rail);
            });
            // 固定端（沿 y，z=zFix）—— CylinderGeometry 預設軸向即為 y，不需旋轉
            const fixBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, IND3D.d, 12), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
            fixBar.position.set(0, 0, IND3D.zFix);
            group.add(fixBar);

            // 導體棒（沿 y，可沿 z 滑動）—— 同樣不需旋轉
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, IND3D.d, 16), new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0x78350f, emissiveIntensity: 0.3 }));
            group.add(rod);
            s.rod = rod;

            // 回路面（半透明，直觀顯示「面積隨棒位置改變」＝磁力線數目改變）
            // 逐幀直接寫入 4 個角點世界座標（皆在 x=0 平面），避免旋轉矩陣換算出錯
            const loopGeo = new THREE.BufferGeometry();
            loopGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
            loopGeo.setIndex([0, 1, 2, 0, 2, 3]);
            const loopFace = new THREE.Mesh(loopGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.14, side: THREE.DoubleSide }));
            group.add(loopFace);
            s.loopFace = loopFace;

            // v（綠）、I（橘）箭頭，掛在棒上
            const velocityArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.05, 0x22c55e, 0.22, 0.12);
            const currentArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 0.95, 0xf97316, 0.22, 0.12);
            group.add(velocityArrow, currentArrow);
            s.velocityArrow = velocityArrow;
            s.currentArrow = currentArrow;

            group.add(new THREE.AxesHelper(0.9).translateX(-3.6).translateY(-1.5).translateZ(-3.2));

            const onDown = e => { s.dragging = true; s.lastX = e.clientX; s.lastY = e.clientY; };
            const onMove = e => {
                if (!s.dragging) return;
                const dx = e.clientX - s.lastX, dy = e.clientY - s.lastY;
                s.lastX = e.clientX; s.lastY = e.clientY;
                s.theta -= dx * 0.008;
                s.elev = Math.max(-1.2, Math.min(1.2, s.elev - dy * 0.008));
            };
            const onUp = () => { s.dragging = false; };
            canvas.addEventListener('pointerdown', onDown);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            s._onDown = onDown; s._onMove = onMove; s._onUp = onUp;

            const resize = () => {
                if (!s.renderer || !s.camera) return;
                const rect = viewport.getBoundingClientRect();
                const width = Math.max(320, Math.round(rect.width));
                const height = Math.max(340, Math.round(rect.height));
                s.renderer.setSize(width, height, false);
                s.camera.aspect = width / height;
                s.camera.updateProjectionMatrix();
            };
            s._resizeObserver = new ResizeObserver(resize);
            s._resizeObserver.observe(viewport);
            resize();

            syncInd3DVisuals();
            updateInd3DReadout();
            s.clock = PhysicsRuntime.createFixedClock({ stepHz: 120 });
            const R = 9.2;
            const instanceId = s.instanceId;
            function loop(ts) {
                if (s.instanceId !== instanceId || !document.getElementById('ind3d-canvas') || !s.renderer) {
                    induction3D.raf = null;
                    return;
                }
                const st = induction3D;
                let advanced = false;
                st.clock.advance(ts, dt => {
                    if (!st.playing || st.quiz) return;
                    st.phi += 1.1 * st.speed * dt;
                    if (st.phi > Math.PI * 2) st.phi -= Math.PI * 2;
                    advanced = true;
                });
                if (advanced) {
                    syncInd3DVisuals();
                    updateInd3DReadout();
                }
                st.camera.position.set(
                    R * Math.cos(st.elev) * Math.sin(st.theta),
                    R * Math.sin(st.elev) + 0.5,
                    R * Math.cos(st.elev) * Math.cos(st.theta)
                );
                st.camera.lookAt(0, 0, 0);
                st.renderer.render(st.scene, st.camera);
                induction3D.raf = requestAnimationFrame(loop);
            }
            induction3D.raf = requestAnimationFrame(loop);
        }

        // 依 phi/dir 更新棒位置與 v、I 箭頭（測驗未作答時隱藏電流箭頭）
        function syncInd3DVisuals() {
            const s = induction3D;
            if (!s.rod) return;
            const THREE = window.THREE;
            const z = IND3D.zMid + IND3D.zAmp * Math.sin(s.phi);
            s.rod.position.z = z;
            s.velocityArrow.position.set(0, 0, z);
            s.currentArrow.position.set(0, 0, z);
            const d2 = IND3D.d / 2;
            const arr = s.loopFace.geometry.attributes.position.array;
            arr[0] = 0; arr[1] = -d2; arr[2] = IND3D.zFix;
            arr[3] = 0; arr[4] = d2; arr[5] = IND3D.zFix;
            arr[6] = 0; arr[7] = d2; arr[8] = z;
            arr[9] = 0; arr[10] = -d2; arr[11] = z;
            s.loopFace.geometry.attributes.position.needsUpdate = true;
            s.loopFace.geometry.computeBoundingSphere();

            const vSign = Math.cos(s.phi) * s.dir >= 0 ? 1 : -1;
            s.velocityArrow.setDirection(new THREE.Vector3(0, 0, vSign));
            const speedMag = Math.min(Math.abs(Math.cos(s.phi)) * 1.3 + 0.15, 1.3);
            s.velocityArrow.setLength(speedMag, 0.2, 0.11);

            const hide = s.quiz && !s.quiz.answered;
            const cur = genCurrent(s.phi, s.dir);
            s.currentArrow.visible = !hide && Math.abs(cur) > 0.1;
            s.currentArrow.setDirection(new THREE.Vector3(0, cur >= 0 ? 1 : -1, 0));
        }

        function updateInd3DReadout() {
            const s = induction3D;
            const ro = document.getElementById('ind3d-readout');
            if (!ro) return;
            const cls = genMagClass(s.phi, s.dir);
            const magTxt = { max: '最大', zero: '幾乎為零（轉折點，瞬間靜止）', rising: '中等，正在變大', falling: '中等，正在變小' }[cls];
            const fluxTxt = genFluxTrend(s.phi, s.dir) > 0 ? '正在增加' : '正在減少';
            ro.innerHTML = `
                <span class="sim-chip">導體棒與磁場<b>${Math.abs(Math.cos(s.phi)) > 0.5 ? '接近垂直（切割較快）' : '接近平行（切割較慢）'}</b></span>
                <span class="sim-chip">回路涵蓋的磁力線數目：<b>${fluxTxt}</b></span>
                <span class="sim-chip">感應電流大小：<b>${magTxt}</b></span>`;
        }

        // ---- 3D 隨堂測驗（沿用 2D 的判準函式，UI 與紀錄鍵各自獨立） ----
        function start3DQuiz() {
            const s = induction3D;
            s.playing = false;
            const type = Math.random() < 0.5 ? 'mag' : 'dir';
            let phi, tries = 0;
            do { phi = Math.random() * Math.PI * 2; tries++; } while (tries < 200 && !genPhiClear(phi, s.dir, type));
            s.phi = phi;
            s.quiz = { type, answered: false };
            syncInd3DVisuals();
            render3DQuiz();
        }
        function render3DQuiz() {
            const s = induction3D, q = s.quiz;
            const body = document.getElementById('ind3d-quiz-body');
            if (!body) return;
            let opts;
            if (q.type === 'mag') {
                q.answer = genMagClass(s.phi, s.dir);
                opts = [['max', '最大'], ['zero', '幾乎為零'], ['rising', '中等，正在變大'], ['falling', '中等，正在變小']];
                body.innerHTML = `
                    <div class="gen-quiz-q">Q：畫面已暫停並隱藏電流箭頭（橘）。此刻導體棒中的<b>感應電流大小</b>是？</div>
                    <div class="gen-opts">${opts.map(([v, l]) => `<button class="gen-opt" data-v="${v}" onclick="answer3DQuiz('${v}')">${l}</button>`).join('')}</div>`;
            } else {
                q.answer = genCurrent(s.phi, s.dir) > 0 ? 'up' : 'dn';
                opts = [['up', '流向上軌（青色）'], ['dn', '流向下軌（粉色）']];
                body.innerHTML = `
                    <div class="gen-quiz-q">Q：畫面已暫停並隱藏電流箭頭（橘）。依冷次定律，此刻導體棒中的<b>感應電流方向</b>是？（棒沿綠色箭頭方向運動）</div>
                    <div class="gen-opts">${opts.map(([v, l]) => `<button class="gen-opt" data-v="${v}" onclick="answer3DQuiz('${v}')">${l}</button>`).join('')}</div>`;
            }
        }
        function answer3DQuiz(val) {
            const s = induction3D, q = s.quiz;
            if (!q || q.answered) return;
            q.answered = true;
            const ok = val === q.answer;
            s.ansCount++; if (ok) { s.corrCount++; s.streak++; } else { s.streak = 0; }
            recordResult('bank', 'ind3d#' + q.type, ok, 'N21');
            const body = document.getElementById('ind3d-quiz-body');
            body.querySelectorAll('.gen-opt').forEach(b => {
                b.disabled = true;
                if (b.dataset.v === q.answer) b.classList.add('correct');
                else if (b.dataset.v === val) b.classList.add('wrong');
            });
            syncInd3DVisuals();
            const expl = ind3DExplain(q);
            body.insertAdjacentHTML('beforeend', `
                <div class="sim-verdict ${ok ? 'ok' : 'no'}" style="margin-top:0.7rem;">${ok ? '✅ 答對了！' : '❌ 再想想'}　${expl}</div>
                <div class="sim-row" style="margin-top:0.6rem;"><button class="bank-chip-btn" onclick="start3DQuiz()">下一題 →</button><button class="bank-chip-btn" onclick="resume3D()">▶ 繼續播放</button></div>`);
            updateInd3DScore();
            updateInd3DReadout();
        }
        function ind3DExplain(q) {
            const s = induction3D;
            if (q.type === 'mag') {
                const map = {
                    max: '導體棒此刻與磁場<b>接近垂直</b>，正在<b>最快切割磁力線</b>，回路涵蓋的磁力線數目變化最快，感應電流<b>最大</b>。',
                    zero: '導體棒此刻運動到<b>轉折點</b>（瞬間速度為零），沒有切割磁力線，磁力線數目變化率為零，感應電流<b>為零</b>。',
                    rising: '導體棒正加速切割磁力線，回路涵蓋的磁力線數目<b>變化越來越快</b>，感應電流<b>正在變大</b>。',
                    falling: '導體棒正減速切割磁力線，回路涵蓋的磁力線數目<b>變化越來越慢</b>，感應電流<b>正在變小</b>。'
                };
                return map[q.answer];
            }
            const inc = genFluxTrend(s.phi, s.dir) > 0;
            const dirTxt = q.answer === 'up' ? '流向上軌（青色）' : '流向下軌（粉色）';
            return `棒往${Math.cos(s.phi) * s.dir >= 0 ? '遠離固定端' : '靠近固定端'}的方向移動，回路涵蓋的磁力線<b>${inc ? '正在增加' : '正在減少'}</b>；依<b>冷次定律</b>，感應電流要反抗這個變化，由此定出方向為 <b>${dirTxt}</b>。`;
        }
        function resume3D() {
            induction3D.quiz = null;
            const body = document.getElementById('ind3d-quiz-body');
            if (body) body.innerHTML = '';
            induction3D.playing = true;
            syncInd3DVisuals();
        }
        function updateInd3DScore() {
            const s = induction3D;
            const el = document.getElementById('ind3d-score');
            if (el) el.textContent = s.ansCount > 0 ? `已答 ${s.ansCount} 題・答對 ${s.corrCount} 題・連對 ${s.streak}` : '';
        }

        function toggleGenPlay() {
            generatorState.playing = !generatorState.playing;
            generatorState.lastTs = 0;
            if (generatorState.clock) generatorState.clock.reset();
            const b = document.getElementById('gen-play-btn');
            if (b) b.textContent = generatorState.playing ? '暫停' : '播放';
            updateGenReadout();
        }
        function stepGen(sgn) {
            generatorState.playing = false;
            const b = document.getElementById('gen-play-btn');
            if (b) b.textContent = '播放';
            generatorState.phi = (generatorState.phi + sgn * generatorState.dir * Math.PI / 18 + Math.PI * 2) % (Math.PI * 2);
            drawGenerator();
            updateGenReadout();
        }
        function flipGenDir() {
            generatorState.dir *= -1;
            gen3DState.dir = generatorState.dir;
            drawGenerator();
            updateGenReadout();
        }
        function swapGen2DPoles() {
            generatorState.poleDir *= -1;
            gen3DState.poleDir = generatorState.poleDir;
            drawGenerator();
            updateGenReadout();
        }
        function setGen2DCollector(useSlipRings) {
            generatorState.slipRings = Boolean(useSlipRings);
            gen3DState.slipRings = generatorState.slipRings;
            const acButton = document.getElementById('gen2d-collector-ac');
            const dcButton = document.getElementById('gen2d-collector-dc');
            if (acButton) {
                acButton.classList.toggle('active', generatorState.slipRings);
                acButton.setAttribute('aria-pressed', String(generatorState.slipRings));
            }
            if (dcButton) {
                dcButton.classList.toggle('active', !generatorState.slipRings);
                dcButton.setAttribute('aria-pressed', String(!generatorState.slipRings));
            }
            drawGenerator();
            updateGenReadout();
        }
        function resetGen2D() {
            generatorState.phi = 0;
            generatorState.dir = 1;
            generatorState.poleDir = 1;
            generatorState.playing = false;
            generatorState.lastTs = 0;
            if (generatorState.clock) generatorState.clock.reset();
            drawGenerator();
            updateGenReadout();
        }

        function updateGenReadout() {
            const s = generatorState;
            const electrical = genElectricalState(s);
            const setText = (id, text) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            };
            setText('gen-val-omega', `${s.omega.toFixed(1)}×`);
            const fluxMag2d = Math.abs(electrical.flux);
            setText('gen2d-flux-value', fluxMag2d > 0.92 ? '最多' : fluxMag2d < 0.08 ? '最少' : '中等');
            const emfMag2d = Math.abs(electrical.normalizedEmf);
            setText('gen2d-emf-value', emfMag2d > 0.92 ? '最大' : emfMag2d < 0.08 ? '接近零' : '中等');
            setText('gen2d-output-value', s.slipRings ? (electrical.output >= 0 ? 'AC 正向' : 'AC 反向') : 'DC 單向');
            setText('gen2d-load-value', `${Math.round(electrical.brightness * 100)}%`);
            setText('gen2d-status', s.playing ? '運轉中' : '已暫停');
            const playButton = document.getElementById('gen-play-btn');
            if (playButton) playButton.textContent = s.playing ? '暫停' : '播放';
            const ro = document.getElementById('gen-sim-readout');
            if (!ro) return;
            const derivative = s.poleDir * Math.cos(s.phi) * s.omega * s.dir;
            const fluxTxt = Math.abs(derivative) < 0.06 ? '位於極值，瞬間不變' : derivative > 0 ? '正在增加' : '正在減少';
            const magTxt = Math.abs(electrical.normalizedEmf) > 0.92 ? '接近最大' : Math.abs(electrical.normalizedEmf) < 0.08 ? '接近零' : '中等';
            ro.innerHTML = `
                <span class="sim-chip">穿過線圈的磁力線：<b>${fluxTxt}</b></span>
                <span class="sim-chip">感應電流大小：<b>${magTxt}</b></span>
                <span class="sim-chip" style="border-left:4px solid #2878d0;">外電路：<b>${s.slipRings ? '交流電 AC' : '單向脈動 DC'}</b></span>`;
        }

        // ---- 隨堂測驗 ----
        function startGenQuiz() {
            const s = generatorState;
            s.playing = false;
            const pb = document.getElementById('gen-play-btn');
            if (pb) pb.textContent = '▶ 播放';
            const type = Math.random() < 0.5 ? 'mag' : 'dir';
            // 挑一個「答案明確」的相位
            let phi, tries = 0;
            do {
                phi = Math.random() * Math.PI * 2;
                tries++;
            } while (tries < 200 && !genPhiClear(phi, s.dir, type));
            s.phi = phi;
            s.quiz = { type, answered: false };
            drawGenerator();
            renderGenQuiz();
        }
        // 出題相位是否「明確」（避開分類邊界，方向題避開換向點）
        function genPhiClear(phi, dir, type) {
            const mag = Math.abs(Math.cos(phi));
            if (type === 'dir') return mag > 0.4;               // 有明確流向
            // mag 題：落在四類的核心區
            if (mag >= 0.96) return true;                        // 最大
            if (mag <= 0.05) return true;                        // 零
            return mag > 0.35 && mag < 0.65;                     // 中等（漸增/漸減皆可）
        }
        function renderGenQuiz() {
            const s = generatorState, q = s.quiz;
            const body = document.getElementById('gen-quiz-body');
            if (!body) return;
            let opts;
            if (q.type === 'mag') {
                q.answer = genMagClass(s.phi, s.dir);
                opts = [['max', '最大'], ['zero', '幾乎為零'], ['rising', '中等，正在變大'], ['falling', '中等，正在變小']];
                body.innerHTML = `
                    <div class="gen-quiz-q">Q：畫面已暫停並隱藏電流指示。此刻線圈中的<b>感應電流大小</b>是？</div>
                    <div class="gen-opts">${opts.map(([v, l]) => `<button class="gen-opt" data-v="${v}" onclick="answerGenQuiz('${v}')">${l}</button>`).join('')}</div>`;
            } else {
                q.answer = genCurrent(s.phi, s.dir, s.poleDir) > 0 ? 'out' : 'in';
                opts = [['out', 'a 為 ⊙（電流流出紙面）'], ['in', 'a 為 ⊗（電流流入紙面）']];
                body.innerHTML = `
                    <div class="gen-quiz-q">Q：畫面已暫停並隱藏電流指示。依冷次定律，此刻導體 <b>a</b> 的感應電流方向是？</div>
                    <div class="gen-opts">${opts.map(([v, l]) => `<button class="gen-opt" data-v="${v}" onclick="answerGenQuiz('${v}')">${l}</button>`).join('')}</div>`;
            }
        }
        function answerGenQuiz(val) {
            const s = generatorState, q = s.quiz;
            if (!q || q.answered) return;
            q.answered = true;
            const ok = val === q.answer;
            s.ansCount++; if (ok) { s.corrCount++; s.streak++; } else { s.streak = 0; }
            recordResult('bank', 'gensim#' + q.type, ok, 'N21');   // 計入 N21 掌握度（非題庫題，不進錯題本）
            const body = document.getElementById('gen-quiz-body');
            body.querySelectorAll('.gen-opt').forEach(b => {
                b.disabled = true;
                if (b.dataset.v === q.answer) b.classList.add('correct');
                else if (b.dataset.v === val) b.classList.add('wrong');
            });
            // 顯示電流指示，讓學生對照畫面
            s.showCurrent = true; s.showMeter = true;
            const cc = document.querySelector('#gen-sim-box input[onchange*="showCurrent"]'); if (cc) cc.checked = true;
            const mc = document.querySelector('#gen-sim-box input[onchange*="showMeter"]'); if (mc) mc.checked = true;
            drawGenerator();
            const expl = genExplain(q);
            body.insertAdjacentHTML('beforeend', `
                <div class="sim-verdict ${ok ? 'ok' : 'no'}" style="margin-top:0.7rem;">${ok ? '✅ 答對了！' : '❌ 再想想'}　${expl}</div>
                <div class="sim-row" style="margin-top:0.6rem;"><button class="bank-chip-btn" onclick="startGenQuiz()">下一題 →</button><button class="bank-chip-btn" onclick="resumeGen()">▶ 繼續轉動</button></div>`);
            updateGenScore();
            updateGenReadout();
        }
        function genExplain(q) {
            const s = generatorState;
            if (q.type === 'mag') {
                const map = {
                    max: '線圈面正轉到<b>平行磁場</b>，兩導體邊正在<b>最快切割磁力線</b>，穿過線圈的磁力線數目變化最快，感應電流<b>最大</b>。',
                    zero: '線圈面正轉到<b>正對磁鐵</b>（磁力線穿過線圈最多），這一瞬間變化率為零，感應電流<b>為零</b>，也正是電流<b>換向</b>的時刻。',
                    rising: '線圈正從「正對磁鐵」轉向「平行磁場」，磁力線數目的變化<b>越來越快</b>，感應電流<b>正在變大</b>。',
                    falling: '線圈正從「平行磁場」轉向「正對磁鐵」，磁力線數目的變化<b>越來越慢</b>，感應電流<b>正在變小</b>。'
                };
                return map[q.answer];
            }
            const inc = genFluxTrend(s.phi, s.dir, s.poleDir) > 0;
            const dirTxt = q.answer === 'out' ? 'a 為 ⊙（流出紙面）' : 'a 為 ⊗（流入紙面）';
            return `此刻穿過線圈的磁力線<b>${inc ? '正在增加' : '正在減少'}</b>；依<b>冷次定律</b>，感應電流要製造<b>${inc ? '相反' : '同向'}</b>的磁場來反抗這個變化，由此定出線圈的繞行方向，得到 <b>${dirTxt}</b>。`;
        }
        function resumeGen() {
            generatorState.quiz = null;
            const body = document.getElementById('gen-quiz-body');
            if (body) body.innerHTML = '';
            generatorState.playing = true;
            const b = document.getElementById('gen-play-btn');
            if (b) b.textContent = '⏸ 暫停';
        }
        function updateGenScore() {
            const s = generatorState;
            const el = document.getElementById('gen-score');
            if (el) el.textContent = s.ansCount > 0 ? `已答 ${s.ansCount} 題・答對 ${s.corrCount} 題・連對 ${s.streak}` : '';
        }

        function initGeneratorSim() {
            const canvas = document.getElementById('gen-sim-canvas');
            if (!canvas) return;
            if (PhysicsRuntime.prefersReducedMotion()) generatorState.playing = false;
            if (generatorState.raf) cancelAnimationFrame(generatorState.raf);
            registerViewDisposer(() => {
                if (generatorState.raf) cancelAnimationFrame(generatorState.raf);
                generatorState.raf = null;
                generatorState.clock = null;
                generatorState._instanceId += 1;
                if (generatorState._resizeObserver) generatorState._resizeObserver.disconnect();
                generatorState._resizeObserver = null;
            });
            generatorState._instanceId += 1;
            const instanceId = generatorState._instanceId;
            if (generatorState._resizeObserver) generatorState._resizeObserver.disconnect();
            const resize = () => {
                const rect = canvas.getBoundingClientRect();
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const width = Math.max(320, Math.round(rect.width));
                const height = Math.max(340, Math.round(rect.height));
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
                canvas._cssWidth = width;
                canvas._cssHeight = height;
                canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
                drawGenerator();
            };
            generatorState._resizeObserver = new ResizeObserver(resize);
            generatorState._resizeObserver.observe(canvas);
            updateGenReadout();
            updateGenScore();
            generatorState.lastTs = 0;
            generatorState.clock = PhysicsRuntime.createFixedClock({ stepHz: 120 });
            function loop(ts) {
                if (generatorState._instanceId !== instanceId || !document.getElementById('gen-sim-canvas')) { generatorState.raf = null; return; }
                const s = generatorState;
                let advanced = false;
                s.clock.advance(ts, dt => {
                    if (!s.playing || s.quiz) return;
                    s.phi += s.omega * s.dir * dt;
                    if (s.phi > Math.PI * 2) s.phi -= Math.PI * 2;
                    if (s.phi < 0) s.phi += Math.PI * 2;
                    advanced = true;
                });
                if (advanced) {
                    drawGenerator();
                    updateGenReadout();
                }
                generatorState.raf = requestAnimationFrame(loop);
            }
            resize();
            generatorState.raf = requestAnimationFrame(loop);
        }

        function drawGenerator() {
            const canvas = document.getElementById('gen-sim-canvas');
            if (!canvas) return;
            const s = generatorState;
            const ctx = canvas.getContext('2d');
            const W = canvas._cssWidth || canvas.getBoundingClientRect().width || 900;
            const H = canvas._cssHeight || canvas.getBoundingClientRect().height || 440;
            const leftWidth = W * 0.59;
            const cx = leftWidth * 0.48;
            const cy = H * 0.48;
            const R = Math.min(H * 0.25, leftWidth * 0.2);
            const electrical = genElectricalState(s);
            const roundRect = (x, y, width, height, radius) => {
                const r = Math.min(radius, width / 2, height / 2);
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + width - r, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + r);
                ctx.lineTo(x + width, y + height - r);
                ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
                ctx.lineTo(x + r, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
            };
            const arrowHead = (x, y, direction, color, size = 7) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - direction * size, y - size * 0.62);
                ctx.lineTo(x - direction * size, y + size * 0.62);
                ctx.closePath();
                ctx.fill();
            };
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#f8fbfd';
            ctx.fillRect(0, 0, W, H);

            // 左側：磁極、磁場與旋轉線圈剖面
            ctx.fillStyle = '#153047';
            ctx.font = '800 14px "Noto Sans TC", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('線圈剖面', 18, 28);
            ctx.fillStyle = '#6b8192';
            ctx.font = '12px "Noto Sans TC", sans-serif';
            ctx.fillText('⊙ 流出紙面　⊗ 流入紙面', 18, 48);

            const magW = Math.max(50, Math.min(72, leftWidth * 0.13));
            const magH = Math.min(250, H * 0.62);
            const gapL = cx - R - 42;
            const gapR = cx + R + 42;
            const leftLabel = s.poleDir > 0 ? 'N' : 'S';
            const rightLabel = s.poleDir > 0 ? 'S' : 'N';
            const poleColor = label => label === 'N' ? '#df5b62' : '#4087cf';
            const drawPole = (x, label) => {
                ctx.fillStyle = poleColor(label);
                roundRect(x, cy - magH / 2, magW, magH, 12);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.96)';
                ctx.font = '900 28px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, x + magW / 2, cy + 10);
            };
            drawPole(gapL - magW, leftLabel);
            drawPole(gapR, rightLabel);

            if (s.showField) {
                const fieldColor = 'rgba(22,134,111,0.58)';
                const fieldDirection = s.poleDir > 0 ? 1 : -1;
                ctx.strokeStyle = fieldColor;
                ctx.lineWidth = 1.6;
                for (let i = 0; i < 5; i++) {
                    const y = cy - R * 0.8 + i * R * 0.4;
                    ctx.beginPath(); ctx.moveTo(gapL, y); ctx.lineTo(gapR, y); ctx.stroke();
                    arrowHead(fieldDirection > 0 ? cx + 22 : cx - 22, y, fieldDirection, fieldColor, 7);
                }
                ctx.fillStyle = '#16866f';
                ctx.font = '800 12px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('B', cx, cy - R - 16);
            }

            ctx.strokeStyle = '#c3d3de';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

            const ax = cx + R * Math.cos(s.phi), ay = cy - R * Math.sin(s.phi);
            const bx = cx - R * Math.cos(s.phi), by = cy + R * Math.sin(s.phi);
            ctx.strokeStyle = '#bd6b24';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
            ctx.lineCap = 'butt';

            const cur = genCurrent(s.phi, s.dir, s.poleDir);
            const drawConductor = (x, y, label, isOut) => {
                ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2);
                ctx.fillStyle = '#fff7ea'; ctx.fill();
                ctx.strokeStyle = '#a65c1f'; ctx.lineWidth = 2.2; ctx.stroke();
                if (s.showCurrent && !(s.quiz && !s.quiz.answered) && Math.abs(cur) > 0.12) {
                    ctx.strokeStyle = '#a65c1f'; ctx.fillStyle = '#a65c1f'; ctx.lineWidth = 2.5;
                    if (isOut) {
                        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
                        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke();
                    }
                }
                ctx.fillStyle = '#153047';
                ctx.font = '800 15px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, x, y - 24);
            };
            drawConductor(ax, ay, 'a', cur > 0);
            drawConductor(bx, by, 'b', cur <= 0);

            ctx.fillStyle = '#7f95a6';
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#8ba0af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 28, cy);
            ctx.lineTo(cx + 28, cy);
            ctx.stroke();

            // 右側：集電裝置與真正閉合的外電路
            const cardX = leftWidth + 8;
            const cardY = 16;
            const cardW = W - cardX - 14;
            const cardH = H - 32;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#d3e0e8';
            ctx.lineWidth = 1.2;
            roundRect(cardX, cardY, cardW, cardH, 14);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#153047';
            ctx.font = '800 14px "Noto Sans TC", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(s.slipRings ? '雙滑環與交流負載' : '分裂換向器與直流負載', cardX + 14, cardY + 24);
            ctx.fillStyle = '#718698';
            ctx.font = '11px "Noto Sans TC", sans-serif';
            ctx.fillText('銅色：轉子接點　深灰：固定電刷', cardX + 14, cardY + 43);

            const collectorX = cardX + Math.min(72, cardW * 0.28);
            const collectorY = cardY + cardH * 0.43;
            const brushColor = '#42596a';
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#bd6b24';
            if (s.slipRings) {
                for (const offset of [-27, 27]) {
                    ctx.beginPath();
                    ctx.arc(collectorX, collectorY + offset, 20, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = brushColor;
                    roundRect(collectorX + 21, collectorY + offset - 8, 20, 16, 4);
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                ctx.arc(collectorX, collectorY, 25, -Math.PI * 0.47, Math.PI * 0.47);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(collectorX, collectorY, 25, Math.PI * 0.53, Math.PI * 1.47);
                ctx.stroke();
                ctx.fillStyle = brushColor;
                roundRect(collectorX - 43, collectorY - 8, 18, 16, 4); ctx.fill();
                roundRect(collectorX + 25, collectorY - 8, 18, 16, 4); ctx.fill();
            }

            // 轉子導線以虛線連到集電裝置，外電路以實線形成閉合迴路
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#c18a59';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ax, ay); ctx.lineTo(cardX + 5, collectorY - 27); ctx.lineTo(collectorX - 20, collectorY - 27);
            ctx.moveTo(bx, by); ctx.lineTo(cardX + 5, collectorY + 27); ctx.lineTo(collectorX - 20, collectorY + 27);
            ctx.stroke();
            ctx.setLineDash([]);

            const wireStartX = collectorX + 41;
            const topY = collectorY - 48;
            const bottomY = collectorY + 48;
            const bulbX = cardX + cardW - Math.max(46, cardW * 0.2);
            ctx.strokeStyle = '#536f82';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(wireStartX, s.slipRings ? collectorY - 27 : collectorY);
            ctx.lineTo(wireStartX + 18, topY);
            ctx.lineTo(bulbX, topY);
            ctx.moveTo(wireStartX, s.slipRings ? collectorY + 27 : collectorY);
            ctx.lineTo(wireStartX + 18, bottomY);
            ctx.lineTo(bulbX, bottomY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bulbX, topY);
            ctx.lineTo(bulbX, collectorY - 24);
            ctx.moveTo(bulbX, collectorY + 24);
            ctx.lineTo(bulbX, bottomY);
            ctx.stroke();

            const glow = electrical.brightness;
            if (glow > 0.05) {
                const gradient = ctx.createRadialGradient(bulbX, collectorY, 8, bulbX, collectorY, 38);
                gradient.addColorStop(0, `rgba(255,196,54,${0.42 * glow})`);
                gradient.addColorStop(1, 'rgba(255,196,54,0)');
                ctx.fillStyle = gradient;
                ctx.beginPath(); ctx.arc(bulbX, collectorY, 38, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = `rgba(255,214,92,${0.22 + 0.7 * glow})`;
            ctx.strokeStyle = '#a5792d';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(bulbX, collectorY, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#8b6b35';
            ctx.beginPath();
            ctx.moveTo(bulbX - 8, collectorY + 2);
            ctx.quadraticCurveTo(bulbX, collectorY - 9, bulbX + 8, collectorY + 2);
            ctx.stroke();
            ctx.fillStyle = '#536f82';
            ctx.font = '700 11px "Noto Sans TC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('負載', bulbX, collectorY + 42);

            if (s.showCurrent && Math.abs(electrical.output) > 0.08) {
                const sign = electrical.output >= 0 ? 1 : -1;
                arrowHead((wireStartX + bulbX) / 2, topY, sign, '#df5b62', 8);
                arrowHead((wireStartX + bulbX) / 2, bottomY, -sign, '#df5b62', 8);
            }

            if (s.showMeter) {
                const waveX = cardX + 14;
                const waveY = cardY + cardH - 82;
                const waveW = cardW - 28;
                const waveH = 54;
                ctx.fillStyle = '#f7fafc';
                ctx.strokeStyle = '#d8e4eb';
                ctx.lineWidth = 1;
                roundRect(waveX, waveY, waveW, waveH, 8);
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = '#c7d6df';
                ctx.beginPath();
                ctx.moveTo(waveX + 6, waveY + waveH / 2);
                ctx.lineTo(waveX + waveW - 6, waveY + waveH / 2);
                ctx.stroke();
                ctx.strokeStyle = '#2878d0';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let index = 0; index <= 80; index += 1) {
                    const phase = index / 80 * Math.PI * 2;
                    const ac = -Math.cos(phase) * s.dir * s.poleDir;
                    const value = s.slipRings ? ac : Math.abs(ac);
                    const x = waveX + 7 + index / 80 * (waveW - 14);
                    const y = waveY + waveH / 2 - value * waveH * 0.34;
                    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.fillStyle = '#5f7689';
                ctx.font = '700 10px "Noto Sans TC", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(s.slipRings ? '交流輸出：正負交替' : '整流輸出：單向脈動', waveX + 8, waveY + 13);
            }

            ctx.fillStyle = '#60788b';
            ctx.font = '12px "Noto Sans TC", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(
                s.quiz && !s.quiz.answered ? '測驗中：電流提示暫時隱藏' : (s.playing ? '線圈正在轉動' : '線圈已暫停'),
                18,
                H - 15
            );
            ctx.textAlign = 'center';
        }

