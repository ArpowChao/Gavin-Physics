// 互動實驗：弦、開管與閉管的諧音
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 7. 弦、開管與閉管的諧音 ------------------------------------------ */
        LABS.pipes = {
            name: '弦、開管與閉管的諧音',
            cycle: 2.62,
            tag: 'N10 / N12',
            hint: '同一個長度 L、同一個波速 v，三種樂器能產生的諧音完全不同。青色是「位移」駐波、粉紅色是「壓力」駐波——兩者的波節與波腹恰好互換，這是閉管題最常被問倒的地方。',
            note: '端點條件：弦的固定端＝位移節點；管的開口端＝位移腹點、壓力節點；管的閉口端＝位移節點、壓力腹點。閉管只有奇數諧音，且同長度時基頻只有開管的一半。',
            height: 380,
            modes: [
                { key: 'string', label: '兩端固定的弦' },
                { key: 'open', label: '開管樂器' },
                { key: 'closed', label: '閉管樂器' }
            ],
            controls: [
                { key: 'idx', label: '第幾個可存在的諧音', min: 1, max: 5, step: 1, value: 2, fmt: (v, p) => (p.mode === 'closed' ? `m = ${2 * v - 1}` : `n = ${v}`) },
                { key: 'L', label: '長度 L (m)', min: 0.2, max: 2, step: 0.05, value: 0.6, fmt: (v) => `${v.toFixed(2)} m` },
                { key: 'v', label: '波速 v (m/s)', min: 100, max: 400, step: 10, value: 340, fmt: (v) => `${v} m/s` }
            ],
            readouts: (p) => {
                const closed = p.mode === 'closed';
                const m = closed ? 2 * p.idx - 1 : p.idx;
                const lam = closed ? 4 * p.L / m : 2 * p.L / m;
                const f = p.v / Math.max(lam, 1e-6);
                const f1 = p.v / (closed ? 4 * p.L : 2 * p.L);
                return [
                    { label: '諧音名稱', value: `第 ${m} 諧音${p.idx === 1 ? '（基音）' : `（第 ${p.idx - 1} 泛音）`}` },
                    { label: '波長 λ', value: `${lam.toFixed(3)} m` },
                    { label: '頻率 f', value: `${f.toFixed(1)} Hz` },
                    { label: '基頻 f₁', value: `${f1.toFixed(1)} Hz` }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const closed = p.mode === 'closed';
                const isString = p.mode === 'string';
                const m = closed ? 2 * Math.round(p.idx) - 1 : Math.round(p.idx);
                const x0 = 46, x1 = Math.max(x0 + 60, w - 46), span = x1 - x0;
                const rowD = h * 0.36;                 // 位移駐波
                const rowP = h * 0.74;                 // 壓力駐波
                const A = 40;
                const omega = 2.4;
                const phase = Math.cos(omega * t);

                /* 端點條件決定空間函數：
                   弦（兩端固定）  ：位移 ∝ sin(nπu)      → 兩端皆為位移節點
                   開管（兩端開口）：位移 ∝ cos(nπu)      → 兩端皆為位移腹點
                   閉管（左開右閉）：位移 ∝ cos(mπu/2)    → 左腹點、右節點（m 為奇數）
                   壓力永遠是位移的空間導數 ⇒ 節點與腹點恰好互換。 */
                const kU = closed ? (m * Math.PI / 2) : (m * Math.PI);
                const dispType = isString ? 'sin' : 'cos';
                const presType = isString ? 'cos' : 'sin';
                const dispShape = isString ? ((u) => Math.sin(kU * u)) : ((u) => Math.cos(kU * u));
                const presShape = isString ? ((u) => Math.cos(kU * u)) : ((u) => -Math.sin(kU * u));
                /* 節點與腹點的位置用解析式算，避免逐點掃描在極值處重複計數 */
                const marks = (type) => {
                    const nodes = [], antis = [];
                    for (let j = 0; j < 40; j++) {
                        const uN = (type === 'sin' ? j : j + 0.5) * Math.PI / kU;
                        const uA = (type === 'sin' ? j + 0.5 : j) * Math.PI / kU;
                        if (uN <= 1.0001) nodes.push(Math.min(uN, 1));
                        if (uA <= 1.0001) antis.push(Math.min(uA, 1));
                        if (uN > 1.0001 && uA > 1.0001) break;
                    }
                    return { nodes, antis };
                };

                /* 樂器外形 */
                if (isString) {
                    ctx.fillStyle = 'rgba(18,49,58,0.2)';
                    ctx.fillRect(x0 - 10, rowD - 52, 8, 104);
                    ctx.fillRect(x1 + 2, rowD - 52, 8, 104);
                } else {
                    ctx.strokeStyle = 'rgba(18,49,58,0.3)'; ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x0, rowD - 52); ctx.lineTo(x1, rowD - 52);
                    ctx.moveTo(x0, rowD + 52); ctx.lineTo(x1, rowD + 52);
                    ctx.stroke();
                    if (closed) { ctx.beginPath(); ctx.moveTo(x1, rowD - 52); ctx.lineTo(x1, rowD + 52); ctx.stroke(); }
                }

                /* 畫一組駐波（含包絡線、節點、腹點） */
                const drawStanding = (yc, shape, type, color, softColor, title, nodeName, antiName) => {
                    axis(ctx, x0, yc, x1, yc);
                    ctx.strokeStyle = softColor; ctx.lineWidth = 1.2;
                    [1, -1].forEach((sgn) => {
                        ctx.beginPath();
                        for (let i = 0; i <= span; i += 2) ctx.lineTo(x0 + i, yc - sgn * A * shape(i / span));
                        ctx.stroke();
                    });
                    ctx.strokeStyle = color; ctx.lineWidth = 2.8;
                    ctx.beginPath();
                    for (let i = 0; i <= span; i += 2) ctx.lineTo(x0 + i, yc - A * shape(i / span) * phase);
                    ctx.stroke();
                    const mk = marks(type);
                    mk.nodes.forEach((u) => {
                        ctx.fillStyle = C.rose;
                        ctx.beginPath(); ctx.arc(x0 + u * span, yc, 4.4, 0, Math.PI * 2); ctx.fill();
                    });
                    mk.antis.forEach((u) => {
                        ctx.fillStyle = C.green;
                        ctx.beginPath(); ctx.arc(x0 + u * span, yc, 4.4, 0, Math.PI * 2); ctx.fill();
                    });
                    /* 標題與統計同列；窄畫布放不下時自動改成上下兩行 */
                    labelRow(ctx, x0, x1, yc - A - 26, 15,
                             { text: title, color, size: 12 },
                             { text: `${nodeName} ${mk.nodes.length} 個　${antiName} ${mk.antis.length} 個`, color: C.muted, size: 11 });
                };

                drawStanding(rowD, dispShape, dispType, C.cyan, 'rgba(14,139,147,0.2)', '位移駐波（空氣分子的振動幅度）', '位移節點', '位移腹點');
                drawStanding(rowP, presShape, presType, C.rose, 'rgba(194,38,74,0.16)', '壓力駐波（ΔP 的振幅）', '壓力節點', '壓力腹點');

                /* 端點標註（放在畫布底部一行，避免右對齊文字被切掉） */
                const leftTag = isString ? '左端 固定端：位移節點' : '左端 開口：位移腹點・壓力節點';
                const rightTag = isString ? '右端 固定端：位移節點'
                    : (closed ? '右端 閉口端：位移節點・壓力腹點' : '右端 開口：位移腹點・壓力節點');
                const endRows = labelRow(ctx, x0, x1, h - 40, 14,
                    { text: leftTag, color: isString ? C.rose : C.green, size: 11 },
                    { text: rightTag, color: (isString || closed) ? C.rose : C.green, size: 11 });
                /* 圖例緊接在端點標註之後，行數由上面實際用掉幾行決定 */
                const legY = h - 40 + endRows * 14 + 2;
                ctx.fillStyle = C.rose;
                ctx.beginPath(); ctx.arc(x0 + 4, legY - 4, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = C.green;
                ctx.beginPath(); ctx.arc(x0 + 62, legY - 4, 4, 0, Math.PI * 2); ctx.fill();
                label(ctx, '節點', x0 + 12, legY, C.muted, 10);
                label(ctx, '腹點', x0 + 70, legY, C.muted, 10);

                /* 公式與長度標示 */
                label(ctx, closed ? 'L = m λ/4，m = 1, 3, 5, …（僅奇數諧音）' : 'L = n λ/2，n = 1, 2, 3, …', x0, 20, C.ink, 12);
                label(ctx, closed ? 'f = m v / 4L' : 'f = n v / 2L', x0, 38, C.blue, 12);
                ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
                const yy = h - 52;
                ctx.beginPath();
                ctx.moveTo(x0, yy); ctx.lineTo(x1, yy);
                ctx.moveTo(x0, yy - 5); ctx.lineTo(x0, yy + 5);
                ctx.moveTo(x1, yy - 5); ctx.lineTo(x1, yy + 5);
                ctx.stroke();
                label(ctx, `L = ${p.L.toFixed(2)} m`, (x0 + x1) / 2, yy - 8, C.muted, 11, 'center');
            }
        };
        LABS.standing = {
            name: '駐波的形成',
            cycle: 4.0,                                     // 駐波的一個週期 T
            tag: 'N04 / N10 / N12',
            hint: '<b>藍色</b>虛線＝向右行進波，<b>橘色</b>虛線＝向左行進波，青色粗線＝兩者疊加的合成波，紫線是 ±2A 包絡線——請確認波形只在包絡線內原地伸縮，一步也沒有前進。<br>畫面太滿時把「標註詳細度」調到<b>精簡</b>，只留三條波；要看殘影、P/Q/R 探針與速度箭頭再切到<b>完整</b>。',
            note: '在 $t=\\frac{2T}{8}$、$\\frac{6T}{8}$ 時，合成波形拉直：除波節以外，各質點同時通過平衡位置，速率達到各自的最大值。波節始終不動。在最大位移（$t=0$、$\\frac{4T}{8}$）時，各質點瞬間速度為零。兩端固定：$L=n\\lambda/2$；一端自由：$L=m\\lambda/4$，$m$ 為正奇數。',
            height: 460,
            modes: [
                { key: 'both', label: '兩端固定（弦／開管）' },
                { key: 'one', label: '一端自由（閉管）' }
            ],
            controls: [
                { key: 'n', label: '諧音序號', min: 1, max: 6, step: 1, value: 3, fmt: (v, p) => (p.mode === 'one' ? `m = ${2 * v - 1}（奇數）` : `n = ${v}`) },
                { key: 'L', label: '弦長／管長 L (m)', min: 0.5, max: 3, step: 0.1, value: 1.5, fmt: (v) => `${v.toFixed(1)} m` },
                { key: 'v', label: '波速 v (m/s)', min: 60, max: 400, step: 10, value: 340, fmt: (v) => `${v} m/s` },
                {
                    key: 'detail',
                    label: '標註詳細度',
                    options: [
                        { value: 1, label: '精簡：只看三條波' },
                        { value: 2, label: '標準：＋波節波腹與 λ/2、λ/4' },
                        { value: 3, label: '完整：＋殘影、探針、速度箭頭' }
                    ],
                    value: 2,
                    fmt: (v) => Number(v) === 1 ? '精簡' : (Number(v) === 2 ? '標準' : '完整')
                }
            ],
            readouts: (p) => {
                const one = p.mode === 'one';
                const nH = Math.max(1, Math.round(p.n));
                const m = one ? (2 * nH - 1) : nH;
                const L = Math.max(0.1, p.L);
                const lam = one ? (4 * L / m) : (2 * L / m);
                const f = p.v / Math.max(lam, 1e-6);
                return [
                    { label: '波長 λ', value: `${lam.toFixed(3)} m` },
                    { label: '頻率 f = v/λ', value: `${f.toFixed(1)} Hz` },
                    { label: '波節數', value: one ? `${(m + 1) / 2}` : `${m + 1}` },
                    { label: '波腹數', value: one ? `${(m + 1) / 2}` : `${m}` }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const RIGHT_COL = '#1f6fc4';        // 向右行進波：藍
                const LEFT_COL = '#e07a1f';         // 向左行進波：橘
                const DIM_COL = '#8d9aa2';          // 尺寸線改用灰，不要跟波搶注意力
                const detail = Number(p.detail === undefined ? 2 : p.detail);
                /* ---------- 物理量 -------------------------------------------------
                 * 右行波 y1 = A sin(kx − ωt)，左行波 y2 = A sin(kx + ωt)
                 * 疊加 y = 2A sin(kx)·cos(ωt)  ⇒ 波形不前進，只在 ±2A sin(kx) 內伸縮
                 * 質點速度 ∂y/∂t = −2Aω sin(kx)·sin(ωt)
                 *   ⇒ cos(ωt)=0（t = 2T/8、6T/8）時位移全為零，但 |sin(ωt)|=1 速率最大
                 * 兩端固定：k = nπ/L，λ = 2L/n；一端自由：k = mπ/(2L)，λ = 4L/m（m 為奇數）
                 * ------------------------------------------------------------------ */
                const one = p.mode === 'one';
                const nH = Math.max(1, Math.round(p.n));
                const m = one ? (2 * nH - 1) : nH;
                const L = Math.max(0.1, p.L);
                const lam = Math.max(one ? (4 * L / m) : (2 * L / m), 1e-6);
                const k = 2 * Math.PI / lam;
                // 畫面涵蓋的空間範圍：至少要塞得下一個完整 λ，尺寸線才畫得出來
                const xmax = Math.max(L, lam, 1e-6);

                const TA = 4.0;                                   // 動畫用週期（秒）
                const frac = Math.max(0, (t / TA) % 1);           // 佔一個週期的比例
                const phi = 2 * Math.PI * frac;                   // ωt
                const step8 = Math.min(7, Math.floor(frac * 8));  // 目前是第幾個 T/8
                const cs = Math.cos(phi), sn = Math.sin(phi);
                const flat = Math.abs(cs) < 0.32;                 // 合成波成一直線的時刻
                const peak = Math.abs(sn) < 0.32;                 // 合成波達最大位移的時刻

                /* ---------- 版面（全部由 w、h 推出，不寫死） ---------------------- */
                const pad = w < 430 ? 22 : 38;
                const x0 = pad;
                const x1 = Math.max(x0 + 80, w - pad);
                const span = x1 - x0;
                const X = (xp) => x0 + (xp / xmax) * span;

                const boxY = h - 84, boxH = 62;
                const trackY = boxY - 20;
                const infoY = trackY - 18;
                const formY = infoY - 18;
                const brkY = formY - 20;
                const antiY = brkY - 20;
                const nodeY = antiY - 16;
                const yc = Math.round(h * 0.40);
                const Amax = Math.max(24, Math.min(62, nodeY - 18 - yc));   // 2A 的像素高
                const Aph = Amax / 2;                                        // 單一行進波振幅 A
                const rowQ = Math.max(30, yc - Amax - 26);
                const rowH = rowQ - 24;
                const rowL = rowH - 24;
                const legY = Math.max(12, rowL - 20);

                const setF = (s) => { ctx.font = `${s}px Outfit, "Noto Sans TC", sans-serif`; };
                const tw = (s, size) => { setF(size); return ctx.measureText(s).width; };
                const pick = (arr, maxW, size) => {
                    for (let i = 0; i < arr.length; i++) { if (tw(arr[i], size) <= maxW) return arr[i]; }
                    return arr[arr.length - 1];
                };
                const SUBD = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
                const sub = (v) => String(v).split('').map((d) => SUBD[Number(d)] || d).join('');

                /* ---------- 曲線繪製工具（只算需要的像素範圍，省效能） ------------ */
                const poly = (xa, xb, fn) => {
                    const a = Math.max(x0, xa), b = Math.min(x1, xb);
                    if (!(b > a)) return;
                    ctx.beginPath();
                    let first = true;
                    for (let px = a; px <= b; px += 3) {
                        const y = yc - fn(((px - x0) / span) * xmax);
                        if (first) { ctx.moveTo(px, y); first = false; } else ctx.lineTo(px, y);
                    }
                    ctx.lineTo(b, yc - fn(((b - x0) / span) * xmax));
                    ctx.stroke();
                };
                const fillEnv = (xa, xb) => {
                    const a = Math.max(x0, xa), b = Math.min(x1, xb);
                    if (!(b > a)) return;
                    ctx.fillStyle = 'rgba(107,70,193,0.09)';
                    ctx.beginPath();
                    let first = true;
                    for (let px = a; px <= b; px += 3) {
                        const y = yc - Amax * Math.sin(k * ((px - x0) / span) * xmax);
                        if (first) { ctx.moveTo(px, y); first = false; } else ctx.lineTo(px, y);
                    }
                    for (let px = b; px >= a; px -= 3) {
                        ctx.lineTo(px, yc + Amax * Math.sin(k * ((px - x0) / span) * xmax));
                    }
                    ctx.closePath(); ctx.fill();
                };
                const GH = 6;   // 保留幾個過去時刻的殘影
                const field = (xa, xb, alpha) => {
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    fillEnv(xa, xb);
                    // 包絡線 y = ±2A sin(kx)
                    ctx.strokeStyle = C.violet; ctx.lineWidth = 1.4;
                    poly(xa, xb, (xp) => Amax * Math.sin(k * xp));
                    poly(xa, xb, (xp) => -Amax * Math.sin(k * xp));
                    // 過去時刻的合成波（愈舊愈淡）：所有殘影共用同一組零點 ⇒ 波形沒前進
                    ctx.lineWidth = 1.6;
                    for (let g = (detail >= 3 ? GH : 0); g >= 1; g--) {
                        const cg = Math.cos(phi - g * Math.PI / 8);
                        ctx.strokeStyle = `rgba(14,139,147,${(0.26 * (1 - g / (GH + 1))).toFixed(3)})`;
                        poly(xa, xb, (xp) => Amax * Math.sin(k * xp) * cg);
                    }
                    // 兩列行進波
                    /* 兩列行進波必須一眼分得出來。原本 C.blue 與 C.green 都是暗青色系，
                     * 畫成細虛線後根本無法區別，故改用藍／橘這組對比色。 */
                    ctx.setLineDash([6, 4]); ctx.lineWidth = 1.7;
                    ctx.strokeStyle = RIGHT_COL;
                    poly(xa, xb, (xp) => Aph * Math.sin(k * xp - phi));
                    ctx.strokeStyle = LEFT_COL;
                    poly(xa, xb, (xp) => Aph * Math.sin(k * xp + phi));
                    ctx.setLineDash([]);
                    // 合成波（此刻）
                    ctx.strokeStyle = C.cyan; ctx.lineWidth = 3;
                    poly(xa, xb, (xp) => Amax * Math.sin(k * xp) * cs);
                    ctx.restore();
                };

                /* ---------- 尺寸線 ------------------------------------------------ */
                const dimBar = (xpa, xpb, y, sym, desc, col) => {
                    const a = X(xpa), b = X(xpb);
                    if (!(b > a)) return;
                    ctx.strokeStyle = col; ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(a, y - 5); ctx.lineTo(a, y + 5);
                    ctx.moveTo(b, y - 5); ctx.lineTo(b, y + 5);
                    ctx.stroke();
                    const mid = (a + b) / 2;
                    if (b - a > 18) {
                        arrow(ctx, mid, y, a + 1.5, y, col, 1.2);
                        arrow(ctx, mid, y, b - 1.5, y, col, 1.2);
                    } else {
                        ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.stroke();
                    }
                    const full = desc ? `${sym}（${desc}）` : sym;
                    const wF = tw(full, 12), wS = tw(sym, 12);
                    if (wF + 10 <= b - a) label(ctx, full, mid, y - 6, col, 12, 'center');
                    else if (b + 6 + wF <= x1) label(ctx, full, b + 6, y + 4, col, 12, 'left');
                    else if (wS + 8 <= b - a) label(ctx, sym, mid, y - 6, col, 12, 'center');
                    else if (b + 5 + wS <= x1) label(ctx, sym, b + 5, y + 4, col, 12, 'left');
                    else label(ctx, sym, Math.max(x0 + wS / 2, Math.min(mid, x1 - wS / 2)), y - 6, col, 12, 'center');
                };

                /* ---------- 節點／腹點位置 ---------------------------------------- */
                const nodes = [], antis = [];
                for (let j = 0; j <= 40; j++) { const xp = j * lam / 2; if (xp > L + 1e-9) break; nodes.push(xp); }
                for (let j = 0; j <= 40; j++) { const xp = (j + 0.5) * lam / 2; if (xp > L + 1e-9) break; antis.push(xp); }

                const xL = X(L);

                /* ---------- 1. 弦外延伸區的底色 ----------------------------------- */
                if (xL < x1 - 2) {
                    ctx.fillStyle = 'rgba(125,148,156,0.08)';
                    ctx.fillRect(xL, yc - Amax - 10, x1 - xL, 2 * (Amax + 10));
                    const txt = pick(['弦（管）外：僅延伸示意，用來量出完整的 λ', '弦外延伸示意', '延伸'], x1 - xL - 6, 10);
                    label(ctx, txt, (xL + x1) / 2, yc - Amax - 14, C.muted, 10, 'center');
                }

                /* ---------- 2. 對齊 λ 刻度的垂直虛線 ------------------------------ */
                [0, lam / 4, lam / 2, 3 * lam / 4, lam].forEach((xp) => {
                    if (xp > xmax + 1e-9) return;
                    dashed(ctx, X(xp), rowL - 9, X(xp), yc + Amax + 6, 'rgba(201,117,15,0.30)');
                });

                /* ---------- 3. 主軸與波形 ---------------------------------------- */
                axis(ctx, x0, yc, x1, yc);
                field(x0, xL, 1);
                if (xL < x1 - 1) field(xL, x1, 0.34);

                // ±A 參考短線（讓學生比較「行進波 A」與「波腹 2A」）
                dashed(ctx, x0, yc - Aph, x0 + Math.min(46, span * 0.2), yc - Aph, 'rgba(11,111,146,0.45)');
                dashed(ctx, x0, yc - Amax, x0 + Math.min(46, span * 0.2), yc - Amax, 'rgba(107,70,193,0.45)');
                label(ctx, 'A', x0 + 3, yc - Aph - 3, C.blue, 10);
                label(ctx, '2A', x0 + 3, yc - Amax - 3, C.violet, 10);

                /* ---------- 4. 端點條件 ------------------------------------------ */
                ctx.fillStyle = 'rgba(18,49,58,0.22)';
                ctx.fillRect(x0 - 8, yc - Amax - 8, 7, 2 * (Amax + 8));
                label(ctx, 'N', x0 - 11, yc + 4, C.rose, 11, 'right');
                if (one) {
                    ctx.strokeStyle = C.violet; ctx.lineWidth = 2.4;
                    ctx.beginPath(); ctx.moveTo(xL + 4, yc - Amax - 8); ctx.lineTo(xL + 4, yc + Amax + 8); ctx.stroke();
                    label(ctx, 'A', xL + 10, yc + 4, C.violet, 11, 'left');
                } else {
                    ctx.fillStyle = 'rgba(18,49,58,0.22)';
                    ctx.fillRect(xL + 1, yc - Amax - 8, 7, 2 * (Amax + 8));
                    label(ctx, 'N', xL + 11, yc + 4, C.rose, 11, 'left');
                }

                /* ---------- 5. 波節／波腹的點與編號 ------------------------------ */
                nodes.forEach((xp, i) => {
                    ctx.fillStyle = C.rose;
                    ctx.beginPath(); ctx.arc(X(xp), yc, 4, 0, Math.PI * 2); ctx.fill();
                    if (detail >= 2) label(ctx, `N${sub(i + 1)}`, X(xp), nodeY, C.rose, 11, 'center');
                });
                antis.forEach((xp, i) => {
                    ctx.fillStyle = C.violet;
                    ctx.beginPath(); ctx.arc(X(xp), yc, 4, 0, Math.PI * 2); ctx.fill();
                    if (detail >= 2) {
                        dashed(ctx, X(xp), yc + Amax + 4, X(xp), antiY - 9, 'rgba(107,70,193,0.28)');
                        label(ctx, `A${sub(i + 1)}`, X(xp), antiY, C.violet, 11, 'center');
                    }
                });

                /* ---------- 6. P、Q、R 三個標記質點（振幅隨位置而異） ------------ */
                // 一定落在 [0, λ/4] 或 [λ/4, λ/2] 內，兩種模式都保證在弦上
                const twoNodes = (L >= lam / 2 - 1e-9);
                const marks = twoNodes
                    ? [['P', lam / 4], ['Q', lam * 5 / 16], ['R', lam * 7 / 16]]
                    : [['P', lam / 4], ['Q', lam * 3 / 16], ['R', lam / 16]];
                let vShown = false;
                /* P/Q/R 探針只在「完整」層級顯示——它們是三組線＋三個點＋三個標籤，
                 * 是這張圖最主要的視覺負擔。 */
                if (detail >= 3) marks.forEach(([nm, xp]) => {
                    const s = Math.sin(k * xp);
                    const amp = Amax * Math.abs(s);
                    const px = X(xp);
                    const yNow = yc - Amax * s * cs;
                    // 該質點的振動範圍
                    ctx.strokeStyle = 'rgba(18,49,58,0.30)'; ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px, yc - amp); ctx.lineTo(px, yc + amp);
                    ctx.moveTo(px - 4, yc - amp); ctx.lineTo(px + 4, yc - amp);
                    ctx.moveTo(px - 4, yc + amp); ctx.lineTo(px + 4, yc + amp);
                    ctx.stroke();
                    ctx.fillStyle = C.ink;
                    ctx.beginPath(); ctx.arc(px, yNow, 3.6, 0, Math.PI * 2); ctx.fill();
                    label(ctx, nm, px, yc - amp - 6, C.ink, 11, 'center');
                    // 速度箭頭：螢幕上的 dy/dt ∝ +Amax·sin(kx)·sin(ωt)
                    const vy = Amax * s * sn;
                    const len = Math.min(30, Math.abs(vy) * 0.46);
                    if (len > 3) {
                        arrow(ctx, px, yNow, px, yNow + (vy > 0 ? len : -len), C.rose, 2);
                        if (!vShown) { label(ctx, 'v', px + 6, yNow + (vy > 0 ? len : -len), C.rose, 10); vShown = true; }
                    }
                });
                // 各波腹也畫速度箭頭（振幅最大處速度變化最明顯）
                if (detail >= 3) antis.forEach((xp) => {
                    const s = Math.sin(k * xp);
                    const yNow = yc - Amax * s * cs;
                    const vy = Amax * s * sn;
                    const len = Math.min(30, Math.abs(vy) * 0.46);
                    if (len > 3) arrow(ctx, X(xp), yNow, X(xp), yNow + (vy > 0 ? len : -len), C.rose, 1.8);
                });

                /* ---------- 7. 兩列行進波的方向箭頭（跟著波峰跑） ---------------- */
                const crestAt = (base, target) => {
                    let xc = ((base % lam) + lam) % lam;
                    xc += Math.round((target - xc) / lam) * lam;
                    if (xc < 0) xc += lam;
                    if (xc > xmax) xc -= lam;
                    return (xc >= 0 && xc <= xmax) ? xc : target;
                };
                const yArr = yc - Aph - 10;
                const cR = X(crestAt((Math.PI / 2 + phi) / k, 0.28 * xmax));
                const cLf = X(crestAt((Math.PI / 2 - phi) / k, 0.70 * xmax));
                const clampX = (v) => Math.max(x0 + 19, Math.min(x1 - 19, v));
                arrow(ctx, clampX(cR) - 15, yArr, clampX(cR) + 16, yArr, RIGHT_COL, 2);
                arrow(ctx, clampX(cLf) + 15, yArr, clampX(cLf) - 16, yArr, LEFT_COL, 2);

                /* ---------- 8. 三條關鍵尺寸線 ------------------------------------ */
                if (detail >= 3) dimBar(0, lam, rowL, 'λ', '一個完整波長', DIM_COL);
                if (detail >= 2) {
                    dimBar(0, lam / 2, rowH, 'λ/2', '相鄰兩波節間距', DIM_COL);
                    dimBar(lam / 2, 3 * lam / 4, rowQ, 'λ/4', '波節到相鄰波腹', DIM_COL);
                }

                /* ---------- 9. 弦長 L 與駐波條件 -------------------------------- */
                dimBar(0, L, brkY, `L = ${L.toFixed(1)} m`, null, C.ink);
                const formTxt = one
                    ? pick([`一端自由：固定端為波節、自由端為波腹　L = m·λ/4，m = ${m}（只能取奇數）`,
                            `一端自由：L = m·λ/4，m = ${m}（只能取奇數）`,
                            `一端自由：L = m·λ/4，m = ${m}`], span, 11)
                    : pick([`兩端固定：兩端都是波節　L = n·λ/2，n = ${m}　λ = 2L/n = ${lam.toFixed(3)} m`,
                            `兩端固定：兩端都是波節　L = n·λ/2，n = ${m}`,
                            `兩端固定：L = n·λ/2，n = ${m}`], span, 11);
                label(ctx, formTxt, x0, formY, C.ink, 11);

                /* ---------- 10. P、Q、R 的振幅比較 ------------------------------ */
                const ampOf = (xp) => (2 * Math.abs(Math.sin(k * xp))).toFixed(2);
                const base = `P ${ampOf(marks[0][1])}A　Q ${ampOf(marks[1][1])}A　R ${ampOf(marks[2][1])}A`;
                /* 探針沒畫出來時就不要列它們的振幅，否則畫面上找不到 P/Q/R */
                if (detail >= 3) {
                    const infoTxt = pick([`${base}　← 振幅隨位置而異，波腹處 2A 是行進波振幅 A 的兩倍`,
                                          `${base}　← 波腹 2A ＝ 行進波的兩倍`,
                                          base], span, 11);
                    label(ctx, infoTxt, x0, infoY, C.ink, 11);
                } else {
                    label(ctx, pick(['波腹的振幅 2A，是單一列行進波振幅 A 的兩倍；波節恆為 0',
                                     '波腹 2A ＝ 行進波振幅的兩倍；波節恆為 0',
                                     '波腹 2A、波節 0'], span, 11), x0, infoY, C.ink, 11);
                }

                /* ---------- 11. T/8 時間軸 -------------------------------------- */
                const rTxt = `t = ${step8}T/8`;
                const wL2 = tw('一週期 T', 10.5), wR2 = tw(rTxt, 11);
                const ta = x0 + wL2 + 8, tb = x1 - wR2 - 8;
                label(ctx, '一週期 T', x0, trackY + 4, C.muted, 10.5);
                label(ctx, rTxt, x1, trackY + 4, flat ? C.orange : C.cyan, 11, 'right');
                if (tb - ta > 40) {
                    ctx.strokeStyle = 'rgba(18,49,58,0.22)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(ta, trackY); ctx.lineTo(tb, trackY); ctx.stroke();
                    for (let j = 0; j <= 8; j++) {
                        const tx = ta + (tb - ta) * j / 8;
                        const hot = (j === 2 || j === 6);
                        ctx.strokeStyle = hot ? C.orange : 'rgba(18,49,58,0.30)';
                        ctx.lineWidth = hot ? 2 : 1;
                        ctx.beginPath(); ctx.moveTo(tx, trackY - (hot ? 7 : 4)); ctx.lineTo(tx, trackY + (hot ? 7 : 4)); ctx.stroke();
                    }
                    ctx.fillStyle = C.cyan;
                    ctx.beginPath(); ctx.arc(ta + (tb - ta) * frac, trackY, 4, 0, Math.PI * 2); ctx.fill();
                }

                /* ---------- 12. 觀念即時通提示框 ------------------------------- */
                ctx.fillStyle = flat ? 'rgba(201,117,15,0.13)' : 'rgba(18,49,58,0.045)';
                ctx.strokeStyle = flat ? C.orange : 'rgba(18,49,58,0.16)';
                ctx.lineWidth = flat ? 1.8 : 1;
                ctx.beginPath(); ctx.rect(x0, boxY, span, boxH); ctx.fill(); ctx.stroke();
                let lines, col;
                if (flat) {
                    col = C.orange;
                    lines = [
                        `⚠ 此刻 t = ${sn > 0 ? 2 : 6}T/8：合成波剛好成一直線`,
                        '除波節外，各點通過平衡位置、速率達各自最大值',
                        '千萬別答「靜止」！橘色箭頭就是它們現在的速度'
                    ];
                } else if (peak) {
                    col = C.cyan;
                    lines = [
                        `此刻 t = ${step8}T/8：合成波到達最大位移`,
                        '各質點瞬間速度為零（橘色箭頭消失）',
                        '波形只是在包絡線內原地伸縮，並沒有前進'
                    ];
                } else {
                    col = C.ink;
                    lines = [
                        `t = ${step8}T/8　合成波 y = 2A sin(kx)·cos(ωt)`,
                        '淡青色殘影＝前幾個時刻的波形：零點位置完全不變',
                        '波節永遠不動，波腹上下振幅最大，等於 2A'
                    ];
                }
                const short = [
                    lines[0],
                    pick([lines[1], lines[1].slice(0, 14)], span - 20, 11),
                    pick([lines[2], lines[2].slice(0, 14)], span - 20, 11)
                ];
                label(ctx, pick([short[0], short[0].slice(0, 16)], span - 20, 12), x0 + 10, boxY + 19, col, 12);
                label(ctx, short[1], x0 + 10, boxY + 37, C.ink, 11);
                label(ctx, short[2], x0 + 10, boxY + 54, C.ink, 11);

                /* ---------- 13. 上方圖例 --------------------------------------- */
                const longs = [[RIGHT_COL, true, '向右行進波'], [LEFT_COL, true, '向左行進波'], [C.cyan, false, '合成波（駐波）'], [C.violet, false, '包絡線 ±2A']];
                const shorts = [[C.blue, true, '右行波'], [C.green, true, '左行波'], [C.cyan, false, '合成波'], [C.violet, false, '包絡線']];
                const widthOf = (arr) => arr.reduce((a, it) => a + 20 + 4 + tw(it[2], 10.5) + 12, 0);
                const items = widthOf(longs) <= span ? longs : shorts;
                let lx = x0;
                items.forEach((it) => {
                    if (lx + 24 > x1) return;
                    ctx.strokeStyle = it[0]; ctx.lineWidth = it[1] ? 1.6 : 2.6;
                    if (it[1]) ctx.setLineDash([5, 4]);
                    ctx.beginPath(); ctx.moveTo(lx, legY - 4); ctx.lineTo(lx + 18, legY - 4); ctx.stroke();
                    ctx.setLineDash([]);
                    label(ctx, it[2], lx + 23, legY, it[0], 10.5);
                    lx += 20 + 4 + tw(it[2], 10.5) + 12;
                });
            }
        };
        LABS.longitudinal = {
            name: '縱波：空氣分子、位移與壓力',
            cycle: 3.0,
            tag: 'N09',
            hint: '四層上下對齊：① 未振動前等間距的分子 ②某瞬間被推擠後的實際位置（彩色追蹤分子上的箭頭＝相對原位置移動的方向與大小）③位移 Δx–位置 x 圖 ④壓力變化 ΔP–位置 x 圖。貫穿四層的彩色虛線指出：紅＝密部正中央、藍＝疏部正中央、綠／紫＝疏密間中央。',
            note: '最容易考錯的是「位移 ≠ 振動速率」。密部中央與疏部中央的分子位移為零，但它們正通過平衡點，振動速率最大；疏密間中央位移最大，振動速率反而為零。ΔP 圖比 Δx 圖落後 λ/4：位移為零處 ΔP 量值最大，位移最大處 ΔP＝0。',
            height: 490,
            controls: [
                { key: 'lam', label: '波長 λ (cm)', min: 4, max: 12, step: 0.5, value: 6, fmt: (v) => `${v.toFixed(1)} cm（畫面寬＝12 cm）` },
                { key: 'amp', label: '位移振幅 Δx max', min: 0.02, max: 0.12, step: 0.005, value: 0.09, fmt: (v) => `${v.toFixed(3)} λ` },
                { key: 'spd', label: '波速（動畫）v (cm/s)', min: 0, max: 6, step: 0.25, value: 2.5, fmt: (v) => `${v.toFixed(2)} cm/s` }
            ],
            readouts: (p) => {
                const A = p.amp * p.lam;                                   // Δx max（cm）
                const f = p.spd / Math.max(p.lam, 1e-6);                   // 頻率 f = v/λ
                const vmax = 2 * Math.PI * f * A;                          // 分子最大振動速率 ωA
                return [
                    { label: '密部中央', value: `位移 0 ‧ ΔP 最大 ‧ 振動速率最大（${vmax.toFixed(2)} cm/s）` },
                    { label: '疏部中央', value: `位移 0 ‧ ΔP 最小 ‧ 振動速率最大（${vmax.toFixed(2)} cm/s）` },
                    { label: '疏密之間', value: `位移最大 ${A.toFixed(2)} cm ‧ ΔP＝0 ‧ 振動速率為 0` },
                    { label: 'Δx 圖 vs ΔP 圖', value: `相差 λ/4 ＝ ${(p.lam / 4).toFixed(2)} cm（ΔP 落後）` }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                /* ---------- 版面（以 490 px 高為基準，其餘等比縮放） ---------- */
                const S = h / 490;
                const Y = (v) => v * S;
                const F = 'Outfit, "Noto Sans TC", sans-serif';
                const x0 = 54;                                   // 左緣留給 +Δx max 等軸標
                const x1 = Math.max(x0 + 80, w - 14);
                const plotW = x1 - x0;
                const midX = (x0 + x1) / 2;

                const yT1 = Y(15), b1T = Y(24), b1B = Y(64), yTrk1 = Y(44);
                const rows1 = [Y(32), Y(44), Y(56)];
                const yT2 = Y(84), b2T = Y(93), b2B = Y(133), yTrk2 = Y(113);
                const rows2 = [Y(101), Y(113), Y(125)];
                const yArr = Y(151);
                const tierY = [Y(170), Y(186), Y(202), Y(218)];
                const yT3 = Y(240), yLam = Y(262), yDisp = Y(300), ampD = Y(28);
                const yLabD1 = Y(343), yLabD2 = Y(357);
                const yT4 = Y(378), yPres = Y(424), ampP = Y(26);

                /* ---------- 波參數：畫面寬固定代表 12 cm，因此任何 w 都看到 12/λ 個波長 ---------- */
                const pxcm = plotW / 12;
                const lamPx = Math.max(8, p.lam * pxcm);
                const k = 2 * Math.PI / lamPx;
                const Apx = Math.max(0.6, p.amp * lamPx);                  // 位移振幅（px），恆 < λ/8 故分子不會互相穿越
                const drift = (((p.spd * pxcm * t) % lamPx) + lamPx) % lamPx;  // 取模避免 t 很大時相位失去精度
                const ph = (X) => k * (X - x0 - drift);                    // 相位 φ = k(x − vt)
                const sOf = (X) => Apx * Math.sin(ph(X));                  // 位移 Δx = A sin φ，向右為正
                // ΔP ∝ −∂Δx/∂x = −Ak cos φ ⇒ φ=π（密部中央）ΔP 最大、φ=0（疏部中央）ΔP 最小

                /* 分子格點：一個波長放 M 顆（M 為 4 的倍數），使 λ/4 恰好落在某顆分子上 */
                const M = 4 * Math.min(40, Math.max(2, Math.round(lamPx / 36)));
                const d0 = lamPx / M;

                /* ---------- 小工具 ---------- */
                const tag = (text, X, yb, color, size, align, bg) => {
                    ctx.font = `${size}px ${F}`;
                    const tw = ctx.measureText(text).width;
                    let lx = X;
                    if (align === 'center') lx = X - tw / 2;
                    else if (align === 'right') lx = X - tw;
                    lx = Math.max(2, Math.min(lx, w - tw - 2));
                    if (bg) {
                        ctx.fillStyle = 'rgba(255,255,255,0.86)';
                        ctx.fillRect(lx - 3, yb - size - 1, tw + 6, size + 5);
                    }
                    label(ctx, text, lx, yb, color, size, 'left');
                    return tw;
                };
                const feat = (frac) => {                                   // 相位 φ = 2π·frac 的所有位置
                    const out = [];
                    const base = (((drift + frac * lamPx) % lamPx) + lamPx) % lamPx;
                    for (let n = 0; n < 200; n++) {
                        const X = x0 + base + n * lamPx;
                        if (X > x1 + 0.5) break;
                        out.push(X);
                    }
                    return out;
                };
                const pick = (a) => {
                    if (!a.length) return null;
                    let b = a[0];
                    for (let i = 1; i < a.length; i++) if (Math.abs(a[i] - midX) < Math.abs(b - midX)) b = a[i];
                    return b;
                };
                const rowTag = (xs, txt, col, yb) => {                     // 同一列重複標字，太擠就跳過
                    ctx.font = `10px ${F}`;
                    const tw = ctx.measureText(txt).width;
                    let last = -1e9;
                    for (let i = 0; i < xs.length; i++) {
                        const X = xs[i];
                        if (X - last < tw + 12) continue;
                        last = X;
                        tag(txt, X, yb, col, 10, 'center', true);
                    }
                };
                const band = (top, bot, tint) => {
                    ctx.fillStyle = tint;
                    ctx.fillRect(x0, top, plotW, bot - top);
                    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
                    ctx.strokeRect(x0 + 0.5, top + 0.5, Math.max(1, plotW - 1), Math.max(1, bot - top - 1));
                };
                const molecules = (yrows, displaced) => {                  // 一次成路徑再填，維持 60 fps
                    ctx.fillStyle = 'rgba(18,49,58,0.48)';
                    ctx.beginPath();
                    const from = displaced ? -(Apx + d0) : 0;
                    const to = plotW + (displaced ? Apx + d0 : 0);
                    let guard = 0;
                    for (let u = from; u <= to + 1e-6; u += d0) {
                        if (++guard > 700) break;
                        const xe = x0 + u;
                        const X = displaced ? xe + sOf(xe) : xe;
                        if (X < x0 - 0.5 || X > x1 + 0.5) continue;
                        for (let r = 0; r < yrows.length; r++) {
                            ctx.moveTo(X + 1.7, yrows[r]);
                            ctx.arc(X, yrows[r], 1.7, 0, Math.PI * 2);
                        }
                    }
                    ctx.fill();
                };
                const bead = (X, yc, col, r) => {
                    ctx.fillStyle = col;
                    ctx.beginPath(); ctx.arc(X, yc, r, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.1; ctx.stroke();
                };

                /* 追蹤分子：每 λ/4 一顆，紅／橘／紫交替 */
                const trackCol = [C.rose, C.orange, C.violet];
                const tracked = [];
                for (let n = 0; n < 200; n++) {
                    const u = n * lamPx / 4;
                    if (u > plotW + 1e-6) break;
                    tracked.push({ xe: x0 + u, col: trackCol[n % 3] });
                }

                /* 四種特徵位置（φ = 0, π/2, π, 3π/2） */
                const Xrare = feat(0.00);      // 疏部正中央：Δx=0、ΔP 最小
                const Xrite = feat(0.25);      // 疏密間中央：Δx=+A（向右）、ΔP=0
                const Xcomp = feat(0.50);      // 密部正中央：Δx=0、ΔP 最大
                const Xleft = feat(0.75);      // 疏密間中央：Δx=−A（向左）、ΔP=0

                /* ---------- ①② 分子帶底色 ---------- */
                band(b1T, b1B, 'rgba(11,111,146,0.05)');
                band(b2T, b2B, 'rgba(11,111,146,0.05)');
                for (let X = x0; X < x1; X += 4) {                         // 密部加淡紅底，強化密度差
                    const c = -Math.cos(ph(Math.min(X + 2, x1)));
                    if (c > 0.02) {
                        ctx.fillStyle = `rgba(194,38,74,${(0.15 * c).toFixed(3)})`;
                        ctx.fillRect(X, b2T + 1, Math.min(4, x1 - X), b2B - b2T - 2);
                    }
                }

                /* ---------- 貫穿四層的特徵虛線 ---------- */
                const yLineBot = yPres + ampP + Y(10);
                const drawLines = (xs, col) => { for (let i = 0; i < xs.length; i++) dashed(ctx, xs[i], b1T, xs[i], yLineBot, col); };
                drawLines(Xrare, 'rgba(11,111,146,0.40)');
                drawLines(Xrite, 'rgba(18,128,92,0.38)');
                drawLines(Xcomp, 'rgba(194,38,74,0.42)');
                drawLines(Xleft, 'rgba(107,70,193,0.36)');

                /* 追蹤分子「原位置」的細虛線：從①拉到位移箭頭列 */
                for (let i = 0; i < tracked.length; i++) {
                    dashed(ctx, tracked[i].xe, yTrk1 + 6, tracked[i].xe, yArr - 6, 'rgba(18,49,58,0.16)');
                }

                /* ---------- ① 未振動前分子的位置 ---------- */
                molecules(rows1, false);
                for (let i = 0; i < tracked.length; i++) bead(tracked[i].xe, yTrk1, tracked[i].col, 3.4);

                /* ---------- ② 振動後某瞬間分子的位置 ---------- */
                molecules(rows2, true);
                for (let i = 0; i < tracked.length; i++) {
                    const X = tracked[i].xe + sOf(tracked[i].xe);
                    if (X < x0 - 1 || X > x1 + 1) continue;
                    bead(X, yTrk2, tracked[i].col, 3.4);
                }

                /* 位移箭頭列：由原位置指向現在位置 */
                for (let i = 0; i < tracked.length; i++) {
                    const xe = tracked[i].xe;
                    const X = xe + sOf(xe);
                    ctx.strokeStyle = 'rgba(18,49,58,0.30)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(xe, yArr - 6); ctx.lineTo(xe, yArr + 6); ctx.stroke();
                    if (X < x0 - 1 || X > x1 + 1) continue;
                    if (Math.abs(X - xe) >= 2.5) {
                        arrow(ctx, xe, yArr, X, yArr, tracked[i].col, 1.7);
                    } else {
                        ctx.fillStyle = tracked[i].col;
                        ctx.beginPath(); ctx.arc(xe, yArr, 2.6, 0, Math.PI * 2); ctx.fill();
                    }
                }
                label(ctx, '位移箭頭', 4, yArr + 4, C.muted, 10);

                /* ---------- 四個關鍵文字方塊（各佔一列，永不互相重疊） ---------- */
                const tiers = [
                    { X: pick(Xcomp), col: C.rose,   txt: '密部正中央：分子位移為零、振動速率最大' },
                    { X: pick(Xrite), col: C.green,  txt: '疏密間中央：位移最大（向右）、速率為零' },
                    { X: pick(Xrare), col: C.blue,   txt: '疏部正中央：分子位移為零、振動速率最大' },
                    { X: pick(Xleft), col: C.violet, txt: '疏密間中央：位移最大（向左）、速率為零' }
                ];
                for (let i = 0; i < tiers.length; i++) {
                    const d = tiers[i];
                    if (d.X === null) continue;
                    ctx.font = `10px ${F}`;
                    const bw = ctx.measureText(d.txt).width + 22;
                    const bh = Y(14);
                    const bx = Math.max(2, Math.min(d.X - bw / 2, w - bw - 2));
                    const by = tierY[i] - bh / 2;
                    ctx.fillStyle = 'rgba(255,255,255,0.93)';
                    ctx.fillRect(bx, by, bw, bh);
                    ctx.strokeStyle = d.col; ctx.lineWidth = 1;
                    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, Math.max(1, bh - 1));
                    ctx.fillStyle = d.col;
                    ctx.fillRect(bx + 4, by + 3, 5, Math.max(1, bh - 6));
                    label(ctx, d.txt, bx + 14, by + bh - Y(4), C.ink, 10);
                }

                /* ---------- ③ 位移 Δx – 位置 x ---------- */
                dashed(ctx, x0, yDisp - ampD, x1, yDisp - ampD, 'rgba(18,49,58,0.22)');
                dashed(ctx, x0, yDisp + ampD, x1, yDisp + ampD, 'rgba(18,49,58,0.22)');
                arrow(ctx, x0, yDisp, x1, yDisp, 'rgba(18,49,58,0.35)', 1);
                arrow(ctx, x0, yDisp + ampD + 4, x0, yDisp - ampD - 4, 'rgba(18,49,58,0.35)', 1);
                ctx.strokeStyle = C.blue; ctx.lineWidth = 2.2; ctx.beginPath();
                for (let X = x0; X <= x1; X += 2) {
                    const Yc = yDisp - ampD * Math.sin(ph(X));             // 向右為正 ⇒ 畫面向上
                    if (X === x0) ctx.moveTo(X, Yc); else ctx.lineTo(X, Yc);
                }
                ctx.stroke();
                tag('Δx', x0 - 6, yDisp - ampD - Y(6), C.blue, 10, 'right', false);
                tag('＋Δx max', x0 - 6, yDisp - ampD + Y(5), C.muted, 10, 'right', false);
                tag('0', x0 - 6, yDisp + Y(4), C.muted, 10, 'right', false);
                tag('－Δx max', x0 - 6, yDisp + ampD + Y(5), C.muted, 10, 'right', false);
                tag('x', x1 - 2, yDisp + Y(13), C.muted, 10, 'right', true);

                /* 波長 λ 尺寸線：由一個疏部中央量到下一個疏部中央 */
                let Xa = x0;
                for (let i = 0; i < Xrare.length; i++) { if (Xrare[i] + lamPx <= x1 + 0.5) { Xa = Xrare[i]; break; } }
                const Xb = Math.min(Xa + lamPx, x1);
                ctx.font = `10px ${F}`;
                const lw = ctx.measureText('波長 λ').width;
                const lmid = (Xa + Xb) / 2;
                ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(Xa, yLam - 5); ctx.lineTo(Xa, yLam + 5);
                ctx.moveTo(Xb, yLam - 5); ctx.lineTo(Xb, yLam + 5);
                ctx.stroke();
                if (Xb - Xa > lw + 22) {
                    arrow(ctx, lmid - lw / 2 - 5, yLam, Xa, yLam, C.muted, 1);
                    arrow(ctx, lmid + lw / 2 + 5, yLam, Xb, yLam, C.muted, 1);
                    tag('波長 λ', lmid, yLam + Y(4), C.ink, 10, 'center', true);
                } else {
                    arrow(ctx, Xa, yLam, Xb, yLam, C.muted, 1);
                    tag('λ', lmid, yLam - Y(5), C.ink, 10, 'center', true);
                }
                rowTag(Xcomp, '密部中央', C.rose, yLabD1);
                rowTag(Xrare, '疏部中央', C.blue, yLabD2);

                /* ---------- ④ 壓力變化 ΔP – 位置 x（比 Δx 落後 λ/4） ---------- */
                dashed(ctx, x0, yPres - ampP, x1, yPres - ampP, 'rgba(18,49,58,0.22)');
                dashed(ctx, x0, yPres + ampP, x1, yPres + ampP, 'rgba(18,49,58,0.22)');
                arrow(ctx, x0, yPres, x1, yPres, 'rgba(18,49,58,0.35)', 1);
                arrow(ctx, x0, yPres + ampP + 4, x0, yPres - ampP - 4, 'rgba(18,49,58,0.35)', 1);
                ctx.strokeStyle = C.rose; ctx.lineWidth = 2.2; ctx.beginPath();
                for (let X = x0; X <= x1; X += 2) {
                    const Yc = yPres + ampP * Math.cos(ph(X));             // ΔP ∝ −cos φ ⇒ 畫面上為正
                    if (X === x0) ctx.moveTo(X, Yc); else ctx.lineTo(X, Yc);
                }
                ctx.stroke();
                tag('ΔP', x0 - 6, yPres - ampP - Y(6), C.rose, 10, 'right', false);
                tag('＋ΔP max', x0 - 6, yPres - ampP + Y(5), C.muted, 10, 'right', false);
                tag('0', x0 - 6, yPres + Y(4), C.muted, 10, 'right', false);
                tag('－ΔP max', x0 - 6, yPres + ampP + Y(5), C.muted, 10, 'right', false);
                tag('x', x1 - 2, yPres + Y(13), C.muted, 10, 'right', true);
                const Pc = pick(Xcomp), Pr = pick(Xrare), Pm = pick(Xrite);
                if (Pc !== null) tag('ΔP 最大', Pc, yPres - ampP - Y(5), C.rose, 10, 'center', true);
                if (Pr !== null) tag('ΔP 最小', Pr, yPres + ampP + Y(14), C.blue, 10, 'center', true);
                if (Pm !== null) tag('ΔP＝0', Pm, yPres - Y(5), C.green, 10, 'center', true);
                tag('ΔP 圖比 Δx 圖落後 λ/4', x1, Y(483), C.muted, 10, 'right', false);

                /* ---------- 各層標題與波前進方向 ---------- */
                /* 這一行與右側的「波前進方向」共用同一列，窄畫布放不下就自動縮字 */
                labelFit(ctx, '① 未振動前：等間距', 4, yT1, C.ink, 12, 'left',
                         { maxW: w * 0.56, min: 10, clampW: w });
                labelFit(ctx, '② 振動後的位置（箭頭表示位移）', 4, yT2, C.ink, 12, 'left', { maxW: w - 8, min: 10, clampW: w });
                labelFit(ctx, '③ 位移 Δx–位置 x（右正、左負）', 4, yT3, C.blue, 12, 'left', { maxW: w - 8, min: 10, clampW: w });
                label(ctx, '④ 壓力變化 ΔP – 位置 x 關係圖', 4, yT4, C.rose, 12);
                if (plotW > 150) {
                    tag('波前進方向', x1, Y(11), C.violet, 10, 'right', true);
                    arrow(ctx, x1 - 44, Y(18), x1 - 2, Y(18), C.violet, 1.6);
                }
            }
        };
