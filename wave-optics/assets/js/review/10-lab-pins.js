// 互動實驗：插針法測折射率
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 9b. 插針法：圓周法測折射率（配合課堂實驗：壓克力方塊 4 支針、半圓形水槽 3 支針） ---- */
        LABS.pins = {
            name: '插針法：用圓周法測折射率',
            tag: 'N13',
            wide: true,
            hint: '',
            hintFor: (p) => p.mode === 'semi'
                ? '俯視方格紙（每格 1 cm）。P₁ 插在平面邊中點 O，拖曳 P₂ 沿水槽外側移動。從平面邊這側（空氣）看過去，P₃ 要擋住 P₁ 和 P₂ 的像。光沿半徑穿過圓弧面不偏折，所以只在 O 折射一次。'
                : '俯視方格紙（每格 1 cm）。拖曳 P₁ 或 P₂ 改變入射方向；從方塊另一側看過去，P₃、P₄ 要擋住 P₁、P₂ 的像。拿開方塊後連 OO′，就是光在方塊內的路徑。',
            noteFor: (p) => p.mode === 'semi'
                ? '<b>圓周法</b>：以 O 為圓心、半徑 R 畫圓，交空氣中的光於 A、水中的光於 B；A、B 到法線的距離是 x₁、x₂。兩個直角三角形斜邊都是 R，所以 n = x₁ / x₂。<br>P₂ 偏離法線太多時，水中的角度超過臨界角，光在 O 全反射，從空氣這側看不到 P₂，P₃ 插不下去。'
                : '<b>圓周法</b>：以入射點 O 為圓心、半徑 R 畫圓，交入射光於 A、折射光於 B；A、B 到法線的距離是 x₁、x₂。R 取多大都一樣（相似形），n = x₁ / x₂。<br>方塊上下兩面平行，出射光 P₃P₄ 平行入射光 P₁P₂，只往旁邊平移；入射角愈大、方塊愈厚，平移愈多。',
            modes: [
                { key: 'block', label: '壓克力方塊（4 支大頭針）' },
                { key: 'semi', label: '半圓形水槽（3 支大頭針）' }
            ],
            height: (p, cw) => cw < 640 ? 440 : 500,
            controls: [
                { key: 'nb', label: '壓克力折射率 n', min: 1.30, max: 1.80, step: 0.01, value: 1.49, only: ['block'], showIf: (p) => !p.hideN, fmt: (v) => Number(v).toFixed(2) },
                { key: 'nw', label: '液體折射率 n', min: 1.20, max: 1.60, step: 0.01, value: 1.33, only: ['semi'], showIf: (p) => !p.hideN, fmt: (v) => Number(v).toFixed(2) },
                { key: 'th', label: '入射角（也可拖曳 P₁、P₂）', min: 0, max: 75, step: 1, value: 40, only: ['block'], fmt: (v) => `${v}°` },
                { key: 'ph', label: 'P₂ 偏離法線的角度（也可拖曳 P₂）', min: 0, max: 70, step: 1, value: 30, only: ['semi'], fmt: (v) => `${v}°` },
                { key: 'T', label: '方塊厚度', min: 3, max: 7, step: 0.5, value: 5, only: ['block'], fmt: (v) => `${v} cm` },
                { key: 'R', label: '圓周法半徑 R', min: 2, max: 6, step: 0.5, value: 4, fmt: (v) => `${v} cm` },
                { key: 'path', label: '顯示方塊內的光路 OO′', type: 'checkbox', value: true, only: ['block'] },
                { key: 'circle', label: '顯示圓周法作圖（x₁、x₂）', type: 'checkbox', value: true },
                { key: 'hideN', label: '練習：隱藏 n，自己數方格算', type: 'checkbox', value: false }
            ],
            /* 世界座標用 cm：x 向右、y 向下；方格每格 1 cm */
            geom: (p, w, h) => {
                const box = p.mode === 'semi' ? { x0: -8.5, x1: 8.5, y0: -6.8, y1: 8.6 } : { x0: -8.6, x1: 10, y0: -6, y1: 13.2 };
                const s = Math.min((w - 12) / (box.x1 - box.x0), (h - 12) / (box.y1 - box.y0));
                const ox = w / 2 - s * (box.x0 + box.x1) / 2, oy = h / 2 - s * (box.y0 + box.y1) / 2;
                return { s, ox, oy, X: (x) => ox + s * x, Y: (y) => oy + s * y };
            },
            solve: (p) => {
                if (p.mode === 'semi') {
                    const n = p.nw, Rt = 6.5, ph = rad(p.ph), O = [0, 0];
                    const sin1 = n * Math.sin(ph), tir = sin1 >= 1;
                    const t1 = tir ? null : Math.asin(sin1);
                    const P1 = O, P2 = [-7.5 * Math.sin(ph), 7.5 * Math.cos(ph)];
                    const P3 = tir ? null : [5 * Math.sin(t1), -5 * Math.cos(t1)];
                    return { n, Rt, ph, t1, tir, O, P1, P2, P3, thc: Math.asin(Math.min(1, 1 / n)) };
                }
                const n = p.nb, T = p.T, t1 = rad(p.th), t2 = Math.asin(Math.sin(t1) / n);
                const ux = Math.sin(t1), uy = Math.cos(t1);
                const O = [-3, 0], O2 = [-3 + T * Math.tan(t2), T];
                const at = (q, d) => [q[0] + d * ux, q[1] + d * uy];
                return {
                    n, T, t1, t2, ux, uy, O, O2,
                    P1: at(O, -5), P2: at(O, -2), P3: at(O2, 2), P4: at(O2, 5),
                    shift: T * Math.sin(t1 - t2) / Math.cos(t2)
                };
            },
            readouts: (p) => {
                const S = LABS.pins.solve(p), R = p.R;
                if (p.mode === 'semi') {
                    const base = [{ label: 'P₂ 偏離法線（水中）', value: `${p.ph}°` }];
                    if (S.tir) return base.concat([{ label: '從空氣這側看', value: '看不到 P₂（在 O 全反射）' }, { label: '臨界角', value: p.hideN ? '自己判斷' : `${deg(S.thc).toFixed(1)}°` }]);
                    if (p.hideN) return base.concat([{ label: '練習', value: '數方格量 x₁、x₂，n = x₁ / x₂；取消勾選對答案' }]);
                    const x1 = R * Math.sin(S.t1), x2 = R * Math.sin(S.ph);
                    return base.concat([
                        { label: 'x₁（空氣：A 到法線）', value: `${x1.toFixed(2)} cm` },
                        { label: 'x₂（水：B 到法線）', value: `${x2.toFixed(2)} cm` },
                        { label: 'n = x₁ / x₂', value: x2 > 0.05 ? (x1 / x2).toFixed(2) : 'P₂ 在法線上，量不出來' },
                        { label: '空氣中的光偏離法線', value: `${deg(S.t1).toFixed(1)}°（比水中大）` }
                    ]);
                }
                const base = [{ label: '入射角', value: `${p.th}°` }];
                if (p.hideN) return base.concat([{ label: '練習', value: '數方格量 x₁、x₂，n = x₁ / x₂；取消勾選對答案' }]);
                const x1 = R * Math.sin(S.t1), x2 = R * Math.sin(S.t2);
                return base.concat([
                    { label: 'x₁（空氣：A 到法線）', value: `${x1.toFixed(2)} cm` },
                    { label: 'x₂（壓克力：B 到法線）', value: `${x2.toFixed(2)} cm` },
                    { label: 'n = x₁ / x₂', value: x2 > 0.05 ? (x1 / x2).toFixed(2) : '垂直入射，量不出來' },
                    { label: '出射光 P₃P₄', value: `平行 P₁P₂，側移 ${S.shift.toFixed(2)} cm` }
                ]);
            },
            setup: ({ canvas, params, disposers, syncOutputs, paint, host }) => {
                let drag = false;
                const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
                const pinsOf = () => {
                    const S = LABS.pins.solve(params);
                    return params.mode === 'semi' ? [S.P2] : [S.P1, S.P2];
                };
                const near = (x, y) => {
                    const g = params._pinGeom; if (!g) return false;
                    return pinsOf().some((q) => Math.hypot(g.X(q[0]) - x, g.Y(q[1]) - y) < 22);
                };
                const apply = (x, y) => {
                    const g = params._pinGeom; if (!g) return;
                    const S = LABS.pins.solve(params);
                    const wx = (x - g.ox) / g.s - S.O[0], wy = (y - g.oy) / g.s - S.O[1];
                    if (params.mode === 'semi') {
                        if (wy <= 0.2) return;
                        params.ph = Math.max(0, Math.min(70, Math.round(deg(Math.atan2(-wx, wy)))));
                        const el = host.querySelector('[id$="pins-ph"]'); if (el) el.value = params.ph;
                    } else {
                        if (wy >= -0.2) return;
                        params.th = Math.max(0, Math.min(75, Math.round(deg(Math.atan2(-wx, -wy)))));
                        const el = host.querySelector('[id$="pins-th"]'); if (el) el.value = params.th;
                    }
                    syncOutputs(); paint();
                };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    const [x, y] = pos(e);
                    if (!near(x, y)) return;
                    drag = true;
                    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 不支援時忽略 */ }
                    e.preventDefault(); apply(x, y);
                });
                disposers.addEventListener(canvas, 'pointermove', (e) => {
                    const [x, y] = pos(e);
                    if (drag) { apply(x, y); return; }
                    canvas.style.cursor = near(x, y) ? 'grab' : '';
                });
                const stop = () => { drag = false; };
                disposers.addEventListener(canvas, 'pointerup', stop);
                disposers.addEventListener(canvas, 'pointercancel', stop);
                canvas.style.touchAction = 'none';
            },
            draw: (ctx, w, h, p) => {
                const L = LABS.pins, g = L.geom(p, w, h), S = L.solve(p), { X, Y, s } = g;
                p._pinGeom = g;
                const placed = []; placed.hMax = h;
                const tag = (t, x, y, color, align) => depthLabel(ctx, placed, t, x, y, color, w, align || 'left');
                // 方格紙：每格 1 cm，每 5 格加粗
                ctx.fillStyle = '#fbfdfd'; ctx.fillRect(0, 0, w, h);
                const wx0 = Math.floor(-g.ox / s), wx1 = Math.ceil((w - g.ox) / s), wy0 = Math.floor(-g.oy / s), wy1 = Math.ceil((h - g.oy) / s);
                for (let i = wx0; i <= wx1; i++) {
                    ctx.strokeStyle = i % 5 === 0 ? 'rgba(11,111,146,0.30)' : 'rgba(11,111,146,0.13)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(X(i), 0); ctx.lineTo(X(i), h); ctx.stroke();
                }
                for (let j = wy0; j <= wy1; j++) {
                    ctx.strokeStyle = j % 5 === 0 ? 'rgba(11,111,146,0.30)' : 'rgba(11,111,146,0.13)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(0, Y(j)); ctx.lineTo(w, Y(j)); ctx.stroke();
                }
                const ray = (a, b, color, width, dash) => {
                    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width || 2.2; if (dash) ctx.setLineDash(dash);
                    ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(b[0]), Y(b[1])); ctx.stroke(); ctx.restore();
                };
                const mid = (a, b, color) => {
                    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
                    arrow(ctx, X(mx - 0.3 * (b[0] - a[0]) / d), Y(my - 0.3 * (b[1] - a[1]) / d), X(mx + 0.3 * (b[0] - a[0]) / d), Y(my + 0.3 * (b[1] - a[1]) / d), color, 2.2);
                };
                const pin = (q, name, dx, dy) => {
                    ctx.fillStyle = '#12313a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(X(q[0]), Y(q[1]), 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    tag(name, X(q[0]) + dx, Y(q[1]) + dy, '#12313a', dx < 0 ? 'right' : 'left');
                };
                const normal = (q, y0, y1) => dashed(ctx, X(q[0]), Y(y0), X(q[0]), Y(y1), 'rgba(18,49,58,0.55)');
                const unk = p.hideN ? '?' : null;
                // 圓周法：圓心 q，A、B 兩點，水平量到法線
                const circleMethod = (q, A, B) => {
                    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.4;
                    ctx.beginPath(); ctx.arc(X(q[0]), Y(q[1]), p.R * s, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
                    [[A, 'A', 'x₁', C.orange], [B, 'B', 'x₂', C.green]].forEach(([P, nm, xn, col]) => {
                        if (!P) return;
                        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.moveTo(X(P[0]), Y(P[1])); ctx.lineTo(X(q[0]), Y(P[1])); ctx.stroke(); ctx.restore();
                        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(P[0]), Y(P[1]), 4, 0, Math.PI * 2); ctx.fill();
                        const right = P[0] > q[0];
                        tag(nm, X(P[0]) + (right ? 7 : -7), Y(P[1]) + (P[1] < q[1] ? -6 : 14), col, right ? 'left' : 'right');
                        tag(xn, X((P[0] + q[0]) / 2), Y(P[1]) + (P[1] < q[1] ? -6 : 15), col, 'center');
                    });
                };
                if (p.mode === 'semi') {
                    const { O, Rt } = S;
                    // 界面直線與水槽（半圓在下方）
                    ctx.strokeStyle = '#12313a'; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(X(-8.5), Y(0)); ctx.lineTo(X(8.5), Y(0)); ctx.stroke();
                    ctx.fillStyle = 'rgba(150,215,245,0.45)'; ctx.strokeStyle = '#3fa9d6'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(X(-Rt), Y(0)); ctx.arc(X(0), Y(0), Rt * s, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
                    normal(O, -6.4, 8.2);
                    tag('空氣（眼睛在這側）', X(-8.2), Y(-5.6), '#12313a');
                    tag(`水 n = ${unk || S.n.toFixed(2)}`, X(2.2), Y(5.6), '#12313a');
                    tag('法線', X(0) + 5, Y(-6.0), C.muted);
                    // 光：P₂ → O（沿半徑，不偏折）→ 空氣
                    ray(S.P2, O, C.rose); mid(S.P2, O, C.rose);
                    if (S.tir) {
                        const r = [Rt * Math.sin(S.ph), Rt * Math.cos(S.ph)];
                        ray(O, r, C.rose, 1.6, [6, 4]);
                        tag('在 O 全反射：空氣這側看不到 P₂', X(-8.2), Y(-4.2), C.rose);
                    } else {
                        const far = [8.2 * Math.sin(S.t1), -8.2 * Math.cos(S.t1)];
                        ray(O, far, C.rose); mid(O, S.P3, C.rose);
                        pin(S.P3, 'P₃', 9, 4);
                        if (p.circle) circleMethod(O, [p.R * Math.sin(S.t1), -p.R * Math.cos(S.t1)], [-p.R * Math.sin(S.ph), p.R * Math.cos(S.ph)]);
                    }
                    pin(S.P1, 'P₁（O）', -9, 16);
                    pin(S.P2, 'P₂（拖曳）', -9, 4);
                    return;
                }
                // ---- 壓克力方塊 ----
                const { O, O2, T, ux, uy } = S;
                ctx.fillStyle = 'rgba(150,215,245,0.45)'; ctx.strokeStyle = '#3fa9d6'; ctx.lineWidth = 2;
                ctx.fillRect(X(-7), Y(0), 14 * s, T * s); ctx.strokeRect(X(-7), Y(0), 14 * s, T * s);
                tag(`壓克力 n = ${unk || S.n.toFixed(2)}`, X(6.6), Y(T) - 8, '#12313a', 'right');
                tag('空氣', X(-8.3), Y(-5.2), '#12313a');
                normal(O, -4.6, T + 1.2);
                normal(O2, T - 1.2, T + 4.6);
                tag('O', X(O[0]) - 7, Y(0) - 6, '#12313a', 'right');
                tag('O′', X(O2[0]) + 7, Y(T) + 15, '#12313a');
                const start = [S.P1[0] - 1.2 * ux, S.P1[1] - 1.2 * uy], end = [S.P4[0] + 1.2 * ux, S.P4[1] + 1.2 * uy];
                ray(start, O, C.rose); mid(S.P2, O, C.rose);
                ray(O2, end, C.rose); mid(O2, S.P3, C.rose);
                if (p.path) {
                    ray(O, O2, C.rose); mid(O, O2, C.rose);
                    // 入射光直線延長：看出側移
                    const ext = [O[0] + (T + 3) / uy * ux, T + 3];
                    if (p.th > 0) ray(O, ext, 'rgba(18,49,58,0.45)', 1.2, [4, 4]);
                }
                if (p.circle) circleMethod(O, [O[0] - p.R * ux, -p.R * uy], p.path ? [O[0] + p.R * Math.sin(S.t2), p.R * Math.cos(S.t2)] : null);
                tag('眼睛往這邊看', X(end[0]) - 4, Y(end[1]) + 2, C.muted, 'right');
                pin(S.P1, 'P₁（拖曳）', -9, 4);
                pin(S.P2, 'P₂', -9, 4);
                pin(S.P3, 'P₃', 9, 4);
                pin(S.P4, 'P₄', 9, 4);
            }
        };

