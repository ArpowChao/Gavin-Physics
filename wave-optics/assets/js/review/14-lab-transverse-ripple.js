// 互動實驗：橫波、水波槽
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 1. 橫波：行進波與質點振動 ---------------------------------------- */
        LABS.transverse = {
            name: '橫波：行進波與質點振動',
            cycle: (p) => 1 / Math.max(p.f, 0.05),          // 一個完整週期 T
            tag: 'N01 / N02',
            hint: '上圖是 y–x 圖（橫軸位置，讀波長 λ），下圖是被觀察質點的 y–t 圖（橫軸時間，讀週期 T）。橘色虛線是「把波形往前平移一小段」的鬼影——比較實線與鬼影的高低，就知道每個質點下一刻往上還是往下，這正是大考判斷質點運動方向的標準作法。',
            note: '上圖固定同一時刻，橫軸是位置 x，用相鄰波峰間距讀波長 λ；下圖固定同一顆質點的位置，橫軸是時間 t，用相鄰波峰的時間間隔讀週期 T。此小振幅橫波模型中，質點只上下振動。平衡位置速率最大，波峰、波谷處速率為零。保持「介質波速」不變、提高頻率時，波長會縮短；波形傳播速率與質點振動速率是兩個不同的量。',
            height: 420,
            controls: [
                { key: 'A', label: '振幅 A (cm)', min: 0.5, max: 3.5, step: 0.1, value: 2.2, fmt: (v) => `${v.toFixed(1)} cm` },
                { key: 'v', label: '介質波速 v (cm/s)', min: 2, max: 6, step: 0.2, value: 3.6, fmt: (v) => `${v.toFixed(1)} cm/s` },
                { key: 'f', label: '頻率 f (Hz)', min: 0.15, max: 1.2, step: 0.05, value: 0.4, fmt: (v) => `${v.toFixed(2)} Hz` },
                { key: 'px', label: '觀察質點的位置 (cm)', min: 0, max: 36, step: 0.5, value: 11, fmt: (v) => `${v.toFixed(1)} cm` }
            ],
            readouts: (p) => [
                { label: '波速 v（由介質決定）', value: `${p.v.toFixed(2)} cm/s` },
                { label: '波長 λ = v/f', value: `${(p.v / p.f).toFixed(2)} cm` },
                { label: '週期 T = 1/f', value: `${(1 / Math.max(p.f, 1e-6)).toFixed(2)} s` },
                { label: '質點最大速率 2πfA', value: `${(2 * Math.PI * p.f * p.A).toFixed(2)} cm/s` },
                { label: '把 f 調成 2 倍', value: 'v 不變、λ 變一半' }
            ],
            draw: (ctx, w, h, p, t) => {
                const SPAN_CM = 40;                                  // 畫面寬代表 40 cm
                const lam = p.v / Math.max(p.f, 1e-6);
                const xL = 34, xR = Math.max(xL + 80, w - 18);
                const pxcm = (xR - xL) / SPAN_CM;
                const yTop = h * 0.30;                               // y–x 圖的軸線
                const yBot = h * 0.82;                               // y–t 圖的軸線
                const sy = Math.min(26, (h * 0.20) / Math.max(p.A, 0.5), (h - yBot - 24) / Math.max(p.A, 0.5));
                const k = 2 * Math.PI / lam;
                const om = 2 * Math.PI * p.f;
                const T = 1 / Math.max(p.f, 1e-6);
                const X = (cm) => xL + cm * pxcm;
                const yAt = (cm, tt) => p.A * Math.sin(k * cm - om * tt);

                /* ---------------- 上圖：y–x ---------------- */
                /* 標題與鬼影圖例共用同一列；窄畫布時 labelRow 會自動改成上下兩行 */
                const topRows = labelRow(ctx, xL, xR - 22, 18, 15,
                    { text: 'y–x 圖：位置 x，讀波長 λ', color: C.blue, size: 12 },
                    { text: '- - - 0.07T 之後的波形（鬼影）', color: C.orange, size: 11 });
                axis(ctx, xL, yTop, xR, yTop);
                /* 軸名靠右，先量出它的寬度，落在該範圍內的刻度數字就不畫，避免疊字 */
                ctx.font = '10px Outfit, "Noto Sans TC", sans-serif';
                const axisNameW = ctx.measureText('x (cm)').width + 8;
                for (let cm = 0; cm <= SPAN_CM; cm += 5) {
                    dashed(ctx, X(cm), yTop - 46, X(cm), yTop + 46, 'rgba(18,49,58,0.05)');
                    if (X(cm) < xR - axisNameW) label(ctx, `${cm}`, X(cm), yTop + 62, C.muted, 9, 'center');
                }
                label(ctx, 'x (cm)', xR, yTop + 62, C.muted, 10, 'right');

                // 鬼影：把波形沿傳播方向平移 0.07 個週期
                const dt = 0.07 * T;
                ctx.save(); ctx.setLineDash([5, 4]);
                ctx.strokeStyle = 'rgba(201,117,15,0.75)'; ctx.lineWidth = 1.8;
                ctx.beginPath();
                for (let i = 0; i <= 400; i++) {
                    const cm = SPAN_CM * i / 400;
                    const YY = yTop - yAt(cm, t + dt) * sy;
                    i === 0 ? ctx.moveTo(X(cm), YY) : ctx.lineTo(X(cm), YY);
                }
                ctx.stroke(); ctx.restore();

                // 現在的波形
                ctx.strokeStyle = C.blue; ctx.lineWidth = 2.6;
                ctx.beginPath();
                for (let i = 0; i <= 400; i++) {
                    const cm = SPAN_CM * i / 400;
                    const YY = yTop - yAt(cm, t) * sy;
                    i === 0 ? ctx.moveTo(X(cm), YY) : ctx.lineTo(X(cm), YY);
                }
                ctx.stroke();

                // 一整排質點：x 座標固定，只上下振動（畫在曲線之上才看得見）
                for (let cm = 1; cm <= SPAN_CM - 1; cm += 1) {
                    const YY = yTop - yAt(cm, t) * sy;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.arc(X(cm), YY, 3.1, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#0f4a5f';
                    ctx.beginPath(); ctx.arc(X(cm), YY, 2.0, 0, Math.PI * 2); ctx.fill();
                }
                // 幾顆質點畫出瞬時速度箭頭（由現在指向鬼影，長度上限 24 px）
                for (let cm = 3; cm <= SPAN_CM - 3; cm += 4) {
                    const y1 = yTop - yAt(cm, t) * sy;
                    const y2 = yTop - yAt(cm, t + dt) * sy;
                    const dy = y2 - y1;
                    if (Math.abs(dy) < 2) continue;
                    const len = Math.max(-24, Math.min(24, dy * 2.4));
                    arrow(ctx, X(cm), y1, X(cm), y1 + len, 'rgba(201,117,15,0.9)', 1.4);
                }

                // 被觀察的質點
                const pcm = Math.min(Math.max(p.px, 0), SPAN_CM);
                const PX = X(pcm), PY = yTop - yAt(pcm, t) * sy;
                dashed(ctx, PX, yTop - 52, PX, yBot + 46, 'rgba(194,38,74,0.35)');
                ctx.fillStyle = C.rose;
                ctx.beginPath(); ctx.arc(PX, PY, 6, 0, Math.PI * 2); ctx.fill();
                const vy = -p.A * om * Math.cos(k * pcm - om * t);
                if (Math.abs(vy) > 0.02) {
                    arrow(ctx, PX, PY, PX, PY - Math.sign(vy) * 30, C.rose, 2.2);
                    labelFit(ctx, vy > 0 ? '此刻向上' : '此刻向下', PX + 9, PY - Math.sign(vy) * 22, C.rose, 11, 'left', { clampW: w, maxW: 100, plate: 1 });
                } else {
                    labelFit(ctx, '此刻速率為零', PX + 9, PY - 10, C.rose, 11, 'left', { clampW: w, maxW: 100, plate: 1 });
                }

                // 波長與振幅尺寸線
                const cm0 = 1.5, cm1 = cm0 + lam;
                if (X(cm1) < xR - 4) {
                    ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2;
                    const yy = yTop + 46;
                    ctx.beginPath();
                    ctx.moveTo(X(cm0), yy); ctx.lineTo(X(cm1), yy);
                    ctx.moveTo(X(cm0), yy - 5); ctx.lineTo(X(cm0), yy + 5);
                    ctx.moveTo(X(cm1), yy - 5); ctx.lineTo(X(cm1), yy + 5);
                    ctx.stroke();
                    label(ctx, `λ = ${lam.toFixed(1)} cm`, (X(cm0) + X(cm1)) / 2, yy - 7, C.cyan, 11, 'center');
                }
                ctx.strokeStyle = C.green; ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(xL - 12, yTop); ctx.lineTo(xL - 12, yTop - p.A * sy);
                ctx.moveTo(xL - 17, yTop - p.A * sy); ctx.lineTo(xL - 7, yTop - p.A * sy);
                ctx.stroke();
                label(ctx, 'A', xL - 20, yTop - p.A * sy / 2, C.green, 11, 'right');

                // 波形前進方向
                arrow(ctx, xR - 96, yTop - 62, xR - 22, yTop - 62, C.blue, 2);
                label(ctx, '波形前進 →', xR - 96, yTop - 68, C.blue, 11);
                /* 鬼影圖例已由上方的 labelRow 一併畫出 */

                /* ---------------- 下圖：y–t ---------------- */
                const timeCaptionY = yBot - 80, timeCaptionLineH = 18;
                labelFit(ctx, `固定 x = ${pcm.toFixed(1)} cm`, xL, timeCaptionY, C.muted, 11, 'left', { maxW: xR - xL, min: 10, clampW: w });
                labelFit(ctx, 'y–t 圖：時間 t，讀週期 T', xL, timeCaptionY + timeCaptionLineH, C.rose, 12, 'left', { maxW: xR - xL - 40, min: 10, clampW: w });
                axis(ctx, xL, yBot, xR, yBot);
                const NT = 2.2;                                        // 顯示最近 2.2 個週期
                const tw2 = xR - xL;
                ctx.strokeStyle = C.rose; ctx.lineWidth = 2.4;
                ctx.beginPath();
                for (let i = 0; i <= 400; i++) {
                    const tt = t - NT * T + (NT * T) * i / 400;
                    const YY = yBot - yAt(pcm, tt) * sy;
                    i === 0 ? ctx.moveTo(xL + tw2 * i / 400, YY) : ctx.lineTo(xL + tw2 * i / 400, YY);
                }
                ctx.stroke();
                // 「現在」在最右端
                ctx.fillStyle = C.rose;
                ctx.beginPath(); ctx.arc(xR, yBot - yAt(pcm, t) * sy, 5, 0, Math.PI * 2); ctx.fill();
                labelFit(ctx, '現在', xR - 10, yBot - yAt(pcm, t) * sy - 13, C.rose, 10, 'right', { clampW: w, plate: 1 });
                // 週期尺寸線
                const pxPerT = tw2 / NT;
                const tA = xR - pxPerT * 1.6, tB = tA + pxPerT;
                if (tA > xL + 4) {
                    ctx.strokeStyle = C.violet; ctx.lineWidth = 1.2;
                    const yy = yBot + 34;
                    ctx.beginPath();
                    ctx.moveTo(tA, yy); ctx.lineTo(tB, yy);
                    ctx.moveTo(tA, yy - 5); ctx.lineTo(tA, yy + 5);
                    ctx.moveTo(tB, yy - 5); ctx.lineTo(tB, yy + 5);
                    ctx.stroke();
                    label(ctx, `T = ${T.toFixed(2)} s`, (tA + tB) / 2, yy - 7, C.violet, 11, 'center');
                }
                label(ctx, 't (s)　→', xR, yBot + 50, C.muted, 10, 'right');
                labelFit(ctx, '上圖讀波長 λ；下圖讀週期 T', xL, h - 6, C.muted, 11, 'left', { maxW: xR - xL, min: 10, clampW: w });
            }
        };
        /* 5. 水波槽：反射、折射、干涉、繞射 -------------------------------- */
        LABS.ripple = {
            name: '水波槽：反射・折射・干涉・繞射',
            cycle: 2.0,
            tag: 'N05 / N06 / N07',
            hint: '一個水波槽涵蓋 §1-6 的四個現象。反射與折射模式看得到入射線、法線與角度；干涉模式可以拖動 P 點，即時算出波程差是幾個波長，判定它落在腹線還是節線上；繞射模式則靠 d/λ 決定波散得開不開。',
            note: '本模型的靜止界面上：反射前後 λ、v、f 不變；進入淺水區 v、λ 變小，f 不變。同相、同頻且抵達振幅相等的兩波，波程差整數倍 λ 為腹點、半整數倍 λ 為節點。畫面明暗表示瞬間位移：非節線點通過平衡位置時也呈灰色，不能用單張灰色畫面判定節線。狹縫寬 a 相對波長愈小，繞射展開愈明顯；同一水區中，繞射前後波速、波長與頻率不變。',
            height: 420,
            modes: [
                { key: 'reflect', label: '反射' },
                { key: 'refract', label: '折射（深水↔淺水）' },
                { key: 'interfere', label: '干涉（雙點波源）' },
                { key: 'diffract', label: '繞射（狹縫）' }
            ],
            controls: [
                { key: 'lam', label: '波長 λ (cm)', min: 1, max: 5, step: 0.25, value: 2.5, fmt: (v) => `${v.toFixed(2)} cm`, only: ['interfere'] },
                { key: 'lam2', label: '波長 λ (px)', min: 22, max: 60, step: 2, value: 34, fmt: (v) => `${v}`, only: ['reflect', 'refract', 'diffract'] },
                { key: 'ang', label: '入射角 θ₁', min: 10, max: 70, step: 1, value: 40, fmt: (v) => `${v}°`, only: ['reflect', 'refract'] },
                { key: 'vr', label: '波速比 v淺/v深', min: 0.35, max: 0.95, step: 0.05, value: 0.6, fmt: (v) => v.toFixed(2), only: ['refract'] },
                { key: 'd', label: '波源間距 d (cm)', min: 2, max: 16, step: 0.5, value: 8, fmt: (v) => `${v.toFixed(1)} cm`, only: ['interfere'] },
                { key: 'py', label: 'P 點的位置', min: -100, max: 100, step: 1, value: 52, fmt: (v) => (v === 0 ? '中央線上' : `中央線${v > 0 ? '上' : '下'}方`), only: ['interfere'] },
                { key: 'slit', label: '狹縫寬度 d (px)', min: 14, max: 200, step: 2, value: 40, fmt: (v) => `${v}`, only: ['diffract'] }
            ],
            readouts: (p) => {
                if (p.mode === 'reflect') return [
                    { label: '反射定律', value: `θᵢ = θᵣ = ${p.ang}°` },
                    { label: '波長', value: '反射前後相同' },
                    { label: '波速・頻率', value: '皆不變（同一介質）' },
                    { label: '波前與傳播方向', value: '恆垂直' }];
                if (p.mode === 'refract') {
                    const s2 = Math.sin(rad(p.ang)) * p.vr;
                    const th2 = Math.abs(s2) <= 1 ? deg(Math.asin(s2)) : null;
                    return [
                        { label: '折射角 θ₂', value: th2 === null ? '全反射' : `${th2.toFixed(1)}°` },
                        { label: 'λ淺 / λ深 = v淺 / v深', value: p.vr.toFixed(2) },
                        { label: 'sinθ₁ / sinθ₂', value: th2 === null ? '—' : (1 / p.vr).toFixed(3) },
                        { label: '頻率', value: '兩區完全相同' }];
                }
                if (p.mode === 'interfere') {
                    const nMax = Math.floor(p.d / p.lam);
                    const mMax = Math.floor(p.d / p.lam + 0.5);
                    return [
                        { label: 'd / λ', value: (p.d / p.lam).toFixed(2) },
                        { label: '腹線總數（必為奇數）', value: `${2 * nMax + 1} 條` },
                        { label: '節線總數（必為偶數）', value: `${2 * mMax} 條` },
                        { label: '連線上相鄰節點間距', value: `${(p.lam / 2).toFixed(2)} cm（= λ/2）` }];
                }
                const r = p.slit / Math.max(p.lam2, 1);
                return [
                    { label: 'd / λ', value: r.toFixed(2) },
                    { label: '繞射明顯程度', value: r < 1.6 ? '非常明顯（近似圓形波）' : (r < 4 ? '明顯' : '不明顯，近乎直線穿越') },
                    { label: '縫後的波長', value: '不變' },
                    { label: '頻率', value: '不變' }];
            },
            draw: (ctx, w, h, p, t) => {
                const x0 = 12, x1 = Math.max(x0 + 120, w - 12), y0 = 10, y1 = h - 46;
                /* 頂端說明文字佔第一行，其他標籤一律從第二行起算，避免窄畫布下重疊 */
                const capY = y0 + 18, lineH = 18, labelY = capY + lineH;
                const TW = x1 - x0, TH = y1 - y0;
                ctx.fillStyle = 'rgba(11,111,146,0.045)';
                ctx.fillRect(x0, y0, TW, TH);
                ctx.strokeStyle = 'rgba(18,49,58,0.14)'; ctx.lineWidth = 1;
                ctx.strokeRect(x0, y0, TW, TH);
                const clipTank = () => { ctx.beginPath(); ctx.rect(x0, y0, TW, TH); ctx.clip(); };

                /* ============ 反射 ============ */
                if (p.mode === 'reflect') {
                    const lam = Math.max(p.lam2, 10);
                    const th = rad(p.ang);
                    const by = y1;                                   // 障礙物＝水槽底線
                    const ox = x0 + TW * 0.52;                       // 入射點
                    const ph = ((t * 26) % lam);
                    const drawTrain = (dirx, diry, color, lw) => {
                        // 波前垂直於射線；第 n 條波前通過 O 沿射線後退 n·λ 的位置
                        const ex = -diry, ey = dirx;
                        ctx.save(); clipTank();
                        ctx.strokeStyle = color; ctx.lineWidth = lw;
                        for (let n = -10; n <= 10; n++) {
                            const s = n * lam + ph;          // +ph：波前沿射線方向前進
                            const px = ox + dirx * s, py = by + diry * s;
                            const L = TW + TH;
                            ctx.beginPath();
                            ctx.moveTo(px - ex * L, py - ey * L);
                            ctx.lineTo(px + ex * L, py + ey * L);
                            ctx.stroke();
                        }
                        ctx.restore();
                    };
                    // 入射：往右下（dir = (sinθ, cosθ)）；反射：往右上（dir = (sinθ, −cosθ)）
                    drawTrain(Math.sin(th), Math.cos(th), 'rgba(11,111,146,0.55)', 2);
                    drawTrain(Math.sin(th), -Math.cos(th), 'rgba(107,70,193,0.5)', 1.8);

                    // 障礙物
                    ctx.strokeStyle = '#41606b'; ctx.lineWidth = 5;
                    ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x1, by); ctx.stroke();
                    for (let X = x0; X < x1; X += 10) {
                        ctx.strokeStyle = 'rgba(65,96,107,0.5)'; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(X, by + 3); ctx.lineTo(X + 7, by + 11); ctx.stroke();
                    }
                    label(ctx, '直線形障礙物（反射面）', x0 + 6, by + 24, C.muted, 11);

                    dashed(ctx, ox, by, ox, y0 + 6, 'rgba(18,49,58,0.45)');
                    label(ctx, '法線', ox + 6, labelY, C.muted, 10);
                    const R = Math.min(TH * 0.82, TW * 0.42);
                    arrow(ctx, ox - Math.sin(th) * R, by - Math.cos(th) * R, ox, by, C.blue, 2.4);
                    arrow(ctx, ox, by, ox + Math.sin(th) * R, by - Math.cos(th) * R, C.violet, 2.4);
                    /* 標籤放在箭頭端點「正上方」，不要沿射線方向偏移，否則文字會壓在線上 */
                    const rayLabelY = Math.max(labelY + lineH, by - Math.cos(th) * R - 8);
                    label(ctx, '入射線', ox - Math.sin(th) * R, rayLabelY, C.blue, 11, 'center');
                    label(ctx, '反射線', ox + Math.sin(th) * R, rayLabelY, C.violet, 11, 'center');
                    ctx.strokeStyle = 'rgba(18,49,58,0.5)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(ox, by, 40, -Math.PI / 2 - th, -Math.PI / 2); ctx.stroke();
                    ctx.beginPath(); ctx.arc(ox, by, 52, -Math.PI / 2, -Math.PI / 2 + th); ctx.stroke();
                    label(ctx, `θᵢ = ${p.ang}°`, ox - 46 - Math.sin(th) * 16, by - 48, C.blue, 11, 'right');
                    label(ctx, `θᵣ = ${p.ang}°`, ox + 58 + Math.sin(th) * 16, by - 60, C.violet, 11);
                    label(ctx, '入射角＝反射角；波長、波速、頻率都不變', x0 + 6, capY, C.ink, 12);
                    return;
                }

                /* ============ 折射 ============ */
                if (p.mode === 'refract') {
                    const lam1 = Math.max(p.lam2, 10), lam2 = lam1 * p.vr;
                    const th1 = rad(p.ang);
                    const s2 = Math.sin(th1) * p.vr;
                    const total = Math.abs(s2) > 1;
                    const th2 = total ? null : Math.asin(s2);
                    const iy = y0 + TH * 0.46;
                    const ox = x0 + TW * 0.5;
                    ctx.fillStyle = 'rgba(11,111,146,0.06)'; ctx.fillRect(x0, y0, TW, iy - y0);
                    ctx.fillStyle = 'rgba(201,117,15,0.09)'; ctx.fillRect(x0, iy, TW, y1 - iy);
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x0, iy); ctx.lineTo(x1, iy); ctx.stroke();
                    label(ctx, '深水區：波速快、波長長', x0 + 6, capY, C.blue, 12);
                    label(ctx, '淺水區（下方放厚玻璃片）：波速慢、波長短', x0 + 6, y1 - 8, C.orange, 12);

                    const ph = ((t * 26) % lam1);
                    const train = (dirx, diry, lam, phase, top, color) => {
                        const ex = -diry, ey = dirx;
                        ctx.save();
                        ctx.beginPath();
                        top ? ctx.rect(x0, y0, TW, iy - y0) : ctx.rect(x0, iy, TW, y1 - iy);
                        ctx.clip();
                        ctx.strokeStyle = color; ctx.lineWidth = 2;
                        for (let n = -12; n <= 12; n++) {
                            const s = n * lam + phase;       // +phase：入射波往界面、折射波往外
                            const px = ox + dirx * s, py = iy + diry * s;
                            const L = TW + TH;
                            ctx.beginPath();
                            ctx.moveTo(px - ex * L, py - ey * L);
                            ctx.lineTo(px + ex * L, py + ey * L);
                            ctx.stroke();
                        }
                        ctx.restore();
                    };
                    train(Math.sin(th1), Math.cos(th1), lam1, ph, true, 'rgba(11,111,146,0.6)');
                    if (!total) train(Math.sin(th2), Math.cos(th2), lam2, ph * p.vr, false, 'rgba(201,117,15,0.7)');

                    dashed(ctx, ox, y0 + 4, ox, y1 - 4, 'rgba(18,49,58,0.4)');
                    label(ctx, '法線', ox + 6, labelY, C.muted, 10);
                    const R1 = Math.min((iy - y0) * 0.85, TW * 0.34);
                    arrow(ctx, ox - Math.sin(th1) * R1, iy - Math.cos(th1) * R1, ox, iy, C.blue, 2.4);
                    ctx.strokeStyle = 'rgba(18,49,58,0.5)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(ox, iy, 38, -Math.PI / 2 - th1, -Math.PI / 2); ctx.stroke();
                    label(ctx, `θ₁ = ${p.ang}°`, ox - 44, iy - 42, C.blue, 11, 'right');
                    if (total) {
                        label(ctx, '波速比太小 ⇒ 此角度已無折射波', ox + 10, iy + 30, C.rose, 12);
                    } else {
                        const R2 = Math.min((y1 - iy) * 0.85, TW * 0.34);
                        arrow(ctx, ox, iy, ox + Math.sin(th2) * R2, iy + Math.cos(th2) * R2, C.orange, 2.4);
                        ctx.beginPath(); ctx.arc(ox, iy, 38, Math.PI / 2 - th2, Math.PI / 2); ctx.stroke();
                        label(ctx, `θ₂ = ${deg(th2).toFixed(0)}°`, ox + 44, iy + 50, C.orange, 11);
                        label(ctx, '深水 → 淺水：波速變慢 ⇒ 折射線偏向法線', x0 + 6, iy - 10, C.ink, 12);
                    }
                    return;
                }

                /* ============ 干涉 ============ */
                if (p.mode === 'interfere') {
                    const scale = TW / 24;                            // 畫面寬代表 24 cm
                    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
                    const s1 = { x: cx - p.d * scale / 2, y: cy };
                    const s2 = { x: cx + p.d * scale / 2, y: cy };
                    const lamPx = Math.max(p.lam * scale, 6);
                    const k = 2 * Math.PI / lamPx;
                    const om = 3.2;
                    const step = 4;
                    const iw = Math.ceil(TW / step) * step, ih = Math.ceil(TH / step) * step;
                    const img = ctx.createImageData(iw, ih);
                    for (let yy = 0; yy < ih; yy += step) {
                        for (let xx = 0; xx < iw; xx += step) {
                            const gx = x0 + xx, gy = y0 + yy;
                            const r1 = Math.hypot(gx - s1.x, gy - s1.y);
                            const r2 = Math.hypot(gx - s2.x, gy - s2.y);
                            const a1 = Math.cos(k * r1 - om * t) / Math.sqrt(Math.max(r1, 16));
                            const a2 = Math.cos(k * r2 - om * t) / Math.sqrt(Math.max(r2, 16));
                            const v = (a1 + a2) * 9;
                            const g = Math.max(0, Math.min(255, Math.round(150 + v * 118)));
                            for (let dy = 0; dy < step; dy++) {
                                const row = (yy + dy) * iw;
                                for (let dx = 0; dx < step; dx++) {
                                    const idx = (row + xx + dx) * 4;
                                    img.data[idx] = g * 0.86; img.data[idx + 1] = g * 0.95; img.data[idx + 2] = g;
                                    img.data[idx + 3] = 255;
                                }
                            }
                        }
                    }
                    const off = getOffscreen(iw, ih);
                    off.ctx.putImageData(img, 0, 0);
                    ctx.drawImage(off.canvas, 0, 0, iw, ih, x0, y0, TW, TH);

                    ctx.save(); clipTank();
                    // 節線（紅）與腹線（綠）：以 S1、S2 為焦點的雙曲線
                    const hyper = (aHalf, color, dash) => {
                        const c = p.d * scale / 2;
                        if (Math.abs(aHalf) >= c) return;
                        const b2 = c * c - aHalf * aHalf;
                        ctx.save();
                        if (dash) ctx.setLineDash([5, 4]);
                        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        let started = false;
                        for (let yy = -TH; yy <= TH; yy += 3) {
                            const xx = aHalf * Math.sqrt(1 + (yy * yy) / b2);
                            const PX = cx + xx, PY = cy + yy;
                            if (PX < x0 - 40 || PX > x1 + 40) { started = false; continue; }
                            started ? ctx.lineTo(PX, PY) : (ctx.moveTo(PX, PY), started = true);
                        }
                        ctx.stroke(); ctx.restore();
                    };
                    const nMax = Math.floor(p.d / p.lam);
                    for (let n = 1; n <= nMax; n++) {
                        [-1, 1].forEach((sg) => hyper(sg * n * lamPx / 2, 'rgba(18,128,92,0.8)', true));
                    }
                    const mMax = Math.floor(p.d / p.lam + 0.5);
                    for (let m = 1; m <= mMax; m++) {
                        [-1, 1].forEach((sg) => hyper(sg * (m - 0.5) * lamPx / 2, 'rgba(194,38,74,0.85)', false));
                    }
                    dashed(ctx, cx, y0, cx, y1, 'rgba(18,128,92,0.9)');

                    // P 點與波程差作圖
                    const PY = cy - (p.py / 100) * (TH * 0.42);
                    const PX = cx + TW * 0.34;
                    const r1 = Math.hypot(PX - s1.x, PY - s1.y);
                    const r2 = Math.hypot(PX - s2.x, PY - s2.y);
                    const dl = Math.abs(r1 - r2) / lamPx;             // 波程差（單位：λ）
                    ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(PX, PY);
                    ctx.moveTo(s2.x, s2.y); ctx.lineTo(PX, PY); ctx.stroke();
                    ctx.restore();

                    [s1, s2].forEach((s, i) => {
                        ctx.fillStyle = C.rose;
                        ctx.beginPath(); ctx.arc(s.x, s.y, 5.5, 0, Math.PI * 2); ctx.fill();
                        label(ctx, `S${i + 1}`, s.x, s.y - 11, '#ffffff', 12, 'center');
                    });
                    ctx.fillStyle = '#ffb347';
                    ctx.beginPath(); ctx.arc(PX, PY, 6, 0, Math.PI * 2); ctx.fill();
                    label(ctx, 'P', PX + 9, PY - 6, '#ffb347', 13);

                    const frac = dl - Math.floor(dl);
                    const nearInt = Math.min(frac, 1 - frac) < 0.06;
                    const nearHalf = Math.abs(frac - 0.5) < 0.06;
                    const verdict = nearInt ? `腹點（第 ${Math.round(dl)} 腹線）` : (nearHalf ? `節點（第 ${Math.round(dl + 0.5)} 節線）` : '介於腹線與節線之間');
                    const vcol = nearInt ? '#7bf0c2' : (nearHalf ? '#ffb3c6' : '#ffffff');
                    /* 左上的讀數面板與右上的圖例面板：寬度依畫布分配，
                     * 三行讀數用同一個行高堆疊，不再各自寫死 y（守則 §3）。 */
                    const legendW = Math.min(186, TW * 0.44);
                    const wide = TW >= 520;                    // 夠寬才並排，否則圖例讓到下一段
                    const readW = Math.min(300, wide ? TW - legendW - 22 : TW - 12);
                    const lineH = 18;
                    ctx.fillStyle = 'rgba(8,30,38,0.82)';
                    ctx.fillRect(x0 + 6, y0 + 6, readW, 3 * lineH + 12);
                    [[`波程差 Δℓ = |PS₁ − PS₂| = ${(Math.abs(r1 - r2) / scale).toFixed(2)} cm`, '#e6f4f7'],
                     [`Δℓ / λ = ${dl.toFixed(2)}`, '#e6f4f7'],
                     [`⇒ P 為 ${verdict}`, vcol]
                    ].forEach(([txt, col], i) => {
                        labelFit(ctx, txt, x0 + 14, y0 + 24 + i * lineH, col, 12, 'left',
                                 { maxW: readW - 18 });
                    });
                    /* 圖例：寬畫布放右上角，窄畫布移到讀數面板下方，避免兩塊互相壓 */
                    const legX = wide ? x1 - 6 : x0 + 6 + legendW;
                    const legY = wide ? y0 + 6 : y0 + 6 + 3 * lineH + 16;
                    ctx.fillStyle = 'rgba(8,30,38,0.78)';
                    ctx.fillRect(legX - legendW, legY, legendW, 2 * lineH + 6);
                    labelFit(ctx, '- - - 腹線（Δℓ = nλ）', legX - 8, legY + 16, '#7bf0c2', 11, 'right',
                             { clampW: w, maxW: legendW - 16 });
                    labelFit(ctx, '—— 節線（Δℓ = (m−½)λ）', legX - 8, legY + 16 + lineH, '#ffb3c6', 11, 'right',
                             { clampW: w, maxW: legendW - 16 });
                    labelFit(ctx, '明暗＝瞬間高低；灰色不一定是節線', x0 + 6, y1 + 18, C.muted, 11, 'left', { maxW: TW - 12, min: 10, clampW: w });
                    return;
                }

                /* ============ 繞射 ============ */
                const lam = Math.max(p.lam2, 10);
                const by = y0 + TH * 0.42;                            // 障礙物所在的水平線
                const slit = Math.max(p.slit, 6);
                const cx = (x0 + x1) / 2;
                const k = 2 * Math.PI / lam;
                const om = 3.0;

                // 縫前：直線波前
                const ph = ((t * 26) % lam);
                ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, TW, by - y0); ctx.clip();
                ctx.strokeStyle = 'rgba(11,111,146,0.6)'; ctx.lineWidth = 2;
                for (let n = 0; n < 14; n++) {
                    const Y = by - lam + ph - n * lam;   // 波前往下走向狹縫
                    if (Y < y0 - 2) break;
                    ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke();
                }
                ctx.restore();

                // 縫後：把縫上的點視為同相子波源，逐塊疊加
                const NS = 13;
                const srcs = [];
                for (let i = 0; i < NS; i++) srcs.push(cx - slit / 2 + slit * i / (NS - 1));
                const step = 5;
                const bh = y1 - by;
                const iw = Math.ceil(TW / step) * step, ih = Math.ceil(bh / step) * step;
                const img = ctx.createImageData(iw, ih);
                for (let yy = 0; yy < ih; yy += step) {
                    for (let xx = 0; xx < iw; xx += step) {
                        const gx = x0 + xx, gy = by + yy;
                        let sum = 0;
                        for (let i = 0; i < NS; i++) {
                            const r = Math.hypot(gx - srcs[i], gy - by);
                            sum += Math.cos(k * r - om * t) / Math.sqrt(Math.max(r, 10));
                        }
                        const v = sum * (7 / Math.sqrt(NS));
                        const g = Math.max(0, Math.min(255, Math.round(150 + v * 110)));
                        for (let dy = 0; dy < step; dy++) {
                            const row = (yy + dy) * iw;
                            for (let dx = 0; dx < step; dx++) {
                                const idx = (row + xx + dx) * 4;
                                img.data[idx] = g * 0.86; img.data[idx + 1] = g * 0.95; img.data[idx + 2] = g;
                                img.data[idx + 3] = 255;
                            }
                        }
                    }
                }
                const off = getOffscreen(iw, ih);
                off.ctx.putImageData(img, 0, 0);
                ctx.drawImage(off.canvas, 0, 0, iw, ih, x0, by, TW, bh);

                // 障礙物與狹縫
                ctx.fillStyle = '#41606b';
                ctx.fillRect(x0, by - 5, cx - slit / 2 - x0, 10);
                ctx.fillRect(cx + slit / 2, by - 5, x1 - (cx + slit / 2), 10);
                ctx.fillStyle = C.orange;
                for (let i = 0; i < NS; i++) {
                    ctx.beginPath(); ctx.arc(srcs[i], by, 2.2, 0, Math.PI * 2); ctx.fill();
                }
                ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(cx - slit / 2, by - 16); ctx.lineTo(cx + slit / 2, by - 16);
                ctx.moveTo(cx - slit / 2, by - 21); ctx.lineTo(cx - slit / 2, by - 11);
                ctx.moveTo(cx + slit / 2, by - 21); ctx.lineTo(cx + slit / 2, by - 11);
                ctx.stroke();
                label(ctx, `d = ${slit} px`, cx, by - 25, C.orange, 11, 'center');
                ctx.fillStyle = 'rgba(255,255,255,0.86)';
                ctx.fillRect(x0 + 4, by + 6, 246, 18);
                label(ctx, '縫上每一點都是新的點波源（惠更斯原理）', x0 + 8, by + 19, '#0a2f3a', 11);
                const ratio = slit / lam;
                labelFit(ctx, `d/λ = ${ratio.toFixed(2)}：${ratio < 1.6 ? '擴散很明顯' : (ratio < 4 ? '繞射明顯' : '近直線傳播')}`,
                    x0 + 6, y0 + 18, C.ink, 12, 'left', { maxW: TW - 12, min: 10, clampW: w });
                labelFit(ctx, '繞射前後 v、f、λ 不變；波向兩側展開', x0 + 6, y1 + 18, C.muted, 11, 'left', { maxW: TW - 12, min: 10, clampW: w });
            }
        };
