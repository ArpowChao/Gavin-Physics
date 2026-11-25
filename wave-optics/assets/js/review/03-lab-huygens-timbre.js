// 互動實驗定義（LABS）：波前與惠更斯原理、諧音疊加與音色
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* =====================================================================
         * 互動實驗：各實驗定義
         * ===================================================================*/
        const LABS = {};

        /* 4. 波前與惠更斯原理 ---------------------------------------------- */
        LABS.huygens = {
            name: '波前與惠更斯原理',
            cycle: 2.6,                                     // 子波長大一個 λ 的時間
            tag: 'N05',
            hint: '前兩個模式：條狀波源產生直線波前、點狀波源產生圓形波前，實線是波峰波前、虛線是波谷波前，綠色箭頭是傳播方向。後兩個模式：把舊波前上的每一點當成新的點波源，子波的包絡線就是新的波前。',
            note: '兩個必記結論：① 波前是「振動情形相同」的點所連成的線，不一定要是波峰或波谷。② 波的傳播方向恆與波前垂直（夾角 90°）——這是之後所有折射、繞射作圖的起點。',
            height: 360,
            modes: [
                { key: 'lineFront', label: '直線波的波前' },
                { key: 'circleFront', label: '圓形波的波前' },
                { key: 'lineHuygens', label: '惠更斯建構：直線波' },
                { key: 'circleHuygens', label: '惠更斯建構：圓形波' }
            ],
            controls: [
                { key: 'lam', label: '波長 λ (px)', min: 30, max: 80, step: 2, value: 46, fmt: (v) => `${v}` },
                { key: 'nsrc', label: '子波源數目', min: 4, max: 16, step: 1, value: 9, only: ['lineHuygens', 'circleHuygens'], fmt: (v) => `${v} 個` }
            ],
            readouts: (p) => {
                const isHuy = p.mode === 'lineHuygens' || p.mode === 'circleHuygens';
                return [
                    { label: '波前與傳播方向', value: '恆垂直（90°）' },
                    { label: '相鄰兩波峰波前', value: `相距一個波長 λ = ${p.lam} px` },
                    { label: isHuy ? '子波半徑' : '波前形狀', value: isHuy ? '每過一個週期長 λ' : (p.mode === 'circleFront' ? '同心圓' : '平行直線') },
                    { label: isHuy ? '新波前' : '波源', value: isHuy ? '所有子波的包絡線' : (p.mode === 'circleFront' ? '點狀波源' : '條狀波源') }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const lam = Math.max(p.lam, 10);
                const cyc = 2.6;                                  // 一個週期的秒數
                const phase = ((t / cyc) % 1) * lam;              // 波前在一個週期內前進的距離
                const isCircle = (p.mode === 'circleFront' || p.mode === 'circleHuygens');
                const isHuy = (p.mode === 'lineHuygens' || p.mode === 'circleHuygens');

                /* ---------- 模式一、二：純粹畫波前 ---------- */
                if (!isHuy) {
                    if (!isCircle) {
                        const x0 = 46;
                        const barY0 = h * 0.16, barY1 = h * 0.84;
                        // 條狀波源（上下振動）
                        const wob = Math.sin(2 * Math.PI * t / cyc) * 5;
                        ctx.strokeStyle = '#2b5f74'; ctx.lineWidth = 6;
                        ctx.beginPath(); ctx.moveTo(x0 - 14, barY0 + wob); ctx.lineTo(x0 - 14, barY1 + wob); ctx.stroke();
                        arrow(ctx, x0 - 30, h / 2 - 8, x0 - 30, h / 2 - 30, C.ink, 1.4);
                        arrow(ctx, x0 - 30, h / 2 + 8, x0 - 30, h / 2 + 30, C.ink, 1.4);
                        label(ctx, '條狀波源', 8, barY0 - 10, C.ink, 11);
                        label(ctx, '上下振動', 8, barY0 + 6, C.muted, 10);

                        // 波峰波前（實線＋淡藍色隆起帶）與波谷波前（虛線）
                        for (let k = 0; k < 14; k++) {
                            const X = x0 + phase + k * lam / 2;
                            if (X > w - 12) break;
                            const crest = (k % 2 === 0);
                            if (crest) {
                                const bw = lam * 0.22;
                                const g = ctx.createLinearGradient(X - bw, 0, X + bw, 0);
                                g.addColorStop(0, 'rgba(11,111,146,0)');
                                g.addColorStop(0.5, 'rgba(11,111,146,0.20)');
                                g.addColorStop(1, 'rgba(11,111,146,0)');
                                ctx.fillStyle = g;
                                ctx.fillRect(X - bw, barY0, bw * 2, barY1 - barY0);
                                ctx.strokeStyle = 'rgba(11,111,146,0.9)'; ctx.lineWidth = 2.6;
                                ctx.beginPath(); ctx.moveTo(X, barY0); ctx.lineTo(X, barY1); ctx.stroke();
                            } else {
                                dashed(ctx, X, barY0, X, barY1, 'rgba(107,70,193,0.55)');
                            }
                        }
                        // 傳播方向（與波前垂直）
                        [0.28, 0.5, 0.72].forEach((f) => {
                            arrow(ctx, x0 + 10, h * f, Math.min(w - 18, x0 + 10 + Math.max(150, (w - x0) * 0.55)), h * f, C.green, 1.8);
                        });
                        // 波長標示
                        const xa = x0 + phase, xb = xa + lam;
                        if (xb < w - 20) {
                            ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2;
                            const yy = barY1 + 20;
                            ctx.beginPath();
                            ctx.moveTo(xa, yy); ctx.lineTo(xb, yy);
                            ctx.moveTo(xa, yy - 5); ctx.lineTo(xa, yy + 5);
                            ctx.moveTo(xb, yy - 5); ctx.lineTo(xb, yy + 5);
                            ctx.stroke();
                            label(ctx, `λ`, (xa + xb) / 2, yy - 8, C.cyan, 12, 'center');
                        }
                        ctx.fillStyle = 'rgba(255,255,255,0.88)';
                        ctx.fillRect(w - 232, 6, 226, 54);
                        label(ctx, '—— 波峰波前', w - 14, 22, '#0b6f92', 11, 'right');
                        label(ctx, '- - - 波谷波前', w - 14, 38, '#6b46c1', 11, 'right');
                        label(ctx, '→ 波傳遞的方向（與波前垂直）', w - 14, 54, C.green, 10, 'right');
                        return;
                    }

                    // 圓形波
                    const sx = Math.min(90, w * 0.16), sy = h / 2;
                    const wob = Math.sin(2 * Math.PI * t / cyc) * 4;
                    ctx.fillStyle = '#2b5f74';
                    ctx.beginPath(); ctx.arc(sx, sy + wob, 6, 0, Math.PI * 2); ctx.fill();
                    arrow(ctx, sx - 22, sy - 8, sx - 22, sy - 28, C.ink, 1.4);
                    arrow(ctx, sx - 22, sy + 8, sx - 22, sy + 28, C.ink, 1.4);
                    label(ctx, '點狀波源', 8, sy - 44, C.ink, 11);
                    label(ctx, '上下振動', 8, sy - 28, C.muted, 10);

                    const rMax = Math.hypot(w - sx, h / 2) + lam;
                    for (let k = 0; k < 30; k++) {
                        const R = phase + k * lam / 2;
                        if (R > rMax) break;
                        if (R < 6) continue;
                        const crest = (k % 2 === 0);
                        ctx.save();
                        ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
                        if (crest) {
                            ctx.strokeStyle = 'rgba(11,111,146,0.14)'; ctx.lineWidth = Math.max(4, lam * 0.42);
                            ctx.beginPath(); ctx.arc(sx, sy, R, -Math.PI / 2.05, Math.PI / 2.05); ctx.stroke();
                            ctx.strokeStyle = 'rgba(11,111,146,0.85)'; ctx.lineWidth = 2.6;
                            ctx.beginPath(); ctx.arc(sx, sy, R, -Math.PI / 2.05, Math.PI / 2.05); ctx.stroke();
                        } else {
                            ctx.save(); ctx.setLineDash([5, 5]);
                            ctx.strokeStyle = 'rgba(107,70,193,0.6)'; ctx.lineWidth = 1.6;
                            ctx.beginPath(); ctx.arc(sx, sy, R, -Math.PI / 2.05, Math.PI / 2.05); ctx.stroke();
                            ctx.restore();
                        }
                        ctx.restore();
                    }
                    [-0.7, -0.35, 0, 0.35, 0.7].forEach((a) => {
                        const r0 = 16, r1 = Math.min(w - sx - 16, 150);
                        arrow(ctx, sx + Math.cos(a) * r0, sy + Math.sin(a) * r0,
                            sx + Math.cos(a) * r1, sy + Math.sin(a) * r1, C.green, 1.7);
                    });
                    const ra = phase + 4 * lam / 2, rb = ra + lam;
                    if (sx + rb < w - 16) {
                        ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2;
                        const yy = sy + h * 0.36;
                        ctx.beginPath();
                        ctx.moveTo(sx + ra, yy); ctx.lineTo(sx + rb, yy);
                        ctx.moveTo(sx + ra, yy - 5); ctx.lineTo(sx + ra, yy + 5);
                        ctx.moveTo(sx + rb, yy - 5); ctx.lineTo(sx + rb, yy + 5);
                        ctx.stroke();
                        label(ctx, 'λ', sx + ra + lam / 2, yy - 8, C.cyan, 12, 'center');
                    }
                    ctx.fillStyle = 'rgba(255,255,255,0.88)';
                    ctx.fillRect(w - 232, 6, 226, 54);
                    label(ctx, '—— 波峰波前', w - 14, 22, '#0b6f92', 11, 'right');
                    label(ctx, '- - - 波谷波前', w - 14, 38, '#6b46c1', 11, 'right');
                    label(ctx, '→ 波傳遞的方向（沿半徑，與波前垂直）', w - 14, 54, C.green, 10, 'right');
                    return;
                }

                /* ---------- 模式三、四：惠更斯建構 ---------- */
                const grow = phase;                              // 子波目前的半徑（0 → λ）
                const nsrc = Math.max(3, Math.round(p.nsrc));
                const done = grow > lam * 0.97;

                if (p.mode === 'lineHuygens') {
                    const y0 = h * 0.16, y1 = h * 0.82;
                    const xOld = Math.max(70, w * 0.24);
                    // 更早的波前（淡）
                    for (let k = 1; k <= 2; k++) {
                        const X = xOld - k * lam;
                        if (X > 12) dashed(ctx, X, y0, X, y1, 'rgba(11,111,146,0.22)');
                    }
                    // 舊波前
                    ctx.strokeStyle = 'rgba(11,111,146,0.9)'; ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(xOld, y0); ctx.lineTo(xOld, y1); ctx.stroke();
                    /* 兩個波前標籤固定分成上下兩行：舊波前在上、新波前在下。
                     * 不論畫布多窄都不會互撞，也省掉量測分支（守則 §3）。 */
                    labelFit(ctx, '舊波前（此刻的波前）', xOld - 6, y0 - 28, C.blue, 12, 'right',
                             { clampW: w, maxW: w - 8 });

                    // 子波
                    ctx.strokeStyle = 'rgba(201,117,15,0.75)'; ctx.lineWidth = 1.5;
                    for (let i = 0; i < nsrc; i++) {
                        const yy = y0 + (y1 - y0) * i / (nsrc - 1);
                        ctx.fillStyle = C.orange;
                        ctx.beginPath(); ctx.arc(xOld, yy, 3.6, 0, Math.PI * 2); ctx.fill();
                        if (grow > 1.5) {
                            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
                            ctx.beginPath(); ctx.arc(xOld, yy, grow, -Math.PI / 2, Math.PI / 2); ctx.stroke();
                            ctx.restore();
                        }
                    }
                    // 新波前＝包絡線
                    const xNew = xOld + grow;
                    if (xNew < w - 10) {
                        if (done) {
                            ctx.strokeStyle = C.green; ctx.lineWidth = 3.4;
                            ctx.beginPath(); ctx.moveTo(xNew, y0); ctx.lineTo(xNew, y1); ctx.stroke();
                        } else {
                            dashed(ctx, xNew, y0, xNew, y1, 'rgba(18,128,92,0.65)');
                        }
                        label(ctx, done ? '新波前（包絡線）' : '包絡線形成中…', Math.min(xNew + 8, w - 12), y0 - 10, C.green, 12);
                    }
                    label(ctx, '① 舊波前上的每一點 → 新的點波源', 14, h - 40, C.ink, 11);
                    label(ctx, '② 各自發出半徑相同的圓形子波（一個週期長一個 λ）', 14, h - 24, C.orange, 11);
                    label(ctx, '③ 與所有子波相切的線＝包絡線＝新的波前', 14, h - 8, C.green, 11);
                    return;
                }

                // 圓形波的惠更斯建構
                const sx = Math.min(96, w * 0.17), sy = h / 2;
                const Rold = Math.min(w * 0.30, h * 0.34);
                ctx.fillStyle = '#2b5f74';
                ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
                labelFit(ctx, '點波源', sx - 8, sy - 14, C.ink, 11, 'right', { clampW: w, plate: 1 });
                for (let k = 1; k <= 2; k++) {
                    const R = Rold - k * lam;
                    if (R > 10) {
                        ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(11,111,146,0.22)'; ctx.lineWidth = 1.4;
                        ctx.beginPath(); ctx.arc(sx, sy, R, -Math.PI / 2.1, Math.PI / 2.1); ctx.stroke(); ctx.restore();
                    }
                }
                ctx.strokeStyle = 'rgba(11,111,146,0.9)'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(sx, sy, Rold, -Math.PI / 2.1, Math.PI / 2.1); ctx.stroke();
                label(ctx, '舊波前', sx + Rold * 0.72, sy - Rold * 0.80, C.blue, 12);

                ctx.strokeStyle = 'rgba(201,117,15,0.75)'; ctx.lineWidth = 1.5;
                for (let i = 0; i < nsrc; i++) {
                    const a = -Math.PI / 2.2 + (Math.PI / 1.1) * i / (nsrc - 1);
                    const px = sx + Math.cos(a) * Rold, py = sy + Math.sin(a) * Rold;
                    ctx.fillStyle = C.orange;
                    ctx.beginPath(); ctx.arc(px, py, 3.6, 0, Math.PI * 2); ctx.fill();
                    if (grow > 1.5) {
                        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
                        ctx.beginPath(); ctx.arc(px, py, grow, a - Math.PI / 2, a + Math.PI / 2); ctx.stroke();
                        ctx.restore();
                    }
                }
                const Rnew = Rold + grow;
                ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
                if (done) {
                    ctx.strokeStyle = C.green; ctx.lineWidth = 3.4;
                    ctx.beginPath(); ctx.arc(sx, sy, Rnew, -Math.PI / 2.1, Math.PI / 2.1); ctx.stroke();
                } else {
                    ctx.save(); ctx.setLineDash([6, 5]);
                    ctx.strokeStyle = 'rgba(18,128,92,0.65)'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(sx, sy, Rnew, -Math.PI / 2.1, Math.PI / 2.1); ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
                label(ctx, done ? '新波前（包絡線）仍是圓形' : '包絡線形成中…', 14, 22, C.green, 12);
                label(ctx, '① 舊波前上的每一點 → 新的點波源', 14, h - 40, C.ink, 11);
                label(ctx, '② 各自發出半徑相同的圓形子波', 14, h - 24, C.orange, 11);
                label(ctx, '③ 包絡線＝新的波前（圓形波仍為圓形）', 14, h - 8, C.green, 11);
            }
        };

        /* 8. 諧音疊加與音色 ------------------------------------------------- */
        LABS.timbre = {
            name: '諧音疊加與音色',
            cycle: 2.62,
            tag: 'N11',
            hint: '細線是各諧音，粗線是疊加波形。先保留基音、改變泛音振幅，看波形改變而基本週期維持不變；再把基音調成 0，觀察不同組合。',
            note: '基音存在時，合成波的基本週期為 T₁。延伸觀察：只留第二諧音時週期為 T₁/2；只留第三諧音時為 T₁/3。第二、第三諧音同時存在時，最小共同週期仍為 T₁；全部振幅為 0 時沒有振動，也沒有基本頻率。',
            height: 300,
            controls: [
                { key: 'a1', label: '基音振幅', min: 0, max: 10, step: 1, value: 6, fmt: (v) => `${v}` },
                { key: 'a2', label: '第二諧音振幅', min: 0, max: 10, step: 1, value: 3, fmt: (v) => `${v}` },
                { key: 'a3', label: '第三諧音振幅', min: 0, max: 10, step: 1, value: 2, fmt: (v) => `${v}` }
            ],
            fundamentalOrder: (p) => {
                const orders = [1, 2, 3].filter((n) => Number(p[`a${n}`]) > 0);
                const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
                return orders.reduce(gcd, 0);
            },
            readouts: (p) => {
                const order = LABS.timbre.fundamentalOrder(p);
                return [
                    { label: '振幅比', value: `${p.a1} : ${p.a2} : ${p.a3}` },
                    { label: '合成波的基本頻率', value: order ? (order === 1 ? 'f₁' : `${order} f₁`) : '無（沒有振動）' },
                    { label: '合成波的基本週期', value: order ? (order === 1 ? 'T₁' : `T₁ / ${order}`) : '未定義' },
                    { label: '基音成分', value: Number(p.a1) > 0 ? '存在' : '振幅為 0' }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const x0 = 20, x1 = w - 20, span = x1 - x0;
                const top = h * 0.28, mid = h * 0.72;
                const period = span / 2;             // 畫面顯示兩個基音週期
                const k1 = 2 * Math.PI / period;
                const shift = (t * 60) % period;

                axis(ctx, x0, top, x1, top);
                const harm = [[p.a1, 1, C.blue], [p.a2, 2, C.violet], [p.a3, 3, C.orange]];
                harm.forEach(([a, n, color]) => {
                    if (a === 0) return;
                    ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.75;
                    ctx.beginPath();
                    for (let i = 0; i <= span; i += 2) ctx.lineTo(x0 + i, top - a * 4 * Math.sin(n * k1 * (i + shift)));
                    ctx.stroke(); ctx.globalAlpha = 1;
                });
                labelFit(ctx, '藍：基音　紫：2f₁　橘：3f₁', x0, top - 52, C.muted, 11, 'left',
                    { maxW: span, clampW: w });

                axis(ctx, x0, mid, x1, mid);
                ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.8; ctx.beginPath();
                for (let i = 0; i <= span; i += 2) {
                    const s = p.a1 * Math.sin(k1 * (i + shift)) + p.a2 * Math.sin(2 * k1 * (i + shift)) + p.a3 * Math.sin(3 * k1 * (i + shift));
                    ctx.lineTo(x0 + i, mid - s * 4);
                }
                ctx.stroke();
                label(ctx, '疊加後的波形（決定音色）', x0, mid - 62, C.cyan, 12);

                // 基本週期由仍存在的諧音決定；零振幅時不標週期。
                const order = LABS.timbre.fundamentalOrder(p);
                const px0 = x0 + 10;
                if (order) {
                    const combinedPeriod = period / order;
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(px0, mid + 62); ctx.lineTo(px0 + combinedPeriod, mid + 62);
                    ctx.moveTo(px0, mid + 57); ctx.lineTo(px0, mid + 67);
                    ctx.moveTo(px0 + combinedPeriod, mid + 57); ctx.lineTo(px0 + combinedPeriod, mid + 67);
                    ctx.stroke();
                    labelFit(ctx, order === 1 ? '合成基本週期 T₁' : `合成基本週期 T₁/${order}`,
                        px0 + combinedPeriod / 2, mid + 56, C.rose, 11, 'center',
                        { maxW: w - 32, clampW: w });
                } else {
                    labelFit(ctx, '全部振幅為 0：沒有振動，基本週期未定義',
                        w / 2, mid + 56, C.muted, 11, 'center',
                        { maxW: w - 32, clampW: w });
                }
            }
        };

