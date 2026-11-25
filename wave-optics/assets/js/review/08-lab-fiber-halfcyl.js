// 互動實驗：光纖、半圓柱玻璃
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 11. 光纖：全反射導光、彎曲損耗、模態色散 ------------------------------
         * 只追蹤子午光線（在含軸線的平面內）。牆面一律用折線表示（彎曲處以細小線段逼近圓弧），
         * 光線碰到芯層／包層界面時：入射角 ≥ 臨界角 → 全反射；否則依菲涅耳反射率分成漏光與反射。
         * 每條光線記錄沿途的「時間」（光程 n·s／c），輸出脈衝與動畫都由這個時間決定。 */
        const FIBER_RAY = '#e8590c';                               // 單一波長的光（例如雷射），所有光線同一顏色，避免誤以為是色散
        /* 中心線：直線 L1 → 半徑 R、轉角 phi（逆時針為正）的圓弧 → 直線 L2；回傳取樣點與切向量 */
        function fiberCenterline(x0, y0, L1, R, phi, L2) {
            const pts = [];
            pts.push({ c: [x0, y0], t: [1, 0] });
            pts.push({ c: [x0 + L1, y0], t: [1, 0] });
            if (Math.abs(phi) > 1e-4 && R > 0) {
                const sg = phi > 0 ? 1 : -1;                         // 逆時針：圓心在上方（畫布 y 向下，所以圓心 y 較小）
                const cx = x0 + L1, cy = y0 - sg * R;
                const n = Math.max(6, Math.ceil(Math.abs(phi) / rad(1.5)));
                for (let i = 1; i <= n; i++) {
                    const a = sg * phi * i / n;                      // 已轉角度（正值）
                    const ang = Math.PI / 2 * sg + (sg > 0 ? -a : a); // 由圓心指向中心線的角度（畫布座標）
                    const px = cx + R * Math.cos(ang), py = cy + R * Math.sin(ang);
                    pts.push({ c: [px, py], t: [Math.cos(a), -sg * Math.sin(a)] });
                }
            }
            const last = pts[pts.length - 1];
            pts.push({ c: [last.c[0] + last.t[0] * L2, last.c[1] + last.t[1] * L2], t: last.t });
            return pts;
        }
        /* 由中心線偏移出上、下牆（半徑 off），組成線段 */
        function fiberWalls(center, off) {
            const side = (sg) => center.map((p) => [p.c[0] - sg * p.t[1] * off, p.c[1] + sg * p.t[0] * off]);
            const up = side(-1), lo = side(1);
            const segs = [];
            for (let i = 1; i < center.length; i++) { segs.push([up[i - 1], up[i]]); segs.push([lo[i - 1], lo[i]]); }
            return { up, lo, segs, end: [up[up.length - 1], lo[lo.length - 1]] };
        }
        function segHit(o, d, a, b) {
            const ex = b[0] - a[0], ey = b[1] - a[1];
            const den = d[0] * ey - d[1] * ex;
            if (Math.abs(den) < 1e-12) return null;
            const t = ((a[0] - o[0]) * ey - (a[1] - o[1]) * ex) / den;
            const u = ((a[0] - o[0]) * d[1] - (a[1] - o[1]) * d[0]) / den;
            if (t <= 1e-7 || u < -1e-9 || u > 1 + 1e-9) return null;
            return { t, n: depthNorm([-ey, ex]) };
        }
        /* 在階射率光纖內追蹤一條光線：o 入口點、d 方向；回傳光路（含時間）、漏光段與出口功率 */
        function fiberTrace(walls, o, d, n1, n2, maxLen) {
            const path = [{ p: o.slice(), time: 0, pw: 1 }];
            const leaks = [];
            let pos = o.slice(), dir = depthNorm(d), pw = 1, time = 0, len = 0, exited = false;
            for (let k = 0; k < 600 && pw > 0.02 && len < maxLen; k++) {
                let best = null;
                for (const [a, b] of walls.segs) { const h = segHit(pos, dir, a, b); if (h && (!best || h.t < best.t)) best = h; }
                const he = segHit(pos, dir, walls.end[0], walls.end[1]);
                if (he && (!best || he.t <= best.t)) {
                    pos = [pos[0] + dir[0] * he.t, pos[1] + dir[1] * he.t];
                    time += he.t * n1; len += he.t;
                    path.push({ p: pos.slice(), time, pw }); exited = true; break;
                }
                if (!best) break;
                pos = [pos[0] + dir[0] * best.t, pos[1] + dir[1] * best.t];
                time += best.t * n1; len += best.t;
                let nOut = best.n;
                let cosi = dir[0] * nOut[0] + dir[1] * nOut[1];
                if (cosi < 0) { nOut = [-nOut[0], -nOut[1]]; cosi = -cosi; }
                path.push({ p: pos.slice(), time, pw, nOut, inc: deg(Math.acos(Math.min(1, cosi))) });
                const sint = n1 / n2 * Math.sqrt(Math.max(0, 1 - cosi * cosi));
                if (sint < 1) {                                       // 未達臨界角：部分漏出
                    const R = fresnelR(n1, n2, cosi), eta = n1 / n2;
                    const cost = Math.sqrt(1 - sint * sint);
                    const tdir = depthNorm([eta * dir[0] + (cost - eta * cosi) * nOut[0], eta * dir[1] + (cost - eta * cosi) * nOut[1]]);
                    leaks.push({ p: pos.slice(), d: tdir, pw: pw * (1 - R) });
                    pw *= R;
                }
                dir = [dir[0] - 2 * cosi * nOut[0], dir[1] - 2 * cosi * nOut[1]];
            }
            return { path, leaks, exited, pwOut: exited ? pw : 0, time };
        }
        /* 由入口外的空氣入射角 thAir 求進入芯層後的方向（以 t 為軸向） */
        const fiberLaunchDir = (t, thAir, n1) => {
            const a = Math.asin(Math.sin(thAir) / n1);
            return [t[0] * Math.cos(a) + t[1] * Math.sin(a), t[1] * Math.cos(a) - t[0] * Math.sin(a)];
        };
        /* 漸變折射率（拋物線分布）：n² = n1²(1 − 2Δ(y/a)²)；以 RK4 積分 y(x)，β = n cosθ 守恆 */
        function gradedTrace(n1, n2, a, alpha0, L, steps) {
            const D = (n1 * n1 - n2 * n2) / (2 * n1 * n1);
            const beta = n1 * Math.cos(alpha0);
            const n2y = (y) => Math.abs(y) <= a ? n1 * n1 * (1 - 2 * D * (y / a) * (y / a)) : n2 * n2;
            const acc = (y) => Math.abs(y) <= a ? -2 * D * n1 * n1 * y / (a * a) / (beta * beta) : 0;
            let y = 0, v = Math.tan(alpha0), t = 0;
            const h = L / steps, pts = [{ p: [0, 0], time: 0 }];
            let escaped = false;
            for (let i = 0; i < steps; i++) {
                const f = (yy, vv) => [vv, acc(yy)];
                const k1 = f(y, v), k2 = f(y + h / 2 * k1[0], v + h / 2 * k1[1]);
                const k3 = f(y + h / 2 * k2[0], v + h / 2 * k2[1]), k4 = f(y + h * k3[0], v + h * k3[1]);
                const yN = y + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
                const vN = v + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
                t += (n2y((y + yN) / 2) / beta) * h;                 // dt ∝ n ds = n²/β dx
                y = yN; v = vN;
                pts.push({ p: [h * (i + 1), y], time: t });
                if (Math.abs(y) > a * 1.0001) { escaped = true; break; }
            }
            return { pts, escaped, time: t, beta };
        }
        /* 由一組（到達時間, 功率）畫出輸出脈衝的形狀；tScale 把時間差換成圖上的寬度 */
        function pulseCurve(arrivals, sigma, xs) {
            return xs.map((x) => arrivals.reduce((s, a) => s + a.pw * Math.exp(-((x - a.t) ** 2) / (2 * sigma * sigma)), 0));
        }

        LABS.fiber = {
            name: '光纖：全反射導光、彎曲與傳輸優劣',
            tag: 'N15',
            wide: true,
            hint: '光從左端射入芯層，在芯層與包層的界面全反射而前進。',
            hintFor: (p) => ({
                step: '可在下方「射入的光」選「一條光線」，自己調入射角，看光打到界面的入射角和臨界角比較。<br>光從左端射入芯層（n₁），在芯層與包層（n₂ < n₁）的界面全反射，被侷限在芯層中前進。入射角超過「接受角」的光，打到界面時入射角小於臨界角，會漏進包層。白點是同時出發的光脈衝：走鋸齒路徑的光比較晚到，輸出脈衝被拉寬（模態色散）。',
                bend: '在畫布上拖曳，或調整滑桿讓光纖轉彎。轉彎時，光打到外側界面的入射角變小；彎得太急，入射角小於臨界角，光就從彎曲處漏出去。讀數會比較「同一組光在直光纖」與「彎曲後」到達出口的光量。',
                graded: '漸變折射率光纖的芯層中央折射率最高、往外遞減。光不再鋸齒反射，而是平滑地彎回中央；走得遠的光在外圍低折射率處跑得較快，幾乎和中央的光同時到達，脈衝展寬大幅減少。',
                single: '單模光纖的芯徑只有約 9 μm，接近光的波長，只允許一種傳播方式（模態），沒有「不同路徑的時間差」。光的能量有一小部分延伸到包層中一起前進。長距離與海底電纜都用單模光纖。',
                compare: '三種光纖並排：同時出發的光脈衝，到出口時寬度不同。下方整理光纖和銅線的優缺點。'
            })[p.mode] || '',
            note: '光纖靠全反射導光：芯層折射率必須大於包層。',
            noteFor: (p) => ({
                step: '臨界角 sinθc = n₂/n₁；從空氣射入端面時，最大接受角 sinθa = n₁·cosθc = √(n₁² − n₂²)，稱為數值孔徑 NA。<br>圖中的光都是同一個波長（例如雷射），只是從不同角度射入，所以畫成同一種顏色。<br>預設 n₁ = 1.50、n₂ = 1.40 是為了方便觀察而誇大；真實通訊光纖約 n₁ ≈ 1.48、n₂ ≈ 1.46，接受角只有約 14°（可用上方「預設組合」切換）。<br>模態色散：最斜的導光光線比軸向光線多花的時間 Δt ≈ (L·n₁/c)(n₁/n₂ − 1)。脈衝被拉寬後，相鄰脈衝會重疊，限制了每秒可傳的位元數，所以長距離通訊不用階射率多模光纖。<br>簡化：只追蹤在含軸平面內的光線（子午光線），未計入吸收、散射與材料色散；光纖粗細已放大。',
                bend: '彎曲損耗是光纖的主要缺點之一：施工時若彎得太急，光會從彎曲處漏掉，嚴重時訊號中斷，因此光纜都有「最小彎曲半徑」規格；現在也有抗彎光纖（如 ITU-T G.657），可承受較小的彎曲。<br>彎曲漏光也有用途：「光纖識別器」把光纖輕輕彎一下，偵測漏出的光，就能判斷裡面有沒有訊號。<br>沿光纖中心前進的光，在彎曲外側界面的入射角滿足 sinθ = R/(R + a)；要不漏光需 R/(R + a) ≥ n₂/n₁，即 R ≥ a·n₂/(n₁ − n₂)。所以 n₁、n₂ 差越大（NA 越大），越不怕彎。<br>真實光纖 n₁、n₂ 只差約 1%，需要 R 達數十 a 以上；但芯半徑只有數微米，幾公分的彎曲半徑已是數千 a，所以只有「彎太急」（半徑小於約一兩公分）才會明顯漏光。',
                graded: '拋物線分布 n² = n₁²[1 − 2Δ(r/a)²]，Δ = (n₁² − n₂²)/(2n₁²)。光線路徑近似正弦曲線，週期幾乎與入射角無關；理想分布下時間差 Δt 約為階射率的 Δ/8 倍（Δ ≈ (n₁ − n₂)/n₁），頻寬大很多。常用於大樓、資料中心內的短距離多模光纖（芯徑 50 或 62.5 μm）。',
                single: '單模光纖：芯徑約 8–10 μm、包層外徑 125 μm；在 1550 nm 波長的衰減約 0.2 dB/km，大約每 15 km 功率才減半。雖然沒有模態色散，但不同波長的光速度略有不同（色散），長距離仍要補償。缺點是芯徑很小，熔接與對準要非常精密，光源要用雷射。<br>圖中的波紋只是示意「整個芯層以單一模態前進」；在這麼細的芯中，光線（直線反射）的畫法已不適用。',
                compare: '模態色散只發生在多模光纖：階射率最嚴重、漸變折射率大幅改善、單模光纖則沒有。真實通訊系統再加上衰減（dB/km）與材料色散一起決定可傳的距離與速率。'
            })[p.mode] || '',
            modes: [
                { key: 'step', label: '階射率光纖（多模）' },
                { key: 'bend', label: '彎曲光纖' },
                { key: 'graded', label: '漸變折射率光纖' },
                { key: 'single', label: '單模光纖' },
                { key: 'compare', label: '三種比較與優劣' }
            ],
            height: (p, cw) => p.mode === 'compare' ? 540 : p.mode === 'bend' ? 540 : 400 + (cw < 640 ? 160 : 0),   // 窄螢幕把折射率分布圖放在光纖下方
            cycle: 4.5,
            controls: [
                { key: 'preset', label: '預設組合', value: 'demo', only: ['step', 'bend', 'graded', 'compare'],
                  options: [{ value: 'demo', label: '誇大以便觀察（n₁ 1.50、n₂ 1.40）' }, { value: 'real', label: '接近真實（n₁ 1.48、n₂ 1.46）' }, { value: 'custom', label: '自訂' }],
                  fmt: () => '' },
                { key: 'n1', label: '芯層折射率 n₁', min: 1.40, max: 1.60, step: 0.01, value: 1.50, fmt: (v) => v.toFixed(2), only: ['step', 'bend', 'graded', 'compare'] },
                { key: 'n2', label: '包層折射率 n₂', min: 1.30, max: 1.59, step: 0.01, value: 1.40, fmt: (v) => v.toFixed(2), only: ['step', 'bend', 'graded', 'compare'] },
                { key: 'beam', label: '射入的光', value: 'fan', only: ['step', 'bend', 'graded'],
                  options: [{ value: 'fan', label: '一束光（多條，不同入射角）' }, { value: 'single', label: '一條光線（自己調入射角）' }],
                  fmt: () => '' },
                { key: 'angle', label: '入射角（空氣中，向上為正）', min: -80, max: 80, step: 1, value: 20, fmt: (v) => `${v}°`, only: ['step', 'bend', 'graded'], showIf: (p) => p.beam === 'single' },
                { key: 'launch', label: '射入光束的最大入射角（空氣中）', min: 0, max: 80, step: 1, value: 40, fmt: (v) => `±${v}°`, only: ['step', 'bend', 'graded', 'compare'], showIf: (p) => p.mode === 'compare' || p.beam !== 'single' },
                { key: 'bendR', label: '彎曲半徑 R（芯半徑 a 的倍數）', min: 4, max: 28, step: 1, value: 14, fmt: (v) => `${v} a`, only: ['bend'] },
                { key: 'bendA', label: '彎曲角度（也可拖曳畫布）', min: 0, max: 180, step: 1, value: 90, fmt: (v) => `${v}°`, only: ['bend'] }
            ],
            onReset: (p) => { p._bend = p._step = p._bendOne = p._bendSig = p._stepSig = p._bendOneSig = null; },
            teach: `
                <h4>光纖的優點與缺點</h4>
                <div class="fiber-pc">
                    <div class="fiber-pc-col is-pro">
                        <h5>優點（和銅線相比）</h5>
                        <ul>
                            <li><b>頻寬大、速率高</b>：光的頻率約 2×10¹⁴ Hz，一條單模光纖可傳每秒數兆位元（Tbps）等級的資料。</li>
                            <li><b>衰減小、傳得遠</b>：約 0.2 dB/km，數十公里才需要放大；銅線傳高頻訊號幾百公尺就衰減嚴重。</li>
                            <li><b>不受電磁干擾</b>：傳的是光、材料是玻璃（絕緣體），旁邊有馬達、高壓電、雷擊也不受影響，也不會干擾別人。</li>
                            <li><b>細、輕、原料便宜</b>：主要成分是二氧化矽（砂）；同樣容量的光纜比銅纜細輕很多。</li>
                            <li><b>不易被竊聽</b>：光被侷限在芯層，外面幾乎沒有訊號可截取，要竊聽必須彎折或切開光纖。</li>
                        </ul>
                    </div>
                    <div class="fiber-pc-col is-con">
                        <h5>缺點與限制</h5>
                        <ul>
                            <li><b>怕彎折</b>：彎得太急，全反射條件被破壞而漏光（上面「彎曲光纖」模式）；玻璃也容易折斷。</li>
                            <li><b>連接、熔接要精密</b>：單模芯徑只有約 9 μm，接頭稍微沒對準就大量損失，施工需要專用設備。</li>
                            <li><b>需要光電轉換</b>：電腦處理的是電訊號，兩端都要雷射（電→光）與光偵測器（光→電）。</li>
                            <li><b>不能順便供電</b>：銅線可同時送電（如網路線供電 PoE），光纖本身不導電。</li>
                            <li><b>多模光纖有模態色散</b>：不同路徑的光到達時間不同，脈衝被拉寬，限制了距離與速率。</li>
                        </ul>
                    </div>
                </div>
                <h5>三種光纖比較</h5>
                <div class="fiber-table-wrap">
                    <table class="fiber-table">
                        <thead><tr><th></th><th>階射率多模</th><th>漸變折射率多模</th><th>單模</th></tr></thead>
                        <tbody>
                            <tr><th>芯徑</th><td>50–100 μm 以上</td><td>50 或 62.5 μm</td><td>約 9 μm</td></tr>
                            <tr><th>光在芯中的走法</th><td>鋸齒狀全反射</td><td>平滑彎回中央</td><td>單一模態（不能用光線描述）</td></tr>
                            <tr><th>脈衝展寬</th><td>大</td><td>小</td><td>極小（只有材料色散）</td></tr>
                            <tr><th>光源、接續</th><td>LED 即可，容易對準</td><td>LED 或雷射</td><td>需要雷射，對準要精密</td></tr>
                            <tr><th>典型用途</th><td>短距離照明、感測、塑膠光纖</td><td>大樓、資料中心內部</td><td>長途幹線、海底電纜、光纖到府</td></tr>
                        </tbody>
                    </table>
                </div>
                <p>光纖的關鍵在「芯層折射率比包層大」：光從芯層射向包層、入射角大於臨界角時發生全反射。包層把光和外界隔開，表面刮傷、手指碰觸都不會破壞全反射，這也是光纖不能只用一根裸玻璃絲的原因。</p>`,
            setup: ({ host, canvas, params, disposers, syncOutputs, paint, getGeom }) => {
                params._sync = syncOutputs;
                const inp = (k) => host.querySelector(`[id$="fiber-${k}"]`);
                const PRE = { demo: [1.50, 1.40], real: [1.48, 1.46] };
                const presetSel = inp('preset');
                if (presetSel) disposers.addEventListener(presetSel, 'change', () => {
                    const v = PRE[params.preset];
                    if (!v) return;
                    params.n1 = v[0]; params.n2 = v[1];
                    if (inp('n1')) inp('n1').value = v[0];
                    if (inp('n2')) inp('n2').value = v[1];
                    syncOutputs(); paint();
                });
                ['n1', 'n2'].forEach((k) => {
                    const el = inp(k);
                    if (el) disposers.addEventListener(el, 'input', () => {
                        const v = PRE[params.preset];
                        if (v && Math.abs(v[0] - params.n1) + Math.abs(v[1] - params.n2) > 1e-6) {
                            params.preset = 'custom';
                            if (presetSel) presetSel.value = 'custom';
                            syncOutputs();
                        }
                    });
                });
                /* 彎曲模式：拖曳畫布改變彎曲角度（以圓弧圓心為準量角度） */
                let dragging = false;
                const setFromPointer = (e) => {
                    const g = params._bendGeom; if (!g) return;
                    const r = canvas.getBoundingClientRect();
                    const x = e.clientX - r.left, y = e.clientY - r.top;
                    let a = deg(Math.atan2(x - g.arcC[0], y - g.arcC[1]));   // 0° = 正下方（彎曲起點），逆時針轉為正
                    if (a < -90) a = 180; else if (a < 0) a = 0;
                    a = Math.round(Math.min(180, a));
                    if (a === params.bendA) return;
                    params.bendA = a;
                    const el = inp('bendA'); if (el) el.value = a;
                    syncOutputs(); paint();
                };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    if (params.mode !== 'bend') return;
                    dragging = true;
                    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 不支援時忽略 */ }
                    setFromPointer(e); e.preventDefault();
                });
                disposers.addEventListener(canvas, 'pointermove', (e) => { if (dragging) setFromPointer(e); });
                const stop = () => { dragging = false; };
                disposers.addEventListener(canvas, 'pointerup', stop);
                disposers.addEventListener(canvas, 'pointercancel', stop);
                const syncCursor = () => { canvas.style.cursor = params.mode === 'bend' ? 'grab' : ''; canvas.style.touchAction = params.mode === 'bend' ? 'none' : ''; };
                host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', syncCursor));
                syncCursor();
            },
            /* draw 算出的結果改變時，更新下方讀數（讀數需要畫布尺寸才算得出來） */
            publish: (p, key, val) => {
                const s = JSON.stringify(val);
                if (p['_' + key + 'Sig'] === s) return;
                p['_' + key + 'Sig'] = s; p['_' + key] = val;
                if (typeof p._sync === 'function') queueMicrotask(p._sync);
            },

            /* ---- 共用：光線組、光纖外觀、脈衝圖 ---- */
            isSingle: (p) => p.beam === 'single' && p.mode !== 'compare',
            rayAngles: (p) => {
                if (LABS.fiber.isSingle(p)) return [rad(p.angle)];
                const m = rad(p.launch), N = 9;
                return Array.from({ length: N }, (_, i) => m === 0 ? 0 : -m + 2 * m * i / (N - 1));
            },
            drawBody: (ctx, center, a, cladK, coreFill) => {
                const clad = fiberWalls(center, a * cladK), core = fiberWalls(center, a);
                const poly = (wl, fill) => {
                    ctx.beginPath(); ctx.moveTo(...wl.up[0]);
                    wl.up.forEach((q) => ctx.lineTo(...q)); [...wl.lo].reverse().forEach((q) => ctx.lineTo(...q));
                    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
                };
                poly(clad, 'rgba(70,160,200,0.28)');
                poly(core, coreFill || 'rgba(255,248,225,0.95)');
                ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1.1;
                [core.up, core.lo, clad.up, clad.lo].forEach((ln) => { ctx.beginPath(); ctx.moveTo(...ln[0]); ln.forEach((q) => ctx.lineTo(...q)); ctx.stroke(); });
                return core;
            },
            /* 光從左邊空氣射入端面：畫入射段與接受角 */
            drawLaunch: (ctx, entry, angles, n1, n2, len) => {
                const NA = Math.sqrt(Math.max(0, n1 * n1 - n2 * n2));
                if (NA < 1) {
                    const ta = Math.asin(NA);
                    [-1, 1].forEach((sg) => dashed(ctx, entry[0], entry[1], entry[0] - Math.cos(ta) * len, entry[1] + sg * Math.sin(ta) * len, 'rgba(107,70,193,0.7)'));
                }
                angles.forEach((th, i) => {
                    ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.8;
                    ctx.beginPath(); ctx.moveTo(entry[0] - Math.cos(th) * len, entry[1] + Math.sin(th) * len); ctx.lineTo(entry[0], entry[1]); ctx.stroke();
                    ctx.globalAlpha = 1;
                });
            },
            drawRays: (ctx, results, show) => {
                results.forEach((r, i) => {
                    const col = FIBER_RAY;
                    for (let k = 1; k < r.path.length; k++) {
                        const A = r.path[k - 1], B = r.path[k];
                        ctx.strokeStyle = col; ctx.globalAlpha = Math.max(0.15, A.pw); ctx.lineWidth = 1.7;
                        ctx.beginPath(); ctx.moveTo(...A.p); ctx.lineTo(...B.p); ctx.stroke();
                    }
                    ctx.globalAlpha = 1;
                    if (show !== false) r.leaks.forEach((lk) => {
                        if (lk.pw < 0.03) return;
                        ctx.save(); ctx.setLineDash([5, 4]);
                        ctx.strokeStyle = FIBER_RAY; ctx.globalAlpha = Math.min(0.9, 0.2 + lk.pw); ctx.lineWidth = 1.6;
                        ctx.beginPath(); ctx.moveTo(...lk.p); ctx.lineTo(lk.p[0] + lk.d[0] * 60, lk.p[1] + lk.d[1] * 60); ctx.stroke();
                        ctx.restore();
                    });
                });
            },
            /* 一條光線時：在某次碰到界面處畫法線、入射角弧與數值，和臨界角比較 */
            drawIncAngle: (ctx, prev, hit, thc, placed, w, off) => {
                const P = hit.p, nIn = [-hit.nOut[0], -hit.nOut[1]];
                dashed(ctx, P[0] - nIn[0] * 16, P[1] - nIn[1] * 16, P[0] + nIn[0] * 44, P[1] + nIn[1] * 44, 'rgba(18,49,58,0.75)');
                const back = depthNorm([prev.p[0] - P[0], prev.p[1] - P[1]]);
                const a1 = Math.atan2(nIn[1], nIn[0]);
                let dA = Math.atan2(back[1], back[0]) - a1;
                while (dA > Math.PI) dA -= 2 * Math.PI; while (dA < -Math.PI) dA += 2 * Math.PI;
                const ok = hit.inc >= deg(thc) - 1e-6, col = ok ? C.green : C.rose;
                ctx.strokeStyle = col; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(P[0], P[1], 20, a1, a1 + dA, dA < 0); ctx.stroke();
                const txt = `入射角 ${hit.inc.toFixed(1)}° ${ok ? '≥' : '<'} 臨界角 ${deg(thc).toFixed(1)}°：${ok ? '全反射' : '部分漏出'}`;
                depthLabel(ctx, placed, txt, P[0] + hit.nOut[0] * off, P[1] + hit.nOut[1] * off + 4, col, w, 'center');
            },
            /* 動畫光點：依沿途時間內插位置 */
            drawDots: (ctx, paths, tNow) => {
                paths.forEach((pts, i) => {
                    if (!pts || pts.length < 2 || tNow < 0 || tNow > pts[pts.length - 1].time) return;
                    let k = 1; while (k < pts.length && pts[k].time < tNow) k++;
                    if (k >= pts.length) return;
                    const A = pts[k - 1], B = pts[k], f = (tNow - A.time) / Math.max(1e-9, B.time - A.time);
                    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(A.p[0] + (B.p[0] - A.p[0]) * f, A.p[1] + (B.p[1] - A.p[1]) * f, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                });
            },
            /* 脈衝小圖：box = {x,y,w,h}；arrivals = [{t, pw}]；t0、t1 為時間軸範圍 */
            drawPulse: (ctx, box, arrivals, sigma, t0, t1, color, title, cursor, w) => {
                ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillRect(box.x, box.y, box.w, box.h);
                ctx.strokeStyle = 'rgba(18,49,58,0.35)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(box.x + 6, box.y + box.h - 14); ctx.lineTo(box.x + box.w - 6, box.y + box.h - 14); ctx.stroke();
                const xs = Array.from({ length: 120 }, (_, i) => t0 + (t1 - t0) * i / 119);
                const ys = pulseCurve(arrivals, sigma, xs), mx = Math.max(1e-9, ...pulseCurve([{ t: 0, pw: arrivals.reduce((s, a) => s + a.pw, 0) }], sigma, [0]));
                const X = (t) => box.x + 6 + (t - t0) / (t1 - t0) * (box.w - 12), Y = (v) => box.y + box.h - 14 - v / mx * (box.h - 34);
                ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
                xs.forEach((t, i) => (i ? ctx.lineTo(X(t), Y(ys[i])) : ctx.moveTo(X(t), Y(ys[i])))); ctx.stroke();
                if (cursor !== null && cursor >= t0 && cursor <= t1) dashed(ctx, X(cursor), box.y + 18, X(cursor), box.y + box.h - 14, 'rgba(18,49,58,0.45)');
                labelFit(ctx, title, box.x + 6, box.y + 13, C.ink, 10, 'left', { maxW: box.w - 12, clampW: w });
                labelFit(ctx, '時間 →', box.x + box.w - 6, box.y + box.h - 3, C.muted, 9, 'right', { clampW: w });
            },

            /* 折射率分布圖的位置：寬螢幕放在光纖右側、與光纖同高（r 軸對齊）；窄螢幕放在光纖下方 */
            profLayout: (w, x0, yc, cladR) => w >= 640
                ? { Lf: w - x0 - 24 - 140, box: { x: w - 148, w: 136, yc } }
                : { Lf: w - x0 - 24, box: { x: Math.max(8, (w - 170) / 2), w: 170, yc: yc + cladR * 2 + 52 } },
            /* 折射率分布 n(r)：縱軸是到中心的距離 r（和光纖同比例），橫軸是 n */
            drawProfile: (ctx, box, a, cladR, kind, n1, n2, w) => {
                const yc = box.yc, top = yc - cladR, bot = yc + cladR;
                const lo = Math.min(n1, n2), hi = Math.max(n1, n2), sp = Math.max(0.02, hi - lo);
                const nLo = lo - 0.6 * sp, nHi = hi + 0.2 * sp;
                const X = (n) => box.x + 10 + (n - nLo) / (nHi - nLo) * (box.w - 22);
                ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(box.x, top - 26, box.w, bot - top + 46);
                ctx.strokeStyle = 'rgba(18,49,58,0.25)'; ctx.lineWidth = 1; ctx.strokeRect(box.x + 0.5, top - 25.5, box.w - 1, bot - top + 45);
                // 座標軸
                ctx.strokeStyle = 'rgba(18,49,58,0.55)';
                ctx.beginPath(); ctx.moveTo(X(nLo), top); ctx.lineTo(X(nLo), bot); ctx.stroke();
                dashed(ctx, X(nLo), yc, box.x + box.w - 6, yc, 'rgba(18,49,58,0.35)');
                [-a, a].forEach((d) => dashed(ctx, X(nLo), yc + d, box.x + box.w - 6, yc + d, 'rgba(122,90,16,0.5)'));
                const D = n1 > n2 ? (n1 * n1 - n2 * n2) / (2 * n1 * n1) : 0;
                const nOf = (r) => r > a ? n2 : kind === 'graded' ? Math.sqrt(n1 * n1 * (1 - 2 * D * (r / a) * (r / a))) : n1;
                ctx.fillStyle = 'rgba(232,89,12,0.12)'; ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(X(nLo), top);
                for (let i = 0; i <= 160; i++) { const y = top + (bot - top) * i / 160; ctx.lineTo(X(nOf(Math.abs(y - yc))), y); }
                ctx.lineTo(X(nLo), bot); ctx.closePath(); ctx.fill();
                ctx.beginPath();
                for (let i = 0; i <= 160; i++) { const y = top + (bot - top) * i / 160; const xx = X(nOf(Math.abs(y - yc))); if (i) ctx.lineTo(xx, y); else ctx.moveTo(xx, y); }
                ctx.stroke();
                labelFit(ctx, '折射率分布 n(r)', box.x + 6, top - 12, C.ink, 10, 'left', { maxW: box.w - 10, clampW: w });
                labelFit(ctx, `芯 n₁ ${n1.toFixed(2)}`, X(n1), yc - a - 5, '#7a5a10', 9, 'right', { clampW: w, plate: 'rgba(255,255,255,0.85)' });
                labelFit(ctx, `包層 n₂ ${n2.toFixed(2)}`, X(n2) + 3, bot - 4, '#1f6f8b', 9, 'left', { clampW: w });
                labelFit(ctx, 'n 越大 →', box.x + box.w - 6, bot + 14, C.muted, 9, 'right', { clampW: w });
            },

            /* ---- 計算 ---- */
            straightRun: (p, x0, y0, Lf, a) => {
                const center = fiberCenterline(x0, y0, Lf, 0, 0, 0);
                const walls = fiberWalls(center, a);
                const res = LABS.fiber.rayAngles(p).map((th) => fiberTrace(walls, [x0, y0], fiberLaunchDir([1, 0], th, p.n1), p.n1, p.n2, Lf * 40));
                return { center, walls, res };
            },
            stepStats: (p) => {
                const n1 = p.n1, n2 = p.n2, ok = n1 > n2;
                const thc = ok ? Math.asin(n2 / n1) : null;
                const NA = ok ? Math.sqrt(n1 * n1 - n2 * n2) : 0;
                const dtKm = ok ? 1000 * n1 / 3e8 * (n1 / n2 - 1) * 1e9 : 0;          // ns / km
                const D = ok ? (n1 - n2) / n1 : 0;
                const dtGraded = ok ? 1000 * n1 / 3e8 * D * D / 8 * 1e9 : 0;          // ns / km（理想拋物線）
                return { ok, thc, NA, thA: NA >= 1 ? 90 : deg(Math.asin(NA)), dtKm, dtGraded };
            },
            readouts: (p) => {
                const L = LABS.fiber, st = L.stepStats(p);
                if (p.mode === 'single') return [
                    { label: '芯徑／包層外徑', value: '約 9 μm／125 μm' },
                    { label: '模態色散', value: '沒有（只有一種模態）' },
                    { label: '衰減（1550 nm）', value: '約 0.2 dB/km' },
                    { label: '用途', value: '長途幹線、海底電纜、光纖到府' }
                ];
                if (!st.ok) return [{ label: '注意', value: '芯層 n₁ 必須大於包層 n₂，才能全反射導光' }];
                const base = [
                    { label: '臨界角 θc', value: `${deg(st.thc).toFixed(1)}°` },
                    { label: '接受角 θa（NA = sin θa）', value: `${st.thA.toFixed(1)}°（NA ${Math.min(1, st.NA).toFixed(2)}）` }
                ];
                const one = L.isSingle(p) ? (() => {
                    const rr = deg(Math.asin(Math.sin(rad(Math.abs(p.angle))) / p.n1));
                    return { rr, inc: 90 - rr, thcD: deg(st.thc) };
                })() : null;
                if (one && p.mode === 'step') {
                    const ok = one.inc >= one.thcD - 1e-6, s1 = p._step || {};
                    return base.concat([
                        { label: '進入芯層後的折射角 r', value: `${one.rr.toFixed(1)}°` },
                        { label: '打到界面的入射角 90° − r', value: `${one.inc.toFixed(1)}°（${ok ? '≥' : '<'} θc）` },
                        { label: '結果', value: ok ? '每次都全反射，光被侷限在芯層' : '每次反射都有一部分漏進包層' },
                        { label: '到達出口的光量', value: s1.out != null ? `${Math.round(s1.out * 100)}%` : '—' }
                    ]);
                }
                if (one && p.mode === 'graded') {
                    const NA = Math.sqrt(p.n1 * p.n1 - p.n2 * p.n2), ratio = Math.abs(Math.sin(rad(p.angle))) / NA;
                    return base.concat([
                        { label: '進入芯層後與軸的夾角', value: `${one.rr.toFixed(1)}°` },
                        { label: '離中心最遠（sin θ ÷ NA × a）', value: ratio < 1 ? `${ratio.toFixed(2)} a，被導引` : '超過芯半徑，漏出' }
                    ]);
                }
                if (p.mode === 'bend') {
                    const b = p._bend || {}, b1 = p._bendOne || {};
                    if (one) return base.concat([
                        { label: '直的部分：打到界面的入射角', value: b1.first != null ? `${b1.first.toFixed(1)}°` : '不碰界面（沿軸）' },
                        { label: '彎曲處：最小的入射角', value: b1.min != null ? `${b1.min.toFixed(1)}°（${b1.min >= one.thcD - 1e-6 ? '≥' : '<'} θc）` : '—' },
                        { label: '到達出口的光量', value: b.out != null ? `${Math.round(b.out * 100)}%（直的時候 ${Math.round(b.ref * 100)}%）` : '—' }
                    ]);
                    return base.concat([
                        { label: '直光纖時到達出口', value: b.ref != null ? `${Math.round(b.ref * 100)}%` : '—' },
                        { label: `彎曲 ${p.bendA}°、R = ${p.bendR} a 時到達出口`, value: b.out != null ? `${Math.round(b.out * 100)}%（${b.leakRays} 條光在彎曲處漏光）` : '—' },
                        { label: '沿中心前進的光不漏出，需要', value: `R ≥ ${Math.ceil(p.n2 / (p.n1 - p.n2))} a` }
                    ]);
                }
                const kmTxt = (ns) => ns >= 1 ? `${ns.toFixed(1)} ns` : `${(ns * 1000).toFixed(1)} ps`;
                if (p.mode === 'graded') return base.concat([
                    { label: '每公里脈衝展寬（理想漸變）', value: kmTxt(st.dtGraded) },
                    { label: '同樣 n 的階射率光纖', value: kmTxt(st.dtKm) }
                ]);
                if (p.mode === 'compare') return base.concat([
                    { label: '每公里展寬：階射率', value: kmTxt(st.dtKm) },
                    { label: '漸變折射率', value: kmTxt(st.dtGraded) },
                    { label: '單模', value: '幾乎沒有模態色散' }
                ]);
                const guided = (p._step || {}).guided;
                return base.concat([
                    { label: '被導引到出口的光線', value: guided != null ? `${guided} / 9 條` : '—' },
                    { label: '每公里脈衝展寬 Δt', value: kmTxt(st.dtKm) },
                    { label: '可傳位元率約', value: st.dtKm > 0 ? `${(1 / (2 * st.dtKm * 1e-9) / 1e6).toFixed(st.dtKm > 50 ? 1 : 0)} Mbps（1 km）` : '—' }
                ]);
            },
            draw: (ctx, w, h, p, t) => {
                const L = LABS.fiber;
                if (p.mode === 'bend') return L.drawBend(ctx, w, h, p, t || 0);
                if (p.mode === 'graded') return L.drawGraded(ctx, w, h, p, t || 0);
                if (p.mode === 'single') return L.drawSingle(ctx, w, h, p, t || 0);
                if (p.mode === 'compare') return L.drawCompare(ctx, w, h, p, t || 0);
                return L.drawStep(ctx, w, h, p, t || 0);
            },
            /* 動畫時間：軸向光線在週期的 55% 到達出口，最慢的導光光線也要在週期內到達 */
            animTime: (t, tAxis, tMax) => {
                const T = 4.5, u = ((t % T) + T) % T / T;
                const span = Math.max(tAxis / 0.55, tMax * 1.06);
                return u * span;
            },
            noNTip: (ctx, w, h, p) => {
                if (p.n1 > p.n2) return false;
                labelFit(ctx, '芯層 n₁ 必須大於包層 n₂，光才能全反射而被導引', w / 2, h / 2, C.rose, 13, 'center', { clampW: w, plate: 'rgba(255,255,255,0.9)' });
                return true;
            },

            /* ---------- 階射率 ---------- */
            drawStep: (ctx, w, h, p, t) => {
                const L = LABS.fiber;
                const yc = 248, a = 34, x0 = 120, lay = L.profLayout(w, x0, yc, a * 1.9), Lf = lay.Lf;
                const run = L.straightRun(p, x0, yc, Lf, a);
                L.drawBody(ctx, run.center, a, 1.9);
                if (L.noNTip(ctx, w, h, p)) return;
                L.drawProfile(ctx, lay.box, a, a * 1.9, 'step', p.n1, p.n2, w);
                L.drawLaunch(ctx, [x0, yc], L.rayAngles(p), p.n1, p.n2, 90);
                L.drawRays(ctx, run.res);
                const guided = run.res.filter((r) => r.exited && r.pwOut > 0.5);
                L.publish(p, 'step', { guided: guided.length, out: +run.res[0].pwOut.toFixed(3) });
                const tAxis = Lf * p.n1, tMax = guided.reduce((m, r) => Math.max(m, r.time), tAxis);
                const tNow = L.animTime(t, tAxis, tMax);
                L.drawDots(ctx, run.res.map((r) => (r.exited ? r.path : null)), tNow);
                if (L.isSingle(p)) return L.stepSingleNotes(ctx, w, h, p, run, x0, yc, a, Lf);
                // 脈衝圖
                const sigma = tAxis * 0.012, bw = Math.min(230, (w - 40) / 2.6), bh = 92;
                const arr = guided.map((r) => ({ t: r.time, pw: r.pwOut }));
                L.drawPulse(ctx, { x: 12, y: 10, w: bw, h: bh }, [{ t: 0, pw: arr.reduce((s, a2) => s + a2.pw, 0) || 1 }], sigma, -4 * sigma, (tMax - tAxis) + 4 * sigma, C.blue, '輸入脈衝（同時出發）', tNow, w);
                L.drawPulse(ctx, { x: w - bw - 12, y: 10, w: bw, h: bh }, arr, sigma, tAxis - 4 * sigma, tMax + 4 * sigma, C.rose, '輸出脈衝（被拉寬）', tNow, w);
                const placed = []; placed.hMax = h;
                depthLabel(ctx, placed, `芯層 n₁ = ${p.n1.toFixed(2)}`, x0 + 8, yc - a * 0.3, '#7a5a10', w, 'left');
                depthLabel(ctx, placed, `包層 n₂ = ${p.n2.toFixed(2)}`, x0 + 8, yc - a * 1.35, '#1f6f8b', w, 'left');
                depthLabel(ctx, placed, '紫虛線：接受角', 6, yc + 64, C.violet, w, 'left');
                if (run.res.some((r) => r.leaks.some((lk) => lk.pw > 0.1))) depthLabel(ctx, placed, '虛線：超過接受角，漏進包層的光', x0 + 8, yc + a * 1.9 + 18, FIBER_RAY, w, 'left');
            },

            stepSingleNotes: (ctx, w, h, p, run, x0, yc, a, Lf) => {
                const L = LABS.fiber, r = run.res[0], placed = []; placed.hMax = h;
                const th = rad(p.angle), rr = Math.asin(Math.sin(th) / p.n1);
                // 端面：法線（軸）、入射角 θ 與折射角 r
                dashed(ctx, x0 - 96, yc, x0 + 70, yc, 'rgba(18,49,58,0.55)');
                depthLabel(ctx, placed, `θ = ${Math.abs(p.angle)}°`, x0 - 60, yc + (p.angle >= 0 ? 26 : -14), C.ink, w, 'center');
                if (Math.abs(p.angle) > 0) depthLabel(ctx, placed, `r = ${deg(Math.abs(rr)).toFixed(1)}°`, x0 + 6, yc + (p.angle >= 0 ? 18 : -8), C.ink, w, 'left');
                const hit = r.path.length > 2 ? r.path[1] : null;
                if (hit && hit.nOut) L.drawIncAngle(ctx, r.path[0], hit, Math.asin(p.n2 / p.n1), placed, w, a * 0.9 + 22);
                else depthLabel(ctx, placed, '光沿著軸前進，不碰到界面', x0 + Lf / 2, yc - a * 1.9 - 16, C.ink, w, 'center');
                const sgn = p.angle >= 0 ? 1 : -1;                  // 標在第一次反射的另一側，避開入射角標示
                depthLabel(ctx, placed, `芯層 n₁ = ${p.n1.toFixed(2)}`, x0 + Lf - 8, yc + sgn * a * 0.55 + 4, '#7a5a10', w, 'right');
                depthLabel(ctx, placed, `包層 n₂ = ${p.n2.toFixed(2)}`, x0 + Lf - 8, yc + sgn * a * 1.45 + 4, '#1f6f8b', w, 'right');
                depthLabel(ctx, placed, `出口光量 ${Math.round(r.pwOut * 100)}%`, w - 8, 18, r.pwOut > 0.95 ? C.green : C.rose, w, 'right');
                depthLabel(ctx, placed, '紫虛線：接受角', 6, yc + 64, C.violet, w, 'left');
            },

            /* ---------- 彎曲 ---------- */
            bendGeom: (w, h, p) => {
                const a = 8;                                        // 固定比例：彎曲半徑最大 28a 時，轉 180° 也放得進畫布
                const x0 = 96, y0 = h - 30, L1 = Math.min(200, w * 0.2);
                const R = p.bendR * a, phi = rad(p.bendA);
                // 先求不含 L2 的終點與方向，再算出能留在畫布內的 L2
                const c0 = fiberCenterline(x0, y0, L1, R, phi, 0);
                const end = c0[c0.length - 1];
                const lim = (pos, dir, lo, hi) => dir > 1e-9 ? (hi - pos) / dir : dir < -1e-9 ? (lo - pos) / dir : Infinity;
                const L2 = Math.max(30, Math.min(w * 0.45,
                    lim(end.c[0], end.t[0], 24 + a * 2, w - 24 - a * 2), lim(end.c[1], end.t[1], 24 + a * 2, h - 24 - a * 2)));
                return { a, x0, y0, L1, R, phi, L2, center: fiberCenterline(x0, y0, L1, R, phi, L2), arcC: [x0 + L1, y0 - R] };
            },
            drawBend: (ctx, w, h, p, t) => {
                const L = LABS.fiber, g = L.bendGeom(w, h, p);
                p._bendGeom = g;
                L.drawBody(ctx, g.center, g.a, 1.9);
                if (L.noNTip(ctx, w, h, p)) return;
                const walls = fiberWalls(g.center, g.a);
                const angles = L.rayAngles(p);
                const totalLen = g.L1 + g.R * g.phi + g.L2;
                const res = angles.map((th) => fiberTrace(walls, [g.x0, g.y0], fiberLaunchDir([1, 0], th, p.n1), p.n1, p.n2, totalLen * 40));
                // 對照：同一組光在等長直光纖中
                const sWalls = fiberWalls(fiberCenterline(g.x0, g.y0, totalLen, 0, 0, 0), g.a);
                const ref = angles.map((th) => fiberTrace(sWalls, [g.x0, g.y0], fiberLaunchDir([1, 0], th, p.n1), p.n1, p.n2, totalLen * 40));
                const N = angles.length;
                const sum = (arr) => arr.reduce((s, r) => s + r.pwOut, 0) / N;
                const leakRays = res.filter((r, i) => ref[i].pwOut > 0.5 && r.pwOut < ref[i].pwOut - 0.05).length;
                L.publish(p, 'bend', { ref: +sum(ref).toFixed(3), out: +sum(res).toFixed(3), leakRays });
                L.drawLaunch(ctx, [g.x0, g.y0], angles, p.n1, p.n2, 40);
                L.drawRays(ctx, res);
                const guided = res.filter((r) => r.exited);
                const tAxis = totalLen * p.n1, tMax = guided.reduce((m, r) => Math.max(m, r.time), tAxis);
                L.drawDots(ctx, res.map((r) => (r.exited ? r.path : null)), L.animTime(t, tAxis, tMax));
                // 拖曳把手：彎曲終點
                const end = g.center[g.center.length - 2].c;
                ctx.fillStyle = 'rgba(107,70,193,0.18)'; ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(end[0], end[1], g.a * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                const placed = []; placed.hMax = h;
                depthLabel(ctx, placed, '拖曳畫布讓光纖轉彎', 8, 18, C.violet, w, 'left');
                depthLabel(ctx, placed, `出口光量 ${Math.round(p._bend.out * 100)}%（直的時候 ${Math.round(p._bend.ref * 100)}%）`, w - 8, 18, p._bend.out < p._bend.ref - 0.02 ? C.rose : C.green, w, 'right');
                if (L.isSingle(p)) {
                    const pts = res[0].path, hits = pts.map((q, i) => ({ q, i })).filter((o) => o.q.nOut);
                    const straight = hits.filter((o) => o.q.p[0] < g.x0 + g.L1 - 1);
                    const worst = hits.reduce((m, o) => (!m || o.q.inc < m.q.inc ? o : m), null);
                    L.publish(p, 'bendOne', { first: straight.length ? +straight[0].q.inc.toFixed(1) : null, min: worst ? +worst.q.inc.toFixed(1) : null });
                    if (worst) L.drawIncAngle(ctx, pts[worst.i - 1], worst.q, Math.asin(p.n2 / p.n1), placed, w, g.a * 0.9 + 26);
                }
                if (leakRays > 0 && !L.isSingle(p)) {
                    const lk = res.flatMap((r) => r.leaks).filter((l) => l.pw > 0.1 && l.p[0] > g.x0 + g.L1 - 4)[0];
                    if (lk) depthLabel(ctx, placed, '彎曲處漏光', lk.p[0] + lk.d[0] * 64, lk.p[1] + lk.d[1] * 64 + 4, FIBER_RAY, w, 'center');
                }
            },

            /* ---------- 漸變折射率 ---------- */
            gradedRun: (p, Lf, a) => LABS.fiber.rayAngles(p).map((th) => {
                const al = Math.asin(Math.sin(th) / p.n1);
                return gradedTrace(p.n1, p.n2, a, al, Lf, 700);
            }),
            drawGraded: (ctx, w, h, p, t) => {
                const L = LABS.fiber;
                const yc = 256, a = 28, x0 = 120, lay = L.profLayout(w, x0, yc, a * 1.9), Lf = lay.Lf;
                const center = fiberCenterline(x0, yc, Lf, 0, 0, 0);
                const grad = ctx.createLinearGradient(0, yc - a, 0, yc + a);
                grad.addColorStop(0, 'rgba(255,236,190,0.95)'); grad.addColorStop(0.5, 'rgba(250,218,150,0.95)'); grad.addColorStop(1, 'rgba(255,236,190,0.95)');
                L.drawBody(ctx, center, a, 1.9, grad);
                if (L.noNTip(ctx, w, h, p)) return;
                L.drawProfile(ctx, lay.box, a, a * 1.9, 'graded', p.n1, p.n2, w);
                L.drawLaunch(ctx, [x0, yc], L.rayAngles(p), p.n1, p.n2, 90);
                const runs = L.gradedRun(p, Lf, a);
                const paths = runs.map((r) => r.pts.map((q) => ({ p: [x0 + q.p[0], yc - q.p[1]], time: q.time, pw: 1 })));
                paths.forEach((pts, i) => {
                    ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 1.7;
                    ctx.beginPath(); pts.forEach((q, k) => (k ? ctx.lineTo(...q.p) : ctx.moveTo(...q.p))); ctx.stroke();
                    if (runs[i].escaped) {
                        const A = pts[pts.length - 2].p, B = pts[pts.length - 1].p, d = depthNorm([B[0] - A[0], B[1] - A[1]]);
                        ctx.save(); ctx.setLineDash([5, 4]); ctx.globalAlpha = 0.7;
                        ctx.beginPath(); ctx.moveTo(...B); ctx.lineTo(B[0] + d[0] * 50, B[1] + d[1] * 50); ctx.stroke(); ctx.restore();
                    }
                });
                const ok = runs.map((r) => !r.escaped);
                const tAxis = Lf * p.n1, tMax = runs.reduce((m, r, i) => ok[i] ? Math.max(m, r.time) : m, tAxis);
                const tNow = L.animTime(t, tAxis, tMax);
                L.drawDots(ctx, paths.map((q, i) => ok[i] ? q : null), tNow);
                if (L.isSingle(p)) {
                    const placed = []; placed.hMax = h;
                    const NA = Math.sqrt(Math.max(0, p.n1 * p.n1 - p.n2 * p.n2)), ratio = NA > 0 ? Math.abs(Math.sin(rad(p.angle))) / NA : Infinity;
                    dashed(ctx, x0 - 96, yc, x0 + Lf, yc, 'rgba(18,49,58,0.4)');
                    depthLabel(ctx, placed, `θ = ${Math.abs(p.angle)}°`, x0 - 60, yc + (p.angle >= 0 ? 26 : -14), C.ink, w, 'center');
                    if (ratio < 1 && ratio > 0.02) {
                        const sg = p.angle >= 0 ? -1 : 1, yT = yc + sg * ratio * a;
                        dashed(ctx, x0, yT, x0 + Lf, yT, C.green);
                        depthLabel(ctx, placed, `離中心最遠 ${ratio.toFixed(2)} a：還沒碰到包層就彎回來`, x0 + Lf * 0.5, yc + sg * (a * 1.9 + 14) + 4, C.green, w, 'center');
                    } else if (ratio >= 1) depthLabel(ctx, placed, '入射角太大：還沒彎回來就跑出芯層', x0 + Lf * 0.5, yc - a * 1.9 - 14, C.rose, w, 'center');
                    depthLabel(ctx, placed, '中央 n 最大、往外遞減', x0 + 8, yc + a * 1.9 + 18, '#7a5a10', w, 'left');
                    return;
                }
                const sigma = tAxis * 0.012, bw = Math.min(230, (w - 40) / 2.6), bh = 92;
                // 時間軸範圍與階射率相同，才看得出差異
                const st = L.straightRun(p, x0, yc, Lf, a).res.filter((r) => r.exited && r.pwOut > 0.5);
                const tMaxStep = st.reduce((m, r) => Math.max(m, r.time), tAxis);
                const arr = runs.filter((r, i) => ok[i]).map((r) => ({ t: r.time, pw: 1 }));
                L.drawPulse(ctx, { x: 12, y: 10, w: bw, h: bh }, [{ t: 0, pw: arr.length || 1 }], sigma, -4 * sigma, (tMaxStep - tAxis) + 4 * sigma, C.blue, '輸入脈衝', tNow, w);
                L.drawPulse(ctx, { x: w - bw - 12, y: 10, w: bw, h: bh }, arr, sigma, tAxis - 4 * sigma, tMaxStep + 4 * sigma, C.green, '輸出脈衝（幾乎不展寬）', tNow, w);
                const placed = []; placed.hMax = h;
                depthLabel(ctx, placed, '中央 n 最大、往外遞減', x0 + 8, yc - a * 1.35, '#7a5a10', w, 'left');
            },

            /* ---------- 單模 ---------- */
            drawSingle: (ctx, w, h, p, t) => {
                const L = LABS.fiber;
                const yc = 256, a = 28 * 0.32, x0 = 120, lay = L.profLayout(w, x0, yc, a * 5.9), Lf = lay.Lf;
                const center = fiberCenterline(x0, yc, Lf, 0, 0, 0);
                L.drawBody(ctx, center, a, 5.9);
                L.drawProfile(ctx, lay.box, a, a * 5.9, 'step', 1.468, 1.463, w);
                // 單一模態：橫向高斯分布，延伸到包層；縱向是前進的波
                const off = getOffscreen(Math.max(2, Math.round(Lf / 2)), 48), oc = off.ctx;
                const img = oc.createImageData(off.canvas.width, 48), D = img.data;
                const k = 2 * Math.PI / 26, phase = t * 6;
                for (let j = 0; j < 48; j++) {
                    const y = (j - 23.5) / 23.5 * a * 3, env = Math.exp(-(y * y) / (2 * (a * 0.95) ** 2));
                    for (let i = 0; i < off.canvas.width; i++) {
                        const wave = 0.55 + 0.45 * Math.cos(k * i * 2 - phase);
                        const v = env * wave, idx = (j * off.canvas.width + i) * 4;
                        D[idx] = 255; D[idx + 1] = 170; D[idx + 2] = 40; D[idx + 3] = Math.round(220 * v);
                    }
                }
                off.ctx.putImageData(img, 0, 0);
                ctx.drawImage(off.canvas, 0, 0, off.canvas.width, 48, x0, yc - a * 3, Lf, a * 6);
                const sigma = 0.05, bw = Math.min(230, (w - 40) / 2.6), bh = 92;
                L.drawPulse(ctx, { x: 12, y: 10, w: bw, h: bh }, [{ t: 0, pw: 1 }], sigma, -0.3, 0.3, C.blue, '輸入脈衝', null, w);
                L.drawPulse(ctx, { x: w - bw - 12, y: 10, w: bw, h: bh }, [{ t: 0, pw: 1 }], sigma * 1.05, -0.3, 0.3, C.green, '輸出脈衝（形狀不變）', null, w);
                const placed = []; placed.hMax = h;
                depthLabel(ctx, placed, '芯徑約 9 μm（放大示意）', x0 + 8, yc - a * 6.4, '#7a5a10', w, 'left');
                depthLabel(ctx, placed, '光的能量有一部分在包層中前進', x0 + 8, yc + a * 6.4 + 16, '#1f6f8b', w, 'left');
            },

            /* ---------- 三種比較 ---------- */
            drawCompare: (ctx, w, h, p, t) => {
                const L = LABS.fiber;
                if (L.noNTip(ctx, w, h, p)) return;
                const showProf = w >= 640, rows = 3, rh = h / rows, x0 = showProf ? 136 : 24, bw = Math.min(200, w * 0.24), Lf = w - x0 - bw - 40;
                const a = Math.min(20, rh * 0.15);
                const st = L.straightRun(p, x0, 0, Lf, a);
                const guidedS = st.res.filter((r) => r.exited && r.pwOut > 0.5);
                const tAxis = Lf * p.n1, tMax = guidedS.reduce((m, r) => Math.max(m, r.time), tAxis);
                const tNow = L.animTime(t, tAxis, tMax);
                const sigma = tAxis * 0.012;
                const placed = []; placed.hMax = h;
                [['step', '階射率多模'], ['graded', '漸變折射率多模'], ['single', '單模']].forEach(([kind, title], ri) => {
                    const yc = rh * ri + rh * 0.56;
                    const center = fiberCenterline(x0, yc, Lf, 0, 0, 0);
                    if (showProf) {
                        if (kind === 'single') L.drawProfile(ctx, { x: 12, w: 112, yc }, a * 0.32, a * 0.32 * 5.9, 'step', 1.468, 1.463, w);
                        else L.drawProfile(ctx, { x: 12, w: 112, yc }, a, a * 1.9, kind, p.n1, p.n2, w);
                    }
                    let arr;
                    if (kind === 'step') {
                        L.drawBody(ctx, center, a, 1.9);
                        const run = L.straightRun(p, x0, yc, Lf, a);
                        const res = run.res.filter((r) => r.exited && r.pwOut > 0.5);
                        L.drawRays(ctx, res, false);
                        L.drawDots(ctx, res.map((r) => r.path), tNow);
                        arr = res.map((r) => ({ t: r.time, pw: r.pwOut }));
                    } else if (kind === 'graded') {
                        const grad = ctx.createLinearGradient(0, yc - a, 0, yc + a);
                        grad.addColorStop(0, 'rgba(255,236,190,0.95)'); grad.addColorStop(0.5, 'rgba(250,218,150,0.95)'); grad.addColorStop(1, 'rgba(255,236,190,0.95)');
                        L.drawBody(ctx, center, a, 1.9, grad);
                        const runs = L.gradedRun(p, Lf, a).filter((r) => !r.escaped);
                        const paths = runs.map((r) => r.pts.map((q) => ({ p: [x0 + q.p[0], yc - q.p[1]], time: q.time })));
                        paths.forEach((pts, i) => { ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((q, k) => (k ? ctx.lineTo(...q.p) : ctx.moveTo(...q.p))); ctx.stroke(); });
                        L.drawDots(ctx, paths, tNow);
                        arr = runs.map((r) => ({ t: r.time, pw: 1 }));
                    } else {
                        L.drawBody(ctx, center, a * 0.32, 5.9);
                        ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(x0, yc); ctx.lineTo(x0 + Lf, yc); ctx.stroke();
                        L.drawDots(ctx, [[{ p: [x0, yc], time: 0 }, { p: [x0 + Lf, yc], time: tAxis }]], tNow);
                        arr = [{ t: tAxis, pw: 1 }];
                    }
                    L.drawPulse(ctx, { x: w - bw - 12, y: rh * ri + 8, w: bw, h: rh - 16 }, arr, sigma, tAxis - 4 * sigma, tMax + 4 * sigma,
                        kind === 'step' ? C.rose : C.green, '輸出脈衝', tNow, w);
                    depthLabel(ctx, placed, title, x0, rh * ri + 16, C.ink, w, 'left');
                });
            }
        };

        /* 13. 半圓柱玻璃：平行光由平面射入，在圓弧面折射或全反射 --------------------
         * 平面在左（x = cx），圓心 (cx, cy)、半徑 R；光由左方水平射入，在平面上垂直入射不偏折，
         * 打到圓弧面時入射角 θ 滿足 sinθ = h / R（h 為入射高度）。h > R / n 時全反射。 */
        const HC_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚'];
        /* 在半圓柱內追蹤：回傳線段 [{a, b, kind}]，kind = 'in' | 'tir' | 'refl' | 'out' */
        function halfCylTrace(cx, cy, R, n, h, xStart, xEnd) {
            const segs = [];
            let p = [cx, cy - h], d = [1, 0];
            segs.push({ a: [xStart, cy - h], b: p.slice(), kind: 'in' });
            let kind = 'in', events = [];
            for (let k = 0; k < 14; k++) {
                // 圓弧（由內往外的交點，取較遠的根）
                const ox = p[0] - cx, oy = p[1] - cy, bq = ox * d[0] + oy * d[1], cq = ox * ox + oy * oy - R * R;
                const disc = bq * bq - cq;
                let tC = Infinity;
                if (disc >= 0) { const t = -bq + Math.sqrt(disc); if (t > 1e-6 && p[0] + d[0] * t >= cx - 1e-6) tC = t; }
                let tF = Infinity;
                if (d[0] < -1e-9) { const t = (cx - p[0]) / d[0]; const yy = p[1] + d[1] * t; if (t > 1e-6 && Math.abs(yy - cy) <= R) tF = t; }
                const t = Math.min(tC, tF);
                if (!Number.isFinite(t)) break;
                const q = [p[0] + d[0] * t, p[1] + d[1] * t];
                segs.push({ a: p.slice(), b: q.slice(), kind });
                // 法線（指向玻璃外）
                const nOut = tC <= tF ? [(q[0] - cx) / R, (q[1] - cy) / R] : [-1, 0];
                const cosi = d[0] * nOut[0] + d[1] * nOut[1];
                const sini = Math.sqrt(Math.max(0, 1 - cosi * cosi)), sint = n * sini;
                events.push({ p: q.slice(), nOut, inc: deg(Math.asin(Math.min(1, sini))), tir: sint >= 1, curved: tC <= tF, dIn: d.slice() });
                if (sint < 1) {                                        // 折射穿出
                    const cost = Math.sqrt(1 - sint * sint), eta = n;
                    const od = depthNorm([eta * d[0] + (cost - eta * cosi) * nOut[0], eta * d[1] + (cost - eta * cosi) * nOut[1]]);
                    const L = Math.max(10, (od[0] > 0 ? (xEnd - q[0]) / od[0] : (q[0] - 4) / -od[0]));
                    segs.push({ a: q.slice(), b: [q[0] + od[0] * Math.min(L, 4000), q[1] + od[1] * Math.min(L, 4000)], kind: 'out', R: fresnelR(n, 1, cosi) });
                    events[events.length - 1].refl = { d: [d[0] - 2 * cosi * nOut[0], d[1] - 2 * cosi * nOut[1]], R: fresnelR(n, 1, cosi) };
                    break;
                }
                d = [d[0] - 2 * cosi * nOut[0], d[1] - 2 * cosi * nOut[1]];
                p = q; kind = 'tir';
            }
            return { segs, events };
        }

        LABS.halfcyl = {
            name: '半圓柱玻璃：平行光的折射與全反射',
            tag: 'N15',
            wide: true,
            hint: '平行光由左方垂直射入半圓柱玻璃的平面，打到圓弧面時，入射角由光的高度決定。',
            hintFor: (p) => ({
                one: '上下拖曳左邊的光源（或用滑桿）改變光射入的高度 h。光在平面上垂直入射不偏折；打到圓弧面時，法線是半徑方向，入射角 θ 滿足 sin θ = h / R。h 越高，入射角越大；超過臨界角就全反射。',
                five: '五條平行光甲～戊（和題目的圖相同）。可以上下拖曳每一條光的起點，改變它射入的高度；紫色虛線是臨界高度 h = R / n，高於這條線的光在圓弧面全反射。',
                many: '整片平行光：只有中間 |h| < R / n 的光能從圓弧面射出，並且大致會聚（越靠外的光會聚點越近，這是球面像差）；外側的光全反射，在玻璃裡繞行後從平面或圓弧另一側射出。'
            })[p.mode] || '',
            note: '圓弧面上的入射角：法線通過圓心，所以 sin θ = h / R。',
            noteFor: () => '全反射條件：sin θ ≥ 1 / n，也就是入射高度 h ≥ R / n（臨界高度）。n = 1.80 時 R / n ≈ 0.56 R，所以高度 0.6R 以上的光（丁、戊）全反射，0.4R 以下的光（甲、乙、丙）折射穿出。<br>折射穿出的光：sin r = n sin θ。靠近中心軸的光（近軸光）大約會聚在圓弧頂點右方 R / (n − 1) 處（圖中的 F）；越靠外的光偏折越多、會聚點越近，所以不會剛好會聚在一點（球面像差）。<br>全反射後的光在圓弧上每一次反射，入射角都相同（圓的弦與半徑的夾角不變），直到打到平面；在平面上若入射角小於臨界角，就從平面射出。<br>圖中只畫主要光線：折射時仍有一小部分光被反射（可勾選顯示）。',
            modes: [
                { key: 'one', label: '一條光線：調整入射高度' },
                { key: 'five', label: '五條平行光（甲～戊）' },
                { key: 'many', label: '整片平行光' }
            ],
            height: (p, cw) => cw < 640 ? 420 : 470,
            controls: [
                { key: 'n', label: '玻璃折射率 n', min: 1.30, max: 2.40, step: 0.01, value: 1.80, fmt: (v) => v.toFixed(2) },
                { key: 'h', label: '入射高度 h（半徑 R 的倍數，也可拖曳光源）', min: -0.98, max: 0.98, step: 0.01, value: 0.40, fmt: (v) => `${v.toFixed(2)} R`, only: ['one'] },
                { key: 'gap', label: '五條光的間隔（可再個別拖曳）', min: 0.10, max: 0.24, step: 0.01, value: 0.20, fmt: (v) => `${v.toFixed(2)} R`, only: ['five'],
                  onChange: (v, p) => { p._hs = [0, 1, 2, 3, 4].map((i) => +(i * v).toFixed(3)); } },
                { key: 'weak', label: '顯示折射時的部分反射（較弱）', type: 'checkbox', value: false },
                { key: 'crit', label: '顯示臨界高度 R / n', type: 'checkbox', value: true }
            ],
            onReset: (p) => { p._hs = null; },
            hsOf: (p) => { if (!p._hs) p._hs = [0, 1, 2, 3, 4].map((i) => +(i * p.gap).toFixed(3)); return p._hs; },
            geom: (w, h) => {
                const R = Math.min(h * 0.43, w * (w < 640 ? 0.36 : 0.30)), cx = Math.max(w < 640 ? 70 : 150, w * (w < 640 ? 0.2 : 0.28));
                return { R, cx, cy: h / 2 + 8, xStart: w < 640 ? 26 : 50 };
            },
            heights: (p) => p.mode === 'one' ? [p.h] : p.mode === 'five' ? LABS.halfcyl.hsOf(p) : Array.from({ length: 19 }, (_, i) => -0.9 + 0.1 * i),
            readouts: (p) => {
                const thc = deg(Math.asin(Math.min(1, 1 / p.n)));
                const base = [{ label: '臨界角 θc（sin θc = 1/n）', value: `${thc.toFixed(1)}°` }, { label: '臨界高度 R / n', value: `${(1 / p.n).toFixed(2)} R` }];
                const desc = (h) => {
                    const th = deg(Math.asin(Math.min(1, Math.abs(h))));
                    if (th >= thc - 1e-9) return `入射角 ${th.toFixed(1)}° ≥ θc → 全反射`;
                    const r = deg(Math.asin(Math.min(1, p.n * Math.sin(rad(th)))));
                    return `入射角 ${th.toFixed(1)}° → 折射角 ${r.toFixed(1)}°，穿出`;
                };
                if (p.mode === 'one') return [{ label: `h = ${p.h.toFixed(2)} R：圓弧面上`, value: desc(p.h) }].concat(base);
                if (p.mode === 'five') return LABS.halfcyl.hsOf(p).map((h, i) => ({ label: `${HC_NAMES[i]}（h = ${h.toFixed(2)} R）`, value: desc(h) })).concat(base);
                const out = Math.min(1, 1 / p.n);
                return base.concat([
                    { label: '能從圓弧面直接射出的光', value: `|h| < ${out.toFixed(2)} R，約佔 ${Math.round(out * 100)}%` },
                    { label: '近軸光會聚點 F', value: `圓弧頂點右方 R/(n−1) = ${(1 / (p.n - 1)).toFixed(2)} R` }
                ]);
            },
            setup: ({ canvas, params, disposers, syncOutputs, paint, host }) => {
                let drag = null;
                const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
                const apply = (y) => {
                    const g = params._hcGeom; if (!g || drag === null) return;
                    const h = Math.max(-0.98, Math.min(0.98, Math.round((g.cy - y) / g.R * 100) / 100));
                    if (params.mode === 'one') { params.h = h; const el = host.querySelector('[id$="halfcyl-h"]'); if (el) el.value = h; }
                    else if (params.mode === 'five') LABS.halfcyl.hsOf(params)[drag] = h;
                    syncOutputs(); paint();
                };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    const g = params._hcGeom; if (!g || params.mode === 'many') return;
                    const [x, y] = pos(e);
                    if (x > g.cx) return;
                    const hs = LABS.halfcyl.heights(params);
                    let best = 0; hs.forEach((h, i) => { if (Math.abs(g.cy - h * g.R - y) < Math.abs(g.cy - hs[best] * g.R - y)) best = i; });
                    if (Math.abs(g.cy - hs[best] * g.R - y) > 40) return;
                    drag = best;
                    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 不支援時忽略 */ }
                    e.preventDefault(); apply(y);
                });
                disposers.addEventListener(canvas, 'pointermove', (e) => {
                    const g = params._hcGeom;
                    if (drag !== null) { apply(pos(e)[1]); return; }
                    if (!g || params.mode === 'many') { canvas.style.cursor = ''; return; }
                    canvas.style.cursor = pos(e)[0] < g.cx ? 'ns-resize' : '';
                });
                const stop = () => { drag = null; };
                disposers.addEventListener(canvas, 'pointerup', stop);
                disposers.addEventListener(canvas, 'pointercancel', stop);
                canvas.style.touchAction = 'none';
            },
            draw: (ctx, w, h, p, t) => {
                const L = LABS.halfcyl, g = L.geom(w, h), { R, cx, cy } = g;
                p._hcGeom = g;
                const xEnd = w - 6;
                // 方格（每格 R/5，方便讀高度）
                ctx.strokeStyle = 'rgba(18,49,58,0.07)'; ctx.lineWidth = 1;
                const st = R / 5;
                for (let x = cx % st; x < w; x += st) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
                for (let y = cy % st; y < h; y += st) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
                // 玻璃
                ctx.fillStyle = 'rgba(150,215,245,0.55)'; ctx.strokeStyle = '#3fa9d6'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
                dashed(ctx, cx - 30, cy, xEnd, cy, 'rgba(18,49,58,0.35)');
                ctx.fillStyle = '#12313a'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
                const placed = []; placed.hMax = h;
                depthLabel(ctx, placed, `玻璃 n = ${p.n.toFixed(2)}`, cx + R * 0.12, cy + R * 0.8, '#12313a', w, 'left');
                depthLabel(ctx, placed, '圓心', cx + 5, cy + 16, C.muted, w, 'left');
                // 臨界高度
                const hc = 1 / p.n;
                if (p.crit && hc < 1) [-1, 1].forEach((sg) => {
                    const y = cy - sg * hc * R, xA = cx + R * Math.sqrt(1 - hc * hc);
                    dashed(ctx, g.xStart - 10, y, xA, y, C.violet);
                    if (sg > 0) depthLabel(ctx, placed, `臨界高度 R/n = ${hc.toFixed(2)}R：高於此線全反射`, g.xStart + 10, y + 15, C.violet, w, 'left');
                });
                // 近軸會聚點
                const xF = cx + R + R / (p.n - 1);
                if (p.mode !== 'one' && xF < xEnd - 10) {
                    ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(xF, cy, 4, 0, Math.PI * 2); ctx.fill();
                    depthLabel(ctx, placed, 'F（近軸會聚點）', xF, cy + 18, C.green, w, 'center');
                }
                // 光線
                const hs = L.heights(p), thin = p.mode === 'many';
                const segPath = (s, color, width, alpha, dash) => {
                    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
                    ctx.beginPath(); ctx.moveTo(...s.a); ctx.lineTo(...s.b); ctx.stroke(); ctx.restore();
                };
                const traces = hs.map((hh) => halfCylTrace(cx, cy, R, p.n, hh * R, g.xStart, xEnd));
                traces.forEach((tr) => {
                    tr.segs.forEach((s) => {
                        const col = s.kind === 'tir' ? C.rose : FIBER_RAY;
                        segPath(s, col, thin ? 1.3 : 2.2, thin ? 0.85 : 1);
                        if (!thin && s.kind === 'in') {             // 方向箭頭
                            const mx = (s.a[0] + s.b[0]) / 2;
                            if (s.b[0] - s.a[0] > 60) arrow(ctx, mx - 12, s.a[1], mx + 10, s.a[1], FIBER_RAY, 2.2);
                        }
                    });
                    if (p.weak) tr.events.filter((e) => e.refl).forEach((e) => {
                        segPath({ a: e.p, b: [e.p[0] + e.refl.d[0] * R * 0.6, e.p[1] + e.refl.d[1] * R * 0.6] }, FIBER_RAY, 1.4, Math.min(0.9, 0.2 + e.refl.R * 3), [4, 3]);
                    });
                });
                // 名稱與拖曳把手
                if (p.mode !== 'many') hs.forEach((hh, i) => {
                    const y = cy - hh * R;
                    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = FIBER_RAY; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(g.xStart, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    if (p.mode === 'five') labelFit(ctx, HC_NAMES[i], g.xStart - 10, y + 5, C.ink, 14, 'right', { clampW: w });
                });
                // 一條光線：在圓弧面標出法線與入射角
                if (p.mode === 'one') {
                    const ev = traces[0].events[0];
                    if (ev && ev.curved) {
                        const nIn = [-ev.nOut[0], -ev.nOut[1]];
                        dashed(ctx, cx, cy, ev.p[0] + ev.nOut[0] * 50, ev.p[1] + ev.nOut[1] * 50, 'rgba(18,49,58,0.7)');
                        const a1 = Math.atan2(nIn[1], nIn[0]), back = [-ev.dIn[0], -ev.dIn[1]];
                        let dA = Math.atan2(back[1], back[0]) - a1;
                        while (dA > Math.PI) dA -= 2 * Math.PI; while (dA < -Math.PI) dA += 2 * Math.PI;
                        const col = ev.tir ? C.rose : C.green;
                        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ev.p[0], ev.p[1], 26, a1, a1 + dA, dA < 0); ctx.stroke();
                        if (Math.abs(p.h) > 0.02) {
                            // h 的標示：從軸到光線的鉛直距離
                            ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
                            const xh = cx + 14;
                            ctx.beginPath(); ctx.moveTo(xh, cy); ctx.lineTo(xh, ev.p[1]); ctx.stroke();
                            depthLabel(ctx, placed, `h = ${Math.abs(p.h).toFixed(2)} R`, xh + 6, (cy + ev.p[1]) / 2 + 4, C.ink, w, 'left');
                            depthLabel(ctx, placed, 'R', (cx + ev.p[0]) / 2 + 6, (cy + ev.p[1]) / 2 + (p.h > 0 ? 14 : -4), C.ink, w, 'left');
                        }
                        const txt = ev.tir ? `入射角 ${ev.inc.toFixed(1)}° ≥ 臨界角 ${deg(Math.asin(1 / p.n)).toFixed(1)}°：全反射`
                            : `入射角 ${ev.inc.toFixed(1)}° < 臨界角 ${deg(Math.asin(Math.min(1, 1 / p.n))).toFixed(1)}°：折射穿出`;
                        depthLabel(ctx, placed, txt, Math.min(w - 8, ev.p[0] + 30), ev.p[1] + (p.h >= 0 ? -34 : 44), col, w, 'left');
                    }
                }
                if (p.mode !== 'many') depthLabel(ctx, placed, p.mode === 'five' ? '上下拖曳左邊的圓點，改變每條光的高度' : '上下拖曳左邊的圓點，改變光的高度', 8, 18, C.muted, w, 'left');
                depthLabel(ctx, placed, '紅線：全反射後的光', w - 8, 18, C.rose, w, 'right');
            }
        };

