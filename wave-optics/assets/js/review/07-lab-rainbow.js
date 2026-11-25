// 互動實驗：彩虹
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 9d. 彩虹：水滴中的光路、顏色順序、為什麼是圓形 ------------------------ */
        LABS.rainbow = {
            name: '彩虹：水滴中的光路與彩虹的形成',
            tag: 'N14',
            wide: true,
            hint: '',
            hintFor: (p) => ({
                drop: '陽光從左邊射進一顆水滴：先折射進入、在水滴背面反射、再折射出來。調整入射高度 b，看出射光和「往太陽的方向」夾多少角；勾選「一整排平行光」，看出射光在哪個角度最密集。右圖畫出每條光線的出射角，最高點附近一大片光線擠在同一個角度，那就是彩虹角。',
                color: '左邊是側視圖：太陽在觀察者背後，眼睛看向和太陽光同方向的「反日點」。只有和反日點夾約 42° 的水滴，送出的光剛好進入眼睛。紅光的彩虹角比紫光大，所以送紅光進眼睛的水滴比較高——主虹紅色在外、紫色在內。右邊是依物理計算畫出的天空。',
                circle: '左邊是 3D 圖（拖曳旋轉）：從太陽經過觀察者頭頂畫一條軸線（指向反日點），所有和這條軸線夾 42° 的水滴排成一個圓錐，看起來就是一個圓。地面把圓的下半截切掉，所以平常只看到圓弧；勾選「在飛機上」，下方也有雨，就能看到完整的圓。'
            })[p.mode] || '',
            noteFor: (p) => ({
                drop: '<b>為什麼集中在 42°</b>：入射高度 b 從 0 增加到 1，出射角先變大再變小，在最大值附近變化很慢，很多不同 b 的光線都擠在這個角度，所以特別亮。<br><b>色散</b>：紫光的折射率比紅光大，偏折得比較多，最大出射角比較小（紫約 40.4°、紅約 42.5°）。<br><b>副虹</b>：在水滴裡反射兩次，最小出射角約 50°–53°，順序和主虹相反；每多反射一次光就弱一些，所以副虹比較暗。',
                color: '<b>顏色順序</b>：主虹紅 42.5° 在外、紫 40.4° 在內；副虹紅 50.1° 在內、紫 54.0° 在外，正好相反。<br><b>主虹內側比較亮</b>：出射角小於彩虹角的光也會射出，混成白光，所以主虹裡面的天空比外面亮。<br><b>亞歷山大暗帶</b>：42° 到 50° 之間，主虹和副虹的光都到不了，比兩側都暗。<br><b>太陽愈高，彩虹愈低</b>：主虹頂端的仰角 ≈ 42° − 太陽仰角；太陽高於 42° 時，從地面看不到主虹，所以彩虹多在早上或傍晚出現。',
                circle: '<b>彩虹的中心是反日點</b>：從太陽經過你的頭畫直線，延伸到前方地面下的那一點；你頭的影子就落在這個方向上。<br><b>每個人看到的彩虹都不一樣</b>：圓錐以你的眼睛為頂點，換個位置，送光進你眼睛的就是另一批水滴，所以彩虹永遠走不到。<br><b>為什麼平常只看到圓弧</b>：圓錐下半截伸到地面以下，那裡沒有雨滴；從飛機上往下看，下方也有雨，就可能看到完整的圓。'
            })[p.mode] || '',
            teach: `
                <h4>教學：彩虹是怎麼形成的？</h4>
                <h5>1. 一顆水滴裡的光路</h5>
                <p>陽光照到球形的水滴：在前表面<b>折射</b>進入，在後表面<b>反射</b>一次，再從前表面<b>折射</b>出來。兩次折射讓不同顏色的光分開（色散），反射讓光往回走，所以看彩虹時<b>太陽一定在你的背後</b>。</p>
                <h5>2. 為什麼集中在 42° 附近</h5>
                <p>從水滴不同高度進來的光，出來的方向都不一樣，但出射角有一個最大值（紅光約 42°）。在最大值附近，入射高度變了很多，出射角卻幾乎不變，所以<b>大量光線擠在同一個角度</b>，看起來特別亮——這就是彩虹角。上方「單顆水滴」模式的右圖，曲線頂端平平的那一段就是原因。</p>
                <h5>3. 為什麼顏色是紅在外、紫在內</h5>
                <ul>
                    <li>水對紫光的折射率（約 1.345）比紅光（約 1.330）大，紫光偏折得多，最大出射角比較小：紅約 42.5°、紫約 40.4°。</li>
                    <li>你看到的每一種顏色，來自<b>不同的水滴</b>：紅光要從比較高的水滴（和反日點夾 42.5°）射進你的眼睛，紫光則來自比較低的水滴（40.4°）。所以主虹<b>紅色在外圈、紫色在內圈</b>。</li>
                    <li>副虹在水滴裡反射兩次，光路翻轉，最小出射角紅約 50.1°、紫約 54.0°，所以副虹<b>紅在內、紫在外</b>，順序和主虹相反，也比較暗。</li>
                    <li>主虹裡面比外面亮；主虹和副虹之間有一條比較暗的帶子，叫做<b>亞歷山大暗帶</b>。</li>
                </ul>
                <h5>4. 為什麼是圓形</h5>
                <p>從太陽經過你的眼睛畫一條直線，往前延伸到「反日點」（就是你頭的影子所在的方向）。所有和這條線夾 42° 的水滴，都能把紅光送進你的眼睛；這些方向繞著軸線排成一個<b>圓錐</b>，從你的眼睛看出去就是一個<b>以反日點為圓心的圓</b>。地面以下沒有雨滴，圓的下半截被切掉，所以平常只看到圓弧；太陽愈低，露出的圓弧愈大。</p>
                <p class="teach-tip">彩虹不是掛在某個地方的東西：它是一個「方向」。換一個位置，送光進你眼睛的就是另一批水滴，所以彩虹永遠追不到；站在你旁邊的人，看到的也是另一道彩虹。</p>
                <h5>5. 真實照片</h5>
                <div class="teach-photos">
                    <figure>
                        <img src="assets/images/real/double-rainbow-alaska.jpg" alt="阿拉斯加的雙彩虹：主虹紅色在外，副虹顏色相反，中間較暗，畫面下方有拍攝者的影子" loading="lazy">
                        <figcaption><b>雙彩虹</b>：主虹紅色在外圈；外側較淡的副虹顏色相反（紅在內）。主虹裡面的天空比較亮，主虹和副虹之間較暗（亞歷山大暗帶）。畫面最下方是拍攝者的影子，正好在彩虹圓心（反日點）的方向。
                            <small>Eric Rolph，<a href="https://creativecommons.org/licenses/by-sa/2.5/" target="_blank" rel="noopener">CC BY-SA 2.5</a>，<a href="https://commons.wikimedia.org/wiki/File:Double-alaskan-rainbow.jpg" target="_blank" rel="noopener">Wikimedia Commons</a></small></figcaption>
                    </figure>
                </div>
                <h5>6. 完整圓形彩虹：影片對照</h5>
                <p>搭配上方「為什麼是圓形」模式，勾選「在飛機上（下方也有雨）」，再比較從高樓與空中拍攝的彩虹。</p>
                <div class="resonance-case-grid">
                    <article class="resonance-case">
                        <h4>從台北 101 看全圓形彩虹</h4>
                        <p class="resonance-question"><b>帶著問題看</b>從高處往下看，為什麼有機會看見平常在地面看不到的下半圈？</p>
                        <details class="resonance-player" ontoggle="toggleResonanceVideo(this)">
                            <summary>觀看影片：台北 101 的全圓形彩虹</summary>
                            <div class="resonance-video" data-youtube-id="7QmLToWupFk" data-video-title="101大樓上拍到的360度全圓形彩虹(circle rainbow)"></div>
                        </details>
                        <a class="resonance-original" href="https://www.youtube.com/watch?v=7QmLToWupFk" target="_blank" rel="noopener">在 YouTube 開啟：台北 101 全圓形彩虹 ↗</a>
                        <p class="resonance-credit">影片來源：asblachen · 101大樓上拍到的360度全圓形彩虹(circle rainbow)</p>
                    </article>
                    <article class="resonance-case">
                        <h4>跳傘時看見完整圓形彩虹</h4>
                        <p class="resonance-question"><b>帶著問題看</b>把圓形彩虹想成以眼睛為頂點的圓錐：圓心方向、太陽與觀察者之間有什麼關係？</p>
                        <details class="resonance-player" ontoggle="toggleResonanceVideo(this)">
                            <summary>觀看影片：跳傘者眼中的圓形彩虹</summary>
                            <div class="resonance-video" data-youtube-id="3RHfkatTPHU" data-video-title="Skydivers capture full circle rainbow in magical airborne moment"></div>
                        </details>
                        <a class="resonance-original" href="https://www.youtube.com/watch?v=3RHfkatTPHU" target="_blank" rel="noopener">在 YouTube 開啟：跳傘全圓形彩虹 ↗</a>
                        <p class="resonance-credit">影片來源：6abc Philadelphia · Skydivers capture full circle rainbow in magical airborne moment</p>
                    </article>
                </div>
                <p class="resonance-intro">點開才載入影片，收合即停止播放。若內嵌影片無法播放，可使用各卡片的 YouTube 原始連結。</p>`,
            height: (p, w) => w >= 640 ? 440 : 760,
            modes: [
                { key: 'drop', label: '單顆水滴：光路與彩虹角' },
                { key: 'color', label: '為什麼紅在外、紫在內' },
                { key: 'circle', label: '為什麼是圓形' }
            ],
            controls: [
                { key: 'k', label: '在水滴裡反射', value: 1, only: ['drop'], fmt: () => '', options: [{ value: 1, label: '一次（主虹）' }, { value: 2, label: '兩次（副虹）' }] },
                { key: 'hue', label: '光的顏色', value: 'all', only: ['drop'], fmt: () => '', options: [{ value: 'all', label: '白光（全部色光）' }, { value: 'red', label: '只看紅光' }, { value: 'violet', label: '只看紫光' }] },
                { key: 'b', label: '入射高度 b（水滴半徑 = 1）', min: 0, max: 0.99, step: 0.01, value: 0.86, only: ['drop'], fmt: (v) => Number(v).toFixed(2) },
                { key: 'many', label: '顯示一整排平行光', type: 'checkbox', value: false, only: ['drop'] },
                { key: 'sun', label: '太陽仰角', min: 0, max: 60, step: 1, value: 15, only: ['color', 'circle'], fmt: (v) => `${v}°` },
                { key: 'sec', label: '顯示副虹', type: 'checkbox', value: true, only: ['color', 'circle'] },
                { key: 'plane', label: '在飛機上（下方也有雨）', type: 'checkbox', value: false, only: ['circle'] }
            ],
            // 水的折射率（Cauchy 型經驗式，λ 以 nm 計）：400 nm ≈ 1.346、700 nm ≈ 1.330
            nOf: (lam) => 1.3199 + 6878 / lam ** 2 - 1.132e9 / lam ** 4 + 1.11e14 / lam ** 6,
            // 波長 → 螢幕顏色（近似）
            rgbOf: (lam) => {
                let r = 0, g = 0, b = 0;
                if (lam < 440) { r = (440 - lam) / 60; b = 1; }
                else if (lam < 490) { g = (lam - 440) / 50; b = 1; }
                else if (lam < 510) { g = 1; b = (510 - lam) / 20; }
                else if (lam < 580) { r = (lam - 510) / 70; g = 1; }
                else if (lam < 645) { r = 1; g = (645 - lam) / 65; }
                else r = 1;
                const fall = lam < 420 ? 0.3 + 0.7 * (lam - 380) / 40 : lam > 680 ? 0.3 + 0.7 * (750 - lam) / 70 : 1;
                return [r * fall, g * fall, b * fall];
            },
            css: (rgb, a = 1) => `rgba(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)},${a})`,
            // 出射光和「往太陽的方向」的夾角（就是看到它的方向和反日點的夾角）：k 次內部反射
            thetaOf: (b, n, k) => {
                const i = Math.asin(b), r = Math.asin(b / n);
                return k === 1 ? 4 * r - 2 * i : Math.PI + 2 * i - 6 * r;
            },
            // 彩虹角：主虹取最大值、副虹取最小值；cos²i = (n² − 1) / (k² + 2k)
            bowAngle: (n, k) => {
                const ci = Math.sqrt((n * n - 1) / (k * k + 2 * k));
                return LABS.rainbow.thetaOf(Math.sqrt(1 - ci * ci), n, k);
            },
            /* 天空亮度表：每個波長取許多條平行光（依截面積均勻取樣入射高度），統計出射角，
             * 除以 sinθ 換成每單位立體角的亮度，再用太陽的視角大小（約 0.5°）抹平。副虹乘 0.43 表示多反射一次變暗。 */
            skyTable: () => {
                const L = LABS.rainbow;
                if (L._tbl) return L._tbl;
                const lams = [], bins = 1800, N = 6000, rgb = new Float32Array(bins * 3);
                for (let lam = 400; lam <= 700; lam += 12.5) lams.push(lam);
                lams.forEach((lam) => {
                    const n = L.nOf(lam), c = L.rgbOf(lam), hist = new Float32Array(bins);
                    for (let j = 0; j < N; j++) {
                        const b = Math.sqrt((j + 0.5) / N);
                        [[1, 1], [2, 0.43]].forEach(([k, wgt]) => {
                            const th = deg(L.thetaOf(b, n, k));
                            if (th > 0 && th < 90) hist[Math.floor(th * 20)] += wgt;
                        });
                    }
                    const sm = new Float32Array(bins);
                    for (let q = 0; q < bins; q++) {
                        let s = 0;
                        for (let d = -5; d <= 5; d++) s += hist[Math.min(bins - 1, Math.max(0, q + d))];
                        sm[q] = s / 11 / Math.max(0.05, Math.sin(rad((q + 0.5) / 20)));
                    }
                    for (let q = 0; q < bins; q++) { rgb[q * 3] += sm[q] * c[0]; rgb[q * 3 + 1] += sm[q] * c[1]; rgb[q * 3 + 2] += sm[q] * c[2]; }
                });
                let peak = 0;
                for (let q = 300 * 2; q < bins * 3; q++) peak = Math.max(peak, rgb[q]);
                for (let q = 0; q < rgb.length; q++) rgb[q] /= peak;
                L._tbl = rgb;
                return rgb;
            },
            readouts: (p) => {
                const L = LABS.rainbow, nr = L.nOf(700), nv = L.nOf(405);
                if (p.mode === 'drop') {
                    const k = Number(p.k), b = Number(p.b);
                    return [
                        { label: '入射角 i', value: `${deg(Math.asin(b)).toFixed(1)}°` },
                        { label: '紅光出射角', value: `${deg(L.thetaOf(b, nr, k)).toFixed(1)}°` },
                        { label: '紫光出射角', value: `${deg(L.thetaOf(b, nv, k)).toFixed(1)}°` },
                        { label: k === 1 ? '彩虹角（最大出射角）' : '副虹角（最小出射角）', value: `紅 ${deg(L.bowAngle(nr, k)).toFixed(1)}°　紫 ${deg(L.bowAngle(nv, k)).toFixed(1)}°` },
                        { label: '水的折射率', value: `紅 ${nr.toFixed(3)}　紫 ${nv.toFixed(3)}` }
                    ];
                }
                const e = Number(p.sun), top1 = deg(L.bowAngle(nr, 1)) - e, top2 = deg(L.bowAngle(nr, 2)) - e;
                const vis = (a) => a > 0 ? `${a.toFixed(1)}°` : '在地平線下（看不到）';
                return [
                    { label: '太陽仰角', value: `${e}°` },
                    { label: '主虹頂端的仰角', value: vis(top1) },
                    { label: '副虹頂端的仰角', value: vis(top2) },
                    { label: '主虹半徑（角）', value: `紅 ${deg(L.bowAngle(nr, 1)).toFixed(1)}°　紫 ${deg(L.bowAngle(nv, 1)).toFixed(1)}°` }
                ];
            },
            setup: ({ canvas, params, disposers, paint }) => {
                // 「為什麼是圓形」的 3D 圖：拖曳旋轉
                let last = null;
                const local = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
                const inPanel = ([x, y]) => { const b = params._panel; return params.mode === 'circle' && b && x >= b.x0 && x <= b.x0 + b.w && y >= b.y0 && y <= b.y0 + b.h; };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    const pt = local(e);
                    if (!inPanel(pt)) return;
                    last = pt; canvas.style.cursor = 'grabbing';
                    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* 不支援時略過 */ }
                });
                disposers.addEventListener(canvas, 'pointermove', (e) => {
                    const pt = local(e);
                    if (!last) { canvas.style.cursor = inPanel(pt) ? 'grab' : ''; return; }
                    const v = params._view || (params._view = { yaw: rad(-35), pitch: rad(18) });
                    v.yaw += (pt[0] - last[0]) * 0.01;
                    v.pitch = Math.max(rad(-10), Math.min(rad(80), v.pitch + (pt[1] - last[1]) * 0.01));
                    last = pt; paint();
                });
                const end = () => { last = null; canvas.style.cursor = ''; };
                disposers.addEventListener(canvas, 'pointerup', end);
                disposers.addEventListener(canvas, 'pointercancel', end);
                canvas.style.touchAction = 'pan-y';
            },
            draw: (ctx, w, h, p) => {
                const L = LABS.rainbow, wide = w >= 640;
                const aw = wide ? Math.round(w * 0.56) : w, ah = wide ? h : Math.round(h * 0.52);
                const bx = wide ? aw + 10 : 0, by = wide ? 0 : ah + 10, bw = wide ? w - aw - 10 : w, bh = wide ? h : h - ah - 10;
                p._panel = { x0: 0, y0: 0, w: aw, h: ah };
                if (p.mode === 'drop') { L.drawDrop(ctx, 0, 0, aw, ah, p); L.drawPlot(ctx, bx, by, bw, bh, p); }
                else {
                    if (p.mode === 'color') L.drawSide(ctx, 0, 0, aw, ah, p); else L.drawCone(ctx, 0, 0, aw, ah, p);
                    L.drawSky(ctx, bx, by, bw, bh, p);
                }
            },
            /* 單顆水滴：在單位圓上做光線追跡（入射 → 折射 → k 次反射 → 折射出去） */
            trace: (b, n, k) => {
                const d0 = [1, 0], P1 = [-Math.sqrt(1 - b * b), b];
                const dot = (a, c) => a[0] * c[0] + a[1] * c[1];
                const refract = (d, N, eta) => {   // N 朝向入射光的一側
                    const ci = -dot(N, d), kk = 1 - eta * eta * (1 - ci * ci);
                    const t = eta * ci - Math.sqrt(Math.max(0, kk));
                    return [eta * d[0] + t * N[0], eta * d[1] + t * N[1]];
                };
                const pts = [P1];
                let d = refract(d0, P1, 1 / n), P = P1;
                for (let j = 0; j < k; j++) {
                    const s = -2 * dot(P, d);
                    P = [P[0] + s * d[0], P[1] + s * d[1]];
                    pts.push(P);
                    const c = 2 * dot(d, P);
                    d = [d[0] - c * P[0], d[1] - c * P[1]];
                }
                const s = -2 * dot(P, d);
                P = [P[0] + s * d[0], P[1] + s * d[1]];
                pts.push(P);
                const out = refract(d, [-P[0], -P[1]], n);
                return { pts, out };
            },
            drawDrop: (ctx, x0, y0, aw, ah, p) => {
                const L = LABS.rainbow, k = Number(p.k), b = Number(p.b);
                const R = Math.min(aw * 0.28, ah * 0.32), cx = x0 + aw * 0.52, cy = y0 + ah * 0.4;
                const X = (q) => cx + q[0] * R, Y = (q) => cy - q[1] * R;
                ctx.fillStyle = '#f4f7f8'; ctx.fillRect(x0, y0, aw, ah);
                // 水滴
                const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
                g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(150,205,225,0.55)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(11,111,146,0.7)'; ctx.lineWidth = 1.6; ctx.stroke();
                const lams = p.hue === 'red' ? [700] : p.hue === 'violet' ? [405] : [700, 640, 590, 550, 500, 460, 405];
                const ray = (bb, lam, alpha, wid) => {
                    const n = L.nOf(lam), t = L.trace(bb, n, k), col = L.css(L.rgbOf(lam), alpha);
                    const P0 = t.pts[0], last = t.pts[t.pts.length - 1], far = Math.max(aw, ah) / R * 1.5;
                    ctx.strokeStyle = col; ctx.lineWidth = wid;
                    ctx.beginPath(); ctx.moveTo(X(P0), Y(P0)); t.pts.slice(1).forEach((q) => ctx.lineTo(X(q), Y(q)));
                    ctx.lineTo(X([last[0] + t.out[0] * far, last[1] + t.out[1] * far]), Y([last[0] + t.out[0] * far, last[1] + t.out[1] * far]));
                    ctx.stroke();
                    return t;
                };
                // 入射的白光
                const incoming = (bb, alpha, wid) => {
                    const P0 = [-Math.sqrt(1 - bb * bb), bb];
                    ctx.strokeStyle = `rgba(230,170,20,${alpha})`; ctx.lineWidth = wid;
                    ctx.beginPath(); ctx.moveTo(x0 + 6, Y(P0)); ctx.lineTo(X(P0), Y(P0)); ctx.stroke();
                };
                ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, aw, ah); ctx.clip();
                if (p.many) {
                    for (let bb = 0.02; bb < 1; bb += 0.04) { incoming(bb, 0.35, 1); lams.forEach((lam) => ray(bb, lam, lams.length > 1 ? 0.28 : 0.45, 1)); }
                }
                incoming(b, 1, 2.2);
                let tr = null;
                lams.forEach((lam) => { const t = ray(b, lam, 1, lams.length > 1 ? 1.6 : 2.4); if (lam === lams[0]) tr = t; });
                // 出射點：畫「往太陽的方向」虛線與夾角
                const E = tr.pts[tr.pts.length - 1], th = Math.acos(Math.max(-1, Math.min(1, -tr.out[0])));
                const ex = X(E), ey = Y(E), len = R * 0.9;
                dashed(ctx, ex, ey, ex - len, ey, C.muted);
                const a0 = Math.PI, a1r = Math.atan2(-tr.out[1], tr.out[0]), a1 = a1r < 0 ? a1r + 2 * Math.PI : a1r;
                ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(ex, ey, R * 0.35, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
                // 角度標在夾角的角平分線上
                const am = (a0 + a1) / 2;
                labelFit(ctx, `${deg(th).toFixed(1)}°`, ex + Math.cos(am) * R * 0.55, ey + Math.sin(am) * R * 0.55 + 4, C.ink, 12, 'center', { clampW: x0 + aw, plate: 1 });
                labelFit(ctx, '往太陽的方向', ex - len, ey - 6, C.muted, 10, 'left', { clampW: x0 + aw, plate: 1 });
                // 標註光路
                const lbl = (q, text, dx, dy) => labelFit(ctx, text, X(q) + dx, Y(q) + dy, C.ink, 11, 'left', { clampW: x0 + aw, plate: 1 });
                lbl(tr.pts[0], '① 折射進入', -78, -8);
                tr.pts.slice(1, -1).forEach((q, j) => lbl(q, k === 2 ? `② 反射（第 ${j + 1} 次）` : '② 在背面反射', 8, 4));
                lbl(E, '③ 折射出來', 8, tr.out[1] < 0 ? 16 : -8);
                ctx.restore();
                labelFit(ctx, '陽光 →', x0 + 10, Y([0, b]) - 8, '#b8860b', 11, 'left', { plate: 1 });
                label(ctx, '單顆水滴（剖面）', x0 + 10, y0 + 18, C.ink, 12);
            },
            drawPlot: (ctx, x0, y0, pw, ph, p) => {
                const L = LABS.rainbow, k = Number(p.k), b = Number(p.b);
                ctx.fillStyle = '#fff'; ctx.fillRect(x0, y0, pw, ph);
                ctx.strokeStyle = C.grid; ctx.strokeRect(x0, y0, pw, ph);
                const mx = 46, mt = 40, mb = 62, gx = x0 + mx, gy = y0 + mt, gw = pw - mx - 16, gh = ph - mt - mb;
                const [lo, hi] = k === 1 ? [0, 50] : [40, 90];
                const PX = (bb) => gx + bb * gw, PY = (th) => gy + gh - (th - lo) / (hi - lo) * gh;
                label(ctx, `每條光線的出射角（${k === 1 ? '主虹' : '副虹'}）`, x0 + 10, y0 + 18, C.ink, 12);
                ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
                for (let t = lo; t <= hi; t += 10) {
                    ctx.beginPath(); ctx.moveTo(gx, PY(t)); ctx.lineTo(gx + gw, PY(t)); ctx.stroke();
                    label(ctx, `${t}°`, gx - 6, PY(t) + 4, C.muted, 10, 'right');
                }
                [0, 0.25, 0.5, 0.75, 1].forEach((bb) => label(ctx, bb.toFixed(2), PX(bb), gy + gh + 14, C.muted, 10, 'center'));
                label(ctx, '入射高度 b', gx + gw / 2, gy + gh + 30, C.muted, 10, 'center');
                ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
                [[700, 'red'], [405, 'violet']].forEach(([lam]) => {
                    const n = L.nOf(lam), col = L.css(L.rgbOf(lam));
                    const bow = deg(L.bowAngle(n, k));
                    ctx.fillStyle = L.css(L.rgbOf(lam), 0.12);
                    ctx.fillRect(gx, PY(bow) - 4, gw, 8);
                    ctx.strokeStyle = col; ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let q = 0; q <= 200; q++) { const bb = q / 200 * 0.999, th = deg(L.thetaOf(bb, n, k)); if (q) ctx.lineTo(PX(bb), PY(th)); else ctx.moveTo(PX(bb), PY(th)); }
                    ctx.stroke();
                    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(PX(b), PY(deg(L.thetaOf(b, n, k))), 4.5, 0, Math.PI * 2); ctx.fill();
                    dashed(ctx, gx, PY(bow), gx + gw, PY(bow), col);
                    labelFit(ctx, `${lam > 600 ? '紅' : '紫'} ${bow.toFixed(1)}°`, gx + 4, PY(bow) + (lam > 600 ? (k === 1 ? -6 : 14) : (k === 1 ? 14 : -6)), col, 10, 'left', { plate: 1 });
                });
                ctx.restore();
                labelWrap(ctx, k === 1 ? '曲線頂端平平的：很多條光線擠在同一個角度　→ 特別亮，就是彩虹角' : '曲線底部平平的：很多條光線擠在同一個角度　→ 副虹角', x0 + 10, y0 + ph - 10 - (pw < 330 ? 13 : 0), C.muted, 10, 13, pw - 20);
            },
            /* 側視圖：觀察者、陽光、反日點方向，以及把紅光、紫光送進眼睛的水滴 */
            drawSide: (ctx, x0, y0, aw, ah, p) => {
                const L = LABS.rainbow, e = rad(Number(p.sun));
                ctx.fillStyle = '#f4f7f8'; ctx.fillRect(x0, y0, aw, ah);
                const gy = y0 + ah * 0.8, ex = x0 + aw * 0.2, ey = gy - 22, Rr = Math.min(aw * 0.72, ah * 1.1) * 0.75;
                // 雨區、地面
                ctx.fillStyle = 'rgba(90,110,130,0.10)'; ctx.fillRect(x0 + aw * 0.45, y0 + 24, aw * 0.55, gy - y0 - 24);
                ctx.strokeStyle = 'rgba(90,110,130,0.25)'; ctx.lineWidth = 1;
                for (let xx = x0 + aw * 0.47; xx < x0 + aw; xx += 14) for (let yy = y0 + 30; yy < gy - 8; yy += 22) { ctx.beginPath(); ctx.moveTo(xx + (yy % 7), yy); ctx.lineTo(xx + (yy % 7) - 2, yy + 8); ctx.stroke(); }
                ctx.fillStyle = '#d9cdb5'; ctx.fillRect(x0, gy, aw, ah - (gy - y0));
                ctx.strokeStyle = '#8a7a5a'; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + aw, gy); ctx.stroke();
                // 陽光（平行，從左上往右下）
                const sx = Math.cos(e), sy = Math.sin(e);
                ctx.strokeStyle = 'rgba(230,170,20,0.55)'; ctx.lineWidth = 1.4;
                for (let j = -2; j <= 2; j++) {
                    const ox = ex - 60 - j * 18 * sy, oy = ey - 60 + j * 18 * sx;
                    arrow(ctx, ox - sx * 60, oy - sy * 60, ox + sx * 30, oy + sy * 30, 'rgba(230,170,20,0.7)', 1.4);
                }
                labelFit(ctx, `陽光（太陽仰角 ${p.sun}°）`, x0 + 8, y0 + 40, '#b8860b', 11, 'left', { plate: 1 });
                // 反日點方向：沿陽光方向從眼睛往前下方
                dashed(ctx, ex, ey, ex + sx * Rr, ey + sy * Rr, C.muted);
                const tg = sy > 0.01 ? (gy - ey) / sy : Rr;
                labelFit(ctx, '反日點方向（頭的影子）', ex + sx * Math.min(tg, Rr) + 6, Math.min(gy, ey + sy * Rr) + 14, C.muted, 10, 'left', { clampW: x0 + aw, plate: 1 });
                // 觀察者
                ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(ex, ey - 6, 5, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ex, ey - 1); ctx.lineTo(ex, gy); ctx.stroke();
                const bows = [[700, 1, 1], [405, 1, 1]];
                if (p.sec) bows.push([700, 2, 0.55], [405, 2, 0.55]);
                const drop = (x, y, r) => { ctx.fillStyle = 'rgba(150,205,225,0.9)'; ctx.strokeStyle = 'rgba(11,111,146,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };
                bows.forEach(([lam, k, a], j) => {
                    const th = L.bowAngle(L.nOf(lam), k), elev = th - e;   // 從眼睛看這顆水滴的仰角
                    const dist = Rr * (k === 1 ? 0.92 : 1.0);
                    const dx = ex + Math.cos(elev) * dist, dy = ey - Math.sin(elev) * dist;
                    const col = L.css(L.rgbOf(lam), a);
                    if (dy > gy) return;
                    ctx.strokeStyle = 'rgba(230,170,20,0.6)'; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(dx - sx * 40, dy - sy * 40); ctx.lineTo(dx, dy); ctx.stroke();
                    ctx.strokeStyle = col; ctx.lineWidth = k === 1 ? 2.2 : 1.6; if (k === 2) ctx.setLineDash([6, 4]);
                    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
                    drop(dx, dy, 6);
                    const red = lam > 600;
                    labelFit(ctx, `${k === 1 ? '主虹' : '副虹'}${red ? '紅' : '紫'} ${deg(th).toFixed(1)}°`, dx + (red ? -9 : 9), dy + 4, L.css(L.rgbOf(lam)), 11, red ? 'right' : 'left', { clampW: x0 + aw, plate: 1 });
                    if (j === 0) {
                        // 和反日點方向的夾角
                        ctx.strokeStyle = L.css(L.rgbOf(lam)); ctx.lineWidth = 1.2;
                        ctx.beginPath(); ctx.arc(ex, ey, 46, -elev, e); ctx.stroke();
                    }
                });
                const top1 = deg(L.bowAngle(L.nOf(700), 1)) - Number(p.sun);
                const by2 = y0 + ah - 26;
                if (top1 <= 0) labelWrap(ctx, '太陽太高：和反日點夾 42° 的方向都在地平線下　→ 從地面看不到主虹', x0 + 10, by2, C.rose, 11, 14, aw - 20);
                else labelWrap(ctx, '紅光來自比較高的水滴、紫光來自比較低的水滴　→ 主虹紅在外、紫在內；副虹相反', x0 + 10, by2, C.ink, 11, 14, aw - 20);
                label(ctx, '側視圖：哪些水滴把光送進眼睛', x0 + 10, y0 + 18, C.ink, 12);
            },
            /* 3D：以眼睛為頂點、反日點方向為軸、半角 42° 的圓錐；可拖曳旋轉 */
            drawCone: (ctx, x0, y0, aw, ah, p) => {
                const L = LABS.rainbow, e = rad(Number(p.sun));
                const view = p._view || (p._view = { yaw: rad(-35), pitch: rad(18) });
                const cyw = Math.cos(view.yaw), syw = Math.sin(view.yaw), cpv = Math.cos(view.pitch), spv = Math.sin(view.pitch);
                ctx.fillStyle = '#f4f7f8'; ctx.fillRect(x0, y0, aw, ah);
                const S = 10, D = 34, F = Math.min(aw, ah) * 0.9;
                const cx = x0 + aw * 0.5, cy = y0 + ah * 0.55;
                // 世界座標：觀察者在原點，y 往前（背對太陽），z 往上
                const P = (q) => {
                    const x1 = cyw * q[0] - syw * (q[1] - 5), y1 = syw * q[0] + cyw * (q[1] - 5), z = q[2];
                    const depth = y1 * cpv - z * spv + D;
                    return [cx + F * x1 / depth, cy - F * (y1 * spv + z * cpv) / depth];
                };
                const line = (a, b, col, wd, dash) => { const A = P(a), B = P(b); ctx.save(); if (dash) ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = wd || 1.4; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.restore(); };
                // 地面
                const gpts = [[-14, -6, 0], [14, -6, 0], [14, 22, 0], [-14, 22, 0]].map(P);
                if (!p.plane) { ctx.fillStyle = 'rgba(200,185,150,0.45)'; ctx.beginPath(); gpts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fill(); }
                const eye = [0, 0, p.plane ? 6 : 1.6];
                // 軸：從太陽方向經過眼睛到反日點
                const ax = [0, Math.cos(e), -Math.sin(e)];
                const along = (t) => [eye[0] + ax[0] * t, eye[1] + ax[1] * t, eye[2] + ax[2] * t];
                line(along(-8), eye, 'rgba(230,170,20,0.9)', 2);
                line(eye, along(S + 2), C.muted, 1.4, [5, 4]);
                // 圓錐上的水滴：和軸夾 θ 的方向，距離 S；地面以下（非飛機）畫成淡虛線
                const u1 = [1, 0, 0], u2 = [0, Math.sin(e), Math.cos(e)];   // 垂直於軸的兩個單位向量
                const rings = [[700, 1], [405, 1]];
                if (p.sec) rings.push([700, 2], [405, 2]);
                rings.forEach(([lam, k]) => {
                    const th = L.bowAngle(L.nOf(lam), k), col = L.rgbOf(lam), a = k === 1 ? 1 : 0.6;
                    let prev = null, prevUp = null;
                    for (let j = 0; j <= 96; j++) {
                        const ph = j / 96 * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
                        const d = [ax[0] * c + (u1[0] * Math.cos(ph) + u2[0] * Math.sin(ph)) * s, ax[1] * c + (u1[1] * Math.cos(ph) + u2[1] * Math.sin(ph)) * s, ax[2] * c + (u1[2] * Math.cos(ph) + u2[2] * Math.sin(ph)) * s];
                        const q = [eye[0] + d[0] * S, eye[1] + d[1] * S, eye[2] + d[2] * S];
                        const up = p.plane || q[2] >= 0;
                        const pt = P(q);
                        if (prev) {
                            ctx.strokeStyle = L.css(col, up && prevUp ? a : 0.18); ctx.lineWidth = up && prevUp ? (k === 1 ? 3 : 2) : 1;
                            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke();
                        }
                        if (k === 1 && lam === 700 && j % 12 === 0) line(eye, q, L.css(col, up ? 0.35 : 0.12), 1);
                        prev = pt; prevUp = up;
                    }
                });
                // 觀察者與標註
                const E = P(eye);
                ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(E[0], E[1], 4, 0, Math.PI * 2); ctx.fill();
                const tagAt = (q, text, col, dx = 8, dy = 4) => { const A = P(q); labelFit(ctx, text, A[0] + dx, A[1] + dy, col, 11, 'left', { clampW: x0 + aw, plate: 1 }); };
                tagAt(eye, p.plane ? '眼睛（在飛機上）' : '眼睛', C.ink);
                tagAt(along(-8), '陽光從背後來', '#b8860b');
                tagAt(along(S + 2), '反日點（圓心）', C.muted);
                if (!p.plane) tagAt([12, 18, 0], '地面：下面沒有雨滴', '#8a7a5a', -110, 0);
                label(ctx, '3D：和反日點夾 42° 的方向排成圓錐（拖曳旋轉）', x0 + 10, y0 + 18, C.ink, 12);
                labelWrap(ctx, p.plane ? '下方也有雨滴：整個圓都看得到' : '實線：地面以上看得到的部分　淡線：被地面切掉的部分', x0 + 10, y0 + ah - 12, C.muted, 10, 13, aw - 20);
            },
            /* 眼睛看到的天空：每個像素算出視線和反日點的夾角，查亮度表疊上彩虹顏色 */
            drawSky: (ctx, x0, y0, pw, ph, p) => {
                const L = LABS.rainbow, e = Number(p.sun), plane = p.mode === 'circle' && p.plane, sec = !!p.sec;
                const key = `${e}|${plane}|${sec}|${Math.round(pw)}x${Math.round(ph)}`;
                if (L._skyKey !== key) {
                    const W = Math.max(1, Math.round(pw)), Hh = Math.max(1, Math.round(ph));
                    // 天空像素會跨影格保留，避免被其他實驗的共用暫存畫布覆蓋。
                    const off = getOffscreen(W, Hh, L._skySurface ??= {});
                    const img = off.ctx.createImageData(W, Hh), tbl = L.skyTable();
                    const er = rad(e), pitch = plane ? rad(-(e + 8)) : rad(Math.max(6, Math.min(26, (42 - e) * 0.55)));
                    const fov = plane ? rad(130) : rad(112), Fp = (W / 2) / Math.tan(fov / 2);
                    const cp = Math.cos(pitch), sp = Math.sin(pitch), A = [0, Math.cos(er), -Math.sin(er)];
                    for (let v = 0; v < Hh; v++) for (let u = 0; u < W; u++) {
                        const x = (u - W / 2) / Fp, y = (Hh / 2 - v) / Fp;
                        const d = [x, cp - sp * y, sp + cp * y], len = Math.hypot(d[0], d[1], d[2]);
                        const dz = d[2] / len;
                        let r, g, b;
                        if (dz < 0 && !plane) {   // 地面
                            const t = Math.min(1, -dz * 3);
                            r = 0.42 - 0.12 * t; g = 0.48 - 0.12 * t; b = 0.30 - 0.08 * t;
                        } else {   // 下雨的灰暗天空（飛機上則是雲海與雨）
                            const t = Math.max(0, dz);
                            r = 0.36 + 0.12 * t; g = 0.41 + 0.12 * t; b = 0.48 + 0.12 * t;
                            const th = deg(Math.acos(Math.max(-1, Math.min(1, (d[0] * A[0] + d[1] * A[1] + d[2] * A[2]) / len))));
                            if (sec || th < 46) {
                                // 疊上水滴送來的光；顯示時把彩虹成分的飽和度拉高一些，顏色才看得清楚（亮度分布仍是計算結果）
                                const q = Math.min(1799, Math.floor(th * 20)) * 3, gain = 0.5;
                                const cr = tbl[q] * gain, cg = tbl[q + 1] * gain, cb = tbl[q + 2] * gain, yl = (cr + cg + cb) / 3;
                                r += Math.max(0, yl + (cr - yl) * 1.9); g += Math.max(0, yl + (cg - yl) * 1.9); b += Math.max(0, yl + (cb - yl) * 1.9);
                            }
                        }
                        const o = (v * W + u) * 4;
                        img.data[o] = Math.min(255, r * 255); img.data[o + 1] = Math.min(255, g * 255); img.data[o + 2] = Math.min(255, b * 255); img.data[o + 3] = 255;
                    }
                    off.ctx.putImageData(img, 0, 0);
                    // 地平線與反日點（地面看不到時標在畫面上）
                    L._skyKey = key;
                    L._skyGeo = { pitch, Fp, W, Hh };
                }
                ctx.drawImage(L._skySurface.canvas, x0, y0, pw, ph);
                const g = L._skyGeo, er = rad(e);
                const toScreen = (elev) => {   // 正前方、仰角 elev 的方向在畫面上的位置
                    const d = [0, Math.cos(elev), Math.sin(elev)];
                    const cp = Math.cos(g.pitch), sp = Math.sin(g.pitch);
                    const fz = d[1] * cp + d[2] * sp, uy = -d[1] * sp + d[2] * cp;
                    return fz > 0 ? [x0 + pw / 2, y0 + ph / 2 - g.Fp * uy / fz] : null;
                };
                const opts = { clampW: x0 + pw - 2, plate: 'rgba(255,255,255,0.8)' };
                const t1 = toScreen(rad(42.3) - er), t2 = toScreen(rad(50.5) - er), hz = toScreen(0), anti = toScreen(-er);
                if (t1 && (plane || 42.3 - e > 0)) labelFit(ctx, '主虹：紅在外、紫在內', t1[0] + 6, t1[1] - 10, C.ink, 11, 'left', opts);
                if (sec && t2 && (plane || 50.5 - e > 0)) labelFit(ctx, '副虹：顏色相反', t2[0] + 6, t2[1] - 12, C.ink, 11, 'left', opts);
                if (sec && t1 && t2 && (plane || 46 - e > 0)) { const m = toScreen(rad(46.3) - er); if (m) labelFit(ctx, '暗帶', m[0] - 6, m[1] + 4, C.ink, 10, 'right', opts); }
                if (hz && !plane) labelFit(ctx, '地平線', x0 + 8, hz[1] - 4, C.ink, 10, 'left', opts);
                if (anti && anti[1] < y0 + ph - 4) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(anti[0] - 6, anti[1]); ctx.lineTo(anti[0] + 6, anti[1]); ctx.moveTo(anti[0], anti[1] - 6); ctx.lineTo(anti[0], anti[1] + 6); ctx.stroke();
                    labelFit(ctx, plane ? '反日點（圓心）' : '反日點（頭的影子）', anti[0] + 9, anti[1] + 4, C.ink, 10, 'left', opts);
                }
                labelFit(ctx, '眼睛看到的天空（依物理計算）', x0 + 10, y0 + 18, C.ink, 12, 'left', opts);
                if (!plane && 42.3 - e <= 0) labelWrap(ctx, '太陽高於約 42°：主虹在地平線下，看不到', x0 + 10, y0 + 40, C.rose, 11, 14, pw - 20);
                ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, pw, ph);
            }
        };

