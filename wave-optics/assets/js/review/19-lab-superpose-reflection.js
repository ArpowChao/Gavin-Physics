// 互動實驗：波的疊加、繩波的反射與透射
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 3. 波的疊加原理與獨立性 ------------------------------------------ */
        LABS.superpose = {
            name: '波的疊加原理與獨立性',
            tag: 'N04',
            cycle: 6.0,
            hint: '兩個脈衝相向而行。上方是即時畫面：綠色虛線是 a 波、紫色虛線是 b 波、橘色實線是兩者「位移相加」後的實際繩形。下方把整個過程拆成五格快照，一眼看完「接近 → 開始重疊 → 完全重疊 → 分開 → 各自復原」。用時間軸慢慢拖，可以停在任何一刻比較三條線。',
            note: '綠色虛線是 a 波，紫色虛線是 b 波，橘色實線才是兩者位移相加後的實際繩形。兩個必考重點：① 疊加是帶正負號的「位移相加」（向量和）；一上一下的脈衝重疊時會互相抵消，不會變高。② 波的獨立性：交會之後兩波各自維持原來的波形、振幅與行進方向繼續前進，宛如從未相遇。',
            height: 520,
            modes: [
                { key: 'constructive', label: '建設性干涉（同側）' },
                { key: 'destructive', label: '破壞性干涉（異側）' },
                { key: 'unequal', label: '不等高脈衝（大考題型）' }
            ],
            controls: [
                { key: 'wid', label: '脈衝寬度', min: 0.03, max: 0.10, step: 0.005, value: 0.055, fmt: (v) => `${(v * 100).toFixed(1)}%` },
                { key: 'amp', label: 'a 波振幅 A₁', min: 0.5, max: 1.2, step: 0.05, value: 1.0, fmt: (v) => `${v.toFixed(2)} A` }
            ],
            readouts: (p) => {
                const a1 = p.amp;
                const a2 = p.mode === 'destructive' ? -p.amp : (p.mode === 'unequal' ? p.amp * 0.55 : p.amp);
                const peak = a1 + a2;
                return [
                    { label: 'a 波振幅', value: `${a1.toFixed(2)} A（向上）` },
                    { label: 'b 波振幅', value: `${Math.abs(a2).toFixed(2)} A（${a2 >= 0 ? '向上' : '向下'}）` },
                    { label: '完全重疊時的位移', value: `${peak >= 0 ? '+' : ''}${peak.toFixed(2)} A${Math.abs(peak) < 0.02 ? '（完全抵消）' : ''}` },
                    { label: '交會之後', value: '兩波各自復原（波的獨立性）' }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const CYC = 6.0;
                const u = ((t % CYC) + CYC) % CYC / CYC;                 // 0 → 1
                const a1 = p.amp;
                const a2 = p.mode === 'destructive' ? -p.amp : (p.mode === 'unequal' ? p.amp * 0.55 : p.amp);
                const wid = Math.max(p.wid, 0.02);
                const g = (z) => Math.exp(-z * z);
                // 位置以「畫面比例」表示：a 波由左往右，b 波由右往左
                const xaOf = (uu) => 0.12 + 0.76 * uu;
                const xbOf = (uu) => 0.88 - 0.76 * uu;
                const yA = (xr, uu) => a1 * g((xr - xaOf(uu)) / wid);
                const yB = (xr, uu) => a2 * g((xr - xbOf(uu)) / wid);

                const X0 = 26, X1 = Math.max(X0 + 120, w - 16), SPAN = X1 - X0;
                const px = (xr) => X0 + xr * SPAN;

                /* ---------- 畫一列（成分波虛線 + 合成波實線） ---------- */
                const row = (yc, amp, uu, opts) => {
                    const o = opts || {};
                    axis(ctx, X0, yc, X1, yc);
                    const poly = (fn, color, lw, dash) => {
                        ctx.save();
                        if (dash) ctx.setLineDash([5, 4]);
                        ctx.strokeStyle = color; ctx.lineWidth = lw;
                        ctx.beginPath();
                        for (let i = 0; i <= 260; i++) {
                            const xr = i / 260;
                            const Y = yc - fn(xr) * amp;
                            i === 0 ? ctx.moveTo(px(xr), Y) : ctx.lineTo(px(xr), Y);
                        }
                        ctx.stroke(); ctx.restore();
                    };
                    poly((xr) => yA(xr, uu), 'rgba(18,128,92,0.85)', o.thin ? 1.2 : 1.8, true);
                    poly((xr) => yB(xr, uu), 'rgba(107,70,193,0.85)', o.thin ? 1.2 : 1.8, true);
                    poly((xr) => yA(xr, uu) + yB(xr, uu), '#e08a12', o.thin ? 2.0 : 3.2, false);
                    if (o.arrows) {
                        const ax = px(xaOf(uu)), bx = px(xbOf(uu));
                        arrow(ctx, ax + 10, yc - amp * a1 * 0.55 - 12, ax + 46, yc - amp * a1 * 0.55 - 12, C.green, 1.8);
                        label(ctx, 'a 波', ax + 10, yc - amp * a1 * 0.55 - 18, C.green, 11);
                        arrow(ctx, bx - 10, yc - amp * a2 * 0.55 - 12, bx - 46, yc - amp * a2 * 0.55 - 12, C.violet, 1.8);
                        label(ctx, 'b 波', bx - 10, yc - amp * a2 * 0.55 - 18, C.violet, 11, 'right');
                    }
                };

                /* ---------- 上：即時畫面 ---------- */
                const liveY = h * 0.245;
                const liveAmp = Math.min(46, h * 0.115);
                labelFit(ctx, '虛線：a、b 分波 · 橘實線：位移和', X0, 18, C.ink, 12, 'left', { maxW: SPAN, min: 10, clampW: w });
                row(liveY, liveAmp, u, { arrows: true });

                // 在重疊區標出「相加」的箭頭
                const xm = (xaOf(u) + xbOf(u)) / 2;
                if (Math.abs(xaOf(u) - xbOf(u)) < wid * 3.2) {
                    const X = px(xm);
                    const va = yA(xm, u), vb = yB(xm, u);
                    dashed(ctx, X, liveY - liveAmp * 1.25, X, liveY + liveAmp * 1.25, 'rgba(224,138,18,0.5)');
                    labelFit(ctx, `位移：${va >= 0 ? '+' : ''}${va.toFixed(2)}A ${vb >= 0 ? '+' : '−'} ${Math.abs(vb).toFixed(2)}A = ${(va + vb >= 0 ? '+' : '')}${(va + vb).toFixed(2)}A`,
                        w / 2, 44, '#b06a00', 11, 'center', { maxW: w - 32, min: 10, clampW: w });
                }

                /* ---------- 下：五格快照，看完整過程 ---------- */
                const PH = [0.10, 0.36, 0.50, 0.64, 0.90];
                const CAP = ['① 尚未相遇', '② 開始重疊', '③ 完全重疊', '④ 開始分開', '⑤ 各自復原'];
                const top = h * 0.40, bottom = h - 26;
                const gap = (bottom - top) / PH.length;
                const snapAmp = Math.min(20, gap * 0.30);
                label(ctx, '整個過程（由上而下依時間排列）', X0, top - 10, C.ink, 12);
                PH.forEach((ph, i) => {
                    const yc = top + gap * (i + 0.5);
                    row(yc, snapAmp, ph, { thin: true });
                    label(ctx, CAP[i], X0 - 4, yc - gap * 0.34, C.muted, 10);
                    // 目前時間落在哪一格就highlight
                    if (Math.abs(u - ph) < 0.06) {
                        ctx.strokeStyle = 'rgba(224,138,18,0.55)'; ctx.lineWidth = 1.4;
                        ctx.strokeRect(X0 - 8, yc - gap * 0.42, SPAN + 16, gap * 0.84);
                    }
                });
                /* ③ 那一列的重點說明與左側「③ 完全重疊」共用一行。
                 * 窄畫布放不下時就不畫——畫布下方的重點框已經寫了同一句話，
                 * 硬擠只會疊字。 */
                const midNote = p.mode === 'destructive' ? '③ 一上一下 ⇒ 位移互相抵消，繩子幾乎拉平（不是變高！）'
                    : (p.mode === 'unequal' ? '③ 兩波高度不同 ⇒ 相加後仍有殘餘位移' : '③ 同側相加 ⇒ 位移變大');
                ctx.font = '10px Outfit, "Noto Sans TC", sans-serif';
                const capW = ctx.measureText(CAP[2]).width;
                if (ctx.measureText(midNote).width + capW + 20 <= SPAN) {
                    label(ctx, midNote, X1 - 4, top + gap * 2 + gap * 0.5 - gap * 0.34,
                          p.mode === 'destructive' ? C.rose : C.green, 10, 'right');
                }
                labelFit(ctx, '交會後各波復原：波的獨立性', X0, h - 6, C.muted, 11, 'left', { maxW: SPAN, min: 10, clampW: w });
            }
        };
        /* 2. 繩波的反射與透射 --------------------------------------------- */
        LABS.reflection = {
            name: '繩波的反射與透射',
            tag: 'N03',
            cycle: (p) => p.source === 'periodic' ? 2.4 : 7.0,
            hint: '先選擇<b>單一脈衝</b>或<b>連續週期波</b>。繩子的線寬直接代表線密度：細繩＝線密度小、粗繩＝線密度大。入射波（藍虛線）與反射波（紫虛線）同時存在，實線是兩者「位移相加」後的實際繩形。右上角的小圖是端點（或交界）的位移隨時間變化；用時間軸和慢速播放觀察最清楚。',
            note: '本模型張力固定，線密度較大時波速較慢；畫面粗繩表示線密度較大，細繩表示線密度較小。反射波其實就是「鏡像波」：把入射波以端點為鏡面左右翻轉，固定端再上下顛倒（反射係數 −1）、自由端不顛倒（+1）。週期波穿越兩繩交界時頻率不變，波速較慢的一側波長也較短。',
            height: 340,
            modes: [
                { key: 'fixed', label: '固定端（牆）' },
                { key: 'free', label: '自由端（小環）' },
                { key: 'l2h', label: '輕繩 → 重繩' },
                { key: 'h2l', label: '重繩 → 輕繩' }
            ],
            controls: [
                {
                    key: 'source',
                    label: '波源類型',
                    options: [
                        { value: 'pulse', label: '單一脈衝波' },
                        { value: 'periodic', label: '連續週期波' }
                    ],
                    value: 'pulse',
                    fmt: (v) => v === 'periodic' ? '連續週期波' : '單一脈衝波'
                },
                { key: 'ratio', label: '兩段繩的線密度比 μ₂/μ₁', min: 2, max: 9, step: 1, value: 4, only: ['l2h', 'h2l'], fmt: (v) => `${v} : 1` }
            ],
            readouts: (p) => {
                if (p.mode === 'fixed') return [
                    { label: '反射係數 r', value: '−1（上下顛倒）' },
                    { label: '端點位移', value: '恆為零（入射＋反射剛好抵消）' },
                    { label: '反射波左右', value: '相反（鏡像）' },
                    { label: '等效於', value: '接重繩（μ₂ → ∞）' }];
                if (p.mode === 'free') return [
                    { label: '反射係數 r', value: '＋1（不顛倒）' },
                    { label: '端點最大位移', value: '2A（入射＋反射同號相加）' },
                    { label: '反射波左右', value: '相反（鏡像）' },
                    { label: '等效於', value: '接輕繩（μ₂ → 0）' }];
                const ratio = p.mode === 'l2h' ? p.ratio : 1 / p.ratio;   // μ₂/μ₁
                const r = (1 - Math.sqrt(ratio)) / (1 + Math.sqrt(ratio));
                const speedRatio = Math.sqrt(1 / ratio);
                return [
                    { label: '反射係數 r', value: `${r.toFixed(2)}（${r < 0 ? '上下顛倒' : '不顛倒'}）` },
                    { label: '透射係數 t = 1 + r', value: (1 + r).toFixed(2) },
                    { label: '透射波波速', value: speedRatio < 1 ? `變慢（× ${speedRatio.toFixed(2)}）` : `變快（× ${speedRatio.toFixed(2)}）` },
                    p.source === 'periodic'
                        ? { label: '頻率／波長', value: `f 不變；λ₂ = ${speedRatio.toFixed(2)} λ₁` }
                        : { label: '脈衝空間寬度', value: `變為 ${speedRatio.toFixed(2)} 倍` }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const isPeriodic = p.source === 'periodic';
                const CYC = isPeriodic ? 2.4 : 7.0;
                const mid = h * (w < 520 ? 0.72 : 0.60);
                const twoRope = (p.mode === 'l2h' || p.mode === 'h2l');
                const bx = Math.max(w * 0.62, 190);              // 端點／交界的位置
                const A = 26;

                /* 不對稱脈衝：前緣（u>0）陡、後緣（u<0）緩，反射後的「左右相反」才看得出來 */
                const FRONT = 13, BACK = 38;
                const shape = (u) => {
                    const sgm = u >= 0 ? FRONT : BACK;
                    const z = u / sgm;
                    return z * z > 20 ? 0 : Math.exp(-z * z);
                };

                /* 反射係數 r 與透射係數 t（張力相同，阻抗 ∝ √μ） */
                const ratio = twoRope ? (p.mode === 'l2h' ? Math.max(p.ratio, 1.01) : 1 / Math.max(p.ratio, 1.01)) : null;
                const rCoef = p.mode === 'fixed' ? -1
                    : p.mode === 'free' ? 1
                        : (1 - Math.sqrt(ratio)) / (1 + Math.sqrt(ratio));
                const tCoef = 1 + rCoef;
                const speed2 = twoRope ? Math.sqrt(1 / ratio) : 1;      // v₂ / v₁

                /* 入射脈衝中心 c 連續前進；反射波用「鏡像波」表示，兩者隨時同時存在 */
                const u01 = (((t % CYC) + CYC) % CYC) / CYC;
                const cStart = 10 - 3.4 * BACK;
                const cEndRefl = 2 * bx - 10 + 3.4 * BACK;
                const cEndTrans = twoRope ? bx + (w + 3.4 * BACK * speed2 - bx) / Math.max(speed2, 0.05) : -Infinity;
                const cEnd = Math.max(cEndRefl, cEndTrans);
                const c = cStart + u01 * (cEnd - cStart);

                /* 週期波使用穩態正弦波。透射側的空間座標除以 v₂/v₁，
                 * 因此頻率不變，而波長會依波速同比例改變。 */
                const LAMBDA = 82;
                const kWave = 2 * Math.PI / LAMBDA;
                const omega = 2 * Math.PI / CYC;
                const harmonic = (coord, time = t) => Math.sin(kWave * coord - omega * time);
                const profile = (coord) => isPeriodic ? harmonic(coord) : shape(coord - c);

                const yInc = (x) => (x <= bx ? A * profile(x) : 0);
                const yRef = (x) => (x <= bx ? rCoef * A * (isPeriodic ? harmonic(2 * bx - x) : shape((2 * bx - x) - c)) : 0);   // 鏡像波
                const yTr = (x) => (twoRope && x >= bx
                    ? tCoef * A * (isPeriodic ? harmonic((x - bx) / Math.max(speed2, 0.05) + bx) : shape((x - bx) / Math.max(speed2, 0.05) + bx - c))
                    : 0);
                const ySum = (x) => (x <= bx ? yInc(x) + yRef(x) : yTr(x));

                /* 繩子：線寬直接代表線密度 */
                const LW_LIGHT = 2.0, LW_HEAVY = 7.0, LW_ONE = 3.0;
                const lwLeft = twoRope ? (p.mode === 'l2h' ? LW_LIGHT : LW_HEAVY) : LW_ONE;
                const lwRight = twoRope ? (p.mode === 'l2h' ? LW_HEAVY : LW_LIGHT) : LW_ONE;

                if (twoRope) {
                    dashed(ctx, bx, mid - 66, bx, mid + 62, C.rose);
                    labelFit(ctx, p.mode === 'l2h' ? '輕繩 μ₁：快' : '重繩 μ₁：慢', 14, mid + 76, C.muted, 11, 'left', { maxW: bx - 22, min: 10, clampW: w });
                    labelFit(ctx, p.mode === 'l2h' ? '重繩 μ₂：慢' : '輕繩 μ₂：快', bx + 10, mid + 76, C.muted, 11, 'left', { maxW: w - bx - 20, min: 10, clampW: w });
                    label(ctx, '交界', bx, mid + 90, C.rose, 10, 'center');
                }
                axis(ctx, 10, mid, twoRope ? w - 10 : bx, mid);

                const curve = (fn, xa, xb, style, lw, dash) => {
                    ctx.save();
                    if (dash) ctx.setLineDash([5, 4]);
                    ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.lineCap = 'round';
                    ctx.beginPath();
                    for (let X = xa; X <= xb; X += 2) {
                        const Y = mid - fn(X);
                        X === xa ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
                    }
                    ctx.stroke(); ctx.restore();
                };
                /* 兩個成分波（隨時顯示）＋ 相加後的實際繩形 */
                curve(yInc, 10, bx, 'rgba(11,111,146,0.55)', 1.7, true);
                curve(yRef, 10, bx, 'rgba(107,70,193,0.6)', 1.7, true);
                curve(ySum, 10, bx, C.blue, lwLeft, false);
                if (twoRope) curve(ySum, bx, w - 10, C.blue, lwRight, false);

                /* 端點裝置 */
                const endY = mid - (yInc(bx) + yRef(bx));
                if (!twoRope) {
                    if (p.mode === 'fixed') {
                        ctx.fillStyle = 'rgba(18,49,58,0.22)';
                        ctx.fillRect(bx, mid - 66, 12, 132);
                        label(ctx, '固定端（牆）', bx + 17, mid + 60, C.rose, 11);
                    } else {
                        ctx.strokeStyle = 'rgba(18,49,58,0.32)'; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.moveTo(bx, mid - 66); ctx.lineTo(bx, mid + 66); ctx.stroke();
                        ctx.strokeStyle = C.rose; ctx.lineWidth = 2.4;
                        ctx.beginPath(); ctx.arc(bx, endY, 7, 0, Math.PI * 2); ctx.stroke();
                        label(ctx, '自由端（小環）', bx + 17, mid + 60, C.rose, 11);
                    }
                }

                /* 行進方向箭頭：入射在 c、反射在鏡像位置 2bx−c、透射在 bx+speed2·(c−bx) */
                const cRef = 2 * bx - c;
                const cTr = bx + speed2 * (c - bx);
                if (isPeriodic) {
                    const incX = Math.max(52, bx * 0.34);
                    arrow(ctx, incX, mid - 50, incX + 34, mid - 50, C.blue, 1.8);
                    label(ctx, '入射週期波', incX, mid - 56, C.blue, 11);
                    arrow(ctx, bx - 42, mid + 44, bx - 76, mid + 44, C.violet, 1.8);
                    label(ctx, '反射週期波', bx - 42, mid + 40, C.violet, 11, 'right');
                    if (twoRope) {
                        arrow(ctx, bx + 18, mid - 50, bx + 52, mid - 50, C.green, 1.8);
                        label(ctx, '透射週期波', bx + 18, mid - 56, C.green, 11);
                    }
                } else {
                    if (c > 20 && c < bx - 6) {
                        arrow(ctx, c + 16, mid - 50, c + 48, mid - 50, C.blue, 1.8);
                        label(ctx, '入射波', c + 16, mid - 56, C.blue, 11);
                    }
                    if (cRef > 20 && cRef < bx - 6) {
                        arrow(ctx, cRef - 16, mid + 44, cRef - 48, mid + 44, C.violet, 1.8);
                        label(ctx, '反射波', cRef - 16, mid + 40, C.violet, 11, 'right');
                    }
                    if (twoRope && cTr > bx + 10 && cTr < w - 26) {
                        arrow(ctx, cTr + 8, mid - 50, cTr + 40, mid - 50, C.green, 1.8);
                        label(ctx, '透射波', cTr + 8, mid - 56, C.green, 11);
                    }
                }

                /* 重疊區：在幾個位置畫出「入射位移 → 再加上反射位移」的堆疊刻度，
                   讓「位移相加」不只是文字，而是看得到的線段。 */
                let ovA = null, ovB = null;
                for (let X = 14; X <= bx; X += 2) {
                    if (Math.abs(yInc(X)) > 0.07 * A && Math.abs(yRef(X)) > 0.07 * A) {
                        if (ovA === null) ovA = X;
                        ovB = X;
                    }
                }
                if (ovA !== null && ovB - ovA > 8) {
                    const N = 6;
                    for (let i = 0; i <= N; i++) {
                        const X = ovA + (ovB - ovA) * i / N;
                        const vi = yInc(X), vr = yRef(X);
                        const yI = mid - vi, yS = mid - (vi + vr);
                        if (Math.abs(yS - yI) < 2) continue;
                        ctx.strokeStyle = 'rgba(224,138,18,0.9)'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(X, yI); ctx.lineTo(X, yS); ctx.stroke();
                        ctx.strokeStyle = 'rgba(224,138,18,0.6)'; ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(X - 3.5, yI); ctx.lineTo(X + 3.5, yI);
                        ctx.moveTo(X - 3.5, yS); ctx.lineTo(X + 3.5, yS);
                        ctx.stroke();
                    }
                    ctx.fillStyle = 'rgba(255,255,255,0.85)';
                    ctx.fillRect(12, mid + 84, 268, 16);
                    label(ctx, '橘色線段＝反射波在該處「加上去」的位移', 14, mid + 96, '#b06a00', 11);
                }

                /* 端點的算式提示 */
                const overlap = isPeriodic ? 1 : Math.min(Math.abs(shape(bx - c)), 1);
                if (overlap > 0.06) {
                    const va = yInc(bx) / A, vb = yRef(bx) / A;
                    dashed(ctx, bx - 2, mid - 82, bx - 2, mid + 66, 'rgba(224,138,18,0.55)');
                    const txt = `端點：${va >= 0 ? '+' : ''}${va.toFixed(2)}A ${vb >= 0 ? '+' : '−'} ${Math.abs(vb).toFixed(2)}A = ${(va + vb >= 0 ? '+' : '')}${(va + vb).toFixed(2)}A`;
                    label(ctx, txt, bx - 8, mid - 74, '#b06a00', 11, 'right');
                }

                /* 左上：入射與反射的形狀對照 */
                const iw = Math.max(78, Math.min(148, (w - 60) * 0.26));
                const ih = 50, gap = 14, ix = 12, iy = 10;
                ctx.fillStyle = 'rgba(255,255,255,0.92)';
                ctx.strokeStyle = 'rgba(18,49,58,0.14)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.rect(ix - 7, iy - 5, iw * 2 + gap + 18, ih + 24); ctx.fill(); ctx.stroke();
                const mini = (ox, flipX, amp, color, cap) => {
                    const base = iy + ih * 0.52;
                    dashed(ctx, ox, base, ox + iw, base, 'rgba(18,49,58,0.18)');
                    ctx.strokeStyle = color; ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let k = 0; k <= iw; k += 2) {
                        const uu = (k - iw * 0.5) * (9.0 * FRONT / iw);
                        const sample = isPeriodic
                            ? Math.sin(flipX * (k / iw * 2.8 - 1.4) * Math.PI)
                            : shape(flipX * uu);
                        ctx.lineTo(ox + k, base - sample * amp * (ih * 0.38));
                    }
                    ctx.stroke();
                    labelFit(ctx, cap, ox + iw / 2, iy + ih + 8, color, 10, 'center', { maxW: iw + 4, min: 10, clampW: w });
                };
                mini(ix, 1, 1, C.blue, isPeriodic ? '入射週期波（向右）' : '入射（前緣陡）');
                mini(ix + iw + gap, -1, rCoef, C.violet,
                    isPeriodic
                        ? (rCoef < 0 ? '反射：相位反轉' : '反射：不反轉')
                        : (rCoef < 0 ? '反射：顛倒' : '反射：不顛倒'));

                /* 右上：端點（交界）位移隨時間的變化 */
                const gw = Math.max(96, Math.min(178, w * 0.24)), gh = 52;
                const gx = w - gw - 14, gy = w < 520 ? 94 : 12;
                ctx.fillStyle = 'rgba(255,255,255,0.92)';
                ctx.strokeStyle = 'rgba(18,49,58,0.14)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.rect(gx - 6, gy - 5, gw + 12, gh + 26); ctx.fill(); ctx.stroke();
                const gMid = gy + gh * 0.62;
                axis(ctx, gx, gMid, gx + gw, gMid);
                const endAt = (uu) => {
                    if (isPeriodic) return tCoef * harmonic(bx, uu * CYC);
                    const cc = cStart + uu * (cEnd - cStart);
                    return tCoef * shape(bx - cc);            // (1+r)·A·shape → 以 A 為單位
                };
                ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i <= gw; i++) {
                    const Y = gMid - endAt(i / gw) * (gh * 0.42);
                    i === 0 ? ctx.moveTo(gx, Y) : ctx.lineTo(gx + i, Y);
                }
                ctx.stroke();
                ctx.fillStyle = C.rose;
                ctx.beginPath(); ctx.arc(gx + u01 * gw, gMid - endAt(u01) * (gh * 0.42), 3.6, 0, Math.PI * 2); ctx.fill();
                label(ctx, twoRope ? '交界位移隨時間' : '端點位移隨時間', gx, gy + 8, C.muted, 10);
                label(ctx, `最大 ${tCoef.toFixed(2)}A`, gx + gw, gy + gh + 16, tCoef === 0 ? C.rose : C.orange, 10, 'right');
                if (p.mode === 'fixed') label(ctx, '恆為零', gx, gy + gh + 16, C.rose, 10);
            }
        };











