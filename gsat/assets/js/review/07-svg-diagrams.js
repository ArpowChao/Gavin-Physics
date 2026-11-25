// 高精度 inline SVG 圖解教學（依節點注入）
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 高精度 inline SVG 圖解教學（依節點注入；座標一律以 JS 依物理關係計算）=====
        const DG = { blue: '#2563eb', rose: '#e11d48', green: '#059669', orange: '#d97706', ink: '#334155', muted: '#64748b', grid: '#cbd5e1' };
        const dgR = v => Math.round(v * 10) / 10;
        function dgArrow(x1, y1, x2, y2, color, w) {
            w = w || 2;
            const a = Math.atan2(y2 - y1, x2 - x1), h = 8 + 2 * w;
            const bx = x2 - (h - 2) * Math.cos(a), by = y2 - (h - 2) * Math.sin(a);
            return '<line x1="' + dgR(x1) + '" y1="' + dgR(y1) + '" x2="' + dgR(bx) + '" y2="' + dgR(by) + '" stroke="' + color + '" stroke-width="' + w + '"/>' +
                   '<polygon points="' + dgR(x2) + ',' + dgR(y2) + ' ' + dgR(x2 - h * Math.cos(a - 0.4)) + ',' + dgR(y2 - h * Math.sin(a - 0.4)) + ' ' + dgR(x2 - h * Math.cos(a + 0.4)) + ',' + dgR(y2 - h * Math.sin(a + 0.4)) + '" fill="' + color + '"/>';
        }
        function dgTxt(x, y, s, o) {
            o = o || {};
            return '<text x="' + dgR(x) + '" y="' + dgR(y) + '" font-size="' + (o.fs || 12) + '" fill="' + (o.fill || DG.ink) + '" text-anchor="' + (o.an || 'middle') + '"' + (o.b ? ' font-weight="700"' : '') + (o.tr ? ' transform="' + o.tr + '"' : '') + '>' + s + '</text>';
        }
        function dgLine(x1, y1, x2, y2, color, w, dash) {
            return '<line x1="' + dgR(x1) + '" y1="' + dgR(y1) + '" x2="' + dgR(x2) + '" y2="' + dgR(y2) + '" stroke="' + (color || DG.grid) + '" stroke-width="' + (w || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
        }
        function dgPoly(pts, color, w, fill, dash) {
            return '<polyline points="' + pts + '" fill="' + (fill || 'none') + '" stroke="' + color + '" stroke-width="' + (w || 2) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linejoin="round"/>';
        }
        function dgCard(title, svg, cap) {
            return '<div class="formula-card"><div class="formula-card-title">📐 ' + title + '</div><div style="text-align:center; margin:0.4rem 0; overflow-x:auto;">' + svg + '</div><div class="formula-desc">' + cap + '</div></div>';
        }
        function dgSvg(w, h, inner) {
            return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="max-width:' + w + 'px; width:100%; height:auto;" xmlns="http://www.w3.org/2000/svg" role="img">' + inner + '</svg>';
        }

        function diagN06() {
            const panel = (cx, title, kind) => {
                let s = '<rect x="' + (cx - 78) + '" y="30" width="156" height="140" rx="10" fill="rgba(100,116,139,0.06)" stroke="' + DG.ink + '" stroke-width="1.2"/>';
                s += dgTxt(cx, 52, title, { fs: 13, b: 1 });
                const dots = [];
                if (kind === 'solid') {
                    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dots.push([cx - 45 + c * 30, 75 + r * 26]);
                } else if (kind === 'liquid') {
                    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dots.push([cx - 45 + c * 30 + (r % 2 ? 8 : -4), 75 + r * 26 + (c % 2 ? 4 : -3)]);
                } else {
                    const seed = [[0.1, 0.2], [0.6, 0.1], [0.3, 0.5], [0.8, 0.4], [0.15, 0.75], [0.55, 0.6], [0.85, 0.8], [0.4, 0.85], [0.7, 0.25], [0.05, 0.5], [0.9, 0.6], [0.45, 0.15]];
                    seed.forEach(p => dots.push([cx - 55 + p[0] * 110, 68 + p[1] * 95]));
                }
                dots.forEach(p => { s += '<circle cx="' + dgR(p[0]) + '" cy="' + dgR(p[1]) + '" r="5" fill="' + DG.blue + '"/>'; });
                if (kind === 'solid') dots.forEach(p => { s += '<circle cx="' + dgR(p[0]) + '" cy="' + dgR(p[1]) + '" r="11" fill="none" stroke="' + DG.grid + '" stroke-width="1" stroke-dasharray="2 2"/>'; });
                return s;
            };
            let s = panel(90, '固態', 'solid') + panel(260, '液態', 'liquid') + panel(430, '氣態', 'gas');
            s += dgTxt(90, 188, '緊密規則排列', { fs: 10.5, fill: DG.muted }) + dgTxt(90, 202, '原地振動', { fs: 10.5, fill: DG.muted });
            s += dgTxt(260, 188, '仍聚集、鍵結較弱', { fs: 10.5, fill: DG.muted }) + dgTxt(260, 202, '可相對滑動', { fs: 10.5, fill: DG.muted });
            s += dgTxt(430, 188, '鍵結極弱或可忽略', { fs: 10.5, fill: DG.muted }) + dgTxt(430, 202, '自由飛行、僅靠碰撞', { fs: 10.5, fill: DG.muted });
            s += dgArrow(178, 100, 212, 100, DG.rose, 2) + dgArrow(348, 100, 382, 100, DG.rose, 2);
            s += dgTxt(195, 90, '升溫', { fs: 10.5, fill: DG.rose, b: 1 }) + dgTxt(365, 90, '升溫', { fs: 10.5, fill: DG.rose, b: 1 });
            return dgCard('物質三態的原子觀點', dgSvg(520, 215, s),
                '• 差別不在原子本身，而在<b>鍵結強弱</b>與<b>活動空間</b><br>• 固態：鍵結最強、規則排列、只能原地振動<br>• 液態：鍵結較弱、仍聚集但可流動<br>• 氣態：鍵結可忽略、自由飛行、僅靠碰撞<br>• 升溫 → 原子動能變大 → 掙脫鍵結，故固→液→氣需依序更高溫');
        }

        function diagN09() {
            const baseY = 190, topY = 40, x0 = 70, x1 = 460;
            let s = dgLine(x0, baseY, x1, baseY, DG.ink, 2);
            // 拋物線軌跡：從左上到右下（模擬拋體/擺錘的能量轉換，僅示意）
            let traj = '';
            for (let t = 0; t <= 1; t += 0.02) { const x = x0 + t * (x1 - x0); const y = topY + (baseY - topY) * (t * t); traj += dgR(x) + ',' + dgR(y) + ' '; }
            s += dgPoly(traj, DG.grid, 1.5, null, '5 4');
            const stops = [0, 0.5, 1];
            stops.forEach(t => {
                const x = x0 + t * (x1 - x0), y = topY + (baseY - topY) * (t * t);
                // Ep ∝ 離地高度 =（1 − t²）；能量守恆 ⇒ Ek = 1 − Ep
                const epFrac = 1 - t * t, ekFrac = t * t;
                s += '<circle cx="' + dgR(x) + '" cy="' + dgR(y) + '" r="7" fill="' + DG.orange + '"/>';
                // 堆疊長條：Ek 在下、Ep 在上，總高固定 = 力學能守恆一眼可見
                const barX = x - 11, barW = 22, total = 62, top = baseY - 8 - total;
                s += '<rect x="' + dgR(barX) + '" y="' + dgR(top) + '" width="' + barW + '" height="' + total + '" fill="none" stroke="' + DG.grid + '" stroke-width="1" stroke-dasharray="3 2"/>';
                s += '<rect x="' + dgR(barX) + '" y="' + dgR(top) + '" width="' + barW + '" height="' + dgR(epFrac * total) + '" fill="' + DG.blue + '" opacity="0.8"/>';
                s += '<rect x="' + dgR(barX) + '" y="' + dgR(top + epFrac * total) + '" width="' + barW + '" height="' + dgR(ekFrac * total) + '" fill="' + DG.rose + '" opacity="0.8"/>';
                s += dgTxt(x, baseY + 22, epFrac > 0.9 ? '最高點' : ekFrac > 0.9 ? '最低點' : '中途', { fs: 10.5, fill: DG.muted });
            });
            s += '<rect x="318" y="18" width="14" height="12" fill="' + DG.blue + '"/>' + dgTxt(338, 28, 'Ep（位能）', { fs: 11, an: 'start' });
            s += '<rect x="318" y="34" width="14" height="12" fill="' + DG.rose + '"/>' + dgTxt(338, 44, 'Ek（動能）', { fs: 11, an: 'start' });
            return dgCard('力學能 ＝ 動能 ＋ 位能', dgSvg(520, 220, s),
                '• 力學能 ＝ $E_k$ ＋ $E_p$（長條總高不變）<br>• 下落時位能轉動能，兩者此消彼長<br>• 只有重力、彈力作功時，力學能不變；摩擦力作負功則減少<br>• 學測只考定義與定性判斷，不考定量守恆計算');
        }

        function diagN10() {
            let s = '';
            s += '<rect x="30" y="30" width="220" height="150" rx="10" fill="rgba(217,119,6,0.06)" stroke="' + DG.orange + '" stroke-width="1.4"/>';
            s += dgTxt(140, 55, '熱能（狀態量）', { fs: 13, b: 1, fill: DG.orange });
            const seed = [[0.15, 0.25], [0.5, 0.15], [0.75, 0.3], [0.3, 0.5], [0.6, 0.55], [0.85, 0.6], [0.2, 0.75], [0.5, 0.8]];
            seed.forEach((p, i) => {
                const cx = 60 + p[0] * 160, cy = 78 + p[1] * 90;
                // 單一角度決定方向，箭頭長度一致；自圓周外緣起畫，避免疊在圓上
                const a = i * 2.4, r0 = 7, len = 13;
                s += '<circle cx="' + dgR(cx) + '" cy="' + dgR(cy) + '" r="5" fill="' + DG.orange + '"/>';
                s += dgArrow(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), cx + (r0 + len) * Math.cos(a), cy + (r0 + len) * Math.sin(a), DG.orange, 1.2);
            });
            s += dgTxt(140, 168, '原子動能＋交互作用能量的總和', { fs: 10.5, fill: DG.muted });
            s += '<rect x="270" y="30" width="220" height="150" rx="10" fill="rgba(37,99,235,0.06)" stroke="' + DG.blue + '" stroke-width="1.4"/>';
            s += dgTxt(380, 55, '熱（過程量）', { fs: 13, b: 1, fill: DG.blue });
            s += '<circle cx="330" cy="115" r="26" fill="rgba(239,68,68,0.18)" stroke="' + DG.rose + '" stroke-width="1.4"/>' + dgTxt(330, 119, '高溫', { fs: 11.5, b: 1, fill: DG.rose });
            s += '<circle cx="440" cy="115" r="26" fill="rgba(37,99,235,0.14)" stroke="' + DG.blue + '" stroke-width="1.4"/>' + dgTxt(440, 119, '低溫', { fs: 11.5, b: 1, fill: DG.blue });
            s += dgArrow(360, 115, 410, 115, DG.orange, 2.5) + dgTxt(385, 100, 'Q', { fs: 12, b: 1, fill: DG.orange });
            s += dgTxt(380, 168, '因溫度不同造成的能量「傳遞」', { fs: 10.5, fill: DG.muted });
            return dgCard('「熱能」與「熱」是兩回事', dgSvg(520, 190, s),
                '• <b>熱能</b>（狀態量）：物體內部原子動能＋交互作用能量的總和，物體本身「有」的<br>• <b>熱</b>（過程量）：因溫度差而「傳遞」的能量，傳完就沒了<br>• $Q=ms\\Delta T$ 算的是傳遞掉的熱量');
        }

        function diagN04() {
            let s = '';
            const scenes = [
                { cx: 100, T: 56, note: '等速上升（a = 0）', rel: 'T = mg', aDir: 0 },
                { cx: 265, T: 84, note: '加速上升（a 向上）', rel: 'T > mg', aDir: -1 },
                { cx: 430, T: 34, note: '減速上升（a 向下）', rel: 'T &lt; mg', aDir: 1 }
            ];
            scenes.forEach(sc => {
                s += dgTxt(sc.cx, 22, sc.note, { fs: 12, b: 1 });
                s += '<rect x="' + (sc.cx - 32) + '" y="120" width="64" height="40" rx="4" fill="rgba(100,116,139,0.15)" stroke="' + DG.ink + '" stroke-width="1.5"/>';
                s += dgArrow(sc.cx, 120, sc.cx, 120 - sc.T, DG.blue, 2.5) + dgTxt(sc.cx + 13, 120 - sc.T + 6, 'T', { fill: DG.blue, b: 1 });
                s += dgArrow(sc.cx, 160, sc.cx, 216, DG.rose, 2.5) + dgTxt(sc.cx + 18, 212, 'mg', { fill: DG.rose, b: 1 });
                if (sc.aDir !== 0) {
                    const y1 = sc.aDir < 0 ? 100 : 60, y2 = sc.aDir < 0 ? 60 : 100;
                    s += dgArrow(sc.cx + 55, y1, sc.cx + 55, y2, DG.green, 2) + dgTxt(sc.cx + 68, (y1 + y2) / 2 + 4, 'a', { fill: DG.green, b: 1 });
                }
                s += dgTxt(sc.cx, 240, sc.rel, { fs: 14, b: 1, fill: sc.aDir === 0 ? DG.ink : (sc.aDir < 0 ? DG.blue : DG.rose) });
            });
            const craneCard = dgCard('起重機吊物三情境受力分析', dgSvg(520, 252, s),
                '先由「運動狀態」判定加速度方向，再定合力方向：等速 a=0 → T=mg；加速上升合力向上 → T>mg；減速上升合力向下 → T&lt;mg。切勿看到吊起就一律套 T=mg！');
            return craneCard + diagGalileo();
        }

        function diagGalileo() {
            // 核心：不論右斜面坡度，球都回到「同一高度」hY；坡度越緩 → 需滾越遠
            const baseY = 196, hY = 74, pivotX = 132;
            let s = dgLine(24, baseY, 508, baseY, DG.ink, 2);
            // 等高虛線（實驗結論）
            s += dgLine(40, hY, 500, hY, DG.rose, 1.4, '6 4');
            s += dgTxt(44, hY - 9, '同一高度（實驗結論）', { fs: 10.5, fill: DG.rose, b: 1, an: 'start' });
            // 左斜面（釋放側，固定）
            s += dgLine(40, hY, pivotX, baseY, DG.ink, 2.5);
            s += '<circle cx="46" cy="' + (hY + 6) + '" r="7" fill="' + DG.ink + '"/>';
            s += dgTxt(38, hY + 30, '由靜止釋放', { fs: 10.5, an: 'start' });
            // 三種右斜面：終點都落在 hY，只有水平距離不同
            const slopes = [
                { x: 236, color: DG.rose, label: '陡' },
                { x: 340, color: DG.orange, label: '緩' },
                { x: 476, color: DG.green, label: '更緩' }
            ];
            slopes.forEach(r => {
                s += dgLine(pivotX, baseY, r.x, hY, r.color, 2.2);
                s += '<circle cx="' + (r.x - 6) + '" cy="' + (hY + 6) + '" r="6" fill="' + r.color + '"/>';
                s += dgTxt(r.x - 6, hY - 14, r.label, { fs: 10.5, fill: r.color, b: 1 });
                s += dgTxt((pivotX + r.x) / 2, baseY + 16, '滾程 ' + (r.label === '陡' ? '短' : r.label === '緩' ? '中' : '長'), { fs: 10, fill: r.color });
            });
            s += dgTxt(300, baseY + 38, '極限推論：坡度 → 0 且無摩擦 ⇒ 球永遠等速滾下去，不需任何力維持', { fs: 11.5, b: 1, fill: DG.green });
            return dgCard('伽利略斜面思想實驗', dgSvg(520, 248, s),
                '• 亞里斯多德：有力才有動（把摩擦的效果誤當本質）<br>• 伽利略：坡度越緩，球要滾越遠，但總是回到<b>同一高度</b><br>• 推到極限：水平且無摩擦 → 永遠等速前進 ＝ <b>慣性定律</b>雛形');
        }

        function diagN05() {
            let s = '';
            s += dgArrow(60, 190, 492, 190, DG.ink, 1.5) + dgArrow(60, 190, 60, 28, DG.ink, 1.5);
            s += dgTxt(468, 210, '外力 F', { fs: 12 }) + dgTxt(88, 40, '摩擦力 f', { fs: 12 });
            s += dgLine(60, 190, 240, 85, DG.blue, 2.5);
            s += dgTxt(128, 118, '靜摩擦 ＝ 外力', { fill: DG.blue, fs: 11.5, tr: 'rotate(-30 128 118)' });
            s += dgTxt(128, 133, '（自我調節）', { fill: DG.blue, fs: 10, tr: 'rotate(-30 128 133)' });
            s += '<circle cx="240" cy="85" r="4.5" fill="' + DG.rose + '"/>' + dgTxt(240, 68, '最大靜摩擦', { fill: DG.rose, fs: 11.5, b: 1 });
            s += dgLine(240, 85, 240, 112, DG.rose, 1.5, '4 3');
            s += dgLine(240, 112, 470, 112, DG.green, 2.5) + dgTxt(360, 100, '動摩擦（約為定值）', { fill: DG.green, fs: 11.5, b: 1 });
            s += dgLine(240, 112, 240, 190, DG.grid, 1, '4 3') + dgTxt(240, 208, '開始滑動', { fs: 11, fill: DG.muted });
            return dgCard('摩擦力 f 隨外力 F 的變化', dgSvg(520, 235, s),
                '物體未滑動時，靜摩擦力大小「恰等於外力」（沿斜線自我調節、與正向力無關）；外力達最大靜摩擦後開始滑動，轉為略小且大致固定的動摩擦。學測不涉及摩擦係數計算。');
        }

        function diagN07() {
            const cx = 255, cy = 130, rx = 175, ry = 92;
            const fx = cx - Math.sqrt(rx * rx - ry * ry);
            const P = th => [cx + rx * Math.cos(th * Math.PI / 180), cy + ry * Math.sin(th * Math.PI / 180)];
            let s = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + DG.muted + '" stroke-width="1.6"/>';
            const sector = (a1, a2, fill, stroke) => {
                let pts = dgR(fx) + ',' + cy;
                for (let a = a1; a <= a2; a += 3) { const p = P(a); pts += ' ' + dgR(p[0]) + ',' + dgR(p[1]); }
                pts += ' ' + dgR(fx) + ',' + cy;
                return '<polygon points="' + pts + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"/>';
            };
            s += sector(160, 200, 'rgba(37,99,235,0.16)', DG.blue);
            s += sector(-12, 12, 'rgba(5,150,105,0.16)', DG.green);
            s += '<circle cx="' + dgR(fx) + '" cy="' + cy + '" r="8" fill="' + DG.orange + '"/>' + dgTxt(fx, 156, '太陽（焦點）', { fs: 11, fill: DG.orange, b: 1 });
            s += dgArrow(cx - rx, cy, cx - rx, cy - 50, DG.blue, 2.5) + dgTxt(cx - rx - 18, cy - 28, 'v 大', { fill: DG.blue, b: 1 });
            s += dgArrow(cx + rx, cy, cx + rx, cy + 38, DG.green, 2.5) + dgTxt(cx + rx + 21, cy + 24, 'v 小', { fill: DG.green, b: 1 });
            s += dgTxt(cx - rx + 4, cy - 60, '近日點', { fs: 11 }) + dgTxt(cx + rx - 6, cy + 56, '遠日點', { fs: 11 });
            s += dgTxt(148, cy + 4, '甲', { fs: 13, b: 1, fill: DG.blue }) + dgTxt(398, cy + 4, '乙', { fs: 13, b: 1, fill: DG.green });
            const kepler2Card = dgCard('克卜勒第二定律：等面積律', dgSvg(520, 262, s),
                '行星與太陽的連線在「相等時間」內掃過「相等面積」（甲＝乙）→ 近日點快、遠日點慢。第三定律：T² ∝ r³，軌道越大、週期越長（繞同一中心天體比較）。');
                
            return kepler2Card + diagN07_retrograde();
        }

        function diagN07_retrograde() {
            let s = '';
            
            // Add premium gradients and filters
            s += `<defs>
                <radialGradient id="sun-glow-diag" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="35%" stop-color="#fbbf24"/>
                    <stop offset="100%" stop-color="rgba(245,158,11,0)"/>
                </radialGradient>
                <linearGradient id="bg-grad-diag" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0b0f19"/>
                    <stop offset="50%" stop-color="#111827"/>
                    <stop offset="100%" stop-color="#1f2937"/>
                </linearGradient>
                <linearGradient id="sky-grad-diag" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#050b14"/>
                    <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
            </defs>`;
            
            // Background Card Capsule
            s += `<rect width="520" height="270" fill="url(#bg-grad-diag)" rx="10"/>`;
            
            // 1. Draw Grid Plane (黃道面格線)
            s += '<!-- Ecliptic Plane Grid -->';
            const gridFill = 'rgba(17, 24, 39, 0.65)';
            const gridStroke = 'rgba(99, 102, 241, 0.15)';
            
            // Outer boundary of the plane
            s += `<polygon points="20,260 500,260 380,160 140,160" fill="${gridFill}" stroke="rgba(99, 102, 241, 0.35)" stroke-width="1.2"/>`;
            
            // Transverse grid lines (depth)
            s += `<line x1="50" y1="235" x2="470" y2="235" stroke="${gridStroke}" stroke-width="0.8"/>`;
            s += `<line x1="80" y1="210" x2="440" y2="210" stroke="${gridStroke}" stroke-width="0.8"/>`;
            s += `<line x1="110" y1="185" x2="410" y2="185" stroke="${gridStroke}" stroke-width="0.8"/>`;
            
            // Longitudinal grid lines
            s += `<line x1="140" y1="160" x2="20" y2="260" stroke="${gridStroke}" stroke-width="0.8"/>`;
            s += `<line x1="200" y1="160" x2="140" y2="260" stroke="${gridStroke}" stroke-width="0.8"/>`;
            s += `<line x1="260" y1="160" x2="260" y2="260" stroke="${gridStroke}" stroke-width="1.2" stroke-dasharray="4 2"/>`; // Center axis
            s += `<line x1="320" y1="160" x2="380" y2="260" stroke="${gridStroke}" stroke-width="0.8"/>`;
            s += `<line x1="380" y1="160" x2="500" y2="260" stroke="${gridStroke}" stroke-width="0.8"/>`;
            
            s += `<text x="35" y="250" font-size="10" fill="rgba(148,163,184,0.4)" font-weight="700">黃道平面</text>`;
            
            // 2. Draw Orbits (地球 & 火星軌道)
            // Earth Orbit (rx=90, ry=30, center=(260, 205))
            s += `<path d="M 170 205 A 90 30 0 0 1 350 205" fill="none" stroke="rgba(56,189,248,0.4)" stroke-width="1.5" stroke-dasharray="4 2"/>`;
            
            // Mars Orbit (rx=150, ry=50, center=(260, 205))
            s += `<path d="M 110 205 A 150 50 0 0 1 410 205" fill="none" stroke="rgba(248,113,113,0.4)" stroke-width="1.5" stroke-dasharray="4 2"/>`;
            
            // Sun in the center
            s += `<circle cx="260" cy="205" r="10" fill="url(#sun-glow-diag)"/>`;
            s += `<circle cx="260" cy="205" r="4.5" fill="#fff"/>`;
            s += `<text x="260" y="222" font-size="10.5" fill="#fbbf24" font-weight="700" text-anchor="middle">太陽</text>`;
            
            // 3. Draw Sky Board (星空背景)
            s += `<!-- Sky Board Background -->`;
            s += `<rect x="40" y="25" width="440" height="85" rx="10" ry="10" fill="url(#sky-grad-diag)" stroke="rgba(99,102,241,0.22)" stroke-width="1.2" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5))"/>`;
            
            // Stars background details
            const starCoords = [[60,40,0.6],[100,80,0.8],[150,35,0.5],[200,90,0.7],[320,35,0.6],[380,90,0.5],[430,40,0.8],[450,75,0.7]];
            starCoords.forEach(st => {
                s += `<circle cx="${st[0]}" cy="${st[1]}" r="1" fill="#fff" opacity="${st[2]}"/>`;
            });
            s += `<text x="260" y="38" font-size="9" fill="rgba(148,163,184,0.5)" font-weight="700" text-anchor="middle" letter-spacing="1">恆星背景與火星視運動投影</text>`;
            
            // Define positions 1..6 (Mathematically placed exactly on orbits: rx=90/30, rx=150/50 centered at 260,205)
            const E = [
                [338, 190],
                [312, 180.5],
                [282, 176],
                [238, 176],
                [208, 180.5],
                [182, 190]
            ];
            
            const S = [
                [444, 68],
                [350, 62],
                [255, 80],
                [293, 48],
                [180, 62],
                [81, 68]
            ];
            
            const M = [
                [358, 167],
                [319, 159],
                [276, 155],
                [247, 155],
                [203, 159],
                [163, 167]
            ];
            
            // 4. Draw lines of sight (地球 -> 火星 -> 天球)
            s += `<!-- Lines of Sight -->`;
            for (let i = 0; i < 6; i++) {
                s += `<line x1="${E[i][0]}" y1="${E[i][1]}" x2="${S[i][0]}" y2="${S[i][1]}" stroke="rgba(255,255,255,0.18)" stroke-width="0.9" stroke-dasharray="2 3"/>`;
            }
            // 5. Draw Mars apparent path in the sky (Cubic Bezier smooth curve sequentially connecting 1->2->3->4->5->6)
            s += `<!-- Sky path -->`;
            s += `<path d="M 444 68 C 410 66, 375 61, 350 62 C 320 63, 270 78, 255 80 C 235 82, 260 50, 293 48 C 320 46, 220 58, 180 62 C 150 65, 110 67, 81 68" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" style="filter: drop-shadow(0 0 3px rgba(239,68,68,0.5))"/>`;
            s += `<text x="430" y="85" font-size="9" fill="#fca5a5" font-weight="700">火星視運動路徑</text>`;
            
            // 6. Draw Orbit Labels
            s += `<text x="355" y="212" font-size="8.5" fill="#38bdf8" font-weight="700" text-anchor="start">地球軌道</text>`;
            s += `<text x="415" y="212" font-size="8.5" fill="#f87171" font-weight="700" text-anchor="start">火星軌道</text>`;
            
            // 7. Draw dots and numbers 1..6
            for (let i = 0; i < 6; i++) {
                const idx = i + 1;
                
                // Earth dot (blue glow)
                s += `<circle cx="${E[i][0]}" cy="${E[i][1]}" r="4" fill="#38bdf8" stroke="#fff" stroke-width="0.8"/>`;
                s += `<text x="${E[i][0]}" y="${E[i][1] + 12}" font-size="8.5" fill="#38bdf8" font-weight="700" text-anchor="middle">${idx}</text>`;
                
                // Mars dot (red glow)
                s += `<circle cx="${M[i][0]}" cy="${M[i][1]}" r="3.5" fill="#f87171" stroke="#fff" stroke-width="0.8"/>`;
                s += `<text x="${M[i][0]}" y="${M[i][1] + 11}" font-size="8.5" fill="#f87171" font-weight="700" text-anchor="middle">${idx}</text>`;
                
                // Projected Mars dot (orange-red)
                s += `<circle cx="${S[i][0]}" cy="${S[i][1]}" r="3" fill="#ffffff" stroke="#f87171" stroke-width="1.2"/>`;
                s += `<text x="${S[i][0]}" y="${S[i][1] - 5}" font-size="8.5" fill="#fca5a5" font-weight="700" text-anchor="middle">${idx}</text>`;
            }
            
            return dgCard('日心說模型：行星逆行投影原理 (黃道面追越與天球投影)', dgSvg(520, 270, s),
                '地球（內軌道，速度快，1→6）在公轉時「追越」火星（外軌道，速度慢，1→6）。從地球看火星的視線投影到背景星空中，在超車階段（2→5）會產生暫時逆向運動的迴圈（Retrograde Loop），此幾何現象完美解釋了行星逆行的視差原理。');
        }

        function diagN14() {
            const y0 = 118, A = 58, x0 = 55, lam = 180;
            let pts = '';
            for (let x = x0; x <= 465; x += 4) pts += dgR(x) + ',' + dgR(y0 - A * Math.sin(2 * Math.PI * (x - x0) / lam)) + ' ';
            let s = dgLine(x0, y0, 465, y0, DG.grid, 1, '5 4');
            s += dgPoly(pts, DG.blue, 2.5);
            const c1 = x0 + lam / 4, c2 = c1 + lam, t1 = x0 + 3 * lam / 4;
            s += dgArrow(c1, y0, c1, y0 - A, DG.rose, 2) + dgTxt(c1 - 30, y0 - A / 2 + 4, '振幅 A', { fill: DG.rose, fs: 11.5, b: 1 });
            s += dgLine(c1, y0 - A, c1, 34, DG.grid, 1, '3 3') + dgLine(c2, y0 - A, c2, 34, DG.grid, 1, '3 3');
            s += dgArrow(c1, 34, c2, 34, DG.ink, 1.5) + dgArrow(c2, 34, c1, 34, DG.ink, 1.5) + dgTxt((c1 + c2) / 2, 26, '波長 λ', { fs: 12, b: 1 });
            s += dgTxt(c1, y0 - A - 10, '波峰', { fs: 11, fill: DG.muted }) + dgTxt(t1, y0 + A + 16, '波谷', { fs: 11, fill: DG.muted });
            s += dgArrow(330, 212, 430, 212, DG.green, 2.5) + dgTxt(380, 232, '波的前進方向', { fill: DG.green, fs: 11.5, b: 1 });
            return dgCard('週期波的波形解剖', dgSvg(520, 245, s),
                'v = fλ：波速由「介質」決定、頻率由「波源」決定。波傳遞的是能量與波形，介質質點只在原地振動、不隨波前進。');
        }

        function diagN15() {
            const cy = 125;
            const cs = [150, 168, 186, 204], rs = [100, 75, 50, 25];
            let s = '';
            cs.forEach((c, i) => { s += '<circle cx="' + c + '" cy="' + cy + '" r="' + rs[i] + '" fill="none" stroke="' + DG.blue + '" stroke-width="1.6" opacity="' + (0.45 + i * 0.15) + '"/>'; });
            s += '<circle cx="216" cy="' + cy + '" r="5" fill="' + DG.rose + '"/>';
            s += dgArrow(216, cy, 268, cy, DG.rose, 2.5) + dgTxt(252, cy + 22, '波源移動', { fill: DG.rose, fs: 11, b: 1 });
            s += dgTxt(388, 92, '前方：波前密集', { an: 'start', fs: 11.5, b: 1 }) + dgTxt(388, 109, '→ 視波長短、頻率高', { an: 'start', fs: 11 }) + dgTxt(388, 126, '（接近 → 藍移）', { an: 'start', fs: 11, fill: DG.blue });
            s += dgTxt(30, 40, '後方：波前稀疏', { an: 'start', fs: 11.5, b: 1 }) + dgTxt(30, 57, '→ 視波長長、頻率低', { an: 'start', fs: 11 }) + dgTxt(30, 74, '（遠離 → 紅移）', { an: 'start', fs: 11, fill: DG.rose });
            return dgCard('都卜勒效應：移動波源的波前分布', dgSvg(520, 250, s),
                '波源移動時，前方波前被壓縮（視波長變短、接收頻率變高）、後方拉長（頻率變低）；相對速度越大、頻率變化越大。波在介質中的速率不變（由介質決定）。');
        }

        function diagReflection() {
            const vx = 260, vy = 150, th = 38 * Math.PI / 180;
            let s = dgLine(60, vy, 460, vy, DG.ink, 2.5);
            s += dgLine(vx, 25, vx, 210, DG.muted, 1.2, '6 4') + dgTxt(vx, 18, '法線', { fs: 11, fill: DG.muted });
            const ix = vx - 130 * Math.sin(th), iy = vy - 130 * Math.cos(th);
            const rx = vx + 130 * Math.sin(th), ry = vy - 130 * Math.cos(th);
            s += dgArrow(ix, iy, vx, vy, DG.blue, 2.5) + dgTxt(ix - 8, iy - 6, '入射線', { fill: DG.blue, fs: 11.5, b: 1, an: 'start' });
            s += dgArrow(vx, vy, rx, ry, DG.rose, 2.5) + dgTxt(rx + 8, ry - 6, '反射線', { fill: DG.rose, fs: 11.5, b: 1, an: 'end' });
            const arc = (r, a1, a2, col) => { let p = ''; for (let a = a1; a <= a2; a += 2) p += dgR(vx + r * Math.cos(a * Math.PI / 180)) + ',' + dgR(vy + r * Math.sin(a * Math.PI / 180)) + ' '; return dgPoly(p, col, 1.4); };
            const thd = th * 180 / Math.PI;
            s += arc(40, -90 - thd, -90, DG.blue) + dgTxt(vx - 26, vy - 46, 'θ₁', { fs: 12, b: 1, fill: DG.blue });
            s += arc(40, -90, -90 + thd, DG.rose) + dgTxt(vx + 26, vy - 46, 'θ₂', { fs: 12, b: 1, fill: DG.rose });
            s += dgTxt(vx, vy + 30, 'θ₁ ＝ θ₂（入射角＝反射角，皆從法線量起）', { fs: 12, b: 1 });
            return dgCard('反射定律：入射角恆等於反射角', dgSvg(520, 232, s),
                '• θ₁ ＝ θ₂，角度一律<b>從法線量起</b><br>• 入射線、反射線、法線三者共平面<br>• 鏡面：各點法線一致 → 反射光集中成像<br>• 粗糙面：法線方向雜亂 → 漫射（每條光線仍各自守此定律）');
        }

        function diagLightHistory() {
            let s = '';
            s += '<rect x="30" y="40" width="210" height="150" rx="10" fill="rgba(37,99,235,0.06)" stroke="' + DG.blue + '" stroke-width="1.4"/>';
            s += dgTxt(135, 68, '牛頓：微粒說', { fs: 13, b: 1, fill: DG.blue });
            s += dgTxt(135, 90, '光是高速粒子流', { fs: 11 });
            for (let i = 0; i < 5; i++) { const y = 110 + i * 14; s += '<circle cx="' + (60 + i * 32) + '" cy="' + y + '" r="4" fill="' + DG.blue + '"/>'; }
            s += dgTxt(135, 178, '✔ 能解釋直進、反射', { fs: 10.5, fill: DG.muted });
            s += '<rect x="280" y="40" width="210" height="150" rx="10" fill="rgba(5,150,105,0.06)" stroke="' + DG.green + '" stroke-width="1.4"/>';
            s += dgTxt(385, 68, '惠更斯：波動說', { fs: 13, b: 1, fill: DG.green });
            s += dgTxt(385, 90, '光是一種波', { fs: 11 });
            let wav = ''; for (let x = 300; x <= 470; x += 4) wav += dgR(x) + ',' + dgR(140 + 10 * Math.sin((x - 300) / 9)) + ' ';
            s += dgPoly(wav, DG.green, 2.2);
            s += dgTxt(385, 178, '✔ 能解釋直進、反射、折射', { fs: 10.5, fill: DG.muted });
            s += dgTxt(260, 22, '長期並存、難分軒輊', { fs: 11.5, b: 1, an: 'middle' });
            s += dgArrow(260, 202, 260, 230, DG.rose, 2.2);
            s += dgTxt(260, 250, '干涉、繞射：兩道光疊加反而「變暗」', { fs: 12, b: 1, fill: DG.rose });
            s += dgTxt(260, 268, '微粒說無法解釋相消 → 波動說勝出', { fs: 11, fill: DG.muted });
            return dgCard('光的本質之爭：微粒說 vs. 波動說', dgSvg(520, 285, s),
                '• 牛頓微粒說、惠更斯波動說都能解釋直進與反射 → 長期難分勝負<br>• 決勝點：雙狹縫「暗紋」＝兩道光疊加變暗<br>• 粒子只會越疊越多、不會抵消 ⇒ 只有波動說解釋得通');
        }

        function diagN16() {
            const vx = 260, vy = 130, th1 = 35 * Math.PI / 180;
            const th2 = Math.asin(1.33 * Math.sin(th1));
            let s = '<rect x="40" y="' + vy + '" width="440" height="105" fill="rgba(37,99,235,0.08)"/>';
            s += dgLine(40, vy, 480, vy, DG.ink, 2);
            s += dgLine(vx, 25, vx, 240, DG.muted, 1.2, '6 4') + dgTxt(vx, 18, '法線', { fs: 11, fill: DG.muted });
            const ix = vx - 110 * Math.sin(th1), iy = vy + 110 * Math.cos(th1);
            s += dgArrow(ix, iy, vx, vy, DG.blue, 2.5) + dgTxt(ix - 12, iy - 6, '入射線', { fill: DG.blue, fs: 11.5, b: 1 });
            const rx2 = vx + 115 * Math.sin(th2), ry2 = vy - 115 * Math.cos(th2);
            s += dgArrow(vx, vy, rx2, ry2, DG.rose, 2.5) + dgTxt(rx2 + 14, ry2 - 4, '折射線', { fill: DG.rose, fs: 11.5, b: 1, an: 'end' });
            const gx = vx + 78 * Math.sin(th1), gy = vy - 78 * Math.cos(th1);
            s += dgLine(vx, vy, gx, gy, DG.grid, 1.2, '4 3') + dgTxt(gx + 6, gy - 6, '原方向', { fs: 10, fill: DG.muted, an: 'start' });
            const arc = (r, a1, a2) => { let p = ''; for (let a = a1; a <= a2; a += 2) p += dgR(vx + r * Math.cos(a * Math.PI / 180)) + ',' + dgR(vy + r * Math.sin(a * Math.PI / 180)) + ' '; return dgPoly(p, DG.ink, 1.2); };
            s += arc(42, 90, 90 + 35) + dgTxt(vx + 58 * Math.cos(107.5 * Math.PI / 180), vy + 58 * Math.sin(107.5 * Math.PI / 180) + 4, 'θ₁', { fs: 12, b: 1 });
            const a2deg = th2 * 180 / Math.PI;
            s += arc(40, -90, -90 + a2deg) + dgTxt(vx + 57 * Math.cos((-90 + a2deg / 2) * Math.PI / 180), vy + 57 * Math.sin((-90 + a2deg / 2) * Math.PI / 180) + 4, 'θ₂', { fs: 12, b: 1 });
            s += dgTxt(66, 50, '空氣（波速快）', { an: 'start', fs: 11.5 }) + dgTxt(66, 226, '水（波速慢）', { an: 'start', fs: 11.5, fill: DG.blue });
            const refractionCard = dgCard('折射：由慢介質進入快介質（角度依折射定律計算）', dgSvg(520, 252, s),
                '波由慢介質（水）進入快介質（空氣）：折射角 θ₂ ＞ 入射角 θ₁，折射線「偏離」法線（圖中角度即依實際比例繪出）；頻率不變、波速與波長變大。反向（快→慢）則偏向法線。');
            return diagLightHistory() + diagReflection() + refractionCard;
        }

        function diagN17() {
            const S1 = [150, 95], S2 = [150, 155], Px = 450, Py = 70;
            const r1 = Math.hypot(Px - S1[0], Py - S1[1]), r2 = Math.hypot(Px - S2[0], Py - S2[1]);
            let s = dgLine(150, 30, 150, 88, DG.ink, 4) + dgLine(150, 102, 150, 148, DG.ink, 4) + dgLine(150, 162, 150, 230, DG.ink, 4);
            s += dgTxt(134, 99, 'S₁', { an: 'end', fs: 12, b: 1 }) + dgTxt(134, 159, 'S₂', { an: 'end', fs: 12, b: 1 });
            s += dgLine(450, 30, 450, 230, DG.ink, 3);
            s += dgLine(150, 125, 450, 125, DG.grid, 1, '5 4') + dgTxt(464, 129, 'O', { fs: 11, fill: DG.muted });
            s += dgArrow(62, 95, 110, 95, DG.muted, 1.5) + dgArrow(62, 155, 110, 155, DG.muted, 1.5) + dgTxt(88, 130, '入射波', { fs: 10.5, fill: DG.muted });
            s += dgLine(S1[0], S1[1], Px, Py, DG.blue, 1.8) + dgLine(S2[0], S2[1], Px, Py, DG.rose, 1.8);
            s += '<circle cx="' + Px + '" cy="' + Py + '" r="3.5" fill="' + DG.ink + '"/>' + dgTxt(Px + 14, Py + 4, 'P', { fs: 12, b: 1 });
            const angS2 = Math.atan2(S2[1] - Py, S2[0] - Px) * 180 / Math.PI;
            let arcPts = '';
            for (let a = angS2 - 5; a <= angS2 + 3; a += 0.5) arcPts += dgR(Px + r1 * Math.cos(a * Math.PI / 180)) + ',' + dgR(Py + r1 * Math.sin(a * Math.PI / 180)) + ' ';
            s += dgPoly(arcPts, DG.green, 1.4, null, '4 3');
            const ux = (Px - S2[0]) / r2, uy = (Py - S2[1]) / r2, d = r2 - r1;
            s += dgLine(S2[0], S2[1], S2[0] + ux * d, S2[1] + uy * d, DG.green, 4.5);
            s += dgTxt(206, 182, 'Δ ＝ 波程差', { fill: DG.green, fs: 11.5, b: 1 });
            [[125, 20], [70, 16], [180, 16]].forEach(bar => {
                s += '<rect x="452" y="' + (bar[0] - bar[1] / 2) + '" width="9" height="' + bar[1] + '" fill="' + DG.blue + '" opacity="0.75"/>';
            });
            s += dgTxt(487, 74, '亮紋', { fs: 10.5, fill: DG.blue });
            return dgCard('雙狹縫干涉：波程差的幾何意義', dgSvg(520, 250, s),
                '兩狹縫到 P 點的路徑長不同，波程差 Δ = |S₂P − S₁P|（綠色粗段）。Δ = nλ → 同相加強（亮紋）；Δ = (n＋½)λ → 反相相消（暗紋）；相鄰亮紋的 Δ 恰差一個 λ。');
        }

        function diagN19() {
            const ox = 265, oy = 125, k = 60000;
            let s = dgArrow(40, oy, 492, oy, DG.ink, 1.5) + dgArrow(ox, 237, ox, 25, DG.ink, 1.5);
            s += dgTxt(484, oy + 20, 'x', { fs: 12 }) + dgTxt(ox + 14, 36, 'F', { fs: 12 });
            let pR = '', pL = '';
            for (let xr = 26; xr <= 215; xr += 3) {
                const f = Math.min(95, k / (xr * xr));
                pR += dgR(ox + xr) + ',' + dgR(oy + f) + ' ';
                pL = dgR(ox - xr) + ',' + dgR(oy - f) + ' ' + pL;
            }
            s += dgPoly(pR, DG.rose, 2.2) + dgPoly(pL, DG.rose, 2.2);
            s += '<circle cx="' + ox + '" cy="' + oy + '" r="5.5" fill="' + DG.orange + '"/>' + dgTxt(ox + 24, oy - 10, '質子', { fs: 11, fill: DG.orange, b: 1 });
            s += '<circle cx="365" cy="' + oy + '" r="4" fill="' + DG.green + '"/>' + dgArrow(365, oy, 325, oy, DG.green, 2) + dgTxt(383, oy - 14, '電子受力指向原點', { fs: 10.5, fill: DG.green, an: 'start' });
            s += '<circle cx="165" cy="' + oy + '" r="4" fill="' + DG.green + '"/>' + dgArrow(165, oy, 205, oy, DG.green, 2);
            s += dgTxt(408, 218, 'x＞0 側：F＜0', { fs: 11, fill: DG.muted }) + dgTxt(122, 46, 'x＜0 側：F＞0', { fs: 11, fill: DG.muted });
            const coulombCard = dgCard('氫原子中電子所受靜電力 F–x 圖（曲線依 1/x² 計算）', dgSvg(520, 250, s),
                '電子受質子的庫侖引力：量值 ∝ 1/x²（隨距離急遽衰減）、方向恆「指向原點」——x＞0 側 F 為負、x＜0 側 F 為正。115 學測 Q16 即考此圖形的判讀。');
            return coulombCard + diagN19_fieldLines();
        }

        function diagN19_fieldLines() {
            let s = '';
            // Middle divider
            s += `<line x1="260" y1="20" x2="260" y2="220" stroke="${DG.grid}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
            
            // Titles
            s += dgTxt(130, 28, '單一正電荷的電力線 (放射狀、非閉合)', { fs: 11.5, b: 1, fill: DG.ink });
            s += dgTxt(390, 28, '條形磁鐵的磁力線 (外部 N→S、內部 S→N 閉合)', { fs: 11.5, b: 1, fill: DG.ink });

            // Left Side: Single Positive Charge (+q)
            const ex = 130, ey = 120;
            const rStart = 10;
            const rEnd = 54;
            const angles = [0, 45, 90, 135, 180, 225, 270, 315];
            
            angles.forEach(a => {
                const rad = a * Math.PI / 180;
                const x1 = ex + rStart * Math.cos(rad);
                const y1 = ey + rStart * Math.sin(rad);
                const x2 = ex + rEnd * Math.cos(rad);
                const y2 = ey + rEnd * Math.sin(rad);
                s += dgArrow(x1, y1, x2, y2, DG.blue, 1.5);
            });
            
            // Positive charge circle
            s += `<circle cx="${ex}" cy="${ey}" r="9" fill="${DG.rose}" stroke="#fff" stroke-width="1.2"/>` + dgTxt(ex, ey + 4, '+', { fill: '#fff', b: 1, fs: 13 });
            s += dgTxt(ex, ey - 14, '+q', { fs: 10.5, fill: DG.rose, b: 1 });

            // Right Side: Bar Magnet (N on Left, S on Right)
            const mx = 390, my = 120;
            const mw = 76, mh = 26;
            
            // Outside loops (N to S: Left to Right)
            // Loop 1 (Inner top)
            s += `<path d="M ${mx - 30} ${my - mh/2} C ${mx - 30} 50, ${mx + 30} 50, ${mx + 30} ${my - mh/2}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 64, mx + 2, 64, DG.green, 1.5);
            
            // Loop 2 (Outer top)
            s += `<path d="M ${mx - 38} ${my - mh/2 + 5} C ${mx - 60} 20, ${mx + 60} 20, ${mx + 38} ${my - mh/2 + 5}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 43, mx + 2, 43, DG.green, 1.5);
            
            // Loop 3 (Inner bottom)
            s += `<path d="M ${mx - 30} ${my + mh/2} C ${mx - 30} 190, ${mx + 30} 190, ${mx + 30} ${my + mh/2}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 176, mx + 2, 176, DG.green, 1.5);
            
            // Loop 4 (Outer bottom)
            s += `<path d="M ${mx - 38} ${my + mh/2 - 5} C ${mx - 60} 220, ${mx + 60} 220, ${mx + 38} ${my + mh/2 - 5}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 197, mx + 2, 197, DG.green, 1.5);

            // Inside lines (S to N: Right to Left, closed loop continuation)
            s += `<line x1="${mx + 38}" y1="${my}" x2="${mx - 38}" y2="${my}" stroke="${DG.green}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
            s += dgArrow(mx + 5, my, mx - 5, my, DG.green, 1.2);
            
            s += `<line x1="${mx + 30}" y1="${my - 6}" x2="${mx - 30}" y2="${my - 6}" stroke="${DG.green}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
            s += dgArrow(mx + 5, my - 6, mx - 5, my - 6, DG.green, 1.2);
            
            s += `<line x1="${mx + 30}" y1="${my + 6}" x2="${mx - 30}" y2="${my + 6}" stroke="${DG.green}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
            s += dgArrow(mx + 5, my + 6, mx - 5, my + 6, DG.green, 1.2);

            // Magnet Body
            // Left Half: N (Red)
            s += `<path d="M ${mx - 38 + 2} ${my - mh/2} L ${mx} ${my - mh/2} L ${mx} ${my + mh/2} L ${mx - 38 + 2} ${my + mh/2} A 2 2 0 0 1 ${mx - 38} ${my + mh/2 - 2} L ${mx - 38} ${my - mh/2 + 2} A 2 2 0 0 1 ${mx - 38 + 2} ${my - mh/2} Z" fill="${DG.rose}" stroke="#334155" stroke-width="1.2"/>`;
            // Right Half: S (Ink/Blue)
            s += `<path d="M ${mx} ${my - mh/2} L ${mx + 38 - 2} ${my - mh/2} A 2 2 0 0 1 ${mx + 38} ${my - mh/2 + 2} L ${mx + 38} ${my + mh/2 - 2} A 2 2 0 0 1 ${mx + 38 - 2} ${my + mh/2} L ${mx} ${my + mh/2} Z" fill="${DG.ink}" stroke="#334155" stroke-width="1.2"/>`;
            
            // Labels N and S
            s += dgTxt(mx - 19, my + 4, 'N', { fill: '#fff', b: 1, fs: 12.5 });
            s += dgTxt(mx + 19, my + 4, 'S', { fill: '#fff', b: 1, fs: 12.5 });
            
            return dgCard('電力線與磁力線之物理模型對照（單一電荷放射狀 vs. 磁鐵閉合迴圈）', dgSvg(520, 240, s),
                '電力線發自正電荷指向無限遠（非封閉）；磁力線則為連續的封閉迴圈，外部由 N 極指向 S 極，內部由 S 極指向 N 極。課綱強調「單一電荷電力線」與「磁鐵磁力線」的定性對照。');
        }

        function diagN20() {
            let s = '';
            // Middle divider
            s += `<line x1="260" y1="20" x2="260" y2="220" stroke="${DG.grid}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
            
            // Titles
            s += dgTxt(130, 28, '載流直導線的環形磁場', { fs: 11.5, b: 1, fill: DG.ink });
            s += dgTxt(390, 28, '載流螺線管的磁場 (等效條形磁鐵)', { fs: 11.5, b: 1, fill: DG.ink });

            // Left Side: Straight Wire
            const cx = 130, cy = 120;
            const wireColor = '#64748b';
            
            // Draw back half of concentric magnetic field lines (y < cy)
            s += `<path d="M ${cx - 24} ${cy} A 24 7 0 0 1 ${cx + 24} ${cy}" fill="none" stroke="${DG.green}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
            s += `<path d="M ${cx - 42} ${cy + 25} A 42 12 0 0 1 ${cx + 42} ${cy + 25}" fill="none" stroke="${DG.green}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
            s += `<path d="M ${cx - 60} ${cy - 25} A 60 17 0 0 1 ${cx + 60} ${cy - 25}" fill="none" stroke="${DG.green}" stroke-width="1.5" stroke-dasharray="3 2"/>`;

            // Draw the wire
            s += `<line x1="${cx}" y1="42" x2="${cx}" y2="198" stroke="${wireColor}" stroke-width="5" stroke-linecap="round"/>`;
            s += dgArrow(cx, 170, cx, 65, DG.rose, 2.2); // Current arrow
            s += dgTxt(cx - 18, 56, 'I', { fill: DG.rose, b: 1, fs: 13 });
            s += dgTxt(cx + 36, 178, '電流方向', { fill: DG.rose, fs: 10 });

            // Draw front half of magnetic field lines (y > cy) with arrows pointing right (counter-clockwise from top view)
            s += `<path d="M ${cx + 24} ${cy} A 24 7 0 0 1 ${cx - 24} ${cy}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(cx - 2, cy + 7, cx + 2, cy + 7, DG.green, 1.5);
            s += dgTxt(cx + 36, cy + 10, 'B', { fill: DG.green, b: 1, fs: 11 });

            s += `<path d="M ${cx + 42} ${cy + 25} A 42 12 0 0 1 ${cx - 42} ${cy + 25}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(cx - 2, cy + 25 + 12, cx + 2, cy + 25 + 12, DG.green, 1.5);

            s += `<path d="M ${cx + 60} ${cy - 25} A 60 17 0 0 1 ${cx - 60} ${cy - 25}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(cx - 2, cy - 25 + 17, cx + 2, cy - 25 + 17, DG.green, 1.5);

            // Right Side: Solenoid
            const mx = 390, my = 120;
            const mw = 76, mh = 26;
            
            // Top Loop 1
            s += `<path d="M ${mx - 30} ${my - mh/2} C ${mx - 30} 50, ${mx + 30} 50, ${mx + 30} ${my - mh/2}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 64, mx + 2, 64, DG.green, 1.5);
            
            // Top Loop 2
            s += `<path d="M ${mx - 38} ${my - mh/2 + 5} C ${mx - 60} 20, ${mx + 60} 20, ${mx + 38} ${my - mh/2 + 5}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 43, mx + 2, 43, DG.green, 1.5);
            
            // Bottom Loop 1
            s += `<path d="M ${mx - 30} ${my + mh/2} C ${mx - 30} 190, ${mx + 30} 190, ${mx + 30} ${my + mh/2}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 176, mx + 2, 176, DG.green, 1.5);
            
            // Bottom Loop 2
            s += `<path d="M ${mx - 38} ${my + mh/2 - 5} C ${mx - 60} 220, ${mx + 60} 220, ${mx + 38} ${my + mh/2 - 5}" fill="none" stroke="${DG.green}" stroke-width="1.5"/>`;
            s += dgArrow(mx - 2, 197, mx + 2, 197, DG.green, 1.5);

            // Inside lines (S to N: Right to Left)
            s += `<line x1="${mx + 38}" y1="${my}" x2="${mx - 38}" y2="${my}" stroke="${DG.green}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
            s += dgArrow(mx + 5, my, mx - 5, my, DG.green, 1.2);
            
            s += `<line x1="${mx + 30}" y1="${my - 6}" x2="${mx - 30}" y2="${my - 6}" stroke="${DG.green}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
            s += dgArrow(mx + 5, my - 6, mx - 5, my - 6, DG.green, 1.2);
            
            s += `<line x1="${mx + 30}" y1="${my + 6}" x2="${mx - 30}" y2="${my + 6}" stroke="${DG.green}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
            s += dgArrow(mx + 5, my + 6, mx - 5, my + 6, DG.green, 1.2);

            // Draw N/S labels
            s += dgTxt(mx - 54, my + 4, 'N', { fill: DG.rose, b: 1, fs: 13 });
            s += dgTxt(mx + 54, my + 4, 'S', { fill: DG.blue, b: 1, fs: 13 });

            // Draw Solenoid Windings
            const xsBack = [370, 390, 410];
            const xsFront = [350, 370, 390, 410];
            // Back half of windings (drawn first)
            xsBack.forEach(x => {
                s += `<path d="M ${x} 107 A 12 18 0 0 0 ${x} 133" fill="none" stroke="${wireColor}" stroke-width="2.2" stroke-dasharray="3 2" opacity="0.65"/>`;
            });

            // Draw core cylinder behind front wires
            s += `<rect x="${mx - 45}" y="${my - 12}" width="90" height="24" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" opacity="0.8"/>`;
            
            // Front half of windings (slanted, going up-right)
            xsFront.forEach(x => {
                s += `<path d="M ${x} 133 L ${x + 20} 107" fill="none" stroke="${wireColor}" stroke-width="3" stroke-linecap="round"/>`;
                s += dgArrow(x + 7, 124, x + 13, 116, DG.rose, 1.2);
            });

            // Leads
            s += `<line x1="335" y1="152" x2="350" y2="133" stroke="${wireColor}" stroke-width="3" stroke-linecap="round"/>`;
            s += dgArrow(335, 152, 344, 140, DG.rose, 1.2);
            
            s += `<line x1="430" y1="107" x2="445" y2="88" stroke="${wireColor}" stroke-width="3" stroke-linecap="round"/>`;
            s += dgArrow(430, 107, 439, 95, DG.rose, 1.2);
            
            s += dgTxt(332, 164, 'I (入)', { fill: DG.rose, fs: 9.5 });
            s += dgTxt(452, 82, 'I (出)', { fill: DG.rose, fs: 9.5 });

            return dgCard('載流直導線與螺線管的磁場對照圖（安培右手定則）', dgSvg(520, 240, s),
                '直導線：以大拇指指向電流，四指環繞方向即為同心圓磁場 B。螺線管：以四指環繞線圈電流，大拇指所指即為內部磁場方向（等效 N 極端，磁力線由 S 指向 N 閉合）。');
        }

        function diagN21() {
            let s = '';
            for (let i = 0; i < 4; i++) s += '<ellipse cx="100" cy="' + (170 + i * 10) + '" rx="45" ry="10" fill="none" stroke="' + DG.ink + '" stroke-width="2"/>';
            s += '<rect x="78" y="45" width="44" height="32" fill="#94a3b8"/><rect x="78" y="77" width="44" height="33" fill="' + DG.rose + '" opacity="0.85"/>';
            s += dgTxt(100, 66, 'S', { fill: '#fff', b: 1, fs: 14 }) + dgTxt(100, 100, 'N', { fill: '#fff', b: 1, fs: 14 });
            s += dgArrow(140, 68, 140, 115, DG.green, 2.5) + dgTxt(154, 95, 'v', { fill: DG.green, b: 1 });
            s += dgTxt(100, 232, '磁鐵自由落下', { fs: 11, fill: DG.muted });
            s += dgArrow(205, 145, 502, 145, DG.ink, 1.5) + dgArrow(205, 237, 205, 40, DG.ink, 1.5);
            s += dgTxt(192, 50, 'I', { fs: 12 }) + dgTxt(494, 163, 't', { fs: 12 });
            let pts = '';
            for (let tp = 0; tp <= 275; tp += 2) {
                const I = 34 * Math.exp(-Math.pow((tp - 60) / 24, 2)) - 58 * Math.exp(-Math.pow((tp - 150) / 15, 2));
                pts += dgR(210 + tp) + ',' + dgR(145 - I) + ' ';
            }
            s += dgPoly(pts, DG.blue, 2.2);
            s += dgTxt(272, 84, '進入：峰值小、時間長', { fs: 10.5, fill: DG.blue });
            s += dgTxt(330, 162, '中央 I = 0', { fs: 10.5, fill: DG.muted, an: 'start' });
            s += dgTxt(408, 228, '離開：反向、峰值大、時間短', { fs: 10.5, fill: DG.rose });
            return dgCard('磁鐵自由落下穿過線圈的感應電流 I–t 曲線', dgSvg(520, 250, s),
                '進入與離開時感應電流「方向相反」（冷次定律）；磁鐵位於線圈正中央的瞬間，穿過線圈的磁場暫時不變 → I = 0；因重力加速、離開時速度較快 → 離開段峰值較大、歷時較短（曲線不對稱）。');
        }

        function diagN23() {
            const ox = 75, oy = 195, f0x = 210, ex = 455, ey = 72;
            const slope = (oy - ey) / (ex - f0x);
            let s = dgArrow(ox, oy, 492, oy, DG.ink, 1.5) + dgArrow(ox, 268, ox, 30, DG.ink, 1.5);
            s += dgTxt(150, 44, '光電子最大動能 Eₖ', { fs: 11.5 }) + dgTxt(432, 215, '入射光頻率 f', { fs: 11.5 });
            s += dgLine(f0x, oy, ex, ey, DG.blue, 2.5);
            const wy = oy + slope * (f0x - ox);
            s += dgLine(f0x, oy, ox, wy, DG.rose, 1.8, '6 4');
            s += dgTxt(ox + 20, wy + 6, '−W（功函數）', { fill: DG.rose, fs: 11, an: 'start', b: 1 });
            s += '<circle cx="' + f0x + '" cy="' + oy + '" r="4.5" fill="' + DG.rose + '"/>' + dgTxt(f0x, 216, 'f₀（底限頻率）', { fill: DG.rose, fs: 11, b: 1 });
            s += dgTxt(352, 112, '斜率 ＝ h（普朗克常數）', { fs: 11, fill: DG.blue, b: 1, tr: 'rotate(-26.5 352 112)' });
            s += dgTxt(142, 178, 'f ＜ f₀：打不出電子', { fs: 10.5, fill: DG.muted });
            const ekfCard = dgCard('光電效應 Eₖ–f 圖：一條直線讀出 h、f₀、W', dgSvg(520, 285, s),
                'hf = W + Eₖ：橫軸截距為底限頻率 f₀ = W/h、斜率為普朗克常數 h、縱軸截距（外插）為 −W。改變光強度只改變光電子「數目」（光電流），整條直線不動。');
            return ekfCard + diagN23_applications();
        }

        function diagN23_applications() {
            let s = '';
            const apps = [
                { cx: 90, label: '太陽能光電板', note: '光子打出電子形成電流' },
                { cx: 260, label: '相機／手機感光元件', note: 'CCD／CMOS：光轉電訊號成像' },
                { cx: 430, label: '光電感應開關', note: '路燈、防盜門：光被遮斷即觸發' }
            ];
            apps.forEach(a => {
                s += '<rect x="' + (a.cx - 70) + '" y="30" width="140" height="90" rx="10" fill="rgba(37,99,235,0.06)" stroke="' + DG.blue + '" stroke-width="1.4"/>';
                s += dgArrow(a.cx - 45, 55, a.cx - 15, 55, DG.orange, 2) + dgTxt(a.cx - 30, 45, '光子', { fs: 9.5, fill: DG.orange });
                s += '<circle cx="' + (a.cx + 10) + '" cy="72" r="16" fill="rgba(148,163,184,0.25)" stroke="' + DG.ink + '" stroke-width="1.2"/>';
                s += '<circle cx="' + (a.cx + 16) + '" cy="66" r="3.5" fill="' + DG.blue + '"/>';
                s += dgArrow(a.cx + 20, 62, a.cx + 40, 45, DG.blue, 1.8) + dgTxt(a.cx + 42, 42, 'e⁻', { fs: 10, fill: DG.blue, an: 'start' });
                s += dgTxt(a.cx, 138, a.label, { fs: 12, b: 1 });
                s += dgTxt(a.cx, 156, a.note, { fs: 9.5, fill: DG.muted });
            });
            return dgCard('光電效應的生活應用', dgSvg(520, 168, s),
                '共同機制：<b>光子打出電子 → 形成電訊號</b><br>• 太陽能板：光能 → 電能<br>• CCD／CMOS：影像 → 電訊號<br>• 光電開關：光被遮斷、電流消失 → 觸發動作');
        }

        function diagN24() {
            const yOf = E => 48 + (-E / 13.6) * 190;
            const lv = [[0, 'n = ∞（游離）', '0 eV'], [-0.85, 'n = 4', '−0.85 eV'], [-1.51, 'n = 3', '−1.51 eV'], [-3.4, 'n = 2', '−3.40 eV'], [-13.6, 'n = 1（基態）', '−13.6 eV']];
            let s = '';
            lv.forEach((L, i) => {
                const y = yOf(L[0]);
                s += dgLine(120, y, 400, y, i === 0 ? DG.muted : DG.ink, i === 0 ? 1.2 : 2, i === 0 ? '6 4' : null);
                s += dgTxt(112, y + 4, L[1], { an: 'end', fs: 10.5 }) + dgTxt(408, y + 4, L[2], { an: 'start', fs: 10.5, fill: DG.muted });
            });
            const y3 = yOf(-1.51), y2 = yOf(-3.4);
            s += dgArrow(230, y3, 230, y2, DG.rose, 2.2);
            let wav = '';
            for (let x = 246; x <= 344; x += 3) wav += dgR(x) + ',' + dgR((y3 + y2) / 2 + 7 * Math.sin((x - 246) / 7)) + ' ';
            s += dgPoly(wav, DG.green, 2) + dgArrow(344, (y3 + y2) / 2 + 7 * Math.sin(98 / 7), 358, (y3 + y2) / 2, DG.green, 2);
            s += dgTxt(322, (y3 + y2) / 2 + 27, '發射光子 ΔE ＝ hf', { fs: 11, fill: DG.green, b: 1 });
            return dgCard('氫原子能階圖（依實際能量比例繪製）', dgSvg(520, 268, s),
                '能階不連續（量子化）且越往高處越密集。電子「向下」躍遷放出光子、「向上」躍遷須吸收恰等於能階差的能量：ΔE = hf = hc/λ——這正是原子光譜為線光譜的原因。');
        }

        function diagN01() {
            // 基本量（7 個）→ 組合出導出量
            const base = [['長度', 'm'], ['質量', 'kg'], ['時間', 's'], ['電流', 'A'], ['溫度', 'K'], ['物質量', 'mol'], ['發光強度', 'cd']];
            let s = dgTxt(260, 26, '7 個基本量（SI 只認這 7 個）', { fs: 12.5, b: 1, fill: DG.blue });
            base.forEach((b, i) => {
                const x = 34 + i * 70;
                s += '<rect x="' + x + '" y="38" width="62" height="40" rx="7" fill="rgba(37,99,235,0.10)" stroke="' + DG.blue + '" stroke-width="1.4"/>';
                s += dgTxt(x + 31, 56, b[0], { fs: 11, b: 1 }) + dgTxt(x + 31, 71, b[1], { fs: 11, fill: DG.blue, b: 1 });
            });
            s += dgArrow(260, 84, 260, 108, DG.ink, 2) + dgTxt(330, 101, '相乘除組合而成', { fs: 10.5, fill: DG.muted });
            const derived = [
                ['力 N', 'kg·m·s⁻²'], ['能量 J', 'kg·m²·s⁻²'], ['電荷 C', 'A·s'], ['電壓 V', 'kg·m²·s⁻³·A⁻¹']
            ];
            s += dgTxt(260, 128, '導出量（大考最愛拿來當誘答）', { fs: 12.5, b: 1, fill: DG.rose });
            derived.forEach((d, i) => {
                const x = 26 + i * 122;
                s += '<rect x="' + x + '" y="140" width="112" height="44" rx="7" fill="rgba(225,29,72,0.07)" stroke="' + DG.rose + '" stroke-width="1.4"/>';
                s += dgTxt(x + 56, 159, d[0], { fs: 11.5, b: 1 }) + dgTxt(x + 56, 175, d[1], { fs: 10, fill: DG.muted });
            });
            s += dgTxt(260, 208, '不會背？找一條含它的公式移項：h ＝ E／f ⇒ J·s ＝ kg·m²·s⁻¹', { fs: 11, b: 1 });
            return dgCard('基本量 vs 導出量', dgSvg(520, 224, s),
                '• SI 基本量只有 7 個，其餘全是導出量<br>• 庫侖 C、牛頓 N、焦耳 J、伏特 V 都<b>不是</b>基本單位<br>• 遇到陌生常數：找一條含它的公式移項，即可拆出基本單位');
        }

        function diagN02() {
            // 對數尺度軸：10⁻¹⁵ ~ 10²⁶ m
            const x0 = 40, x1 = 490, y = 96, lo = -15, hi = 26;
            const px = e => x0 + (e - lo) / (hi - lo) * (x1 - x0);
            let s = dgArrow(x0 - 6, y, x1 + 8, y, DG.ink, 1.8);
            for (let e = lo; e <= hi; e += 5) {
                s += dgLine(px(e), y - 5, px(e), y + 5, DG.muted, 1.2);
                s += dgTxt(px(e), y + 20, '10' + String(e).replace('-', '⁻').replace(/[0-9]/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]), { fs: 9.5, fill: DG.muted });
            }
            s += dgTxt(265, y + 40, '尺度（公尺，對數座標）', { fs: 11, fill: DG.muted });
            const marks = [
                { e: -15, n: '原子核', up: 1 }, { e: -10, n: '原子', up: 0 }, { e: -7, n: '病毒', up: 1 },
                { e: -5, n: '細胞', up: 0 }, { e: 0, n: '人', up: 1 }, { e: 7, n: '地球', up: 0 },
                { e: 21, n: '銀河系', up: 1 }, { e: 26, n: '可觀測宇宙', up: 0 }
            ];
            marks.forEach(m => {
                const yy = m.up ? y - 30 : y + 58;
                s += dgLine(px(m.e), y, px(m.e), m.up ? y - 22 : y + 50, DG.blue, 1.2, '3 3');
                s += '<circle cx="' + dgR(px(m.e)) + '" cy="' + y + '" r="4" fill="' + DG.blue + '"/>';
                s += dgTxt(px(m.e), yy, m.n, { fs: 10.5, b: 1, fill: DG.blue });
            });
            s += dgTxt(265, 186, '數量級進位看 √10 ≈ 3.16，不是 5', { fs: 12, b: 1, fill: DG.rose });
            s += dgTxt(265, 205, '4.5×10⁸ → 4.5 ＞ 3.16 → 數量級為 10⁹', { fs: 11 });
            return dgCard('自然界的尺度（對數座標）', dgSvg(520, 220, s),
                '• 軸上每個標記相差 10⁵ 倍，全軸橫跨 41 個數量級<br>• 原子 10⁻¹⁰ m、原子核 10⁻¹⁵ m（差 10 萬倍）<br>• 判進位用 <b>√10 ≈ 3.16</b>：係數 ≥ 3.16 才進位<br>• 4.5×10⁸ 的數量級是 10⁹，不是 10⁸');
        }

        function diagN11() {
            // 兩個溫度下的分子：速度箭頭長度 ∝ √T，並標絕對溫標換算
            const box = (cx, tC, tK, vScale, col, lab) => {
                let g = '<rect x="' + (cx - 92) + '" y="46" width="184" height="120" rx="9" fill="rgba(148,163,184,0.06)" stroke="' + col + '" stroke-width="1.5"/>';
                g += dgTxt(cx, 36, lab, { fs: 12, b: 1, fill: col });
                const seed = [[0.2, 0.25], [0.6, 0.18], [0.82, 0.42], [0.35, 0.55], [0.7, 0.7], [0.15, 0.75]];
                seed.forEach((p, i) => {
                    const x = cx - 78 + p[0] * 156, yy = 56 + p[1] * 100, a = i * 1.9;
                    g += '<circle cx="' + dgR(x) + '" cy="' + dgR(yy) + '" r="5" fill="' + col + '"/>';
                    g += dgArrow(x + 6 * Math.cos(a), yy + 6 * Math.sin(a), x + (6 + 20 * vScale) * Math.cos(a), yy + (6 + 20 * vScale) * Math.sin(a), col, 1.5);
                });
                g += dgTxt(cx, 186, tC + ' ℃ ＝ ' + tK + ' K', { fs: 12, b: 1 });
                return g;
            };
            let s = box(140, '27', '300', 0.62, DG.blue, '低溫') + box(380, '327', '600', 0.877, DG.rose, '高溫');
            s += dgTxt(260, 212, '絕對溫度變 2 倍 ⇒ 平均動能變 2 倍（Ēk ∝ T）', { fs: 12, b: 1 });
            s += dgTxt(260, 232, '務必先換算 K ＝ ℃ ＋ 273，直接用攝氏相除必錯', { fs: 11, fill: DG.rose });
            return dgCard('氣體分子平均動能與絕對溫度', dgSvg(520, 244, s),
                '• 溫度越高，分子跑越快（箭頭越長）<br>• 平均動能 <b>正比於絕對溫度 T</b>，不是攝氏<br>• 比值題先換算：K ＝ ℃ ＋ 273<br>• 例：27℃→300 K、327℃→600 K，動能比 ＝ 2');
        }

        function diagN12() {
            // 桑基圖：輸入能量逐級退化為廢熱
            const y0 = 50, h0 = 96, x0 = 30;
            const stages = [
                { name: '輸入 100', frac: 1.0, w: 96 },
                { name: '有用 40', frac: 0.4, w: 96 },
                { name: '有用 16', frac: 0.16, w: 96 }
            ];
            let s = '';
            let curH = h0, curY = y0, curX = x0;
            const labels = ['化學能 100', '機械能 40', '電能 16'];
            const effs = ['效率 40%', '效率 40%'];
            for (let i = 0; i < 3; i++) {
                const hh = h0 * (i === 0 ? 1 : i === 1 ? 0.4 : 0.16);
                const yy = y0 + (h0 - hh) / 2;
                s += '<rect x="' + curX + '" y="' + dgR(yy) + '" width="86" height="' + dgR(hh) + '" rx="5" fill="' + DG.blue + '" opacity="' + (0.85 - i * 0.15) + '"/>';
                s += dgTxt(curX + 43, dgR(yy + hh / 2 + 4), labels[i], { fs: 10.5, b: 1, fill: '#ffffff' });
                if (i < 2) {
                    const nx = curX + 86;
                    const nh = h0 * (i === 0 ? 0.4 : 0.16);
                    const ny = y0 + (h0 - nh) / 2;
                    // 廢熱分流（往下）
                    s += '<polygon points="' + nx + ',' + dgR(yy) + ' ' + (nx + 74) + ',' + dgR(ny) + ' ' + (nx + 74) + ',' + dgR(ny + nh) + ' ' + nx + ',' + dgR(yy + hh) + '" fill="rgba(37,99,235,0.25)"/>';
                    s += dgArrow(nx + 30, dgR(yy + hh) + 6, nx + 30, dgR(yy + hh) + 44, DG.orange, 2.2);
                    s += dgTxt(nx + 34, dgR(yy + hh) + 58, '廢熱', { fs: 10, fill: DG.orange, b: 1 });
                    s += dgTxt(nx + 37, dgR(ny) - 10, effs[i], { fs: 10, fill: DG.muted });
                    curX = nx + 74;
                }
            }
            s += dgTxt(260, 196, '總效率 ＝ 0.4 × 0.4 ＝ 16%（各級相乘，不是相加）', { fs: 12, b: 1, fill: DG.rose });
            s += dgTxt(260, 218, '能量沒有消失，只是變成難以再利用的廢熱', { fs: 11, fill: DG.muted });
            return dgCard('能量退化：每轉換一次就打折', dgSvg(520, 232, s),
                '• 能量<b>守恆</b>，但品質會退化成廢熱<br>• 任何裝置效率都 ＜ 100%<br>• 多級轉換：總效率 ＝ 各級<b>相乘</b><br>• 熱可以全部由功轉成，反過來卻不行');
        }

        function diagN13() {
            const cx = 150, cy = 108;
            let s = dgTxt(150, 30, '核分裂前後', { fs: 12.5, b: 1 });
            // 反應前：一顆大核
            s += '<circle cx="70" cy="' + cy + '" r="30" fill="rgba(37,99,235,0.20)" stroke="' + DG.blue + '" stroke-width="1.6"/>';
            s += dgTxt(70, cy + 5, 'M', { fs: 15, b: 1, fill: DG.blue });
            s += dgTxt(70, cy + 48, '反應前', { fs: 10.5, fill: DG.muted });
            s += dgArrow(108, cy, 146, cy, DG.ink, 2);
            // 反應後：兩顆較小的核，總質量略小
            s += '<circle cx="182" cy="' + (cy - 20) + '" r="21" fill="rgba(37,99,235,0.20)" stroke="' + DG.blue + '" stroke-width="1.5"/>';
            s += '<circle cx="182" cy="' + (cy + 24) + '" r="18" fill="rgba(37,99,235,0.20)" stroke="' + DG.blue + '" stroke-width="1.5"/>';
            // 放出的中子：沒有它就無法說明鏈鎖反應為什麼會持續
            [[214, cy - 34], [222, cy + 2], [210, cy + 44]].forEach(p => {
                s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="' + DG.ink + '"/>';
            });
            s += dgTxt(236, cy - 44, '中子', { fs: 9.5, fill: DG.ink, an: 'start' });
            s += dgTxt(182, cy + 62, '反應後（總質量略小）', { fs: 10.5, fill: DG.muted });
            s += dgTxt(255, cy - 4, '少掉的質量 Δm', { fs: 11.5, b: 1, fill: DG.rose, an: 'start' });
            s += dgArrow(258, cy + 8, 300, cy + 34, DG.rose, 2);
            s += '<rect x="286" y="' + (cy + 40) + '" width="120" height="34" rx="8" fill="rgba(225,29,72,0.10)" stroke="' + DG.rose + '" stroke-width="1.4"/>';
            s += dgTxt(346, cy + 62, 'E ＝ Δm c²', { fs: 14, b: 1, fill: DG.rose });
            // 能量轉換鏈
            const chain = ['核能', '熱能', '機械能', '電能'];
            const cy2 = 214;
            chain.forEach((c, i) => {
                const x = 46 + i * 118;
                s += '<rect x="' + x + '" y="' + cy2 + '" width="82" height="30" rx="7" fill="rgba(148,163,184,0.10)" stroke="' + DG.ink + '" stroke-width="1.2"/>';
                s += dgTxt(x + 41, cy2 + 20, c, { fs: 11.5, b: 1 });
                if (i < 3) s += dgArrow(x + 84, cy2 + 15, x + 114, cy2 + 15, DG.orange, 1.8);
            });
            s += dgTxt(260, cy2 - 10, '核電廠：釋出的是「能量」，還要一路轉換才變成電（每級都打折）', { fs: 11, b: 1 });
            return dgCard('質能互換與核能發電', dgSvg(520, 262, s),
                '• 反應後總質量<b>略小於</b>反應前，差額 Δm 即質量虧損<br>• 釋出能量 E ＝ Δm c²，c² 極大 ⇒ 微小 Δm 換巨大能量<br>• 只有虧損的那一小部分變成能量，<b>不是</b>燃料全部<br>• 釋出的是能量，不是電；發電還要經熱→機械→電');
        }

        function diagN22() {
            // 並聯家電：總電流累加 → 超過額定則跳脫
            const busY = 70, retY = 196;
            let s = dgLine(40, busY, 470, busY, DG.rose, 3) + dgTxt(30, busY - 10, '活線 110 V', { fs: 10.5, an: 'start', b: 1, fill: DG.rose });
            s += dgLine(40, retY, 470, retY, DG.ink, 3) + dgTxt(30, retY + 18, '中性線', { fs: 10.5, an: 'start', b: 1 });
            const apps = [{ n: '電暖器', i: '8 A' }, { n: '烤箱', i: '10 A' }, { n: '微波爐', i: '7 A' }];
            apps.forEach((a, k) => {
                const x = 168 + k * 116;
                s += dgLine(x, busY, x, retY, DG.muted, 1.6);
                s += '<rect x="' + (x - 34) + '" y="112" width="68" height="42" rx="7" fill="rgba(37,99,235,0.08)" stroke="' + DG.blue + '" stroke-width="1.4"/>';
                s += dgTxt(x, 130, a.n, { fs: 11.5, b: 1 }) + dgTxt(x, 146, a.i, { fs: 11, fill: DG.blue, b: 1 });
            });
            // 無熔絲開關
            s += '<rect x="72" y="46" width="58" height="48" rx="7" fill="rgba(225,29,72,0.08)" stroke="' + DG.rose + '" stroke-width="1.6"/>';
            s += dgTxt(101, 66, '無熔絲', { fs: 10, b: 1 }) + dgTxt(101, 80, '開關 20 A', { fs: 10, b: 1, fill: DG.rose });
            s += dgArrow(146, 96, 168, 96, DG.rose, 1.6);
            s += dgTxt(260, 176, '每台電壓都是 110 V（並聯不會變小）', { fs: 11, fill: DG.muted });
            s += dgTxt(260, 224, '總電流 ＝ 8 ＋ 10 ＋ 7 ＝ 25 A ＞ 20 A ⇒ 跳脫', { fs: 12.5, b: 1, fill: DG.rose });
            return dgCard('家庭並聯用電與過載跳脫', dgSvg(520, 240, s),
                '• 家電一律<b>並聯</b>：每台分到的電壓都是 110 V<br>• 電器越開越多，<b>總電流累加</b>（電壓不會變小）<br>• 總電流超過無熔絲開關額定 ⇒ 跳脫斷電，防電線走火<br>• 220 V 供高功率電器（冷氣），取自兩條活線之間');
        }

        function diagN03() {
            // 三種運動 × 三種圖：座標一律由運動學關係計算
            const kinds = [
                { name: '靜止', v: t => 0, x: t => 0.5, a: 0, col: DG.muted },
                { name: '等速', v: t => 0.55, x: t => 0.12 + 0.72 * t, a: 0, col: DG.blue },
                { name: '等加速', v: t => 0.75 * t, x: t => 0.1 + 0.75 * t * t, a: 0.55, col: DG.rose }
            ];
            const cellW = 132, cellH = 88, ox = 72, oy = 44, gapX = 10, gapY = 20;
            let s = '';
            ['x–t 圖', 'v–t 圖', 'a–t 圖'].forEach((lab, r) => {
                s += dgTxt(30, oy + r * (cellH + gapY) + cellH / 2, lab, { fs: 11.5, b: 1, an: 'middle' });
            });
            kinds.forEach((k, c) => {
                const cx0 = ox + c * (cellW + gapX);
                s += dgTxt(cx0 + cellW / 2, 30, k.name, { fs: 12, b: 1, fill: k.col });
                [0, 1, 2].forEach(r => {
                    const cy0 = oy + r * (cellH + gapY);
                    s += '<rect x="' + cx0 + '" y="' + cy0 + '" width="' + cellW + '" height="' + cellH + '" fill="rgba(148,163,184,0.05)" stroke="' + DG.grid + '" stroke-width="1"/>';
                    s += dgLine(cx0 + 8, cy0 + cellH - 8, cx0 + cellW - 6, cy0 + cellH - 8, DG.muted, 1);
                    s += dgLine(cx0 + 8, cy0 + cellH - 8, cx0 + 8, cy0 + 8, DG.muted, 1);
                    const fn = r === 0 ? k.x : r === 1 ? k.v : (() => k.a / 1.2);
                    let pts = '';
                    for (let t = 0; t <= 1.001; t += 0.05) {
                        const px = cx0 + 8 + t * (cellW - 20);
                        const py = cy0 + cellH - 8 - Math.min(fn(t), 1) * (cellH - 22);
                        pts += dgR(px) + ',' + dgR(py) + ' ';
                    }
                    s += dgPoly(pts, k.col, 2.4);
                });
            });
            return dgCard('三種運動 × 三種圖形對照', dgSvg(520, 350, s),
                '• x–t 斜率 ＝ 速度；v–t 斜率 ＝ 加速度、面積 ＝ 位移<br>• 靜止：x 水平、v＝0、a＝0<br>• 等速：x 斜直線、v 水平、a＝0<br>• 等加速：x 為曲線、v 斜直線、a 水平<br>• 先看縱軸是 x 還是 v，再談斜率');
        }

        function diagN08() {
            const ex = 130, ey = 130, R = 46;
            let s = '<circle cx="' + ex + '" cy="' + ey + '" r="' + R + '" fill="#bfdbfe" stroke="' + DG.blue + '" stroke-width="1.5"/>';
            s += dgTxt(ex, ey + 5, '地球', { fs: 12, b: 1 });
            // 重力場箭頭：長度 ∝ 1/r²，方向指向地心
            [[0, 1], [0.7, 0.7], [1, 0], [0.7, -0.7], [0, -1], [-0.7, -0.7], [-1, 0], [-0.7, 0.7]].forEach(d => {
                [1.55, 2.4].forEach(k => {
                    const r = R * k, len = 40 / (k * k);   // 長度真的 ∝ 1/r²（加常數會破壞比例）
                    const x1 = ex + d[0] * r, y1 = ey + d[1] * r;
                    s += dgArrow(x1, y1, x1 - d[0] * len, y1 - d[1] * len, DG.rose, 1.8);
                });
            });
            s += dgTxt(ex, 246, '場方向恆指向地心，越遠越弱（∝ 1/r²）', { fs: 11, fill: DG.rose });
            // g–r 圖
            const gx = 300, gy = 210, gw = 190, gh = 160;
            s += dgArrow(gx, gy, gx + gw, gy, DG.ink, 1.5) + dgArrow(gx, gy, gx, gy - gh, DG.ink, 1.5);
            s += dgTxt(gx + gw - 10, gy + 18, 'r', { fs: 11 }) + dgTxt(gx - 14, gy - gh + 10, 'g', { fs: 11 });
            const rSurf = 45, gSurf = 118;
            let pts = '';
            for (let r = rSurf; r <= gw - 8; r += 2) pts += dgR(gx + r) + ',' + dgR(gy - gSurf * (rSurf * rSurf) / (r * r)) + ' ';
            s += dgPoly(pts, DG.blue, 2.4);
            s += dgLine(gx + rSurf, gy, gx + rSurf, gy - gSurf, DG.grid, 1, '4 3');
            s += '<circle cx="' + (gx + rSurf) + '" cy="' + (gy - gSurf) + '" r="4" fill="' + DG.rose + '"/>';
            s += dgTxt(gx + rSurf, gy + 16, '地表 R', { fs: 10.5, fill: DG.muted });
            s += dgTxt(gx + rSurf + 52, gy - gSurf + 6, 'g ＝ GM／R²', { fs: 11, b: 1, fill: DG.rose, an: 'start' });
            return dgCard('重力場：方向與強度', dgSvg(520, 262, s),
                '• 場方向恆指向星球中心<br>• 強度 ∝ 1/r²，離越遠越弱<br>• 地表：g ＝ GM／R²<br>• 比較不同星球用比值法，不必代入 G');
        }

        function diagN18() {
            const bands = [
                { n: '無線電波', c: '#64748b' }, { n: '微波', c: '#0891b2' }, { n: '紅外線', c: '#dc2626' },
                { n: '可見光', c: '#16a34a' }, { n: '紫外線', c: '#7c3aed' }, { n: 'X 射線', c: '#2563eb' }, { n: 'γ 射線', c: '#be123c' }
            ];
            const x0 = 30, w = (460) / bands.length, y = 66, h = 40;
            let s = '';
            bands.forEach((b, i) => {
                s += '<rect x="' + dgR(x0 + i * w) + '" y="' + y + '" width="' + dgR(w) + '" height="' + h + '" fill="' + b.c + '" opacity="0.82"/>';
                s += dgTxt(x0 + i * w + w / 2, y + h + 16, b.n, { fs: 10, b: 1 });
            });
            s += dgArrow(30, 44, 300, 44, DG.ink, 1.6) + dgTxt(160, 36, '波長變短', { fs: 11, b: 1 });
            s += dgArrow(320, 44, 490, 44, DG.ink, 1.6) + dgTxt(408, 36, '頻率變高', { fs: 11, b: 1 });
            // 繞射示意：長波繞過障礙、短波直進
            const dy = 150;
            s += dgTxt(20, dy - 8, '長波（無線電）：波長與建物尺度接近 → 容易繞過', { fs: 10.5, an: 'start', fill: DG.muted });
            s += '<rect x="150" y="' + (dy + 6) + '" width="26" height="46" fill="rgba(100,116,139,0.45)"/>';
            let lw = '';
            for (let x = 30; x <= 300; x += 3) lw += dgR(x) + ',' + dgR(dy + 30 + 12 * Math.sin(x / 13)) + ' ';
            s += dgPoly(lw, '#64748b', 2);
            s += dgPoly('176,' + (dy + 52) + ' 196,' + (dy + 60) + ' 230,' + (dy + 56), '#64748b', 1.6, null, '4 3');
            s += dgTxt(20, dy + 84, '短波（可見光）：波長遠小於建物 → 直進、形成陰影', { fs: 10.5, an: 'start', fill: DG.muted });
            s += '<rect x="150" y="' + (dy + 98) + '" width="26" height="46" fill="rgba(100,116,139,0.45)"/>';
            let sw = '';
            for (let x = 30; x <= 150; x += 2) sw += dgR(x) + ',' + dgR(dy + 122 + 5 * Math.sin(x / 4)) + ' ';
            s += dgPoly(sw, DG.green, 2);
            s += '<rect x="176" y="' + (dy + 110) + '" width="120" height="22" fill="rgba(100,116,139,0.18)"/>' + dgTxt(236, dy + 125, '陰影區', { fs: 10, fill: DG.muted });
            return dgCard('電磁波譜與繞射', dgSvg(520, 300, s),
                '• 真空中速率全部相同 ＝ 光速 c<br>• 由左至右：波長變短、頻率變高<br>• 繞射看「波長 vs 障礙物尺度」是否接近<br>• 無線電波能繞過建物；可見光直進、留下陰影');
        }

        function diagN25() {
            let s = '';
            s += dgTxt(130, 30, '巨觀物體（棒球）', { fs: 12, b: 1 });
            s += '<circle cx="130" cy="80" r="18" fill="' + DG.orange + '"/>';
            s += dgTxt(130, 118, 'm 大 → p 大', { fs: 11 });
            s += dgTxt(130, 136, 'λ ＝ h／p 極小', { fs: 11, b: 1, fill: DG.muted });
            s += dgTxt(130, 154, '→ 波動性觀察不到', { fs: 11, fill: DG.muted });
            let flat = '';
            for (let x = 60; x <= 200; x += 2) flat += dgR(x) + ',' + dgR(180 + 1.5 * Math.sin(x / 1.2)) + ' ';
            s += dgPoly(flat, DG.orange, 2);
            s += dgLine(260, 22, 260, 200, DG.grid, 1.2, '5 4');
            s += dgTxt(390, 30, '微觀粒子（電子）', { fs: 12, b: 1 });
            s += '<circle cx="390" cy="80" r="5" fill="' + DG.blue + '"/>';
            s += dgTxt(390, 118, 'm 小 → p 小', { fs: 11 });
            s += dgTxt(390, 136, 'λ ＝ h／p 較大', { fs: 11, b: 1, fill: DG.blue });
            s += dgTxt(390, 154, '→ 可測到干涉、繞射', { fs: 11, fill: DG.blue });
            let wav = '';
            for (let x = 320; x <= 460; x += 2) wav += dgR(x) + ',' + dgR(180 + 14 * Math.sin(x / 11)) + ' ';
            s += dgPoly(wav, DG.blue, 2.2);
            s += dgTxt(260, 224, 'λ ＝ h／p：動量越小，物質波波長越長、波動性越明顯', { fs: 11.5, b: 1 });
            return dgCard('物質波：為什麼只有微觀粒子看得到波動性', dgSvg(520, 240, s),
                '• 所有實體粒子都有波動性，波長 λ ＝ h／p<br>• h 極小（6.6×10⁻³⁴），巨觀物體 p 太大 → λ 小到測不出<br>• 電子質量小、λ 較長 → 雙狹縫可看到干涉條紋<br>• 物質波是「機率波」，不需要介質');
        }

        function diagN27() {
            const rows = [
                { n: '強力', s: '10²', r: '約 10⁻¹⁵ m（短程）', job: '束縛夸克、穩定原子核', col: DG.rose },
                { n: '電磁力', s: '1', r: '無限遠（長程）', job: '化學鍵、日常接觸力', col: DG.blue },
                { n: '弱力', s: '10⁻¹³', r: '約 10⁻¹⁸ m（極短程）', job: 'β 衰變', col: DG.orange },
                { n: '重力', s: '10⁻³⁸', r: '無限遠（長程）', job: '天體運行', col: DG.green }
            ];
            let s = '';
            s += dgTxt(58, 30, '交互作用', { fs: 11, b: 1 }) + dgTxt(168, 30, '相對強度', { fs: 11, b: 1 }) + dgTxt(300, 30, '作用範圍', { fs: 11, b: 1 }) + dgTxt(440, 30, '主要角色', { fs: 11, b: 1 });
            s += dgLine(20, 38, 500, 38, DG.ink, 1.4);
            rows.forEach((r, i) => {
                const y = 62 + i * 46;
                s += dgTxt(58, y, r.n, { fs: 12, b: 1, fill: r.col });
                s += dgTxt(168, y, r.s, { fs: 11.5 });
                s += dgTxt(300, y, r.r, { fs: 10.5 });
                s += dgTxt(440, y, r.job, { fs: 10.5 });
                s += dgLine(20, y + 14, 500, y + 14, DG.grid, 1);
            });
            s += dgTxt(260, 254, '微觀尺度：強力 ＞ 電磁力 ＞ 弱力 ＞ 重力', { fs: 11.5, b: 1 });
            return dgCard('四大基本交互作用對照', dgSvg(520, 268, s),
                '• 強力：短程，克服質子間排斥、穩住原子核<br>• 電磁力：長程，主導化學鍵與所有接觸力<br>• 弱力：極短程，控制 β 衰變<br>• 重力：長程但最弱，微觀可忽略、宏觀主導天體');
        }

        function diagN26() {
            const ox = 65, oy = 205, T = 95, N0 = 155;
            let s = dgArrow(ox, oy, 498, oy, DG.ink, 1.5) + dgArrow(ox, oy, ox, 28, DG.ink, 1.5);
            s += dgTxt(178, 40, '未衰變的原子核數 N/N₀', { fs: 11.5 }) + dgTxt(470, 226, '時間', { fs: 11.5 });
            let pts = '';
            for (let t = 0; t <= 415; t += 4) pts += dgR(ox + t) + ',' + dgR(oy - N0 * Math.exp(-Math.LN2 * t / T)) + ' ';
            s += dgPoly(pts, DG.blue, 2.5);
            s += dgTxt(52, oy - N0 + 5, '1', { fs: 11, fill: DG.muted });
            [[1, '1/2'], [2, '1/4'], [3, '1/8']].forEach(g => {
                const x = ox + g[0] * T, y = oy - N0 * Math.pow(0.5, g[0]);
                s += dgLine(x, oy, x, y, DG.grid, 1, '4 3') + dgLine(ox, y, x, y, DG.grid, 1, '4 3');
                s += dgTxt(50, y + 4, g[1], { fs: 11, fill: DG.rose, b: 1 });
                s += dgTxt(x, 222, g[0] === 1 ? 'T½' : g[0] + 'T½', { fs: 11, fill: DG.muted });
            });
            return dgCard('放射性衰變：半衰期曲線（指數函數取點繪製）', dgSvg(520, 240, s),
                '每經過一個半衰期 T½，尚未衰變的核數減半：1 → 1/2 → 1/4 → 1/8……。半衰期由核種本身決定，不受溫度、壓力等外在環境影響。');
        }

        function diagN28() {
            const ox = 75, oy = 215;
            let s = dgArrow(ox, oy, 492, oy, DG.ink, 1.5) + dgArrow(ox, oy, ox, 28, DG.ink, 1.5);
            s += dgTxt(145, 42, '光譜能量密度 I', { fs: 11.5 }) + dgTxt(455, 235, '波長 λ (nm)', { fs: 11.5 });
            
            const getWl = (x) => 150 + ((x - ox) / (450 - ox)) * 2050; // 150 to 2200 nm
            const getPlanckY = (wl, T) => {
                // Planck's Law scaled for canvas
                const C1 = 6.8e15;
                const C2 = 1.4388e7; // nm K
                const val = C1 / (Math.pow(wl, 5) * (Math.exp(C2 / (wl * T)) - 1));
                return oy - Math.min(oy - 35, val * 85);
            };
            
            const getRJY = (wl) => {
                // Rayleigh-Jeans Law (classical T / wl^4)
                // 讓古典（Rayleigh-Jeans）曲線的發散落在 λ≈380nm，也就是可見光左緣的「紫外」側；
                // 原本 1.8e8 會讓發散出現在 839nm 的紅外區，與「紫外災難」這個名稱互相矛盾。
                const C_RJ = 7.5e6;
                const val = (C_RJ * 6000) / Math.pow(wl, 4);
                return oy - val * 85;
            };
            
            // Draw Rayleigh-Jeans curve (UV Catastrophe)
            let ptsRJ = '';
            for (let x = ox; x <= 450; x += 4) {
                const wl = getWl(x);
                const y = getRJY(wl);
                // Only plot points that fit within the y-axis range [30, oy]
                if (y >= 30 && y <= oy) {
                    ptsRJ += dgR(x) + ',' + dgR(y) + ' ';
                }
            }
            s += dgPoly(ptsRJ, DG.rose, 1.5, 'none', '4 3');
            s += dgTxt(220, 55, '古典波動預測 (紫外災難)', { fs: 10, fill: DG.rose, an: 'start' });
            
            // Draw Planck 6000 K curve
            let pts6000 = '';
            for (let x = ox; x <= 450; x += 4) {
                const wl = getWl(x);
                pts6000 += dgR(x) + ',' + dgR(getPlanckY(wl, 6000)) + ' ';
            }
            s += dgPoly(pts6000, DG.blue, 2.5);
            s += dgTxt(170, 95, '6000 K (恆星光譜)', { fs: 10.5, fill: DG.blue, b: 1 });
            
            // Draw Planck 5000 K curve
            let pts5000 = '';
            for (let x = ox; x <= 450; x += 4) {
                const wl = getWl(x);
                pts5000 += dgR(x) + ',' + dgR(getPlanckY(wl, 5000)) + ' ';
            }
            s += dgPoly(pts5000, '#fbbf24', 1.8);
            s += dgTxt(220, 138, '5000 K', { fs: 10.5, fill: '#fbbf24', b: 1 });
            
            // Draw visible light band background at bottom
            const getX = (wl) => ox + ((wl - 150) / 2050) * (450 - ox);
            const x380 = getX(380);
            const x750 = getX(750);
            s += `<rect x="${dgR(x380)}" y="${oy - 8}" width="${dgR(x750 - x380)}" height="8" fill="url(#vis-grad)" opacity="0.45"/>`;
            s += dgTxt((x380 + x750) / 2, oy + 12, '可見光', { fs: 9, fill: DG.muted, an: 'center' });
            
            // Add gradient definition
            s += `<defs>
                <linearGradient id="vis-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8b5cf6" />
                    <stop offset="25%" stop-color="#3b82f6" />
                    <stop offset="50%" stop-color="#10b981" />
                    <stop offset="75%" stop-color="#fbbf24" />
                    <stop offset="100%" stop-color="#dc2626" />
                </linearGradient>
            </defs>`;
            
            // Labels on X axis
            [500, 1000, 1500, 2000].forEach(wl => {
                const x = getX(wl);
                s += dgLine(x, oy, x, oy - 4, DG.ink, 1);
                s += dgTxt(x, oy + 12, wl, { fs: 9, fill: DG.muted, an: 'center' });
            });
            
            return dgCard('黑體輻射光譜：溫度 vs 峰值與能量分布', dgSvg(520, 255, s),
                '① <b>維恩位移定律</b>：溫度越高 ➔ 峰值波長 $\\lambda_{\\max}$ 越短（藍移：6000 K 峰值約 483 nm 藍綠光、5000 K 約 580 nm 黃橙光；要降到約 3000 K 峰值才進入近紅外）；② <b>史蒂芬—波茲曼定律</b>：總輻射能量隨 $T^4$ 暴增（曲線下面積急遽增大）；③ <b>紫外災難</b>：古典波動說預測在短波處能量密度無窮大（虛線，與實驗不符），促使普朗克提出能量量子化假設。');
        }

        function nodeDiagramsHtml(nodeId) {
            const makers = { N01: diagN01, N02: diagN02, N03: diagN03, N04: diagN04, N05: diagN05, N06: diagN06, N07: diagN07, N08: diagN08, N09: diagN09, N10: diagN10, N11: diagN11, N12: diagN12, N13: diagN13, N14: diagN14, N15: diagN15, N16: diagN16, N17: diagN17, N18: diagN18, N19: diagN19, N20: diagN20, N21: diagN21, N22: diagN22, N23: diagN23, N24: diagN24, N25: diagN25, N26: diagN26, N27: diagN27, N28: diagN28 };
            if (!makers[nodeId]) return '';
            return '<div class="handout-section-title">📐 用圖看懂它</div><div class="formulas-grid">' + makers[nodeId]() + '</div>';
        }

        function toggleQCard(card) {
            const body = card.querySelector('.q-card-body');
            const arrow = card.querySelector('span:last-child');
            const isOpening = !card.classList.contains('open');

            if (isOpening) {
                card.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';
                arrow.textContent = '收起詳解 ✖';
            } else {
                card.classList.remove('open');
                body.style.maxHeight = '0px';
                arrow.textContent = '展開詳解 ➔';
            }
        }

        // Render tool-stats View（知識節點層級統計——由 knowledgeNodes 單一資料來源導出）
        const STATS_RECENT_GROUPS = examPractice.filter(e => ['111', '112', '113', '114', '115'].includes(e.year)).length;

        function interactiveLabHtml() {
            return `
                <div class="content-header">
                    <span class="content-badge">互動探究｜即時參數模擬</span>
                    <h2 class="content-title">互動物理實驗室</h2>
                    <p class="content-subtitle">拖曳參數、觀察圖形，再用下方讀值驗證關係。所有模擬皆為本站原生製作，不需載入外部 iframe。</p>
                </div>

                <div class="lab-switcher" role="tablist" aria-label="互動實驗選擇">
                    <button class="lab-switch-btn active" data-lab="wave" onclick="switchLabPanel('wave', this)">🌊 波動現象</button>
                    <button class="lab-switch-btn" data-lab="photo" onclick="switchLabPanel('photo', this)">⚡ 光電效應</button>
                    <button class="lab-switch-btn" data-lab="blackbody" onclick="switchLabPanel('blackbody', this)">🌈 黑體輻射</button>
                    <button class="lab-switch-btn" data-lab="induction" onclick="switchLabPanel('induction', this)">🧲 電磁感應</button>
                    <button class="lab-switch-btn" data-lab="astronomy" onclick="switchLabPanel('astronomy', this)">🪐 天體運行</button>
                </div>

                <section class="lab-panel active" id="lab-wave" role="tabpanel">
                    <div class="wave-mode-tabs" aria-label="波動現象選擇">
                        <button class="wave-mode-btn active" data-mode="reflection" onclick="setWaveMode('reflection', this)">反射</button>
                        <button class="wave-mode-btn" data-mode="refraction" onclick="setWaveMode('refraction', this)">折射</button>
                        <button class="wave-mode-btn" data-mode="interference" onclick="setWaveMode('interference', this)">干涉</button>
                        <button class="wave-mode-btn" data-mode="diffraction" onclick="setWaveMode('diffraction', this)">繞射</button>
                        <button class="wave-mode-btn" data-mode="huygens" onclick="setWaveMode('huygens', this)">惠更斯原理</button>
                        <button class="wave-mode-btn" data-mode="doppler" onclick="setWaveMode('doppler', this)">都卜勒效應</button>
                    </div>
                    <div class="lab-stage-grid">
                        <div class="lab-stage"><canvas class="lab-canvas" id="wave-canvas" width="960" height="540" aria-label="波動現象動畫"></canvas></div>
                        <div class="lab-controls">
                            <h3>波動參數</h3>
                            <label class="lab-control wave-phenomenon-control"><span class="lab-control-head">波長 λ <b class="lab-value" id="wave-length-out">11.6 cm</b></span><input id="wave-length" type="range" min="28" max="105" value="58" step="1"></label>
                            <label class="lab-control"><span class="lab-control-head">動畫速率 <b class="lab-value" id="wave-speed-out">1.0×</b></span><input id="wave-speed" type="range" min="0.2" max="2.2" value="1" step="0.1"></label>
                            <button id="wave-pause-btn" class="lab-btn" type="button" aria-pressed="false" onclick="toggleWavePause()">⏸ 暫停動畫</button>
                            <label class="lab-control wave-phenomenon-control"><span class="lab-control-head">入射角 θ₁ <b class="lab-value" id="wave-angle-out">35°</b></span><input id="wave-angle" type="range" min="0" max="75" value="35" step="1"></label>
                            <label class="lab-control wave-phenomenon-control"><span class="lab-control-head">介質一折射率 n₁ <b class="lab-value" id="wave-n1-out">1.00</b></span><input id="wave-n1" type="range" min="1" max="2.2" value="1" step="0.05"></label>
                            <label class="lab-control wave-phenomenon-control"><span class="lab-control-head">介質二折射率 n₂ <b class="lab-value" id="wave-n2-out">1.50</b></span><input id="wave-n2" type="range" min="1" max="2.2" value="1.5" step="0.05"></label>
                            <label class="lab-control wave-phenomenon-control"><span class="lab-control-head">狹縫／雙源間距 <b class="lab-value" id="wave-gap-out">18.0 cm</b></span><input id="wave-gap" type="range" min="28" max="180" value="90" step="2"></label>
                            <label class="lab-control doppler-control"><span class="lab-control-head">移動情境</span><select id="doppler-case"><option value="source" selected>波源移動、左右觀察者靜止</option><option value="observer">波源靜止、左右觀察者移動</option><option value="both">一個波源與一個觀察者都移動</option></select></label>
                            <label class="lab-control doppler-control"><span class="lab-control-head">波源頻率 f₀ <b class="lab-value" id="doppler-frequency-out">500 Hz</b></span><input id="doppler-frequency" type="range" min="200" max="1000" value="500" step="10"></label>
                            <label class="lab-control doppler-control"><span class="lab-control-head" id="doppler-direction-label">波源移動方向</span><select id="doppler-direction"><option value="right" selected>向右移動</option><option value="left">向左移動</option></select></label>
                            <label class="lab-control doppler-control"><span class="lab-control-head"><span id="doppler-motion-label">波源速度</span> <b class="lab-value" id="doppler-motion-out">0.60v = 204 m/s</b></span><input id="doppler-motion" type="range" min="0" max="1.5" value="0.6" step="0.05"></label>
                            <label class="lab-control doppler-control doppler-both-control"><span class="lab-control-head">觀察者移動方向</span><select id="doppler-observer-direction"><option value="right" selected>向右移動</option><option value="left">向左移動</option></select></label>
                            <label class="lab-control doppler-control doppler-both-control"><span class="lab-control-head">觀察者速度 <b class="lab-value" id="doppler-observer-motion-out">0.30v = 102 m/s</b></span><input id="doppler-observer-motion" type="range" min="0" max="1.5" value="0.3" step="0.05"></label>
                            <div class="lab-control doppler-control"><span class="lab-control-head">空氣中聲速（固定） <b class="lab-value">v = 340 m/s</b></span></div>
                            <div class="lab-control doppler-control" style="grid-column: 1 / -1; margin-top: 0.25rem;">
                                <button type="button" class="route-link-btn" onclick="navigateTo('topic-N15')" style="width: 100%; text-align: center; padding: 0.5rem 0.75rem; background: var(--primary-blue-light); border: 1px solid rgba(59,130,246,0.3); color: var(--primary-blue); font-weight: 700; border-radius: 6px; cursor: pointer;">
                                    🎬 觀看 Manim 慢動作分解：為何波源運動會改變波長？ ➔
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="lab-model-strip" aria-live="polite">
                        <div class="lab-model-card"><span>目前關係式</span><strong id="wave-formula-readout">θᵢ = θᵣ</strong></div>
                        <div class="lab-model-card"><span>即時不變量檢核</span><strong id="wave-invariant-readout">同一介質中 f、v、λ 均不變｜誤差 0.0°</strong></div>
                    </div>
                    <div class="wave-analysis"><canvas id="wave-relation-canvas" width="960" height="240" aria-label="目前波動關係式的即時圖表"></canvas></div>
                    <div class="lab-readouts">
                        <div class="lab-readout"><span class="lab-readout-label" id="wave-mode-label">目前現象</span><strong id="wave-mode-readout">反射</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label" id="wave-angle-label">反射／折射角</span><strong id="wave-angle-readout">θᵣ = 35°</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label" id="wave-lambda2-label">介質二波長</span><strong id="wave-lambda2-readout">7.7 cm</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label" id="wave-state-label">狀態</span><strong id="wave-state-readout">反射角等於入射角</strong></div>
                    </div>
                    <div class="lab-explain" id="wave-explain">反射時波仍在同一介質中，因此頻率、波速與波長不變；相對法線量角可得 θᵢ = θᵣ。</div>
                </section>

                <section class="lab-panel" id="lab-photo" role="tabpanel">
                    <div class="lab-stage-grid">
                        <div class="lab-stage"><canvas class="lab-canvas" id="photo-canvas" width="960" height="540" aria-label="光電效應實驗動畫"></canvas></div>
                        <div class="lab-controls">
                            <h3>光電效應參數</h3>
                            <label class="lab-control"><span class="lab-control-head">入射光波長 <b class="lab-value" id="photo-wave-out">420 nm</b></span><input id="photo-wave" type="range" min="180" max="800" value="420" step="1"><span class="lab-spectrum-key"></span></label>
                            <label class="lab-control"><span class="lab-control-head">輻照度 Eₑ <b class="lab-value" id="photo-intensity-out">20.0 W/m²</b></span><input id="photo-intensity" type="range" min="0.1" max="100" value="20" step="0.1"></label>
                            <label class="lab-control"><span class="lab-control-head">金屬材料 <b class="lab-value" id="photo-work-out">2.28 eV</b></span><select id="photo-material"><option value="2.14">銫 Cs｜2.14 eV</option><option value="2.28" selected>鈉 Na｜2.28 eV</option><option value="4.31">鋅 Zn｜4.31 eV</option><option value="4.70">銅 Cu｜4.70 eV</option><option value="6.35">鉑 Pt｜6.35 eV</option></select></label>
                            <label class="lab-control"><span class="lab-control-head">外部量子效率 η <b class="lab-value" id="photo-qe-out">10.0%</b></span><input id="photo-qe" type="range" min="0.1" max="50" value="10" step="0.1"></label>
                            <label class="lab-control"><span class="lab-control-head">集電極電壓 <b class="lab-value" id="photo-voltage-out">0.00 V</b></span><span class="lab-range-number"><input id="photo-voltage" type="range" min="-5" max="5" value="0" step="0.01"><input id="photo-voltage-number" class="lab-number-input" type="number" min="-5" max="5" value="0.00" step="0.01" inputmode="decimal" aria-label="輸入集電極電壓，單位為伏特"></span></label>
                            <label class="lab-control"><span class="lab-control-head">N23 實驗結果</span><select id="photo-graph-mode"><option value="all" selected>同時顯示三項實驗結果</option><option value="voltage">光電流 vs 電池電壓</option><option value="irradiance">飽和電流 vs 輻照度</option><option value="frequency">電子最大動能 vs 光頻率</option><option value="none">隱藏圖表</option></select></label>
                        </div>
                    </div>
                    <div class="photo-analysis" id="photo-analysis"><canvas id="photo-graph-canvas" width="960" height="300" aria-label="N23 光電效應實驗結果圖表"></canvas></div>
                    <div class="lab-readouts">
                        <div class="lab-readout"><span class="lab-readout-label">單一光子能量 hf</span><strong id="photo-energy-readout">2.95 eV</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">最大動能 Kmax</span><strong id="photo-kmax-readout">0.67 eV</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">截止電壓 Vs</span><strong id="photo-stop-readout">0.67 V</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">截止波長 λ₀</span><strong id="photo-cutoff-readout">543.9 nm</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">理想飽和電流 Isat</span><strong id="photo-current-readout">0.11 μA</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">發射延遲</span><strong>無可測延遲</strong></div>
                    </div>
                    <div class="lab-explain" id="photo-explain">精確量只計算 $hf$、$K_{\\max}$、$V_s$、截止波長與飽和電流。電流—電壓曲線的過渡形狀會受電子能量／角度分布與電極幾何影響，因此只畫成正規化實驗典型曲線，不宣稱是普適函數。</div>
                </section>

                <section class="lab-panel" id="lab-blackbody" role="tabpanel">
                    <div class="lab-stage-grid">
                        <div class="lab-stage"><canvas class="lab-canvas" id="blackbody-canvas" width="960" height="540" aria-label="黑體輻射光譜圖"></canvas></div>
                        <div class="lab-controls">
                            <h3>黑體參數</h3>
                            <label class="lab-control"><span class="lab-control-head">絕對溫度 T <b class="lab-value" id="bb-temp-out">5800 K</b></span><input id="bb-temp" type="range" min="1000" max="12000" value="5800" step="100"></label>
                            <label class="lab-control"><span class="lab-control-head">光譜範圍 <b class="lab-value" id="bb-range-out">100–3000 nm</b></span><input id="bb-range" type="range" min="1200" max="5000" value="3000" step="100"></label>
                            <label class="lab-control"><span class="lab-control-head">縱軸尺度</span><select id="bb-scale"><option value="linear" selected>絕對光譜輻射亮度｜線性</option><option value="log">絕對光譜輻射亮度｜對數</option></select></label>
                            <label class="lab-check"><input id="bb-sun" type="checkbox" checked>疊加太陽表面 5778 K 曲線</label>
                            <label class="lab-check"><input id="bb-rj" type="checkbox">疊加 Rayleigh–Jeans 古典預測</label>
                            <label class="lab-check"><input id="bb-lock-scale" type="checkbox" checked>固定縱軸上限（以太陽為基準）</label>
                        </div>
                    </div>
                    <div class="lab-readouts">
                        <div class="lab-readout"><span class="lab-readout-label">峰值波長 λmax</span><strong id="bb-peak-readout">500 nm</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">峰值所在波段</span><strong id="bb-band-readout">可見光</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">總出射度 M = σT⁴</span><strong id="bb-flux-readout">64.2 MW/m²</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">相對太陽總輻射</span><strong id="bb-power-readout">1.02×</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">維恩定律</span><strong>λmaxT = 2.898×10⁶ nm·K</strong></div>
                    </div>
                    <div class="lab-explain">升高溫度會同時造成兩件事：光譜峰值向短波長移動（維恩位移定律），曲線總面積快速增加（史蒂芬—波茲曼定律，總輻射功率 $P\\propto T^4$）。</div>
                </section>

                <section class="lab-panel" id="lab-induction" role="tabpanel">
                    <div class="induction-mode-tabs" aria-label="步驟選擇">
                        <button class="induction-step-btn active" data-step="1" onclick="setInductionStep(1, this)">步驟 1：外加磁場 B<sub>ext</sub></button>
                        <button class="induction-step-btn" data-step="2" onclick="setInductionStep(2, this)">步驟 2：外加磁場變化量 ΔB<sub>ext</sub></button>
                        <button class="induction-step-btn" data-step="3" onclick="setInductionStep(3, this)">步驟 3：感應磁場與總磁場</button>
                    </div>
                    <div class="lab-stage-grid">
                        <div class="lab-stage"><canvas class="lab-canvas" id="induction-canvas" width="960" height="540" aria-label="電磁感應實驗動畫"></canvas></div>
                        <div class="lab-controls">
                            <h3>電磁感應參數</h3>
                            <label class="lab-control"><span class="lab-control-head">磁鐵至線圈距離 <b class="lab-value" id="ind-pos-out">d = 106.0 cm</b></span><input id="ind-pos" type="range" min="150" max="480" value="150" step="1"></label>
                            <label class="lab-control"><span class="lab-control-head">磁鐵極性</span><select id="ind-pole"><option value="N" selected>N 極朝右 (面向線圈)</option><option value="S">S 極朝右 (面向線圈)</option></select></label>
                            <label class="lab-control"><span class="lab-control-head">線圈圈數 N <b class="lab-value" id="ind-turns-out">3 圈</b></span><input id="ind-turns" type="range" min="1" max="5" value="3" step="1"></label>
                            <label class="lab-check"><input id="ind-auto" type="checkbox">自動來回運動 (模擬交流電)</label>
                            <button id="ind-pause-btn" class="lab-btn" onclick="toggleInductionPause()">⏸ 暫停動畫</button>
                            <h4 style="margin: 12px 0 6px 0; color: #70d2d0; font-size: 14px; font-weight: 600;">圖表與元件顯示切換</h4>
                            <label class="lab-check"><input id="ind-show-ext" type="checkbox" checked> 顯示外加磁場 B<sub>ext</sub></label>
                            <label class="lab-check"><input id="ind-show-change" type="checkbox" checked> 顯示外加磁場變化量 ΔB<sub>ext</sub></label>
                            <label class="lab-check"><input id="ind-show-ind" type="checkbox" checked> 顯示感應磁場 B<sub>ind</sub> = −ΔB<sub>ext</sub></label>
                            <label class="lab-check"><input id="ind-show-tot" type="checkbox" checked> 顯示總磁場 B<sub>total</sub></label>
                        </div>
                    </div>
                    <div class="induction-analysis" id="induction-analysis"><canvas id="induction-graph-canvas" width="960" height="360" aria-label="四種磁場的共同座標圖，以及外加磁場變化量與感應磁場的放大比較圖"></canvas></div>
                    <div class="lab-readouts">
                        <div class="lab-readout"><span class="lab-readout-label">外加磁場 B<sub>ext</sub></span><strong id="ind-flux-ext-readout">0.00</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">外加磁場變化量 ΔB<sub>ext</sub></span><strong id="ind-flux-ind-readout">0.00</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">感應磁場 B<sub>ind</sub> = −ΔB<sub>ext</sub></span><strong id="ind-flux-tot-readout">0.00</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">總磁場 B<sub>total</sub></span><strong id="ind-current-dir-readout">0.00</strong></div>
                    </div>
                    <div class="lab-explain" id="induction-explain">步驟一：磁鐵靠近或遠離會改變線圈位置的外加磁場 B<sub>ext</sub>。</div>
                </section>

                <section class="lab-panel" id="lab-astronomy" role="tabpanel">
                    <div class="lab-stage-grid">
                        <div class="lab-stage"><canvas class="lab-canvas" id="astronomy-canvas" width="960" height="540" aria-label="天體運行與行星逆行動畫"></canvas></div>
                        <div class="lab-controls">
                            <h3>天體運行參數</h3>
                            <label class="lab-control"><span class="lab-control-head">顯示模式</span>
                                <select id="astro-mode">
                                    <option value="both" selected>雙模型對照 (地心 vs 日心)</option>
                                    <option value="helio">日心說模型 (Heliocentric)</option>
                                    <option value="geo">地心說模型 (Geocentric)</option>
                                </select>
                            </label>
                            <label class="lab-control"><span class="lab-control-head">動畫速率 <b class="lab-value" id="astro-speed-out">1.0×</b></span><input id="astro-speed" type="range" min="0" max="2.5" value="1.0" step="0.1"></label>
                            <button id="astro-pause-btn" class="lab-btn" onclick="toggleAstroPause()">⏸ 暫停動畫</button>
                            <button id="astro-reset-btn" class="lab-btn" onclick="resetAstroTrace()">🔄 清除軌跡</button>
                            
                            <h4 style="margin: 12px 0 6px 0; color: #70d2d0; font-size: 14px; font-weight: 600;">顯示切換</h4>
                            <label class="lab-check"><input id="astro-show-sightline" type="checkbox" checked> 顯示視線 (Earth-Mars Line)</label>
                            <label class="lab-check"><input id="astro-show-orbits" type="checkbox" checked> 顯示軌道與軌跡</label>
                            <label class="lab-check"><input id="astro-show-sky" type="checkbox" checked> 顯示星空背景投影</label>
                            <label class="lab-check"><input id="astro-show-trace" type="checkbox" checked> 顯示行星逆行軌跡</label>
                        </div>
                    </div>
                    <div class="lab-readouts">
                        <div class="lab-readout"><span class="lab-readout-label">目前運動狀態</span><strong id="astro-state-readout" style="color: var(--teal);">順行 (Prograde)</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">地球軌道角度</span><strong id="astro-earth-angle">0.0°</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">火星軌道角度</span><strong id="astro-mars-angle">0.0°</strong></div>
                        <div class="lab-readout"><span class="lab-readout-label">兩星夾角 (對日心)</span><strong id="astro-relative-angle">0.0°</strong></div>
                    </div>
                    <div class="lab-explain" id="astro-explain">正在加載天體運行模型說明...</div>
                </section>
            `;
        }

        function initializeInteractiveLab(initialLab = 'wave', initialWaveMode = 'reflection') {
            if (window.labAnimationFrame) cancelAnimationFrame(window.labAnimationFrame);
            const reduceMotion = PhysicsRuntime.prefersReducedMotion();
            window.physicsLab = { active: initialLab, waveMode: initialWaveMode, time: 0, waveTime: 0, wavePaused: reduceMotion, paused: reduceMotion, astroPaused: reduceMotion, motionEnabled: !reduceMotion, inductionStep: 1, magnetVel: 0, lastMagnetX: 150, fixedDt: 0.035, clock: null };
            const labState = window.physicsLab;
            registerViewDisposer(() => {
                if (window.labAnimationFrame) {
                    cancelAnimationFrame(window.labAnimationFrame);
                    window.labAnimationFrame = null;
                }
                if (window.physicsLab === labState) window.physicsLab = null;
            });
            document.querySelectorAll('.lab-switch-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lab === initialLab));
            document.querySelectorAll('.lab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `lab-${initialLab}`));
            document.querySelectorAll('.wave-mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === initialWaveMode));
            updateWaveControlVisibility();
            bindLabControls();
            if (reduceMotion) {
                const waveButton = document.getElementById('wave-pause-btn');
                if (waveButton) {
                    waveButton.textContent = '▶ 播放動畫';
                    waveButton.classList.add('active');
                    waveButton.setAttribute('aria-pressed', 'true');
                }
                const inductionButton = document.getElementById('ind-pause-btn');
                if (inductionButton) {
                    inductionButton.textContent = '▶ 播放動畫';
                    inductionButton.classList.add('active');
                }
            }
            drawBlackbodyLab();
            if (initialLab === 'wave') updateWaveReadouts();
            if (initialLab === 'photo') updatePhotoReadouts();
            if (initialLab === 'induction') updateInductionReadouts();
            if (initialLab === 'astronomy') updateAstroReadouts();
            startLabAnimation();
            const main = document.getElementById('main-content');
            scheduleMathJax([main]);
        }

        function renderInteractiveLab() {
            const main = document.getElementById('main-content');
            main.innerHTML = interactiveLabHtml();
            initializeInteractiveLab('wave', 'reflection');
            window.scrollTo(0, 0);
        }

        function renderInteractiveLabForNode(nodeId) {
            const config = nodeInteractiveLabs[nodeId];
            if (!config) {
                renderInteractiveLab();
                return;
            }
            if (config.custom === 'hertz') {
                renderHertzExperimentView();
                return;
            }
            const main = document.getElementById('main-content');
            main.innerHTML = interactiveLabHtml();
            initializeInteractiveLab(config.lab, config.mode || 'reflection');
            const header = main.querySelector('.content-header');
            if (header) {
                const subtitle = header.querySelector('.content-subtitle');
                if (subtitle) subtitle.innerHTML = `從 <strong>${nodeId} ${nodeLabel(nodeId)}</strong> 進入，目前已定位到「${config.title}」。其他實驗仍可由上方分頁切換。`;
            }
        }

        function switchLabPanel(name, button) {
            if (!window.physicsLab) return;
            window.physicsLab.active = name;
            document.querySelectorAll('.lab-switch-btn').forEach(btn => btn.classList.toggle('active', btn === button));
            document.querySelectorAll('.lab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `lab-${name}`));
            if (name === 'blackbody') drawBlackbodyLab();
            if (name === 'astronomy') {
                window.physicsLab.astroTime = 0;
                window.physicsLab.astroTrace = [];
                updateAstroReadouts();
            }
            if (name === 'induction') {
                window.physicsLab.lastFluxExt = undefined;
                window.physicsLab.lastDeltaField = 0;
                window.physicsLab.lastInducedField = 0;
                window.physicsLab.lastTotalField = 0;
                window.physicsLab.inductionHistory = [];
                window.physicsLab.paused = PhysicsRuntime.prefersReducedMotion() && !window.physicsLab.motionEnabled;
                const pBtn = document.getElementById('ind-pause-btn');
                if (pBtn) {
                    pBtn.textContent = window.physicsLab.paused ? '▶ 播放動畫' : '⏸ 暫停動畫';
                    pBtn.classList.toggle('active', window.physicsLab.paused);
                }
                updateInductionReadouts();
            }
        }

        function toggleInductionPause() {
            if (!window.physicsLab) return;
            window.physicsLab.paused = !window.physicsLab.paused;
            if (!window.physicsLab.paused) window.physicsLab.motionEnabled = true;
            const btn = document.getElementById('ind-pause-btn');
            if (btn) {
                if (window.physicsLab.paused) {
                    btn.textContent = '▶ 播放動畫';
                    btn.classList.add('active');
                } else {
                    btn.textContent = '⏸ 暫停動畫';
                    btn.classList.remove('active');
                }
            }
        }

        function setWaveMode(mode, button) {
            if (!window.physicsLab) return;
            window.physicsLab.waveMode = mode;
            document.querySelectorAll('.wave-mode-btn').forEach(btn => btn.classList.toggle('active', btn === button));
            updateWaveControlVisibility();
            updateWaveReadouts();
        }

        function updateWaveControlVisibility() {
            if (!window.physicsLab) return;
            const mode = window.physicsLab.waveMode;
            const isDoppler = mode === 'doppler';
            const isBoth = isDoppler && document.getElementById('doppler-case') && document.getElementById('doppler-case').value === 'both';
            
            // Doppler controls
            document.querySelectorAll('.doppler-control').forEach(control => { control.style.display = isDoppler ? 'block' : 'none'; });
            document.querySelectorAll('.doppler-both-control').forEach(control => { control.style.display = isBoth ? 'block' : 'none'; });
            
            // Wavelength slider (always show when not doppler)
            const lengthInput = document.getElementById('wave-length');
            if (lengthInput) lengthInput.closest('.lab-control').style.display = isDoppler ? 'none' : 'block';
            
            // Incident Angle (only show for reflection and refraction)
            const angleInput = document.getElementById('wave-angle');
            if (angleInput) {
                angleInput.closest('.lab-control').style.display = (!isDoppler && (mode === 'reflection' || mode === 'refraction')) ? 'block' : 'none';
            }
            
            // n1 (only show for reflection and refraction)
            const n1Input = document.getElementById('wave-n1');
            if (n1Input) {
                n1Input.closest('.lab-control').style.display = (!isDoppler && (mode === 'reflection' || mode === 'refraction')) ? 'block' : 'none';
            }
            
            // n2 (only show for refraction)
            const n2Input = document.getElementById('wave-n2');
            if (n2Input) {
                n2Input.closest('.lab-control').style.display = (!isDoppler && mode === 'refraction') ? 'block' : 'none';
            }
            
            // Gap/slit width (only show for interference and diffraction)
            const gapInput = document.getElementById('wave-gap');
            if (gapInput) {
                gapInput.closest('.lab-control').style.display = (!isDoppler && (mode === 'interference' || mode === 'diffraction')) ? 'block' : 'none';
            }
        }

        function toggleWavePause() {
            if (!window.physicsLab) return;
            window.physicsLab.wavePaused = !window.physicsLab.wavePaused;
            if (!window.physicsLab.wavePaused) window.physicsLab.motionEnabled = true;
            const btn = document.getElementById('wave-pause-btn');
            if (!btn) return;
            btn.setAttribute('aria-pressed', String(window.physicsLab.wavePaused));
            btn.textContent = window.physicsLab.wavePaused ? '▶ 繼續動畫' : '⏸ 暫停動畫';
            btn.classList.toggle('active', window.physicsLab.wavePaused);
            drawWaveLab();
        }

        function bindLabControls() {
            const ids = ['wave-length', 'wave-speed', 'wave-angle', 'wave-n1', 'wave-n2', 'wave-gap'];
            ids.forEach(id => document.getElementById(id).addEventListener('input', updateWaveReadouts));
            ['doppler-case', 'doppler-frequency', 'doppler-direction', 'doppler-motion', 'doppler-observer-direction', 'doppler-observer-motion'].forEach(id => {
                document.getElementById(id).addEventListener('input', updateWaveReadouts);
                document.getElementById(id).addEventListener('change', updateWaveReadouts);
            });
            ['photo-wave', 'photo-intensity', 'photo-material', 'photo-qe', 'photo-graph-mode'].forEach(id => {
                document.getElementById(id).addEventListener('input', updatePhotoReadouts);
                document.getElementById(id).addEventListener('change', updatePhotoReadouts);
            });
            const voltageRange = document.getElementById('photo-voltage');
            const voltageNumber = document.getElementById('photo-voltage-number');
            const clampPhotoVoltage = value => Math.max(-5, Math.min(5, value));
            voltageRange.addEventListener('input', () => {
                voltageNumber.value = Number(voltageRange.value).toFixed(2);
                updatePhotoReadouts();
            });
            voltageRange.addEventListener('change', updatePhotoReadouts);
            voltageNumber.addEventListener('input', () => {
                if (voltageNumber.value === '' || voltageNumber.value === '-') return;
                const value = Number(voltageNumber.value);
                if (!Number.isFinite(value)) return;
                const normalized = clampPhotoVoltage(value);
                voltageRange.value = normalized.toFixed(2);
                if (normalized !== value) voltageNumber.value = normalized.toFixed(2);
                updatePhotoReadouts();
            });
            voltageNumber.addEventListener('change', () => {
                const value = Number(voltageNumber.value);
                const normalized = clampPhotoVoltage(Number.isFinite(value) ? value : 0);
                voltageNumber.value = normalized.toFixed(2);
                voltageRange.value = normalized.toFixed(2);
                updatePhotoReadouts();
            });
            ['bb-temp', 'bb-range', 'bb-scale', 'bb-sun', 'bb-rj', 'bb-lock-scale'].forEach(id => {
                document.getElementById(id).addEventListener('input', drawBlackbodyLab);
                document.getElementById(id).addEventListener('change', drawBlackbodyLab);
            });
            bindInductionControls();
            updateWaveReadouts();
            updatePhotoReadouts();
            updateInductionReadouts();
            
            // Bind astronomy controls
            ['astro-mode', 'astro-speed'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', updateAstroReadouts);
                    el.addEventListener('change', updateAstroReadouts);
                }
            });
            ['astro-show-sightline', 'astro-show-orbits', 'astro-show-sky', 'astro-show-trace'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('change', () => {
                        if (window.physicsLab && window.physicsLab.active === 'astronomy') {
                            drawAstronomyLab();
                        }
                    });
                }
            });
        }

        const LAB_LENGTH_CM_PER_RENDER_UNIT = 0.2;
        function labNumber(id) { return Number(document.getElementById(id).value); }
        function formatLabLength(renderUnits, digits = 1) {
            return `${(renderUnits * LAB_LENGTH_CM_PER_RENDER_UNIT).toFixed(digits)} cm`;
        }
        function formatLabDistance(renderUnitSeparation) {
            return `d = ${formatLabLength(Math.max(0, renderUnitSeparation))}`;
        }

        function startLabAnimation() {
            const clock = PhysicsRuntime.createFixedClock({ stepHz: 60, maxSteps: 12 });
            window.physicsLab.clock = clock;
            const loop = (frameTime) => {
                if (!window.physicsLab || !document.getElementById('wave-canvas')) return;
                const result = clock.advance(frameTime, fixedDt => {
                    if (!window.physicsLab.motionEnabled) return;
                    const dt = fixedDt * 2.1 * labNumber('wave-speed');
                    window.physicsLab.fixedDt = dt;
                    window.physicsLab.time += dt;
                    if (!window.physicsLab.wavePaused) window.physicsLab.waveTime += dt;
                    if (window.physicsLab.active === 'induction') drawInductionLab();
                    if (window.physicsLab.active === 'astronomy') drawAstronomyLab(fixedDt);
                });
                if (window.physicsLab.active === 'wave') drawWaveLab();
                if (window.physicsLab.active === 'photo' && result.steps > 0) drawPhotoLab(result.steps);
                if (window.physicsLab.active === 'induction' && result.steps === 0) drawInductionLab(true);
                if (window.physicsLab.active === 'astronomy' && result.steps === 0) drawAstronomyLab(0);
                window.labAnimationFrame = requestAnimationFrame(loop);
            };
            window.labAnimationFrame = requestAnimationFrame(loop);
        }

        const LAB_PALETTE = Object.freeze({
            ink: '#081b24',
            inkRaised: '#0d2630',
            grid: 'rgba(132, 169, 176, 0.075)',
            gridStrong: '#506c75',
            text: '#d5e2e3',
            muted: '#91a7ad',
            blue: '#78a6d1',
            teal: '#72b9b5',
            green: '#64b89f',
            amber: '#c9a463',
            rose: '#cf7f98',
            coral: '#d9878f',
            border: '#26444e'
        });

        function labTone(color) {
            const tones = {
                '#0d222e': LAB_PALETTE.ink,
                '#d9eef2': LAB_PALETTE.text,
                '#bcd0d6': LAB_PALETTE.text,
                '#9fb7c0': LAB_PALETTE.muted,
                '#94a3b8': LAB_PALETTE.muted,
                '#71d1cf': LAB_PALETTE.teal,
                '#70d2d0': LAB_PALETTE.teal,
                '#3b82f6': LAB_PALETTE.blue,
                '#60a5fa': LAB_PALETTE.blue,
                '#10b981': LAB_PALETTE.green,
                '#34d399': LAB_PALETTE.green,
                '#f59e0b': LAB_PALETTE.amber,
                '#fbbf24': LAB_PALETTE.amber,
                '#ec4899': LAB_PALETTE.rose,
                '#f472b6': LAB_PALETTE.rose,
                '#ff7f98': LAB_PALETTE.coral,
                '#ffc36b': LAB_PALETTE.amber,
                '#475569': LAB_PALETTE.gridStrong,
                '#526b76': LAB_PALETTE.muted,
                '#25404d': LAB_PALETTE.border
            };
            return tones[String(color).toLowerCase()] || color;
        }

        function prepLabCanvas(id) {
            const canvas = document.getElementById(id);
            if (!canvas) return null;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = LAB_PALETTE.ink;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const ambient = ctx.createRadialGradient(canvas.width * 0.58, canvas.height * 0.34, 20, canvas.width * 0.58, canvas.height * 0.34, canvas.width * 0.7);
            ambient.addColorStop(0, 'rgba(70, 122, 130, 0.08)');
            ambient.addColorStop(1, 'rgba(8, 27, 36, 0)');
            ctx.fillStyle = ambient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = LAB_PALETTE.grid;
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
            for (let y = 0; y <= canvas.height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
            return { canvas, ctx, w: canvas.width, h: canvas.height };
        }

        function labLine(ctx, x1, y1, x2, y2, color, width = 2, dash = []) {
            ctx.save(); ctx.strokeStyle = labTone(color); ctx.lineWidth = width; ctx.setLineDash(dash);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
        }

        function labText(ctx, text, x, y, color = '#d9eef2', size = 18, align = 'left') {
            ctx.save(); ctx.fillStyle = labTone(color); ctx.font = `600 ${size}px 'Noto Sans TC', sans-serif`; ctx.textAlign = align; ctx.fillText(text, x, y); ctx.restore();
        }

        function labRichText(ctx, parts, x, y, color = '#d9eef2', size = 18, align = 'left') {
            ctx.save();
            ctx.fillStyle = labTone(color);
            const metrics = parts.map(part => {
                const item = typeof part === 'string' ? { text: part, sub: false } : part;
                const partSize = item.sub ? size * 0.72 : size;
                ctx.font = `600 ${partSize}px 'Noto Sans TC', sans-serif`;
                return { ...item, size: partSize, width: ctx.measureText(item.text).width };
            });
            const totalWidth = metrics.reduce((sum, item) => sum + item.width, 0);
            let cursor = align === 'center' ? x - totalWidth / 2 : align === 'right' ? x - totalWidth : x;
            metrics.forEach(item => {
                ctx.font = `600 ${item.size}px 'Noto Sans TC', sans-serif`;
                ctx.textAlign = 'left';
                ctx.fillText(item.text, cursor, y + (item.sub ? size * 0.28 : 0));
                cursor += item.width;
            });
            ctx.restore();
        }


        function drawHuygensLegend(ctx, x, y) {
            ctx.save(); ctx.fillStyle = 'rgba(7,24,33,.78)'; ctx.fillRect(x - 12, y - 22, 315, 40);
            labLine(ctx, x, y, x + 25, y, '#2368d5', 3); labText(ctx, '舊波前', x + 33, y + 5, '#bcd0d6', 13);
            ctx.fillStyle = '#f7d21e'; ctx.beginPath(); ctx.arc(x + 105, y, 5, 0, Math.PI * 2); ctx.fill(); labText(ctx, '次波源', x + 117, y + 5, '#bcd0d6', 13);
            labLine(ctx, x + 190, y, x + 215, y, '#64c800', 3); labText(ctx, '新波前', x + 223, y + 5, '#bcd0d6', 13);
            ctx.restore();
        }

        function dopplerValues() {
            const scenario = document.getElementById('doppler-case').value;
            const emittedFrequency = labNumber('doppler-frequency');
            const mediumSpeed = 340;
            const speedRatio = labNumber('doppler-motion');
            const direction = document.getElementById('doppler-direction').value;
            const speedMagnitude = speedRatio * mediumSpeed;
            const globalVelocity = direction === 'right' ? speedMagnitude : -speedMagnitude;
            const observerSpeedRatio = labNumber('doppler-observer-motion');
            const observerDirection = document.getElementById('doppler-observer-direction').value;
            const observerSpeedMagnitude = observerSpeedRatio * mediumSpeed;
            const observerVelocity = observerDirection === 'right' ? observerSpeedMagnitude : -observerSpeedMagnitude;
            const emittedWavelength = mediumSpeed / emittedFrequency;
            if (scenario === 'both') {
                const wavelengthDenominator = mediumSpeed - globalVelocity;
                const shock = wavelengthDenominator <= 0;
                const observedWavelength = shock ? null : wavelengthDenominator / emittedFrequency;
                const observerWaveSpeed = mediumSpeed - observerVelocity;
                const outrunsWave = observerWaveSpeed <= 0;
                const observedFrequency = shock ? null : outrunsWave ? 0 : observerWaveSpeed / observedWavelength;
                const sourceOnlyFrequency = shock ? null : mediumSpeed / observedWavelength;
                const observerOnlyFrequency = outrunsWave ? 0 : observerWaveSpeed / emittedWavelength;
                const separationRate = observerVelocity - globalVelocity;
                const relation = separationRate < 0 ? '距離縮短' : separationRate > 0 ? '距離增加' : '距離不變';
                const both = { observedWavelength, observerWaveSpeed, observedFrequency, sourceOnlyFrequency, observerOnlyFrequency, shock, outrunsWave, relation };
                return { scenario, direction, speedRatio, emittedFrequency, mediumSpeed, speedMagnitude, globalVelocity, emittedWavelength, observerSpeedRatio, observerDirection, observerSpeedMagnitude, observerVelocity, both };
            }
            const measurementFor = side => {
                const sideSign = side === 'right' ? 1 : -1;
                if (scenario === 'source') {
                    const approachSpeed = globalVelocity * sideSign;
                    const shock = approachSpeed >= mediumSpeed;
                    const observedWavelength = shock ? null : (mediumSpeed - approachSpeed) / emittedFrequency;
                    return {
                        relation: approachSpeed > 0 ? '接近' : approachSpeed < 0 ? '遠離' : '無頻移',
                        observedWavelength,
                        observerWaveSpeed: mediumSpeed,
                        observedFrequency: shock ? null : mediumSpeed / observedWavelength,
                        shock,
                        outrunsWave: false
                    };
                }
                const approachSpeed = -globalVelocity * sideSign;
                const observerWaveSpeed = mediumSpeed + approachSpeed;
                const outrunsWave = observerWaveSpeed <= 0;
                return {
                    relation: approachSpeed > 0 ? '接近' : approachSpeed < 0 ? '遠離' : '無頻移',
                    observedWavelength: emittedWavelength,
                    observerWaveSpeed,
                    observedFrequency: outrunsWave ? 0 : observerWaveSpeed / emittedWavelength,
                    shock: false,
                    outrunsWave
                };
            };
            const left = measurementFor('left'), right = measurementFor('right');
            return { scenario, direction, speedRatio, emittedFrequency, mediumSpeed, speedMagnitude, globalVelocity, emittedWavelength, observerSpeedRatio, observerDirection, observerSpeedMagnitude, observerVelocity, left, right };
        }

        function drawDopplerBothLab(ctx, w, h, t, d) {
            const cy = 305, vScreen = 105, waveClock = t * 0.7;
            const baseLambdaPx = Math.max(48, Math.min(108, d.emittedWavelength * 125));
            const period = baseLambdaPx / vScreen, phaseAge = waveClock % period;
            const sourceScreenVelocity = d.globalVelocity / d.mediumSpeed * vScreen;
            const observerScreenVelocity = d.observerVelocity / d.mediumSpeed * vScreen;
            const travel = 300;
            const sourceDuration = Math.abs(sourceScreenVelocity) > 0 ? travel / Math.abs(sourceScreenVelocity) : Infinity;
            const observerDuration = Math.abs(observerScreenVelocity) > 0 ? travel / Math.abs(observerScreenVelocity) : Infinity;
            const sourceMoveTime = Number.isFinite(sourceDuration) ? waveClock % sourceDuration : 0;
            const observerMoveTime = Number.isFinite(observerDuration) ? waveClock % observerDuration : 0;
            const sourceStartX = d.direction === 'right' ? 140 : 440;
            const observerStartX = d.observerDirection === 'right' ? 600 : 900;
            const sourceX = sourceStartX + sourceScreenVelocity * sourceMoveTime;
            const observerX = observerStartX + observerScreenVelocity * observerMoveTime;
            const wavefronts = [];

            ctx.fillStyle = 'rgba(94,162,255,.035)'; ctx.fillRect(0, 0, w, h);
            labLine(ctx, 35, cy, w - 35, cy, 'rgba(145,167,173,.28)', 1.2, [8, 7]);
            for (let k = 0; k < 20; k++) {
                const age = phaseAge + k * period;
                if (age < 0.02) continue;
                const centerX = sourceX - sourceScreenVelocity * age;
                const radius = vScreen * age;
                if (centerX + radius < -20 || centerX - radius > w + 20) continue;
                wavefronts.push({ centerX, radius });
                ctx.save(); ctx.strokeStyle = `rgba(94,162,255,${Math.max(0.15, 0.68 - k * 0.032)})`; ctx.lineWidth = k < 3 ? 2.2 : 1.4;
                ctx.beginPath(); ctx.arc(centerX, cy, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            }

            let nearestArrival = Infinity;
            wavefronts.forEach(front => { nearestArrival = Math.min(nearestArrival, Math.abs(Math.abs(observerX - front.centerX) - front.radius)); });
            const arrivalGlow = Math.max(0, 1 - nearestArrival / 15);

            ctx.fillStyle = '#ff7f98'; ctx.beginPath(); ctx.arc(sourceX, cy, 11, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,127,152,.72)'; ctx.lineWidth = 2;
            [20, 30].forEach(r => { ctx.beginPath(); ctx.arc(sourceX, cy, r, -0.65, 0.65); ctx.stroke(); });
            labText(ctx, '移動波源 S', sourceX, cy + 52, '#ff7f98', 15, 'center');

            ctx.save();
            if (arrivalGlow > 0) { ctx.fillStyle = `rgba(247,210,30,${arrivalGlow * .22})`; ctx.beginPath(); ctx.arc(observerX, cy, 34 + arrivalGlow * 12, 0, Math.PI * 2); ctx.fill(); }
            ctx.strokeStyle = '#ffc36b'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(observerX, cy - 20, 9, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(observerX, cy - 11); ctx.lineTo(observerX, cy + 18); ctx.moveTo(observerX, cy); ctx.lineTo(observerX - 16, cy + 7); ctx.moveTo(observerX, cy); ctx.lineTo(observerX + 16, cy + 7); ctx.moveTo(observerX, cy + 18); ctx.lineTo(observerX - 13, cy + 38); ctx.moveTo(observerX, cy + 18); ctx.lineTo(observerX + 13, cy + 38); ctx.stroke(); ctx.restore();
            labText(ctx, arrivalGlow > .3 ? '觀察者 O｜接收到波峰' : '移動觀察者 O', observerX, cy + 64, '#ffc36b', 14, 'center');

            const drawArrow = (x, velocity, color) => {
                if (Math.abs(velocity) < 1e-9) { labText(ctx, '靜止', x, cy - 70, '#bcd0d6', 13, 'center'); return; }
                const direction = Math.sign(velocity), end = x + direction * 72;
                labLine(ctx, x, cy - 68, end, cy - 68, color, 3);
                labLine(ctx, end, cy - 68, end - direction * 11, cy - 75, color, 3); labLine(ctx, end, cy - 68, end - direction * 11, cy - 61, color, 3);
            };
            drawArrow(sourceX, d.globalVelocity, '#ff7f98'); drawArrow(observerX, d.observerVelocity, '#ffc36b');

            if (d.speedRatio >= 1) {
                const moveDirection = Math.sign(d.globalVelocity) || 1;
                if (d.speedRatio > 1) {
                    const mu = Math.asin(1 / d.speedRatio), length = 230;
                    const dx = -moveDirection * length * Math.cos(mu), dy = length * Math.sin(mu);
                    labLine(ctx, sourceX, cy, sourceX + dx, cy - dy, '#ff7f98', 2.6); labLine(ctx, sourceX, cy, sourceX + dx, cy + dy, '#ff7f98', 2.6);
                } else labLine(ctx, sourceX, 205, sourceX, h - 58, '#ff7f98', 2.8);
            }

            const b = d.both;
            const fmt = value => value === null ? '無穩態值' : `${value.toFixed(1)} Hz`;
            ctx.fillStyle = 'rgba(7,24,33,.8)'; ctx.fillRect(22, 84, 390, 112); ctx.fillRect(w - 412, 84, 390, 112);
            labText(ctx, '相同參數下的視頻率比較', 38, 108, '#bcd0d6', 15);
            labText(ctx, `只有波源移動：${fmt(b.sourceOnlyFrequency)}`, 38, 134, '#ff7f98', 14);
            labText(ctx, `只有觀察者移動：${fmt(b.observerOnlyFrequency)}`, 38, 159, '#ffc36b', 14);
            labText(ctx, `兩者同時移動：${fmt(b.observedFrequency)}`, 38, 184, '#71d1cf', 14);
            labText(ctx, `實際接收量｜${b.relation}`, w - 396, 108, '#bcd0d6', 15);
            labText(ctx, `視波長 λ′：${b.observedWavelength === null ? '—（震波）' : `${b.observedWavelength.toFixed(3)} m`}`, w - 396, 134, '#71d1cf', 14);
            labText(ctx, `波峰相對速度 v′：${b.observerWaveSpeed.toFixed(0)} m/s`, w - 396, 159, '#bcd0d6', 14);
            labText(ctx, `視頻率 f′：${fmt(b.observedFrequency)}`, w - 396, 184, '#71d1cf', 14);

            labText(ctx, '情境 C｜一個波源與一個觀察者同時移動', w / 2, 38, '#bcd0d6', 18, 'center');
            labText(ctx, `S：向${d.direction === 'right' ? '右' : '左'} ${d.speedRatio.toFixed(2)}v　　O：向${d.observerDirection === 'right' ? '右' : '左'} ${d.observerSpeedRatio.toFixed(2)}v`, w / 2, 66, '#9fb7c0', 14, 'center');
            labText(ctx, `右行聲波：f′ = f₀ (v − vₒ) / (v − vₛ)　｜　空氣聲速固定 ${d.mediumSpeed} m/s`, w / 2, h - 22, '#bcd0d6', 15, 'center');
        }

        function drawDopplerLab(ctx, w, h, t) {
            const d = dopplerValues();
            if (d.scenario === 'both') { drawDopplerBothLab(ctx, w, h, t, d); return; }
            const cy = 285, vScreen = 105;
            const baseLambdaPx = Math.max(48, Math.min(108, d.emittedWavelength * 125));
            const period = baseLambdaPx / vScreen;
            const waveClock = t * 0.7;
            const phaseAge = waveClock % period;
            const movingScreenSpeed = d.speedRatio * vScreen;
            const moveDirection = d.direction === 'right' ? 1 : -1;
            const signedSourceScreenSpeed = moveDirection * movingScreenSpeed;
            const sourceTravel = 580;
            const sourceMoveDuration = movingScreenSpeed > 0 ? sourceTravel / movingScreenSpeed : Infinity;
            const sourceMoveTime = Number.isFinite(sourceMoveDuration) ? waveClock % sourceMoveDuration : 0;
            const sourceStartX = d.direction === 'right' ? 190 : 770;
            const sourceX = d.scenario === 'source' ? sourceStartX + signedSourceScreenSpeed * sourceMoveTime : 480;
            const observerTravel = 340;
            const observerMoveDuration = movingScreenSpeed > 0 ? observerTravel / movingScreenSpeed : Infinity;
            const observerMoveTime = Number.isFinite(observerMoveDuration) ? waveClock % observerMoveDuration : 0;
            let leftObserverX = 70, rightObserverX = 890;
            if (d.scenario === 'observer' && movingScreenSpeed > 0) {
                if (d.direction === 'right') {
                    leftObserverX = 70 + movingScreenSpeed * observerMoveTime;
                    rightObserverX = 550 + movingScreenSpeed * observerMoveTime;
                } else {
                    leftObserverX = 410 - movingScreenSpeed * observerMoveTime;
                    rightObserverX = 890 - movingScreenSpeed * observerMoveTime;
                }
            }
            const wavefronts = [];

            ctx.fillStyle = 'rgba(94,162,255,.035)'; ctx.fillRect(0, 0, w, h);
            labLine(ctx, 35, cy, w - 35, cy, 'rgba(145,167,173,.28)', 1.2, [8, 7]);

            for (let k = 0; k < 18; k++) {
                const age = phaseAge + k * period;
                if (age < 0.02) continue;
                const centerX = d.scenario === 'source' ? sourceX - signedSourceScreenSpeed * age : sourceX;
                const radius = vScreen * age;
                if (centerX + radius < -20 || centerX - radius > w + 20) continue;
                wavefronts.push({ centerX, radius });
                const alpha = Math.max(0.16, 0.68 - k * 0.035);
                ctx.save(); ctx.strokeStyle = `rgba(94,162,255,${alpha})`; ctx.lineWidth = k < 3 ? 2.2 : 1.45;
                ctx.beginPath(); ctx.arc(centerX, cy, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            }

            const arrivalGlowAt = observerX => {
                let nearestArrival = Infinity;
                wavefronts.forEach(front => {
                    nearestArrival = Math.min(nearestArrival, Math.abs(Math.abs(observerX - front.centerX) - front.radius));
                });
                return Math.max(0, 1 - nearestArrival / 15);
            };
            const leftGlow = arrivalGlowAt(leftObserverX), rightGlow = arrivalGlowAt(rightObserverX);

            // 波源
            ctx.save();
            ctx.fillStyle = '#ff7f98'; ctx.beginPath(); ctx.arc(sourceX, cy, 11, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,127,152,.72)'; ctx.lineWidth = 2;
            [20, 30].forEach(r => { ctx.beginPath(); ctx.arc(sourceX, cy, r, -0.65, 0.65); ctx.stroke(); });
            ctx.restore();
            labText(ctx, '波源 S', sourceX, cy + 52, '#ff7f98', 16, 'center');
            labText(ctx, `f₀ = ${d.emittedFrequency.toFixed(0)} Hz`, sourceX, cy + 73, '#bcd0d6', 14, 'center');

            if (d.scenario === 'source' && d.speedRatio >= 1) {
                if (d.speedRatio > 1) {
                    const machAngle = Math.asin(1 / d.speedRatio);
                    const coneLength = 255;
                    const coneDx = -moveDirection * coneLength * Math.cos(machAngle);
                    const coneDy = coneLength * Math.sin(machAngle);
                    labLine(ctx, sourceX, cy, sourceX + coneDx, cy - coneDy, '#ff7f98', 2.8);
                    labLine(ctx, sourceX, cy, sourceX + coneDx, cy + coneDy, '#ff7f98', 2.8);
                    labText(ctx, `馬赫錐 μ = ${(machAngle * 180 / Math.PI).toFixed(1)}°`, sourceX - moveDirection * 92, cy - 105, '#ff7f98', 14, 'center');
                } else {
                    labLine(ctx, sourceX, 95, sourceX, h - 82, '#ff7f98', 3);
                    labText(ctx, '音速臨界：波前在波源位置堆疊', sourceX, 82, '#ff7f98', 14, 'center');
                }
            }

            const drawObserver = (x, side, measurement, glow) => {
                ctx.save();
                if (glow > 0) {
                    ctx.fillStyle = `rgba(247,210,30,${glow * 0.22})`;
                    ctx.beginPath(); ctx.arc(x, cy, 34 + glow * 12, 0, Math.PI * 2); ctx.fill();
                }
                ctx.strokeStyle = '#ffc36b'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(x, cy - 20, 9, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x, cy - 11); ctx.lineTo(x, cy + 18); ctx.moveTo(x, cy); ctx.lineTo(x - 16, cy + 7); ctx.moveTo(x, cy); ctx.lineTo(x + 16, cy + 7); ctx.moveTo(x, cy + 18); ctx.lineTo(x - 13, cy + 38); ctx.moveTo(x, cy + 18); ctx.lineTo(x + 13, cy + 38); ctx.stroke();
                ctx.restore();
                labText(ctx, glow > 0.3 ? `O${side} 接收到波峰` : `觀察者 O${side}`, x, cy + 68, '#ffc36b', 14, 'center');
                labText(ctx, measurement.relation, x, cy + 89, measurement.relation === '接近' ? '#71d1cf' : measurement.relation === '遠離' ? '#ff7f98' : '#bcd0d6', 14, 'center');
            };
            drawObserver(leftObserverX, 'L', d.left, leftGlow);
            drawObserver(rightObserverX, 'R', d.right, rightGlow);

            const drawMotionArrow = x => {
                if (movingScreenSpeed <= 0) { labText(ctx, '靜止', x, cy - 72, '#bcd0d6', 14, 'center'); return; }
                const arrowEnd = x + moveDirection * 74;
                labLine(ctx, x, cy - 70, arrowEnd, cy - 70, '#ff7f98', 3);
                labLine(ctx, arrowEnd, cy - 70, arrowEnd - moveDirection * 11, cy - 77, '#ff7f98', 3);
                labLine(ctx, arrowEnd, cy - 70, arrowEnd - moveDirection * 11, cy - 63, '#ff7f98', 3);
            };
            if (d.scenario === 'source') drawMotionArrow(sourceX);
            else { drawMotionArrow(leftObserverX); drawMotionArrow(rightObserverX); }

            const formatFrequency = m => m.observedFrequency === null ? '震波／無穩態值' : m.outrunsWave ? '0 Hz（追不上）' : `${m.observedFrequency.toFixed(1)} Hz`;
            const formatLambda = m => m.observedWavelength === null ? '—（震波）' : `${m.observedWavelength.toFixed(3)} m`;
            const drawComparison = (x, side, m) => {
                ctx.save(); ctx.fillStyle = 'rgba(7,24,33,.78)'; ctx.fillRect(x, 112, 245, 100); ctx.restore();
                labText(ctx, `${side === 'L' ? '左側' : '右側'} O${side}｜${m.relation}`, x + 12, 135, '#bcd0d6', 15);
                labText(ctx, `視波長 λ′：${formatLambda(m)}`, x + 12, 158, '#71d1cf', 13);
                labText(ctx, `視波速 v′：${m.observerWaveSpeed.toFixed(0)} m/s`, x + 12, 181, '#bcd0d6', 13);
                labText(ctx, `視頻率 f′：${formatFrequency(m)}`, x + 12, 204, m.relation === '接近' ? '#71d1cf' : '#ff7f98', 13);
            };
            drawComparison(18, 'L', d.left);
            drawComparison(w - 263, 'R', d.right);

            const drawWavelengthBracket = (side, m) => {
                if (m.observedWavelength === null) return;
                const px = Math.min(165, baseLambdaPx * m.observedWavelength / d.emittedWavelength);
                const x1 = side === 'L' ? 78 : w - 78 - px, x2 = x1 + px;
                labLine(ctx, x1, 475, x2, 475, '#71d1cf', 2.2);
                labLine(ctx, x1, 467, x1, 483, '#71d1cf', 2.2); labLine(ctx, x2, 467, x2, 483, '#71d1cf', 2.2);
                labText(ctx, `λ′ ${m.observedWavelength.toFixed(3)} m`, (x1 + x2) / 2, 503, '#71d1cf', 13, 'center');
            };
            drawWavelengthBracket('L', d.left); drawWavelengthBracket('R', d.right);

            labText(ctx, d.scenario === 'source' ? '情境 A｜波源移動；左右觀察者同時比較' : '情境 B｜兩側觀察者同向移動；一側接近、一側遠離', w / 2, 38, '#bcd0d6', 18, 'center');
            labText(ctx, `移動方向：向${d.direction === 'right' ? '右' : '左'}　速度 ${d.speedRatio.toFixed(2)}v　｜　空氣聲速固定 ${d.mediumSpeed} m/s`, w / 2, 68, '#9fb7c0', 14, 'center');
        }

        function drawWaveLab() {
            const setup = prepLabCanvas('wave-canvas');
            if (!setup) return;
            const { ctx, w, h } = setup;
            const mode = window.physicsLab.waveMode;
            const lambda = labNumber('wave-length');
            const angle = labNumber('wave-angle') * Math.PI / 180;
            const n1 = labNumber('wave-n1'), n2 = labNumber('wave-n2');
            const gap = labNumber('wave-gap'), t = window.physicsLab.waveTime ?? window.physicsLab.time;
            const cyan = '#71d1cf', blue = '#5ea2ff', amber = '#ffc36b', rose = '#ff7f98';

            if (mode === 'doppler') {
                drawDopplerLab(ctx, w, h, t);
            } else if (mode === 'reflection' || mode === 'refraction') {
                const by = 280, xMin = 315, span = 330, xMax = xMin + span;
                const v1 = 155 / n1, v2 = 155 / n2;
                const hitLast = span * Math.sin(angle) / v1;
                const startTime = -190 / v1;
                const isTotalReflection = mode === 'refraction' && Math.abs(n1 / n2 * Math.sin(angle)) > 1;
                const outgoingSpeed = mode === 'reflection' || isTotalReflection ? v1 : v2;
                const endTime = hitLast + 190 / outgoingSpeed;
                const progress = (t * 0.08) % 1;
                const constructionTime = startTime + progress * (endTime - startTime);
                ctx.fillStyle = 'rgba(94, 162, 255, 0.06)'; ctx.fillRect(0, 0, w, by);
                ctx.fillStyle = 'rgba(113, 209, 207, 0.045)'; ctx.fillRect(0, by, w, h - by);
                labLine(ctx, 0, by, w, by, '#b8d2d9', 3);
                labLine(ctx, xMin, 35, xMin, h - 35, 'rgba(190,220,226,.32)', 1, [8, 7]);

                // 入射波本身也逐代依惠更斯原理形成：舊波前上的次波包絡成下一個波前。
                ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, by - 2); ctx.clip();
                const incidentDistance = v1 * constructionTime;
                const oldIncidentDistance = Math.floor(incidentDistance / lambda) * lambda;
                const incidentWaveletR = incidentDistance - oldIncidentDistance;
                const yIncident = (u, distance) => by + (distance - Math.sin(angle) * u) / Math.max(0.001, Math.cos(angle));
                const drawIncidentFront = (distance, color, width, dash = []) => {
                    const uLeft = -xMin - 180, uRight = w - xMin + 180;
                    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
                    ctx.beginPath();
                    ctx.moveTo(xMin + uLeft, yIncident(uLeft, distance));
                    ctx.lineTo(xMin + uRight, yIncident(uRight, distance));
                    ctx.stroke(); ctx.restore();
                };

                // 上、下介質共用同一個波前編號 k 與相位 incidentDistance − kλ，確保介面交點完全一致。
                for (let k = 6; k >= 0; k--) {
                    const phase = incidentDistance - k * lambda;
                    drawIncidentFront(phase, k === 0 ? '#2368d5' : 'rgba(94,162,255,.48)', k === 0 ? 3.2 : 2.1);
                }

                // 只在尚未碰到介面時顯示「前一時刻波前 → 次波 → 當前波前」的惠更斯建構；
                // 接觸介面後改由上面的實際相位波列與下方對應波列相接，避免混用兩套相位。
                if (constructionTime < 0) {
                    const propagationAngle = Math.PI / 2 - angle;
                    drawIncidentFront(oldIncidentDistance, 'rgba(113,209,207,.55)', 1.6, [7, 5]);
                    ctx.save(); ctx.strokeStyle = 'rgba(113,209,207,.72)'; ctx.lineWidth = 1.45;
                    for (let u = -130; u <= span + 130; u += 48) {
                        const sx = xMin + u, sy = yIncident(u, oldIncidentDistance);
                        if (sx < 18 || sx > w - 18 || sy < 48 || sy > by - 8) continue;
                        ctx.fillStyle = amber; ctx.beginPath(); ctx.arc(sx, sy, 4.2, 0, Math.PI * 2); ctx.fill();
                        if (incidentWaveletR > 1) {
                            ctx.beginPath();
                            ctx.arc(sx, sy, incidentWaveletR, propagationAngle - Math.PI / 2, propagationAngle + Math.PI / 2);
                            ctx.stroke();
                        }
                    }
                    ctx.restore();
                }
                ctx.restore();

                const sourceCount = 12;
                const sources = Array.from({ length: sourceCount }, (_, i) => {
                    const u = span * i / (sourceCount - 1);
                    return { x: xMin + u, y: by, u, hitTime: u * Math.sin(angle) / v1 };
                });
                const firstHit = sources.find(source => constructionTime >= source.hitTime);
                const constructionFade = constructionTime <= hitLast
                    ? 1
                    : Math.max(0, 1 - (constructionTime - hitLast) / (75 / outgoingSpeed));
                const drawSources = () => sources.forEach(source => {
                    if (constructionTime < source.hitTime || constructionFade <= 0) return;
                    const age = constructionTime - source.hitTime;
                    const sourceAlpha = Math.max(0.28, 1 - age / Math.max(0.01, hitLast + 0.35));
                    ctx.fillStyle = `rgba(247,210,30,${sourceAlpha * constructionFade})`;
                    ctx.beginPath(); ctx.arc(source.x, source.y, 5.5, 0, Math.PI * 2); ctx.fill();
                });

                const activeU = Math.max(0, Math.min(span, Math.sin(angle) > 0.001 ? v1 * constructionTime / Math.sin(angle) : (constructionTime >= 0 ? span : 0)));
                const tangentEndU = Math.max(0, activeU);
                const interfacePhaseSpan = Math.sin(angle) * span;
                const uViewLeft = -xMin - 180, uViewRight = w - xMin + 180;
                const drawReflectedWaveTrain = color => {
                    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, by - 2); ctx.clip();
                    for (let k = 0; k < 7; k++) {
                        const phase = incidentDistance - k * lambda;
                        if (phase <= 0) continue;
                        const contactU = Math.sin(angle) > 0.001 ? Math.min(span, phase / Math.sin(angle)) : span;
                        const yOf = u => by + (Math.sin(angle) * u - phase) / Math.max(0.001, Math.cos(angle));
                        const fullyFormed = phase >= interfacePhaseSpan;
                        const u1 = fullyFormed ? uViewLeft : 0, u2 = fullyFormed ? uViewRight : contactU;
                        labLine(ctx, xMin + u1, yOf(u1), xMin + u2, yOf(u2), color, k === 0 ? 3.8 : 2.7);
                    }
                    ctx.restore();
                };
                const drawRefractedWaveTrain = (theta2, color) => {
                    ctx.save(); ctx.beginPath(); ctx.rect(0, by + 2, w, h - by - 2); ctx.clip();
                    for (let k = 0; k < 7; k++) {
                        const incidentPhase = incidentDistance - k * lambda;
                        if (incidentPhase <= 0) continue;
                        const contactU = Math.sin(angle) > 0.001 ? Math.min(span, incidentPhase / Math.sin(angle)) : span;
                        const refractedPhase = v2 / v1 * incidentPhase;
                        const yOf = u => by + (refractedPhase - Math.sin(theta2) * u) / Math.max(0.001, Math.cos(theta2));
                        const fullyFormed = incidentPhase >= interfacePhaseSpan;
                        const u1 = fullyFormed ? uViewLeft : 0, u2 = fullyFormed ? uViewRight : contactU;
                        labLine(ctx, xMin + u1, yOf(u1), xMin + u2, yOf(u2), color, k === 0 ? 3.8 : 2.7);
                    }
                    ctx.restore();
                };

                if (mode === 'reflection') {
                    sources.forEach(source => {
                        const radius = v1 * (constructionTime - source.hitTime);
                        if (radius <= 0 || constructionFade <= 0) return;
                        ctx.save(); ctx.globalAlpha = constructionFade; ctx.strokeStyle = 'rgba(236,245,245,.7)'; ctx.lineWidth = 1.8;
                        ctx.beginPath(); ctx.arc(source.x, by, radius, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
                    });
                    drawSources();
                    drawReflectedWaveTrain('#64c800');
                    if (firstHit) {
                        const rayX = xMin + span * 0.48;
                        ctx.save(); ctx.globalAlpha = 0.25 + 0.55 * tangentEndU / span;
                        labLine(ctx, rayX - Math.sin(angle) * 185, by - Math.cos(angle) * 185, rayX, by, 'rgba(215,229,232,.7)', 2, [7, 6]);
                        labLine(ctx, rayX, by, rayX + Math.sin(angle) * 185, by - Math.cos(angle) * 185, 'rgba(215,229,232,.7)', 2, [7, 6]);
                        labText(ctx, `θᵢ = θᵣ = ${Math.round(angle * 180 / Math.PI)}°`, rayX + 18, by - 54, amber, 17);
                        ctx.restore();
                    }
                    labText(ctx, '同一編號的入射與反射波前在介面同一點相接，再向上傳播', 25, h - 24, '#bcd0d6', 15);
                } else {
                    const sin2 = n1 / n2 * Math.sin(angle);
                    if (Math.abs(sin2) > 1) {
                        sources.forEach(source => {
                            const radius = v1 * (constructionTime - source.hitTime);
                            if (radius <= 0 || constructionFade <= 0) return;
                            ctx.save(); ctx.globalAlpha = constructionFade; ctx.strokeStyle = 'rgba(236,245,245,.7)'; ctx.lineWidth = 1.8;
                            ctx.beginPath(); ctx.arc(source.x, by, radius, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
                        });
                        drawSources();
                        drawReflectedWaveTrain(rose);
                        labText(ctx, 'Snell 方程無實數折射角：改以反射次波形成全反射', 25, h - 24, rose, 16);
                    } else {
                        const theta2 = Math.asin(sin2);
                        sources.forEach(source => {
                            const radius = v2 * (constructionTime - source.hitTime);
                            if (radius <= 0 || constructionFade <= 0) return;
                            ctx.save(); ctx.globalAlpha = constructionFade; ctx.strokeStyle = 'rgba(236,245,245,.72)'; ctx.lineWidth = 1.8;
                            ctx.beginPath(); ctx.arc(source.x, by, radius, 0, Math.PI); ctx.stroke(); ctx.restore();
                        });
                        drawSources();
                        drawRefractedWaveTrain(theta2, '#64c800');
                        if (firstHit) {
                            const rayX = xMin + span * 0.48;
                            ctx.save(); ctx.globalAlpha = 0.25 + 0.55 * tangentEndU / span;
                            labLine(ctx, rayX - Math.sin(angle) * 185, by - Math.cos(angle) * 185, rayX, by, 'rgba(215,229,232,.7)', 2, [7, 6]);
                            labLine(ctx, rayX, by, rayX + Math.sin(theta2) * 185, by + Math.cos(theta2) * 185, 'rgba(215,229,232,.7)', 2, [7, 6]);
                            labText(ctx, `θ₁ ${Math.round(angle * 180 / Math.PI)}°`, rayX - 18, by - 48, blue, 16, 'right');
                            labText(ctx, `θ₂ ${(theta2 * 180 / Math.PI).toFixed(1)}°`, rayX + 18, by + 56, cyan, 16);
                            ctx.restore();
                        }
                        labText(ctx, '同一編號的上下波前在介面同一點相接；下方間距依 λ₂ = λ₁v₂/v₁ 改變', 25, h - 24, '#bcd0d6', 15);
                    }
                    labText(ctx, `介質一  n₁=${n1.toFixed(2)}`, 25, 42, blue, 16);
                    labText(ctx, `介質二  n₂=${n2.toFixed(2)}`, 25, by + 38, cyan, 16);
                }
                const stageText = constructionTime < 0
                    ? '① 上方舊波前產生次波，包絡成下一代入射波前'
                    : constructionTime <= hitLast
                        ? '② 入射波前掃過介面，接觸點依序成為新的次波源'
                        : `③ 每條入射波前都形成對應的${mode === 'reflection' ? '反射' : isTotalReflection ? '全反射' : '折射'}波前，並繼續傳播`;
                labText(ctx, stageText, 25, 74, '#bcd0d6', 15);
                drawHuygensLegend(ctx, 625, 35);
            } else if (mode === 'interference') {
                const s1 = { x: 210, y: h / 2 - gap / 2 }, s2 = { x: 210, y: h / 2 + gap / 2 };
                const cell = 6;
                for (let y = 0; y < h; y += cell) {
                    for (let x = 0; x < w; x += cell) {
                        const r1 = Math.hypot(x - s1.x, y - s1.y), r2 = Math.hypot(x - s2.x, y - s2.y);
                        const intensity = Math.pow(Math.cos(Math.PI * (r1 - r2) / lambda), 2);
                        ctx.fillStyle = `rgba(73, ${150 + Math.round(65 * intensity)}, 220, ${0.04 + intensity * 0.34})`;
                        ctx.fillRect(x, y, cell, cell);
                    }
                }
                ctx.save(); ctx.strokeStyle = 'rgba(219, 244, 247, 0.3)'; ctx.lineWidth = 1.5;
                [s1, s2].forEach(s => {
                    const maxR = Math.hypot(w - s.x, h);
                    for (let r = (t * lambda * 1.2) % lambda; r < maxR; r += lambda) {
                        ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
                    }
                });
                ctx.restore();
                [s1, s2].forEach((s, i) => { ctx.fillStyle = i ? rose : cyan; ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI * 2); ctx.fill(); });
                labText(ctx, '兩個黃色次波源持續產生圓形波前', 26, 38, cyan, 17);
                labText(ctx, '波峰遇波峰形成亮紋；波峰遇波谷形成暗紋', 26, 64, '#9fb7c0', 15);
                ctx.fillStyle = '#f7d21e'; [s1, s2].forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, Math.PI * 2); ctx.fill(); });
            } else if (mode === 'diffraction') {
                const bx = 470, gy1 = h / 2 - gap / 2, gy2 = h / 2 + gap / 2;
                const sourceCount = Math.max(9, Math.min(25, Math.round(gap / 8)));
                const slitSources = Array.from({ length: sourceCount }, (_, i) => ({
                    x: bx,
                    y: gy1 + (i + 0.5) * gap / sourceCount
                }));

                // 孔徑後方亮度：把狹縫內所有惠更斯次波以複數振幅相加。
                const cell = 9, waveNumber = 2 * Math.PI / lambda;
                for (let y = 0; y < h; y += cell) {
                    for (let x = bx + 8; x < w - 35; x += cell) {
                        let re = 0, im = 0;
                        slitSources.forEach(source => {
                            const r = Math.hypot(x - source.x, y - source.y);
                            const weight = 1 / Math.sqrt(Math.max(1, r));
                            re += Math.cos(waveNumber * r) * weight;
                            im += Math.sin(waveNumber * r) * weight;
                        });
                        const intensity = Math.min(1, (re * re + im * im) * (x - bx) / (sourceCount * 2.4));
                        ctx.fillStyle = `rgba(72, 205, 193, ${0.02 + 0.42 * intensity})`;
                        ctx.fillRect(x, y, cell, cell);
                    }
                }

                ctx.strokeStyle = '#d4e5e8'; ctx.lineWidth = 13;
                ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, gy1); ctx.moveTo(bx, gy2); ctx.lineTo(bx, h); ctx.stroke();
                for (let x = (t * lambda * 1.2) % lambda; x < bx; x += lambda) labLine(ctx, x, 25, x, h - 25, blue, 2);
                const waveletRadius = (t * lambda * 1.2) % (lambda * 3);
                ctx.save(); ctx.strokeStyle = 'rgba(236,245,245,.34)'; ctx.lineWidth = 1.2;
                slitSources.forEach(source => {
                    ctx.fillStyle = '#f7d21e'; ctx.beginPath(); ctx.arc(source.x, source.y, 3.5, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(source.x, source.y, waveletRadius, -Math.PI / 2, Math.PI / 2); ctx.stroke();
                });
                ctx.restore();

                // 遠場單縫強度 I ∝ (sinβ/β)²；第一暗紋滿足 a sinθ = λ。
                const screenX = w - 27;
                labLine(ctx, screenX, 20, screenX, h - 20, '#b8d2d9', 2);
                for (let y = 20; y < h - 20; y += 3) {
                    const theta = Math.atan2(y - h / 2, screenX - bx);
                    const beta = Math.PI * gap * Math.sin(theta) / lambda;
                    const sinc = Math.abs(beta) < 1e-6 ? 1 : Math.sin(beta) / beta;
                    const intensity = sinc * sinc;
                    ctx.fillStyle = `rgba(100,200,0,${0.08 + 0.92 * intensity})`;
                    ctx.fillRect(screenX - 18 * intensity, y, 18 * intensity, 3);
                }
                labText(ctx, `狹縫寬 a = ${gap}px`, bx + 18, gy1 - 16, amber, 17);
                labText(ctx, gap > lambda ? `第一暗紋：a sinθ = λ，θ = ${(Math.asin(lambda / gap) * 180 / Math.PI).toFixed(1)}°` : 'a ≤ λ：前方沒有第一暗紋，波向廣角展開', 24, 42, gap <= lambda ? cyan : amber, 17);
                labText(ctx, '白色次波等速擴張；青色亮暗由狹縫內所有次波的相位和得到', bx + 18, h - 24, '#bcd0d6', 15);
            } else {
                const stepDistance = Math.max(52, Math.min(90, lambda));
                const stepDuration = 3.2;
                const left = 145, right = w - 145;
                const stepCount = Math.max(2, Math.floor((right - left) / stepDistance));
                const cycleTime = stepCount * stepDuration;
                const cyclePosition = ((t % cycleTime) + cycleTime) % cycleTime;
                const generation = Math.floor(cyclePosition / stepDuration);
                const phase = (cyclePosition % stepDuration) / stepDuration;
                const growth = Math.min(1, phase / 0.76);
                const settle = Math.max(0, (phase - 0.76) / 0.24);
                const frontX = left + generation * stepDistance;
                const waveletR = stepDistance * growth;
                const newFrontX = frontX + waveletR;

                // 每一輪只有當下的舊波前、由它產生的次波，以及正在形成的新波前。
                ctx.save(); ctx.globalAlpha = 1 - settle;
                labLine(ctx, frontX, 55, frontX, h - 55, blue, 4);
                ctx.strokeStyle = cyan; ctx.lineWidth = 1.5;
                for (let y = 70; y <= h - 70; y += 55) {
                    ctx.fillStyle = amber; ctx.beginPath(); ctx.arc(frontX, y, 5, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(frontX, y, waveletR, -Math.PI / 2, Math.PI / 2); ctx.stroke();
                }
                ctx.restore();
                if (growth > 0.08) {
                    labLine(ctx, newFrontX, 55, newFrontX, h - 55, '#64c800', 3.5, settle > 0.35 ? [] : [8, 5]);
                    labText(ctx, settle > 0.35 ? '形成新波前' : '次波共同包絡', newFrontX + 12, 79, '#bcd0d6', 15);
                }
                labText(ctx, `第 ${generation + 1} 輪：${phase < 0.76 ? '次波向前展開' : '新波前形成，下一輪將成為次波源'}`, 25, 38, '#bcd0d6', 16);
                labText(ctx, `r = vΔt = ${formatLabLength(waveletR)}`, 25, 66, cyan, 15);
                labLine(ctx, 110, h - 30, 225, h - 30, 'rgba(188,208,214,.7)', 2);
                labLine(ctx, 225, h - 30, 213, h - 37, 'rgba(188,208,214,.7)', 2);
                labLine(ctx, 225, h - 30, 213, h - 23, 'rgba(188,208,214,.7)', 2);
                labText(ctx, '傳播方向', 238, h - 24, '#9fb7c0', 14);
                drawHuygensLegend(ctx, 625, 35);
            }
        }

        function updateWaveReadouts() {
            if (!window.physicsLab || !document.getElementById('wave-length')) return;
            const lambda = labNumber('wave-length'), angle = labNumber('wave-angle');
            const n1 = labNumber('wave-n1'), n2 = labNumber('wave-n2'), gap = labNumber('wave-gap');
            document.getElementById('wave-length-out').textContent = formatLabLength(lambda);
            document.getElementById('wave-speed-out').textContent = `${labNumber('wave-speed').toFixed(1)}×`;
            document.getElementById('wave-angle-out').textContent = `${angle}°`;
            document.getElementById('wave-n1-out').textContent = n1.toFixed(2);
            document.getElementById('wave-n2-out').textContent = n2.toFixed(2);
            document.getElementById('wave-gap-out').textContent = formatLabLength(gap);
            const d = dopplerValues();
            updateWaveControlVisibility();
            document.getElementById('doppler-frequency-out').textContent = `${d.emittedFrequency.toFixed(0)} Hz`;
            document.getElementById('doppler-motion-label').textContent = d.scenario === 'observer' ? '觀察者速度' : '波源速度';
            document.getElementById('doppler-direction-label').textContent = d.scenario === 'observer' ? '觀察者移動方向' : '波源移動方向';
            document.getElementById('doppler-motion-out').textContent = `${d.speedRatio.toFixed(2)}v = ${d.speedMagnitude.toFixed(0)} m/s`;
            document.getElementById('doppler-observer-motion-out').textContent = `${d.observerSpeedRatio.toFixed(2)}v = ${d.observerSpeedMagnitude.toFixed(0)} m/s`;
            const names = { reflection: '反射', refraction: '折射', interference: '干涉', diffraction: '繞射', huygens: '惠更斯原理', doppler: '都卜勒效應' };
            const mode = window.physicsLab.waveMode;
            const modeLabel = document.getElementById('wave-mode-label');
            const angleLabel = document.getElementById('wave-angle-label');
            const lambdaLabel = document.getElementById('wave-lambda2-label');
            const stateLabel = document.getElementById('wave-state-label');
            modeLabel.textContent = '目前現象'; angleLabel.textContent = '反射／折射角'; lambdaLabel.textContent = '介質二波長'; stateLabel.textContent = '狀態';
            let modeText = names[mode], angleText = '—', lambdaText = '—', state = '', explain = '';
            if (mode === 'doppler') {
                if (d.scenario === 'both') {
                    const b = d.both, freq = value => value === null ? '無穩態值' : `${value.toFixed(1)} Hz`;
                    modeLabel.textContent = '第三種情境'; angleLabel.textContent = '兩者都動：λ′｜v′｜f′'; lambdaLabel.textContent = '單獨移動的頻率比較'; stateLabel.textContent = '相對距離';
                    modeText = '波源與觀察者都移動';
                    angleText = `${b.observedWavelength === null ? '震波' : `${b.observedWavelength.toFixed(3)} m`}｜${b.observerWaveSpeed.toFixed(0)} m/s｜${freq(b.observedFrequency)}`;
                    lambdaText = `僅 S：${freq(b.sourceOnlyFrequency)}｜僅 O：${freq(b.observerOnlyFrequency)}`;
                    state = b.relation;
                    explain = `一個波源與一個觀察者可分別設定速度和方向。對向右傳播的聲波，波源決定波前間距 λ′=(v−vₛ)/f₀，觀察者決定波峰相對速度 v′=v−vₒ，因此兩者同時移動時 f′=f₀(v−vₒ)/(v−vₛ)。畫面也保留「只有波源動」與「只有觀察者動」的結果，可直接看出兩種效應會疊加或抵消。`;
                } else {
                    const compact = m => `${m.observedWavelength === null ? '震波' : `${m.observedWavelength.toFixed(3)} m`}｜${m.observerWaveSpeed.toFixed(0)} m/s｜${m.observedFrequency === null ? '無穩態值' : `${m.observedFrequency.toFixed(1)} Hz`}`;
                    modeLabel.textContent = '移動情境／方向'; angleLabel.textContent = '左側 O_L：λ′｜v′｜f′'; lambdaLabel.textContent = '右側 O_R：λ′｜v′｜f′'; stateLabel.textContent = '同時比較';
                    modeText = `${d.scenario === 'source' ? '波源' : '觀察者'}向${d.direction === 'right' ? '右' : '左'}移動`;
                    angleText = compact(d.left);
                    lambdaText = compact(d.right);
                    state = `左側${d.left.relation}｜右側${d.right.relation}`;
                    explain = d.scenario === 'source'
                        ? `左右觀察者同時靜止。波源朝其中一側移動時，該側波前被壓縮、視頻率升高；另一側波前被拉長、視頻率降低。兩側所測波速都仍是空氣聲速 340 m/s。若波源達到或超過聲速，前方觀察者改看到波前堆疊或震波，後方觀察者仍可接收到被拉長的週期波。`
                        : `波源固定在中央，左右觀察者以相同方向與速度移動：其中一位接近波源、另一位遠離。兩側空間波長都保持 λ₀；差別來自波峰相對觀察者的速度，接近側 v′=v+vₒ、遠離側 v′=v−vₒ。若遠離速度達到聲速，後續波峰便無法追上該觀察者。`;
                }
            } else if (mode === 'reflection') {
                angleText = `θᵣ = ${angle}°`; state = '反射角等於入射角';
                explain = '上方連續入射波列逐條抵達介面；每一條入射波前都會讓介面上的點依序產生反射次波，其共同切線形成一條完整反射波前。建構完成後波前會延伸並繼續傳播，不受畫面中的示範取樣區寬度限制；幾何上皆滿足 θᵢ = θᵣ。';
            } else if (mode === 'refraction') {
                lambdaText = formatLabLength(lambda * n1 / n2);
                const s = n1 / n2 * Math.sin(angle * Math.PI / 180);
                if (Math.abs(s) > 1) { angleText = '無折射線'; state = '超過臨界角，發生全反射'; }
                else { const t2 = Math.asin(s) * 180 / Math.PI; angleText = `θ₂ = ${t2.toFixed(1)}°`; state = n2 > n1 ? '進入慢介質，偏向法線' : '進入快介質，偏離法線'; }
                explain = '上方連續入射波列逐條推進到介面，每一條都在第二介質形成對應的完整折射波前。介面次波以 v₂ 展開，因此折射波列的間距變為 λ₂=λ₁v₂/v₁；共同切線幾何導出 sinθ₁/sinθ₂ = v₁/v₂ = n₂/n₁。';
            } else if (mode === 'interference') { state = '亮區同相，暗區反相'; explain = '兩個同頻率波源的波在空間疊加。路徑差為整數倍波長時建設性干涉；為半整數倍波長時破壞性干涉。'; }
            else if (mode === 'diffraction') { state = gap <= lambda ? '狹縫接近波長，明顯展開' : '狹縫遠大於波長，中央主極大變窄'; explain = '狹縫內每一點都是同相次波源；孔徑後方的亮暗來自所有次波的相位疊加，而不是一條圓弧包絡。單縫第一暗紋滿足 a sinθ = λ。'; }
            else { state = '新波前會接續成為下一輪次波源'; explain = '惠更斯原理：當下波前上的每一點同時成為次波源；次波等速展開，其共同包絡形成下一個波前。動畫會讓這個新波前接替舊波前，再重複產生下一代，而不是把各代波前彼此獨立地留在畫面上。'; }
            document.getElementById('wave-mode-readout').textContent = modeText;
            document.getElementById('wave-angle-readout').textContent = angleText;
            document.getElementById('wave-lambda2-readout').textContent = lambdaText;
            document.getElementById('wave-state-readout').textContent = state;
            document.getElementById('wave-explain').textContent = explain;
            updateWaveModelEvidence(mode, { lambda, gap, angle, n1, n2, doppler: d });
        }

        function updateWaveModelEvidence(mode, values) {
            const formula = document.getElementById('wave-formula-readout');
            const invariant = document.getElementById('wave-invariant-readout');
            if (!formula || !invariant) return;
            const ratio = values.gap / values.lambda;
            const formulas = {
                reflection: 'θᵢ = θᵣ',
                refraction: 'n₁ sinθ₁ = n₂ sinθ₂；f₁ = f₂',
                interference: 'Δ = mλ（加強）；Δ = (m+1/2)λ（相消）',
                diffraction: '第一暗紋：a sinθ = λ',
                huygens: '次波半徑：r = vΔt',
                doppler: "f′ = f₀(v−vₒ)/(v−vₛ)"
            };
            const invariants = {
                reflection: `同一介質中 f、v、λ 均不變｜角度誤差 0.0°`,
                refraction: `跨越介面頻率不變｜f₂/f₁ = 1.000`,
                interference: `線性疊加成立｜任一點滿足 y = y₁ + y₂`,
                diffraction: `頻率不變｜目前 a/λ = ${ratio.toFixed(2)}`,
                huygens: `均勻介質中每個次波使用相同波速 v`,
                doppler: `介質波速固定｜v = ${values.doppler.mediumSpeed.toFixed(0)} m/s`
            };
            formula.textContent = formulas[mode];
            invariant.textContent = invariants[mode];
            drawWaveRelationGraph(mode, values);
        }

        function drawWaveRelationGraph(mode, values) {
            const setup = prepLabCanvas('wave-relation-canvas');
            if (!setup) return;
            const { ctx, w, h } = setup;
            const left = 72, right = w - 36, top = 28, bottom = h - 48;
            labLine(ctx, left, bottom, right, bottom, '#91a7ad', 1.5);
            labLine(ctx, left, bottom, left, top, '#91a7ad', 1.5);
            const plot = (fn, color) => {
                ctx.save(); ctx.strokeStyle = labTone(color); ctx.lineWidth = 3; ctx.beginPath();
                for (let i = 0; i <= 180; i++) {
                    const xNorm = i / 180;
                    const yNorm = Math.max(0, Math.min(1, fn(xNorm)));
                    const x = left + xNorm * (right - left);
                    const y = bottom - yNorm * (bottom - top);
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke(); ctx.restore();
            };

            let xLabel = '', yLabel = '', title = '', point = null;
            if (mode === 'reflection' || mode === 'refraction') {
                const fn = x => {
                    const theta = x * 75 * Math.PI / 180;
                    if (mode === 'reflection') return x;
                    const sinTheta2 = values.n1 / values.n2 * Math.sin(theta);
                    return Math.abs(sinTheta2) > 1 ? 1 : Math.asin(sinTheta2) / (75 * Math.PI / 180);
                };
                plot(fn, '#72b9b5');
                const xNorm = values.angle / 75;
                point = [xNorm, fn(xNorm)];
                title = mode === 'reflection' ? '反射角對入射角' : '折射角對入射角';
                xLabel = 'θ₁（0–75°）'; yLabel = mode === 'reflection' ? 'θᵣ' : 'θ₂';
            } else if (mode === 'interference') {
                plot(x => Math.cos(2 * Math.PI * x) ** 2, '#78a6d1');
                title = '兩相干波：相對強度與路徑差'; xLabel = 'Δ/λ（週期）'; yLabel = 'I/Iₘₐₓ';
            } else if (mode === 'diffraction') {
                const apertureRatio = Math.max(0.25, values.gap / values.lambda);
                plot(x => {
                    const z = (x - 0.5) * Math.PI * 4 * apertureRatio;
                    return Math.abs(z) < 1e-6 ? 1 : (Math.sin(z) / z) ** 2;
                }, '#dca85f');
                title = '單縫繞射相對強度'; xLabel = '觀察角位置'; yLabel = 'I/Iₘₐₓ';
            } else if (mode === 'doppler') {
                plot(x => Math.min(1, (1 / Math.max(0.2, 1 - x * 0.8)) / 5), '#df7f85');
                const beta = Math.min(0.8, values.doppler.speedRatio * 0.8);
                point = [Math.min(1, values.doppler.speedRatio / 1.5), Math.min(1, (1 / Math.max(0.2, 1 - beta)) / 5)];
                title = '接近時頻率比的上升趨勢'; xLabel = '速率比'; yLabel = "f′/f₀";
            } else {
                plot(x => x, '#72b9b5');
                title = '次波半徑隨時間線性增加'; xLabel = 'Δt'; yLabel = 'r';
            }

            if (point) {
                const x = left + point[0] * (right - left), y = bottom - point[1] * (bottom - top);
                ctx.fillStyle = LAB_PALETTE.coral; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
            }
            labText(ctx, title, left, 20, '#d5e2e3', 14);
            labText(ctx, xLabel, right, h - 15, '#91a7ad', 12, 'right');
            labText(ctx, yLabel, 16, top + 5, '#91a7ad', 12);
        }

        function wavelengthColor(nm) {
            let r = 0, g = 0, b = 0;
            if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
            else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
            else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
            else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
            else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
            else if (nm <= 780) { r = 1; }
            else if (nm < 380) { r = 0.45; b = 1; }
            else { r = 1; g = 0.12; b = 0.08; }
            return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
        }

        function photoValues() {
            const h = 6.62607015e-34, c = 299792458, e = 1.602176634e-19;
            const nm = labNumber('photo-wave');
            const irradiance = labNumber('photo-intensity');
            const work = labNumber('photo-material');
            const qe = labNumber('photo-qe') / 100;
            const voltage = labNumber('photo-voltage');
            const illuminatedArea = 1e-6; // 1 mm²
            const photonJ = h * c / (nm * 1e-9);
            const photon = photonJ / e;
            const kmax = Math.max(0, photon - work);
            const cutoffNm = 1239.841984 / work;
            const emits = photon >= work;
            const photonRate = irradiance * illuminatedArea / photonJ;
            const electronRate = emits ? qe * photonRate : 0;
            const saturationCurrentUA = e * electronRate * 1e6;
            const saturationVoltage = 2.0; // 只用來標示已充分收集區，不是材料常數
            let collectionFraction = 0;
            if (emits && voltage > -kmax) {
                const x = Math.max(0, Math.min(1, (voltage + kmax) / (saturationVoltage + kmax)));
                collectionFraction = x * x * (3 - 2 * x); // 僅供典型曲線與動畫視覺化
            }
            const photoCurrentUA = saturationCurrentUA * collectionFraction;
            return { nm, irradiance, work, qe, voltage, photon, photonJ, kmax, cutoffNm, emits, photonRate, electronRate, saturationCurrentUA, saturationVoltage, collectionFraction, photoCurrentUA };
        }

        function photoCurrentLabel(currentUA) {
            if (currentUA <= 0) return '0.000 μA';
            if (currentUA < 0.001) return `${(currentUA * 1000).toFixed(2)} nA`;
            return `${currentUA.toFixed(3)} μA`;
        }

        function updatePhotoReadouts() {
            if (!document.getElementById('photo-wave')) return;
            const v = photoValues();
            if (window.physicsLab) {
                if (window.physicsLab.lastWavelength !== v.nm || window.physicsLab.lastWork !== v.work) {
                    window.physicsLab.photoElectrons = [];
                    window.physicsLab.lastWavelength = v.nm;
                    window.physicsLab.lastWork = v.work;
                }
            }
            document.getElementById('photo-wave-out').textContent = `${v.nm} nm`;
            document.getElementById('photo-intensity-out').textContent = `${v.irradiance.toFixed(1)} W/m²`;
            document.getElementById('photo-work-out').textContent = `${v.work.toFixed(2)} eV`;
            document.getElementById('photo-qe-out').textContent = `${(v.qe * 100).toFixed(1)}%`;
            document.getElementById('photo-voltage-out').textContent = `${v.voltage.toFixed(2)} V`;
            document.getElementById('photo-energy-readout').textContent = `${v.photon.toFixed(2)} eV`;
            document.getElementById('photo-kmax-readout').textContent = `${v.kmax.toFixed(2)} eV`;
            document.getElementById('photo-stop-readout').textContent = `${v.kmax.toFixed(2)} V`;
            document.getElementById('photo-cutoff-readout').textContent = `${v.cutoffNm.toFixed(1)} nm`;
            document.getElementById('photo-current-readout').textContent = `${v.saturationCurrentUA.toFixed(3)} μA`;
            const graphMode = document.getElementById('photo-graph-mode').value;
            document.getElementById('photo-analysis').hidden = graphMode === 'none';
            drawPhotoGraph();
            document.getElementById('photo-explain').textContent = v.emits
                ? `精確結果：hf = ${v.photon.toFixed(2)} eV，Kmax = hf − W = ${v.kmax.toFixed(2)} eV，因此截止電壓大小為 ${v.kmax.toFixed(2)} V。以照射面積 1 mm²、量子效率 ${(v.qe * 100).toFixed(1)}% 計，光子通量為 ${v.photonRate.toExponential(2)} s⁻¹，理想飽和電流為 ${v.saturationCurrentUA.toFixed(3)} μA。動畫是一維截面，只抽樣朝集電極方向射出的 e⁻；截止與飽和之間的曲線形狀不是普適定律。`
                : `hf = ${v.photon.toFixed(2)} eV 小於功函數 W = ${v.work.toFixed(2)} eV，因此沒有光電子；提高輻照度只增加能量不足的光子數，Kmax、光電流與飽和電流仍為零。`;
        }

        function photoElectronTrajectory(kineticEnergyEv, voltage, gapMeters = 0.20) {
            const e = 1.602176634e-19, me = 9.1093837139e-31;
            const v0 = Math.sqrt(2 * kineticEnergyEv * e / me);
            const acceleration = e * voltage / (me * gapMeters);
            if (voltage < 0 && kineticEnergyEv <= -voltage) {
                const turnTime = acceleration !== 0 ? -v0 / acceleration : Infinity;
                return { v0, acceleration, duration: 2 * turnTime, reachesCollector: false, turnFraction: kineticEnergyEv / -voltage };
            }
            let duration;
            if (Math.abs(acceleration) < 1e-12) duration = v0 > 0 ? gapMeters / v0 : Infinity;
            else duration = (Math.sqrt(Math.max(0, v0 * v0 + 2 * acceleration * gapMeters)) - v0) / acceleration;
            return { v0, acceleration, duration, reachesCollector: true, turnFraction: 1 };
        }


        function drawPhotoLab(fixedSteps = 1) {
            const setup = prepLabCanvas('photo-canvas');
            if (!setup) return;
            const { ctx, w, h } = setup, v = photoValues(), t = window.physicsLab.time;
            const chamber = { x: 135, y: 135, w: 650, h: 250 };

            // 外部閉合電路：先畫在玻璃管後方，讓裝置結構一眼可辨。
            ctx.save(); ctx.strokeStyle = '#a58a4d'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(190, 330); ctx.lineTo(190, 445); ctx.lineTo(345, 445);
            ctx.moveTo(535, 445); ctx.lineTo(625, 445);
            ctx.moveTo(735, 445); ctx.lineTo(745, 445); ctx.lineTo(745, 330);
            ctx.stroke(); ctx.restore();

            // 繪製可逆直流電源 (電池外觀)
            ctx.save();
            const bx = 440, by = 445, bw = 190, bh = 42;
            const leftX = bx - bw / 2, rightX = bx + bw / 2;
            const topY = by - bh / 2;
            
            if (v.voltage === 0) {
                // 零電壓：灰色鈍化電池，無極性
                const grad = ctx.createLinearGradient(leftX, 0, rightX, 0);
                grad.addColorStop(0, '#475569'); grad.addColorStop(1, '#94a3b8');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.roundRect(leftX, topY, bw, bh, 6); ctx.fill();
                // 畫小凸起（右側，灰色）
                ctx.fillStyle = '#64748b';
                ctx.beginPath(); ctx.roundRect(rightX, by - 8, 6, 16, 2); ctx.fill();
                ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke();
            } else {
                const isPositiveRight = (v.voltage > 0);
                // 順向偏壓：右側為正端(+)，左側為負端(-)
                // 逆向偏壓：左側為正端(+)，右側為負端(-)
                
                // 凸起端（正極）
                const capX = isPositiveRight ? rightX : leftX - 6;
                const capGrad = ctx.createLinearGradient(0, topY, 0, topY + bh);
                capGrad.addColorStop(0, '#fcd34d'); capGrad.addColorStop(0.5, '#b45309'); capGrad.addColorStop(1, '#78350f');
                ctx.fillStyle = capGrad;
                ctx.beginPath(); ctx.roundRect(capX, by - 8, 6, 16, 2); ctx.fill();
                
                // 電池主體分成金黃色（正極端）與深黑色（負極端）
                const splitX = isPositiveRight ? leftX + bw * 0.6 : leftX + bw * 0.4;
                
                // 繪製黑色部分
                const blackGrad = ctx.createLinearGradient(0, topY, 0, topY + bh);
                blackGrad.addColorStop(0, '#1e293b'); blackGrad.addColorStop(0.5, '#475569'); blackGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = blackGrad;
                ctx.beginPath();
                if (isPositiveRight) {
                    ctx.roundRect(leftX, topY, bw * 0.6, bh, [6, 0, 0, 6]);
                } else {
                    ctx.roundRect(splitX, topY, bw * 0.6, bh, [0, 6, 6, 0]);
                }
                ctx.fill();
                
                // 繪製金黃色部分
                const goldGrad = ctx.createLinearGradient(0, topY, 0, topY + bh);
                goldGrad.addColorStop(0, '#fbbf24'); goldGrad.addColorStop(0.5, '#f59e0b'); goldGrad.addColorStop(1, '#b45309');
                ctx.fillStyle = goldGrad;
                ctx.beginPath();
                if (isPositiveRight) {
                    ctx.roundRect(splitX, topY, bw * 0.4, bh, [0, 6, 6, 0]);
                } else {
                    ctx.roundRect(leftX, topY, bw * 0.4, bh, [6, 0, 0, 6]);
                }
                ctx.fill();
                
                // 標示 + 與 -
                const plusX = isPositiveRight ? rightX - 25 : leftX + 25;
                const minusX = isPositiveRight ? leftX + 25 : rightX - 25;
                
                labText(ctx, '+', plusX, by + 8, '#ffffff', 24, 'center');
                labText(ctx, '−', minusX, by + 8, '#ffffff', 24, 'center');
            }
            
            // 外框線
            ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(leftX, topY, bw, bh, 6); ctx.stroke();
            
            // 顯示電壓文字
            labText(ctx, `${v.voltage >= 0 ? '+' : '−'} ${Math.abs(v.voltage).toFixed(2)} V`, bx, by - 28, '#d9eef2', 17, 'center');
            
            // 偏壓文字說明
            const biasText = v.voltage > 0 ? '順向偏壓 (加速收集)' : v.voltage < 0 ? '逆向偏壓 (反向遏止)' : '零外加電壓';
            const biasColor = v.voltage > 0 ? '#64c800' : v.voltage < 0 ? '#ff7f98' : '#bcd0d6';
            labText(ctx, biasText, bx, by + 42, biasColor, 14, 'center');
            ctx.restore();

            // 未飽和區仍有光電子抵達；以典型收集曲線估計當下光電流，狀態另行標示。
            ctx.fillStyle = '#e8f1f2'; ctx.beginPath(); ctx.roundRect(625, 408, 110, 74, 10); ctx.fill();
            ctx.strokeStyle = '#78909a'; ctx.lineWidth = 2; ctx.stroke();
            const meterText = photoCurrentLabel(v.photoCurrentUA);
            const meterState = !v.emits ? '無光電子' : v.voltage <= -v.kmax ? '截止' : v.voltage >= v.saturationVoltage ? '飽和區' : '未飽和區';
            labText(ctx, meterText, 680, 436, '#173947', 15, 'center');
            labText(ctx, meterState, 680, 455, '#526b76', 10, 'center');
            labText(ctx, '電流計', 680, 474, '#526b76', 11, 'center');

            // 玻璃真空管。
            ctx.save();
            const glass = ctx.createLinearGradient(chamber.x, chamber.y, chamber.x, chamber.y + chamber.h);
            glass.addColorStop(0, 'rgba(189,229,237,.16)'); glass.addColorStop(0.48, 'rgba(35,76,91,.06)'); glass.addColorStop(1, 'rgba(189,229,237,.12)');
            ctx.fillStyle = glass; ctx.beginPath(); ctx.roundRect(chamber.x, chamber.y, chamber.w, chamber.h, 26); ctx.fill();
            ctx.strokeStyle = '#779aa6'; ctx.lineWidth = 4; ctx.stroke();
            ctx.strokeStyle = 'rgba(230,249,252,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(chamber.x + 28, chamber.y + 18); ctx.lineTo(chamber.x + chamber.w - 28, chamber.y + 18); ctx.stroke();
            labText(ctx, '真空', chamber.x + chamber.w / 2, chamber.y + 34, '#9fb7c0', 14, 'center');
            ctx.restore();

            const cathodeX = 190, anodeX = 735;
            const electrodeGrad = ctx.createLinearGradient(cathodeX - 8, 0, cathodeX + 24, 0);
            electrodeGrad.addColorStop(0, '#6e552d'); electrodeGrad.addColorStop(0.45, '#e4b45d'); electrodeGrad.addColorStop(1, '#806331');
            ctx.fillStyle = electrodeGrad; ctx.beginPath(); ctx.roundRect(cathodeX - 10, 165, 24, 170, 7); ctx.fill();
            ctx.fillStyle = '#91b8c2'; ctx.beginPath(); ctx.roundRect(anodeX - 8, 165, 22, 170, 7); ctx.fill();
            labText(ctx, '光陰極', cathodeX + 2, 360, '#ffc36b', 15, 'center');
            labText(ctx, '集電極', anodeX + 3, 360, '#a9ced6', 15, 'center');
            if (v.voltage !== 0) {
                labText(ctx, v.voltage > 0 ? '−' : '+', cathodeX + 2, 153, v.voltage > 0 ? '#9de2df' : '#ff9bad', 20, 'center');
                labText(ctx, v.voltage > 0 ? '+' : '−', anodeX + 3, 153, v.voltage > 0 ? '#ff9bad' : '#9de2df', 20, 'center');
            }

            // 斜向單色光源與光束。
            const color = wavelengthColor(v.nm);
            const beamAlpha = 0.12 + 0.55 * Math.sqrt(v.irradiance / 100);
            ctx.save(); ctx.globalAlpha = beamAlpha; ctx.fillStyle = color;
            ctx.beginPath(); ctx.moveTo(350, 102); ctx.lineTo(cathodeX + 2, 172); ctx.lineTo(cathodeX + 2, 292); ctx.lineTo(382, 117); ctx.closePath(); ctx.fill(); ctx.restore();
            ctx.save(); ctx.translate(365, 82); ctx.rotate(-0.42);
            const lampGrad = ctx.createLinearGradient(-50, 0, 55, 0); lampGrad.addColorStop(0, '#182630'); lampGrad.addColorStop(0.5, '#647680'); lampGrad.addColorStop(1, '#0a141a');
            ctx.fillStyle = lampGrad; ctx.beginPath(); ctx.roundRect(-46, -25, 92, 50, 12); ctx.fill();
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-55, -34); ctx.lineTo(-80, 0); ctx.lineTo(-55, 34); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#9eb3bb'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
            labText(ctx, `${v.nm} nm`, 430, 75, color, 19);

            const photonDots = Math.max(2, Math.min(14, Math.round(2 + Math.sqrt(v.irradiance) * 1.2)));
            for (let i = 0; i < photonDots; i++) {
                const p = (t * 0.85 + i / photonDots) % 1;
                const x = 360 + (cathodeX - 360) * p;
                const y = 110 + (232 - 110) * p + (i % 5 - 2) * 10 * p;
                labText(ctx, 'γ', x, y, color, 13, 'center');
            }

            if (!window.physicsLab.photoElectrons) {
                window.physicsLab.photoElectrons = [];
            }

            const me = 9.1093837139e-31, e = 1.602176634e-19;
            const gapMeters = 0.20;
            const ax = (e * v.voltage) / (me * gapMeters);
            const dt = 0.035 * labNumber('wave-speed') * 1.5e-7 * Math.max(1, fixedSteps);

            if (v.emits) {
                const baseSpawnProbability = Math.min(0.8, 0.01 + v.saturationCurrentUA * 0.12) * labNumber('wave-speed');
                const spawnProbability = 1 - Math.pow(1 - Math.min(0.95, baseSpawnProbability), Math.max(1, fixedSteps));
                if (Math.random() < spawnProbability) {
                    const energyEv = Math.random() * v.kmax;
                    const v0 = Math.sqrt(2 * energyEv * e / me);
                    
                    window.physicsLab.photoElectrons.push({
                        x: 0,
                        y: 180 + Math.random() * 140,
                        v0x: v0,
                        v0y: 0,
                        elapsed: 0,
                        energyEv: energyEv
                    });
                }
            }

            const activeElectrons = [];
            window.physicsLab.photoElectrons.forEach(pe => {
                pe.elapsed += dt;
                const t = pe.elapsed;
                const xMeters = pe.v0x * t + 0.5 * ax * t * t;
                
                if (xMeters < 0) return;
                if (xMeters >= gapMeters) return;
                
                const fraction = xMeters / gapMeters;
                const canvasX = cathodeX + 25 + fraction * (anodeX - cathodeX - 50);
                const canvasY = pe.y;
                
                pe.currentX = canvasX;
                pe.currentY = canvasY;
                activeElectrons.push(pe);
                
                ctx.save();
                const reaches = pe.energyEv > -v.voltage;
                ctx.globalAlpha = (v.voltage >= 0 || reaches) ? 1 : 0.6;
                ctx.fillStyle = '#71d1cf';
                ctx.beginPath();
                ctx.arc(canvasX, canvasY, 5.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                labText(ctx, '−', canvasX, canvasY + 3.5, '#102633', 9, 'center');
            });
            window.physicsLab.photoElectrons = activeElectrons;
            const motionNote = !v.emits
                ? 'hf < W：無光電子逸出'
                : v.voltage < 0
                    ? '所有粒子皆為 e⁻；反向電場使法向動能不足者減速、停止後返回'
                    : '光子標為 γ；電子速度由 K(x)=K₀+eVx/d 決定（動畫時間已放慢）';
            labText(ctx, motionNote, chamber.x + chamber.w / 2, 520, v.emits ? '#bcd0d6' : '#ff7f98', 15, 'center');
            drawPhotoGraph();
        }

