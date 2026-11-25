// 互動實驗：聲波的傳播
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 6. 聲波的傳播 ---------------------------------------------------- */
        LABS.sound = {
            name: '聲波的傳播',
            cycle: 2.4,
            tag: 'N08',
            hint: '深色環代表密部、淺色環代表疏部；相鄰兩個密部相距一個波長。選一個模式，觀察溫度、介質或回聲時間與聲波的關係。',
            note: '本模擬給定空氣、水與鋼的聲速；聲波由空氣進入水或鋼時，波速與波長增加，頻率不變。聲速取決於介質的彈性與密度，不能只用「密度較大」判定聲速較快。',
            height: 400,
            modes: [
                { key: 'medium', label: '介質與溫度' },
                { key: 'refract', label: '折射：空氣 → 水' },
                { key: 'echo', label: '回聲與聲納' }
            ],
            controls: [
                { key: 'temp', label: '氣溫 T (°C)', min: -20, max: 40, step: 1, value: 15, fmt: (v) => `${v} °C`, only: ['medium', 'echo'] },
                { key: 'f', label: '波源頻率 f (Hz)', min: 200, max: 2000, step: 20, value: 500, fmt: (v) => `${v} Hz`, only: ['medium', 'refract'] },
                { key: 'dist', label: '到牆（或海底）的距離 (m)', min: 20, max: 400, step: 5, value: 170, fmt: (v) => `${v} m`, only: ['echo'] }
            ],
            readouts: (p) => {
                const v = 331 + 0.6 * p.temp;
                if (p.mode === 'medium') return [
                    { label: '空氣中聲速 v = 331 + 0.6T', value: `${v.toFixed(1)} m/s` },
                    { label: '波長 λ = v / f', value: `${(v / Math.max(p.f, 1)).toFixed(3)} m` },
                    { label: '本例聲速：鋼 > 水 > 空氣', value: '鋼 5950｜水 1493｜20°C 空氣 343 m/s' },
                    { label: '聲波是', value: '縱波・力學波（真空不能傳聲）' }];
                if (p.mode === 'refract') {
                    const vAir = 343, vWater = 1493;
                    return [
                        { label: '空氣中', value: `v = ${vAir} m/s，λ = ${(vAir / Math.max(p.f, 1)).toFixed(3)} m` },
                        { label: '水中', value: `v = ${vWater} m/s，λ = ${(vWater / Math.max(p.f, 1)).toFixed(3)} m` },
                        { label: '波長變化', value: `變長 ${(vWater / vAir).toFixed(2)} 倍` },
                        { label: '頻率', value: '完全不變（由波源決定）' }];
                }
                const tt = 2 * p.dist / v;
                return [
                    { label: '聲速', value: `${v.toFixed(1)} m/s` },
                    { label: '來回時間 t = 2d / v', value: `${tt.toFixed(3)} s` },
                    { label: '由 t 反推距離', value: 'd = v · t / 2（務必除以 2）' },
                    { label: '人耳能分辨回聲', value: tt >= 0.1 ? `可以（t = ${tt.toFixed(2)} s ≥ 0.1 s）` : `不行（t = ${tt.toFixed(2)} s < 0.1 s）` }];
            },
            draw: (ctx, w, h, p, t) => {
                const x0 = 12, x1 = Math.max(x0 + 120, w - 12), y0 = 8, y1 = h - 34;
                const TW = x1 - x0, TH = y1 - y0;

                /* ---- 共用：畫一組疏密相間的球面波環 ---- */
                const rings = (sx, sy, lamPx, phase, rMax, a0, a1, tint) => {
                    ctx.save();
                    ctx.beginPath(); ctx.rect(x0, y0, TW, TH); ctx.clip();
                    for (let n = 0; n < 40; n++) {
                        const R = phase + n * lamPx / 2;
                        if (R > rMax) break;
                        if (R < 4) continue;
                        const dense = (n % 2 === 0);
                        const fade = Math.max(0.08, 1 - R / rMax);
                        ctx.strokeStyle = dense
                            ? `rgba(${tint[0]},${tint[1]},${tint[2]},${0.72 * fade})`
                            : `rgba(${tint[0]},${tint[1]},${tint[2]},${0.16 * fade})`;
                        ctx.lineWidth = dense ? Math.max(2, lamPx * 0.16) : Math.max(1.5, lamPx * 0.14);
                        ctx.beginPath(); ctx.arc(sx, sy, R, a0, a1); ctx.stroke();
                    }
                    ctx.restore();
                };
                /* ---- 共用：畫一支音叉 ---- */
                const fork = (fx, fy, wob) => {
                    ctx.strokeStyle = '#41606b'; ctx.lineWidth = 3.4;
                    ctx.beginPath();
                    ctx.moveTo(fx - 7 - wob, fy - 26); ctx.lineTo(fx - 7 - wob, fy - 4);
                    ctx.moveTo(fx + 7 + wob, fy - 26); ctx.lineTo(fx + 7 + wob, fy - 4);
                    ctx.moveTo(fx, fy - 4); ctx.lineTo(fx, fy + 16);
                    ctx.stroke();
                };

                /* ============ 介質與溫度 ============ */
                if (p.mode === 'medium') {
                    const v = 331 + 0.6 * p.temp;
                    const lamM = v / Math.max(p.f, 1);                  // 公尺
                    const lamPx = Math.max(10, Math.min(70, lamM * 90));
                    const sx = x0 + TW * 0.20, sy = y0 + TH * 0.48;
                    const phase = ((t * 34) % lamPx);
                    rings(sx, sy, lamPx, phase, TW * 1.05, -Math.PI, Math.PI, [11, 111, 146]);
                    fork(sx, sy, Math.sin(t * 9) * 1.6);
                    labelFit(ctx, '音叉（波源）', sx, sy + 34, C.ink, 11, 'center', { clampW: w, plate: 1 });
                    /* 右上角聲速表的寬度隨畫布縮放，左側說明文字則以「表格左緣」為可用寬度上限 */
                    /* 畫布太窄時，說明文字與聲速表無法並存（兩邊都會被切成碎片）。
                     * 此時不畫表——畫布下方的即時讀數已經列出同一組數字。 */
                    const showPanel = TW >= 430;
                    const panelW = showPanel ? Math.min(200, TW * 0.42) : 0;
                    const panelX = x1 - panelW;
                    const capMax = (showPanel ? panelX - 14 : x1) - (x0 + 8);
                    const capLineH = 18;
                    let capY = y0 + 18;
                    [['深色環＝密部（壓力大）　淺色環＝疏部（壓力小）', C.ink],
                     [`v = 331 + 0.6 × ${p.temp} = ${v.toFixed(1)} m/s`, C.blue],
                     [`λ = v / f = ${lamM.toFixed(3)} m`, C.cyan]
                    ].forEach(([txt, col]) => {
                        capY += labelWrap(ctx, txt, x0 + 8, capY, col, 12, capLineH, capMax) * capLineH;
                    });
                    // 波長尺寸線
                    const ra = phase + 2 * lamPx, rb = ra + lamPx;
                    if (sx + rb < x1 - 10) {
                        const yy = sy + TH * 0.34;
                        ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(sx + ra, yy); ctx.lineTo(sx + rb, yy);
                        ctx.moveTo(sx + ra, yy - 5); ctx.lineTo(sx + ra, yy + 5);
                        ctx.moveTo(sx + rb, yy - 5); ctx.lineTo(sx + rb, yy + 5);
                        ctx.stroke();
                        labelFit(ctx, 'λ（相鄰兩密部）', (sx + ra + sx + rb) / 2, yy - 8, C.cyan, 11, 'center', { clampW: w, plate: 1 });
                    }
                    // 不同介質的聲速比較表
                    if (!showPanel) {
                        labelFit(ctx, '本例：鋼 > 水 > 空氣；介質條件決定聲速',
                                 x0 + 8, y1 + 18, C.muted, 11, 'left', { maxW: TW - 16 });
                        return;
                    }
                    const tx = panelX, ty = y0 + 14;
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.strokeStyle = 'rgba(18,49,58,0.14)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.rect(tx, ty, panelW - 8, 92); ctx.fill(); ctx.stroke();
                    labelFit(ctx, '各介質中的聲速 (m/s)', tx + 10, ty + 18, C.ink, 11, 'left', { maxW: panelW - 28 });
                    [['鋼　固體', '5950'], ['水　液體', '1493'], ['空氣 20°C', '343'], ['空氣 0°C', '331']]
                        .forEach((r, i) => {
                            labelFit(ctx, r[0], tx + 10, ty + 36 + i * 15, C.muted, 10, 'left', { maxW: panelW - 70 });
                            label(ctx, r[1], tx + panelW - 18, ty + 36 + i * 15, C.blue, 10, 'right');
                        });
                    labelFit(ctx, '本例：鋼 > 水 > 空氣；介質條件決定聲速',
                             x0 + 8, y1 + 18, C.muted, 11, 'left', { maxW: TW - 16 });
                    return;
                }

                /* ============ 折射：空氣 → 水 ============ */
                if (p.mode === 'refract') {
                    const vAir = 343, vWater = 1493;
                    const iy = y0 + TH * 0.44;
                    ctx.fillStyle = 'rgba(11,111,146,0.05)'; ctx.fillRect(x0, y0, TW, iy - y0);
                    ctx.fillStyle = 'rgba(6,148,162,0.13)'; ctx.fillRect(x0, iy, TW, y1 - iy);
                    ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x0, iy); ctx.lineTo(x1, iy); ctx.stroke();

                    const lamAirPx = Math.max(12, Math.min(56, (vAir / Math.max(p.f, 1)) * 80));
                    const lamWaterPx = lamAirPx * (vWater / vAir);
                    const ph = ((t * 40) % lamAirPx);
                    // 空氣中的平面波前（由上往下）
                    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, TW, iy - y0); ctx.clip();
                    ctx.strokeStyle = 'rgba(11,111,146,0.7)'; ctx.lineWidth = 2.4;
                    for (let n = 0; n < 30; n++) {
                        const Y = iy - lamAirPx + ph - n * lamAirPx;   // 往下走向界面
                        if (Y < y0 - 2) break;
                        ctx.beginPath(); ctx.moveTo(x0 + 6, Y); ctx.lineTo(x1 - 6, Y); ctx.stroke();
                    }
                    ctx.restore();
                    // 水中的平面波前（間距變大）
                    ctx.save(); ctx.beginPath(); ctx.rect(x0, iy, TW, y1 - iy); ctx.clip();
                    ctx.strokeStyle = 'rgba(6,148,162,0.85)'; ctx.lineWidth = 2.4;
                    for (let n = 0; n < 30; n++) {
                        const Y = iy + ph * (vWater / vAir) + n * lamWaterPx;   // 往下離開界面
                        if (Y > y1 + 2) break;
                        if (Y < iy - 1) continue;
                        ctx.beginPath(); ctx.moveTo(x0 + 6, Y); ctx.lineTo(x1 - 6, Y); ctx.stroke();
                    }
                    ctx.restore();

                    const cxm = (x0 + x1) / 2;
                    arrow(ctx, cxm, y0 + 16, cxm, iy - 8, C.blue, 2.2);
                    arrow(ctx, cxm, iy + 8, cxm, y1 - 16, C.cyan, 2.2);
                    label(ctx, `空氣：v = ${vAir} m/s，λ = ${(vAir / Math.max(p.f, 1)).toFixed(3)} m`, x0 + 10, y0 + 20, C.blue, 12);
                    label(ctx, `水：v = ${vWater} m/s，λ = ${(vWater / Math.max(p.f, 1)).toFixed(3)} m（波長變長）`, x0 + 10, iy + 22, C.cyan, 12);
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.strokeStyle = 'rgba(194,38,74,0.3)'; ctx.lineWidth = 1;
                    const bx = x1 - 268, byy = iy - 46;
                    ctx.beginPath(); ctx.rect(bx, byy, 258, 40); ctx.fill(); ctx.stroke();
                    labelFit(ctx, '聲波由空氣進入水或鋼：變快、變長', bx + 10, byy + 17, C.rose, 12,
                             'left', { clampW: w, maxW: w - 20 });
                    labelFit(ctx, '光由空氣進入玻璃：變慢、變短', bx + 10, byy + 33,
                             C.rose, 11, 'left', { clampW: w, maxW: w - 20 });
                    label(ctx, '頻率由波源決定，穿越界面時完全不變', x0 + 8, y1 + 18, C.muted, 11);
                    return;
                }

                /* ============ 回聲與聲納 ============ */
                const v = 331 + 0.6 * p.temp;
                const D = p.dist;
                const sx = x0 + 54, sy = y0 + TH * 0.42;
                const wallX = x1 - 40;
                const travelPx = wallX - sx;
                const period = Math.max(1.2, (2 * D / v) * 1.6 + 0.9);   // 動畫一輪的秒數
                const u = (t % period) / period;                          // 0→1
                const goPhase = Math.min(1, u * 2);                       // 前半段去程
                const backPhase = Math.max(0, u * 2 - 1);                 // 後半段回程

                ctx.fillStyle = 'rgba(11,111,146,0.05)'; ctx.fillRect(x0, y0, TW, TH);
                ctx.fillStyle = '#41606b'; ctx.fillRect(wallX, y0 + 10, 14, TH - 20);
                label(ctx, '牆 / 海底', wallX + 7, y0 + TH - 2, C.muted, 10, 'center');

                ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, TW, TH); ctx.clip();
                if (backPhase <= 0) {
                    for (let n = 0; n < 4; n++) {
                        const R = goPhase * travelPx - n * 16;
                        if (R < 2) continue;
                        ctx.strokeStyle = `rgba(11,111,146,${0.7 - n * 0.15})`; ctx.lineWidth = 2.4;
                        ctx.beginPath(); ctx.arc(sx, sy, R, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke();
                    }
                } else {
                    for (let n = 0; n < 4; n++) {
                        const R = backPhase * travelPx - n * 16;
                        if (R < 2) continue;
                        ctx.strokeStyle = `rgba(107,70,193,${0.7 - n * 0.15})`; ctx.lineWidth = 2.4;
                        ctx.beginPath(); ctx.arc(wallX, sy, R, Math.PI - Math.PI / 2.2, Math.PI + Math.PI / 2.2); ctx.stroke();
                    }
                }
                ctx.restore();
                fork(sx, sy, Math.sin(t * 9) * 1.6);
                label(ctx, '波源／偵測器', sx, sy + 34, C.ink, 11, 'center');
                label(ctx, backPhase <= 0 ? '① 去程：聲波往牆前進' : '② 回程：反射波回到偵測器', x0 + 10, y0 + 20,
                    backPhase <= 0 ? C.blue : C.violet, 12);

                // 距離標示與公式
                const yy = y1 - 26;
                ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sx, yy); ctx.lineTo(wallX, yy);
                ctx.moveTo(sx, yy - 5); ctx.lineTo(sx, yy + 5);
                ctx.moveTo(wallX, yy - 5); ctx.lineTo(wallX, yy + 5);
                ctx.stroke();
                label(ctx, `d = ${D} m`, (sx + wallX) / 2, yy - 8, C.muted, 11, 'center');
                const tt = 2 * D / v;
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.strokeStyle = 'rgba(18,49,58,0.14)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.rect(x0 + 8, y1 - 96, 250, 62); ctx.fill(); ctx.stroke();
                label(ctx, `聲波走的總路程 = 2d = ${2 * D} m`, x0 + 16, y1 - 78, C.ink, 11);
                label(ctx, `來回時間 t = 2d / v = ${tt.toFixed(3)} s`, x0 + 16, y1 - 62, C.blue, 11);
                label(ctx, `⇒ 由 t 求距離時 d = v·t / 2`, x0 + 16, y1 - 46, C.rose, 11);
                label(ctx, tt >= 0.1 ? '來回超過 0.1 s，人耳可分辨出回聲' : '來回不到 0.1 s，人耳分不出回聲（與原聲混在一起）',
                    x0 + 8, y1 + 18, tt >= 0.1 ? C.green : C.rose, 11);
            }
        };
