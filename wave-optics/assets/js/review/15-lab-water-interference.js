// 互動實驗：水波干涉探究模擬器
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 5b. 水波干涉探究模擬器 ------------------------------------------- */
        const wiShowRatio = (p) => Number(p.dlabel) === 1 || Number(p.dlabel) === 3;
        const wiShowCm = (p) => Number(p.dlabel) === 2 || Number(p.dlabel) === 3;
        const wiLamCm = (p) => (2 / (Number(p.freq) || 0.08)) * 0.088;
        const wiLocusName = (p,kind) => kind === '節' && Number(p.decay) === 1 ? '反相線' : `${kind}線`;
        function wiGeometry(w,h) {
            const x0=12,x1=Math.max(x0+120,w-12),y0=10,y1=h-48;
            return {x0,x1,y0,y1,cx:(x0+x1)/2,cy:(y0+y1)/2,scale:(x1-x0)/24};
        }
        // Store P in model cm, not display pixels, so resizing keeps its physical location.
        function wiPoint(p,w,h) {
            if (!p.clickP) return null;
            if (!p._pointCm) {
                const prior = wiGeometry(p._geomW || w,p._geomH || h);
                p._pointCm = {x:(p.clickP.x-prior.cx)/prior.scale,y:(p.clickP.y-prior.cy)/prior.scale};
            }
            const g = wiGeometry(w,h);
            return {x:Math.max(g.x0,Math.min(g.x1,g.cx+p._pointCm.x*g.scale)),
                y:p.mode === '1D' ? g.cy : Math.max(g.y0,Math.min(g.y1,g.cy+p._pointCm.y*g.scale))};
        }
        // Use physical model lengths so changing the view or canvas width cannot change attenuation.
        const wiAmplitude = (p,rCm) => Number(p.decay) === 1 ? 1/(1+Math.max(0,rCm)*0.1) : 1;
        const wiFmtLen = (p, cm) => {
            const ratio = cm / wiLamCm(p);
            if (wiShowRatio(p) && wiShowCm(p)) return `${cm.toFixed(2)} cm = ${ratio.toFixed(2)} λ`;
            if (wiShowRatio(p)) return `${ratio.toFixed(2)} λ`;
            return `${cm.toFixed(2)} cm`;
        };
        // Treat only an exact ratio as a degenerate hyperbola; nearby ratios remain curves.
        function wiDegeneracy(p) {
            const ratio = Number(p.d) / wiLamCm(p), outPhase = Number(p.phase) === 1;
            if (Math.abs(ratio - Math.round(ratio)) < 1e-6) return { ratio, kind: outPhase ? '節' : '腹' };
            if (Math.abs(ratio - (Math.round(ratio - 0.5) + 0.5)) < 1e-6) return { ratio, kind: outPhase ? '腹' : '節' };
            return null;
        }
        function wiSpacingMarks(ctx, p, o) {
            if (!wiShowRatio(p) && !wiShowCm(p)) return null;
            const plotW = o.x1 - o.x0, fs = plotW >= 600 ? 20 : 15;
            const tick = fs * 0.45, pad = 10, gap = 6;
            const strokeBoth = (path) => {
                ctx.strokeStyle = o.halo; ctx.lineWidth = 6; path(); ctx.stroke();
                ctx.strokeStyle = o.hi; ctx.lineWidth = 2.6; path(); ctx.stroke();
            };
            const bar = (xa, xb, y) => strokeBoth(() => {
                ctx.beginPath(); ctx.moveTo(xa,y); ctx.lineTo(xb,y);
                for (const x of [xa,xb]) {ctx.moveTo(x,y-tick); ctx.lineTo(x,y+tick);}
            });
            const tag = (text, center, top, size, maxW) => {
                ctx.font = `${size}px Outfit, "Noto Sans TC", sans-serif`;
                const bw = Math.min(ctx.measureText(text).width + 2*pad, maxW), bh = size + 2*gap;
                const left = Math.max(o.x0 + 4, Math.min(center - bw/2, o.x1 - bw - 4));
                ctx.fillStyle = o.plate; ctx.fillRect(left,top,bw,bh);
                ctx.strokeStyle = o.hi; ctx.lineWidth = 1.5; ctx.strokeRect(left,top,bw,bh);
                labelFit(ctx,text,left+bw/2,top+size+gap/2,o.ink,size,'center', {maxW:bw-2*pad,min:12,clampW:o.x1+12});
                return {left,top,width:bw,height:bh};
            };
            ctx.save(); ctx.setLineDash([4,4]);
            strokeBoth(() => {
                ctx.beginPath();
                for (const x of [o.s1x,o.s2x]) {ctx.moveTo(x,o.srcY+8); ctx.lineTo(x,o.lineY);}
            });
            ctx.setLineDash([]); bar(o.s1x,o.s2x,o.lineY);
            tag(`d = ${wiFmtLen(p,o.dCm)}`, (o.s1x+o.s2x)/2, o.lineY+tick+gap, fs, plotW-8);
            const rulerText = wiShowCm(p) ? `λ = ${o.lamCm.toFixed(2)} cm` : 'λ';
            const rulerFs = fs-2;
            ctx.font = `${rulerFs}px Outfit, "Noto Sans TC", sans-serif`;
            const boxW = Math.max(o.lamPx,ctx.measureText(rulerText).width)+2*pad;
            const boxH = rulerFs+2*tick+3*gap, left = o.x1-4-boxW, top = o.barY+tick+gap-boxH;
            ctx.fillStyle = o.plate; ctx.fillRect(left,top,boxW,boxH);
            ctx.strokeStyle = o.hi; ctx.lineWidth = 1.5; ctx.strokeRect(left,top,boxW,boxH);
            const mid = left+boxW/2;
            bar(mid-o.lamPx/2,mid+o.lamPx/2,o.barY);
            labelFit(ctx,rulerText,mid,o.barY-tick-gap,o.ink,rulerFs,'center',{maxW:boxW-2*pad,min:11,clampW:o.x1+12});
            ctx.restore();
            return {left,top,width:boxW,height:boxH};
        }
        LABS.water_interference = {
            name: '水波干涉探究模擬器（成德高中 陳家騏老師提供）',
            cycle: 2.0,
            tag: 'N07',
            hint: '💡 <b>空間幾何與干涉對應教學引導</b>（本模擬由成德高中 陳家騏老師提供）：<br>1. <b>凍結波形：</b>建議先點擊「⏸ 暫停」或拖曳時間軸，讓動態水波圖化為如教科書般靜止的幾何空間圖。<br>2. <b>測量對應：</b>在靜止畫面上點擊任意位置（亮紋或暗紋），即時測量波程差 $\\Delta \\ell$，驗證是否符合整數倍或半整數倍波長，將代數公式錨定在幾何點位上。<br>3. <b>疊加驗證：</b>開啟「顯示雙曲線」，驗證理論雙曲線是否穿過測量確認過的腹點與節點；切換「一維連線」，透視兩波源連線上各點的合成波形與節點靜止不動的現象。',
            note: '本模擬由成德高中 陳家騏老師提供原始探究設計。干涉判讀關鍵：① 同相兩波源：波程差 $\\Delta \\ell = n\\lambda$ 為腹線（亮暗交替振幅 $2A$）；$\\Delta \\ell = (m - \\frac{1}{2})\\lambda$ 為節線（完全抵消靜止不動）。② 反相兩波源：中央線轉為節線，腹線與節線角色互換！③ 兩波源連線上相鄰節點（或相鄰腹點）間距恆為 $\\lambda/2$。',
            height: 560,
            wide: true,            /* 這一格允許撐出正文欄寬，見 #main-content.lab-wide */
            modes: [
                { key: '2D', label: '二維水面俯視' },
                { key: '3D', label: '三維水面起伏' },
                { key: '1D', label: '一維連線波形' }
            ],
            controls: [
                {
                    key: 'd',
                    label: '波源間距 d',
                    min: 1.0,
                    max: 20.0,
                    step: 0.01,
                    value: 8.8,
                    fmt: (v, p) => {
                        if (!wiShowRatio(p) && !wiShowCm(p)) return '（出題中，已隱藏）';
                        const degen = wiShowRatio(p) && wiDegeneracy({...p,d:Number(v)});
                        return `${wiFmtLen(p,Number(v))}${degen ? ` [${wiLocusName(p,degen.kind)}退化]` : ''}`;
                    }
                },
                {
                    key: 'freq',
                    label: '水波頻率',
                    options: [
                        { value: 0.04, label: '低頻（波長較長）' },
                        { value: 0.08, label: '中頻（標準波長）' },
                        { value: 0.16, label: '高頻（波長較短）' }
                    ],
                    value: 0.08,
                    fmt: (v) => Number(v) <= 0.05 ? '低頻 (波長長)' : (Number(v) <= 0.10 ? '中頻 (標準)' : '高頻 (波長短)')
                },
                {
                    key: 'phase',
                    label: '初始相位',
                    options: [
                        { value: 0, label: '同相 (相差 0)' },
                        { value: 1, label: '反相 (相差 π)' }
                    ],
                    value: 0,
                    fmt: (v) => Number(v) === 0 ? '同相 (0)' : '反相 (π)'
                },
                {
                    key: 'yaw',
                    label: '觀察方位角',
                    min: -50, max: 50, step: 1, value: 22,
                    only: ['3D'],
                    fmt: (v) => `${Number(v).toFixed(0)}°（也可直接拖曳畫面）`
                },
                {
                    key: 'lines',
                    label: '雙曲線輔助線',
                    options: [
                        { value: 1, label: '顯示腹線與節線' },
                        { value: 0, label: '隱藏輔助線' }
                    ],
                    value: 1,
                    only: ['2D', '3D'],
                    fmt: (v) => Number(v) === 1 ? '顯示' : '隱藏'
                },
                {
                    key: 'shade',
                    label: '水波亮暗紋',
                    options: [
                        { value: 1, label: '顯示亮暗紋' },
                        { value: 0, label: '隱藏亮暗紋（自己推理）' }
                    ],
                    value: 1,
                    only: ['2D'],
                    fmt: (v) => Number(v) === 1 ? '顯示' : '隱藏'
                },
                {
                    key: 'dlabel',
                    label: '長度顯示單位',
                    options: [
                        { value: 1, label: '以波長 λ 為單位（d = 幾 λ）' },
                        { value: 2, label: '以公分 cm 為單位（模型尺度）' },
                        { value: 3, label: '波長 λ 與公分 cm 都顯示' },
                        { value: 0, label: '都不顯示（出題模式）' }
                    ],
                    value: 1,
                    fmt: (v) => ['不顯示','波長 λ','公分 cm','λ + cm'][Number(v)] || ''
                },
                {
                    key: 'decay',
                    label: '傳播時的振幅',
                    options: [
                        { value: 0, label: '課本模型・到達 P 時等振幅' },
                        { value: 1, label: '衰減示意・隨距離變小' }
                    ],
                    value: 0,
                    fmt: (v) => Number(v) === 0 ? '理想等振幅' : '簡化距離衰減'
                }
            ],
            extraButtons: [
                ...[1,1.5,2,2.5,3,3.5,4].map(mult => ({
                    action: `snap_${String(mult).replace('.','_')}_lambda`,
                    label: `${mult}λ`,
                    onClick: (p, {syncOutputs,paint,host}) => {
                        p.d = Number((mult * wiLamCm(p)).toFixed(2));
                        const input = host.querySelector('[id$="-d"]');
                        if (input) input.value = p.d;
                        syncOutputs(); paint();
                    }
                })),
                {
                    action: 'snap_degen_int',
                    label: '鎖定整數倍間距 d = nλ',
                    onClick: (p, { syncOutputs, paint, host }) => {
                        const f = Number(p.freq) || 0.08;
                        const lam = (2.0 / f) * 0.088;
                        const curRatio = (Number(p.d) || 8.8) / lam;
                        const nTarget = Math.max(1, Math.min(Math.floor(20/lam), Math.round(curRatio)));
                        p.d = Number((nTarget * lam).toFixed(2));
                        const input = host.querySelector('[id$="-d"]');
                        if (input) input.value = p.d;
                        syncOutputs();
                        paint();
                    }
                },
                {
                    action: 'snap_degen_half',
                    label: '鎖定半整數倍間距 d = (m+½)λ',
                    onClick: (p, { syncOutputs, paint, host }) => {
                        const f = Number(p.freq) || 0.08;
                        const lam = (2.0 / f) * 0.088;
                        const curRatio = (Number(p.d) || 8.8) / lam;
                        const mTarget = Math.max(Math.ceil(1/lam-0.5), Math.min(Math.floor(20/lam-0.5), Math.round(curRatio-0.5)));
                        p.d = Number(((mTarget + 0.5) * lam).toFixed(2));
                        const input = host.querySelector('[id$="-d"]');
                        if (input) input.value = p.d;
                        syncOutputs();
                        paint();
                    }
                },
                {
                    action: 'random_quiz',
                    label: '🎲 隨機出題',
                    onClick: (p, {syncOutputs,paint,host}) => {
                        const freqs = [0.04,0.08,0.16], oldRatio = Number(p.d)/wiLamCm(p);
                        p.freq = freqs[Math.floor(Math.random()*freqs.length)];
                        const lam = wiLamCm(p), maxTenths = Math.min(50,Math.floor(20/lam*10));
                        let ratio;
                        do {ratio = (10+Math.floor(Math.random()*(maxTenths-9)))/10;}
                        while (Math.abs(ratio-oldRatio)<0.05);
                        p.d = Number((ratio*lam).toFixed(3)); p.lines=0; p.clickP=null; p._pointCm=null;
                        for (const key of ['d','freq','lines']) {
                            const el = host.querySelector(`[id$="-${key}"]`);
                            if (el) el.value=p[key];
                        }
                        syncOutputs(); paint();
                    }
                },
                {
                    action: 'clear_p',
                    label: '📍 清除測量點',
                    onClick: (p, { syncOutputs, paint }) => {
                        p.clickP = null;
                        p._pointCm = null;
                        syncOutputs();
                        paint();
                    }
                }
            ],
            onReset: (p) => {
                p.clickP = null;
                p._pointCm = null;
            },
            setup: ({ canvas, params, disposers, syncOutputs, paint, getGeom }) => {
                const getCoords = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const g = getGeom();
                    if (!rect.width || !rect.height) return null;
                    const x = (e.clientX - rect.left) * (g.width / rect.width);
                    const y = (e.clientY - rect.top) * (g.height / rect.height);
                    return { x, y };
                };
                let dragging = false;
                let rotating = false;
                let rotFrom = 0, yawFrom = 0;
                const setPoint = (e) => {
                    const pt = getCoords(e);
                    if (!pt) return;
                    params.clickP = pt;
                    const size = getGeom(), g = wiGeometry(size.width,size.height);
                    params._pointCm = {x:(pt.x-g.cx)/g.scale,y:params.mode === '1D' ? 0 : (pt.y-g.cy)/g.scale};
                    syncOutputs();
                    paint();
                };
                /* 三維模式的拖曳是旋轉視角；其他模式維持「放置測量點 P」 */
                const setYaw = (e) => {
                    const pt = getCoords(e);
                    if (!pt) return;
                    const next = Math.max(-50, Math.min(50, yawFrom + (pt.x - rotFrom) * 0.22));
                    params.yaw = Math.round(next);
                    const input = canvas.closest('.lab-shell')?.querySelector('[id$="-yaw"]');
                    if (input) input.value = params.yaw;
                    syncOutputs();
                    paint();
                };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    if (params.mode === '3D') {
                        const pt = getCoords(e);
                        if (!pt) return;
                        rotating = true; rotFrom = pt.x; yawFrom = Number(params.yaw) || 0;
                        return;
                    }
                    dragging = true;
                    setPoint(e);
                });
                disposers.addEventListener(window, 'pointermove', (e) => {
                    if (rotating) setYaw(e);
                    else if (dragging) setPoint(e);
                });
                const stopDrag = () => { dragging = false; rotating = false; };
                disposers.addEventListener(window, 'pointerup', stopDrag);
                disposers.addEventListener(window, 'pointercancel', stopDrag);
                // mountLab updates the canvas geometry first; then refresh the matching physical readout.
                disposers.addEventListener(window,'resize',syncOutputs);
            },
            readouts: (p) => {
                const f = Number(p.freq) || 0.08;
                const lamCm = (2.0 / f) * 0.088;
                const dCm = Number(p.d) || 8.8;
                const dOverLam = dCm / lamCm;
                const isOutPhase = Number(p.phase) === 1;

                const degen = wiDegeneracy(p), showR = wiShowRatio(p), showC = wiShowCm(p);
                const hidden = '出題中：切換長度顯示單位可查看';
                const degenStatus = degen ? `d = ${degen.ratio.toFixed(2)}λ：最外側${wiLocusName(p,degen.kind)}退化為波源外側射線` : '非退化：非零波程差的軌跡為雙曲線';
                const base = [
                    { label: '波長 λ', value: showC ? `${lamCm.toFixed(2)} cm` : showR ? '1 λ' : hidden },
                    { label: '波源間距 d', value: showR || showC ? wiFmtLen(p,dCm) : hidden },
                    { label: '雙曲線退化狀態', value: showR ? degenStatus : showC ? '切換為 λ 單位可核對退化條件' : hidden },
                    { label: '初始相位狀態', value: isOutPhase ? '反相 (Δφ = π，中央線為節線)' : '同相 (Δφ = 0，中央線為腹線)' }
                ];

                if (p.clickP) {
                    const geomW = p._geomW || 720;
                    const geomH = p._geomH || 420;
                    const x0 = 12, x1 = Math.max(x0 + 120, geomW - 12);
                    const TW = x1 - x0;
                    const scale = TW / 24;
                    const cx = (x0+x1)/2, cy = (10+geomH-48)/2;
                    const s1x = cx - (dCm * scale) / 2, s1y = cy;
                    const s2x = cx + (dCm * scale) / 2, s2y = cy;

                    const point = wiPoint(p,geomW,geomH);
                    const r1Px = Math.hypot(point.x-s1x,point.y-s1y);
                    const r2Px = Math.hypot(point.x-s2x,point.y-s2y);
                    const r1Cm = r1Px / scale;
                    const r2Cm = r2Px / scale;
                    const diffCm = Math.abs(r1Cm - r2Cm);
                    const diffLam = diffCm / lamCm;

                    const lamPx = lamCm * scale;
                    const k = (2 * Math.PI) / lamPx;
                    const phase1 = 0;
                    const phase2 = isOutPhase ? Math.PI : 0;
                    let phaseDiffTotal = Math.abs((k * r1Px + phase1) - (k * r2Px + phase2)) % (2 * Math.PI);
                    if (phaseDiffTotal > Math.PI) phaseDiffTotal = 2 * Math.PI - phaseDiffTotal;

                    let verdict = '介於腹線與節線之間';
                    if (phaseDiffTotal < 1e-6) verdict = '腹線位置：兩波同相到達';
                    else if (Math.PI-phaseDiffTotal < 1e-6) verdict = Number(p.decay) === 1 ? '反相位置：振幅不等時仍有殘留' : '節線位置：反相且等振幅，始終靜止';
                    else if (phaseDiffTotal < 0.35) verdict = '接近腹線：尚未精確同相';
                    else if (Math.PI-phaseDiffTotal < 0.35) verdict = '接近節線：仍可能振動';

                    return [
                        ...base,
                        { label: '測量點 P', value: `PS₁ = ${wiFmtLen(p,r1Cm)}，PS₂ = ${wiFmtLen(p,r2Cm)}` },
                        { label: '波程差 Δℓ = |PS₁ − PS₂|', value: wiFmtLen(p,diffCm) },
                        { label: '干涉判定', value: Number(p.dlabel) === 0 ? '出題中：先自行判斷，再切換顯示核對' : verdict }
                    ];
                }

                return [
                    ...base,
                    { label: '點擊水面測量', value: '請在畫布上點擊任意位置放置測量點 P' }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const point = wiPoint(p,w,h);
                p._geomW = w; p._geomH = h;
                const x0 = 12, x1 = Math.max(x0+120,w-12), y0 = 10, y1 = h-48;
                const TW = x1 - x0, TH = y1 - y0;
                const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
                const scale = TW / 24;
                const dCm = Math.max(Number(p.d) || 8.8, 1.0);
                const dPx = dCm * scale;
                const s1 = { x: cx - dPx / 2, y: cy };
                const s2 = { x: cx + dPx / 2, y: cy };
                const f = Number(p.freq) || 0.08;
                const lamCm = (2.0 / f) * 0.088;
                const lamPx = Math.max(lamCm * scale, 6);
                const k = (2 * Math.PI) / lamPx;
                const om = 3.2;
                const isOutPhase = Number(p.phase) === 1;
                const phase1 = 0;
                const phase2 = isOutPhase ? Math.PI : 0;
                const phaseDiff_L = (phase2 - phase1) / k;
                const waveAt = (r1,r2) => wiAmplitude(p,r1/scale)*Math.cos(k*r1-om*t+phase1) + wiAmplitude(p,r2/scale)*Math.cos(k*r2-om*t+phase2);
                const envelopeAt = (r1,r2) => {
                    const a1 = wiAmplitude(p,r1/scale), a2 = wiAmplitude(p,r2/scale);
                    return Math.sqrt(Math.max(0,a1*a1+a2*a2+2*a1*a2*Math.cos(k*(r1-r2)+phase1-phase2)));
                };

                /* ============ 二維水面俯視 ============ */
                if (p.mode === '2D' || !p.mode) {
                    /* 逐像素算干涉場的成本與畫布面積成正比。畫布加大之後固定 step = 4
                     * 會讓每幀掉到 20 ms（超過 60fps 的 16.7 ms 預算），
                     * 所以改成依面積調整區塊大小，讓運算量維持在固定水準。
                     * 這是連續變化的場，step 5~6 在視覺上看不出差別。 */
                    const step = Math.max(4, Math.min(8, Math.round(Math.sqrt(TW * TH / 16000))));
                    const iw = Math.ceil(TW / step) * step, ih = Math.ceil(TH / step) * step;
                    const shadeOn = Number(p.shade) !== 0;
                    if (!shadeOn) {ctx.fillStyle = 'rgb(73,156,163)'; ctx.fillRect(x0,y0,TW,TH);}
                    const img = shadeOn ? ctx.createImageData(iw,ih) : null;
                    if (shadeOn) for (let yy = 0; yy < ih; yy += step) {
                        for (let xx = 0; xx < iw; xx += step) {
                            const gx = x0 + xx, gy = y0 + yy;
                            const r1 = Math.hypot(gx - s1.x, gy - s1.y);
                            const r2 = Math.hypot(gx - s2.x, gy - s2.y);
                            const a1 = wiAmplitude(p,r1/scale), a2 = wiAmplitude(p,r2/scale);
                            const z = a1 * Math.cos(k * r1 - om * t + phase1) + a2 * Math.cos(k * r2 - om * t + phase2);
                            const base = 118;
                            const intensity = z * 58;
                            const r = Math.max(0, Math.min(255, Math.round(base - 45 + intensity * 0.45)));
                            const g = Math.max(0, Math.min(255, Math.round(base + 38 + intensity * 0.95)));
                            const b = Math.max(0, Math.min(255, Math.round(base + 75 + intensity * 1.05)));
                            for (let dy = 0; dy < step; dy++) {
                                const row = (yy + dy) * iw;
                                for (let dx = 0; dx < step; dx++) {
                                    const idx = (row + xx + dx) * 4;
                                    img.data[idx] = r;
                                    img.data[idx + 1] = g;
                                    img.data[idx + 2] = b;
                                    img.data[idx + 3] = 255;
                                }
                            }
                        }
                    }
                    if (shadeOn) {
                        const off = getOffscreen(iw,ih);
                        off.ctx.putImageData(img,0,0);
                        ctx.drawImage(off.canvas,0,0,iw,ih,x0,y0,TW,TH);
                    }

                    ctx.strokeStyle = 'rgba(18,49,58,0.22)'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(x0, y0, TW, TH);

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x0, y0, TW, TH);
                    ctx.clip();

                    // 繪製雙曲線（含中垂線與外側射線退化判定）
                    if (Number(p.lines) === 1) {
                        const drawSingleHyperbola = (deltaL, color, dash) => {
                            const a = Math.abs(deltaL) / 2;
                            const c = dPx / 2;
                            const sign = deltaL >= 0 ? 1 : -1;

                            // 1. 中垂線退化
                            if (a < 1e-6) {
                                ctx.save();
                                ctx.strokeStyle = color;
                                ctx.lineWidth = 2.0;
                                if (dash) ctx.setLineDash(dash);
                                ctx.beginPath();
                                ctx.moveTo(cx, y0);
                                ctx.lineTo(cx, y1);
                                ctx.stroke();
                                ctx.restore();
                                return;
                            }

                            // 2. Only |Δℓ| = d produces an outer ray; larger differences have no locus.
                            if (a >= c - 1e-6) {
                                if (Math.abs(a-c) < 1e-6) {
                                    ctx.save();
                                    ctx.strokeStyle = color;
                                    ctx.lineWidth = 2.8;
                                    if (dash) ctx.setLineDash(dash);
                                    ctx.beginPath();
                                    if (sign > 0) {
                                        ctx.moveTo(s2.x, cy);
                                        ctx.lineTo(x1, cy);
                                    } else {
                                        ctx.moveTo(s1.x, cy);
                                        ctx.lineTo(x0, cy);
                                    }
                                    ctx.stroke();
                                    ctx.restore();
                                }
                                return;
                            }

                            // 3. 一般雙曲線
                            const b2 = c * c - a * a;
                            if (b2 <= 0) return;
                            const b = Math.sqrt(b2);
                            ctx.save();
                            ctx.strokeStyle = color;
                            ctx.lineWidth = 1.5;
                            if (dash) ctx.setLineDash(dash);
                            ctx.beginPath();
                            let started = false;
                            for (let yy = -TH; yy <= TH; yy += 3) {
                                const xOff = sign * a * Math.sqrt(1 + (yy * yy) / b2);
                                const plotX = cx + xOff;
                                const plotY = cy + yy;
                                if (plotX < x0 - 30 || plotX > x1 + 30) {
                                    started = false;
                                    continue;
                                }
                                if (!started) {
                                    ctx.moveTo(plotX, plotY);
                                    started = true;
                                } else {
                                    ctx.lineTo(plotX, plotY);
                                }
                            }
                            ctx.stroke();
                            ctx.restore();
                        };

                        const maxN = Math.floor((dPx + Math.abs(phaseDiff_L)) / lamPx) + 1;
                        // 腹線（亮紋雙曲線）
                        for (let n = -maxN; n <= maxN; n++) {
                            const dl = n * lamPx - phaseDiff_L;
                            if (Math.abs(dl) <= dPx + 1e-6) {
                                drawSingleHyperbola(dl, '#7bf0c2', [6, 4]);
                            }
                        }
                        // 節線（暗紋雙曲線）
                        for (let m = -maxN; m <= maxN; m++) {
                            const dl = (m + 0.5) * lamPx - phaseDiff_L;
                            if (Math.abs(dl) <= dPx + 1e-6) {
                                drawSingleHyperbola(dl, '#ffb3c6', [3, 4]);
                            }
                        }
                    }

                    // 波源標註
                    [s1, s2].forEach((s, idx) => {
                        ctx.fillStyle = '#f1c40f';
                        ctx.beginPath(); ctx.arc(s.x, s.y, 5.5, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = '#081e26'; ctx.lineWidth = 1.5; ctx.stroke();
                        labelFit(ctx, `S${idx+1}`, s.x + (idx ? 8 : -8), s.y-13, '#ffffff', TW>=600 ? 16 : 13, idx ? 'left' : 'right', {plate:'rgba(6,26,34,.8)',clampW:w});
                    });
                    const rulerBox = wiSpacingMarks(ctx,p,{s1x:s1.x,s2x:s2.x,srcY:cy,lineY:cy+34,
                        lamPx,dCm,lamCm,x0,x1,barY:y1-16,ink:'#fff3c4',hi:'#ffd166',halo:'rgba(6,26,34,.85)',plate:'rgba(6,26,34,.9)'});

                    // 測量點 P 標註與即時連線
                    let topPanelBottom = y0+32;
                    if (point) {
                        const px = point.x, py = point.y;
                        const r1 = Math.hypot(px - s1.x, py - s1.y);
                        const r2 = Math.hypot(px - s2.x, py - s2.y);
                        const r1Cm = r1 / scale;
                        const r2Cm = r2 / scale;
                        const dlCm = Math.abs(r1Cm - r2Cm);
                        const dlLam = dlCm / lamCm;

                        ctx.strokeStyle = '#f59e0b';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([4, 4]);
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y); ctx.lineTo(px, py);
                        ctx.moveTo(s2.x, s2.y); ctx.lineTo(px, py);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        ctx.fillStyle = '#ef4444';
                        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
                        labelFit(ctx,'P',px+9,Math.max(y0+18,py-10),'#ffffff',12,'left',{clampW:w,plate:'rgba(6,26,34,.8)'});

                        let phaseDiffTotal = Math.abs((k * r1 + phase1) - (k * r2 + phase2)) % (2 * Math.PI);
                        if (phaseDiffTotal > Math.PI) phaseDiffTotal = 2 * Math.PI - phaseDiffTotal;
                        let verdict = '介於腹線與節線之間';
                        let verdictCol = '#ffffff';
                        if (phaseDiffTotal < 1e-6) {
                            verdict = '腹線：兩波同相到達';
                            verdictCol = '#7bf0c2';
                        } else if (Math.PI-phaseDiffTotal < 1e-6) {
                            const isRealDecay = Number(p.decay) === 1;
                            verdict = isRealDecay ? '反相位置：振幅不等時有殘留' : '節線：反相且等振幅，始終靜止';
                            verdictCol = '#ffb3c6';
                        } else if (phaseDiffTotal < 0.35) verdict = '接近腹線：尚未精確同相';
                        else if (Math.PI-phaseDiffTotal < 0.35) verdict = '接近節線：仍可能振動';
                        if (Number(p.dlabel) === 0) {verdict='判定已隱藏：先自行推理'; verdictCol='#e6f4f7';}

                        const hudReserve = Number(p.lines) === 1 && TW >= 470 ? Math.min(200,TW*.45)+14 : 0;
                        const hudW = Math.min(430,TW-16-hudReserve), hfs = TW>=600 ? 14 : 11, lineH = hfs+7;
                        const pathRows = TW<600 ? [[`PS₁ = ${wiFmtLen(p,r1Cm)}`,'#e6f4f7'],[`PS₂ = ${wiFmtLen(p,r2Cm)}`,'#e6f4f7']]
                            : [[`PS₁ = ${wiFmtLen(p,r1Cm)}，PS₂ = ${wiFmtLen(p,r2Cm)}`,'#e6f4f7']];
                        const rows = [...pathRows,[`波程差 Δℓ = ${wiFmtLen(p,dlCm)}`,'#f59e0b'],[`⇒ ${verdict}`,verdictCol]];
                        const measureCtx = getOffscreen(Math.ceil(hudW),1).ctx;
                        const rowCounts = rows.map(([text,color]) => labelWrap(measureCtx,text,0,hfs,color,hfs,lineH,hudW-16));
                        const hudH = rowCounts.reduce((sum,count)=>sum+count,0)*lineH+8;
                        let rowY = y0+6+lineH;
                        topPanelBottom = y0+6+hudH;
                        ctx.fillStyle = 'rgba(8, 30, 38, 0.88)';
                        ctx.fillRect(x0 + 6, y0 + 6, hudW, hudH);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 1;
                        ctx.strokeRect(x0 + 6, y0 + 6, hudW, hudH);
                        rows.forEach(([text,color],i) => {
                            if (TW<600) labelWrap(ctx,text,x0+12,rowY,color,hfs,lineH,hudW-16);
                            else labelFit(ctx,text,x0+12,rowY,color,hfs,'left',{maxW:hudW-16,min:10});
                            rowY += rowCounts[i]*lineH;
                        });
                    } else {
                        /* 右上角有腹線／節線圖例時，提示框只能用剩下的寬度，
                         * 否則兩塊會疊在一起（窄畫布尤其明顯）。 */
                        const legReserve = (Number(p.lines) === 1 && TW >= 470)
                            ? Math.min(200, TW * 0.45) + 14 : 0;
                        const hintW = Math.min(340, TW - 16 - legReserve);
                        ctx.fillStyle = 'rgba(8, 30, 38, 0.76)';
                        ctx.fillRect(x0 + 6, y0 + 6, hintW, 26);
                        labelFit(ctx, '💡 提示：點水面任一處放置測量點 P', x0 + 12, y0 + 23, '#e6f4f7', 11, 'left', { maxW: hintW - 16 });
                    }
                    ctx.restore();

                    if (Number(p.lines) === 1) {
                        /* 畫布夠寬才並排在右上角；太窄就整塊移到提示框下方 */
                        const legW = Math.min(200, TW * 0.45);
                        const wide = TW >= 470;
                        const lx = wide ? x1 - 6 : x0 + 6 + legW;
                        const ly = wide ? y0+6 : topPanelBottom+8;
                        ctx.fillStyle = 'rgba(8, 30, 38, 0.78)';
                        ctx.fillRect(lx - legW, ly, legW, 40);
                        labelFit(ctx, '- - - 腹線 (建設性/雙曲線)', lx - 6, ly + 16, '#7bf0c2', 10, 'right', { maxW: legW - 12 });
                        labelFit(ctx,`······ ${wiLocusName(p,'節')}（雙曲線）`,lx-6,ly+32,'#ffb3c6',10,'right',{maxW:legW-12});
                    }

                    const degen = wiDegeneracy(p);
                    if (wiShowRatio(p) && degen) {
                        const degenW = rulerBox ? rulerBox.left-x0-20 : TW-12;
                        const text = TW >= 600 ? `d = ${degen.ratio.toFixed(2)}λ：最外側${wiLocusName(p,degen.kind)}退化為波源外側射線` : `最外側${wiLocusName(p,degen.kind)}退化為射線`;
                        labelFit(ctx,text,x0+6,y1-8,degen.kind === '腹' ? '#7bf0c2' : '#ffb3c6',11,'left',{plate:'rgba(8,30,38,.85)',maxW:degenW,min:10});
                    }
                    labelFit(ctx,shadeOn ? '亮暗表示瞬間水面高低；單張亮暗圖不能判定腹節線。' : '亮暗紋已隱藏：先推理，再打開亮暗紋或輔助線核對。',x0+6,y1+30,C.muted,11,'left',{maxW:TW,min:10});
                    return;
                }


                /* ============ 三維水面起伏 ============ */
                if (p.mode === '3D') {
                    /* 近景：只涵蓋俯視的一半範圍，山脊寬一倍才看得出形狀 */
                    const sc3 = TW / 12;
                    const d3 = dCm * sc3;
                    const lam3 = Math.max(lamCm * sc3, 8);
                    const k3 = (2 * Math.PI) / lam3;
                    const isRealDecay = Number(p.decay) === 1;
                    const showGuides = Number(p.lines) === 1;

                    /* 世界座標以水槽中心為原點；波源在 (±d3/2, 0) */
                    const HU = TW / 2, HV = TH / 2;
                    const zAt = (a, b) => {
                        const r1 = Math.hypot(a + d3 / 2, b);
                        const r2 = Math.hypot(a - d3 / 2, b);
                        const A1 = wiAmplitude(p,r1/sc3), A2 = wiAmplitude(p,r2/sc3);
                        return A1 * Math.cos(k3 * r1 - om * t + phase1)
                             + A2 * Math.cos(k3 * r2 - om * t + phase2);
                    };
                    /* 波程差（單位：波長）；用來把節線「染」進水面 */
                    const qAt = (a, b) => (Math.hypot(a + d3 / 2, b)
                                         - Math.hypot(a - d3 / 2, b)) / lam3;

                    /* 方位角：繞鉛直軸旋轉。限制在 ±50°，
                     * 超出這個範圍逐列由遠而近的畫法會出現遮擋錯誤。 */
                    const yaw = Math.max(-50, Math.min(50, Number(p.yaw) || 0)) * Math.PI / 180;
                    const CY = Math.cos(yaw), SY = Math.sin(yaw);
                    const TILT = 0.46;                       // 俯角造成的深度壓縮
                    const halfW = Math.abs(HU * CY) + Math.abs(HV * SY);
                    const halfD = Math.abs(HU * SY) + Math.abs(HV * CY);
                    const SX = (TW * 0.5 - 6) / halfW;
                    const SD = SX * TILT;
                    const ZA = Math.max(14, Math.min(44, (TH - 2 * halfD * SD - 24) / 4.4));
                    const midY = y0 + (TH - 8) / 2 + 6;
                    const projX = (a, b) => cx + (a * CY - b * SY) * SX;
                    const projY = (a, b, z) => midY + (a * SY + b * CY) * SD - z * ZA;

                    /* 先把高度算成陣列，法線才有辦法用鄰點算，也省下重複計算 */
                    const NU = 84, NV = 52;
                    const Z = new Float64Array((NU + 1) * (NV + 1));
                    const Q = new Float64Array((NU + 1) * (NV + 1));
                    const aOf = (i) => -HU + (2 * HU) * i / NU;
                    const bOf = (j) => -HV + (2 * HV) * j / NV;
                    for (let j = 0; j <= NV; j++) {
                        const b = bOf(j);
                        for (let i = 0; i <= NU; i++) {
                            const idx = j * (NU + 1) + i;
                            Z[idx] = zAt(aOf(i), b);
                            Q[idx] = qAt(aOf(i), b);
                        }
                    }

                    /* 逐格上色。由遠而近（b 由小到大）畫，近的自然蓋住遠的。 */
                    const nodeHit = (q) => {
                        const shifted = q-(phase2-phase1)/(2*Math.PI);
                        const r = Math.abs(shifted-Math.round(shifted-0.5)-0.5);
                        return r < 0.085 ? (1 - r / 0.085) : 0;
                    };
                    for (let j = 0; j < NV; j++) {
                        for (let i = 0; i < NU; i++) {
                            const i0 = j * (NU + 1) + i, i1 = i0 + 1;
                            const i2 = i0 + (NU + 1), i3 = i2 + 1;
                            const z0 = Z[i0], z1 = Z[i1], z2 = Z[i2], z3 = Z[i3];
                            const a0 = aOf(i), a1 = aOf(i + 1);
                            const b0 = bOf(j), b1 = bOf(j + 1);

                            /* 斜率決定明暗：面向光源的斜面亮、背光的暗 */
                            const du = (2 * HU) / NU, dv = (2 * HV) / NV;
                            const gx = ((z1 + z3) - (z0 + z2)) / (2 * du) * ZA;
                            const gy = ((z2 + z3) - (z0 + z1)) / (2 * dv) * ZA;
                            const nl = 1 / Math.sqrt(gx * gx + gy * gy + 1);
                            /* 光從左上前方來 */
                            const lum = Math.max(0, Math.min(1,
                                0.30 + 0.86 * nl * (0.55 - gx * 0.42 - gy * 0.30) + 0.30 * nl));

                            const zm = (z0 + z1 + z2 + z3) / 4;
                            const hi = Math.max(0, Math.min(1, (zm + 1.8) / 3.6));   // 0 谷 → 1 峰
                            let R = 18 + 150 * hi, G = 78 + 150 * hi, B = 108 + 138 * hi;
                            R *= lum; G *= lum; B *= lum;

                            /* 節線染色：畫在曲面裡，遮擋關係自動正確 */
                            const nh = showGuides ? nodeHit((Q[i0]+Q[i1]+Q[i2]+Q[i3])/4) : 0;
                            if (nh > 0) {
                                R = R * (1 - nh) + 236 * nh * lum;
                                G = G * (1 - nh) + 132 * nh * lum;
                                B = B * (1 - nh) + 168 * nh * lum;
                            }

                            ctx.fillStyle = `rgb(${R | 0},${G | 0},${B | 0})`;
                            ctx.beginPath();
                            ctx.moveTo(projX(a0, b0), projY(a0, b0, z0));
                            ctx.lineTo(projX(a1, b0), projY(a1, b0, z1));
                            ctx.lineTo(projX(a1, b1), projY(a1, b1, z3));
                            ctx.lineTo(projX(a0, b1), projY(a0, b1, z2));
                            ctx.closePath();
                            ctx.fill();
                        }
                    }

                    /* 波源與浮標：節線上那個永遠不動，是這個模式的重點 */
                    const bF = HV * 0.42;
                    const locusA = (q) => {                    // 雙曲線解析式
                        const aa = Math.abs(q) * lam3 / 2, cF = d3 / 2;
                        if (aa > cF - 1e-6) return null;
                        if (Math.abs(q) < 1e-9) return 0;
                        return Math.sign(q) * aa * Math.sqrt(1 + (bF * bF) / (cF * cF - aa * aa));
                    };
                    const floats = (showGuides ? [0,0.5,1] : []).map(q => {
                        const shifted = q-(phase2-phase1)/(2*Math.PI);
                        const isNode = Math.abs(shifted-Math.round(shifted-0.5)-0.5)<1e-6;
                        return {q,isNode,col:isNode ? '#ff9ec2' : '#8ef5c8',a:locusA(q)};
                    })
                     .filter((o) => o.a !== null && Math.abs(o.a) < HU - 8);

                    floats.forEach((o) => {
                        const z = zAt(o.a, bF);
                        const X = projX(o.a, bF);
                        const Y0 = projY(o.a, bF, 0), Y = projY(o.a, bF, z);
                        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6;
                        ctx.beginPath(); ctx.moveTo(X, Y0); ctx.lineTo(X, Y); ctx.stroke();
                        ctx.fillStyle = o.col;
                        ctx.beginPath(); ctx.arc(X, Y, 6, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = 'rgba(6,26,34,0.95)'; ctx.lineWidth = 1.8; ctx.stroke();
                    });

                    [[-d3 / 2, 'S₁'], [d3 / 2, 'S₂']].forEach(([a, nm]) => {
                        const z = zAt(a, 0);
                        const X = projX(a, 0), Y = projY(a, 0, z);
                        ctx.fillStyle = '#ffd166';
                        ctx.beginPath(); ctx.arc(X, Y, 6, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = 'rgba(6,26,34,0.95)'; ctx.lineWidth = 1.8; ctx.stroke();
                        labelFit(ctx, nm, X + 9, Y - 9, '#ffe8a3', 12, 'left',
                                 { clampW: w, plate: 'rgba(6,26,34,0.72)' });
                    });

                    /* 說明面板 */
                    const nodeF = floats.find((o) => o.isNode);
                    const zNode = nodeF ? zAt(nodeF.a, bF) : 0;
                    const panelW = Math.min(380, TW - 20);
                    const lineH = 19, panelTop = y0+6, firstY = panelTop+lineH;
                    ctx.fillStyle = 'rgba(6, 26, 34, 0.82)';
                    ctx.fillRect(x0+6,panelTop,panelW,3*lineH+10);
                    [[showGuides ? isRealDecay ? '粉紅水道：兩波反相到達的位置' : '粉紅水道：反相且等振幅的節線' : '輔助線已隱藏，可先自行觀察水面','#ff9ec2'],
                     [nodeF ? `粉紅浮標高度 = ${Math.abs(zNode)<0.005 ? '0.00' : zNode.toFixed(2)} A${isRealDecay ? '（可能有殘留）' : '（始終靜止）'}` : '目前沒有可見的粉紅浮標','#ff9ec2'],
                     [`拖曳畫面可旋轉　方位角 ${(yaw * 180 / Math.PI).toFixed(0)}°`, '#cfe9f2']
                    ].forEach(([txt, col], i) => {
                        labelFit(ctx,txt,x0+14,firstY+i*lineH,col,12,'left',{maxW:panelW-20,min:10});
                    });
                    labelFit(ctx,isRealDecay ? '振幅隨距離衰減；兩波振幅不同，反相處仍可能振動。' : '同相波源中央為腹線；反相波源中央為節線。拖曳可旋轉。',
                             x0+6,y1+30,C.muted,11,'left',{maxW:TW-12});
                    return;
                }

                /* ============ 一維連線波形 ============ */
                ctx.fillStyle = 'rgba(11, 111, 146, 0.04)';
                ctx.fillRect(x0, y0, TW, TH);
                ctx.strokeStyle = 'rgba(18, 49, 58, 0.16)'; ctx.lineWidth = 1;
                ctx.strokeRect(x0, y0, TW, TH);

                // 平衡位置基準線
                ctx.strokeStyle = 'rgba(18, 49, 58, 0.28)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();
                labelFit(ctx, '兩波源連線上的平衡位置 (y = 0)', x0 + 8, cy - 8, C.muted, 10, 'left', { maxW: TW * 0.4 });
                label(ctx, 'x →', x1-6, cy-8, C.muted,10,'right');

                // 駐波包絡線 (兩波源之間)
                ctx.save();
                ctx.strokeStyle = 'rgba(107, 70, 193, 0.35)'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
                ctx.beginPath();
                for (let x = s1.x; x <= s2.x; x += 2) {
                    const env = envelopeAt(Math.abs(x-s1.x),Math.abs(x-s2.x))*36;
                    if (x === s1.x) ctx.moveTo(x, cy - env); else ctx.lineTo(x, cy - env);
                }
                for (let x = s2.x; x >= s1.x; x -= 2) {
                    const env = envelopeAt(Math.abs(x-s1.x),Math.abs(x-s2.x))*36;
                    ctx.lineTo(x, cy + env);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                // 合成波曲線
                ctx.strokeStyle = '#0b6f92'; ctx.lineWidth = 2.4;
                ctx.beginPath();
                for (let x = x0; x <= x1; x += 2) {
                    const r1 = Math.abs(x - s1.x);
                    const r2 = Math.abs(x - s2.x);
                    const z = waveAt(r1,r2);
                    const py = cy - z * 36;
                    if (x === x0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
                }
                ctx.stroke();

                // 波源位置
                [s1, s2].forEach((s, idx) => {
                    ctx.fillStyle = '#f1c40f';
                    ctx.beginPath(); ctx.arc(s.x, cy, 6, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#081e26'; ctx.lineWidth = 1.5; ctx.stroke();
                    labelFit(ctx,`S${idx+1}`,s.x+(idx ? 10 : -10),cy+22,C.ink,11,idx ? 'left' : 'right',{clampW:w});
                });

                // 若有測量點 P，標示其連線上的 x 位置與瞬時振盪
                if (point) {
                    const px = point.x;
                    const r1 = Math.abs(px - s1.x);
                    const r2 = Math.abs(px - s2.x);
                    const z = waveAt(r1,r2);
                    const py = cy - z * 36;

                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
                    ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y1); ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
                    labelFit(ctx, `P (z = ${(z).toFixed(2)} A)`, px + 8, py - 8, '#ef4444', 11, 'left', { clampW: w, maxW: 140 });
                }

                wiSpacingMarks(ctx,p,{s1x:s1.x,s2x:s2.x,srcY:cy+30,lineY:y1-100,
                    lamPx,dCm,lamCm,x0,x1,barY:y1-16,ink:'#8c5600',hi:'#d99a19',halo:'rgba(255,255,255,.95)',plate:'rgba(255,255,255,.95)'});
                labelFit(ctx,'一維連線剖面：實線是瞬間位移，虛線是振幅包絡。',x0+6,y1+30,C.muted,11,'left',{maxW:TW,min:10});
            }
        };
