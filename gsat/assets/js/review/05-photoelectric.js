// 互動模擬：光電效應虛擬實驗
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 互動模擬二：光電效應虛擬實驗——併入模組七 =====
        const PE_METALS = [
            { name: '銫 Cs', W: 1.9 },
            { name: '鈉 Na', W: 2.3 },
            { name: '鋅 Zn', W: 4.3 },
            { name: '鉑 Pt', W: 6.4 }
        ];
        let peSimState = { f: 6.0, I: 4, metal: 1, raf: null, photons: [], electrons: [], spawnAccumulator: 0, tLight: 0, lastTs: 0, emitted: 0, clock: null };

        // f 單位：×10^14 Hz；E(eV) ≈ 0.4136 × f
        function peEnergy(f) { return 0.4136 * f; }
        function peColor(f) {
            if (f < 4.0) return { c: '#9a3412', label: '紅外線' };
            if (f < 4.8) return { c: '#ef4444', label: '紅光' };
            if (f < 5.3) return { c: '#f59e0b', label: '橙黃光' };
            if (f < 6.1) return { c: '#22c55e', label: '綠光' };
            if (f < 6.8) return { c: '#3b82f6', label: '藍光' };
            if (f < 7.7) return { c: '#8b5cf6', label: '紫光' };
            return { c: '#c084fc', label: '紫外線' };
        }

        function peSimHtml() {
            const s = peSimState;
            const chips = PE_METALS.map((m, i) =>
                `<button class="bank-chip-btn ${i === s.metal ? 'active' : ''}" onclick="setPEMetal(${i})">${m.name}（W=${m.W} eV）</button>`).join('');
            return `
                <div class="handout-section-title">🎛️ 互動模擬：光電效應虛擬實驗（操縱變因，觀察結果）</div>
                <div class="sim-box" id="pe-sim-box">
                    <div class="sim-canvas-wrap"><canvas id="pe-sim-canvas" width="900" height="250"></canvas></div>
                    <div class="sim-controls">
                        <div class="sim-row"><span class="sim-label">金屬靶（控制變因）</span>${chips}</div>
                        <div class="sim-row"><span class="sim-label">光的頻率 f（操縱）</span><input type="range" min="2.5" max="18" step="0.1" value="${s.f}" oninput="peSimState.f=+this.value; updatePEReadout();"><span class="sim-val" id="pe-val-f"></span></div>
                        <div class="sim-row"><span class="sim-label">光的強度（操縱）</span><input type="range" min="1" max="10" step="1" value="${s.I}" oninput="peSimState.I=+this.value; updatePEReadout();"><span class="sim-val" id="pe-val-i"></span></div>
                        <div class="sim-row"><button class="bank-chip-btn" onclick="resetPECounters()">⟲ 重設計時與計數</button></div>
                    </div>
                    <div class="sim-readout" id="pe-sim-readout"></div>
                    <div id="pe-sim-verdict"></div>
                    <div class="sim-note">怎麼「做實驗」：一次只動一個滑桿（操縱變因），看上方動畫與讀數（應變變因）怎麼變。<br>① 固定強度、把頻率從低調到高 → 越過底限頻率 f₀ 的瞬間才開始射出電子，且頻率越高電子越快；② 頻率低於 f₀ 時把強度調到最大、等再久（看「照射時間」累積）→ 依然 0 顆電子——能量不能累積，這正是古典波動說解釋不了的地方。</div>
                </div>
            `;
        }

        function setPEMetal(i) {
            peSimState.metal = i;
            const box = document.getElementById('pe-sim-box');
            if (box) box.querySelectorAll('.sim-row')[0].querySelectorAll('.bank-chip-btn').forEach((b, j) => b.classList.toggle('active', j === i));
            resetPECounters();
        }

        function resetPECounters() {
            peSimState.tLight = 0;
            peSimState.emitted = 0;
            peSimState.photons = [];
            peSimState.electrons = [];
            peSimState.spawnAccumulator = 0;
            if (peSimState.clock) peSimState.clock.reset();
            updatePEReadout();
        }

        function updatePEReadout() {
            const s = peSimState;
            const ro = document.getElementById('pe-sim-readout');
            if (!ro) return;
            const m = PE_METALS[s.metal];
            const E = peEnergy(s.f);
            const f0 = m.W / 0.4136;
            const col = peColor(s.f);
            const eF = document.getElementById('pe-val-f'); if (eF) eF.innerHTML = s.f.toFixed(1) + ' ×10¹⁴ Hz（<span style="color:' + col.c + '">' + col.label + '</span>）';
            const eI = document.getElementById('pe-val-i'); if (eI) eI.textContent = s.I + '（每秒 ' + s.I + ' 顆光子）';
            const emitting = E >= m.W;
            ro.innerHTML = `
                <span class="sim-chip">光子能量 E = hf ≈ <b>${E.toFixed(2)} eV</b></span>
                <span class="sim-chip">功函數 W = <b>${m.W} eV</b>（${m.name}）</span>
                <span class="sim-chip">底限頻率 f₀ = W/h ≈ <b>${f0.toFixed(1)} ×10¹⁴ Hz</b></span>
                <span class="sim-chip">照射時間：<b id="pe-time">${s.tLight.toFixed(1)}</b> 秒</span>
                <span class="sim-chip">已射出電子：<b id="pe-count">${s.emitted}</b> 顆</span>
            `;
            const v = document.getElementById('pe-sim-verdict');
            if (v) {
                v.innerHTML = emitting
                    ? `<div class="sim-verdict ok">✅ E ≥ W：射出光電子！最大動能 Eₖ = hf − W ≈ <b>${(E - m.W).toFixed(2)} eV</b>；強度越大 → 每秒射出的電子越多（光電流越大），但每顆電子的動能不變。</div>`
                    : `<div class="sim-verdict no">❌ E ＜ W（頻率低於底限頻率 f₀）：不論強度多大、照射多久，都沒有光電子——單一光子能量不足，且電子無法累積零散的光子能量。</div>`;
            }
        }

        function initPESim() {
            const canvas = document.getElementById('pe-sim-canvas');
            if (!canvas) return;
            if (peSimState.raf) cancelAnimationFrame(peSimState.raf);
            registerViewDisposer(() => {
                if (peSimState.raf) cancelAnimationFrame(peSimState.raf);
                peSimState.raf = null;
                peSimState.clock = null;
            });
            updatePEReadout();
            const ctx = canvas.getContext('2d');
            const W = canvas.width, H = canvas.height;
            const plate = { x1: W * 0.28, x2: W * 0.78, y: H - 42 };
            const lamp = { x: 70, y: 40 };
            peSimState.clock = PhysicsRuntime.createFixedClock({ stepHz: 120 });
            peSimState.spawnAccumulator = 0;
            const reduceMotion = PhysicsRuntime.prefersReducedMotion();

            function frame(now) {
                if (!document.getElementById('pe-sim-canvas')) { peSimState.raf = null; return; }
                const s = peSimState;
                const m = PE_METALS[s.metal];
                const E = peEnergy(s.f);
                const emitting = E >= m.W;
                const col = peColor(s.f);

                if (!reduceMotion) s.clock.advance(now, dt => {
                    s.tLight += dt;
                    s.spawnAccumulator += dt;
                    const spawnInterval = 1 / Math.max(s.I, 1);
                    while (s.spawnAccumulator >= spawnInterval) {
                        s.spawnAccumulator -= spawnInterval;
                        const tx = plate.x1 + Math.random() * (plate.x2 - plate.x1);
                        const dx = tx - lamp.x, dy = plate.y - lamp.y;
                        const len = Math.hypot(dx, dy), sp = 300;
                        s.photons.push({ x: lamp.x, y: lamp.y, vx: dx / len * sp, vy: dy / len * sp, tx });
                    }
                    s.photons.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; });
                    for (let i = s.photons.length - 1; i >= 0; i--) {
                        const p = s.photons[i];
                        if (p.y >= plate.y - 4) {
                            s.photons.splice(i, 1);
                            if (emitting) {
                                const sp = 60 + 130 * Math.sqrt(Math.max(0.05, E - m.W));
                                const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.1;
                                s.electrons.push({ x: p.x, y: plate.y - 8, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1 });
                                s.emitted++;
                            }
                        }
                    }
                    s.electrons.forEach(e => { e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt * 0.5; });
                    for (let i = s.electrons.length - 1; i >= 0; i--) {
                        if (s.electrons[i].life <= 0 || s.electrons[i].y < -10) s.electrons.splice(i, 1);
                    }
                });
                const ec = document.getElementById('pe-count'); if (ec) ec.textContent = s.emitted;
                const et = document.getElementById('pe-time'); if (et) et.textContent = s.tLight.toFixed(1);

                // ---- 繪圖 ----
                ctx.clearRect(0, 0, W, H);
                // 燈
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath(); ctx.arc(lamp.x, lamp.y, 14, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(226,232,240,0.9)'; ctx.font = '12px sans-serif';
                ctx.fillText('光源', lamp.x - 14, lamp.y - 20);
                // 金屬板
                ctx.fillStyle = '#64748b';
                ctx.fillRect(plate.x1, plate.y, plate.x2 - plate.x1, 14);
                ctx.fillStyle = 'rgba(226,232,240,0.9)';
                ctx.fillText('金屬板（' + m.name + '）', plate.x1, plate.y + 30);
                // 光子（顏色隨頻率）
                s.photons.forEach(p => {
                    ctx.strokeStyle = col.c; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); ctx.lineTo(p.x, p.y); ctx.stroke();
                    ctx.fillStyle = col.c;
                    ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); ctx.fill();
                });
                // 電子（藍點）
                s.electrons.forEach(e => {
                    ctx.fillStyle = 'rgba(96,165,250,' + Math.max(0, e.life) + ')';
                    ctx.beginPath(); ctx.arc(e.x, e.y, 4, 0, Math.PI * 2); ctx.fill();
                });
                // 未射出提示
                if (!emitting) {
                    ctx.fillStyle = 'rgba(244,63,94,0.85)'; ctx.font = 'bold 13px sans-serif';
                    ctx.fillText('E < W：光子被吸收，無光電子射出', plate.x1 + 10, plate.y - 14);
                }
                peSimState.raf = requestAnimationFrame(frame);
            }
            peSimState.raf = requestAnimationFrame(frame);
        }

